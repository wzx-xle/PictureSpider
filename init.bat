@echo off

cd cmn
echo cmn: npm install 
cmd /c npm install
cd ..
echo -----------

cd app
echo app: npm install
cmd /c npm install
cd ..
echo -----------

cd web
echo web: npm install
cmd /c npm install
cd ..