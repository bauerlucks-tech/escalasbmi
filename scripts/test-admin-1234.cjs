const { createClient } = require('@supabase/supabase-js');

// Usar anon key para testar login
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function testAdminLogin() {
  console.log('🔧 TESTE DE LOGIN DO ADMIN - SENHA 1234');
  console.log('='.repeat(60));
  
  const email = 'admin@escala-bmi.com';
  const password = '1234';
  
  console.log('📋 DADOS DO TESTE:');
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${password}`);
  console.log(`   Role: super_admin`);
  
  try {
    console.log('\n🔍 Tentando login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.log(`❌ Erro no login: ${error.message}`);
      console.log(`💡 Detalhes: ${error.hint || 'Sem detalhes adicionais'}`);
      
      // Tentar outras senhas para diagnóstico
      console.log('\n🔍 Testando outras senhas...');
      
      const testPasswords = ['123asd', 'admin123', 'admin', 'password'];
      
      for (const testPwd of testPasswords) {
        console.log(`\n🧪 Testando senha: "${testPwd}"`);
        
        const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
          email: email,
          password: testPwd
        });
        
        if (testError) {
          console.log(`   ❌ Falhou: ${testError.message}`);
        } else {
          console.log(`   ✅ SUCESSO! Login com "${testPwd}"`);
          console.log(`   👤 User ID: ${testData.user.id}`);
          console.log(`   📧 Email: ${testData.user.email}`);
          console.log(`   🔑 Role: ${testData.user.user_metadata?.role || 'desconhecido'}`);
          
          // Logout
          await supabase.auth.signOut();
          
          return {
            success: true,
            password: testPwd,
            email: email,
            userId: testData.user.id
          };
        }
      }
      
      return null;
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`   👤 User ID: ${data.user.id}`);
      console.log(`   📧 Email: ${data.user.email}`);
      console.log(`   🔑 Role: ${data.user.user_metadata?.role || 'super_admin'}`);
      console.log(`   ✅ Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      
      // Logout
      await supabase.auth.signOut();
      
      return {
        success: true,
        password: password,
        email: email,
        userId: data.user.id
      };
    }
    
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 DIAGNÓSTICO FINAL DA SENHA DO ADMIN');
  console.log('='.repeat(60));
  
  const result = await testAdminLogin();
  
  if (result) {
    console.log('\n🎉 SENHA CORRETA ENCONTRADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Email: ${result.email}`);
    console.log(`✅ Senha: ${result.password}`);
    console.log(`✅ User ID: ${result.userId}`);
    console.log(`✅ Role: super_admin`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Email: ${result.email}`);
    console.log(`3. Senha: ${result.password}`);
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    
  } else {
    console.log('\n❌ NENHUMA SENHA FUNCIONOU!');
    console.log('-'.repeat(50));
    
    console.log('🚨 PROBLEMA CRÍTICO:');
    console.log('• Nenhuma senha testada funciona');
    console.log('• Pode haver problema com o auth.users');
    console.log('• Senha pode não estar sincronizada');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Verificar se usuário existe no Supabase Auth');
    console.log('2. Reset manual via Supabase Dashboard');
    console.log('3. Verificar se email está confirmado');
    console.log('4. Recriar usuário completamente');
  }
}

main().catch(console.error);
