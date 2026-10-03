@echo off
title Underground Syndicate - Dev Launcher
echo ===================================================================
echo   STARTING UNDERGROUND SYNDICATE IN DEV MODE
echo ===================================================================
echo.
start http://localhost:3000
call npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start dev server.
    pause
    exit /b 1
)
pause
