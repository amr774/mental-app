@echo off
title Mindful Android

set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
set EMULATOR=%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe

echo Killing old processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo Starting Emulator...
start "" "%EMULATOR%" -avd Pixel_8 -no-snapshot-load

echo Starting Backend...
start "Backend" cmd /k "cd /d C:\Users\amr67\OneDrive\Pictures\graduation\backend && node index.js"

echo Starting Emotion AI Server...
start "Emotion AI" cmd /k "cd /d C:\Users\amr67\OneDrive\Pictures && py -m uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Expo...
start "Expo" cmd /k "cd /d C:\Users\amr67\OneDrive\Pictures\graduation\mobile && npx expo start --localhost"

echo Waiting for Emulator and Expo to be ready...
timeout /t 30 /nobreak >nul

echo Opening app on Emulator...
"%ADB%" wait-for-device
"%ADB%" shell am start -n host.exp.exponent/.experience.HomeActivity -d "exp://10.0.2.2:8081"

echo Done!
