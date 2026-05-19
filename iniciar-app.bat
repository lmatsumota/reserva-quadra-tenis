@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
title Reserva Quadra - Tenis

set "NODE_DIR=C:\Program Files\nodejs"
set "PATH=%NODE_DIR%;%PATH%"

cd /d "%~dp0"

echo.
echo ========================================
echo   Reserva Quadra - iniciando...
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 goto no_node

echo Node:
node -v
echo npm:
call npm -v
echo.

if exist "node_modules\" goto skip_install
echo Instalando dependencias - primeira vez...
call npm install
if errorlevel 1 goto erro
:skip_install

if exist "dev.db" goto skip_db
echo Criando banco de dados...
call npx prisma db push
if errorlevel 1 goto erro
echo Populando dados de demonstracao...
call npm run db:seed
if errorlevel 1 goto erro
:skip_db

echo.
echo Abrindo http://localhost:3000
echo Pressione Ctrl+C para parar o servidor.
echo.

start "" "http://localhost:3000"
call npm run dev
goto fim

:no_node
echo.
echo [ERRO] Node.js nao encontrado em C:\Program Files\nodejs
echo Instale em https://nodejs.org e tente de novo.
echo.
pause
exit /b 1

:erro
echo.
echo [ERRO] Algo falhou. Copie a mensagem acima.
echo.
pause
exit /b 1

:fim
pause
endlocal
