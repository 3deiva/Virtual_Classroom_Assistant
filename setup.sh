#!/bin/bash

# Update pip to the latest version
pip install --upgrade pip

# Install numpy with the --prefer-binary flag to avoid building from source
pip install numpy --prefer-binary

# Install other dependencies from requirements.txt
pip install -r requirements.txt
