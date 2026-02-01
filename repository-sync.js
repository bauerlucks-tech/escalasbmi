// SISTEMA DE SINCRONIZAÇÃO COM REPOSITÓRIO
// Coleta dados do localStorage e salva no repositório GitHub

class RepositorySync {
  constructor() {
    this.repoOwner = 'bauerlucks-tech';
    this.repoName = 'escalasbmi';
    this.backupDir = './backups';
    this.syncInterval = 24 * 60 * 60 * 1000; // 24 horas
    this.maxBackups = 30;
  }

  // Coletar todos os dados do localStorage
  collectAllData() {
    const data = {
      timestamp: new Date().toISOString(),
      version: this.getVersion(),
      data: {
        scheduleStorage: this.getFromStorage('escala_scheduleStorage'),
        currentSchedules: this.getFromStorage('escala_currentSchedules'),
        archivedSchedules: this.getFromStorage('escala_archivedSchedules'),
        scheduleData: this.getFromStorage('escala_scheduleData'),
        swapRequests: this.getFromStorage('escala_swapRequests'),
        users: this.getFromStorage('escala_users'),
        vacations: this.getFromStorage('escala_vacations'),
        auditLogs: this.getFromStorage('escala_auditLogs')
      },
      metadata: {
        backupType: 'automatic_sync',
        environment: 'production',
        source: 'repository_sync.js',
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    return data;
  }

  // Obter dados do localStorage com validação
  getFromStorage(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      const parsed = JSON.parse(value);
      
      // Validar estrutura básica
      if (key === 'escala_scheduleStorage') {
        if (!parsed.current || !Array.isArray(parsed.current)) {
          console.warn(`⚠️ Estrutura inválida em ${key}`);
          return null;
        }
        console.log(`📊 ${key}: ${parsed.current.length} escalas atuais`);
      }
      
      return parsed;
    } catch (error) {
      console.error(`❌ Erro ao ler ${key}:`, error);
      return null;
    }
  }

  // Obter versão atual do sistema
  getVersion() {
    // Tentar obter do package.json ou usar padrão
    try {
      return document.querySelector('meta[name="version"]')?.content || '1.3.100304';
    } catch {
      return '1.3.100304';
    }
  }

  // Gerar nome do arquivo de backup
  generateFileName() {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `backup_${date}_${time}.json`;
  }

  // Criar e fazer download do backup
  downloadBackup(data) {
    const fileName = this.generateFileName();
    const jsonString = JSON.stringify(data, null, 2);
    
    // Criar blob e download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log(`✅ Backup baixado: ${fileName}`);
    console.log(`📊 Tamanho: ${(jsonString.length / 1024).toFixed(2)} KB`);
    
    return fileName;
  }

  // Sincronizar com repositório (simulado via download)
  syncToRepository() {
    console.log('🚀 Iniciando sincronização com repositório...');
    console.log('=' .repeat(50));
    
    try {
      // 1. Coletar dados
      const data = this.collectAllData();
      
      // 2. Validar dados
      const validation = this.validateData(data);
      if (!validation.valid) {
        console.error('❌ Validação falhou:', validation.errors);
        return false;
      }
      
      // 3. Gerar relatório
      this.generateReport(data);
      
      // 4. Fazer download do backup
      const fileName = this.downloadBackup(data);
      
      // 5. Salvar no localStorage para backup local
      this.saveLocalBackup(data, fileName);
      
      console.log('✅ Sincronização concluída com sucesso!');
      console.log(`📁 Arquivo: ${fileName}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return false;
    }
  }

  // Validar dados coletados
  validateData(data) {
    const errors = [];
    
    // Validar estrutura principal
    if (!data.data) {
      errors.push('Estrutura de dados ausente');
    }
    
    // Validar escalas
    const scheduleStorage = data.data.scheduleStorage;
    if (scheduleStorage) {
      if (!scheduleStorage.current || !Array.isArray(scheduleStorage.current)) {
        errors.push('Escalas atuais inválidas');
      }
      
      if (!scheduleStorage.archived || !Array.isArray(scheduleStorage.archived)) {
        errors.push('Escalas arquivadas inválidas');
      }
    }
    
    // Validar usuários
    const users = data.data.users;
    if (users && !Array.isArray(users)) {
      errors.push('Lista de usuários inválida');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Gerar relatório dos dados
  generateReport(data) {
    console.log('📋 RELATÓRIO DE DADOS:');
    console.log('=' .repeat(30));
    
    Object.entries(data.data).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          console.log(`📊 ${key}: ${value.length} itens`);
        } else if (typeof value === 'object') {
          if (value.current && value.archived) {
            console.log(`📊 ${key}: ${value.current.length} atuais, ${value.archived.length} arquivados`);
          } else {
            console.log(`📊 ${key}: objeto com ${Object.keys(value).length} propriedades`);
          }
        }
      } else {
        console.log(`❌ ${key}: vazio`);
      }
    });
    
    console.log(`📅 Data do backup: ${data.timestamp}`);
    console.log(`🔧 Versão: ${data.version}`);
  }

  // Salvar backup localmente
  saveLocalBackup(data, fileName) {
    try {
      // Obter backups existentes
      const existingBackups = JSON.parse(localStorage.getItem('repository_backups') || '[]');
      
      // Adicionar novo backup
      const backupInfo = {
        fileName,
        timestamp: data.timestamp,
        size: JSON.stringify(data).length,
        version: data.version
      };
      
      existingBackups.push(backupInfo);
      
      // Manter apenas os mais recentes
      if (existingBackups.length > this.maxBackups) {
        existingBackups.splice(0, existingBackups.length - this.maxBackups);
      }
      
      localStorage.setItem('repository_backups', JSON.stringify(existingBackups));
      
      console.log(`💾 Backup local salvo (${existingBackups.length} backups)`);
    } catch (error) {
      console.error('❌ Erro ao salvar backup local:', error);
    }
  }

  // Listar backups locais
  listLocalBackups() {
    try {
      const backups = JSON.parse(localStorage.getItem('repository_backups') || '[]');
      
      console.log('📋 Backups locais:');
      console.log('=' .repeat(30));
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.fileName}`);
        console.log(`   📅 ${new Date(backup.timestamp).toLocaleString()}`);
        console.log(`   💾 ${(backup.size / 1024).toFixed(2)} KB`);
        console.log(`   🔧 v${backup.version}`);
        console.log('');
      });
      
      return backups;
    } catch (error) {
      console.error('❌ Erro ao listar backups locais:', error);
      return [];
    }
  }

  // Iniciar sincronização automática
  startAutoSync() {
    console.log('🔄 Iniciando sincronização automática (24 horas)...');
    
    // Sincronizar imediatamente
    this.syncToRepository();
    
    // Configurar sincronização periódica
    setInterval(() => {
      console.log('⏰ Sincronização automática agendada...');
      this.syncToRepository();
    }, this.syncInterval);
    
    // Sincronizar quando a página for fechada
    window.addEventListener('beforeunload', () => {
      this.syncToRepository();
    });
  }

  // Restaurar dados de backup
  restoreFromBackup(backupData) {
    console.log('🔄 Restaurando dados do backup...');
    
    try {
      Object.entries(backupData.data).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, JSON.stringify(value));
          console.log(`✅ ${key} restaurado`);
        }
      });
      
      console.log('✅ Dados restaurados com sucesso!');
      console.log('🔄 Recarregue a página para aplicar as mudanças');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      return false;
    }
  }
}

// Criar instância global
const repoSync = new RepositorySync();

// Exportar funções para uso no console
window.repositorySync = {
  syncNow: () => repoSync.syncToRepository(),
  startAutoSync: () => repoSync.startAutoSync(),
  listBackups: () => repoSync.listLocalBackups(),
  collectData: () => repoSync.collectAllData(),
  restore: (backupData) => repoSync.restoreFromBackup(backupData)
};

console.log('🔧 SISTEMA DE SINCRONIZAÇÃO CARREGADO!');
console.log('🎯 Para sincronizar agora: repositorySync.syncNow()');
console.log('🔄 Para auto-sync: repositorySync.startAutoSync()');
console.log('📋 Para listar backups: repositorySync.listBackups()');
console.log('📊 Para coletar dados: repositorySync.collectData()');
