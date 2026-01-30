// FERRAMENTA DE RECUPERAÇÃO DE DADOS DE JANEIRO
// Execute este script no console do navegador para tentar recuperar dados perdidos

console.log('🔍 INICIANDO RECUPERAÇÃO DE DADOS DE JANEIRO...');

// 1. Verificar todos os itens do localStorage relacionados à escala
console.log('\n📋 ITENS DO LOCALSTORAGE:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.includes('escala') || key.includes('schedule') || key.includes('swap')) {
    const value = localStorage.getItem(key);
    console.log(`🔑 ${key}:`, value ? `${value.length} caracteres` : 'NULL');
    
    // Tentar fazer parse se for JSON
    try {
      const parsed = JSON.parse(value);
      if (parsed.current && Array.isArray(parsed.current)) {
        console.log(`📅 Escalas encontradas: ${parsed.current.length}`);
        parsed.current.forEach((schedule, index) => {
          console.log(`  ${index + 1}. Mês ${schedule.month}/${schedule.year} - ${schedule.entries?.length || 0} entradas`);
          if (schedule.month === 1 && schedule.year === 2026) {
            console.log(`    ✅ JANEIRO ENCONTRADO!`);
            console.log(`    📊 Dados:`, schedule.entries.slice(0, 3)); // Primeiros 3 dias
          }
        });
      }
    } catch (e) {
      console.log(`❌ Erro ao parsear ${key}:`, e.message);
    }
  }
}

// 2. Verificar se há dados de Janeiro em algum lugar
console.log('\n🔍 PROCURANDO DADOS DE JANEIRO...');

// Tentar encontrar dados de Janeiro em diferentes fontes
const januaryDataSources = [
  'escala_scheduleStorage',
  'escala_scheduleData',
  'escala_swapRequests',
  'scheduleStorage',
  'scheduleData'
];

let foundJanuary = false;
let recoveredData = null;

januaryDataSources.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      
      // Procurar por Janeiro em diferentes estruturas
      if (parsed.current && Array.isArray(parsed.current)) {
        const january = parsed.current.find(s => s.month === 1 && s.year === 2026);
        if (january && january.entries && january.entries.length > 0) {
          console.log(`✅ JANEIRO ENCONTRADO EM ${key}:`);
          console.log(`📊 ${january.entries.length} entradas`);
          console.log(`📅 Exemplo:`, january.entries[0]);
          foundJanuary = true;
          recoveredData = january.entries;
        }
      }
      
      // Verificar se o próprio array é Janeiro
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstEntry = parsed[0];
        if (firstEntry.date && firstEntry.date.includes('/01/2026')) {
          console.log(`✅ JANEIRO ENCONTRADO DIRETO EM ${key}:`);
          console.log(`📊 ${parsed.length} entradas`);
          console.log(`📅 Exemplo:`, firstEntry);
          foundJanuary = true;
          recoveredData = parsed;
        }
      }
    } catch (e) {
      // Ignorar erros de parse
    }
  }
});

// 3. Se encontrou dados, oferecer restauração
if (foundJanuary && recoveredData) {
  console.log('\n🎉 DADOS DE JANEIRO RECUPERADOS!');
  console.log(`📊 Total de ${recoveredData.length} dias recuperados`);
  
  // Mostrar alguns exemplos
  console.log('\n📋 EXEMPLOS DE DIAS RECUPERADOS:');
  recoveredData.slice(0, 5).forEach((day, index) => {
    console.log(`${index + 1}. ${day.date} - ${day.meioPeriodo} / ${day.fechamento}`);
  });
  
  // Criar função de restauração
  window.recuperarJaneiro = function() {
    try {
      // Importar dados originais para comparação
      const originalData = [
        { date: "01/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "CARLOS" },
        { date: "02/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "ROSANA" },
        { date: "03/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
        { date: "04/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
        { date: "05/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "ROSANA", fechamento: "KELLY" },
        // ... (continua com todos os dias)
      ];
      
      // Usar dados recuperados se forem mais completos
      const dataToRestore = recoveredData.length >= originalData.length ? recoveredData : originalData;
      
      // Criar storage atualizado
      const currentStorage = localStorage.getItem('escala_scheduleStorage');
      let storage = currentStorage ? JSON.parse(currentStorage) : { current: [], archived: [] };
      
      // Atualizar ou adicionar Janeiro
      const januaryIndex = storage.current.findIndex(s => s.month === 1 && s.year === 2026);
      const newJanuary = {
        month: 1,
        year: 2026,
        entries: dataToRestore,
        importedAt: new Date().toISOString(),
        importedBy: 'recovery_tool',
        isActive: true
      };
      
      if (januaryIndex >= 0) {
        storage.current[januaryIndex] = newJanuary;
      } else {
        storage.current.push(newJanuary);
      }
      
      // Salvar no localStorage
      localStorage.setItem('escala_scheduleStorage', JSON.stringify(storage));
      
      console.log('✅ JANEIRO RESTAURADO COM SUCESSO!');
      console.log('🔄 Recarregue a página para ver os dados restaurados');
      
      return true;
    } catch (error) {
      console.error('❌ ERRO AO RESTAURAR JANEIRO:', error);
      return false;
    }
  };
  
  console.log('\n🔧 PARA RESTAURAR JANEIRO, EXECUTE:');
  console.log('recuperarJaneiro()');
  
} else {
  console.log('\n❌ DADOS DE JANEIRO NÃO ENCONTRADOS');
  console.log('🔍 Opções disponíveis:');
  console.log('1. Usar dados padrão do sistema');
  console.log('2. Importar de backup (se existir)');
  console.log('3. Digitar dados manualmente');
}

console.log('\n🏁 FIM DA VERIFICAÇÃO');
