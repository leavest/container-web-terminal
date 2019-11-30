#!/usr/bin/env python
# -*- coding:utf-8 -*-

from gevent import pywsgi
from werkzeug import serving

from geventwebsocket.handler import WebSocketHandler
from settings import HOST, PORT, DEBUG
from backend import app


@serving.run_with_reloader
def run_server():
    app.debug = DEBUG
    server = pywsgi.WSGIServer(
        listener=(HOST, PORT),
        application=app,
        handler_class=WebSocketHandler)
    server.serve_forever()


if __name__ == '__main__':
    run_server()
