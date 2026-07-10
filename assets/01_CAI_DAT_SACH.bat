@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ==============================================
echo     CAI DAT SACH DOCSHARE - FRONTEND/BACKEND
echo ==============================================
echo.

echo [1/4] Xoa node_modules va dist cu...
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
if exist backend\node_modules rmdir /s /q backend\node_modules

echo [2/4] Kiem tra cache npm...
call npm config set registry https://registry.npmjs.org/
call npm cache verify
if errorlevel 1 goto :error

echo [3/4] Cai frontend theo package-lock.json...
call npm ci --registry=https://registry.npmjs.org/
if errorlevel 1 goto :fallback_frontend
goto :backend

:fallback_frontend
echo npm ci khong thanh cong, thu npm install...
call npm install --registry=https://registry.npmjs.org/
if errorlevel 1 goto :error

:backend
echo [4/4] Cai backend...
cd /d "%~dp0backend"
call npm install --registry=https://registry.npmjs.org/
if errorlevel 1 goto :error
cd /d "%~dp0"

echo.
echo ==============================================
echo CAI DAT XONG.
echo Hay bam file 04_CHAY_TAT_CA.bat
echo ==============================================
pause
exit /b 0

:error
echo.
echo CAI DAT THAT BAI. Kiem tra Internet roi chay lai.
pause
exit /b 1
