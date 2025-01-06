#!/bin/bash
apt-get update
apt-get install -y \
    build-essential \
    python3-dev \
    libatlas-base-dev \
    gfortran \
    cmake \
    pkg-config \
    libopenblas-dev

pip install --upgrade pip
pip install numpy==1.24.3 --no-binary numpy
pip install opencv-python-headless==4.5.3.56 --no-binary opencv-python-headless
pip install -r requirements.txt
