#!/bin/bash

cd app
rm nohup.out.bak
mv nohup.out nohup.out.bak
nohup node app.js &
cd ..

cd web
rm nohup.out.bak
mv nohup.out nohup.out.bak
nohup node server.js &
cd ..