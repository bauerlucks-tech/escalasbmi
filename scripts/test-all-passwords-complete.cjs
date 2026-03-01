const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente manualmente
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const env = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  }
  
  return {};
}

// Carregar variáveis de ambiente
const env = loadEnv();

// Usar service role key do .env
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAllPasswords() {
  console.log('🔧 TESTE COMPLETO DE TODAS AS SENHAS');
  console.log('='.repeat(70));
  
  const username = 'ADMIN';
  const passwords = [
    '1234',
    '123asd',
    'admin123',
    'admin',
    'password',
    '123456',
    'ADMIN',
    'ricardo123'
  ];
  
  console.log('📋 DADOS DO TESTE:');
  console.log(`   Usuário: ${username}`);
  console.log(`   Senhas a testar: ${passwords.length}`);
  console.log(`   Método: Direto (bypass Supabase Auth)`);
  
  console.log(`\n🔑 Configuração:`);
  console.log(`   URL: ${env.VITE_SUPABASE_URL}`);
  console.log(`   Service Key: ${env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  
  let workingPassword = null;
  
  for (const password of passwords) {
    try {
      console.log(`\n🔍 Testando senha: "${password}"`);
      
      // Buscar usuário diretamente na tabela users
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .eq('status', 'ativo')
        .single();
      
      if (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        continue;
      }
      
      if (user) {
        console.log(`   ✅ SUCESSO! Senha "${password}" funciona!`);
        console.log(`   👤 ID: ${user.id}`);
        console.log(`   📛 Nome: ${user.name}`);
        console.log(`   🔐 Role: ${user.role}`);
        console.log(`   📧 Email: ${user.email || 'N/A'}`);
        console.log(`   ✅ Status: ${user.status}`);
        
        workingPassword = password;
        break;
      } else {
        console.log(`   ❌ Falhou: usuário não encontrado`);
      }
      
    } catch (err) {
      console.log(`   ❌ Erro geral: ${err.message}`);
    }
  }
  
  if (workingPassword) {
    console.log('\n🎉 SENHA FUNCIONAL ENCONTRADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Usuário: ${username}`);
    console.log(`✅ Senha: ${workingPassword}`);
    console.log(`✅ Método: Login Direto`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Usuário: ${username}`);
    console.log(`3. Senha: ${workingPassword}`);
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    console.log('🎯 SENHA CONFIRMADA FUNCIONANDO!');
    
    return workingPassword;
    
  } else {
    console.log('\n❌ NENHUMA SENHA FUNCIONOU!');
    console.log('-'.repeat(50));
    
    console.log('🚨 PROBLEMAS IDENTIFICADOS:');
    console.log('• Nenhuma senha testada funciona');
    console.log('• Pode haver problema com o banco');
    console.log('• Usuário pode não existir');
    console.log('• Senha pode estar incorreta');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Verificar se usuário existe no banco');
    console.log('2. Verificar senha correta no banco');
    console.log('3. Verificar status do usuário');
    console.log('4. Verificar configuração do Supabase');
    
    return null;
  }
}

async function main() {
  console.log('🔧 DIAGNÓSTICO COMPLETO DO LOGIN');
  console.log('='.repeat(70));
  
  const workingPassword = await testAllPasswords();
  
  if (workingPassword) {
    console.log('\n🎉 SOLUÇÃO ENCONTRADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 VANTAGENS DO SISTEMA:');
    console.log('✅ Senha funcional confirmada');
    console.log('✅ Login direto funcionando');
    console.log('✅ Bypass do Supabase Auth');
    console.log('✅ Controle total da autenticação');
    
    console.log('\n🔐 CREDENCIAIS FINAIS:');
    console.log('Usuário: ADMIN');
    console.log(`Senha: ${workingPassword}`);
    console.log('Role: super_admin');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Usar senha confirmada no sistema');
    console.log('2. Implementar frontend com login direto');
    console.log('3. Testar acesso completo');
    
  } else {
    console.log('\n❌ FALHA COMPLETA!');
    console.log('-'.repeat(50));
    
    console.log('🚨 DIAGNÓSTICO FINAL:');
    console.log('• Sistema de login não funciona');
    console.log('• Nenhuma senha é aceita');
    console.log('• Pode haver problema estrutural');
    
    console.log('\n💡 AÇÃO NECESSÁRIA:');
    console.log('1. Revisar completamente o sistema');
    console.log('2. Verificar configuração do frontend');
    console.log('3. Verificar integração com Supabase');
    console.log('4. Considerar rebuild completo');
  }
}

main().catch(console.error);
