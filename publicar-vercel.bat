@echo off
setlocal
chcp 65001 >nul
title Publicar na Vercel

set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%NODE_DIR%;%PATH%"

cd /d "%~dp0"

echo.
echo === Publicar alteracoes no GitHub (Vercel faz deploy sozinha) ===
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Git nao instalado. Baixe em https://git-scm.com/download/win
  pause
  exit /b 1
)

git status
echo.
set /p CONFIRM=Deseja commitar e enviar agora? (S/N): 
if /i not "%CONFIRM%"=="S" goto fim

git add .
git commit -m "Atualiza app e pagina de status"
git push

echo.
echo Pronto! Aguarde 2-3 min na Vercel e teste:
echo   https://reserva-quadra-tenis.vercel.app/status
echo   https://reserva-quadra-tenis.vercel.app/api/health
echo.

:fim
pause
endlocal
