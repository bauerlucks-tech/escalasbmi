// Script para Corrigir Funções do Painel Super Admin
// Execute no console do navegador para corrigir as funções do painel

function corrigirFuncoesBackup() {
  console.log('🔧 CORRIGINDO FUNÇÕES DO PAINEL SUPER ADMIN...');
  console.log('='.repeat(50));
  
  // 1. Verificar estado atual do sistema
  console.log('\n📊 VERIFICANDO ESTADO ATUAL:');
  
  const dadosAtuais = {
    schedules: localStorage.getItem('escala_scheduleStorage'),
    currentSchedules: localStorage.getItem('escala_currentSchedules'),
    archivedSchedules: localStorage.getItem('escala_archivedSchedules'),
    scheduleData: localStorage.getItem('escala_scheduleData'),
    swapRequests: localStorage.getItem('escala_swapRequests'),
    users: localStorage.getItem('escala_users'),
    vacations: localStorage.getItem('escala_vacations'),
    auditLogs: localStorage.getItem('escala_auditLogs')
  };
  
  Object.entries(dadosAtuais).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const size = value ? JSON.parse(value).length : 0;
    console.log(`${status} ${key}: ${size} itens`);
  });
  
  // 2. Função para criar backup completo
  window.criarBackupCompleto = function() {
    console.log('💾 CRIANDO BACKUP COMPLETO...');
    
    try {
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
      a.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ Backup criado e baixado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      return false;
    }
  };
  
  // 3. Função para limpar escalas
  window.limparEscalasCorrigido = function() {
    console.log('🧹 LIMPANDO ESCALAS...');
    
    try {
      // Criar backup antes de limpar
      window.criarBackupCompleto();
      
      // Limpar escalas
      localStorage.setItem('escala_scheduleStorage', JSON.stringify({current: [], archived: []}));
      localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
      localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
      localStorage.setItem('escala_scheduleData', JSON.stringify([]));
      
      console.log('✅ Escalas limpas com sucesso!');
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar escalas:', error);
      return false;
    }
  };
  
  // 4. Função para preparar importação do ano
  window.prepararImportacaoAno = function() {
    console.log('📅 PREPARANDO IMPORTAÇÃO DO ANO...');
    
    try {
      // Criar backup antes de limpar
      window.criarBackupCompleto();
      
      // Limpar escalas existentes
      localStorage.setItem('escala_scheduleStorage', JSON.stringify({current: [], archived: []}));
      localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
      localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
      localStorage.setItem('escala_scheduleData', JSON.stringify([]));
      
      console.log('✅ Sistema preparado para importação!');
      console.log('📋 Instruções: Importe os CSVs em ordem:');
      console.log('1. Janeiro → 2. Fevereiro → 3. Março → ... → 12. Dezembro');
      
      // Redirecionar para aba de administração após 2 segundos
      setTimeout(() => {
        window.location.href = '/?tab=admin';
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao preparar importação:', error);
      return false;
    }
  };
  
  // 5. Função para restaurar backup
  window.restaurarBackupCorrigido = function(file) {
    console.log('🔄 RESTAURANDO BACKUP...');
    
    if (!file) {
      console.error('❌ Nenhum arquivo selecionado');
      return false;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Restaurar dados
          if (backup.data) {
            Object.entries(backup.data).forEach(([key, value]) => {
              const storageKey = `escala_${key}`;
              localStorage.setItem(storageKey, JSON.stringify(value));
            });
          }
          
          console.log('✅ Backup restaurado com sucesso!');
          
          // Recarregar página após 2 segundos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
        } catch (parseError) {
          console.error('❌ Erro ao processar backup:', parseError);
        }
      };
      
      reader.readAsText(file);
      return true;
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      return false;
    }
  };
  
  // 6. Adicionar botões de correção na página
  setTimeout(() => {
    const backupPage = document.querySelector('[class*="min-h-screen"]');
    if (backupPage) {
      const correctionDiv = document.createElement('div');
      correctionDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; z-index: 9999; background: #1e293b; padding: 15px; border-radius: 8px; color: white; font-family: system-ui;">
          <h4 style="margin: 0 0 10px 0; color: #f59e0b;">🔧 CORREÇÕES DISPONÍVEIS</h4>
          <button onclick="criarBackupCompleto()" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
            💾 Criar Backup Corrigido
          </button>
          <button onclick="limparEscalasCorrigido()" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🧹 Limpar Escalas Corrigido
          </button>
          <button onclick="prepararImportacaoAno()" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📅 Preparar Importação Ano
          </button>
          <input type="file" id="backup-file-input" accept=".json" style="display: none;" onchange="restaurarBackupCorrigido(this.files[0])">
          <button onclick="document.getElementById('backup-file-input').click()" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🔄 Restaurar Backup Corrigido
          </button>
        </div>
      `;
      document.body.appendChild(correctionDiv);
    }
  }, 1000);
  
  console.log('\n✅ FUNÇÕES CORRIGIDAS E DISPONÍVEIS!');
  console.log('🎯 Botões de correção adicionados à página');
  console.log('\n📋 FUNÇÕES DISPONÍVEIS:');
  console.log('- criarBackupCompleto() - Cria backup completo');
  console.log('- limparEscalasCorrigido() - Limpa escalas com backup');
  console.log('- prepararImportacaoAno() - Prepara sistema para importação');
  console.log('- restaurarBackupCorrigido(file) - Restaura backup');
}

// Exportar função principal
window.corrigirFuncoesBackup = corrigirFuncoesBackup;

console.log('🔧 FUNÇÃO DE CORREÇÃO CARREGADA!');
console.log('🎯 Para executar as correções, digite: corrigirFuncoesBackup()');
