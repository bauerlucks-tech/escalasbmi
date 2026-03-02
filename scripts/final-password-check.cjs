/**
 * VERIFICAÇÃO FINAL DE SENHAS - COMPARAÇÃO DIRETA
 */

const CryptoJS = require('crypto-js');

// Função para hash de senha (igual ao sistema)
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

console.log('🔐 VERIFICAÇÃO DE HASH DE SENHAS\n');

// Hash esperado para senha "1234"
const expectedHash1234 = hashPassword('1234');
console.log('Hash esperado para "1234":');
console.log(expectedHash1234);
console.log('');

// Hash esperado para senha "hidden_super_2026"
const expectedHashHidden = hashPassword('hidden_super_2026');
console.log('Hash esperado para "hidden_super_2026":');
console.log(expectedHashHidden);
console.log('');

// Verificar se os hashes do banco batem
const databaseHashes = {
  'most_users': '03ac674216f3e15c761ee8a5f8a5f2c4f83b1e4c4c6d',
  'super_admin_hidden': 'ed2f200c6172d26fd70a5b5b5f5f5f5f5f5f5f5f5f5f'
};

console.log('COMPARAÇÃO COM BANCO DE DADOS:');
console.log('─────────────────────────────');
console.log(`Hash do banco (usuários comuns): ${databaseHashes.most_users}`);
console.log(`Hash esperado (1234):           ${expectedHash1234}`);
console.log(`✅ Correspondem: ${databaseHashes.most_users === expectedHash1234}`);
console.log('');

console.log(`Hash do banco (SUPER_ADMIN):    ${databaseHashes.super_admin_hidden}`);
console.log(`Hash esperado (hidden_super):   ${expectedHashHidden}`);
console.log(`✅ Correspondem: ${databaseHashes.super_admin_hidden === expectedHashHidden}`);
console.log('');

console.log('🔍 CONCLUSÃO:');
if (databaseHashes.most_users === expectedHash1234 &&
    databaseHashes.super_admin_hidden === expectedHashHidden) {
  console.log('✅ TODAS AS SENHAS ESTÃO CORRETAS!');
  console.log('✅ Sistema seguro - senhas hashadas adequadamente');
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS NAS SENHAS');
}

console.log('\n💾 VERIFICAÇÃO DE CACHE:');
console.log('⚠️  IMPORTANTE: Verificar manualmente no navegador!');
console.log('- Abrir DevTools > Application > Local Storage');
console.log('- Verificar se há senhas em texto plano');
console.log('- Apenas dados de sessão devem estar presentes');
