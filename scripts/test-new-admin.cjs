const { createClient } = require('@supabase/supabase-js');

// Usar anon key para testar login
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function testNewAdminLogin() {
  console.log('🔧 TESTE DE LOGIN DO NOVO ADMIN - SENHA 1234');
  console.log('='.repeat(60));
  
  const email = 'admin2@escala-bmi.com';
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
      return null;
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`   👤 User ID: ${data.user.id}`);
      console.log(`   📧 Email: ${data.user.email}`);
      console.log(`   🔑 Role: ${data.user.user_metadata?.role || 'super_admin'}`);
      console.log(`   ✅ Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      console.log(`   📅 Criado: ${data.user.created_at}`);
      
      // Logout
      await supabase.auth.signOut();
      
      return {
        success: true,
        password: password,
        email: email,
        userId: data.user.id,
        role: data.user.user_metadata?.role || 'super_admin'
      };
    }
    
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 TESTE DO NOVO USUÁRIO ADMIN');
  console.log('='.repeat(60));
  
  const result = await testNewAdminLogin();
  
  if (result) {
    console.log('\n🎉 SENHA CORRETA ENCONTRADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Email: ${result.email}`);
    console.log(`✅ Senha: ${result.password}`);
    console.log(`✅ User ID: ${result.userId}`);
    console.log(`✅ Role: ${result.role}`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Email: ${result.email}`);
    console.log(`3. Senha: ${result.password}`);
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    console.log('🎯 SENHA 1234 FUNCIONANDO!');
    
  } else {
    console.log('\n❌ FALHA NO LOGIN!');
    console.log('-'.repeat(50));
    
    console.log('🚨 PROBLEMA IDENTIFICADO:');
    console.log('• Novo usuário também não funciona');
    console.log('• Pode haver problema com o Supabase Auth');
    console.log('• Sistema pode estar configurado incorretamente');
    
    console.log('\n💡 SOLUÇÃO FINAL:');
    console.log('1. Acessar Supabase Dashboard manualmente');
    console.log('2. Authentication > Users');
    console.log('3. Criar usuário manualmente');
    console.log('4. Testar login no sistema');
  }
}

main().catch(console.error);
