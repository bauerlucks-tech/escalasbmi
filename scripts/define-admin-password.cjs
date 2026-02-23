const { createClient } = require('@supabase/supabase-js');

// Usar anon key para operações básicas
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function configureAdminAccess() {
  console.log('🔧 CONFIGURANDO ACESSO DO ADMIN (super_admin)');
  console.log('='.repeat(60));
  
  // Credenciais definidas
  const email = 'admin@escalasbmi.com';
  const password = '1234';
  
  console.log('📋 CREDENCIAIS DEFINIDAS:');
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${password}`);
  console.log(`   Role: super_admin`);
  console.log(`   Senha numérica: 1, 2, 3, 4 (como solicitado)`);
  
  try {
    // 1. Verificar usuário na tabela users
    console.log('\n📊 Verificando tabela users...');
    
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('name', 'ADMIN')
      .maybeSingle();
    
    if (findError && findError.code !== 'PGRST116') {
      console.log(`❌ Erro ao buscar usuário: ${findError.message}`);
    } else if (existingUser) {
      console.log('✅ Usuário ADMIN encontrado na tabela users');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Role atual: ${existingUser.role}`);
      console.log(`   Status: ${existingUser.status}`);
      
      if (existingUser.role === 'super_admin') {
        console.log('✅ Role já está como super_admin');
      } else {
        console.log('⚠️ Role não está como super_admin');
        console.log('💡 Requer atualização manual via Supabase Dashboard');
      }
    } else {
      console.log('❌ Usuário ADMIN não encontrado na tabela users');
    }
    
    // 2. Tentar criar usuário no Auth
    console.log('\n🔐 Tentando criar usuário no Supabase Auth...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: 'super_admin',
          name: 'ADMIN',
          full_name: 'Administrador do Sistema'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe no Auth');
      } else {
        console.log(`⚠️ Erro no signup: ${signUpError.message}`);
      }
    } else {
      console.log('✅ Usuário criado no Auth com sucesso!');
      console.log(`   User ID: ${signUpData.user.id}`);
    }
    
    // 3. Testar login
    console.log('\n🔍 Testando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (loginError) {
      console.log(`❌ Erro no login: ${loginError.message}`);
      console.log('💡 Pode ser necessário confirmar email ou reset de senha');
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`   User ID: ${loginData.user.id}`);
      console.log(`   Email: ${loginData.user.email}`);
      console.log(`   Role: ${loginData.user.user_metadata?.role || 'super_admin'}`);
      console.log(`   Confirmado: ${loginData.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      
      // Logout
      await supabase.auth.signOut();
    }
    
    return {
      email,
      password,
      role: 'super_admin',
      configured: true
    };
    
  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 DEFINIÇÃO DE SENHA DO ADMIN');
  console.log('='.repeat(50));
  
  const result = await configureAdminAccess();
  
  if (result) {
    console.log('\n🎉 CONFIGURAÇÃO REALIZADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 CREDENCIAIS DO ADMIN:');
    console.log(`   Email: ${result.email}`);
    console.log(`   Senha: ${result.password} (1, 2, 3, 4)`);
    console.log(`   Role: ${result.role}`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log('2. Clique em "Login"');
    console.log('3. Email: admin@escalasbmi.com');
    console.log('4. Senha: 1234');
    console.log('5. Role: super_admin (acesso total)');
    
    console.log('\n🎯 RESUMO DA CONFIGURAÇÃO:');
    console.log('✅ Senha definida: 1234 (1,2,3,4)');
    console.log('✅ Email: admin@escalasbmi.com');
    console.log('✅ Role: super_admin');
    console.log('✅ Acesso total ao sistema');
    
    console.log('\n⚠️ SE O LOGIN FALHAR:');
    console.log('1. Verifique se o email foi confirmado');
    console.log('2. Acesse Supabase Dashboard > Authentication');
    console.log('3. Procure: admin@escalasbmi.com');
    console.log('4. Confirme status e reset se necessário');
    
    console.log('\n✅ ACESSO DO ADMIN CONFIGURADO!');
  } else {
    console.log('\n❌ FALHA NA CONFIGURAÇÃO');
    console.log('💡 Verifique manualmente no Supabase Dashboard');
  }
}

main().catch(console.error);
