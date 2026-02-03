// VERIFICAÇÃO SEM CSP - USANDO FETCH DIRETO
// Alternativa que não carrega scripts externos

async function verificarSistemaSemCSP() {
  console.log('🔍 VERIFICAÇÃO SISTEMA (SEM CSP)');
  console.log('==================================');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    // 1. Testar conexão com Supabase via fetch
    console.log('');
    console.log('🔗 1. TESTANDO CONEXÃO COM SUPABASE...');
    
    const response = await fetch(SUPABASE_URL + '/rest/v1/users?select=count', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com Supabase estabelecida');
      console.log('📊 Resposta: ' + JSON.stringify(data));
    } else {
      console.log('❌ Erro na conexão: ' + response.status);
      return;
    }
    
    // 2. Verificar escalas no Supabase
    console.log('');
    console.log('📅 2. VERIFICANDO ESCALAS NO SUPABASE...');
    
    const schedulesResponse = await fetch(SUPABASE_URL + '/rest/v1/month_schedules?select=month,year,is_active&order=month.asc', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    
    if (schedulesResponse.ok) {
      const schedules = await schedulesResponse.json();
      console.log('✅ Escalas encontradas: ' + schedules.length);
      
      if (schedules.length > 0) {
        console.log('📊 Lista de escalas:');
        schedules.forEach(schedule => {
          console.log('   📅 ' + schedule.month + '/' + schedule.year + ' (ativo: ' + schedule.is_active + ')');
        });
      }
    } else {
      console.log('❌ Erro ao buscar escalas: ' + schedulesResponse.status);
    }
    
    // 3. Verificar usuários
    console.log('');
    console.log('👥 3. VERIFICANDO USUÁRIOS...');
    
    const usersResponse = await fetch(SUPABASE_URL + '/rest/v1/users?select=name,role,status&order=name', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Usuários encontrados: ' + users.length);
      
      if (users.length > 0) {
        console.log('👥 Lista de usuários:');
        users.forEach(user => {
          console.log('   👤 ' + user.name + ' (' + user.role + ' - ' + user.status + ')');
        });
      }
    } else {
      console.log('❌ Erro ao buscar usuários: ' + usersResponse.status);
    }
    
    // 4. Comparar com localStorage
    console.log('');
    console.log('📊 4. COMPARANDO COM LOCALSTORAGE...');
    
    const localStorageSchedules = localStorage.getItem('escala_scheduleStorage');
    let localCount = 0;
    
    if (localStorageSchedules) {
      try {
        const schedules = JSON.parse(localStorageSchedules);
        localCount = schedules.current ? schedules.current.length : 0;
        console.log('📱 LocalStorage - Escalas: ' + localCount);
      } catch (e) {
        console.log('❌ Erro ao ler localStorage: ' + e.message);
      }
    } else {
      console.log('❌ Nenhuma escala encontrada no localStorage');
    }
    
    // 5. Testar escrita (criar log)
    console.log('');
    console.log('🧪 5. TESTANDO ESCRITA...');
    
    const logData = {
      user_name: 'VERIFICATION_TEST',
      action: 'SYSTEM_CHECK',
      details: 'Verificação do sistema - ' + new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    const writeResponse = await fetch(SUPABASE_URL + '/rest/v1/audit_logs', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logData)
    });
    
    if (writeResponse.ok) {
      console.log('✅ Escrita funcionando');
      console.log('📝 Log de verificação criado');
    } else {
      console.log('❌ Erro na escrita: ' + writeResponse.status);
      console.log('   Detalhes: ' + await writeResponse.text());
    }
    
    // 6. Resumo final
    console.log('');
    console.log('🎯 6. RESUMO DA VERIFICAÇÃO');
    console.log('================================');
    
    // Buscar contatos finais
    const finalSchedules = await fetch(SUPABASE_URL + '/rest/v1/month_schedules?select=count', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    
    const finalUsers = await fetch(SUPABASE_URL + '/rest/v1/users?select=count', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    
    if (finalSchedules.ok && finalUsers.ok) {
      const schedulesCount = await finalSchedules.json();
      const usersCount = await finalUsers.json();
      
      console.log('📊 Escalas no Supabase: ' + (schedulesCount[0]?.count || 0) + '/12');
      console.log('👥 Usuários no Supabase: ' + (usersCount[0]?.count || 0));
      console.log('📱 Escalas no LocalStorage: ' + localCount);
      console.log('🔗 Conexão: ✅');
      console.log('🧪 Leitura: ✅');
      console.log('✍️ Escrita: ' + (writeResponse.ok ? '✅' : '❌'));
      
      const totalSchedules = schedulesCount[0]?.count || 0;
      
      if (totalSchedules === 12 && localCount === 12) {
        console.log('');
        console.log('🎉 SISTEMA 100% ALINHADO!');
        console.log('✅ Todas as escalas migradas');
        console.log('✅ Dados sincronizados');
        console.log('✅ Operações funcionando');
        console.log('✅ Supabase pronto para uso');
      } else {
        console.log('');
        console.log('⚠️ VERIFICAÇÃO NECESSÁRIA');
        console.log('📊 Escalas migradas: ' + totalSchedules + '/12');
        console.log('📱 Escalas locais: ' + localCount);
        
        if (totalSchedules < localCount) {
          console.log('🔧 Execute migracaoSegura() para completar');
        } else if (totalSchedules > localCount) {
          console.log('🔄 Recarregue a página para atualizar');
        }
      }
    }
    
    console.log('');
    console.log('🔗 Dashboard: https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf');
    console.log('📱 Aplicação: ' + window.location.href);
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Função simplificada para verificar status
async function verificarStatusRapido() {
  console.log('⚡ VERIFICAÇÃO RÁPIDA...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
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
      const count = data[0]?.count || 0;
      console.log('📊 Escalas no Supabase: ' + count + '/12');
      
      if (count === 12) {
        console.log('🎉 SISTEMA PRONTO!');
      } else {
        console.log('⚠️ Faltam ' + (12 - count) + ' escalas');
      }
    } else {
      console.log('❌ Erro: ' + response.status);
    }
  } catch (error) {
    console.log('❌ Erro: ' + error.message);
  }
}

// Exportar funções
window.verificarSistemaSemCSP = verificarSistemaSemCSP;
window.verificarStatusRapido = verificarStatusRapido;

console.log('🔧 FUNÇÕES DE VERIFICAÇÃO (SEM CSP) CARREGADAS!');
console.log('🔍 Para verificar completo: verificarSistemaSemCSP()');
console.log('⚡ Para rápido: verificarStatusRapido()');
