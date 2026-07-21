@echo off
set BRAVE=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe
set DEST=C:\Users\savian\AppData\Local\Google\Chrome\Application\chrome.exe
echo Deleting old copy...
del /F "%DEST%" 2>nul
echo Launching Brave with remote debugging...
start "" "%BRAVE%" --remote-debugging-port=9222 --user-data-dir=C:\Users\savian\AppData\Local\Temp\brave-debug "http://localhost:5173"
echo Brave launched with remote debugging on port 9222
timeout /t 3
