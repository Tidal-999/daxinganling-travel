@echo off
cd /d "%~dp0"
echo 正在启动 长沙自驾攻略 App ...
start "" "http://localhost:8080"
node server.js
pause