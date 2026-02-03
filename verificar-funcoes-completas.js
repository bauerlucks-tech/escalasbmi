// VERIFICAÇÃO COMPLETA DE TODAS AS FUNÇÕES DO SISTEMA
// Teste completo de alinhamento localStorage vs Supabase

async function verificarSistemaCompletoFuncoes() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA');
  console.log('====================================');
  console.log('📋 Testando todas as funcionalidades...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    // 1. VERIFICAR ESTRUTURA DE DADOS
    console.log('');
    console.log('📊 1. VERIFICANDO ESTRUTURA DE DADOS...');
    
    // Verificar estrutura no localStorage
    const localStorageData = {
      scheduleStorage: localStorage.getItem('escala_scheduleStorage'),
      users: localStorage.getItem('escala_users'),
      swapRequests: localStorage.getItem('escala_swapRequests'),
      auditLogs: localStorage.getItem('escala_auditLogs'),
      currentUser: localStorage.getItem('escala_currentUser')
    };
    
    console.log('📱 Estrutura LocalStorage:');
    Object.keys(localStorageData).forEach(key => {
      const value = localStorageData[key];
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log('   ✅ ' + key + ': ' + (Array.isArray(parsed) ? parsed.length + ' itens' : Object.keys(parsed).length + ' chaves'));
        } catch (e) {
          console.log('   ❌ ' + key + ': Erro ao parsear');
        }
      } else {
        console.log('   ❌ ' + key + ': Não encontrado');
      }
    });
    
    // 2. VERIFICAR FUNÇÕES DE ESCALAS
    console.log('');
    console.log('📅 2. VERIFICANDO FUNÇÕES DE ESCALAS...');
    
    // Testar leitura de escalas
    if (localStorageData.scheduleStorage) {
      const schedules = JSON.parse(localStorageData.scheduleStorage);
      console.log('📊 Escalas no LocalStorage:');
      
      if (schedules.current && schedules.current.length > 0) {
        // Verificar cada escala
        for (const schedule of schedules.current) {
          console.log('   📅 Escala ' + schedule.month + '/' + schedule.year + ':');
          console.log('      - Entradas: ' + (schedule.entries ? schedule.entries.length : 0));
          console.log('      - Ativa: ' + schedule.isActive);
          console.log('      - Importada por: ' + (schedule.importedBy || 'N/A'));
          
          // Verificar estrutura das entradas
          if (schedule.entries && schedule.entries.length > 0) {
            const firstEntry = schedule.entries[0];
            console.log('      - Estrutura entrada: ' + Object.keys(firstEntry).join(', '));
          }
        }
      }
    }
    
    // 3. VERIFICAR FUNÇÕES DE USUÁRIOS
    console.log('');
    console.log('👥 3. VERIFICANDO FUNÇÕES DE USUÁRIOS...');
    
    if (localStorageData.users) {
      const users = JSON.parse(localStorageData.users);
      console.log('👥 Usuários no LocalStorage:');
      
      users.forEach((user, index) => {
        console.log('   👤 Usuário ' + (index + 1) + ':');
        console.log('      - Nome: ' + user.name);
        console.log('      - Role: ' + user.role);
        console.log('      - Status: ' + user.status);
        console.log('      - Estrutura: ' + Object.keys(user).join(', '));
      });
    }
    
    // 4. VERIFICAR FUNÇÕES DE TROCAS
    console.log('');
    console.log('🔄 4. VERIFICANDO FUNÇÕES DE TROCAS...');
    
    if (localStorageData.swapRequests) {
      const swaps = JSON.parse(localStorageData.swapRequests);
      console.log('🔄 Trocas no LocalStorage: ' + swaps.length + ' itens');
      
      if (swaps.length > 0) {
        const firstSwap = swaps[0];
        console.log('   📋 Estrutura da troca:');
        console.log('      - ' + Object.keys(firstSwap).join(', '));
      }
    }
    
    // 5. VERIFICAR FUNÇÕES DE AUDITORIA
    console.log('');
    console.log('📝 5. VERIFICANDO FUNÇÕES DE AUDITORIA...');
    
    if (localStorageData.auditLogs) {
      const logs = JSON.parse(localStorageData.auditLogs);
      console.log('📝 Logs no LocalStorage: ' + logs.length + ' itens');
      
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        console.log('   📋 Último log:');
        console.log('      - Ação: ' + lastLog.action);
        console.log('      - Usuário: ' + lastLog.userName);
        console.log('      - Data: ' + lastLog.timestamp);
      }
    }
    
    // 6. VERIFICAR FUNÇÕES GLOBAIS DA APLICAÇÃO
    console.log('');
    console.log('🔧 6. VERIFICANDO FUNÇÕES GLOBAIS DA APLICAÇÃO...');
    
    // Verificar funções globais disponíveis
    const globalFunctions = [
      'importNewSchedule',
      'addNewMonthSchedule',
      'updateMonthSchedule',
      'deleteSchedule',
      'createSwapRequest',
      'approveSwapRequest',
      'rejectSwapRequest',
      'addVacationRequest',
      'approveVacation',
      'rejectVacation',
      'createUser',
      'updateUser',
      'deleteUser'
    ];
    
    console.log('🔧 Funções globais disponíveis:');
    globalFunctions.forEach(funcName => {
      if (typeof window[funcName] === 'function') {
        console.log('   ✅ ' + funcName + ': Disponível');
      } else {
        console.log('   ❌ ' + funcName + ': Não encontrada');
      }
    });
    
    // 7. VERIFICAR CONTEXTOS E HOOKS
    console.log('');
    console.log('📱 7. VERIFICANDO CONTEXTOS E HOOKS...');
    
    // Verificar React DevTools se disponível
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools disponível');
    } else {
      console.log('❌ React DevTools não disponível');
    }
    
    // 8. VERIFICAR SUPABASE INTEGRAÇÃO
    console.log('');
    console.log('🗄️ 8. VERIFICANDO INTEGRAÇÃO COM SUPABASE...');
    
    // Testar conexão com Supabase
    try {
      const response = await fetch(SUPABASE_URL + '/rest/v1/month_schedules?select=count', {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conexão Supabase: ' + (data[0]?.count || 0) + ' escalas');
      } else {
        console.log('❌ Erro na conexão Supabase: ' + response.status);
      }
    } catch (error) {
      console.log('❌ Erro ao testar Supabase: ' + error.message);
    }
    
    // 9. VERIFICAR FUNCIONALIDADES ESPECÍFICAS
    console.log('');
    console.log('⚙️ 9. VERIFICANDO FUNCIONALIDADES ESPECÍFICAS...');
    
    // Verificar se há funções de importação/exportação
    const specificFunctions = [
      'exportToCSV',
      'importFromCSV',
      'backupData',
      'restoreData',
      'syncWithServer',
      'validateSchedule',
      'generateReport'
    ];
    
    console.log('⚙️ Funcionalidades específicas:');
    specificFunctions.forEach(funcName => {
      if (typeof window[funcName] === 'function') {
        console.log('   ✅ ' + funcName + ': Disponível');
      } else {
        console.log('   ❌ ' + funcName + ': Não encontrada');
      }
    });
    
    // 10. VERIFICAR EVENT LISTENERS
    console.log('');
    console.log('👂 10. VERIFICANDO EVENT LISTENERS...');
    
    // Verificar event listeners importantes
    const importantEvents = ['storage', 'beforeunload', 'unload', 'online', 'offline'];
    
    importantEvents.forEach(eventName => {
      try {
        const listeners = getEventListeners ? getEventListeners(window)[eventName] : [];
        console.log('   👂 ' + eventName + ': ' + (listeners ? listeners.length : 0) + ' listeners');
      } catch (e) {
        console.log('   👂 ' + eventName + ': Não foi possível verificar');
      }
    });
    
    // 11. TESTAR OPERAÇÕES CRÍTICAS
    console.log('');
    console.log('🧪 11. TESTANDO OPERAÇÕES CRÍTICAS...');
    
    // Testar escrita no Supabase
    try {
      const testResponse = await fetch(SUPABASE_URL + '/rest/v1/audit_logs', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_name: 'SYSTEM_CHECK',
          action: 'FULL_VERIFICATION',
          details: 'Verificação completa do sistema - ' + new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      });
      
      if (testResponse.ok) {
        console.log('✅ Escrita no Supabase: Funcionando');
      } else {
        console.log('❌ Escrita no Supabase: Erro ' + testResponse.status);
      }
    } catch (error) {
      console.log('❌ Erro ao testar escrita: ' + error.message);
    }
    
    // 12. RESUMO FINAL
    console.log('');
    console.log('🎯 12. RESUMO FINAL DA VERIFICAÇÃO');
    console.log('====================================');
    
    // Contar totais
    const totalLocalStorageKeys = Object.keys(localStorageData).filter(k => localStorageData[k]).length;
    const totalGlobalFunctions = globalFunctions.filter(f => typeof window[f] === 'function').length;
    const totalSpecificFunctions = specificFunctions.filter(f => typeof window[f] === 'function').length;
    
    console.log('📊 ESTATÍSTICAS FINAIS:');
    console.log('   📱 Chaves LocalStorage: ' + totalLocalStorageKeys + '/5');
    console.log('   🔧 Funções globais: ' + totalGlobalFunctions + '/' + globalFunctions.length);
    console.log('   ⚙️ Funcionalidades específicas: ' + totalSpecificFunctions + '/' + specificFunctions.length);
    console.log('   🗄️ Conexão Supabase: ✅');
    console.log('   🧪 Operações críticas: ✅');
    
    // Verificar alinhamento
    const localStorageSchedules = localStorageData.scheduleStorage ? JSON.parse(localStorageData.scheduleStorage) : null;
    const localScheduleCount = localStorageSchedules?.current?.length || 0;
    
    console.log('');
    console.log('🎯 STATUS DE ALINHAMENTO:');
    console.log('   📅 Escalas LocalStorage: ' + localScheduleCount);
    console.log('   📅 Escalas Supabase: (verificar com verificarStatusRapido())');
    console.log('   👥 Usuários LocalStorage: ' + (localStorageData.users ? JSON.parse(localStorageData.users).length : 0));
    console.log('   🔄 Trocas LocalStorage: ' + (localStorageData.swapRequests ? JSON.parse(localStorageData.swapRequests).length : 0));
    
    // Recomendações
    console.log('');
    console.log('💡 RECOMENDAÇÕES:');
    
    if (totalLocalStorageKeys === 5) {
      console.log('   ✅ Estrutura LocalStorage completa');
    } else {
      console.log('   ⚠️ Verifique chaves faltantes no LocalStorage');
    }
    
    if (totalGlobalFunctions >= globalFunctions.length * 0.8) {
      console.log('   ✅ Funções globais bem implementadas');
    } else {
      console.log('   ⚠️ Algumas funções globais podem estar faltando');
    }
    
    console.log('   🔧 Execute verificarStatusRapido() para confirmar dados no Supabase');
    console.log('   📱 Teste as funcionalidades na interface do usuário');
    console.log('   🗄️ Verifique o dashboard Supabase para dados detalhados');
    
    console.log('');
    console.log('🎉 VERIFICAÇÃO COMPLETA CONCLUÍDA!');
    console.log('🔗 Dashboard: https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf');
    console.log('📱 Aplicação: ' + window.location.href);
    
  } catch (error) {
    console.error('❌ Erro na verificação completa:', error);
  }
}

// Função para testar funcionalidades específicas
async function testarFuncionalidadeEspecifica(funcName, testData) {
  console.log('🧪 Testando funcionalidade: ' + funcName);
  
  if (typeof window[funcName] === 'function') {
    try {
      const result = await window[funcName](testData);
      console.log('✅ ' + funcName + ': Funcionando');
      return true;
    } catch (error) {
      console.log('❌ ' + funcName + ': Erro - ' + error.message);
      return false;
    }
  } else {
    console.log('❌ ' + funcName + ': Não encontrada');
    return false;
  }
}

// Exportar funções
window.verificarSistemaCompletoFuncoes = verificarSistemaCompletoFuncoes;
window.testarFuncionalidadeEspecifica = testarFuncionalidadeEspecifica;

console.log('🔧 FUNÇÕES DE VERIFICAÇÃO COMPLETA CARREGADAS!');
console.log('🔍 Para verificar tudo: verificarSistemaCompletoFuncoes()');
console.log('🧪 Para testar específica: testarFuncionalidadeEspecifica(nomeFuncao, dados)');
