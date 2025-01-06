#!/bin/bash

pip install --upgrade pip setuptools wheel

apt-get update && apt-get install -y build-essential python3-dev libatlas-base-dev gfortran

pip install numpy==1.24.3

pip install -r requirements.txt

pip install opencv-python-headless==4.5.3.56

echo "Setup completed successfully!"
