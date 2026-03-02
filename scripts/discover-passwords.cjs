/**
 * DESCOBERTA DE SENHAS ATUAIS - BRUTE FORCE CONTROLADO
 * Tenta descobrir quais senhas produzem os hashes do banco
 */

const CryptoJS = require('crypto-js');

// Função para hash de senha (igual ao sistema)
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// Hashes encontrados no banco de dados
const databaseHashes = {
  'common_users': '03ac674216f3e15c761ee8a5f8a5f2c4f83b1e4c4c6d',
  'super_admin_hidden': 'ed2f200c6172d26fd70a5b5b5f5f5f5f5f5f5f5f5f5f'
};

// Lista de senhas possíveis para testar
const possiblePasswords = [
  '1234',
  '12345',
  'admin',
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password123',
  'admin123',
  'root',
  'user',
  'guest',
  'test',
  'teste',
  'hidden_super_2026',
  'superadmin',
  'administrator',
  'sysadmin',
  'hidden_super',
  '2026',
  'super2026',
  'hidden2026'
];

console.log('🔍 DESCOBERTA DE SENHAS ATUAIS\n');
console.log('Testando senhas comuns contra hashes do banco...\n');

// Testar senhas comuns contra hash dos usuários comuns
console.log('🔐 USUÁRIOS COMUNS:');
let foundCommonPassword = null;
for (const password of possiblePasswords) {
  const hash = hashPassword(password);
  if (hash === databaseHashes.common_users) {
    foundCommonPassword = password;
    console.log(`✅ SENHA ENCONTRADA: "${password}"`);
    break;
  }
}

if (!foundCommonPassword) {
  console.log('❌ Senha não encontrada na lista de comuns');
  console.log('   Hash do banco:', databaseHashes.common_users);
}

// Testar senhas contra hash do super admin
console.log('\n🔐 SUPER ADMIN HIDDEN:');
let foundSuperPassword = null;
for (const password of possiblePasswords) {
  const hash = hashPassword(password);
  if (hash === databaseHashes.super_admin_hidden) {
    foundSuperPassword = password;
    console.log(`✅ SENHA ENCONTRADA: "${password}"`);
    break;
  }
}

if (!foundSuperPassword) {
  console.log('❌ Senha não encontrada na lista de comuns');
  console.log('   Hash do banco:', databaseHashes.super_admin_hidden);
}

console.log('\n📊 RESUMO:');
console.log('──────────');
if (foundCommonPassword) {
  console.log(`✅ Senha usuários comuns: "${foundCommonPassword}"`);
} else {
  console.log('❌ Senha usuários comuns: DESCONHECIDA');
}

if (foundSuperPassword) {
  console.log(`✅ Senha Super Admin: "${foundSuperPassword}"`);
} else {
  console.log('❌ Senha Super Admin: DESCONHECIDA');
}

console.log('\n🔒 ANÁLISE DE SEGURANÇA:');
if (foundCommonPassword === '1234' && foundSuperPassword === 'hidden_super_2026') {
  console.log('✅ Senhas corretas conforme esperado');
} else {
  console.log('❌ SENHAS DIFERENTES DO ESPERADO - POSSÍVEL PROBLEMA DE SEGURANÇA');
  console.log('   ⚠️  Verificar se houve alteração não autorizada');
}

console.log('\n💾 VERIFICAÇÃO DE CACHE:');
console.log('⚠️  Verificar manualmente no navegador se senhas estão em localStorage');
console.log('   - Não deve haver senhas em texto plano');
console.log('   - Apenas tokens e dados de sessão são aceitáveis');
