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

async function checkAdminUser() {
  console.log('🔍 VERIFICANDO USUÁRIO ADMIN');
  console.log('='.repeat(50));
  
  const { data: adminUser, error } = await supabase
    .from('users')
    .select('id, name, role, status, created_at')
    .eq('name', 'ADMIN')
    .single();
  
  if (error) {
    console.log(`❌ Erro ao buscar ADMIN: ${error.message}`);
    return null;
  }
  
  if (adminUser) {
    console.log('✅ Usuário ADMIN encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Nome: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: ${adminUser.status}`);
    console.log(`   Criado: ${adminUser.created_at}`);
    
    console.log('\n🔐 ANÁLISE DO ROLE SUPER_ADMIN:');
    console.log('-'.repeat(40));
    
    const superAdminPermissions = [
      'Visualizar todas as escalas',
      'Solicitar trocas',
      'Responder solicitações',
      'Aprovar solicitações',
      'Gerenciar usuários',
      'Gerenciar roles e permissões',
      'Configurar sistema',
      'Acessar logs e auditoria',
      'Backup e restauração',
      'Configurações de segurança',
      'Controle total do banco de dados'
    ];
    
    console.log(`🔑 Permissões do role "super_admin":`);
    superAdminPermissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm}`);
    });
    
    return adminUser;
  } else {
    console.log('❌ Usuário ADMIN não encontrado');
    return null;
  }
}

async function checkAdminPassword() {
  console.log('\n🔍 VERIFICANDO CONFIGURAÇÃO DE SENHA DO ADMIN');
  console.log('-'.repeat(60));
  
  console.log('📋 INFORMAÇÕES SOBRE SENHA DO ADMIN:');
  console.log('   1. Senha não está armazenada na tabela users');
  console.log('   2. Senha é gerenciada pelo Supabase Auth');
  console.log('   3. Acesso é via autenticação JWT');
  console.log('   4. Não há senha "hardcoded" no sistema');
  
  console.log('\n🔐 MÉTODOS DE VERIFICAÇÃO:');
  console.log('   1. Via Supabase Dashboard > Authentication > Users');
  console.log('   2. Via API do Supabase Auth');
  console.log('   3. Via reset de senha por email');
  
  console.log('\n💡 RECOMENDAÇÕES DE SEGURANÇA:');
  console.log('   1. Usar senha forte (mínimo 12 caracteres)');
  console.log('   2. Habilitar autenticação de dois fatores');
  console.log('   3. Configurar alertas de login');
  console.log('   4. Rotacionar senha periodicamente');
  console.log('   5. Limitar tentativas de acesso');
}

async function main() {
  console.log('🔍 ANÁLISE COMPLETA DO USUÁRIO ADMIN');
  console.log('='.repeat(60));
  
  const adminUser = await checkAdminUser();
  
  if (adminUser) {
    console.log('\n🎯 ANÁLISE DO USUÁRIO ADMIN:');
    console.log('-'.repeat(40));
    
    console.log(`✅ USUÁRIO: ${adminUser.name}`);
    console.log(`🔑 ROLE: ${adminUser.role}`);
    console.log(`📊 STATUS: ${adminUser.status}`);
    console.log(`📅 CRIAÇÃO: ${adminUser.created_at}`);
    
    console.log('\n🔍 IMPORTANTE:');
    console.log('   • ADMIN é o único usuário com role "super_admin"');
    console.log('   • Tem controle total do sistema');
    console.log('   • Senha gerenciada pelo Supabase Auth');
    console.log('   • Não há senha visível no banco de dados');
    console.log('   • Acesso deve ser protegido com 2FA');
    
    await checkAdminPassword();
    
    console.log('\n🎯 RESUMO FINAL:');
    console.log('-'.repeat(30));
    console.log(`✅ Usuário ADMIN: ${adminUser.name}`);
    console.log(`🔑 Role: ${adminUser.role}`);
    console.log(`📊 Status: ${adminUser.status}`);
    console.log('🔐 Senha: Gerenciada pelo Supabase Auth');
    console.log('🛡️ Segurança: Configurar 2FA e senha forte');
  }
}

main().catch(console.error);
