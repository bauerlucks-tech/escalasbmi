// Script para Limpar Todas as Escalas do Sistema
// Execute no console do navegador para limpar todas as escalas

function limparTodasEscalas() {
  console.log('🧹 LIMPANDO TODAS AS ESCALAS DO SISTEMA...');
  
  // Fazer backup antes de limpar
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.2beta',
    data: {
      // Backup de usuários
      users: JSON.parse(localStorage.getItem('escala_users') || '[]'),
      
      // Backup de escalas ANTES de limpar
      scheduleData: JSON.parse(localStorage.getItem('escala_scheduleData') || '[]'),
      currentSchedules: JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]'),
      archivedSchedules: JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]'),
      
      // Backup de solicitações
      swapRequests: JSON.parse(localStorage.getItem('escala_swapRequests') || '[]'),
      
      // Backup de logs
      auditLogs: JSON.parse(localStorage.getItem('escala_auditLogs') || '{}'),
      
      // Backup de férias
      vacationRequests: JSON.parse(localStorage.getItem('escala_vacationRequests') || '[]'),
      
      // Backup do usuário atual
      currentUser: JSON.parse(localStorage.getItem('escala_currentUser') || 'null'),
    }
  };
  
  // Salvar backup no localStorage
  localStorage.setItem('escala_backup_antes_limpar_' + Date.now(), JSON.stringify(backup));
  
  // Criar arquivo de backup para download
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_antes_limpar_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // LIMPAR TODAS AS ESCALAS
  console.log('🗑️ Removendo dados das escalas...');
  
  // Limpar escala atual
  localStorage.setItem('escala_scheduleData', JSON.stringify([]));
  
  // Limpar escalas mensais
  localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
  
  // Limpar escalas arquivadas
  localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
  
  // Limpar logs de auditoria (opcional)
  localStorage.setItem('escala_auditLogs', JSON.stringify({
    logs: [],
    lastCleanup: new Date().toISOString()
  }));
  
  console.log('✅ ESCALAS LIMPADAS COM SUCESSO!');
  console.log('📊 Resumo do que foi limpo:');
  console.log('- Escala atual: 0 dias');
  console.log('- Escalas mensais: 0 meses');
  console.log('- Escalas arquivadas: 0');
  console.log('- Logs de auditoria: 0');
  console.log('💾 Backup salvo automaticamente');
  
  // Recarregar página após 2 segundos
  setTimeout(() => {
    console.log('🔄 Recarregando página para aplicar as mudanças...');
    window.location.reload();
  }, 2000);
  
  return backup;
}

// Função para verificar status atual
function verificarStatusEscalas() {
  console.log('📊 STATUS ATUAL DAS ESCALAS:');
  
  const scheduleData = JSON.parse(localStorage.getItem('escala_scheduleData') || '[]');
  const currentSchedules = JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]');
  const archivedSchedules = JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]');
  const auditLogs = JSON.parse(localStorage.getItem('escala_auditLogs') || '{}');
  
  console.log(`- Escala atual: ${scheduleData.length} dias`);
  console.log(`- Escalas mensais: ${currentSchedules.length} meses`);
  console.log(`- Escalas arquivadas: ${archivedSchedules.length}`);
  console.log(`- Logs de auditoria: ${auditLogs.logs?.length || 0}`);
  
  if (scheduleData.length > 0) {
    console.log('📅 Primeira data:', scheduleData[0]?.date);
    console.log('📅 Última data:', scheduleData[scheduleData.length - 1]?.date);
  }
  
  return {
    scheduleData: scheduleData.length,
    currentSchedules: currentSchedules.length,
    archivedSchedules: archivedSchedules.length,
    auditLogs: auditLogs.logs?.length || 0
  };
}

// Exportar funções para uso no console
window.limparTodasEscalas = limparTodasEscalas;
window.verificarStatusEscalas = verificarStatusEscalas;

console.log('📋 Funções disponíveis:');
console.log('- verificarStatusEscalas() - Verifica status atual das escalas');
console.log('- limparTodasEscalas() - Faz backup e limpa todas as escalas');
console.log('');
console.log('🎯 Para verificar o status atual, digite: verificarStatusEscalas()');
console.log('🗑️ Para limpar tudo, digite: limparTodasEscalas()');
