@echo off
setlocal enabledelayedexpansion
title Underground Syndicate - Installer and Launcher

echo ===================================================================
echo   UNDERGROUND SYNDICATE: LAB SIMULATOR
echo   Automated 1-Click Installer and Local Server Launcher
echo ===================================================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is NOT installed on this computer!
    echo.
    echo To run this game locally, please download and install Node.js (LTS):
    echo https://nodejs.org/
    echo.
    echo After installing Node.js, run this file again.
    echo ===================================================================
    pause
    exit /b 1
)

echo [1/3] Node.js detected:
node -v
echo.

echo [2/3] Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    echo ===================================================================
    pause
    exit /b 1
)
echo.

echo [3/3] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    echo ===================================================================
    pause
    exit /b 1
)
echo.

echo ===================================================================
echo   SUCCESS! LAUNCHING GAME AT http://localhost:3000
echo   Opening web browser automatically...
echo ===================================================================
echo.

start http://localhost:3000

call npm run preview

echo.
echo Server stopped.
pause
