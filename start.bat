@echo off
title QueueBuddy - Bengaluru
echo ========================================================
echo   QueueBuddy - Bengaluru Startup Script
echo ========================================================
echo.
echo [1/3] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/ (LTS version)
    echo After installing, restart this script.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

if not exist node_modules (
    echo [2/3] First-time setup: Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies already installed.
)

echo.
echo [3/3] Starting development server...
echo.
echo QueueBuddy is opening at: http://localhost:3000
echo Press Ctrl + C to stop the server anytime.
echo.
call npm run dev
pause
