@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Chua co node_modules. Hay chay 01_CAI_DAT_SACH.bat truoc.
  pause
  exit /b 1
)
call npm run dev
pause
