const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function verifyRicardoRole() {
  console.log('🔍 VERIFICANDO ROLE DO RICARDO NO BANCO');
  console.log('='.repeat(50));

  try {
    // Buscar Ricardo no banco
    const { data: ricardo, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'RICARDO')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar Ricardo:', error.message);
      return;
    }

    console.log('✅ Ricardo encontrado:');
    console.log(`  - ID: ${ricardo.id}`);
    console.log(`  - Nome: ${ricardo.name}`);
    console.log(`  - Email: ${ricardo.email}`);
    console.log(`  - Role: ${ricardo.role}`);
    console.log(`  - Status: ${ricardo.status}`);

    // Verificar se é administrador
    const isAdmin = ricardo.role === 'administrador';
    const isSuperAdmin = ricardo.role === 'super_admin';

    console.log('\n🎯 VERIFICAÇÃO DE ROLE:');
    console.log(`  - É administrador: ${isAdmin ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`  - É super admin: ${isSuperAdmin ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`  - Tem acesso admin: ${isAdmin || isSuperAdmin ? '✅ SIM' : '❌ NÃO'}`);

    if (isAdmin || isSuperAdmin) {
      console.log('\n✅ RICARDO TERÁ ACESSO À ADMINISTRAÇÃO');
      console.log('  - Pode ver a escala');
      console.log('  - Pode aprovar trocas');
      console.log('  - Pode aprovar férias');
      console.log('  - Pode editar escala');
    } else {
      console.log('\n❌ RICARDO NÃO TERÁ ACESSO À ADMINISTRAÇÃO');
      console.log('  - Precisa corrigir role no banco');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verifyRicardoRole();
