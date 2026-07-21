@echo off
md "C:\Program Files\Google\Chrome\Application"
mklink "C:\Program Files\Google\Chrome\Application\chrome.exe" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
echo Exit: %ERRORLEVEL%
dir "C:\Program Files\Google\Chrome\Application\"
