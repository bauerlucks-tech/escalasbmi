/**
 * VERIFICAÇÃO SIMPLES DE SENHAS - DEBUG
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function debugPasswords() {
  console.log('🔍 DEBUG: Verificando usuários e senhas...\n');

  try {
    const { data: users, error } = await supabase.from('users').select('*');

    if (error) {
      console.log('❌ Erro na query:', error.message);
      console.log('Detalhes:', JSON.stringify(error, null, 2));
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuários:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`   Password length: ${user.password ? user.password.length : 0}`);
      console.log('');
    });

  } catch (err) {
    console.log('💥 Erro geral:', err.message);
    console.log('Stack:', err.stack);
  }
}

debugPasswords();
