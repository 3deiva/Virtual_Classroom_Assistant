#!/bin/bash


pip install --upgrade pip setuptools wheel


PIP_NO_BUILD_ISOLATION=0 pip install numpy==1.24.3 --prefer-binary
PIP_NO_BUILD_ISOLATION=0 pip install opencv-python-headless==4.5.3.56 --prefer-binary
pip install -r requirements.txt
