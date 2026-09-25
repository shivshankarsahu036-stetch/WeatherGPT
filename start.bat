@echo off
title WeatherGPT Platform
echo ===================================================
echo   WeatherGPT: Conversational AI & Decision Support
echo ===================================================
echo.

cd /d "%~dp0\backend"

echo Checking Python dependencies...
python -m pip install -r requirements.txt

echo.
echo Starting WeatherGPT FastAPI Server on http://localhost:8000 ...
start "" "http://localhost:8000"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
