const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function addOperatorMatheus() {
  console.log('👷 ADICIONANDO OPERADOR MATHEUS');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar se Matheus já existe
    console.log('\n📋 PASSO 1: Verificando se Matheus já existe...');
    
    const { data: existingUser, error: checkError } = await serviceClient
      .from('users')
      .select('*')
      .or('name.eq.MATHEUS,email.eq.matheus@escala-bmi.com')
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Erro ao verificar usuário existente:', checkError.message);
      return;
    }
    
    if (existingUser) {
      console.log('⚠️ Matheus já existe:');
      console.log(`  - Nome: ${existingUser.name}`);
      console.log(`  - Email: ${existingUser.email}`);
      console.log(`  - Role: ${existingUser.role}`);
      console.log(`  - Status: ${existingUser.status}`);
      
      // Perguntar se deseja atualizar
      console.log('\n🔄 Usuário já existe. Deseja atualizar?');
      console.log('Para atualizar, execute o script com parâmetro --update');
      return;
    }
    
    // 2. Adicionar Matheus como operador
    console.log('\n📋 PASSO 2: Adicionando Matheus como operador...');
    
    const newOperator = {
      name: 'MATHEUS',
      email: 'matheus@escala-bmi.com',
      password: '1234', // Senha padrão como os outros operadores
      role: 'operador',
      status: 'ativo',
      hide_from_schedule: false
    };
    
    const { data: createdUser, error: createError } = await serviceClient
      .from('users')
      .insert(newOperator)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Erro ao criar Matheus:', createError.message);
      return;
    }
    
    console.log('✅ Matheus criado com sucesso!');
    console.log(`  - ID: ${createdUser.id}`);
    console.log(`  - Nome: ${createdUser.name}`);
    console.log(`  - Email: ${createdUser.email}`);
    console.log(`  - Senha: ${createdUser.password}`);
    console.log(`  - Role: ${createdUser.role}`);
    console.log(`  - Status: ${createdUser.status}`);
    
    // 3. Verificar lista atualizada de operadores
    console.log('\n📋 PASSO 3: Verificando lista atualizada de operadores...');
    
    const { data: operators, error: listError } = await serviceClient
      .from('users')
      .select('*')
      .eq('role', 'operador')
      .eq('status', 'ativo')
      .order('name', { ascending: true });
    
    if (listError) {
      console.log('❌ Erro ao listar operadores:', listError.message);
    } else {
      console.log(`✅ Encontrados ${operators.length} operadores ativos:`);
      
      operators.forEach((op, index) => {
        console.log(`\n${index + 1}. ${op.name}:`);
        console.log(`   - ID: ${op.id}`);
        console.log(`   - Email: ${op.email}`);
        console.log(`   - Senha: ${op.password}`);
        console.log(`   - Status: ${op.status}`);
        console.log(`   - Hide from schedule: ${op.hide_from_schedule}`);
      });
    }
    
    // 4. Testar login do Matheus
    console.log('\n📋 PASSO 4: Testando login do Matheus...');
    
    try {
      const { data: loginTest, error: loginError } = await serviceClient
        .from('users')
        .select('*')
        .eq('email', 'matheus@escala-bmi.com')
        .eq('password', '1234')
        .eq('status', 'ativo')
        .single();
      
      if (loginError) {
        console.log('❌ Login Matheus falhou:', loginError.message);
      } else {
        console.log('✅ Login Matheus funcionando!');
        console.log(`  - Usuário: ${loginTest.name}`);
        console.log(`  - Role: ${loginTest.role}`);
      }
    } catch (loginException) {
      console.log('❌ Exceção no login:', loginException.message);
    }
    
    // 5. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log('='.repeat(40));
    console.log('✅ Operador MATHEUS adicionado com sucesso!');
    console.log('📋 Credenciais de acesso:');
    console.log('  - Nome: MATHEUS');
    console.log('  - Email: matheus@escala-bmi.com');
    console.log('  - Senha: 1234');
    console.log('  - Role: operador');
    console.log('  - Status: ativo');
    
    console.log('\n🔐 Teste de login:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log('2. Email: matheus@escala-bmi.com');
    console.log('3. Senha: 1234');
    console.log('4. Role: operador');
    
    console.log('\n📊 Sistema pronto para verificação completa!');
    console.log('🔄 Próximo passo: Inserir dados da nova escala');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

addOperatorMatheus();
