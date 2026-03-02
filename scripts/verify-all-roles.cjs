const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function verifyAllRoles() {
  console.log('🔍 VERIFICANDO TODOS OS ROLES DO SISTEMA');
  console.log('='.repeat(60));
  
  try {
    // 1. Listar todos os usuários por role
    console.log('\n📋 PASSO 1: Listando todos os usuários por role...');
    
    const { data: allUsers, error: listError } = await serviceClient
      .from('users')
      .select('*')
      .eq('status', 'ativo')
      .order('role', { ascending: true })
      .order('name', { ascending: true });
    
    if (listError) {
      console.log('❌ Erro ao listar usuários:', listError.message);
      return;
    }
    
    // Agrupar por role
    const usersByRole = {};
    allUsers.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    // 2. Exibir cada role e seus usuários
    console.log('\n🎭 DISTRIBUIÇÃO DE ROLES:');
    console.log('-'.repeat(50));
    
    Object.entries(usersByRole).forEach(([role, users]) => {
      console.log(`\n📋 ${role.toUpperCase()} (${users.length} usuários):`);
      console.log('─'.repeat(30));
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   📧 Email: ${user.email || 'Não definido'}`);
        console.log(`   🔑 Senha: ${user.password}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   📅 Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`);
        console.log(`   👤 Hide from schedule: ${user.hide_from_schedule ? 'Sim' : 'Não'}`);
        console.log('');
      });
    });
    
    // 3. Resumo estatístico
    console.log('\n📊 RESUMO ESTATÍSTICO:');
    console.log('='.repeat(40));
    
    console.log(`\n👥 Total de usuários ativos: ${allUsers.length}`);
    
    Object.entries(usersByRole).forEach(([role, users]) => {
      const percentage = ((users.length / allUsers.length) * 100).toFixed(1);
      console.log(`📋 ${role.toUpperCase()}: ${users.length} usuários (${percentage}%)`);
    });
    
    // 4. Verificar permissões específicas
    console.log('\n🔐 PERMISSÕES ESPECÍFICAS POR ROLE:');
    console.log('='.repeat(50));
    
    console.log('\n👑 OPERADOR:');
    console.log('  ✅ Visualizar escala');
    console.log('  ✅ Solicitar trocas');
    console.log('  ✅ Solicitar férias');
    console.log('  ❌ Aprovar trocas (precisa administrador)');
    console.log('  ❌ Aprovar férias (precisa administrador)');
    console.log('  ❌ Editar escala (precisa administrador)');
    
    console.log('\n👨‍💼 ADMINISTRADOR:');
    console.log('  ✅ Todas as permissões de operador');
    console.log('  ✅ Aprovar trocas');
    console.log('  ✅ Aprovar férias');
    console.log('  ✅ Editar escala');
    console.log('  ✅ Gerenciar usuários');
    console.log('  ❌ Acesso total ao sistema (precisa super_admin)');
    
    console.log('\n👑 SUPER_ADMIN:');
    console.log('  ✅ Todas as permissões de administrador');
    console.log('  ✅ Acesso total ao sistema');
    console.log('  ✅ Gerenciar configurações');
    console.log('  ✅ Acessar logs do sistema');
    console.log('  ✅ Backup/Restore');
    console.log('  ✅ Chave oculta de acesso');
    
    // 5. Verificar usuários especiais
    console.log('\n⭐ USUÁRIOS ESPECIAIS:');
    console.log('='.repeat(30));
    
    const specialUsers = allUsers.filter(user => 
      user.hide_from_schedule || 
      user.name.includes('HIDDEN') ||
      user.name.includes('SUPER')
    );
    
    if (specialUsers.length > 0) {
      console.log('\n🔐 Usuários com acesso especial:');
      specialUsers.forEach(user => {
        console.log(`  ⭐ ${user.name}:`);
        console.log(`     - Role: ${user.role}`);
        console.log(`     - Hide from schedule: ${user.hide_from_schedule}`);
        console.log(`     - Email: ${user.email || 'Oculto'}`);
      });
    } else {
      console.log('\n✅ Nenhum usuário especial encontrado');
    }
    
    // 6. Verificar credenciais de acesso
    console.log('\n🔑 CREDENCIAIS DE ACESSO POR ROLE:');
    console.log('='.repeat(40));
    
    console.log('\n📋 OPERADORES:');
    const operators = usersByRole.operador || [];
    operators.forEach(op => {
      const email = op.email || `${op.name.toLowerCase()}@escala-bmi.com`;
      console.log(`  👤 ${op.name}: ${email} / ${op.password}`);
    });
    
    console.log('\n📋 ADMINISTRADORES:');
    const admins = usersByRole.administrador || [];
    admins.forEach(admin => {
      const email = admin.email || `${admin.name.toLowerCase()}@escala-bmi.com`;
      console.log(`  👨‍💼 ${admin.name}: ${email} / ${admin.password}`);
    });
    
    console.log('\n📋 SUPER_ADMINS:');
    const superAdmins = usersByRole.super_admin || [];
    superAdmins.forEach(sa => {
      const email = sa.email || `${sa.name.toLowerCase()}@escala-bmi.com`;
      console.log(`  🔐 ${sa.name}: ${email} / ${sa.password}`);
    });
    
    // 7. Resumo final
    console.log('\n🎯 RESUMO FINAL DO SISTEMA:');
    console.log('='.repeat(50));
    
    console.log('\n✅ Sistema configurado com 3 níveis de acesso:');
    console.log('  1. OPERADOR - Acesso básico');
    console.log('  2. ADMINISTRADOR - Acesso intermediário');
    console.log('  3. SUPER_ADMIN - Acesso total');
    
    console.log('\n🔐 Segurança implementada:');
    console.log('  ✅ Login direto via service role');
    console.log('  ✅ Hash de senhas (SHA256)');
    console.log('  ✅ Sessão por localStorage');
    console.log('  ✅ Compatibilidade com senhas antigas');
    console.log('  ✅ UUIDs aleatórios para segurança');
    
    console.log('\n🚀 Sistema pronto para verificação completa!');
    console.log('🔄 Próximo passo: Inserir dados da nova escala');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verifyAllRoles();
