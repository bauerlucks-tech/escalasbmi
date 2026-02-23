const { createClient } = require('@supabase/supabase-js');

// Usar as credenciais do frontend (anon key) - apenas para leitura
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function checkUserRole(username) {
  console.log(`🔍 Verificando role do usuário: ${username}`);
  
  const { data, error } = await supabase
    .from('users')
    .select('name, role, status, created_at')
    .eq('name', username);
  
  if (error) {
    console.log(`❌ Erro: ${error.message}`);
    return null;
  }
  
  if (data && data.length > 0) {
    const user = data[0];
    console.log(`✅ Usuário encontrado:`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Criado: ${user.created_at}`);
    console.log('');
    
    // Verificar permissões baseadas no role
    const permissions = {
      'operador': ['Visualizar escalas', 'Solicitar trocas', 'Responder solicitações'],
      'administrador': ['Visualizar escalas', 'Solicitar trocas', 'Responder solicitações', 'Aprovar solicitações', 'Gerenciar usuários'],
      'super_admin': ['Todas as permissões incluindo configurações do sistema']
    };
    
    console.log(`🔐 Permissões do role "${user.role}":`);
    if (permissions[user.role]) {
      permissions[user.role].forEach((perm, index) => {
        console.log(`   ${index + 1}. ${perm}`);
      });
    } else {
      console.log(`   ⚠️ Role desconhecido: ${user.role}`);
    }
    
    return user;
  } else {
    console.log(`❌ Usuário '${username}' não encontrado`);
    return null;
  }
}

async function main() {
  console.log('🔍 VERIFICANDO ROLE DO USUÁRIO RICARDO');
  console.log('='.repeat(50));
  
  const ricardoUser = await checkUserRole('RICARDO');
  
  if (ricardoUser) {
    console.log('\n🎯 ANÁLISE DO ROLE DO RICARDO:');
    console.log('-'.repeat(40));
    
    switch (ricardoUser.role) {
      case 'operador':
        console.log('❌ RICARDO está como "operador" (limitado)');
        console.log('💡 Deveria ser "administrador" para gerenciar usuários');
        break;
      case 'administrador':
        console.log('✅ RICARDO está como "administrador" (correto)');
        console.log('🔑 Pode gerenciar usuários e aprovar solicitações');
        break;
      case 'super_admin':
        console.log('✅ RICARDO está como "super_admin" (acesso total)');
        console.log('🔑 Tem controle completo do sistema');
        break;
      default:
        console.log(`⚠️ RICARDO tem role desconhecido: "${ricardoUser.role}"`);
        break;
    }
    
    console.log('\n📋 RESUMO:');
    console.log(`   Usuário: ${ricardoUser.name}`);
    console.log(`   Role atual: ${ricardoUser.role}`);
    console.log(`   Status: ${ricardoUser.status}`);
    console.log(`   Pode criar usuários: ${ricardoUser.role === 'administrador' || ricardoUser.role === 'super_admin' ? '✅ SIM' : '❌ NÃO'}`);
  }
}

main().catch(console.error);
