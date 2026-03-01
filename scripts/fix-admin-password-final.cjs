const { createClient } = require('@supabase/supabase-js');

// Usar service role key para criar usuário diretamente
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.7K8QzLzZ7J9cR0dM7XhN8wPzY2tKkL9XmF1QpW3s'
);

async function createAdminUserDirectly() {
  console.log('🔧 CRIANDO USUÁRIO ADMIN DIRETAMENTE COM SERVICE ROLE');
  console.log('='.repeat(70));
  
  // Dados do usuário
  const email = 'admin@escala-bmi.com';
  const password = '123asd';
  
  console.log('📋 DADOS DO ADMIN:');
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${password}`);
  console.log(`   Role: super_admin`);
  
  try {
    // 1. Criar usuário no Supabase Auth com service role (bypass rate limit)
    console.log('\n🔐 Criando usuário no Supabase Auth (Service Role)...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        name: 'ADMIN',
        full_name: 'Administrador do Sistema'
      }
    });
    
    if (error) {
      console.log(`❌ Erro ao criar usuário: ${error.message}`);
      
      // Se usuário já existe, tentar reset
      if (error.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe, tentando reset...');
        
        // Reset de senha com service role
        const { error: resetError } = await supabase.auth.admin.updateUserById(
          // Precisamos do ID do usuário para reset
          'admin-user-id', // Placeholder - vamos tentar encontrar
          {
            password: password,
            email_confirm: true
          }
        );
        
        if (resetError) {
          console.log(`❌ Erro no reset: ${resetError.message}`);
          
          // Tentar reset por email
          console.log('🔄 Tentando reset por email...');
          const { error: emailResetError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
              redirectTo: 'https://escalasbmi.vercel.app/reset-password'
            }
          });
          
          if (emailResetError) {
            console.log(`❌ Erro no reset por email: ${emailResetError.message}`);
          } else {
            console.log('✅ Link de reset gerado!');
            console.log('💡 Verifique seu email');
          }
        } else {
          console.log('✅ Senha resetada com sucesso!');
        }
      }
      
      return null;
    } else {
      console.log('✅ Usuário criado com sucesso!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      console.log(`   Role: ${data.user.user_metadata?.role || 'super_admin'}`);
      
      // 2. Garantir que existe na tabela users
      console.log('\n📊 Verificando/criando na tabela users...');
      
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('name', 'ADMIN')
        .maybeSingle();
      
      if (findError && findError.code !== 'PGRST116') {
        console.log(`❌ Erro ao buscar usuário na tabela: ${findError.message}`);
      } else if (existingUser) {
        console.log('✅ Usuário já existe na tabela users');
        console.log(`   ID: ${existingUser.id}`);
        console.log(`   Role: ${existingUser.role}`);
        
        // Atualizar role se necessário
        if (existingUser.role !== 'super_admin') {
          console.log('🔧 Atualizando role para super_admin...');
          
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ role: 'super_admin' })
            .eq('id', existingUser.id)
            .select('*')
            .single();
          
          if (updateError) {
            console.log(`❌ Erro ao atualizar role: ${updateError.message}`);
          } else {
            console.log('✅ Role atualizado para super_admin');
          }
        }
      } else {
        console.log('❌ Usuário não encontrado na tabela users');
        console.log('🔧 Criando usuário na tabela users...');
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: 'ADMIN',
            role: 'super_admin',
            status: 'ativo',
            created_at: new Date().toISOString()
          })
          .select('*')
          .single();
        
        if (createError) {
          console.log(`❌ Erro ao criar usuário na tabela: ${createError.message}`);
        } else {
          console.log('✅ Usuário criado na tabela users!');
          console.log(`   ID: ${newUser.id}`);
          console.log(`   Name: ${newUser.name}`);
          console.log(`   Role: ${newUser.role}`);
          console.log(`   Status: ${newUser.status}`);
        }
      }
      
      // 3. Testar login
      console.log('\n🔍 Testando login...');
      
      const supabaseTest = createClient(
        'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
      );
      
      const { data: loginData, error: loginError } = await supabaseTest.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (loginError) {
        console.log(`❌ Erro no login: ${loginError.message}`);
      } else {
        console.log('✅ Login bem-sucedido!');
        console.log(`   User ID: ${loginData.user.id}`);
        console.log(`   Email: ${loginData.user.email}`);
        console.log(`   Role: ${loginData.user.user_metadata?.role || 'super_admin'}`);
        console.log(`   Confirmado: ${loginData.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
        
        // Logout
        await supabaseTest.auth.signOut();
        
        return {
          success: true,
          email: email,
          password: password,
          userId: data.user.id,
          role: 'super_admin',
          confirmed: !!data.user.email_confirmed_at
        };
      }
    }
    
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 CORREÇÃO DEFINITIVA DA SENHA DO ADMIN');
  console.log('='.repeat(70));
  
  const result = await createAdminUserDirectly();
  
  if (result) {
    console.log('\n🎉 CORREÇÃO REALIZADA COM SUCESSO!');
    console.log('-'.repeat(70));
    
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Email: ${result.email}`);
    console.log(`✅ Senha: ${result.password}`);
    console.log(`✅ User ID: ${result.userId}`);
    console.log(`✅ Role: ${result.role}`);
    console.log(`✅ Confirmado: ${result.confirmed ? 'SIM' : 'NÃO'}`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Email: ${result.email}`);
    console.log(`3. Senha: ${result.password}`);
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    console.log('🎯 SENHA CORRIGIDA: 123asd');
    
  } else {
    console.log('\n❌ FALHA NA CORREÇÃO');
    console.log('-'.repeat(70));
    console.log('💡 Verifique:');
    console.log('• SUPABASE_SERVICE_ROLE_KEY está correta');
    console.log('• Projeto está correto');
    console.log('• Permissões no Supabase');
  }
}

main().catch(console.error);
