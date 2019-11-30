#!/usr/bin/env python
# -*- coding:utf-8 -*-

import threading

from kubernetes import client, config, stream

from backend.utility.log import my_logger


class KubernetesClient(object):

    cmd = [
        "/bin/sh",
        "-c",
        'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && '
        '([ -x /usr/bin/script ] && '
        '/usr/bin/script -q -c "/bin/bash" /dev/null || '
        'exec /bin/bash) || exec /bin/sh',
    ]

    def __init__(self, config_file=None):
        """
        config.load_kube_config()

        client example1
        self.core_api = client.CoreV1Api()

        client example2
        c = client.Configuration()
        c.assert_hostname = False
        client.Configuration.set_default(c)
        self.core_api = client.apis.core_v1_api.CoreV1Api()

        :param config_file:
        """
        # 使用 config 文件连接 kubernetes api, 如果想使用其他方式可自行修改
        self.api_client = config.new_client_from_config(config_file=config_file)
        self.core_api = client.CoreV1Api(api_client=self.api_client)

    def terminal_start(self, namespace, pod, container):
        container_stream = stream.stream(
            self.core_api.connect_get_namespaced_pod_exec,
            name=pod,
            namespace=namespace,
            container=container,
            command=self.cmd,
            stderr=True, stdin=True,
            stdout=True, tty=True,
            _preload_content=False
        )

        return container_stream

    def get_namespaces(self):
        return self.core_api.list_namespace()

    def get_pods(self, namespace=None):
        if namespace:
            response = self.core_api.list_namespaced_pod(namespace=namespace)
        else:
            response = self.core_api.list_pod_for_all_namespaces()
        return response


class K8SStreamThread(threading.Thread):

    def __init__(self, ws, container_stream):
        super(K8SStreamThread, self).__init__()
        self.ws = ws
        self.stream = container_stream

    def run(self):
        while not self.ws.closed:

            if not self.stream.is_open():
                my_logger.info('kubernetes stream closed')
                self.ws.close()

            try:
                if self.stream.peek_stdout():
                    stdout = self.stream.read_stdout()
                    # print(stdout)
                    self.ws.send(stdout)

                if self.stream.peek_stderr():
                    stderr = self.stream.read_stderr()
                    self.ws.send(stderr)
            except Exception as err:
                my_logger.error('kubernetes stream err: {}'.format(err))
                self.ws.close()
                self.stream.close()
