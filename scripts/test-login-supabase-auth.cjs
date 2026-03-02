const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function testBothAuthMethods() {
  console.log('🔍 TESTANDO AMBOS MÉTODOS DE AUTENTICAÇÃO');
  console.log('='.repeat(60));
  
  try {
    // 1. Testar login direto (service role)
    console.log('\n📋 MÉTODO 1: LOGIN DIRETO (SERVICE ROLE)');
    console.log('-'.repeat(40));
    
    const { data: directUser, error: directError } = await serviceClient
      .from('users')
      .select('*')
      .eq('email', 'admin@escala-bmi.com')
      .single();
    
    if (directError) {
      console.log('❌ Erro login direto:', directError.message);
    } else {
      console.log('✅ Login direto funcionando!');
      console.log(`  - Nome: ${directUser.name}`);
      console.log(`  - Email: ${directUser.email}`);
      console.log(`  - Senha: ${directUser.password}`);
      console.log(`  - Role: ${directUser.role}`);
      
      // Testar senha
      if (directUser.password === '1234') {
        console.log('✅ Senha "1234" correta para login direto');
      } else {
        console.log('❌ Senha "1234" incorreta para login direto');
      }
    }
    
    // 2. Testar Supabase Auth
    console.log('\n📋 MÉTODO 2: SUPABASE AUTH');
    console.log('-'.repeat(40));
    
    try {
      const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
        email: 'admin@escala-bmi.com',
        password: '1234'
      });
      
      if (authError) {
        console.log('❌ Erro Supabase Auth:', authError.message);
        console.log('📝 Detalhes do erro:');
        console.log(`  - Código: ${authError.code || 'N/A'}`);
        console.log(`  - Status: ${authError.status || 'N/A'}`);
        
        // Tentar outras senhas
        const otherPasswords = ['admin', '123asd', 'password', 'admin123'];
        console.log('\n🔍 Testando outras senhas...');
        
        for (const pwd of otherPasswords) {
          try {
            const { data: testAuth, error: testError } = await anonClient.auth.signInWithPassword({
              email: 'admin@escala-bmi.com',
              password: pwd
            });
            
            if (!testError) {
              console.log(`✅ Senha "${pwd}" funcionou no Supabase Auth!`);
              break;
            } else {
              console.log(`❌ Senha "${pwd}" falhou: ${testError.message}`);
            }
          } catch (e) {
            console.log(`❌ Erro ao testar senha "${pwd}": ${e.message}`);
          }
        }
      } else {
        console.log('✅ Supabase Auth funcionou!');
        console.log(`  - User ID: ${authData.user?.id}`);
        console.log(`  - Email: ${authData.user?.email}`);
        console.log(`  - Session: ${authData.session ? 'Ativa' : 'Inativa'}`);
      }
    } catch (authException) {
      console.log('❌ Exceção no Supabase Auth:', authException.message);
    }
    
    // 3. Verificar se existe usuário no auth.users
    console.log('\n📋 MÉTODO 3: VERIFICAR auth.users');
    console.log('-'.repeat(40));
    
    try {
      // Listar todos os usuários do auth (se possível)
      const { data: authUsers, error: listError } = await serviceClient.auth.admin.listUsers();
      
      if (listError) {
        console.log('❌ Erro ao listar auth.users:', listError.message);
      } else {
        console.log(`✅ Encontrados ${authUsers.users.length} usuários no auth.users:`);
        
        const adminAuthUser = authUsers.users.find(u => u.email === 'admin@escala-bmi.com');
        
        if (adminAuthUser) {
          console.log('✅ Usuário ADMIN encontrado no auth.users:');
          console.log(`  - ID: ${adminAuthUser.id}`);
          console.log(`  - Email: ${adminAuthUser.email}`);
          console.log(`  - Confirmado: ${adminAuthUser.email_confirmed_at ? 'Sim' : 'Não'}`);
          console.log(`  - Criado: ${adminAuthUser.created_at}`);
          console.log(`  - Phone: ${adminAuthUser.phone || 'N/A'}`);
        } else {
          console.log('❌ Usuário ADMIN não encontrado no auth.users');
          console.log('📝 Emails encontrados:');
          authUsers.users.forEach(u => {
            console.log(`  - ${u.email}`);
          });
        }
      }
    } catch (adminError) {
      console.log('❌ Erro ao acessar admin.auth:', adminError.message);
    }
    
    // 4. Diagnóstico final
    console.log('\n📋 DIAGNÓSTICO FINAL');
    console.log('-'.repeat(40));
    
    if (directUser && directUser.password === '1234') {
      console.log('✅ Login direto está funcionando');
      console.log('🔧 O frontend deve usar o método de login direto');
      console.log('📝 Verificar se o código está implementado corretamente');
    } else {
      console.log('❌ Login direto não está funcionando');
    }
    
    console.log('\n🎯 RECOMENDAÇÕES:');
    console.log('1. Usar sempre o login direto (service role key)');
    console.log('2. Verificar se o frontend está chamando o método correto');
    console.log('3. Limpar cache do navegador');
    console.log('4. Usar modo incógnito para testar');
    console.log('5. Verificar console do navegador para erros');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testBothAuthMethods();
