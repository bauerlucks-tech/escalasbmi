// Script para Corrigir Definitivamente Erro 404 ao Limpar Escalas
// Execute no console do navegador para limpar escalas sem erros

function limparEscalasSeguro() {
  console.log('🧹 LIMPANDO ESCALAS - MODO SEGURO...');
  console.log('='.repeat(50));
  
  try {
    // 1. Criar backup completo antes de limpar
    console.log('💾 Criando backup de segurança...');
    
    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        scheduleStorage: JSON.parse(localStorage.getItem('escala_scheduleStorage') || '{"current":[],"archived":[]}'),
        currentSchedules: JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]'),
        archivedSchedules: JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]'),
        scheduleData: JSON.parse(localStorage.getItem('escala_scheduleData') || '[]'),
        swapRequests: JSON.parse(localStorage.getItem('escala_swapRequests') || '[]'),
        users: JSON.parse(localStorage.getItem('escala_users') || '[]'),
        vacations: JSON.parse(localStorage.getItem('escala_vacations') || '{"requests":[]}'),
        auditLogs: JSON.parse(localStorage.getItem('escala_auditLogs') || '{"logs":[],"lastCleanup":"' + new Date().toISOString() + '"}')
      }
    };
    
    // Download do backup
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_antes_limpar_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup criado e baixado com sucesso!');
    
    // 2. Limpar escalas SEM RECARREGAR PÁGINA
    console.log('🧹 Limpando dados das escalas...');
    
    localStorage.setItem('escala_scheduleStorage', JSON.stringify({current: [], archived: []}));
    localStorage.setItem('escala_scheduleData', JSON.stringify([]));
    localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
    localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
    
    // 3. Limpar logs de auditoria
    console.log('📋 Limpando logs de auditoria...');
    
    localStorage.setItem('escala_auditLogs', JSON.stringify({
      logs: [],
      lastCleanup: new Date().toISOString()
    }));
    
    console.log('✅ Escalas limpas com sucesso!');
    console.log('📊 Status final:');
    console.log('  - scheduleStorage: ' + JSON.parse(localStorage.getItem('escala_scheduleStorage') || '{}').current.length + ' escalas atuais');
    console.log('  - scheduleData: ' + JSON.parse(localStorage.getItem('escala_scheduleData') || '[]').length + ' entradas');
    console.log('  - currentSchedules: ' + JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]').length + ' escalas');
    console.log('  - auditLogs: ' + JSON.parse(localStorage.getItem('escala_auditLogs') || '{"logs":[]}').logs.length + ' logs');
    
    // 4. Mostrar notificação de sucesso
    if (window.toast) {
      window.toast.success('Escalas limpas com sucesso! Backup criado automaticamente.');
    } else {
      alert('✅ Escalas limpas com sucesso! Backup foi baixado automaticamente.');
    }
    
    // 5. Atualizar interface sem recarregar página
    console.log('🔄 Atualizando interface...');
    
    // Disparar evento de storage para atualizar componentes
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'escala_scheduleStorage',
      newValue: JSON.stringify({current: [], archived: []})
    }));
    
    console.log('✅ Interface atualizada sem recarregar página!');
    console.log('🎯 ESCALAS LIMPAS COM SUCESSO - SEM ERRO 404!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao limpar escalas:', error);
    
    if (window.toast) {
      window.toast.error('Erro ao limpar escalas: ' + error.message);
    } else {
      alert('❌ Erro ao limpar escalas: ' + error.message);
    }
    
    return false;
  }
}

