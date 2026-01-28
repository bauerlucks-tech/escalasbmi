@echo off
echo ========================================
echo Configurando Ambiente do Projeto Escala BMI
echo ========================================
echo.

echo 1. Configurando variáveis de ambiente...
set NODE_PATH=C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64
set PATH=%PATH%;C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64;C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node_modules\.bin
set PROJECT_ROOT=C:\Users\ricardo.gomes\CascadeProjects\escalasbmi
set VITE_PROJECT_ROOT=C:\Users\ricardo.gomes\CascadeProjects\escalasbmi

echo 2. Verificando Node.js...
C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node.exe --version

echo 3. Verificando npm...
C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node_modules\npm\bin\npm-cli.js --version

echo 4. Instalando dependências...
C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node_modules\npm\bin\npm-cli.js install

echo 5. Configurando VS Code...
if exist "C:\Users\ricardo.gomes\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
    echo VS Code encontrado
    start "" "C:\Users\ricardo.gomes\AppData\Local\Programs\Microsoft VS Code\Code.exe" "C:\Users\ricardo.gomes\CascadeProjects\escalasbmi"
) else (
    echo VS Code não encontrado no caminho padrão
)

echo 6. Iniciando servidor de desenvolvimento...
C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node_modules\vite\bin\vite.js

echo.
echo ========================================
echo Configuração concluída!
echo Projeto: C:\Users\ricardo.gomes\CascadeProjects\escalasbmi
echo Servidor: http://localhost:8080
echo ========================================
pause
