const { createClient } = require('@supabase/supabase-js');

// Usar anon key para testar login
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function testAdminLogin() {
  console.log('🔍 TESTANDO LOGIN DO ADMIN');
  console.log('='.repeat(50));
  
  // Testar diferentes combinações de senha
  const testPasswords = [
    '1234',           // Senha que definimos
    'admin123',        // Senha do VITE_ADMIN_PASSWORD
    'admin',           // Senha padrão
    'password',        // Senha comum
    'superadmin',      // Baseado no role
    'ADMIN123',        // Versão maiúscula
    'Admin123',        // Capitalizada
  ];
  
  const email = 'admin@escalasbmi.com';
  
  console.log(`📧 Email: ${email}`);
  console.log('🔐 Testando senhas possíveis:');
  console.log('');
  
  for (let i = 0; i < testPasswords.length; i++) {
    const password = testPasswords[i];
    console.log(`🧪 Teste ${i + 1}/${testPasswords.length}: "${password}"`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        console.log(`   ❌ Falhou: ${error.message}`);
      } else {
        console.log(`   ✅ SUCESSO! Login com "${password}"`);
        console.log(`   👤 User ID: ${data.user.id}`);
        console.log(`   📧 Email: ${data.user.email}`);
        console.log(`   🔑 Role: ${data.user.user_metadata?.role || 'desconhecido'}`);
        console.log(`   ✅ Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
        
        // Logout imediato
        await supabase.auth.signOut();
        
        return {
          success: true,
          password: password,
          email: email,
          userId: data.user.id,
          role: data.user.user_metadata?.role || 'desconhecido'
        };
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`);
    }
    
    // Pequeno delay entre tentativas
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n❌ Nenhuma senha funcionou!');
  console.log('💡 Sugestões:');
  console.log('   1. Verificar se o usuário existe no Supabase Auth');
  console.log('   2. Resetar senha via Supabase Dashboard');
  console.log('   3. Verificar se o email foi confirmado');
  
  return null;
}

async function checkUserExists() {
  console.log('\n🔍 VERIFICANDO SE USUÁRIO EXISTE NO AUTH');
  console.log('-'.repeat(50));
  
  try {
    // Tentar signup para verificar se usuário já existe
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@escalasbmi.com',
      password: 'temperatura123',
      options: {
        data: {
          role: 'super_admin',
          name: 'ADMIN'
        }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Usuário JÁ existe no Supabase Auth');
        console.log('💡 O problema é a senha, não a existência');
      } else {
        console.log(`❌ Erro ao verificar: ${error.message}`);
      }
    } else {
      console.log('❌ Usuário NÃO existe no Supabase Auth');
      console.log('💡 Foi criado com senha: temperatura123');
      console.log('🔧 Delete este usuário e crie o correto');
    }
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
  }
}

async function main() {
  console.log('🔧 DIAGNÓSTICO DE LOGIN DO ADMIN');
  console.log('='.repeat(60));
  
  // 1. Verificar se usuário existe
  await checkUserExists();
  
  // 2. Testar todas as senhas possíveis
  const result = await testAdminLogin();
  
  if (result) {
    console.log('\n🎉 SENHA CORRETA ENCONTRADA!');
    console.log('-'.repeat(50));
    console.log(`📧 Email: ${result.email}`);
    console.log(`🔑 Senha: ${result.password}`);
    console.log(`👤 User ID: ${result.userId}`);
    console.log(`🔐 Role: ${result.role}`);
    
    console.log('\n🔧 INSTRUÇÕES:');
    console.log('1. Use esta senha no sistema');
    console.log('2. Acesse: https://escalasbmi.vercel.app');
    console.log('3. Email: admin@escalasbmi.com');
    console.log(`4. Senha: ${result.password}`);
    
  } else {
    console.log('\n🚨 PROBLEMA CRÍTICO!');
    console.log('-'.repeat(50));
    console.log('❌ Nenhuma senha funcionou');
    console.log('💡 SOLUÇÃO:');
    console.log('1. Acesse Supabase Dashboard');
    console.log('2. Authentication > Users');
    console.log('3. Encontre: admin@escalasbmi.com');
    console.log('4. Reset manual da senha');
    console.log('5. Defina: 1234');
  }
}

main().catch(console.error);
