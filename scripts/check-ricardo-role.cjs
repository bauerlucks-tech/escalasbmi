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

// Para verificação de role, usar anon key (seguro)
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
    .ilike('name', username)   // case-insensitive match
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
    
    // Verificar se há problema de permissão
    if (ricardoUser.role === 'operador') {
      console.log('\n🚨 PROBLEMA DETECTADO:');
      console.log('   RICARDO está como "operador" mas deveria ser "administrador"');
      console.log('   Isso explica por que ele não vê funções de administrador');
      console.log('   💡 SOLUÇÃO: Atualizar role para "administrador" no banco de dados');
    }
  }
}

main().catch(console.error);
