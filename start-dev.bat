@echo off
title Escala BMI - Servidor de Desenvolvimento
color 0A
echo.
echo ========================================
echo  ESCALA BMI - SERVIDOR DE DESENVOLVIMENTO
echo ========================================
echo Projeto: C:\Users\ricardo.gomes\CascadeProjects\escalasbmi
echo Node.js: v20.18.0 (Portátil)
echo Vite: 5.4.19
echo Servidor: http://localhost:8080
echo ========================================
echo.

REM Configurar variáveis de ambiente
set NODE_PATH=C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64
set PATH=%PATH%;C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64;C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node_modules\.bin
set PROJECT_ROOT=C:\Users\ricardo.gomes\CascadeProjects\escalasbmi
set VITE_PROJECT_ROOT=C:\Users\ricardo.gomes\CascadeProjects\escalasbmi

REM Iniciar servidor de desenvolvimento
echo Iniciando servidor...
C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node.exe node_modules\vite\bin\vite.js

echo.
echo Servidor encerrado.
pause
