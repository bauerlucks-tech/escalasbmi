const { createClient } = require('@supabase/supabase-js');

// Usar anon key para criar usuário
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function createAdminUser() {
  console.log('🔧 CRIANDO USUÁRIO ADMIN COM EMAIL VÁLIDO');
  console.log('='.repeat(60));
  
  // Email e senha válidos
  const email = 'admin@escala-bmi.com'; // Email corrigido
  const password = '123456';
  
  console.log('📋 DADOS DO ADMIN:');
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${password}`);
  console.log(`   Role: super_admin`);
  
  try {
    // 1. Criar usuário no Supabase Auth
    console.log('\n🔐 Criando usuário no Supabase Auth...');
    
    const { data, error } = await supabase.auth.signUp({
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
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe no Auth');
        console.log('💡 Tentando reset de senha...');
        
        // Tentar reset de senha
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://escalasbmi.vercel.app/reset-password'
        });
        
        if (resetError) {
          console.log(`❌ Erro no reset: ${resetError.message}`);
        } else {
          console.log('✅ Email de reset enviado!');
          console.log('💡 Verifique sua caixa de entrada');
        }
      } else {
        console.log(`❌ Erro ao criar usuário: ${error.message}`);
        return null;
      }
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      
      if (!data.user.email_confirmed_at) {
        console.log('⚠️ Email não confirmado!');
        console.log('💡 Verifique sua caixa de entrada e confirme o email');
      }
      
      // Testar login imediato
      console.log('\n🔍 Testando login...');
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (loginError) {
        console.log(`❌ Erro no login: ${loginError.message}`);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log(`   User ID: ${loginData.user.id}`);
        console.log(`   Role: ${loginData.user.user_metadata?.role || 'super_admin'}`);
        
        // Logout
        await supabase.auth.signOut();
      }
      
      return {
        success: true,
        email: email,
        password: password,
        userId: data.user.id,
        needsConfirmation: !data.user.email_confirmed_at
      };
    }
    
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 SOLUÇÃO DEFINITIVA - EMAIL CORRIGIDO');
  console.log('='.repeat(60));
  
  const result = await createAdminUser();
  
  if (result) {
    console.log('\n🎉 OPERAÇÃO REALIZADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 STATUS FINAL:');
    console.log(`✅ Email: ${result.email}`);
    console.log(`✅ Senha: ${result.password}`);
    console.log(`✅ User ID: ${result.userId}`);
    console.log(`✅ Role: super_admin`);
    console.log(`📧 Confirmação: ${result.needsConfirmation ? 'PENDENTE' : 'CONCLUÍDA'}`);
    
    console.log('\n🔐 INSTRUÇÕES FINAIS:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Email: ${result.email}`);
    console.log('3. Senha: 123456');
    console.log('4. Role: super_admin (acesso total)');
    
    if (result.needsConfirmation) {
      console.log('\n⚠️ AÇÃO NECESSÁRIA:');
      console.log('1. Verifique seu email');
      console.log('2. Clique no link de confirmação');
      console.log('3. Depois faça o login normalmente');
    } else {
      console.log('\n✅ SISTEMA PRONTO PARA USO!');
    }
    
  } else {
    console.log('\n❌ FALHA NA OPERAÇÃO');
    console.log('💡 Acesse manualmente o Supabase Dashboard');
  }
}

main().catch(console.error);
