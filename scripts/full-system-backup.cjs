#!/usr/bin/env node

/**
 * SCRIPT DE BACKUP COMPLETO DO SISTEMA ESCALAS BMI
 * 
 * Este script realiza backup completo:
 * 1. Código fonte (GitHub)
 * 2. Banco de dados (Supabase)
 * 3. Configurações e arquivos importantes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Configurações
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  backupDir: './backups',
  timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
};

// Criar diretório de backup
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

async function createFullBackup() {
  console.log('🚀 INICIANDO BACKUP COMPLETO DO SISTEMA');
  console.log(`📅 Timestamp: ${config.timestamp}`);
  console.log(`📁 Diretório: ${config.backupDir}`);
  
  try {
    // 1. Backup do código fonte
    console.log('\n📦 1. Backup do código fonte...');
    const sourceBackup = await backupSourceCode();
    
    // 2. Backup do banco de dados
    console.log('\n🗄️ 2. Backup do banco de dados...');
    const dbBackup = await backupDatabase();
    
    // 3. Backup de configurações
    console.log('\n⚙️ 3. Backup de configurações...');
    const configBackup = await backupConfigurations();
    
    // 4. Gerar relatório
    console.log('\n📋 4. Gerando relatório...');
    const report = generateReport(sourceBackup, dbBackup, configBackup);
    
    console.log('\n✅ BACKUP COMPLETO REALIZADO COM SUCESSO!');
    console.log(`📊 Relatório: ${report.path}`);
    
  } catch (error) {
    console.error('❌ ERRO NO BACKUP:', error.message);
    process.exit(1);
  }
}

async function backupSourceCode() {
  const backupPath = path.join(config.backupDir, `source-code-${config.timestamp}.tar.gz`);
  
  try {
    // Criar tar.gz do código fonte
    execSync(`tar -czf "${backupPath}" --exclude=node_modules --exclude=.git --exclude=backups --exclude=dist .`, { stdio: 'inherit' });
    
    const stats = fs.statSync(backupPath);
    console.log(`✅ Código backup: ${backupPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
    return {
      path: backupPath,
      size: stats.size,
      files: process.platform === 'win32' 
        ? execSync('git ls-files | find /c /v ""', { encoding: 'utf8' }).trim()
        : execSync('git ls-files | wc -l', { encoding: 'utf8' }).trim()
    };
  } catch (error) {
    throw new Error(`Falha no backup do código: ${error.message}`);
  }
}

async function backupDatabase() {
  const backupPath = path.join(config.backupDir, `database-${config.timestamp}.json`);
  
  try {
    // Usar script simplificado de backup
    execSync(`node scripts/backup-database-simple.cjs "${backupPath}"`, { stdio: 'inherit' });
    
    const stats = fs.statSync(backupPath);
    console.log(`✅ Database backup: ${backupPath} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    // Ler o backup para extrair estatísticas
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    return {
      path: backupPath,
      size: stats.size,
      tables: Object.keys(backupData.tables),
      records: backupData.metadata.total_records
    };
  } catch (error) {
    throw new Error(`Falha no backup do database: ${error.message}`);
  }
}

async function backupConfigurations() {
  const backupPath = path.join(config.backupDir, `config-${config.timestamp}.tar.gz`);
  const configFiles = [
    'package.json',
    'tsconfig.json',
    '.env.example',
    'vite.config.ts',
    'tailwind.config.js',
    '.github/workflows/'
  ];
  
  try {
    // Filtrar arquivos que existem
    const existingFiles = configFiles.filter(file => {
      const fullPath = path.resolve(file);
      return fs.existsSync(fullPath);
    });
    
    if (existingFiles.length === 0) {
      throw new Error('Nenhum arquivo de configuração encontrado');
    }
    
    // Criar backup das configurações (Windows compatible)
    if (process.platform === 'win32') {
      // Para Windows, usar 7-zip se disponível, ou criar manualmente
      execSync(`tar -czf "${backupPath}" ${existingFiles.join(' ')}`, { stdio: 'inherit' });
    } else {
      execSync(`tar -czf "${backupPath}" ${existingFiles.join(' ')}`, { stdio: 'inherit' });
    }
    
    const stats = fs.statSync(backupPath);
    console.log(`✅ Config backup: ${backupPath} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    return {
      path: backupPath,
      size: stats.size,
      files: existingFiles
    };
  } catch (error) {
    // Se falhar, criar backup manual dos arquivos importantes
    console.log('⚠️ Falha no tar, criando backup manual...');
    const manualBackupPath = path.join(config.backupDir, `config-${config.timestamp}.json`);
    
    const configData = {
      metadata: {
        timestamp: new Date().toISOString(),
        backup_type: 'configurations'
      },
      files: {}
    };
    
    for (const file of configFiles) {
      const fullPath = path.resolve(file);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          configData.files[file] = {
            content: content,
            size: content.length,
            modified: fs.statSync(fullPath).mtime
          };
          console.log(`✅ ${file} adicionado ao backup`);
        } catch (err) {
          console.log(`⚠️ ${file} não pôde ser lido`);
        }
      }
    }
    
    fs.writeFileSync(manualBackupPath, JSON.stringify(configData, null, 2));
    const stats = fs.statSync(manualBackupPath);
    
    console.log(`✅ Config backup (manual): ${manualBackupPath} (${(stats.size / 1024).toFixed(2)} KB)`);
    
    return {
      path: manualBackupPath,
      size: stats.size,
      files: Object.keys(configData.files)
    };
  }
}

function generateReport(sourceBackup, dbBackup, configBackup) {
  const report = {
    timestamp: config.timestamp,
    backup_type: 'full_system',
    components: {
      source_code: sourceBackup,
      database: dbBackup,
      configurations: configBackup
    },
    total_size: sourceBackup.size + dbBackup.size + configBackup.size,
    status: 'completed',
    system_info: {
      node_version: process.version,
      platform: process.platform,
      git_commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      git_branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    }
  };
  
  const reportPath = path.join(config.backupDir, `backup-report-${config.timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Exibir resumo
  console.log('\n📊 RESUMO DO BACKUP:');
  console.log(`📦 Código: ${sourceBackup.files} arquivos, ${(sourceBackup.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🗄️ Database: ${dbBackup.records} registros, ${(dbBackup.size / 1024).toFixed(2)} KB`);
  console.log(`⚙️ Config: ${configBackup.files.length} arquivos, ${(configBackup.size / 1024).toFixed(2)} KB`);
  console.log(`💾 Total: ${(report.total_size / 1024 / 1024).toFixed(2)} MB`);
  
  return { path: reportPath, data: report };
}

// Executar backup
if (require.main === module) {
  createFullBackup();
}

module.exports = { createFullBackup };
