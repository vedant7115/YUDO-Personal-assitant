@echo off
REM ==============================================================================
REM YUDO Backend Development Server Launcher (Windows)
REM ALWAYS run development using this script to guarantee live hot-reloading!
REM ==============================================================================
echo Starting YUDO Backend with auto-reload enabled...
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
