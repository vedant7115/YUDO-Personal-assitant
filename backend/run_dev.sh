#!/usr/bin/env bash
# ==============================================================================
# YUDO Backend Development Server Launcher
# ALWAYS run development using this script to guarantee live hot-reloading!
# ==============================================================================
echo "Starting YUDO Backend with auto-reload enabled..."
exec python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
