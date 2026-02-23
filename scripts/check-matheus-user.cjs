const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do .env
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  // Tentar carregar do .env
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length);
      } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseKey = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length);
      }
    });
  }
} catch (error) {
  console.log('⚠️ Erro ao carregar .env:', error.message);
}

// Se não encontrou no .env, tentar das variáveis de ambiente
if (!supabaseUrl) supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseKey) supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Credenciais do Supabase não encontradas');
  console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  console.log('');
  console.log('💡 Para verificar usuários, você precisa:');
  console.log('   1. SUPABASE_SERVICE_ROLE_KEY no .env');
  console.log('   2. Ou executar via interface de administrador');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
  
  // Verificar usuários específicos
  const usersToCheck = ['MATHEUS', 'Matheus', 'matheus', 'MATHEUS '];
  
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
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role}) - ${user.status}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Criado: ${user.created_at}`);
      console.log('');
    });
  }
}

main().catch(console.error);
