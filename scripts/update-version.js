import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Obter o código do commit atual
function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('Não foi possível obter o hash do commit:', error.message);
    return 'unknown';
  }
}

// Gerar versão no formato 1.3.DDHH (dia invertido + hora)
function generateVersion() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  // Inverter o dia: 31 -> 13
  const invertedDay = day.split('').reverse().join('');
  
  // Formato: 1.3.DDHH (ex: 1.3.1319 para dia 31, hora 19)
  return `1.3.${invertedDay}${hours}${minutes}`;
}

// Atualizar o arquivo LoginScreen.tsx com a nova versão
function updateVersion() {
  const commitHash = getCommitHash();
  const newVersion = generateVersion();
  const loginScreenPath = path.join(process.cwd(), 'src/components/LoginScreen.tsx');
  
  try {
    // Ler o arquivo atual
    let content = fs.readFileSync(loginScreenPath, 'utf8');
    
    // Substituir a versão usando regex
    const regex = /Versão: <span className="text-primary font-mono">([^<]+)<\/span> <span className="text-muted-foreground">\(([^)]+)\)<\/span>/;
    const match = content.match(regex);
    
    if (match) {
      const newContent = content.replace(
        regex,
        `Versão: <span className="text-primary font-mono">${newVersion}</span> <span className="text-muted-foreground">(${commitHash})</span>`
      );
      
      // Escrever de volta no arquivo
      fs.writeFileSync(loginScreenPath, newContent);
      console.log(`✅ Versão atualizada: ${newVersion} (${commitHash})`);
    } else {
      console.warn('❌ Padrão de versão não encontrado no LoginScreen.tsx');
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar versão:', error.message);
    process.exit(1);
  }
}

// Executar a atualização
updateVersion();
