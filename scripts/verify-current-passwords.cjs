/**
 * VERIFICAÇÃO URGENTE: Status atual das senhas no Supabase
 * Verificar se o reset foi aplicado corretamente
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

async function checkCurrentPasswords() {
  console.log('🔍 VERIFICAÇÃO URGENTE: STATUS DAS SENHAS NO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  try {
    // Buscar todos os usuários ativos
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'ativo')
      .order('name');

    if (error) {
      console.log('❌ Erro ao acessar banco:', error.message);
      return;
    }

    console.log(`📊 Usuários ativos encontrados: ${users.length}`);
    console.log('');

    // Hash esperado para "1234"
    const expectedHash1234 = hashPassword('1234');
    const expectedHashSuperAdmin = hashPassword('hidden_super_2026');

    console.log('🎯 HASH ESPERADO PARA "1234":');
    console.log(expectedHash1234);
    console.log('');

    console.log('🎯 HASH ESPERADO PARA "hidden_super_2026":');
    console.log(expectedHashSuperAdmin);
    console.log('');

    console.log('📋 STATUS ATUAL DAS SENHAS:');
    console.log('─'.repeat(80));

    let correctPasswords = 0;
    let incorrectPasswords = 0;

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Hash atual: ${user.password}`);

      // Verificar se está correto
      const expectedHash = user.name === 'SUPER_ADMIN_HIDDEN' ? expectedHashSuperAdmin : expectedHash1234;
      const isCorrect = user.password === expectedHash;

      console.log(`   Hash esperado: ${expectedHash}`);
      console.log(`   ✅ Correto: ${isCorrect ? 'SIM' : 'NÃO'}`);

      if (isCorrect) {
        correctPasswords++;
        console.log(`   🟢 STATUS: RESETADO CORRETAMENTE`);
      } else {
        incorrectPasswords++;
        console.log(`   🔴 STATUS: SENHA INCORRETA - RESET FALHOU`);
      }

      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 RESUMO FINAL:');
    console.log(`✅ Senhas corretas: ${correctPasswords}/${users.length}`);
    console.log(`❌ Senhas incorretas: ${incorrectPasswords}/${users.length}`);
    console.log('');

    if (incorrectPasswords === 0) {
      console.log('🎉 TODAS AS SENHAS FORAM RESETADAS CORRETAMENTE!');
      console.log('✅ Sistema pronto para uso');
    } else {
      console.log('🚨 PROBLEMA: Algumas senhas não foram resetadas!');
      console.log('🔧 É necessário executar o reset novamente');
    }

    console.log('');
    console.log('💡 PRÓXIMO PASSO: Se senhas incorretas, executar reset novamente');

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

checkCurrentPasswords();
