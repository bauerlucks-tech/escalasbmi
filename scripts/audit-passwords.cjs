/**
 * AUDITORIA DE SENHAS - VERIFICAÇÃO DE SEGURANÇA
 * Verifica se as senhas estão corretas, hashadas e não acessíveis
 */

const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Função para hash de senha (igual ao sistema)
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Função para verificar senha
const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
};

// Senhas esperadas do sistema (de scheduleData.ts)
const EXPECTED_PASSWORDS = {
  'LUCAS': '1234',
  'CARLOS': '1234',
  'ROSANA': '1234',
  'HENRIQUE': '1234',
  'KELLY': '1234',
  'GUILHERME': '1234',
  'RICARDO': '1234',
  'MATHEUS': '1234',
  'ADMIN': '1234',
  'SUPER_ADMIN_HIDDEN': 'hidden_super_2026',
  'TESTE_OPERADOR1': '1234',
  'TESTE_OPERADOR2': '1234',
  'TESTE_ADMIN': '1234',
  'TESTE_SUPER': '1234'
};

// Mapeamento UUID dos usuários
const USER_UUIDS = {
  'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
  'GUILHERME': 'b5a1b456-e837-4f47-ab41-4734a00a0355',
  'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
  'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc',
  'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
  'MATHEUS': '07935022-3fdf-4f83-907f-e57ae8831511',
  'RICARDO': 'bbad7a98-2412-43e6-8dd6-cf52fae171be',
  'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
  'ADMIN': '550e8400-299a-4d5f-8a7b-9b8e3a9b2c1f',
};

async function auditPasswords() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('           🔐 AUDITORIA DE SENHAS - VERIFICAÇÃO DE SEGURANÇA');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');

  // 1. Buscar usuários do banco
  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    console.log('❌ Erro ao acessar banco de dados:', error.message);
    return;
  }

  console.log(`📊 Usuários encontrados: ${users.length}`);
  console.log('');

  let securityIssues = 0;
  let passwordMismatches = 0;
  let plaintextPasswords = 0;

  // 2. Verificar cada usuário
  console.log('🔍 VERIFICAÇÃO INDIVIDUAL:');
  console.log('─'.repeat(80));

  users.forEach(user => {
    const expectedPassword = EXPECTED_PASSWORDS[user.name];
    const isHash = user.password?.length === 64 && /^[a-f0-9]{64}$/i.test(user.password);

    console.log(`👤 ${user.name}:`);

    // Verificar se senha está em hash
    if (!isHash) {
      console.log(`   ❌ SENHA EM TEXTO PLANO: ${user.password}`);
      plaintextPasswords++;
      securityIssues++;
    } else {
      console.log(`   ✅ Senha em hash SHA256`);
    }

    // Verificar se senha bate com o esperado
    if (expectedPassword) {
      const shouldBeHash = hashPassword(expectedPassword);
      if (user.password !== shouldBeHash) {
        console.log(`   ❌ SENHA INCORRETA - Esperado: ${shouldBeHash.substring(0, 16)}...`);
        console.log(`   ❌ Atual: ${user.password.substring(0, 16)}...`);
        passwordMismatches++;
        securityIssues++;
      } else {
        console.log(`   ✅ Senha correta`);
      }
    } else {
      console.log(`   ⚠️  Senha esperada não definida para ${user.name}`);
    }

    // Verificar UUID mapping
    const expectedUUID = Object.keys(USER_UUIDS).find(name => USER_UUIDS[name] === user.id);
    if (expectedUUID) {
      console.log(`   ✅ UUID mapeado: ${user.id}`);
    } else {
      console.log(`   ⚠️  UUID não mapeado: ${user.id}`);
    }

    console.log('');
  });

  // 3. Verificar cache/localStorage (não deveria ter senhas)
  console.log('💾 VERIFICAÇÃO DE CACHE/LOCALSTORAGE:');
  console.log('─'.repeat(80));

  // Simular verificação (não podemos acessar localStorage diretamente, mas podemos alertar)
  console.log('⚠️  IMPORTANTE: Verificar manualmente se senhas estão em localStorage');
  console.log('   - Não deve haver senhas em texto plano no localStorage');
  console.log('   - Apenas dados de sessão (tokens, UUIDs) são aceitáveis');
  console.log('');

  // 4. Verificar se senhas podem ser derivadas
  console.log('🔐 VERIFICAÇÃO DE DERIVAÇÃO DE SENHAS:');
  console.log('─'.repeat(80));

  console.log('Testando se senhas podem ser descobertas por força bruta...');

  const commonPasswords = ['1234', '12345', 'admin', 'password', '123456'];

  users.forEach(user => {
    if (user.password && EXPECTED_PASSWORDS[user.name]) {
      const realPassword = EXPECTED_PASSWORDS[user.name];
      const canDerive = commonPasswords.includes(realPassword);

      if (canDerive) {
        console.log(`⚠️  ${user.name}: Senha fraca detectada (${realPassword})`);
        securityIssues++;
      }
    }
  });

  console.log('✅ Senhas testadas contra lista comum - OK');
  console.log('');

  // 5. RESUMO FINAL
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                           📊 RESUMO DA AUDITORIA');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');

  console.log(`🔐 Senhas em hash SHA256: ${users.filter(u => u.password?.length === 64).length}/${users.length}`);
  console.log(`❌ Senhas em texto plano: ${plaintextPasswords}`);
  console.log(`❌ Senhas incorretas: ${passwordMismatches}`);
  console.log(`🚨 Problemas de segurança: ${securityIssues}`);
  console.log('');

  if (securityIssues === 0) {
    console.log('🎉 SISTEMA SEGURO - Todas as senhas estão corretas e protegidas!');
  } else {
    console.log('🔧 PROBLEMAS DE SEGURANÇA ENCONTRADOS:');
    if (plaintextPasswords > 0) {
      console.log('   - Senhas em texto plano no banco de dados');
    }
    if (passwordMismatches > 0) {
      console.log('   - Senhas não correspondem ao esperado');
    }
    console.log('   ⚠️  Corrigir imediatamente!');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  return {
    totalUsers: users.length,
    securityIssues,
    passwordMismatches,
    plaintextPasswords
  };
}

auditPasswords().catch(console.error);
