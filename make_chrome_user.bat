@echo off
md "C:\Users\savian\AppData\Local\Google\Chrome\Application"
mklink "C:\Users\savian\AppData\Local\Google\Chrome\Application\chrome.exe" "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
echo Exit: %ERRORLEVEL%
dir "C:\Users\savian\AppData\Local\Google\Chrome\Application\"
