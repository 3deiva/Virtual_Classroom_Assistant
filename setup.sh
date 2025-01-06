#!/bin/bash


export PIP_NO_BUILD_ISOLATION=0
python3 -m pip install --user --prefer-binary numpy==1.24.3
python3 -m pip install --user --prefer-binary opencv-python-headless==4.5.3.56
python3 -m pip install --user -r requirements.txt


command -v apt-get >/dev/null && {
  sudo apt-get update
  sudo apt-get install -y python3-numpy python3-opencv
}
