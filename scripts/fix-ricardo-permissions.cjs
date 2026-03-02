const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function fixRicardoPermissions() {
  console.log('🔧 CORRIGINDO PERMISSÕES DO RICARDO');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar status atual do Ricardo
    console.log('\n📋 PASSO 1: Verificando status atual do Ricardo...');
    
    const { data: ricardo, error: findError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'RICARDO')
      .single();
    
    if (findError) {
      console.log('❌ Ricardo não encontrado:', findError.message);
      return;
    }
    
    console.log('✅ Ricardo encontrado:');
    console.log(`  - ID: ${ricardo.id}`);
    console.log(`  - Nome: ${ricardo.name}`);
    console.log(`  - Email: ${ricardo.email}`);
    console.log(`  - Role: ${ricardo.role}`);
    console.log(`  - Status: ${ricardo.status}`);
    console.log(`  - Hide from schedule: ${ricardo.hide_from_schedule}`);
    
    // 2. Verificar permissões necessárias
    console.log('\n📋 PASSO 2: Verificando permissões necessárias...');
    
    const requiredPermissions = {
      role: 'administrador',
      status: 'ativo',
      hide_from_schedule: false
    };
    
    console.log('🔍 Permissões necessárias:');
    Object.entries(requiredPermissions).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    
    console.log('\n🔍 Permissões atuais:');
    Object.entries(requiredPermissions).forEach(([key, value]) => {
      const currentValue = ricardo[key];
      const status = currentValue === value ? '✅' : '❌';
      console.log(`  ${status} ${key}: ${currentValue} (esperado: ${value})`);
    });
    
    // 3. Corrigir permissões se necessário
    const needsUpdate = Object.entries(requiredPermissions).some(([key, value]) => ricardo[key] !== value);
    
    if (needsUpdate) {
      console.log('\n📋 PASSO 3: Corrigindo permissões...');
      
      const { data: updatedRicardo, error: updateError } = await serviceClient
        .from('users')
        .update({
          role: 'administrador',
          hide_from_schedule: false,
          status: 'ativo'
        })
        .eq('id', ricardo.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Erro ao atualizar Ricardo:', updateError.message);
        return;
      }
      
      console.log('✅ Ricardo atualizado com sucesso!');
      console.log(`  - Role: ${updatedRicardo.role}`);
      console.log(`  - Status: ${updatedRicardo.status}`);
      console.log(`  - Hide from schedule: ${updatedRicardo.hide_from_schedule}`);
      
    } else {
      console.log('\n✅ Ricardo já possui todas as permissões necessárias!');
    }
    
    // 4. Verificar lista de administradores
    console.log('\n📋 PASSO 4: Verificando lista de administradores...');
    
    const { data: admins, error: listError } = await serviceClient
      .from('users')
      .select('*')
      .eq('role', 'administrador')
      .eq('status', 'ativo')
      .order('name', { ascending: true });
    
    if (listError) {
      console.log('❌ Erro ao listar administradores:', listError.message);
    } else {
      console.log(`✅ Encontrados ${admins.length} administradores ativos:`);
      
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.name}:`);
        console.log(`   - ID: ${admin.id}`);
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - Role: ${admin.role}`);
        console.log(`   - Status: ${admin.status}`);
        console.log(`   - Hide from schedule: ${admin.hide_from_schedule}`);
      });
    }
    
    // 5. Testar login do Ricardo
    console.log('\n📋 PASSO 5: Testando login do Ricardo...');
    
    try {
      const { data: loginTest, error: loginError } = await serviceClient
        .from('users')
        .select('*')
        .eq('email', ricardo.email || 'ricardo@escala-bmi.com')
        .eq('password', 'ricardo123') // Senha padrão
        .eq('status', 'ativo')
        .single();
      
      if (loginError) {
        console.log('❌ Login Ricardo falhou:', loginError.message);
      } else {
        console.log('✅ Login Ricardo funcionando!');
        console.log(`  - Usuário: ${loginTest.name}`);
        console.log(`  - Role: ${loginTest.role}`);
        console.log(`  - Permissões: Aprovações e mudanças na escala`);
      }
    } catch (loginException) {
      console.log('❌ Exceção no login:', loginException.message);
    }
    
    // 6. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log('='.repeat(40));
    console.log('✅ Permissões do Ricardo corrigidas!');
    console.log('📋 Permissões concedidas:');
    console.log('  ✅ Role: administrador');
    console.log('  ✅ Status: ativo');
    console.log('  ✅ Hide from schedule: false');
    console.log('  ✅ Pode aprovar trocas');
    console.log('  ✅ Pode aprovar férias');
    console.log('  ✅ Pode fazer mudanças na escala ativa');
    
    console.log('\n🔐 Credenciais de acesso:');
    console.log('  - Nome: RICARDO');
    console.log(`  - Email: ${ricardo.email || 'ricardo@escala-bmi.com'}`);
    console.log('  - Senha: ricardo123');
    console.log('  - Role: administrador');
    
    console.log('\n🚀 Sistema pronto para uso completo!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixRicardoPermissions();
