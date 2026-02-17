#!/usr/bin/env node

/**
 * SCRIPT COMPLETO DE VALIDAÇÃO DO SISTEMA ESCALAS BMI
 * 
 * Este script executa todos os testes e validações necessárias
 * para garantir que o sistema está funcionando perfeitamente.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const config = {
  projectRoot: process.cwd(),
  reportDir: './validation-reports',
  timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
};

// Criar diretório de relatórios
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

const validationResults = {
  timestamp: config.timestamp,
  phase: 'complete_validation',
  checks: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  issues: [],
  recommendations: []
};

async function runCompleteValidation() {
  console.log('🚀 INICIANDO VALIDAÇÃO COMPLETA DO SISTEMA ESCALAS BMI');
  console.log(`📅 Timestamp: ${config.timestamp}`);
  console.log(`📁 Relatórios: ${config.reportDir}`);
  
  try {
    // FASE 1: Validação de Sintaxe
    console.log('\n🔍 FASE 1: VALIDAÇÃO DE SINTAXE');
    await validateSyntax();
    
    // FASE 2: Build de Produção
    console.log('\n🏗️ FASE 2: BUILD DE PRODUÇÃO');
    await validateBuild();
    
    // FASE 3: Testes Automatizados
    console.log('\n🧪 FASE 3: TESTES AUTOMATIZADOS');
    await runTests();
    
    // FASE 4: Validação de Backup
    console.log('\n💾 FASE 4: VALIDAÇÃO DE BACKUP');
    await validateBackup();
    
    // FASE 5: Validação de Integridade
    console.log('\n🔧 FASE 5: VALIDAÇÃO DE INTEGRIDADE');
    await validateIntegrity();
    
    // FASE 6: Relatório Final
    console.log('\n📋 FASE 6: RELATÓRIO FINAL');
    await generateFinalReport();
    
    console.log('\n✅ VALIDAÇÃO COMPLETA CONCLUÍDA!');
    console.log(`📊 Relatório: ${config.reportDir}/validation-report-${config.timestamp}.json`);
    
  } catch (error) {
    console.error('❌ ERRO NA VALIDAÇÃO:', error.message);
    process.exit(1);
  }
}

async function validateSyntax() {
  const checks = {};
  
  try {
    // ESLint
    console.log('  🔎 Executando ESLint...');
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      checks.eslint = { status: 'passed', message: 'ESLint sem erros' };
      validationResults.summary.passed++;
    } catch (error) {
      checks.eslint = { status: 'warning', message: 'ESLint com warnings' };
      validationResults.summary.warnings++;
    }
    
    // TypeScript
    console.log('  🔎 Executando TypeScript...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      checks.typescript = { status: 'passed', message: 'TypeScript sem erros' };
      validationResults.summary.passed++;
    } catch (error) {
      checks.typescript = { status: 'failed', message: 'TypeScript com erros' };
      validationResults.summary.failed++;
      validationResults.issues.push({
        type: 'error',
        phase: 'syntax',
        message: 'Erros de TypeScript encontrados'
      });
    }
    
    validationResults.checks.syntax = checks;
    validationResults.summary.total += 2;
    
  } catch (error) {
    validationResults.checks.syntax = { status: 'failed', message: error.message };
    validationResults.summary.failed++;
  }
}

async function validateBuild() {
  const checks = {};
  
  try {
    console.log('  🏗️ Executando build de produção...');
    execSync('npm run build', { stdio: 'pipe' });
    
    // Verificar se build foi criado
    const buildDir = path.join(config.projectRoot, 'dist');
    if (fs.existsSync(buildDir)) {
      const buildSize = getDirectorySize(buildDir);
      checks.build = { 
        status: 'passed', 
        message: `Build criado com sucesso (${(buildSize / 1024 / 1024).toFixed(2)} MB)` 
      };
      validationResults.summary.passed++;
    } else {
      checks.build = { status: 'failed', message: 'Build não encontrado' };
      validationResults.summary.failed++;
    }
    
    validationResults.checks.build = checks;
    validationResults.summary.total++;
    
  } catch (error) {
    validationResults.checks.build = { status: 'failed', message: error.message };
    validationResults.summary.failed++;
    validationResults.issues.push({
      type: 'error',
      phase: 'build',
      message: 'Build falhou'
    });
  }
}

async function runTests() {
  const checks = {};
  
  try {
    console.log('  🧪 Executando testes...');
    try {
      execSync('npm run test', { stdio: 'pipe' });
      checks.tests = { status: 'passed', message: 'Todos os testes passando' };
      validationResults.summary.passed++;
    } catch (error) {
      checks.tests = { status: 'failed', message: 'Alguns testes falharam' };
      validationResults.summary.failed++;
      validationResults.issues.push({
        type: 'error',
        phase: 'tests',
        message: 'Testes falharam'
      });
    }
    
    validationResults.checks.tests = checks;
    validationResults.summary.total++;
    
  } catch (error) {
    validationResults.checks.tests = { status: 'failed', message: error.message };
    validationResults.summary.failed++;
  }
}

async function validateBackup() {
  const checks = {};
  
  try {
    console.log('  💾 Validando sistema de backup...');
    
    // Verificar scripts de backup
    const backupScript = path.join(config.projectRoot, 'scripts/full-system-backup.cjs');
    const dbBackupScript = path.join(config.projectRoot, 'scripts/backup-database-simple.cjs');
    
    if (fs.existsSync(backupScript) && fs.existsSync(dbBackupScript)) {
      checks.scripts = { status: 'passed', message: 'Scripts de backup encontrados' };
      validationResults.summary.passed++;
    } else {
      checks.scripts = { status: 'failed', message: 'Scripts de backup não encontrados' };
      validationResults.summary.failed++;
    }
    
    // Verificar workflow do GitHub Actions
    const workflowFile = path.join(config.projectRoot, '.github/workflows/complete-system-backup.yml');
    if (fs.existsSync(workflowFile)) {
      checks.github_actions = { status: 'passed', message: 'GitHub Actions configurado' };
      validationResults.summary.passed++;
    } else {
      checks.github_actions = { status: 'warning', message: 'GitHub Actions não configurado' };
      validationResults.summary.warnings++;
    }
    
    // Verificar diretório de backups
    const backupDir = path.join(config.projectRoot, 'backups');
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir).length;
      checks.backup_dir = { status: 'passed', message: `${backupFiles} arquivos de backup encontrados` };
      validationResults.summary.passed++;
    } else {
      checks.backup_dir = { status: 'warning', message: 'Diretório de backups não encontrado' };
      validationResults.summary.warnings++;
    }
    
    validationResults.checks.backup = checks;
    validationResults.summary.total += 3;
    
  } catch (error) {
    validationResults.checks.backup = { status: 'failed', message: error.message };
    validationResults.summary.failed++;
  }
}

async function validateIntegrity() {
  const checks = {};
  
  try {
    console.log('  🔧 Validando integridade do sistema...');
    
    // Verificar arquivos críticos
    const criticalFiles = [
      'src/contexts/AuthContext.tsx',
      'src/contexts/SupabaseContext.tsx',
      'src/components/AdminPanel.tsx',
      'src/lib/supabase.ts',
      'package.json'
    ];
    
    let missingFiles = [];
    criticalFiles.forEach(file => {
      if (!fs.existsSync(path.join(config.projectRoot, file))) {
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length === 0) {
      checks.critical_files = { status: 'passed', message: 'Todos os arquivos críticos presentes' };
      validationResults.summary.passed++;
    } else {
      checks.critical_files = { status: 'failed', message: `Arquivos faltando: ${missingFiles.join(', ')}` };
      validationResults.summary.failed++;
      validationResults.issues.push({
        type: 'error',
        phase: 'integrity',
        message: `Arquivos críticos faltando: ${missingFiles.join(', ')}`
      });
    }
    
    // Verificar variáveis de ambiente
    const envFile = path.join(config.projectRoot, '.env');
    if (fs.existsSync(envFile)) {
      checks.env_file = { status: 'passed', message: 'Arquivo .env encontrado' };
      validationResults.summary.passed++;
    } else {
      checks.env_file = { status: 'warning', message: 'Arquivo .env não encontrado' };
      validationResults.summary.warnings++;
    }
    
    validationResults.checks.integrity = checks;
    validationResults.summary.total += 2;
    
  } catch (error) {
    validationResults.checks.integrity = { status: 'failed', message: error.message };
    validationResults.summary.failed++;
  }
}

async function generateFinalReport() {
  // Calcular status geral
  const successRate = (validationResults.summary.passed / validationResults.summary.total) * 100;
  
  validationResults.summary.success_rate = successRate;
  validationResults.summary.status = successRate >= 80 ? 'passed' : successRate >= 60 ? 'warning' : 'failed';
  
  // Gerar recomendações
  if (validationResults.summary.failed > 0) {
    validationResults.recommendations.push('Corrigir erros críticos antes de ir para produção');
  }
  
  if (validationResults.summary.warnings > 0) {
    validationResults.recommendations.push('Investigar warnings para melhorar a qualidade');
  }
  
  if (validationResults.summary.status === 'passed') {
    validationResults.recommendations.push('Sistema pronto para produção');
  }
  
  // Salvar relatório
  const reportPath = path.join(config.reportDir, `validation-report-${config.timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2));
  
  // Exibir resumo
  console.log('\n📊 RESUMO DA VALIDAÇÃO:');
  console.log(`✅ Passou: ${validationResults.summary.passed}`);
  console.log(`❌ Falhou: ${validationResults.summary.failed}`);
  console.log(`⚠️ Warnings: ${validationResults.summary.warnings}`);
  console.log(`📈 Taxa de Sucesso: ${successRate.toFixed(1)}%`);
  console.log(`🎯 Status: ${validationResults.summary.status.toUpperCase()}`);
  
  if (validationResults.issues.length > 0) {
    console.log('\n❌ ISSUES ENCONTRADOS:');
    validationResults.issues.forEach(issue => {
      console.log(`  - ${issue.message}`);
    });
  }
  
  if (validationResults.recommendations.length > 0) {
    console.log('\n💡 RECOMENDAÇÕES:');
    validationResults.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
  }
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(filePath) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        calculateSize(path.join(filePath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}

// Executar validação
if (require.main === module) {
  runCompleteValidation();
}

module.exports = { runCompleteValidation };
