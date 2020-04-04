#!/bin/bash

set -e
export http_proxy=http://10.20.47.147:3128 https_proxy=http://10.20.47.147:3128
source ~/.nvm/nvm.sh
nvm use lts/erbium

npm install -g yarn

yarn setup
yarn deploy
