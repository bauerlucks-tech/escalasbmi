// Script para Recuperar Escalas Perdidas
// Execute no console do navegador para recuperar escalas arquivadas

function recuperarEscalasPerdidas() {
  console.log('🔍 RECUPERANDO ESCALAS PERDIDAS...');
  console.log('='.repeat(50));
  
  // 1. Verificar escalas arquivadas
  const arquivadas = JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]');
  console.log(`📁 Escalas arquivadas encontradas: ${arquivadas.length}`);
  
  if (arquivadas.length === 0) {
    console.log('❌ Nenhuma escala arquivada encontrada.');
    return;
  }
  
  // 2. Listar escalas arquivadas
  console.log('\n📋 ESCALAS ARQUIVADAS:');
  arquivadas.forEach((escala, index) => {
    console.log(`${index + 1}. ${escala.month}/${escala.year} - ${getMonthName(escala.month)} - Arquivada em: ${new Date(escala.archivedAt).toLocaleString()}`);
  });
  
  // 3. Recuperar todos os meses do ano 2026
  const mesesParaRecuperar = [
    { month: 1, year: 2026, nome: 'Janeiro' },
    { month: 2, year: 2026, nome: 'Fevereiro' },
    { month: 3, year: 2026, nome: 'Março' },
    { month: 4, year: 2026, nome: 'Abril' },
    { month: 5, year: 2026, nome: 'Maio' },
    { month: 6, year: 2026, nome: 'Junho' },
    { month: 7, year: 2026, nome: 'Julho' },
    { month: 8, year: 2026, nome: 'Agosto' },
    { month: 9, year: 2026, nome: 'Setembro' },
    { month: 10, year: 2026, nome: 'Outubro' },
    { month: 11, year: 2026, nome: 'Novembro' },
    { month: 12, year: 2026, nome: 'Dezembro' }
  ];
  
  const escalasAtuais = JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]');
  console.log(`\n📅 Escalas atuais antes da recuperação: ${escalasAtuais.length}`);
  
  let recuperadas = 0;
  const escalasRecuperadas = [];
  
  mesesParaRecuperar.forEach(mes => {
    // Verificar se já existe nas escalas atuais
    const existeAtual = escalasAtuais.find(e => e.month === mes.month && e.year === mes.year);
    
    if (!existeAtual) {
      // Procurar nas arquivadas
      const arquivada = arquivadas.find(e => e.month === mes.month && e.year === mes.year);
      
      if (arquivada) {
        // Restaurar para escalas atuais
        const escalaRestaurada = {
          month: arquivada.month,
          year: arquivada.year,
          entries: arquivada.entries,
          importedAt: arquivada.importedAt,
          importedBy: arquivada.importedBy,
          isActive: false // Não ativar automaticamente
        };
        
        escalasAtuais.push(escalaRestaurada);
        recuperadas++;
        escalasRecuperadas.push(mes.nome);
        console.log(`✅ ${mes.nome} 2026 recuperado`);
      } else {
        console.log(`❌ ${mes.nome} 2026 não encontrado nas escalas arquivadas`);
      }
    } else {
      console.log(`ℹ️ ${mes.nome} 2026 já existe nas escalas atuais`);
    }
  });
  
  // 4. Salvar escalas recuperadas
  if (recuperadas > 0) {
    localStorage.setItem('escala_currentSchedules', JSON.stringify(escalasAtuais));
    console.log(`\n✅ ${recuperadas} escalas recuperadas com sucesso!`);
    console.log(`📅 Escalas recuperadas: ${escalasRecuperadas.join(', ')}`);
    
    // 5. Forçar refresh da página
    console.log('\n🔄 Recarregando a página para aplicar as mudanças...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } else {
    console.log('\nℹ️ Nenhuma escala precisou ser recuperada.');
  }
}

// Função auxiliar para obter nome do mês
function getMonthName(month) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1] || 'Mês desconhecido';
}

// Função para verificar status atual das escalas
function verificarStatusEscalas() {
  console.log('📊 VERIFICANDO STATUS DAS ESCALAS...');
  console.log('='.repeat(50));
  
  const atuais = JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]');
  const arquivadas = JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]');
  
  console.log(`📅 Escalas atuais: ${atuais.length}`);
  console.log(`📁 Escalas arquivadas: ${arquivadas.length}`);
  
  console.log('\n📋 ESCALAS ATUAIS:');
  atuais.sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1);
    const dateB = new Date(b.year, b.month - 1);
    return dateA.getTime() - dateB.getTime();
  }).forEach(escala => {
    const status = escala.isActive ? '🟢 ATIVA' : '⚪ INATIVA';
    console.log(`  ${escala.month}/${escala.year} - ${getMonthName(escala.month)} - ${status}`);
  });
  
  console.log('\n📋 ESCALAS ARQUIVADAS:');
  arquivadas.sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1);
    const dateB = new Date(b.year, b.month - 1);
    return dateA.getTime() - dateB.getTime();
  }).forEach(escala => {
    console.log(`  ${escala.month}/${escala.year} - ${getMonthName(escala.month)} - 📁 Arquivada em: ${new Date(escala.archivedAt).toLocaleString()}`);
  });
}

// Exportar funções
window.recuperarEscalasPerdidas = recuperarEscalasPerdidas;
window.verificarStatusEscalas = verificarStatusEscalas;

console.log('🔧 FUNÇÕES DE RECUPERAÇÃO DISPONÍVEIS:');
console.log('- verificarStatusEscalas() - Verificar status atual das escalas');
console.log('- recuperarEscalasPerdidas() - Recuperar escalas arquivadas (Janeiro-Junho)');
console.log('');
console.log('🎯 Para verificar o status, digite: verificarStatusEscalas()');
console.log('🎯 Para recuperar escalas, digite: recuperarEscalasPerdidas()');
