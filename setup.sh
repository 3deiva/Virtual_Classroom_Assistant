#!/bin/bash

pip install --upgrade pip
apt-get update && apt-get install -y build-essential python3-dev libatlas-base-dev gfortran
pip install numpy==1.21.0 --only-binary=:all:
pip install -r requirements.txt
pip install opencv-python-headless==4.5.3.56 --no-binary opencv-python-headless
echo "Setup completed successfully!"
