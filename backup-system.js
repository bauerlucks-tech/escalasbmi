// SISTEMA DE BACKUP DIÁRIO AUTOMÁTICO PARA REPOSITÓRIO
// Este script cria backup diário dos dados da escala e salva no repositório

const fs = require('fs');
const path = require('path');

// Configuração
const config = {
  backupDir: path.join(__dirname, 'backups'),
  dataDir: path.join(__dirname, 'data'),
  maxBackups: 30, // Manter 30 dias de backup
  compressionEnabled: true
};

// Garantir que diretórios existam
function ensureDirectories() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
}

// Gerar nome do arquivo de backup
function generateBackupFileName() {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `backup_${date}_${time}.json`;
}

// Coletar todos os dados do sistema
function collectSystemData() {
  const data = {
    timestamp: new Date().toISOString(),
    version: require('./package.json').version || '1.0.0',
    data: {
      // Dados principais (serão extraídos do localStorage em produção)
      scheduleStorage: null,
      currentSchedules: null,
      archivedSchedules: null,
      scheduleData: null,
      swapRequests: null,
      users: null,
      vacations: null,
      auditLogs: null
    },
    metadata: {
      backupType: 'daily_automatic',
      environment: 'production',
      source: 'backup_system.js'
    }
  };
  
  return data;
}

// Salvar backup no repositório
function saveBackupToRepository(data) {
  const fileName = generateBackupFileName();
  const filePath = path.join(config.backupDir, fileName);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Backup salvo: ${fileName}`);
    
    // Criar arquivo mais recente para fácil acesso
    const latestPath = path.join(config.backupDir, 'latest_backup.json');
    fs.writeFileSync(latestPath, JSON.stringify(data, null, 2));
    
    return fileName;
  } catch (error) {
    console.error('❌ Erro ao salvar backup:', error);
    return null;
  }
}

// Limpar backups antigos
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(config.backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
    
    // Ordenar por data (mais recentes primeiro)
    backupFiles.sort((a, b) => {
      const statA = fs.statSync(path.join(config.backupDir, a));
      const statB = fs.statSync(path.join(config.backupDir, b));
      return statB.mtime - statA.mtime;
    });
    
    // Manter apenas os mais recentes
    if (backupFiles.length > config.maxBackups) {
      const toDelete = backupFiles.slice(config.maxBackups);
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(config.backupDir, file));
        console.log(`🗑️ Backup antigo removido: ${file}`);
      });
    }
    
    console.log(`📊 Mantidos ${Math.min(backupFiles.length, config.maxBackups)} backups mais recentes`);
  } catch (error) {
    console.error('❌ Erro ao limpar backups antigos:', error);
  }
}

// Gerar relatório de backup
function generateBackupReport() {
  try {
    const files = fs.readdirSync(config.backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
    
    const report = {
      timestamp: new Date().toISOString(),
      totalBackups: backupFiles.length,
      latestBackup: null,
      backupSize: 0,
      oldestBackup: null,
      newestBackup: null
    };
    
    if (backupFiles.length > 0) {
      backupFiles.forEach(file => {
        const filePath = path.join(config.backupDir, file);
        const stat = fs.statSync(filePath);
        
        if (!report.oldestBackup || stat.mtime < report.oldestBackup) {
          report.oldestBackup = stat.mtime;
        }
        
        if (!report.newestBackup || stat.mtime > report.newestBackup) {
          report.newestBackup = stat.mtime;
          report.latestBackup = file;
        }
        
        report.backupSize += stat.size;
      });
    }
    
    // Salvar relatório
    const reportPath = path.join(config.backupDir, 'backup_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 Relatório de backup gerado');
    return report;
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return null;
  }
}

// Função principal de backup
function performBackup() {
  console.log('🚀 Iniciando backup diário automático...');
  console.log('=' .repeat(50));
  
  try {
    // 1. Garantir diretórios
    ensureDirectories();
    
    // 2. Coletar dados
    const data = collectSystemData();
    console.log('📊 Dados coletados para backup');
    
    // 3. Salvar backup
    const fileName = saveBackupToRepository(data);
    if (!fileName) {
      throw new Error('Falha ao salvar backup');
    }
    
    // 4. Limpar backups antigos
    cleanOldBackups();
    
    // 5. Gerar relatório
    const report = generateBackupReport();
    
    console.log('✅ Backup diário concluído com sucesso!');
    console.log(`📁 Arquivo: ${fileName}`);
    if (report) {
      console.log(`📊 Total de backups: ${report.totalBackups}`);
      console.log(`💾 Tamanho total: ${(report.backupSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Falha no backup diário:', error);
    return false;
  }
}

// Restaurar backup
function restoreBackup(backupFileName) {
  try {
    const filePath = path.join(config.backupDir, backupFileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupFileName}`);
    }
    
    const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📂 Restaurando backup: ${backupFileName}`);
    console.log(`📅 Data do backup: ${backupData.timestamp}`);
    
    // Aqui você implementaria a lógica para restaurar os dados
    // Por enquanto, apenas exibimos os dados
    console.log('📊 Dados disponíveis para restauração:');
    Object.keys(backupData.data).forEach(key => {
      const value = backupData.data[key];
      if (value) {
        console.log(`  ✅ ${key}: ${Array.isArray(value) ? value.length : 'object'} itens`);
      } else {
        console.log(`  ❌ ${key}: vazio`);
      }
    });
    
    return backupData;
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    return null;
  }
}

// Listar backups disponíveis
function listBackups() {
  try {
    const files = fs.readdirSync(config.backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
    
    console.log('📋 Backups disponíveis:');
    console.log('=' .repeat(50));
    
    backupFiles.forEach(file => {
      const filePath = path.join(config.backupDir, file);
      const stat = fs.statSync(filePath);
      const size = (stat.size / 1024).toFixed(2);
      console.log(`📁 ${file} (${size} KB) - ${stat.mtime.toLocaleString()}`);
    });
    
    return backupFiles;
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    return [];
  }
}

// Exportar funções
module.exports = {
  performBackup,
  restoreBackup,
  listBackups,
  generateBackupReport,
  config
};

// Executar backup se chamado diretamente
if (require.main === module) {
  performBackup();
}
