#!/usr/bin/env python
# -*- coding:utf-8 -*-

import json

from six import PY3
from flask import Flask, render_template, jsonify, make_response
from flask_sockets import Sockets
from kubernetes.stream.ws_client import RESIZE_CHANNEL

from settings import KUBECONFIG, DOCKER_HOST, DOCKER_VERSION
from backend.utility.log import my_logger
from backend.utility.kubernetes_client import KubernetesClient, K8SStreamThread
from backend.utility.docker_client import DockerClient, DockerStreamThread

# static_url_path 跟 frontend.package.json 中 homepage 一致
app = Flask(__name__, static_url_path='/terminal/static')
sockets = Sockets(app)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/api/kubernetes/containers', methods=['GET'])
def kubernetes_container_list():
    k8s_client = KubernetesClient(config_file=KUBECONFIG)
    namespace_response = k8s_client.get_namespaces()
    namespace_dict = {}
    for i in namespace_response.items:
        namespace_dict[i.metadata.name] = {
            'namespace': i.metadata.name,
            'pods': [],
        }
    pod_response = k8s_client.get_pods()
    for j in pod_response.items:
        namespace_dict[j.metadata.namespace]['pods'].append({
            'name': j.metadata.name,
            'containers': [c.name for c in j.spec.containers],
        })
    res = make_response(jsonify(list(namespace_dict.values())))
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Method'] = '*'
    res.headers['Access-Control-Allow-Headers'] = '*'
    return res


@app.route('/api/docker/containers', methods=['GET'])
def docker_container_list():
    docker_client = DockerClient(base_url=DOCKER_HOST, version=DOCKER_VERSION)
    containers = docker_client.container_list()
    res = make_response(jsonify([i.name for i in containers]))
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Method'] = '*'
    res.headers['Access-Control-Allow-Headers'] = '*'
    return res


@app.route('/terminal/kubernetes/<namespace>/<pod>/<container>',
           methods=['GET'])
def kubernetes_terminal(namespace, pod, container):
    return render_template('index.html')


@app.route('/terminal/docker/<container>', methods=['GET'])
def docker_terminal(container):
    return render_template('index.html')


@sockets.route('/ws/kubernetes/<namespace>/<pod>/<container>')
def kubernetes_terminal_socket(ws, namespace, pod, container):
    my_logger.info('Try create kubernetes socket connection')
    k8s_client = KubernetesClient(config_file=KUBECONFIG)
    try:
        container_stream = k8s_client.terminal_start(namespace, pod, container)
    except Exception as err:
        my_logger.error('Connect kubernetes container error: {}'.format(err))
        ws.close()
        return

    k8s_thread = K8SStreamThread(ws, container_stream)
    k8s_thread.start()

    my_logger.info('Start kubernetes terminal')
    try:
        while not ws.closed:
            message = ws.receive()
            if message is not None:
                msg = json.loads(message)
                rows = msg.get('Rows')
                cols = msg.get('Cols')
                # 设置终端大小
                if rows and cols:
                    container_stream.write_channel(
                        RESIZE_CHANNEL,
                        json.dumps({"Height": rows, "Width": cols}),
                    )
                # 输入
                if msg.get('Op') == 'stdin':
                    container_stream.write_stdin(msg.get('Data'))

        # 退出
        container_stream.write_stdin('exit\r')
    except Exception as err:
        my_logger.error('kubernetes web socket stream error: {}'.format(err))
    finally:
        container_stream.close()
        ws.close()


@sockets.route('/ws/docker/<container>')
def docker_terminal_socket(ws, container):
    my_logger.info('Try create docker socket connection')
    docker_client = DockerClient(base_url=DOCKER_HOST, version=DOCKER_VERSION)
    try:
        docker_client.create_terminal(container_id=container)
        container_stream = docker_client.start_terminal()
    except Exception as err:
        my_logger.error('Connect Docker container error: {}'.format(err))
        ws.close()
        return

    docker_thread = DockerStreamThread(ws, container_stream)
    docker_thread.start()

    my_logger.info('Start docker terminal')
    try:
        while not ws.closed:
            message = ws.receive()
            if message is not None:
                msg = json.loads(message)
                rows = msg.get('Rows')
                cols = msg.get('Cols')
                # 设置终端大小
                if rows and cols:
                    docker_client.resize_terminal(height=rows, width=cols)
                # 输入
                if msg.get('Op') == 'stdin':
                    if PY3:
                        data = bytes(msg.get('Data'), 'utf-8')
                    else:
                        data = bytes(msg.get('Data'))
                    container_stream.send(data)

    except Exception as err:
        my_logger.error('Docker web socket stream error: {}'.format(err))
    finally:
        ws.close()
        container_stream.close()
        docker_client.close()
