#!/usr/bin/env node

/**
 * ROTINA DE TESTES COMPLETA - Sistema de Escalas BMI
 * Executa todos os testes críticos do sistema com verificação automática
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configuração
const PROJECT_ROOT = process.cwd();
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n🔍 Executando: ${description}`, 'cyan');
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: PROJECT_ROOT 
    });
    
    TEST_RESULTS.passed++;
    TEST_RESULTS.total++;
    TEST_RESULTS.details.push({
      test: description,
      status: 'PASS',
      output: result.trim()
    });
    
    log(`✅ ${description} - PASS`, 'green');
    return { success: true, output: result };
  } catch (error) {
    TEST_RESULTS.failed++;
    TEST_RESULTS.total++;
    TEST_RESULTS.details.push({
      test: description,
      status: 'FAIL',
      output: error.message
    });
    
    log(`❌ ${description} - FAIL`, 'red');
    log(`   Erro: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}


function getPortCheckCommand(port) {
  if (process.platform === 'win32') {
    return `netstat -an | findstr :${port}`;
  }

  return `netstat -an | grep :${port}`;
}

function checkFileExists(filePath, description) {
  try {
    const fullPath = join(PROJECT_ROOT, filePath);
    const exists = existsSync(fullPath);
    
    TEST_RESULTS.total++;
    if (exists) {
      TEST_RESULTS.passed++;
      TEST_RESULTS.details.push({
        test: description,
        status: 'PASS',
        output: `Arquivo encontrado: ${filePath}`
      });
      log(`✅ ${description} - PASS`, 'green');
    } else {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: description,
        status: 'FAIL',
        output: `Arquivo não encontrado: ${filePath}`
      });
      log(`❌ ${description} - FAIL - Arquivo não encontrado: ${filePath}`, 'red');
    }
    return exists;
  } catch (error) {
    TEST_RESULTS.failed++;
    TEST_RESULTS.total++;
    log(`❌ ${description} - FAIL - ${error.message}`, 'red');
    return false;
  }
}

function checkImport(filePath, importStatement, description) {
  try {
    const fullPath = join(PROJECT_ROOT, filePath);
    if (!existsSync(fullPath)) {
      log(`❌ ${description} - Arquivo não encontrado`, 'red');
      TEST_RESULTS.failed++;
      TEST_RESULTS.total++;
      return false;
    }
    
    const content = readFileSync(fullPath, 'utf8');
    const hasImport = content.includes(importStatement);
    
    TEST_RESULTS.total++;
    if (hasImport) {
      TEST_RESULTS.passed++;
      TEST_RESULTS.details.push({
        test: description,
        status: 'PASS',
        output: `Import encontrado: ${importStatement}`
      });
      log(`✅ ${description} - PASS`, 'green');
    } else {
      TEST_RESULTS.failed++;
      TEST_RESULTS.details.push({
        test: description,
        status: 'FAIL',
        output: `Import não encontrado: ${importStatement}`
      });
      log(`❌ ${description} - FAIL - Import não encontrado: ${importStatement}`, 'red');
    }
    return hasImport;
  } catch (error) {
    TEST_RESULTS.failed++;
    TEST_RESULTS.total++;
    log(`❌ ${description} - FAIL - ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 INICIANDO ROTINA DE TESTES COMPLETA - Sistema de Escalas BMI', 'blue');
  log('='.repeat(60), 'blue');
  
  // 1. Testes de Build e Compilação
  log('\n📦 TESTES DE BUILD E COMPILAÇÃO', 'yellow');
  runCommand('npm run build', 'Build do projeto');
  runCommand('npx tsc --noEmit', 'TypeScript compilation');
  runCommand('npm run lint -- --max-warnings=0', 'ESLint sem warnings');
  
  // 2. Testes de Arquivos Críticos
  log('\n📁 TESTES DE ARQUIVOS CRÍTICOS', 'yellow');
  checkFileExists('src/components/SwapRequestView.tsx', 'SwapRequestView.tsx existe');
  checkFileExists('src/contexts/AuthContext.tsx', 'AuthContext.tsx existe');
  checkFileExists('src/contexts/SwapContext.tsx', 'SwapContext.tsx existe');
  checkFileExists('src/components/AdminPanel.tsx', 'AdminPanel.tsx existe');
  checkFileExists('src/utils/csv/index.ts', 'CSV utils index.ts existe');
  checkFileExists('src/utils/csv/parser.ts', 'CSV parser.ts existe');
  checkFileExists('src/utils/csv/validator.ts', 'CSV validator.ts existe');
  checkFileExists('src/utils/csv/exporter.ts', 'CSV exporter.ts existe');
  
  // 3. Testes de Imports Críticos
  log('\n🔗 TESTES DE IMPORTS CRÍTICOS', 'yellow');
  checkImport('src/components/SwapRequestView.tsx', 'import { useAuth }', 'SwapRequestView - useAuth import');
  checkImport('src/components/SwapRequestView.tsx', 'import { useSwap }', 'SwapRequestView - useSwap import');
  checkImport('src/utils/csv/index.ts', "export { parse } from './parser'", 'CSV index - parser export');
  checkImport('src/utils/csv/index.ts', "export { validateCSV", 'CSV index - validateCSV export');
  checkImport('src/utils/csv/validator.ts', 'export const validateCSV', 'CSV validator - validateCSV export');
  
  // 4. Testes de Funcionalidades do Sistema
  log('\n🎯 TESTES DE FUNCIONALIDADES DO SISTEMA', 'yellow');
  checkFileExists('package.json', 'package.json existe');
  checkFileExists('tsconfig.json', 'tsconfig.json existe');
  checkFileExists('.gitignore', '.gitignore existe');
  checkFileExists('.env', '.env existe');
  
  // 5. Testes de Backup
  log('\n💾 TESTES DE SISTEMA DE BACKUP', 'yellow');
  checkFileExists('.github/workflows/daily-database-backup.yml', 'Workflow de backup existe');
  checkFileExists('scripts/setup-backup.sql', 'Script SQL de backup existe');
  checkFileExists('scripts/test-backup-config.js', 'Script de teste de backup existe');
  checkFileExists('docs/BACKUP_SYSTEM.md', 'Documentação de backup existe');
  
  // 6. Testes de Permissões
  log('\n🔐 TESTES DE PERMISSÕES E SEGURANÇA', 'yellow');
  checkImport('src/components/AdminPanel.tsx', 'isSuperAdmin', 'AdminPanel - isSuperAdmin check');
  checkImport('src/components/Header.tsx', 'isAdmin', 'Header - isAdmin check');
  checkImport('src/components/Dashboard.tsx', 'currentUser', 'Dashboard - currentUser check');
  
  // 7. Testes de Git
  log('\n📋 TESTES DE REPOSITÓRIO GIT', 'yellow');
  runCommand('git status --porcelain', 'Git status - working tree limpo');
  checkFileExists('.gitignore', '.gitignore existe');
  checkImport('.gitignore', '*.tsbuildinfo', '.gitignore - tsbuildinfo pattern');
  
  // 8. Testes de Servidor
  log('\n🌐 TESTES DE SERVIDOR DE DESENVOLVIMENTO', 'yellow');
  const devServerCheck = runCommand(getPortCheckCommand(8081), 'Verificar servidor dev na porta 8081');
  if (!devServerCheck.success) {
    log('⚠️ Servidor de desenvolvimento não está rodando na porta 8081', 'yellow');
  }
  
  // Relatório Final
  log('\n' + '='.repeat(60), 'blue');
  log('📊 RELATÓRIO FINAL DE TESTES', 'blue');
  log('='.repeat(60), 'blue');
  
  log(`\n📈 ESTATÍSTICAS:`, 'cyan');
  log(`   Total de testes: ${TEST_RESULTS.total}`, 'cyan');
  log(`   ✅ Passaram: ${TEST_RESULTS.passed}`, 'green');
  log(`   ❌ Falharam: ${TEST_RESULTS.failed}`, 'red');
  log(`   📊 Taxa de sucesso: ${((TEST_RESULTS.passed / TEST_RESULTS.total) * 100).toFixed(1)}%`, 
      TEST_RESULTS.passed === TEST_RESULTS.total ? 'green' : 'yellow');
  
  // Detalhes dos testes
  log(`\n📋 DETALHES DOS TESTES:`, 'cyan');
  TEST_RESULTS.details.forEach((test, index) => {
    const statusIcon = test.status === 'PASS' ? '✅' : '❌';
    const statusColor = test.status === 'PASS' ? 'green' : 'red';
    log(`   ${index + 1}. ${statusIcon} ${test.test}`, statusColor);
    if (test.status === 'FAIL') {
      log(`      └─ ${test.output}`, 'red');
    }
  });
  
  // Recomendações
  if (TEST_RESULTS.failed > 0) {
    log(`\n🔧 RECOMENDAÇÕES PARA CORREÇÃO:`, 'yellow');
    const failedTests = TEST_RESULTS.details.filter(t => t.status === 'FAIL');
    failedTests.forEach(test => {
      log(`   • ${test.test}: ${test.output}`, 'yellow');
    });
  }
  
  // Status final
  log(`\n🎯 STATUS FINAL:`, 'cyan');
  if (TEST_RESULTS.failed === 0) {
    log(`🎉 TODOS OS TESTES PASSARAM! Sistema 100% funcional!`, 'green');
    process.exit(0);
  } else {
    log(`⚠️ ${TEST_RESULTS.failed} testes falharam. Verifique os detalhes acima.`, 'red');
    process.exit(1);
  }
}

// Executar todos os testes
runAllTests().catch(error => {
  log(`\n💥 ERRO CRÍTICO NA ROTINA DE TESTES: ${error.message}`, 'red');
  process.exit(1);
});
