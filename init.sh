#!/bin/bash

cd cmn
echo "cmn: npm install "
npm install
cd ..
echo "-----------"

cd app
echo "app: npm install "
npm install
cd ..
echo "-----------"

cd web
echo "web: npm install "
npm install
cd ..