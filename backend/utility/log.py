#!/usr/bin/env python
# -*- coding:utf-8 -*-

import logging

from settings import LOG_FILE

my_logger = logging.getLogger('web_terminal')
my_logger.setLevel(logging.DEBUG)

formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')

ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
ch.setFormatter(formatter)
my_logger.addHandler(ch)

if LOG_FILE:
    fh = logging.FileHandler(filename=LOG_FILE)
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(formatter)
    my_logger.addHandler(fh)
