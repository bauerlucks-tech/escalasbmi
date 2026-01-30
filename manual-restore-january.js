// RESTAURAÇÃO MANUAL IMEDIATA DE JANEIRO
// Execute este script diretamente no console do navegador

console.log('🚀 RESTAURAÇÃO MANUAL DE JANEIRO - EXECUÇÃO IMEDIATA');

try {
  // 1. Importar dados completos de Janeiro
  const januaryData = [
    { date: "01/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "CARLOS" },
    { date: "02/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "ROSANA" },
    { date: "03/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
    { date: "04/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
    { date: "05/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "ROSANA", fechamento: "KELLY" },
    { date: "06/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
    { date: "07/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
    { date: "08/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
    { date: "09/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
    { date: "10/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
    { date: "11/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
    { date: "12/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "LUCAS", fechamento: "ROSANA" },
    { date: "13/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
    { date: "14/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
    { date: "15/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
    { date: "16/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
    { date: "17/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
    { date: "18/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
    { date: "19/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
    { date: "20/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
    { date: "21/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
    { date: "22/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
    { date: "23/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
    { date: "24/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
    { date: "25/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
    { date: "26/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
    { date: "27/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
    { date: "28/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
    { date: "29/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
    { date: "30/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
    { date: "31/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "CARLOS", fechamento: "ROSANA" }
  ];

  console.log('📦 Dados de Janeiro carregados:', januaryData.length, 'dias');

  // 2. Criar storage completo
  let storage = { current: [], archived: [] };
  
  // Verificar se já existe algo no localStorage
  const existingStorage = localStorage.getItem('escala_scheduleStorage');
  if (existingStorage) {
    try {
      storage = JSON.parse(existingStorage);
      console.log('📋 Storage existente carregado:', storage.current.length, 'escalas');
    } catch (e) {
      console.log('⚠️ Erro ao carregar storage existente, usando novo');
    }
  }

  // 3. Adicionar ou atualizar Janeiro
  const januarySchedule = {
    month: 1,
    year: 2026,
    entries: januaryData,
    importedAt: new Date().toISOString(),
    importedBy: 'manual_restore_script',
    isActive: true
  };

  const existingJanuaryIndex = storage.current.findIndex(s => s.month === 1 && s.year === 2026);
  
  if (existingJanuaryIndex >= 0) {
    console.log('🔄 Atualizando Janeiro existente...');
    storage.current[existingJanuaryIndex] = januarySchedule;
  } else {
    console.log('➕ Adicionando novo Janeiro...');
    storage.current.push(januarySchedule);
  }

  // 4. Salvar no localStorage
  localStorage.setItem('escala_scheduleStorage', JSON.stringify(storage));
  console.log('💾 Janeiro salvo no localStorage');

  // 5. Também salvar no escala_scheduleData para compatibilidade
  localStorage.setItem('escala_scheduleData', JSON.stringify(januaryData));
  console.log('💾 Janeiro salvo em escala_scheduleData');

  // 6. Forçar reload da página para aplicar mudanças
  console.log('🔄 Dados salvos com sucesso!');
  console.log('📊 Total de dias:', januaryData.length);
  console.log('👥 Operadores:', [...new Set(januaryData.map(d => d.meioPeriodo).concat(januaryData.map(d => d.fechamento)))].filter(n => n && n !== '').join(', '));
  
  console.log('\n✅ JANEIRO RESTAURADO MANUALMENTE!');
  console.log('🔄 RECAREGUE A PÁGINA PARA VER AS MUDANÇAS');
  console.log('🔧 Ou execute: location.reload()');
  
  // Função para reload imediato
  window.recarregarPagina = function() {
    console.log('🔄 Recarregando página...');
    location.reload();
  };

} catch (error) {
  console.error('❌ Erro na restauração manual:', error);
}
