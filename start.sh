#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  QueueBuddy - Bengaluru Startup Script"
echo "========================================================"
echo ""

echo "[1/3] Checking Node.js installation..."
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install Node.js (LTS version) from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js version: $(node -v)"
echo ""

if [ ! -d "node_modules" ]; then
    echo "[2/3] First-time setup: Installing dependencies..."
    npm install
else
    echo "[2/3] Dependencies already installed."
fi

echo ""
echo "[3/3] Starting development server..."
echo "QueueBuddy will be live at: http://localhost:3000"
echo "Press Ctrl + C to stop."
echo ""

npm run dev
