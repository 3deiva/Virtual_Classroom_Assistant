#!/bin/bash

# Update pip to the latest version
pip install --upgrade pip

# Install build-essential and Python development headers
apt-get update && apt-get install -y build-essential python3-dev

# Force numpy to use precompiled binary wheels
pip install numpy --prefer-binary

# Install dependencies from requirements.txt
pip install -r requirements.txt
