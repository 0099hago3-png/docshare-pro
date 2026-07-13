@echo off
title DocShare Pro - Sua Vite va cai lai thu vien
cd /d "%~dp0"

echo.
echo ==========================================
echo  DOCSHARE PRO - SUA LOI VITE
echo ==========================================
echo.

echo [1/5] Dung cac tien trinh Node dang chay...
taskkill /F /IM node.exe >nul 2>&1

echo [2/5] Xoa node_modules cu...
if exist node_modules rmdir /S /Q node_modules

echo [3/5] Cai lai thu vien theo package.json...
call npm install
if errorlevel 1 goto :error

echo [4/5] Cai bo sung @vitejs/plugin-react...
call npm install -D @vitejs/plugin-react
if errorlevel 1 goto :error

echo [5/5] Kiem tra build...
call npm run build
if errorlevel 1 goto :error

echo.
echo ==========================================
echo  DA SUA XONG - BUILD THANH CONG
echo ==========================================
echo.
echo Bay gio chay:
echo npm run dev
echo.
pause
exit /b 0

:error
echo.
echo ==========================================
echo  CO LOI - XEM DONG MAU DO O PHIA TREN
echo ==========================================
echo.
pause
exit /b 1
