#!/bin/bash

# Update pip to the latest version
pip install --upgrade pip

# Install build-essential to ensure gcc and other tools are present
apt-get update && apt-get install -y build-essential

# Install numpy with the --prefer-binary flag to avoid building from source
pip install numpy --prefer-binary

# Install other dependencies from requirements.txt
pip install -r requirements.txt
