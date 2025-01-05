#!/bin/bash

# Update pip to the latest version
pip install --upgrade pip

# Install required system dependencies
apt-get update && apt-get install -y build-essential python3-dev

# Install numpy first to avoid conflicts
pip install numpy --prefer-binary

# Install dependencies from requirements.txt
pip install -r requirements.txt
