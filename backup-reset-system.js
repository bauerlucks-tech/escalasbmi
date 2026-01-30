// Script de Backup e Reset Completo do Sistema
// Execute no console do navegador para fazer backup completo e limpar dados

function fazerBackupCompleto() {
  console.log('🔄 INICIANDO BACKUP COMPLETO DO SISTEMA...');
  
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.2beta',
    data: {
      // Backup de usuários
      users: JSON.parse(localStorage.getItem('escala_users') || '[]'),
      
      // Backup de escalas
      scheduleData: JSON.parse(localStorage.getItem('escala_scheduleData') || '[]'),
      currentSchedules: JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]'),
      archivedSchedules: JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]'),
      
      // Backup de solicitações de troca
      swapRequests: JSON.parse(localStorage.getItem('escala_swapRequests') || '[]'),
      
      // Backup de logs de auditoria
      auditLogs: JSON.parse(localStorage.getItem('escala_auditLogs') || '{}'),
      
      // Backup de férias
      vacationRequests: JSON.parse(localStorage.getItem('escala_vacationRequests') || '[]'),
      
      // Backup do usuário atual
      currentUser: JSON.parse(localStorage.getItem('escala_currentUser') || 'null'),
      
      // Backup de configurações
      settings: {
        theme: localStorage.getItem('vite-ui-theme'),
        lastBackup: localStorage.getItem('escala_lastBackup'),
        version: localStorage.getItem('escala_version')
      }
    }
  };
  
  // Salvar backup no localStorage
  localStorage.setItem('escala_backup_completo_' + Date.now(), JSON.stringify(backup));
  
  // Criar arquivo para download
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_completo_escala_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ BACKUP COMPLETO REALIZADO COM SUCESSO!');
  console.log('📊 Resumo do backup:');
  console.log(`- Usuários: ${backup.data.users.length}`);
  console.log(`- Escalas atuais: ${backup.data.currentSchedules.length}`);
  console.log(`- Escalas arquivadas: ${backup.data.archivedSchedules.length}`);
  console.log(`- Solicitações de troca: ${backup.data.swapRequests.length}`);
  console.log(`- Logs de auditoria: ${backup.data.auditLogs.logs?.length || 0}`);
  console.log(`- Solicitações de férias: ${backup.data.vacationRequests.length}`);
  console.log('📁 Arquivo de backup baixado automaticamente');
  
  return backup;
}

function limparSolicitacoes() {
  console.log('🧹 LIMPANDO TODAS AS SOLICITAÇÕES...');
  
  // Limpar solicitações de troca
  localStorage.setItem('escala_swapRequests', JSON.stringify([]));
  
  // Limpar solicitações de férias
  localStorage.setItem('escala_vacationRequests', JSON.stringify([]));
  
  console.log('✅ SOLICITAÇÕES LIMPADAS COM SUCESSO!');
  console.log('- Solicitações de troca: 0');
  console.log('- Solicitações de férias: 0');
}

function resetarSistema() {
  console.log('🔄 RESETANDO SISTEMA...');
  
  // Fazer backup antes de resetar
  fazerBackupCompleto();
  
  // Limpar solicitações
  limparSolicitacoes();
  
  // Limpar logs de auditoria (opcional)
  localStorage.setItem('escala_auditLogs', JSON.stringify({
    logs: [],
    lastCleanup: new Date().toISOString()
  }));
  
  console.log('✅ SISTEMA RESETADO COM SUCESSO!');
  console.log('🔄 Recarregue a página para aplicar as mudanças');
  
  // Recarregar página após 2 segundos
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Função para executar tudo em sequência
function executarBackupReset() {
  console.log('🚀 INICIANDO PROCESSO COMPLETO DE BACKUP E RESET...');
  resetarSistema();
}

// Exportar funções para uso no console
window.fazerBackupCompleto = fazerBackupCompleto;
window.limparSolicitacoes = limparSolicitacoes;
window.resetarSistema = resetarSistema;
window.executarBackupReset = executarBackupReset;

console.log('📋 Funções disponíveis:');
console.log('- fazerBackupCompleto() - Faz backup completo do sistema');
console.log('- limparSolicitacoes() - Limpa todas as solicitações');
console.log('- resetarSistema() - Faz backup e limpa tudo');
console.log('- executarBackupReset() - Executa processo completo');
console.log('');
console.log('🎯 Para executar o processo completo, digite: executarBackupReset()');
