/**
 * VERIFICAÇÃO SIMPLES DE SENHAS
 */

const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwItoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Função para hash de senha (igual ao sistema)
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Senhas esperadas do sistema
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

async function checkPasswords() {
  console.log('🔐 VERIFICAÇÃO DE SENHAS NO BANCO DE DADOS\n');

  const { data: users, error } = await supabase.from('users').select('*');

  if (error) {
    console.log('❌ Erro:', error.message);
    return;
  }

  console.log('USUÁRIOS ENCONTRADOS:');
  users.forEach(user => {
    const expectedPassword = EXPECTED_PASSWORDS[user.name];
    const isHash = user.password?.length === 64 && /^[a-f0-9]{64}$/i.test(user.password);

    console.log(`\n👤 ${user.name}:`);
    console.log(`   UUID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);

    if (expectedPassword) {
      const expectedHash = hashPassword(expectedPassword);
      const matches = user.password === expectedHash;

      console.log(`   Senha esperada: ${expectedPassword}`);
      console.log(`   Hash esperado: ${expectedHash.substring(0, 16)}...`);
      console.log(`   Hash atual: ${user.password?.substring(0, 16) || 'null'}...`);
      console.log(`   ✅ Correto: ${matches ? 'SIM' : 'NÃO'}`);

      if (!matches) {
        console.log(`   ❌ PROBLEMA: Senha não corresponde!`);
      }
    } else {
      console.log(`   ⚠️ Senha esperada não definida`);
    }

    console.log(`   🔒 Está em hash: ${isHash ? 'SIM' : 'NÃO'}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('VERIFICAÇÃO DE CACHE/LOCALSTORAGE:');
  console.log('⚠️ IMPORTANTE: Verificar manualmente no navegador!');
  console.log('- Abrir DevTools > Application > Local Storage');
  console.log('- Verificar se há senhas em texto plano');
  console.log('- Apenas dados de sessão devem estar presentes');
  console.log('='.repeat(60));
}

checkPasswords().catch(console.error);