// Função para preparar importação do ano
function prepararImportacaoAnoSeguro() {
  console.log('📅 PREPARANDO IMPORTAÇÃO DO ANO - MODO SEGURO...');
  console.log('='.repeat(50));
  
  try {
    // 1. Criar backup
    console.log('💾 Criando backup antes de preparar...');
    
    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        scheduleStorage: JSON.parse(localStorage.getItem('escala_scheduleStorage') || '{"current":[],"archived":[]}'),
        currentSchedules: JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]'),
        archivedSchedules: JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]'),
        scheduleData: JSON.parse(localStorage.getItem('escala_scheduleData') || '[]'),
        swapRequests: JSON.parse(localStorage.getItem('escala_swapRequests') || '[]'),
        users: JSON.parse(localStorage.getItem('escala_users') || '[]'),
        vacations: JSON.parse(localStorage.getItem('escala_vacations') || '{"requests":[]}'),
        auditLogs: JSON.parse(localStorage.getItem('escala_auditLogs') || '{"logs":[],"lastCleanup":"' + new Date().toISOString() + '"}')
      }
    };
    
    // Download do backup
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_preparar_importacao_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup criado com sucesso!');
    
    // 2. Limpar escalas SEM RECARREGAR
    console.log('🧹 Limpando escalas para importação...');
    
    localStorage.setItem('escala_scheduleStorage', JSON.stringify({current: [], archived: []}));
    localStorage.setItem('escala_scheduleData', JSON.stringify([]));
    localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
    localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
    
    console.log('✅ Sistema preparado para importação!');
    
    // 3. Mostrar instruções
    if (window.toast) {
      window.toast.info('Sistema preparado! Importe os CSVs em ordem: Janeiro → Fevereiro → Março → ... → Dezembro');
      setTimeout(() => {
        window.toast.success('Vá para aba Admin e importe os arquivos CSV');
      }, 2000);
    } else {
      alert('✅ Sistema preparado para importação! Vá para aba Admin e importe os CSVs em ordem.');
    }
    
    console.log('📋 Instruções:');
    console.log('1. Vá para aba Admin');
    console.log('2. Importe os CSVs em ordem: Janeiro → Fevereiro → Março → ... → Dezembro');
    console.log('3. Aguarde confirmação de cada importação');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao preparar importação:', error);
    
    if (window.toast) {
      window.toast.error('Erro ao preparar importação: ' + error.message);
    } else {
      alert('❌ Erro ao preparar importação: ' + error.message);
    }
    
    return false;
  }
}

// Adicionar botões de correção na página
function adicionarBotoesCorrecao() {
  // Remover botões existentes se houver
  const existingDiv = document.getElementById('correcao-escalas-div');
  if (existingDiv) {
    existingDiv.remove();
  }
  
  const correctionDiv = document.createElement('div');
  correctionDiv.id = 'correcao-escalas-div';
  correctionDiv.innerHTML = `
    <div style="position: fixed; top: 80px; right: 20px; z-index: 9999; background: #1e293b; padding: 15px; border-radius: 8px; color: white; font-family: system-ui; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h4 style="margin: 0 0 10px 0; color: #ef4444;">🚨 CORREÇÃO 404</h4>
      <p style="margin: 0 0 10px 0; font-size: 12px;">Use estes botões para evitar erro 404:</p>
      <button onclick="limparEscalasSeguro()" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
        🧹 Limpar Escalas (Sem Erro 404)
      </button>
      <button onclick="prepararImportacaoAnoSeguro()" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
        📅 Preparar Importação (Sem Erro 404)
      </button>
      <button onclick="document.getElementById('correcao-escalas-div').style.display='none'" style="display: block; width: 100%; margin: 5px 0; padding: 6px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
        ✖️ Ocultar
      </button>
    </div>
  `;
  document.body.appendChild(correctionDiv);
}

// Exportar funções
window.limparEscalasSeguro = limparEscalasSeguro;
window.prepararImportacaoAnoSeguro = prepararImportacaoAnoSeguro;
window.adicionarBotoesCorrecao = adicionarBotoesCorrecao;

// Adicionar botões automaticamente
setTimeout(adicionarBotoesCorrecao, 2000);

console.log('🔧 CORREÇÃO 404 CARREGADA!');
console.log('🎯 Funções disponíveis:');
console.log('- limparEscalasSeguro() - Limpa escalas sem erro 404');
console.log('- prepararImportacaoAnoSeguro() - Prepara importação sem erro 404');
console.log('- adicionarBotoesCorrecao() - Mostra botões de correção');
console.log('');
console.log('🚨 Botões de correção adicionados à página!');
