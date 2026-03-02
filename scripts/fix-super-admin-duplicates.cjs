/**
 * Script para corrigir usuários ADMIN duplicados no banco de dados
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixDuplicates() {
  console.log('========================================');
  console.log('  CORRECAO DE ADMINs DUPLICADOS');
  console.log('========================================\n');

  // 1. Buscar todos os ADMINs
  const { data: allUsers } = await supabase.from('users').select('*');
  
  const adminUsers = allUsers.filter(u => u.name === 'ADMIN');
  
  console.log('Encontrados: ' + adminUsers.length + ' ADMINs\n');

  adminUsers.forEach((u, i) => {
    console.log((i+1) + '. ID: ' + u.id);
    console.log('   Role: ' + u.role);
    console.log('   Status: ' + u.status + '\n');
  });

  // 2. Arquivar duplicados (manter apenas o primeiro)
  if (adminUsers.length > 1) {
    const keepAdmin = adminUsers[0];
    const archiveAdmins = adminUsers.slice(1);
    
    console.log('Mantendo: ' + keepAdmin.id + '\n');
    console.log('Arquivando ' + archiveAdmins.length + ' duplicados...\n');
    
    for (const admin of archiveAdmins) {
      const { error } = await supabase
        .from('users')
        .update({ status: 'arquivado' })
        .eq('id', admin.id);
      
      if (error) {
        console.log('ERRO: ' + error.message);
      } else {
        console.log('Arquivado: ' + admin.id);
      }
    }
  }

  // 3. Verificar resultado
  console.log('\n========================================');
  console.log('  USUARIOS ATIVOS FINAIS');
  console.log('========================================\n');
  
  const { data: finalUsers } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'ativo')
    .order('name');
  
  finalUsers.forEach(u => {
    console.log('- ' + u.name + ' (' + u.role + ')');
  });
  
  console.log('\nFeito!');
}

fixDuplicates().catch(console.error);
