# Render Build Script
# This script is executed during the build phase on Render

#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt
