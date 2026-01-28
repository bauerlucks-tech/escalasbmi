@echo off  
set PATH=%C:\Program Files\Google\Chrome\Application;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Windows\System32\OpenSSH\;C:\Program Files\dotnet\;C:\Users\ricardo.gomes\AppData\Local\Microsoft\WindowsApps;;C:\Program Files\Git\cmd%;C:\Program Files\Git\cmd  
git --version  
git status  
git add .  
git commit -m Fix  
git push origin main  
pause  
