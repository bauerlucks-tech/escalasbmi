// Script para inserir escalas do CSV no sistema interno
// Execute este script no console do navegador após fazer login como admin

function inserirEscalasDoCSV() {
  console.log('🔍 INSERINDO ESCALAS DO CSV NO SISTEMA INTERNO...');
  
  // Dados do CSV fornecido
  const csvData = `01/01/2026,meio_periodo,CARLOS
01/01/2026,fechamento,CARLOS
02/01/2026,meio_periodo,ROSANA
02/01/2026,fechamento,ROSANA
03/01/2026,meio_periodo,LUCAS
03/01/2026,fechamento,LUCAS
04/01/2026,meio_periodo,HENRIQUE
04/01/2026,fechamento,HENRIQUE
05/01/2026,meio_periodo,ROSANA
05/01/2026,fechamento,KELLY
06/01/2026,meio_periodo,CARLOS
06/01/2026,fechamento,KELLY
07/01/2026,meio_periodo,HENRIQUE
07/01/2026,fechamento,ROSANA
08/01/2026,meio_periodo,HENRIQUE
08/01/2026,fechamento,LUCAS
09/01/2026,meio_periodo,CARLOS
09/01/2026,fechamento,ROSANA
10/01/2026,meio_periodo,KELLY
10/01/2026,fechamento,KELLY
11/01/2026,meio_periodo,LUCAS
11/01/2026,fechamento,LUCAS
12/01/2026,meio_periodo,HENRIQUE
12/01/2026,fechamento,LUCAS
13/01/2026,meio_periodo,CARLOS
13/01/2026,fechamento,KELLY
14/01/2026,meio_periodo,ROSANA
14/01/2026,fechamento,LUCAS
15/01/2026,meio_periodo,HENRIQUE
15/01/2026,fechamento,KELLY
16/01/2026,meio_periodo,ROSANA
16/01/2026,fechamento,CARLOS
17/01/2026,meio_periodo,HENRIQUE
17/01/2026,fechamento,HENRIQUE
18/01/2026,meio_periodo,LUCAS
18/01/2026,fechamento,LUCAS
19/01/2026,meio_periodo,HENRIQUE
19/01/2026,fechamento,CARLOS
20/01/2026,meio_periodo,GUILHERME
20/01/2026,fechamento,KELLY
21/01/2026,meio_periodo,GUILHERME
21/01/2026,fechamento,ROSANA
22/01/2026,meio_periodo,HENRIQUE
22/01/2026,fechamento,KELLY
23/01/2026,meio_periodo,LUCAS
23/01/2026,fechamento,CARLOS
24/01/2026,meio_periodo,ROSANA
24/01/2026,fechamento,ROSANA
25/01/2026,meio_periodo,GUILHERME
25/01/2026,fechamento,GUILHERME
26/01/2026,meio_periodo,KELLY
26/01/2026,fechamento,KELLY
27/01/2026,meio_periodo,HENRIQUE
27/01/2026,fechamento,CARLOS
28/01/2026,meio_periodo,ROSANA
28/01/2026,fechamento,LUCAS
29/01/2026,meio_periodo,GUILHERME
29/01/2026,fechamento,KELLY
30/01/2026,meio_periodo,LUCAS
30/01/2026,fechamento,CARLOS
31/01/2026,meio_periodo,GUILHERME
31/01/2026,fechamento,GUILHERME`;

  // Função para obter dia da semana
  function getDayOfWeek(dateStr) {
    const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  }

  // Processar CSV e agrupar por mês
  const lines = csvData.split('\n').filter(line => line.trim());
  const monthlyData = {};

  lines.forEach(line => {
    const [date, post, collaborator] = line.split(',').map(item => item.trim());
    
    // Extrair mês e ano
    const [day, month, year] = date.split('/').map(Number);
    const monthKey = month;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = new Map();
    }
    
    if (!monthlyData[monthKey].has(date)) {
      monthlyData[monthKey].set(date, {
        date: date,
        dayOfWeek: getDayOfWeek(date),
        meioPeriodo: '',
        fechamento: ''
      });
    }
    
    const dayEntry = monthlyData[monthKey].get(date);
    if (post === 'meio_periodo') {
      dayEntry.meioPeriodo = collaborator;
    } else if (post === 'fechamento') {
      dayEntry.fechamento = collaborator;
    }
  });

  // Converter para array e ordenar
  const monthlySchedules = {};
  for (const [month, scheduleMap] of Object.entries(monthlyData)) {
    monthlySchedules[month] = Array.from(scheduleMap.values()).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }

  // Obter usuário atual
  const currentUser = JSON.parse(localStorage.getItem('escala_currentUser') || '{}');
  
  if (!currentUser.name) {
    console.error('❌ Usuário não encontrado. Faça login primeiro.');
    return;
  }

  // Importar cada mês
  let successCount = 0;
  let errorCount = 0;

  for (const [month, scheduleData] of Object.entries(monthlySchedules)) {
    try {
      // Usar a função existente do sistema
      const result = window.importNewSchedule?.(Number(month), 2026, scheduleData, currentUser.name, true);
      
      if (result?.success) {
        successCount++;
        console.log(`✅ Mês ${month}: ${scheduleData.length} dias inseridos`);
      } else {
        errorCount++;
        console.error(`❌ Erro ao inserir mês ${month}: ${result?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro ao inserir mês ${month}:`, error);
    }
  }

  // Resumo final
  console.log(`\n📊 RESUMO DA INSERÇÃO:`);
  console.log(`✅ Meses inseridos: ${successCount}`);
  console.log(`❌ Meses com erro: ${errorCount}`);
  console.log(`📅 Total de dias processados: ${lines.length}`);
  
  if (successCount > 0) {
    console.log(`\n🎉 ESCALAS INSERIDAS COM SUCESSO!`);
    console.log(`📋 Vá para a aba "Escalas" para visualizar.`);
    
    // Atualizar interface
    setTimeout(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'escala_currentSchedules',
        newValue: localStorage.getItem('escala_currentSchedules')
      }));
    }, 1000);
  } else {
    console.log(`\n❌ NENHUM MÊS FOI INSERIDO CORRETAMENTE`);
  }
}

