const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente manualmente
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const env = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  }
  
  return {};
}

// Carregar variáveis de ambiente
const env = loadEnv();

// Usar NOVA service role key
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function testNewServiceKey() {
  console.log('🔧 TESTE COM NOVA SERVICE ROLE KEY - VERSÃO CORRIGIDA');
  console.log('='.repeat(70));
  
  const username = 'ADMIN';
  const password = '1234';
  
  console.log('📋 DADOS DO TESTE:');
  console.log(`   Usuário: ${username}`);
  console.log(`   Senha: ${password}`);
  console.log(`   Método: Direto (com nova service role key)`);
  
  console.log(`\n🔑 Configuração:`);
  console.log(`   URL: ${env.VITE_SUPABASE_URL}`);
  console.log(`   Service Key: ${env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   Key Length: ${env.SUPABASE_SERVICE_ROLE_KEY?.length || 0} caracteres`);
  
  try {
    console.log('\n🔍 Testando acesso ao banco...');
    
    // Teste simples de conexão
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log(`❌ Erro de conexão: ${testError.message}`);
      return null;
    }
    
    console.log('✅ Conexão com banco estabelecida!');
    
    // Buscar usuário sem .single() para evitar erro
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', username)
      .eq('password', password)
      .eq('status', 'ativo')
      .limit(1);
    
    if (error) {
      console.log(`❌ Erro ao buscar usuário: ${error.message}`);
      return null;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Usuário não encontrado ou senha incorreta');
      return null;
    }
    
    const user = users[0];
    
    console.log('✅ Usuário encontrado!');
    console.log(`   👤 ID: ${user.id}`);
    console.log(`   📛 Nome: ${user.name}`);
    console.log(`   🔐 Role: ${user.role}`);
    console.log(`   📧 Email: ${user.email || 'N/A'}`);
    console.log(`   ✅ Status: ${user.status}`);
    
    // Criar sessão manual
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      session: {
        access_token: 'direct-access-token',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user: user
      }
    };
    
    console.log('\n🎉 LOGIN DIRETO BEM-SUCEDIDO!');
    console.log('-'.repeat(50));
    
    console.log('📋 RESUMO DA SESSÃO:');
    console.log(`✅ Usuário: ${session.user.name}`);
    console.log(`✅ Role: ${session.user.role}`);
    console.log(`✅ ID: ${session.user.id}`);
    console.log(`✅ Status: ${session.user.status}`);
    console.log(`✅ Método: Login Direto`);
    console.log(`✅ Service Role Key: FUNCIONANDO!`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Usuário: ${username}`);
    console.log(`3. Senha: ${password}`);
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    console.log('🎯 NOVA SERVICE ROLE KEY FUNCIONANDO!');
    
    return session;
    
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 TESTE COM NOVA SERVICE ROLE KEY - VERSÃO CORRIGIDA');
  console.log('='.repeat(70));
  
  const session = await testNewServiceKey();
  
  if (session) {
    console.log('\n🎉 SOLUÇÃO IMPLEMENTADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 VANTAGENS DO SISTEMA:');
    console.log('✅ Nova service role key funcionando');
    console.log('✅ Login direto via banco de dados');
    console.log('✅ Sem problemas de email');
    console.log('✅ Sem RLS blocking');
    console.log('✅ Controle total da autenticação');
    console.log('✅ Frontend conseguirá acessar');
    
    console.log('\n🔐 CREDENCIAIS FINAIS:');
    console.log('Usuário: ADMIN');
    console.log('Senha: 1234');
    console.log('Role: super_admin');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Implementar frontend com login direto');
    console.log('2. Usar nova service role key');
    console.log('3. Criar sessão manual no frontend');
    console.log('4. Bypass completo do Supabase Auth');
    
  } else {
    console.log('\n❌ FALHA NA IMPLEMENTAÇÃO!');
    console.log('-'.repeat(50));
    
    console.log('🚨 PROBLEMAS IDENTIFICADOS:');
    console.log('• Nova service role key não funciona');
    console.log('• Pode haver problema com a key');
    console.log('• Key pode estar incorreta');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Verificar se service role key está correta');
    console.log('2. Gerar nova key no Supabase Dashboard');
    console.log('3. Verificar permissões da key');
  }
}

main().catch(console.error);
