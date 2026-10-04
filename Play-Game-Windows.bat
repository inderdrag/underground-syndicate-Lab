@echo off
title Underground Syndicate - Instant Play
echo ===================================================================
echo   UNDERGROUND SYNDICATE: LAB & BOTANY SIMULATOR
echo   Launching standalone offline game...
echo ===================================================================
echo.
if exist "Underground-Syndicate-Game.html" (
    start "" "Underground-Syndicate-Game.html"
) else if exist "Play-Game-Offline.html" (
    start "" "Play-Game-Offline.html"
) else if exist "Underground-Syndicate-Launcher.html" (
    start "" "Underground-Syndicate-Launcher.html"
) else (
    echo [ERROR] Game file not found. Running quick build...
    call npm run build
    start "" "Play-Game-Offline.html"
)
exit
