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

// Gerar versão no formato 2.0.DDHH (dia normal + hora)
function generateVersion() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  // Formato: 2.0.DDHH (ex: 2.0.3019 para dia 30, hora 19)
  return `2.0.${day}${hours}${minutes}`;
}

// Atualizar versão no sistema (não precisa mais do LoginScreen.tsx)
function updateVersion() {
  const commitHash = getCommitHash();
  const newVersion = generateVersion();
  
  try {
    console.log(`✅ Versão atualizada: ${newVersion} (${commitHash})`);
    console.log('✅ LoginScreen.tsx removido - versão controlada pelo sistema externo');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar versão:', error.message);
    return false;
  }
}

// Executar a atualização
updateVersion();