// Função para desativar importação CSV
function desativarImportacaoCSV() {
  console.log('🔒 DESATIVANDO SISTEMA DE IMPORTAÇÃO CSV...');
  
  // Esconder botões de importação
  const importButtons = document.querySelectorAll('button');
  importButtons.forEach(button => {
    if (button.textContent.includes('Importar CSV') || 
        button.textContent.includes('12 CSVs') || 
        button.textContent.includes('1 CSV Ano Todo')) {
      button.style.display = 'none';
      console.log(`🚫 Botão ocultado: ${button.textContent}`);
    }
  });
  
  // Esconder seção de importação
  const importSections = document.querySelectorAll('div');
  importSections.forEach(section => {
    if (section.textContent.includes('Importação') || 
        section.textContent.includes('Template') ||
        section.textContent.includes('CSV')) {
      section.style.display = 'none';
    }
  });
  
  console.log('✅ Sistema de importação CSV desativado');
  console.log('📋 Use inserirEscalasDoCSV() para inserir as escalas manualmente');
}

// Executar funções
console.log('🔧 FUNÇÕES DISPONÍVEIS:');
console.log('1. inserirEscalasDoCSV() - Insere as escalas do CSV fornecido');
console.log('2. desativarImportacaoCSV() - Desativa os botões de importação');
console.log('\n📋 Para usar:');
console.log('1. Faça login como administrador');
console.log('2. Execute: desativarImportacaoCSV()');
console.log('3. Execute: inserirEscalasDoCSV()');

// Disponibilizar globalmente
window.inserirEscalasDoCSV = inserirEscalasDoCSV;
window.desativarImportacaoCSV = desativarImportacaoCSV;
