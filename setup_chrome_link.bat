@echo off
REM Run as administrator to create Chrome symlink
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as admin
    mkdir "C:\Program Files\Google" 2>nul
    mkdir "C:\Program Files\Google\Chrome" 2>nul
    mkdir "C:\Program Files\Google\Chrome\Application" 2>nul
    mklink "C:\Program Files\Google\Chrome\Application\chrome.exe" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    echo Result: %errorLevel%
    dir "C:\Program Files\Google\Chrome\Application\"
) else (
    echo ERROR: Not running as admin
)
