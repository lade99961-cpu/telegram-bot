@echo off
color 0A
title Discord Bot Manager
cls
echo ==============================================
echo       Starting Discord Bot Manager...
echo ==============================================
echo.
if not exist node_modules (
    echo [!] Packages not found. Running 'npm install'...
    call npm install
    echo.
)
echo [*] Launching index.js...
echo.
node index.js
if %errorlevel% neq 0 (
    echo.
    echo [X] The bot crashed or stopped with an error.
)
echo.
pause
