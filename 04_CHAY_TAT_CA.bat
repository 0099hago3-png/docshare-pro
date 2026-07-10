@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Chua cai thu vien. Hay chay 01_CAI_DAT_SACH.bat truoc.
  pause
  exit /b 1
)
if not exist backend\node_modules (
  echo Chua cai thu vien backend. Hay chay 01_CAI_DAT_SACH.bat truoc.
  pause
  exit /b 1
)
start "DocShare Backend" cmd /k "cd /d %~dp0backend && npm run dev"
start "DocShare Frontend" cmd /k "cd /d %~dp0 && npm run dev"
echo Da mo 2 cua so: Frontend va Backend.
echo Frontend: http://localhost:5173
echo Backend : http://localhost:5000
pause
