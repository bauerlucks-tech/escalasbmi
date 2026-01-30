// Script para Importar Todas as Escalas do Ano 2026
// Execute no console do navegador para importar automaticamente todos os CSVs

// Função para ler e processar CSV
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      data: values[0],
      posto: values[1],
      colaborador: values[2]
    };
  });
}

// Função para converter CSV para formato de escala
function csvToSchedule(csvData) {
  const scheduleMap = new Map();
  
  csvData.forEach(entry => {
    if (!scheduleMap.has(entry.data)) {
      scheduleMap.set(entry.data, {
        date: entry.data,
        dayOfWeek: getDayOfWeek(entry.data),
        meioPeriodo: '',
        fechamento: ''
      });
    }
    
    const dayEntry = scheduleMap.get(entry.data);
    if (entry.posto === 'meio_periodo') {
      dayEntry.meioPeriodo = entry.colaborador;
    } else if (entry.posto === 'fechamento') {
      dayEntry.fechamento = entry.colaborador;
    }
  });
  
  return Array.from(scheduleMap.values()).sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateA.getTime() - dateB.getTime();
  });
}

// Função para obter dia da semana
function getDayOfWeek(dateStr) {
  const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
}

// Função para importar escala mensal
async function importMonthlySchedule(month, year, csvContent) {
  try {
    const csvData = parseCSV(csvContent);
    const scheduleData = csvToSchedule(csvData);
    
    // Salvar no formato esperado pelo sistema
    const monthSchedule = {
      month: month,
      year: year,
      entries: scheduleData,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: 'Super Admin'
    };
    
    // Salvar no localStorage
    const currentSchedules = JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]');
    
    // Remover escala existente do mesmo mês/ano se houver
    const filteredSchedules = currentSchedules.filter(s => !(s.month === month && s.year === year));
    
    // Adicionar nova escala
    filteredSchedules.push(monthSchedule);
    
    localStorage.setItem('escala_currentSchedules', JSON.stringify(filteredSchedules));
    
    // Se for a escala mais recente, definir como ativa
    const latestSchedule = filteredSchedules.reduce((latest, current) => {
      const latestDate = new Date(latest.year, latest.month - 1);
      const currentDate = new Date(current.year, current.month - 1);
      return currentDate > latestDate ? current : latest;
    });
    
    // Atualizar escala atual se for a mais recente
    if (latestSchedule.month === month && latestSchedule.year === year) {
      localStorage.setItem('escala_scheduleData', JSON.stringify(scheduleData));
    }
    
    return {
      success: true,
      message: `Escala de ${month}/${year} importada com sucesso (${scheduleData.length} dias)`,
      days: scheduleData.length
    };
    
  } catch (error) {
    console.error(`Erro ao importar escala de ${month}/${year}:`, error);
    return {
      success: false,
      message: `Erro ao importar escala de ${month}/${year}: ${error.message}`,
      days: 0
    };
  }
}

