@echo off
set SRC=C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe
set DST=C:\Users\savian\AppData\Local\Google\Chrome\Application\chrome.exe
copy /Y "%SRC%" "%DST%"
echo Exit: %ERRORLEVEL%
dir "C:\Users\savian\AppData\Local\Google\Chrome\Application\"
