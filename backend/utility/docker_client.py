#!/usr/bin/env python
# -*- coding:utf-8 -*-

import threading
from socket import timeout

from six import PY3
import docker
import chardet

from backend.utility.log import my_logger


class DockerClient(object):

    cmd = [
        "/bin/sh",
        "-c",
        'TERM=xterm-256color; export TERM; [ -x /bin/bash ] && '
        '([ -x /usr/bin/script ] && '
        '/usr/bin/script -q -c "/bin/bash" /dev/null || '
        'exec /bin/bash) || exec /bin/sh',
    ]

    def __init__(self, base_url=None, version=None, **kwargs):
        self.api = docker.APIClient(
            base_url=base_url, version=version, **kwargs)
        self.client = docker.DockerClient(
            base_url=base_url, version=version, **kwargs)
        # self.client2 = docker.from_env()
        self.exec_id = None

    def create_terminal(self, container_id):
        resp = self.api.exec_create(
            container=container_id,
            cmd=self.cmd,
            stdout=True,
            stderr=True,
            stdin=True,
            tty=True,
        )
        self.exec_id = resp['Id']
        return self.exec_id

    def start_terminal(self):
        exec_output = self.api.exec_start(
            exec_id=self.exec_id,
            tty=True,
            stream=True,
            socket=True,
            demux=True,
        )
        if PY3:
            return exec_output._sock
        else:
            return exec_output

    def resize_terminal(self, height, width):
        self.api.exec_resize(
            exec_id=self.exec_id, height=height, width=width)

    def container_list(self, **kwargs):
        return self.client.containers.list(**kwargs)

    def close(self):
        self.api.close()

    def __del__(self):
        try:
            self.close()
        except:
            pass


class DockerStreamThread(threading.Thread):
    def __init__(self, ws, stream):
        super(DockerStreamThread, self).__init__()
        self.ws = ws
        self.stream = stream

    def run(self):
        while not self.ws.closed:
            if getattr(self.stream, '_closed', False):
                self.ws.close()

            try:
                stdout = self.stream.recv(2048)
                if stdout is not None:
                    if PY3:
                        encoding = chardet.detect(stdout).get('encoding')
                        self.ws.send(str(stdout, encoding=encoding or "utf-8"))
                    else:
                        self.ws.send(str(stdout))
                else:
                    my_logger("docker daemon socket is close")
                    self.stream.close()
                    self.ws.close()
            except timeout:
                my_logger("Receive from docker timeout.")
            except Exception as e:
                my_logger("docker daemon socket err {}".format(e))
                self.stream.close()
                self.ws.close()
