const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function debugMatheusLogin() {
  console.log('🔍 DEBUG DO LOGIN DO MATHEUS');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar se Matheus existe no banco
    console.log('\n📋 PASSO 1: Verificando Matheus no banco...');
    
    const { data: matheus, error: findError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'MATHEUS')
      .single();
    
    if (findError) {
      console.log('❌ Matheus não encontrado:', findError.message);
      return;
    }
    
    console.log('✅ Matheus encontrado:');
    console.log(`  - ID: ${matheus.id}`);
    console.log(`  - Nome: ${matheus.name}`);
    console.log(`  - Email: ${matheus.email}`);
    console.log(`  - Senha: ${matheus.password}`);
    console.log(`  - Role: ${matheus.role}`);
    console.log(`  - Status: ${matheus.status}`);
    console.log(`  - Hide from schedule: ${matheus.hide_from_schedule}`);
    
    // 2. Verificar se há problemas com o email
    console.log('\n📋 PASSO 2: Verificando email...');
    
    if (!matheus.email) {
      console.log('❌ Matheus não tem email definido!');
      
      // Adicionar email
      console.log('\n📋 PASSO 3: Adicionando email para Matheus...');
      
      const { data: updatedUser, error: updateError } = await serviceClient
        .from('users')
        .update({ email: 'matheus@escala-bmi.com' })
        .eq('id', matheus.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Erro ao adicionar email:', updateError.message);
      } else {
        console.log('✅ Email adicionado com sucesso!');
        console.log(`  - Email: ${updatedUser.email}`);
        matheus.email = updatedUser.email;
      }
    } else {
      console.log('✅ Email já definido:', matheus.email);
    }
    
    // 3. Testar login por nome de usuário
    console.log('\n📋 PASSO 4: Testando login por nome "MATHEUS"...');
    
    try {
      const { data: loginByName, error: loginByNameError } = await serviceClient
        .from('users')
        .select('*')
        .eq('name', 'MATHEUS')
        .eq('password', '1234')
        .eq('status', 'ativo')
        .single();
      
      if (loginByNameError) {
        console.log('❌ Login por nome falhou:', loginByNameError.message);
      } else {
        console.log('✅ Login por nome "MATHEUS" funcionando!');
        console.log(`  - Usuário: ${loginByName.name}`);
        console.log(`  - Email: ${loginByName.email}`);
        console.log(`  - Role: ${loginByName.role}`);
      }
    } catch (nameLoginException) {
      console.log('❌ Exceção no login por nome:', nameLoginException.message);
    }
    
    // 4. Testar login por email
    console.log('\n📋 PASSO 5: Testando login por email...');
    
    try {
      const { data: loginByEmail, error: loginByEmailError } = await serviceClient
        .from('users')
        .select('*')
        .eq('email', matheus.email)
        .eq('password', '1234')
        .eq('status', 'ativo')
        .single();
      
      if (loginByEmailError) {
        console.log('❌ Login por email falhou:', loginByEmailError.message);
      } else {
        console.log('✅ Login por email funcionando!');
        console.log(`  - Usuário: ${loginByEmail.name}`);
        console.log(`  - Email: ${loginByEmail.email}`);
        console.log(`  - Role: ${loginByEmail.role}`);
      }
    } catch (emailLoginException) {
      console.log('❌ Exceção no login por email:', emailLoginException.message);
    }
    
    // 5. Verificar se há outros usuários com problemas
    console.log('\n📋 PASSO 6: Verificando outros usuários sem email...');
    
    const { data: usersWithoutEmail, error: listError } = await serviceClient
      .from('users')
      .select('name, email, role, status')
      .is('email', null)
      .eq('status', 'ativo');
    
    if (listError) {
      console.log('❌ Erro ao listar usuários sem email:', listError.message);
    } else {
      console.log(`✅ Encontrados ${usersWithoutEmail.length} usuários sem email:`);
      
      usersWithoutEmail.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}:`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Status: ${user.status}`);
      });
      
      if (usersWithoutEmail.length > 0) {
        console.log('\n📋 PASSO 7: Adicionando emails para usuários sem email...');
        
        for (const user of usersWithoutEmail) {
          const email = `${user.name.toLowerCase()}@escala-bmi.com`;
          
          const { data: updated, error: updateError } = await serviceClient
            .from('users')
            .update({ email })
            .eq('name', user.name)
            .select()
            .single();
          
          if (updateError) {
            console.log(`❌ Erro ao adicionar email para ${user.name}:`, updateError.message);
          } else {
            console.log(`✅ Email adicionado para ${user.name}: ${email}`);
          }
        }
      }
    }
    
    // 6. Verificação final do Matheus
    console.log('\n📋 PASSO 8: Verificação final do Matheus...');
    
    const { data: finalCheck, error: finalError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'MATHEUS')
      .single();
    
    if (finalError) {
      console.log('❌ Erro na verificação final:', finalError.message);
    } else {
      console.log('✅ Matheus - Status Final:');
      console.log(`  - ID: ${finalCheck.id}`);
      console.log(`  - Nome: ${finalCheck.name}`);
      console.log(`  - Email: ${finalCheck.email}`);
      console.log(`  - Senha: ${finalCheck.password}`);
      console.log(`  - Role: ${finalCheck.role}`);
      console.log(`  - Status: ${finalCheck.status}`);
      console.log(`  - Hide from schedule: ${finalCheck.hide_from_schedule}`);
    }
    
    // 7. Instruções finais
    console.log('\n🎯 INSTRUÇÕES FINAIS:');
    console.log('='.repeat(40));
    console.log('🔐 Credenciais do Matheus:');
    console.log('  - Nome: MATHEUS');
    console.log(`  - Email: ${finalCheck.email}`);
    console.log('  - Senha: 1234');
    console.log('  - Role: operador');
    console.log('  - Status: ativo');
    
    console.log('\n🔧 Formas de login:');
    console.log('  1. Nome de usuário: MATHEUS');
    console.log(`  2. Email: ${finalCheck.email}`);
    console.log('  3. Senha: 1234');
    
    console.log('\n🚀 Teste no frontend:');
    console.log('  1. Acesse: https://escalasbmi.vercel.app');
    console.log('  2. Use: MATHEUS / 1234');
    console.log('  3. Ou: matheus@escala-bmi.com / 1234');
    
    console.log('\n🔍 Se ainda não funcionar:');
    console.log('  - Limpe cache do navegador');
    console.log('  - Use modo incógnito');
    console.log('  - Verifique console do navegador');
    console.log('  - Confirme se o login direto está ativo');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugMatheusLogin();