// Função principal para importar o ano todo
async function importarAnoTodo() {
  console.log('🚀 INICIANDO IMPORTAÇÃO DO ANO TODO 2026...');
  
  const meses = [
    { nome: 'Janeiro', arquivo: 'escala_janeiro_2026_completa.csv', mes: 1 },
    { nome: 'Fevereiro', arquivo: 'escala_fevereiro_2026_preenchida.csv', mes: 2 },
    { nome: 'Março', arquivo: 'escala_marco_2026.csv', mes: 3 },
    { nome: 'Abril', arquivo: 'escala_abril_2026.csv', mes: 4 },
    { nome: 'Maio', arquivo: 'escala_maio_2026.csv', mes: 5 },
    { nome: 'Junho', arquivo: 'escala_junho_2026.csv', mes: 6 },
    { nome: 'Julho', arquivo: 'escala_julho_2026.csv', mes: 7 },
    { nome: 'Agosto', arquivo: 'escala_agosto_2026.csv', mes: 8 },
    { nome: 'Setembro', arquivo: 'escala_setembro_2026.csv', mes: 9 },
    { nome: 'Outubro', arquivo: 'escala_outubro_2026.csv', mes: 10 },
    { nome: 'Novembro', arquivo: 'escala_novembro_2026.csv', mes: 11 },
    { nome: 'Dezembro', arquivo: 'escala_dezembro_2026.csv', mes: 12 }
  ];
  
  const resultados = [];
  
  for (const mesInfo of meses) {
    console.log(`📅 Importando ${mesInfo.nome}...`);
    
    try {
      // Obter conteúdo do CSV (simulado - na prática precisaria dos arquivos)
      const csvContent = await obterConteudoCSV(mesInfo.arquivo);
      
      if (!csvContent) {
        console.warn(`⚠️ Arquivo ${mesInfo.arquivo} não encontrado`);
        resultados.push({
          mes: mesInfo.nome,
          success: false,
          message: 'Arquivo não encontrado'
        });
        continue;
      }
      
      const resultado = await importMonthlySchedule(mesInfo.mes, 2026, csvContent);
      resultados.push({
        mes: mesInfo.nome,
        ...resultado
      });
      
      if (resultado.success) {
        console.log(`✅ ${mesInfo.nome}: ${resultado.message}`);
      } else {
        console.error(`❌ ${mesInfo.nome}: ${resultado.message}`);
      }
      
      // Pequena pausa entre imports
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Erro ao importar ${mesInfo.nome}:`, error);
      resultados.push({
        mes: mesInfo.nome,
        success: false,
        message: error.message
      });
    }
  }
  
  // Resumo final
  console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
  console.log('='.repeat(50));
  
  const sucesso = resultados.filter(r => r.success);
  const falhas = resultados.filter(r => !r.success);
  
  console.log(`✅ Meses importados com sucesso: ${sucesso.length}`);
  console.log(`❌ Meses com falha: ${falhas.length}`);
  console.log(`📅 Total de dias importados: ${sucesso.reduce((sum, r) => sum + (r.days || 0), 0)}`);
  
  if (falhas.length > 0) {
    console.log('\n❌ Falhas:');
    falhas.forEach(f => {
      console.log(`- ${f.mes}: ${f.message}`);
    });
  }
  
  if (sucesso.length === meses.length) {
    console.log('\n🎉 TODOS OS MESES FORAM IMPORTADOS COM SUCESSO!');
    console.log('🔄 Recarregando página em 3 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } else {
    console.log('\n⚠️ Alguns meses não foram importados. Verifique os arquivos CSV.');
  }
  
  return resultados;
}

// Função para obter conteúdo CSV (simulação - na prática precisaria dos arquivos)
async function obterConteudoCSV(nomeArquivo) {
  // Esta função precisaria ser implementada para ler os arquivos CSV
  // Por enquanto, retorna null para simular que os arquivos não estão disponíveis
  console.log(`📁 Procurando arquivo: ${nomeArquivo}`);
  
  // Na prática, você precisaria:
  // 1. Fazer upload dos arquivos CSV
  // 2. Ou ter os arquivos em um servidor
  // 3. Ou usar uma API para obter os conteúdos
  
  return null; // Simulação - os arquivos não estão disponíveis no console
}

// Função alternativa para importação manual
function criarImportacaoManual() {
  console.log('📋 MODO DE IMPORTAÇÃO MANUAL');
  console.log('Para importar o ano todo manualmente:');
  console.log('');
  console.log('1. Vá para Administração → Importar Escala');
  console.log('2. Importe os arquivos na seguinte ordem:');
  console.log('   - escala_janeiro_2026_completa.csv');
  console.log('   - escala_fevereiro_2026_preenchida.csv');
  console.log('   - escala_marco_2026.csv');
  console.log('   - escala_abril_2026.csv');
  console.log('   - escala_maio_2026.csv');
  console.log('   - escala_junho_2026.csv');
  console.log('   - escala_julho_2026.csv');
  console.log('   - escala_agosto_2026.csv');
  console.log('   - escala_setembro_2026.csv');
  console.log('   - escala_outubro_2026.csv');
  console.log('   - escala_novembro_2026.csv');
  console.log('   - escala_dezembro_2026.csv');
  console.log('');
  console.log('3. Configure cada mês/ano correspondente');
  console.log('4. Marque "Ativar" para cada importação');
}

// Exportar funções para uso no console
window.importarAnoTodo = importarAnoTodo;
window.criarImportacaoManual = criarImportacaoManual;

console.log('📋 Funções disponíveis:');
console.log('- importarAnoTodo() - Importa automaticamente todos os meses de 2026');
console.log('- criarImportacaoManual() - Mostra instruções para importação manual');
console.log('');
console.log('🎯 Para importação automática, digite: importarAnoTodo()');
console.log('📋 Para instruções manuais, digite: criarImportacaoManual()');
