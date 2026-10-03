#!/usr/bin/env bash
# Underground Syndicate - Automated Installer & Launcher for macOS and Linux

set -e

echo "==================================================================="
echo "  UNDERGROUND SYNDICATE: LAB SIMULATOR"
echo "  Automated 1-Click Installer & Launcher (macOS / Linux)"
echo "==================================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please download and install Node.js (LTS version) from https://nodejs.org/"
    exit 1
fi

echo "[1/3] Node.js detected: $(node -v)"
echo ""

echo "[2/3] Installing npm dependencies..."
npm install
echo ""

echo "[3/3] Building production bundle..."
npm run build
echo ""

echo "==================================================================="
echo "  LAUNCHING UNDERGROUND SYNDICATE AT http://localhost:3000"
echo "==================================================================="

if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    open http://localhost:3000 &
fi

npm run preview
