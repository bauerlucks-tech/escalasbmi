const { createClient } = require('@supabase/supabase-js');

// Usar as credenciais do frontend (anon key) - apenas para leitura
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function checkUser(username) {
  console.log(`🔍 Buscando usuário: ${username}`);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('name', username);
  
  if (error) {
    console.log(`❌ Erro: ${error.message}`);
    return null;
  }
  
  if (data && data.length > 0) {
    console.log(`✅ Usuário encontrado:`);
    console.log(`   ID: ${data[0].id}`);
    console.log(`   Nome: ${data[0].name}`);
    console.log(`   Role: ${data[0].role}`);
    console.log(`   Status: ${data[0].status}`);
    console.log(`   Criado: ${data[0].created_at}`);
    return data[0];
  } else {
    console.log(`❌ Usuário '${username}' não encontrado`);
    return null;
  }
}

async function main() {
  console.log('🔍 VERIFICANDO USUÁRIOS NO BANCO DE DADOS');
  console.log('='.repeat(50));
  console.log('⚠️ Usando credenciais de leitura (anon key)');
  console.log('');
  
  // Verificar usuários específicos
  const usersToCheck = ['MATHEUS', 'Matheus', 'matheus', 'MATHEUS ', 'MATHEUS\n', ' MATHEUS'];
  
  for (const user of usersToCheck) {
    await checkUser(user);
    console.log('');
  }
  
  // Listar todos os usuários para comparação
  console.log('📋 TODOS OS USUÁRIOS CADASTRADOS:');
  console.log('-'.repeat(30));
  
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('id, name, role, status, created_at')
    .order('created_at', { ascending: true });
  
  if (allError) {
    console.log(`❌ Erro ao listar usuários: ${allError.message}`);
  } else {
    console.log(`📊 Total de usuários: ${allUsers.length}`);
    console.log('');
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role}) - ${user.status}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Criado: ${user.created_at}`);
      console.log('');
    });
    
    // Verificar especificamente por Matheus
    const matheusUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes('matheus')
    );
    
    console.log('🔍 RESULTADO DA BUSCA POR "MATHEUS":');
    console.log('-'.repeat(40));
    
    if (matheusUsers.length > 0) {
      console.log(`✅ Encontrados ${matheusUsers.length} usuário(s) com "matheus" no nome:`);
      matheusUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.role}) - ${user.status}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Criado: ${user.created_at}`);
      });
    } else {
      console.log('❌ NENHUM usuário encontrado com "matheus" no nome');
    }
  }
}

main().catch(console.error);
