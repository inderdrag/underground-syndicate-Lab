@echo off
setlocal
title Underground Syndicate - Create Desktop Shortcut

echo ===================================================================
echo   UNDERGROUND SYNDICATE - 1-CLICK DESKTOP SHORTCUT CREATOR
echo ===================================================================
echo.

set "TARGET_FILE=%~dp0Underground-Syndicate-Game.html"
if not exist "%TARGET_FILE%" (
    set "TARGET_FILE=%~dp0Play-Game-Offline.html"
)

set "SHORTCUT_NAME=Underground Syndicate.url"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"

echo Creating shortcut on your Desktop...
(
    echo [InternetShortcut]
    echo URL=file:///%TARGET_FILE:\=/%
    echo IconIndex=0
    echo IconFile=%~dp0public\icon.png
) > "%DESKTOP_DIR%\%SHORTCUT_NAME%"

echo.
echo ===================================================================
echo   [SUCCESS] Shortcut "Underground Syndicate" created on your Desktop!
echo   You can now launch the game anytime with 1 click from your Desktop.
echo ===================================================================
echo.
pause
