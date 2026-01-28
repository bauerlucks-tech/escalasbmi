@echo off
echo Configurando PATH do sistema para o projeto Escala BMI
echo.

REM Adicionar Node.js ao PATH do usuário
setx NODE_PATH "C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64" /M
setx PATH "%PATH%;C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64;C:\Users\ricardo.gomes\nodejs\node-v20.18.0-win-x64\node_modules\.bin" /M

REM Adicionar variáveis do projeto
setx PROJECT_ROOT "C:\Users\ricardo.gomes\CascadeProjects\escalasbmi" /M
setx VITE_PROJECT_ROOT "C:\Users\ricardo.gomes\CascadeProjects\escalasbmi" /M

echo.
echo PATH configurado com sucesso!
echo Reinicie o terminal para aplicar as mudanças.
echo.
pause
