// Script para Verificar e Corrigir Backups Automáticos
// Execute no console do navegador para diagnosticar problemas

function verificarBackupsAutomaticos() {
  console.log('🔍 VERIFICANDO BACKUPS AUTOMÁTICOS...');
  console.log('='.repeat(50));
  
  // 1. Verificar configuração atual
  console.log('\n📊 CONFIGURAÇÃO ATUAL:');
  
  const lastBackup = localStorage.getItem('last_auto_backup');
  const systemBackups = localStorage.getItem('system_backups');
  const backups = systemBackups ? JSON.parse(systemBackups) : [];
  
  console.log(`📅 Último backup automático: ${lastBackup || 'NUNCA'}`);
  console.log(`💾 Total de backups armazenados: ${backups.length}`);
  console.log(`⏰ Hora atual: ${new Date().toLocaleString()}`);
  
  // 2. Listar backups existentes
  if (backups.length > 0) {
    console.log('\n📋 BACKUPS EXISTENTES:');
    backups.forEach((backup, index) => {
      const date = new Date(backup.createdAt);
      const type = backup.id.startsWith('auto_') ? '🤖 AUTO' : '👤 MANUAL';
      console.log(`${index + 1}. ${type} - ${date.toLocaleString()}`);
    });
  } else {
    console.log('\n❌ NENHUM BACKUP ENCONTRADO!');
  }
  
  // 3. Verificar dados do sistema
  console.log('\n📊 DADOS DO SISTEMA:');
  const dados = {
    scheduleStorage: localStorage.getItem('escala_scheduleStorage'),
    currentSchedules: localStorage.getItem('escala_currentSchedules'),
    archivedSchedules: localStorage.getItem('escala_archivedSchedules'),
    swapRequests: localStorage.getItem('escala_swapRequests'),
    users: localStorage.getItem('escala_users'),
    vacations: localStorage.getItem('escala_vacations'),
    auditLogs: localStorage.getItem('escala_auditLogs')
  };
  
  Object.entries(dados).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const size = value ? JSON.parse(value).length : 0;
    console.log(`${status} ${key}: ${size} itens`);
  });
  
  // 4. Testar função de backup automático
  console.log('\n🧪 TESTANDO FUNÇÃO DE BACKUP:');
  
  window.testarBackupAutomatico = function() {
    console.log('🔄 Executando backup automático manualmente...');
    
    try {
      // Simular a função createAutoBackup
      const storedSchedules = localStorage.getItem('escala_scheduleStorage');
      const storedVacations = localStorage.getItem('escala_vacations');
      const storedSwapRequests = localStorage.getItem('escala_swapRequests');
      const storedUsers = localStorage.getItem('escala_users');

      const schedules = storedSchedules ? JSON.parse(storedSchedules) : { current: [], archived: [] };
      const vacations = storedVacations ? JSON.parse(storedVacations) : { requests: [] };
      const swapRequestsData = storedSwapRequests ? JSON.parse(storedSwapRequests) : [];
      const usersData = storedUsers ? JSON.parse(storedUsers) : [];

      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          schedules: schedules,
          vacations: vacations,
          swapRequests: swapRequestsData,
          users: usersData
        }
      };

      const storedBackup = {
        ...backup,
        id: `test_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Store backup in localStorage
      const existingBackups = JSON.parse(localStorage.getItem('system_backups') || '[]');
      existingBackups.push(storedBackup);
      
      // Keep only last 30 backups
      if (existingBackups.length > 30) {
        existingBackups.splice(0, existingBackups.length - 30);
      }
      
      localStorage.setItem('system_backups', JSON.stringify(existingBackups));
      
      console.log('✅ Backup de teste criado com sucesso!');
      console.log('📊 Dados incluídos:');
      console.log(`  - Escalas: ${schedules.current.length + schedules.archived.length}`);
      console.log(`  - Trocas: ${swapRequestsData.length}`);
      console.log(`  - Usuários: ${usersData.length}`);
      console.log(`  - Férias: ${vacations.requests.length}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar backup de teste:', error);
      return false;
    }
  };
  
  // 5. Forçar backup automático
  window.forcarBackupAutomatico = function() {
    console.log('⚡ FORÇANDO BACKUP AUTOMÁTICO...');
    
    const now = new Date();
    const today = now.toDateString();
    
    // Simular que é 00:00
    localStorage.setItem('last_auto_backup', today);
    
    // Executar backup
    const success = window.testarBackupAutomatico();
    
    if (success) {
      console.log('✅ Backup automático forçado com sucesso!');
      console.log('📅 Data registrada:', today);
    }
    
    return success;
  };
  
  // 6. Limpar backups antigos
  window.limparBackupsAntigos = function() {
    console.log('🧹 LIMPANDO BACKUPS ANTIGOS...');
    
    const backups = JSON.parse(localStorage.getItem('system_backups') || '[]');
    const agora = new Date();
    const trintaDiasAtras = new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const backupsRecentes = backups.filter(backup => {
      const dataBackup = new Date(backup.createdAt);
      return dataBackup > trintaDiasAtras;
    });
    
    const removidos = backups.length - backupsRecentes.length;
    
    localStorage.setItem('system_backups', JSON.stringify(backupsRecentes));
    
    console.log(`✅ ${removidos} backups antigos removidos`);
    console.log(`📊 Restam ${backupsRecentes.length} backups recentes`);
    
    return removidos;
  };
  
  // 7. Verificar agendamento
  console.log('\n⏰ VERIFICAÇÃO DE AGENDAMENTO:');
  console.log('🔍 O sistema verifica backups a cada minuto');
  console.log('🕐 Backup automático programado para 00:00');
  console.log('📅 Só executa uma vez por dia');
  
  console.log('\n✅ FUNÇÕES DISPONÍVEIS:');
  console.log('🎯 testarBackupAutomatico() - Testar criação de backup');
  console.log('⚡ forcarBackupAutomatico() - Forçar backup agora');
  console.log('🧹 limparBackupsAntigos() - Limpar backups com mais de 30 dias');
  
  // 8. Diagnóstico final
  console.log('\n🎯 DIAGNÓSTICO FINAL:');
  
  if (backups.length === 0) {
    console.log('❌ NENHUM BACKUP ENCONTRADO - Execute testarBackupAutomatico()');
  } else {
    const autoBackups = backups.filter(b => b.id.startsWith('auto_'));
    const manualBackups = backups.filter(b => b.id.startsWith('manual_'));
    
    console.log(`📊 Backups automáticos: ${autoBackups.length}`);
    console.log(`📊 Backups manuais: ${manualBackups.length}`);
    
    if (autoBackups.length === 0) {
      console.log('⚠️ NENHUM BACKUP AUTOMÁTICO - Verifique agendamento');
    } else {
      const ultimoAuto = autoBackups[0];
      const dataUltimo = new Date(ultimoAuto.createdAt);
      const diasAtras = Math.floor((new Date() - dataUltimo) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Último backup automático: ${diasAtras} dias atrás`);
      
      if (diasAtras > 1) {
        console.log('⚠️ BACKUP AUTOMÁTICO NÃO ESTÁ FUNCIONANDO');
      } else {
        console.log('✅ BACKUP AUTOMÁTICO FUNCIONANDO');
      }
    }
  }
}

// Exportar função principal
window.verificarBackupsAutomaticos = verificarBackupsAutomaticos;

console.log('🔧 FUNÇÃO DE VERIFICAÇÃO CARREGADA!');
console.log('🎯 Para executar, digite: verificarBackupsAutomaticos()');
