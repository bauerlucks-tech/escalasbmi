const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do .env
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  // Tentar carregar do .env
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length);
      } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseKey = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length);
      }
    });
  }
} catch (error) {
  console.log('⚠️ Erro ao carregar .env:', error.message);
}

// Se não encontrou no .env, tentar das variáveis de ambiente
if (!supabaseUrl) supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseKey) supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Para verificação, usar anon key (seguro)
if (!supabaseUrl) supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseKey) {
  // Usar anon key para leitura (mais seguro)
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserRole(username) {
  console.log(`🔍 Verificando role do usuário: ${username}`);
  
  const { data: user, error } = await supabase
    .from('users')
    .select('name, role, status, created_at')
    .ilike('name', username)
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.log(`❌ Erro: ${error.message}`);
    return null;
  }
  
  if (user) {
    console.log(`✅ Usuário encontrado:`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Criado: ${user.created_at}`);
    console.log('');
    
    // Verificar permissões baseadas no role
    const permissions = {
      'operador': [
        'Visualizar escalas',
        'Solicitar trocas',
        'Responder solicitações',
        '❌ NÃO pode gerenciar usuários',
        '❌ NÃO pode aprovar solicitações'
      ],
      'administrador': [
        'Visualizar escalas',
        'Solicitar trocas',
        'Responder solicitações',
        '✅ Pode aprovar solicitações',
        '✅ Pode gerenciar usuários',
        '❌ NÃO pode acessar configurações do sistema'
      ],
      'super_admin': [
        'Visualizar escalas',
        'Solicitar trocas',
        'Responder solicitações',
        '✅ Pode aprovar solicitações',
        '✅ Pode gerenciar usuários',
        '✅ Pode acessar configurações do sistema',
        '✅ Controle total do sistema'
      ]
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

async function checkSuperAdminPassword() {
  console.log('\n🔍 VERIFICANDO SENHA DO SUPER_ADMIN');
  console.log('-'.repeat(50));
  
  const { data: adminUser, error } = await supabase
    .from('users')
    .select('name, role, status')
    .eq('name', 'ADMIN')
    .single();
  
  if (error) {
    console.log(`❌ Erro ao buscar ADMIN: ${error.message}`);
    return null;
  }
  
  if (adminUser) {
    console.log(`✅ Usuário ADMIN encontrado:`);
    console.log(`   Nome: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: ${adminUser.status}`);
    
    console.log('\n🔐 ANÁLISE DE SEGURANÇA:');
    console.log('   O usuário ADMIN é o SUPER_ADMIN padrão');
    console.log('   Senha deve ser definida via Supabase Auth');
    console.log('   Não deve usar senha aleatória ou hardcoded');
    
    return adminUser;
  } else {
    console.log('❌ Usuário ADMIN não encontrado');
    return null;
  }
}

async function main() {
  console.log('🔍 ANÁLISE COMPLETA DE ROLES E SEGURANÇA');
  console.log('='.repeat(60));
  
  // Verificar Ricardo
  const ricardoUser = await checkUserRole('RICARDO');
  
  if (ricardoUser) {
    console.log('\n🎯 ANÁLISE DO ROLE DO RICARDO:');
    console.log('-'.repeat(50));
    
    switch (ricardoUser.role) {
      case 'operador':
        console.log('❌ PROBLEMA CRÍTICO:');
        console.log('   RICARDO está como "operador" (limitado)');
        console.log('   ❌ Não pode gerenciar usuários');
        console.log('   ❌ Não pode aprovar solicitações');
        console.log('   💡 DEVE ser "administrador" para funcionar');
        break;
      case 'administrador':
        console.log('✅ RICARDO está como "administrador" (CORRETO)');
        console.log('   ✅ Pode gerenciar usuários');
        console.log('   ✅ Pode aprovar solicitações');
        console.log('   ❌ Não pode acessar configurações do sistema');
        console.log('   💡 Isso é adequado para administrador do sistema');
        break;
      case 'super_admin':
        console.log('⚠️ RICARDO está como "super_admin" (excesso)');
        console.log('   ✅ Pode gerenciar usuários');
        console.log('   ✅ Pode aprovar solicitações');
        console.log('   ✅ Pode acessar configurações do sistema');
        console.log('   💡 Pode ser excessivo para administrador padrão');
        break;
      default:
        console.log(`⚠️ RICARDO tem role desconhecido: "${ricardoUser.role}"`);
        break;
    }
    
    console.log('\n📋 RESUMO DO RICARDO:');
    console.log(`   Usuário: ${ricardoUser.name}`);
    console.log(`   Role atual: ${ricardoUser.role}`);
    console.log(`   Status: ${ricardoUser.status}`);
    console.log(`   Pode gerenciar usuários: ${ricardoUser.role === 'administrador' || ricardoUser.role === 'super_admin' ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Pode acessar configurações: ${ricardoUser.role === 'super_admin' ? '✅ SIM' : '❌ NÃO'}`);
  }
  
  // Verificar senha do super_admin
  await checkSuperAdminPassword();
  
  console.log('\n🎯 RECOMENDAÇÕES FINAIS:');
  console.log('-'.repeat(40));
  console.log('1. RICARDO deve permanecer como "administrador"');
  console.log('2. Acesso "super_admin" deve exigir senha do ADMIN');
  console.log('3. Senha do ADMIN deve ser configurada via Supabase Auth');
  console.log('4. Não usar senhas aleatórias ou hardcoded');
  console.log('5. Implementar autenticação de dois fatores para super_admin');
}

main().catch(console.error);
