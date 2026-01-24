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

// Atualizar o arquivo LoginScreen.tsx com o código do commit atual
function updateVersion() {
  const commitHash = getCommitHash();
  const loginScreenPath = path.join(process.cwd(), 'src/components/LoginScreen.tsx');
  
  try {
    // Ler o arquivo atual
    let content = fs.readFileSync(loginScreenPath, 'utf8');
    
    // Substituir o hash do commit usando regex
    const regex = /Versão: <span className="text-primary font-mono">([^<]+)<\/span> <span className="text-muted-foreground">\(([^)]+)\)<\/span>/;
    const match = content.match(regex);
    
    if (match) {
      const version = match[1]; // Mantém a versão atual (ex: 1.2beta)
      const newContent = content.replace(
        regex,
        `Versão: <span className="text-primary font-mono">${version}</span> <span className="text-muted-foreground">(${commitHash})</span>`
      );
      
      // Escrever de volta no arquivo
      fs.writeFileSync(loginScreenPath, newContent);
      console.log(`✅ Versão atualizada: ${version} (${commitHash})`);
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
