// CORRIGIR TABELA PARA month_schedules
// Script para atualizar código para buscar da tabela correta

function corrigirTabelaParaMonthSchedules() {
  console.log('🔧 CORRIGINDO TABELA PARA month_schedules');
  console.log('======================================');
  
  // 1. Verificar dados atuais no localStorage
  console.log('');
  console.log('📱 1. VERIFICANDO LOCAL STORAGE ATUAL...');
  
  const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
  
  if (scheduleStorage) {
    const schedules = JSON.parse(scheduleStorage);
    console.log(`⚠️ LocalStorage tem ${schedules.length} escalas (provavelmente vazias/antigas)`);
  } else {
    console.log('❌ Nenhuma escala no localStorage');
  }
  
  // 2. Buscar dados corretos do Supabase
  console.log('');
  console.log('🗄️ 2. BUSCANDO DADOS CORRETOS DO SUPABASE...');
  
  buscarDadosCorretos();
}

// Buscar dados corretos da tabela month_schedules
async function buscarDadosCorretos() {
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  try {
    console.log('🌐 Buscando da tabela month_schedules...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/month_schedules?select=*&order=year.desc,month.desc`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const schedules = await response.json();
      console.log(`✅ Encontradas ${schedules.length} escalas no Supabase`);
      
      // Mostrar detalhes
      schedules.forEach((schedule, index) => {
        const entriesCount = schedule.entries ? schedule.entries.length : 0;
        const hasCrew = schedule.entries && schedule.entries.some(entry => entry.meioPeriodo || entry.fechamento);
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias ${hasCrew ? '(com tripulação)' : '(vazios)'}`);
        
        // Mostrar alguns exemplos de tripulação
        if (hasCrew && schedule.entries) {
          const crewExamples = schedule.entries
            .filter(entry => entry.meioPeriodo || entry.fechamento)
            .slice(0, 3);
          
          if (crewExamples.length > 0) {
            const crewStr = crewExamples.map(entry => 
              `${entry.date}: ${entry.meioPeriodo || '---'} / ${entry.fechamento || '---'}`
            ).join(', ');
            console.log(`      👥 Exemplo: ${crewStr}`);
          }
        }
      });
      
      // 3. Sincronizar com localStorage
      console.log('');
      console.log('🔄 3. SINCRONIZANDO COM LOCAL STORAGE...');
      
      sincronizarComLocalStorage(schedules);
      
    } else {
      console.log('❌ Erro ao buscar dados:', response.status);
      const errorText = await response.text();
      console.log('Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
  }
}

// Sincronizar dados com localStorage
function sincronizarComLocalStorage(schedules) {
  try {
    // Salvar no localStorage
    localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
    
    console.log(`✅ ${schedules.length} escalas sincronizadas para localStorage`);
    console.log('💡 Recarregue a página para ver as escalas corretas');
    
    // Verificar se sincronizou corretamente
    const saved = localStorage.getItem('escala_scheduleStorage');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log(`📋 Verificação: ${parsed.length} escalas no localStorage`);
    }
    
    console.log('');
    console.log('🎉 SINCRONIZAÇÃO CONCLUÍDA!');
    console.log('📋 Próximos passos:');
    console.log('   1. Recarregue a página (F5)');
    console.log('   2. Verifique se as escalas aparecem corretamente');
    console.log('   3. Se necessário, limpe o cache do navegador');
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Função para verificar se o código está usando a tabela correta
function verificarTabelaNoCodigo() {
  console.log('🔍 VERIFICANDO SE CÓDIGO USA TABELA CORRETA');
  console.log('========================================');
  
  console.log('💡 Verifique no código React por:');
  console.log('');
  console.log('1. URLS INCORRETAS:');
  console.log('   ❌ /rest/v1/schedules');
  console.log('   ✅ /rest/v1/month_schedules');
  console.log('');
  console.log('2. SUPABASE CLIENT:');
  console.log('   ❌ supabase.from("schedules")');
  console.log('   ✅ supabase.from("month_schedules")');
  console.log('');
  console.log('3. FETCH CALLS:');
  console.log('   ❌ fetch(`${supabaseUrl}/rest/v1/schedules`)');
  console.log('   ✅ fetch(`${supabaseUrl}/rest/v1/month_schedules`)');
  console.log('');
  console.log('🔧 Se encontrar referências a "schedules", substitua por "month_schedules"');
}

// Função para criar um patch temporário
function criarPatchTemporario() {
  console.log('🔧 CRIANDO PATCH TEMPORÁRIO...');
  console.log('==============================');
  
  // Interceptar fetch para redirecionar schedules → month_schedules
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('/rest/v1/schedules')) {
      const newUrl = url.replace('/rest/v1/schedules', '/rest/v1/month_schedules');
      console.log('🔄 Redirecionando:', url, '→', newUrl);
      args[0] = newUrl;
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Patch temporário aplicado');
  console.log('💡 Chamadas para /schedules serão redirecionadas para /month_schedules');
  console.log('⚠️  Isso é temporário - ainda precisa corrigir no código fonte');
}

// Exportar funções
window.corrigirTabelaParaMonthSchedules = corrigirTabelaParaMonthSchedules;
window.buscarDadosCorretos = buscarDadosCorretos;
window.verificarTabelaNoCodigo = verificarTabelaNoCodigo;
window.criarPatchTemporario = criarPatchTemporario;

console.log('🔧 FERRAMENTAS DE CORREÇÃO CARREGADAS!');
console.log('📋 Para corrigir: corrigirTabelaParaMonthSchedules()');
console.log('🔍 Para verificar código: verificarTabelaNoCodigo()');
console.log('🔧 Para patch temporário: criarPatchTemporario()');

// Executar correção automaticamente
corrigirTabelaParaMonthSchedules();
