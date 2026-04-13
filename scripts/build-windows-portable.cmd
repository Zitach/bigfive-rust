@echo off
setlocal

REM Big Five: Windows portable build wrapper
REM Requires PowerShell.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-windows-portable.ps1"
if errorlevel 1 (
  echo.
  echo Build failed.
  exit /b 1
)

echo.
echo Build completed.
exit /b 0

