// SCRIPT PARA TESTAR CONEXÃO SUPABASE
// Execute no console do navegador após configurar as credenciais

async function testSupabaseConnection() {
  console.log('🔍 TESTANDO CONEXÃO SUPABASE...');
  console.log('=' .repeat(50));
  
  try {
    // 1. Configurar credenciais (substitua com suas credenciais)
    const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
    const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANONIMA';
    
    // 2. Importar Supabase (se já instalado)
    const { createClient } = window.supabase || {};
    if (!createClient) {
      console.error('❌ Supabase não encontrado. Instale com: npm install @supabase/supabase-js');
      return;
    }
    
    // 3. Criar cliente
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 4. Testar conexão básica
    console.log('🔄 Testando conexão básica...');
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return;
    }
    
    console.log('✅ Conexão bem-sucedida!');
    
    // 5. Verificar tabelas
    console.log('\n📋 VERIFICANDO TABELAS...');
    const tables = [
      'users',
      'month_schedules', 
      'schedule_entries',
      'swap_requests',
      'vacation_requests',
      'audit_logs',
      'system_backups'
    ];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count} registros`);
        }
      } catch (e) {
        console.log(`❌ ${table}: Erro ao acessar`);
      }
    }
    
    // 6. Verificar usuários
    console.log('\n👥 VERIFICANDO USUÁRIOS...');
    const { data: users, error: usersError } = await supabase.from('users').select('name, role, status').limit(10);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else {
      console.log('✅ Usuários encontrados:');
      users.forEach(user => {
        console.log(`  👤 ${user.name} (${user.role} - ${user.status})`);
      });
    }
    
    // 7. Verificar escalas
    console.log('\n📅 VERIFICANDO ESCALAS...');
    const { data: schedules, error: schedulesError } = await supabase.from('month_schedules').select('month, year, is_active').limit(10);
    
    if (schedulesError) {
      console.error('❌ Erro ao buscar escalas:', schedulesError);
    } else {
      console.log('✅ Escalas encontradas:');
      schedules.forEach(schedule => {
        console.log(`  📅 ${schedule.month}/${schedule.year} (${schedule.is_active ? 'ativa' : 'inativa'})`);
      });
    }
    
    // 8. Testar Real-time
    console.log('\n🔄 TESTANDO REAL-TIME...');
    const channel = supabase.channel('test')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        (payload) => console.log('📡 Real-time:', payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time funcionando!');
          channel.unsubscribe();
        }
      });
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('📊 Sua base Supabase está funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Função para verificar schema
async function checkSupabaseSchema() {
  console.log('🔍 VERIFICANDO SCHEMA DO BANCO...');
  console.log('=' .repeat(50));
  
  const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
  const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANONIMA';
  
  const { createClient } = window.supabase || {};
  if (!createClient) {
    console.error('❌ Supabase não encontrado');
    return;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Verificar estrutura das tabelas principais
  const schemaChecks = [
    {
      table: 'users',
      columns: ['id', 'name', 'email', 'role', 'status', 'created_at']
    },
    {
      table: 'month_schedules',
      columns: ['id', 'month', 'year', 'entries', 'is_active', 'created_at']
    },
    {
      table: 'swap_requests',
      columns: ['id', 'requester_name', 'target_name', 'status', 'created_at']
    }
  ];
  
  for (const check of schemaChecks) {
    try {
      const { data, error } = await supabase.from(check.table).select(check.columns[0]).limit(1);
      if (error) {
        console.log(`❌ ${check.table}: ${error.message}`);
      } else {
        console.log(`✅ ${check.table}: Estrutura OK`);
      }
    } catch (e) {
      console.log(`❌ ${check.table}: Erro de estrutura`);
    }
  }
}

// Exportar funções para uso no console
window.testSupabase = testSupabaseConnection;
window.checkSchema = checkSupabaseSchema;

console.log('🔧 FUNÇÕES DE TESTE SUPABASE CARREGADAS!');
console.log('🎯 Para testar: testSupabase()');
console.log('📋 Para verificar schema: checkSchema()');
console.log('\n⚠️  LEMBRE-SE: Configure suas credenciais no script antes de executar!');
