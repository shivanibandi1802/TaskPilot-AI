@echo off
title TaskPilot AI Server
echo ========================================================
echo   Starting TaskPilot AI on http://localhost:8080
echo ========================================================
start "" "http://localhost:8080"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
