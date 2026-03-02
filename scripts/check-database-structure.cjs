const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 VERIFICANDO ESTRUTURA DO BANCO DE DADOS');
  console.log('='.repeat(50));
  
  try {
    // 1. Tentar listar tabelas via SQL direto
    console.log('\n📋 PASSO 1: Listando tabelas...');
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables', { schema_name: 'public' });
    
    if (tablesError) {
      console.log('⚠️ Erro ao listar tabelas via RPC:', tablesError.message);
      
      // Tentar via SQL direto
      console.log('\n📋 PASSO 2: Tentando via SQL direto...');
      
      const { data: sqlResult, error: sqlError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(20);
      
      if (sqlError) {
        console.log('❌ Erro ao listar tabelas via information_schema:', sqlError.message);
      } else {
        console.log('✅ Tabelas encontradas via information_schema:');
        sqlResult.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      }
    } else {
      console.log('✅ Tabelas encontradas via RPC:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // 2. Tentar verificar se existe tabela de usuários
    console.log('\n📋 PASSO 3: Procurando tabela de usuários...');
    
    const possibleUserTables = ['usuarios', 'users', 'auth_users', 'user_profiles', 'profiles'];
    
    for (const tableName of possibleUserTables) {
      try {
        const { data: testData, error: testError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!testError) {
          console.log(`✅ Tabela '${tableName}' encontrada e acessível!`);
          
          // Verificar estrutura da tabela
          const { data: columns, error: columnsError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          if (!columnsError) {
            console.log(`📊 Estrutura da tabela ${tableName}:`);
            console.log(`  - Registros: ${testData.length || 0}`);
            if (testData.length > 0) {
              console.log(`  - Colunas: ${Object.keys(testData[0]).join(', ')}`);
            }
          }
          
          // Verificar se existe usuário ADMIN
          const { data: adminData, error: adminError } = await supabase
            .from(tableName)
            .select('*')
            .or('email.eq.admin@escala-bmi.com,nome.eq.ADMIN,username.eq.ADMIN')
            .limit(1);
          
          if (!adminError && adminData.length > 0) {
            console.log(`🎉 Usuário ADMIN encontrado em ${tableName}:`);
            console.log(`  - ID: ${adminData[0].id || 'N/A'}`);
            console.log(`  - Nome: ${adminData[0].nome || adminData[0].name || 'N/A'}`);
            console.log(`  - Email: ${adminData[0].email || 'N/A'}`);
            console.log(`  - Role: ${adminData[0].role || 'N/A'}`);
          }
          
          break;
        }
      } catch (e) {
        // Tabela não existe ou não é acessível
      }
    }
    
    // 3. Verificar se o problema está na autenticação Supabase
    console.log('\n📋 PASSO 4: Verificando auth.users...');
    
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError) {
        console.log(`✅ Auth users encontrados: ${authUsers.users.length} usuários`);
        
        const adminUser = authUsers.users.find(u => 
          u.email === 'admin@escala-bmi.com' || 
          u.user_metadata?.nome === 'ADMIN' ||
          u.user_metadata?.name === 'ADMIN'
        );
        
        if (adminUser) {
          console.log('🎉 Usuário ADMIN encontrado em auth.users:');
          console.log(`  - ID: ${adminUser.id}`);
          console.log(`  - Email: ${adminUser.email}`);
          console.log(`  - Criado em: ${adminUser.created_at}`);
          console.log(`  - Confirmado: ${adminUser.email_confirmed_at ? 'Sim' : 'Não'}`);
        } else {
          console.log('❌ Usuário ADMIN não encontrado em auth.users');
        }
      } else {
        console.log('❌ Erro ao acessar auth.users:', authError.message);
      }
    } catch (authException) {
      console.log('❌ Exceção ao acessar auth.users:', authException.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkDatabaseStructure();
