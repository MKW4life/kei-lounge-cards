@echo off
setlocal
cd /d "%~dp0"
title MKW Item Counter - Global Hotkeys

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo Windows PowerShell was not found.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0MKW_Item_Counter_Hotkeys.ps1"
set ERR=%ERRORLEVEL%

echo.
echo Hotkey helper stopped. Exit code: %ERR%
pause
exit /b %ERR%
