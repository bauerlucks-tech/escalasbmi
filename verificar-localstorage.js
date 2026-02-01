// VERIFICAÇÃO COMPLETA DO LOCALSTORAGE
// Execute no console para ver todos os dados

function verificarLocalStorageCompleto() {
  console.log('🔍 VERIFICANDO LOCALSTORAGE COMPLETO');
  console.log('=====================================');
  
  // Lista todas as chaves do localStorage
  console.log('📋 CHAVES ENCONTRADAS:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const size = value ? JSON.stringify(value).length : 0;
    console.log('🔑 ' + key + ': ' + size + ' bytes');
  }
  
  // Verificar chaves específicas
  console.log('');
  console.log('📊 ANÁLISE DAS CHAVES PRINCIPAIS:');
  
  const chavesPrincipais = [
    'escala_scheduleStorage',
    'escala_currentSchedules', 
    'escala_scheduleData',
    'escala_swapRequests',
    'escala_vacations',
    'escala_users',
    'escala_archivedSchedules'
  ];
  
  chavesPrincipais.forEach(chave => {
    const valor = localStorage.getItem(chave);
    if (valor) {
      try {
        const dados = JSON.parse(valor);
        console.log('✅ ' + chave + ':');
        console.log('   - Tipo: ' + (Array.isArray(dados) ? 'Array' : typeof dados));
        console.log('   - Tamanho: ' + (Array.isArray(dados) ? dados.length : Object.keys(dados).length));
        
        if (chave === 'escala_scheduleStorage') {
          console.log('   - Current: ' + (dados.current ? dados.current.length : 0));
          console.log('   - Archived: ' + (dados.archived ? dados.archived.length : 0));
        }
        
        if (chave === 'escala_swapRequests') {
          console.log('   - Trocas: ' + dados.length);
          if (dados.length > 0) {
            console.log('   - Exemplo: ' + JSON.stringify(dados[0], null, 2).substring(0, 200) + '...');
          }
        }
        
      } catch (e) {
        console.log('❌ ' + chave + ': Erro ao parsear - ' + e.message);
      }
    } else {
      console.log('❌ ' + chave + ': Não encontrada');
    }
  });
  
  // Verificar se há dados de janeiro/fevereiro
  console.log('');
  console.log('📅 VERIFICANDO ESCALAS ESPECÍFICAS:');
  
  const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
  if (scheduleStorage) {
    try {
      const schedules = JSON.parse(scheduleStorage);
      if (schedules.current && schedules.current.length > 0) {
        schedules.current.forEach((schedule, index) => {
          console.log('📊 Escala ' + (index + 1) + ':');
          console.log('   - Mês/Ano: ' + schedule.month + '/' + schedule.year);
          console.log('   - Ativa: ' + schedule.isActive);
          console.log('   - Entradas: ' + (schedule.entries ? schedule.entries.length : 0));
          console.log('   - Importada por: ' + (schedule.importedBy || 'N/A'));
          if (schedule.entries && schedule.entries.length > 0) {
            console.log('   - Primeiro dia: ' + schedule.entries[0].date);
          }
        });
      } else {
        console.log('❌ Nenhuma escala encontrada em current');
      }
    } catch (e) {
      console.log('❌ Erro ao analisar scheduleStorage: ' + e.message);
    }
  }
  
  console.log('');
  console.log('🎯 CONCLUSÃO:');
  console.log('Se os dados existem mas não migraram, o problema está no script.');
  console.log('Se os dados não existem, precisam ser importados primeiro.');
}

// Função para forçar migração manual
function forcarMigracaoManual() {
  console.log('🔧 FORÇANDO MIGRAÇÃO MANUAL...');
  
  // Criar dados de teste se não existirem
  const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
  if (!scheduleStorage) {
    console.log('📝 Criando dados de teste...');
    
    const dadosTeste = {
      current: [
        {
          month: 1,
          year: 2026,
          entries: [
            {
              date: "01/01/2026",
              dayOfWeek: "QUARTA-FEIRA",
              meioPeriodo: "LUCAS",
              fechamento: "LUCAS"
            },
            {
              date: "02/01/2026", 
              dayOfWeek: "QUINTA-FEIRA",
              meioPeriodo: "CARLOS",
              fechamento: "CARLOS"
            }
          ],
          importedAt: new Date().toISOString(),
          importedBy: "ADMIN",
          isActive: true
        },
        {
          month: 2,
          year: 2026,
          entries: [
            {
              date: "01/02/2026",
              dayOfWeek: "DOMINGO",
              meioPeriodo: "ROSANA",
              fechamento: "ROSANA"
            }
          ],
          importedAt: new Date().toISOString(),
          importedBy: "ADMIN", 
          isActive: true
        }
      ],
      archived: []
    };
    
    localStorage.setItem('escala_scheduleStorage', JSON.stringify(dadosTeste));
    console.log('✅ Dados de teste criados!');
  }
  
  // Executar migração
  if (typeof window.migrarParaSupabase === 'function') {
    window.migrarParaSupabase();
  } else {
    console.log('❌ Função de migração não encontrada. Execute o script primeiro.');
  }
}

// Exportar funções
window.verificarLocalStorage = verificarLocalStorageCompleto;
window.forcarMigracao = forcarMigracaoManual;

console.log('🔧 FUNÇÕES DE VERIFICAÇÃO CARREGADAS!');
console.log('🔍 Para verificar: verificarLocalStorage()');
console.log('🔧 Para forçar migração: forcarMigracao()');
