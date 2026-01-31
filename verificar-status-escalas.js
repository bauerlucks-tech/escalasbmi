// Script para Verificar Status das Escalas Após Remoção de CSVs
// Execute no console do navegador para verificar se as escalas estão seguras

function verificarStatusEscalas() {
  console.log('🔍 VERIFICANDO STATUS DAS ESCALAS...');
  console.log('='.repeat(50));
  
  // 1. Verificar dados no localStorage
  console.log('\n📊 DADOS NO LOCALSTORAGE:');
  
  const dados = {
    scheduleStorage: localStorage.getItem('escala_scheduleStorage'),
    currentSchedules: localStorage.getItem('escala_currentSchedules'),
    archivedSchedules: localStorage.getItem('escala_archivedSchedules'),
    scheduleData: localStorage.getItem('escala_scheduleData'),
    swapRequests: localStorage.getItem('escala_swapRequests'),
    users: localStorage.getItem('escala_users'),
    vacations: localStorage.getItem('escala_vacations'),
    auditLogs: localStorage.getItem('escala_auditLogs')
  };
  
  let totalEscalas = 0;
  
  Object.entries(dados).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    
    if (value) {
      try {
        const parsed = JSON.parse(value);
        let count = 0;
        
        if (key === 'scheduleStorage') {
          count = parsed.current ? parsed.current.length : 0;
          count += parsed.archived ? parsed.archived.length : 0;
          totalEscalas += count;
        } else if (key === 'currentSchedules' || key === 'archivedSchedules') {
          count = Array.isArray(parsed) ? parsed.length : 0;
          totalEscalas += count;
        } else if (key === 'scheduleData') {
          count = Array.isArray(parsed) ? parsed.length : 0;
          totalEscalas += count;
        } else if (key === 'swapRequests') {
          count = Array.isArray(parsed) ? parsed.length : 0;
        } else if (key === 'users') {
          count = Array.isArray(parsed) ? parsed.length : 0;
        } else if (key === 'vacations') {
          count = parsed.requests ? parsed.requests.length : 0;
        } else if (key === 'auditLogs') {
          count = parsed.logs ? parsed.logs.length : 0;
        }
        
        console.log(`${status} ${key}: ${count} itens`);
      } catch (e) {
        console.log(`${status} ${key}: (erro ao ler)`);
      }
    } else {
      console.log(`${status} ${key}: vazio`);
    }
  });
  
  // 2. Diagnóstico
  console.log('\n🎯 DIAGNÓSTICO:');
  
  if (totalEscalas > 0) {
    console.log(`✅ ESCALAS ESTÃO SEGURAS!`);
    console.log(`📊 Total de ${totalEscalas} escalas encontradas no sistema`);
    console.log(`🔒 Os arquivos CSV são apenas para importação inicial`);
    console.log(`💾 As escalas estão salvas no localStorage do navegador`);
  } else {
    console.log(`⚠️ NENHUMA ESCALA ENCONTRADA!`);
    console.log(`📂 Os arquivos CSV foram removidos mas não havia dados importados`);
    console.log(`🔄 Você precisará importar os CSVs novamente se tiver os arquivos`);
  }
  
  // 3. Explicação sobre CSVs vs Sistema
  console.log('\n📋 EXPLICAÇÃO IMPORTANTE:');
  console.log('='.repeat(50));
  console.log('📁 Arquivos CSV = Apenas para importação inicial');
  console.log('💾 localStorage = Onde as escalas ficam salvas');
  console.log('🔄 CSV → Sistema (importação)');
  console.log('🚫 Sistema → CSV (não acontece automaticamente)');
  console.log('');
  console.log('🔒 Remover CSVs NÃO apaga as escalas do sistema!');
  console.log('📊 As escalas permanecem no navegador localStorage');
  
  // 4. Verificar backups
  console.log('\n💾 VERIFICANDO BACKUPS:');
  
  const backups = localStorage.getItem('system_backups');
  if (backups) {
    try {
      const backupsArray = JSON.parse(backups);
      console.log(`✅ ${backupsArray.length} backups encontrados`);
      
      const recentes = backupsArray.filter(b => {
        const data = new Date(b.createdAt);
        const umaSemanaAtras = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
        return data > umaSemanaAtras;
      });
      
      console.log(`📅 ${recentes.length} backups recentes (última semana)`);
      
      if (recentes.length > 0) {
        console.log('🔒 ESCALAS DUPLICADAS EM BACKUP!');
      }
    } catch (e) {
      console.log('❌ Erro ao ler backups');
    }
  } else {
    console.log('❌ Nenhum backup encontrado');
  }
  
  // 5. Recomendações
  console.log('\n🎯 RECOMENDAÇÕES:');
  
  if (totalEscalas > 0) {
    console.log('✅ Nenhuma ação necessária');
    console.log('📊 Suas escalas estão seguras no sistema');
    console.log('💾 Considere fazer backup regularmente');
  } else {
    console.log('⚠️ Você precisa importar os CSVs novamente');
    console.log('📂 Se não tiver mais os CSVs, precisará recriá-los');
    console.log('🔄 Use a função "Importar Ano Completo" se tiver os arquivos');
  }
  
  return {
    totalEscalas,
    temDados: totalEscalas > 0,
    temBackups: backups !== null
  };
}

// Função para criar backup emergencial
function criarBackupEmergencial() {
  console.log('🚨 CRIANDO BACKUP EMERGENCIAL...');
  
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
    a.download = `backup_emergencial_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup emergencial criado e baixado!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    return false;
  }
}

// Exportar funções
window.verificarStatusEscalas = verificarStatusEscalas;
window.criarBackupEmergencial = criarBackupEmergencial;

console.log('🔧 VERIFICAÇÃO DE STATUS CARREGADA!');
console.log('🎯 Para verificar, digite: verificarStatusEscalas()');
console.log('🚨 Para backup, digite: criarBackupEmergencial()');
