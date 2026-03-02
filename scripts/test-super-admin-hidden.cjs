const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function testSuperAdminHidden() {
  console.log('🔍 TESTANDO SUPER ADMIN HIDDEN');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar se existe SUPER_ADMIN_HIDDEN no banco
    console.log('\n📋 PASSO 1: Verificando SUPER_ADMIN_HIDDEN...');
    
    const { data: hiddenUser, error: hiddenError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'SUPER_ADMIN_HIDDEN')
      .single();
    
    if (hiddenError) {
      console.log('❌ SUPER_ADMIN_HIDDEN não encontrado:', hiddenError.message);
      
      // Tentar criar o usuário
      console.log('\n📋 PASSO 2: Criando SUPER_ADMIN_HIDDEN...');
      
      const { data: newUser, error: createError } = await serviceClient
        .from('users')
        .insert({
          name: 'SUPER_ADMIN_HIDDEN',
          email: 'superadmin@escala-bmi.com',
          password: 'hidden_super_2026',
          role: 'super_admin',
          status: 'ativo',
          hide_from_schedule: true
        })
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Erro ao criar SUPER_ADMIN_HIDDEN:', createError.message);
      } else {
        console.log('✅ SUPER_ADMIN_HIDDEN criado com sucesso!');
        console.log(`  - ID: ${newUser.id}`);
        console.log(`  - Nome: ${newUser.name}`);
        console.log(`  - Email: ${newUser.email}`);
        console.log(`  - Senha: hidden_super_2026`);
        console.log(`  - Role: ${newUser.role}`);
      }
    } else {
      console.log('✅ SUPER_ADMIN_HIDDEN encontrado:');
      console.log(`  - ID: ${hiddenUser.id}`);
      console.log(`  - Nome: ${hiddenUser.name}`);
      console.log(`  - Email: ${hiddenUser.email}`);
      console.log(`  - Senha: ${hiddenUser.password}`);
      console.log(`  - Role: ${hiddenUser.role}`);
      console.log(`  - Status: ${hiddenUser.status}`);
      
      // Testar senha
      if (hiddenUser.password === 'hidden_super_2026') {
        console.log('✅ Senha "hidden_super_2026" correta!');
      } else {
        console.log('❌ Senha incorreta');
        console.log(`🔍 Senha no banco: "${hiddenUser.password}"`);
      }
    }
    
    // 2. Listar todos os usuários super_admin
    console.log('\n📋 PASSO 3: Listando todos os super_admin...');
    
    const { data: superAdmins, error: listError } = await serviceClient
      .from('users')
      .select('*')
      .eq('role', 'super_admin')
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.log('❌ Erro ao listar super_admins:', listError.message);
    } else {
      console.log(`✅ Encontrados ${superAdmins.length} usuários super_admin:`);
      
      superAdmins.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Senha: ${user.password}`);
        console.log(`   - Status: ${user.status}`);
        console.log(`   - Hide from schedule: ${user.hide_from_schedule}`);
      });
    }
    
    // 3. Testar login do SUPER_ADMIN_HIDDEN
    console.log('\n📋 PASSO 4: Testando login SUPER_ADMIN_HIDDEN...');
    
    try {
      const { data: loginTest, error: loginError } = await serviceClient
        .from('users')
        .select('*')
        .eq('email', 'superadmin@escala-bmi.com')
        .eq('password', 'hidden_super_2026')
        .eq('status', 'ativo')
        .single();
      
      if (loginError) {
        console.log('❌ Login SUPER_ADMIN_HIDDEN falhou:', loginError.message);
      } else {
        console.log('✅ Login SUPER_ADMIN_HIDDEN funcionando!');
        console.log(`  - Usuário: ${loginTest.name}`);
        console.log(`  - Role: ${loginTest.role}`);
      }
    } catch (loginException) {
      console.log('❌ Exceção no login:', loginException.message);
    }
    
    // 4. Instruções finais
    console.log('\n🎯 INSTRUÇÕES FINAIS:');
    console.log('='.repeat(40));
    console.log('🔑 ACESSO SUPER ADMIN HIDDEN:');
    console.log('1. Procure pelo nome "Lucas Pott" na interface');
    console.log('2. Clique na chave 🔑 que aparece ao lado');
    console.log('3. Digite a senha: hidden_super_2026');
    console.log('4. Acesso Super Admin será concedido');
    console.log('5. Usuário: SUPER_ADMIN_HIDDEN');
    console.log('6. Role: super_admin');
    console.log('7. Status: ativo');
    
    console.log('\n📝 ALTERNATIVA - Login Direto:');
    console.log('Se a chave não funcionar, tente login direto:');
    console.log('- Email: superadmin@escala-bmi.com');
    console.log('- Senha: hidden_super_2026');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSuperAdminHidden();
