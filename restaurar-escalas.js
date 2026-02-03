// VERIFICAR E RESTAURAR ESCALAS ATUAIS
// Script para diagnosticar e restaurar dados corretos

async function verificarERestaurarEscalas() {
  console.log('🔍 VERIFICANDO ESTADO DAS ESCALAS');
  console.log('===================================');
  
  try {
    // 1. Verificar localStorage
    console.log('');
    console.log('📱 1. VERIFICANDO LOCAL STORAGE...');
    
    const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
    const usersStorage = localStorage.getItem('escala_users');
    
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      console.log('📋 Escalas no localStorage:');
      schedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${schedule.entries.length} dias (ativo: ${schedule.isActive})`);
      });
    } else {
      console.log('❌ Nenhuma escala encontrada no localStorage');
    }
    
    if (usersStorage) {
      const users = JSON.parse(usersStorage);
      console.log(`👥 Usuários no localStorage: ${users.length} usuários`);
    } else {
      console.log('❌ Nenhum usuário encontrado no localStorage');
    }
    
    // 2. Verificar Supabase
    console.log('');
    console.log('🗄️ 2. VERIFICANDO SUPABASE...');
    
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    // Buscar escalas do Supabase
    const schedulesResponse = await fetch(`${supabaseUrl}/rest/v1/schedules?select=*`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (schedulesResponse.ok) {
      const schedules = await schedulesResponse.json();
      console.log('📋 Escalas no Supabase:');
      schedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${schedule.entries?.length || 0} dias (ativo: ${schedule.isActive})`);
      });
    } else {
      console.log('❌ Erro ao buscar escalas do Supabase:', schedulesResponse.status);
    }
    
    // Buscar usuários do Supabase
    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`👥 Usuários no Supabase: ${users.length} usuários`);
    } else {
      console.log('❌ Erro ao buscar usuários do Supabase:', usersResponse.status);
    }
    
    // 3. Comparar e sugerir restauração
    console.log('');
    console.log('🔄 3. ANÁLISE COMPARATIVA...');
    
    if (scheduleStorage && schedulesResponse.ok) {
      const localSchedules = JSON.parse(scheduleStorage);
      const supabaseSchedules = await schedulesResponse.json();
      
      console.log(`📊 Local: ${localSchedules.length} escalas`);
      console.log(`📊 Supabase: ${supabaseSchedules.length} escalas`);
      
      if (localSchedules.length > supabaseSchedules.length) {
        console.log('💡 Sugestão: localStorage tem mais dados que Supabase');
        console.log('🔧 Opção 1: Restaurar localStorage → Supabase');
        console.log('🔧 Opção 2: Manter localStorage atual');
      } else if (supabaseSchedules.length > localSchedules.length) {
        console.log('💡 Sugestão: Supabase tem mais dados que localStorage');
        console.log('🔧 Opção 1: Restaurar Supabase → localStorage');
        console.log('🔧 Opção 2: Manter dados do Supabase');
      } else {
        console.log('✅ Quantidade de escalas igual em ambos');
      }
    }
    
    console.log('');
    console.log('🎯 4. PRÓXIMOS PASSOS...');
    console.log('========================');
    console.log('📋 Para restaurar localStorage → Supabase:');
    console.log('   restaurarLocalStorageParaSupabase()');
    console.log('');
    console.log('📋 Para restaurar Supabase → localStorage:');
    console.log('   restaurarSupabaseParaLocalStorage()');
    console.log('');
    console.log('📋 Para limpar e recomeçar:');
    console.log('   limparDadosEscalas()');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Restaurar localStorage para Supabase
async function restaurarLocalStorageParaSupabase() {
  console.log('🔄 RESTAURANDO LOCAL STORAGE → SUPABASE');
  console.log('=======================================');
  
  try {
    const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
    
    if (!scheduleStorage) {
      console.log('❌ Nenhuma escala encontrada no localStorage');
      return;
    }
    
    const schedules = JSON.parse(scheduleStorage);
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    let restored = 0;
    let errors = 0;
    
    for (const schedule of schedules) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/schedules`, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(schedule)
        });
        
        if (response.ok) {
          console.log(`✅ ${schedule.month}/${schedule.year} restaurado`);
          restored++;
        } else {
          console.log(`❌ Erro ao restaurar ${schedule.month}/${schedule.year}: ${response.status}`);
          errors++;
        }
      } catch (error) {
        console.log(`❌ Erro ao restaurar ${schedule.month}/${schedule.year}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('');
    console.log('📊 RESUMO DA RESTAURAÇÃO');
    console.log('========================');
    console.log(`✅ Restaurados: ${restored}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📋 Total: ${schedules.length}`);
    
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
  }
}

// Restaurar Supabase para localStorage
async function restaurarSupabaseParaLocalStorage() {
  console.log('🔄 RESTAURANDO SUPABASE → LOCAL STORAGE');
  console.log('=======================================');
  
  try {
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/schedules?select=*`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (!response.ok) {
      console.log('❌ Erro ao buscar escalas do Supabase:', response.status);
      return;
    }
    
    const schedules = await response.json();
    
    // Salvar no localStorage
    localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
    
    console.log('✅ Escalas restauradas no localStorage');
    console.log(`📋 Total: ${schedules.length} escalas`);
    
    schedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${schedule.entries?.length || 0} dias`);
    });
    
  } catch (error) {
    console.error('❌ Erro na restauração:', error);
  }
}

// Limpar dados de escalas
function limparDadosEscalas() {
  console.log('🗑️ LIMPANDO DADOS DE ESCALAS');
  console.log('==========================');
  
  localStorage.removeItem('escala_scheduleStorage');
  console.log('✅ localStorage limpo');
  
  console.log('💡 Recarregue a página para começar do zero');
}

// Exportar funções
window.verificarERestaurarEscalas = verificarERestaurarEscalas;
window.restaurarLocalStorageParaSupabase = restaurarLocalStorageParaSupabase;
window.restaurarSupabaseParaLocalStorage = restaurarSupabaseParaLocalStorage;
window.limparDadosEscalas = limparDadosEscalas;

console.log('🔧 FERRAMENTAS DE RESTAURAÇÃO DE ESCALAS CARREGADAS!');
console.log('📋 Para verificar: verificarERestaurarEscalas()');
console.log('🔄 Para restaurar localStorage → Supabase: restaurarLocalStorageParaSupabase()');
console.log('🔄 Para restaurar Supabase → localStorage: restaurarSupabaseParaLocalStorage()');
console.log('🗑️ Para limpar: limparDadosEscalas()');
