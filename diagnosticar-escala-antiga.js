// VERIFICAR POR QUE ESCALA ANTIGA VOLTOU
// Script para diagnosticar e identificar causa

function diagnosticarEscalaAntiga() {
  console.log('🔍 DIAGNÓSTICO: POR QUE ESCALA ANTIGA VOLTOU?');
  console.log('=============================================');
  
  try {
    // 1. Verificar dados atuais no localStorage
    console.log('');
    console.log('📱 1. DADOS ATUAIS NO LOCAL STORAGE...');
    
    const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
    
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      console.log(`✅ Encontradas ${schedules.length} escalas:`);
      
      schedules.forEach((schedule, index) => {
        const entriesCount = schedule.entries ? schedule.entries.length : 0;
        const isActive = schedule.isActive !== false ? 'ativo' : 'inativo';
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias (${isActive})`);
        
        // Verificar se dados parecem antigos
        if (schedule.entries && schedule.entries.length > 0) {
          const firstEntry = schedule.entries[0];
          const lastEntry = schedule.entries[schedule.entries.length - 1];
          
          console.log(`      📅 Período: ${firstEntry.date} a ${lastEntry.date}`);
          
          // Verificar se há dados de tripulação
          const hasCrewData = schedule.entries.some(entry => 
            entry.meioPeriodo || entry.fechamento || entry.piloto || entry.coPiloto
          );
          
          if (hasCrewData) {
            console.log(`      👥 Tripulação: Sim (meioPeriodo/fechamento/piloto)`);
          } else {
            console.log(`      👥 Tripulação: Não (apenas datas)`);
          }
        }
      });
    } else {
      console.log('❌ Nenhuma escala encontrada no localStorage');
    }
    
    // 2. Verificar timestamp dos dados
    console.log('');
    console.log('⏰ 2. VERIFICANDO TIMESTAMP DOS DADOS...');
    
    // Verificar se há algum timestamp ou metadata
    const metadataKeys = [
      'escala_lastUpdate',
      'escala_version',
      'escala_timestamp',
      'lastModified',
      'version'
    ];
    
    let foundTimestamp = false;
    metadataKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`✅ ${key}: ${value}`);
        foundTimestamp = true;
      }
    });
    
    if (!foundTimestamp) {
      console.log('❌ Nenhum timestamp encontrado nos metadados');
    }
    
    // 3. Verificar histórico de backups
    console.log('');
    console.log('💾 3. VERIFICANDO HISTÓRICO DE BACKUPS...');
    
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('backup') || key.includes('old') || key.includes('previous'))) {
        backupKeys.push(key);
      }
    }
    
    if (backupKeys.length > 0) {
      console.log(`✅ Encontrados ${backupKeys.length} backups:`);
      backupKeys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          if (parsed.timestamp) {
            console.log(`   📦 ${key}: ${parsed.timestamp}`);
          } else {
            console.log(`   📦 ${key}: ${value.length} chars`);
          }
        } catch {
          console.log(`   📦 ${key}: ${value.length} chars`);
        }
      });
    } else {
      console.log('❌ Nenhum backup encontrado');
    }
    
    // 4. Verificar se há múltiplas versões de dados
    console.log('');
    console.log('🔄 4. VERIFICANDO MÚLTIPLAS VERSÕES...');
    
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('schedule') || key.includes('escala'))) {
        allKeys.push(key);
      }
    }
    
    console.log(`✅ Encontradas ${allKeys.length} chaves relacionadas:`);
    allKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          console.log(`   📋 ${key}: ${parsed.length} itens (array)`);
        } else {
          console.log(`   📋 ${key}: ${typeof parsed} (object)`);
        }
      } catch {
        console.log(`   📋 ${key}: ${value.length} chars (string)`);
      }
    });
    
    // 5. Verificar se dados parecem antigos (conteúdo)
    console.log('');
    console.log('🕰️ 5. ANÁLISE DE CONTEÚDO - DADOS ANTIGOS?');
    
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      
      // Verificar características de dados antigos
      let oldDataIndicators = [];
      
      schedules.forEach(schedule => {
        if (schedule.entries) {
          // Verificar se há nomes específicos que indicam dados antigos
          const oldNames = ['ADMIN', 'CARLOS', 'JOÃO', 'PEDRO'];
          const hasOldNames = schedule.entries.some(entry => 
            oldNames.some(name => 
              entry.meioPeriodo === name || 
              entry.fechamento === name ||
              entry.piloto === name ||
              entry.coPiloto === name
            )
          );
          
          if (hasOldNames) {
            oldDataIndicators.push(`Nomes antigos em ${schedule.month}/${schedule.year}`);
          }
          
          // Verificar se há padrões de dados antigos
          const hasEmptyEntries = schedule.entries.some(entry => 
            !entry.meioPeriodo && !entry.fechamento && !entry.piloto && !entry.coPiloto
          );
          
          if (hasEmptyEntries) {
            oldDataIndicators.push(`Entradas vazias em ${schedule.month}/${schedule.year}`);
          }
          
          // Verificar formato de data
          const hasOldDateFormat = schedule.entries.some(entry => 
            entry.date && !entry.date.includes('/') && !entry.date.includes('-')
          );
          
          if (hasOldDateFormat) {
            oldDataIndicators.push(`Formato de data antigo em ${schedule.month}/${schedule.year}`);
          }
        }
      });
      
      if (oldDataIndicators.length > 0) {
        console.log('⚠️ INDICADORES DE DADOS ANTIGOS:');
        oldDataIndicators.forEach(indicator => console.log(`   📍 ${indicator}`));
      } else {
        console.log('✅ Não há indicadores óbvios de dados antigos');
      }
    }
    
    // 6. Verificar causa provável
    console.log('');
    console.log('🎯 6. CAUSAS PROVÁVEIS...');
    
    console.log('💡 Possíveis causas da escala antiga voltar:');
    console.log('   1. Reload automático após login resetou localStorage');
    console.log('   2. Código de inicialização recriou dados padrão');
    console.log('   3. Backup automático restaurou versão antiga');
    console.log('   4. Sync com Supabase sobrescreveu dados locais');
    console.log('   5. Cache do navegador restaurou versão antiga');
    
    // 7. Sugestões de solução
    console.log('');
    console.log('🔧 7. SOLUÇÕES SUGERIDAS...');
    
    if (scheduleStorage) {
      console.log('✅ OPÇÃO 1: Exportar dados atuais para backup');
      console.log('   → exportarDadosAtuais()');
      console.log('');
      console.log('✅ OPÇÃO 2: Verificar se há backup mais recente');
      console.log('   → procurarBackupRecente()');
      console.log('');
      console.log('✅ OPÇÃO 3: Limpar e recriar do zero');
      console.log('   → limparERecomecar()');
    } else {
      console.log('❌ Nenhum dado encontrado para exportar');
      console.log('🔧 Sugestão: Recriar escalas do zero');
    }
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
  }
}

// Função para exportar dados atuais
function exportarDadosAtuais() {
  console.log('💾 EXPORTANDO DADOS ATUAIS...');
  console.log('============================');
  
  const data = {
    timestamp: new Date().toISOString(),
    schedules: localStorage.getItem('escala_scheduleStorage'),
    users: localStorage.getItem('escala_users'),
    allKeys: {}
  };
  
  // Salvar todas as chaves relacionadas
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('escala') || key.includes('schedule') || key.includes('user'))) {
      data.allKeys[key] = localStorage.getItem(key);
    }
  }
  
  // Mostrar para copiar
  const dataStr = JSON.stringify(data, null, 2);
  console.log('📋 DADOS EXPORTADOS (copie e salve):');
  console.log('=====================================');
  console.log(dataStr);
  console.log('=====================================');
  
  // Também salvar no localStorage
  localStorage.setItem('escala_export_' + Date.now(), dataStr);
  console.log('✅ Dados também salvos no localStorage');
}

// Função para procurar backup recente
function procurarBackupRecente() {
  console.log('🔍 PROCURANDO BACKUP MAIS RECENTE...');
  console.log('=================================');
  
  const backupKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('backup') || key.includes('export'))) {
      backupKeys.push(key);
    }
  }
  
  if (backupKeys.length === 0) {
    console.log('❌ Nenhum backup encontrado');
    return;
  }
  
  console.log(`✅ Encontrados ${backupKeys.length} backups:`);
  
  // Ordenar por timestamp (se houver)
  backupKeys.sort((a, b) => {
    const aTime = parseInt(a.split('_').pop()) || 0;
    const bTime = parseInt(b.split('_').pop()) || 0;
    return bTime - aTime; // Mais recente primeiro
  });
  
  backupKeys.forEach((key, index) => {
    const value = localStorage.getItem(key);
    console.log(`   ${index + 1}. ${key}`);
    
    try {
      const parsed = JSON.parse(value);
      if (parsed.timestamp) {
        console.log(`      📅 ${parsed.timestamp}`);
      }
      if (parsed.schedules) {
        try {
          const schedules = JSON.parse(parsed.schedules);
          console.log(`      📋 ${schedules.length} escalas`);
        } catch {
          console.log(`      📋 Dados de escalas presentes`);
        }
      }
    } catch {
      console.log(`      📦 ${value.length} caracteres`);
    }
  });
  
  console.log('');
  console.log('💡 Para restaurar um backup:');
  console.log('   → restaurarBackup("nome_do_backup")');
}

// Função para limpar e recomeçar
function limparERecomecar() {
  console.log('🗑️ LIMPANDO DADOS PARA RECOMEÇAR...');
  console.log('================================');
  
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('escala') || key.includes('schedule'))) {
      keysToRemove.push(key);
    }
  }
  
  console.log(`🗑️ Removendo ${keysToRemove.length} chaves:`);
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   🗑️ ${key}`);
  });
  
  console.log('✅ Dados limpos! Recarregue a página para recomeçar.');
}

// Exportar funções
window.diagnosticarEscalaAntiga = diagnosticarEscalaAntiga;
window.exportarDadosAtuais = exportarDadosAtuais;
window.procurarBackupRecente = procurarBackupRecente;
window.limparERecomecar = limparERecomecar;

console.log('🔧 FERRAMENTAS DE DIAGNÓSTICO CARREGADAS!');
console.log('📋 Para diagnosticar: diagnosticarEscalaAntiga()');
console.log('💾 Para exportar: exportarDadosAtuais()');
console.log('🔍 Para procurar backup: procurarBackupRecente()');
console.log('🗑️ Para limpar: limparERecomecar()');
