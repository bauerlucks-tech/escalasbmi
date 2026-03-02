/**
 * RESET DE SENHAS - CORREÇÃO CRÍTICA
 * Reseta todas as senhas para "1234" conforme solicitado
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

async function resetPasswords() {
  console.log('🔐 RESET DE SENHAS - CORREÇÃO CRÍTICA');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  try {
    // 1. Buscar todos os usuários ativos
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'ativo');

    if (fetchError) {
      console.log('❌ Erro ao buscar usuários:', fetchError.message);
      return;
    }

    console.log(`📊 Encontrados ${users.length} usuários ativos`);
    console.log('');

    // 2. Calcular hash correto para "1234"
    const correctHash1234 = hashPassword('1234');
    const correctHashSuperAdmin = hashPassword('hidden_super_2026');

    console.log('🔑 Hash correto para "1234":');
    console.log(correctHash1234);
    console.log('');
    console.log('🔑 Hash correto para "hidden_super_2026":');
    console.log(correctHashSuperAdmin);
    console.log('');

    // 3. Resetar senhas de todos os usuários
    let updated = 0;
    let superAdminUpdated = false;

    for (const user of users) {
      let newPassword;
      let newHash;

      if (user.name === 'SUPER_ADMIN_HIDDEN') {
        // Super Admin tem senha especial
        newPassword = 'hidden_super_2026';
        newHash = correctHashSuperAdmin;
      } else {
        // Todos os outros usuários têm senha "1234"
        newPassword = '1234';
        newHash = correctHash1234;
      }

      // Atualizar senha no banco
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newHash })
        .eq('id', user.id);

      if (updateError) {
        console.log(`❌ Erro ao atualizar ${user.name}:`, updateError.message);
      } else {
        console.log(`✅ ${user.name}: senha resetada para "${newPassword}"`);
        updated++;

        if (user.name === 'SUPER_ADMIN_HIDDEN') {
          superAdminUpdated = true;
        }
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DO RESET:');
    console.log(`✅ Usuários atualizados: ${updated}/${users.length}`);
    console.log(`✅ Super Admin corrigido: ${superAdminUpdated ? 'SIM' : 'NÃO'}`);
    console.log('');

    // 4. Verificação final
    console.log('🔍 VERIFICAÇÃO FINAL:');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('name, password')
      .eq('status', 'ativo');

    if (!finalError && finalUsers) {
      let allCorrect = true;
      finalUsers.forEach(user => {
        const expectedHash = user.name === 'SUPER_ADMIN_HIDDEN' ? correctHashSuperAdmin : correctHash1234;
        if (user.password !== expectedHash) {
          allCorrect = false;
          console.log(`❌ ${user.name}: senha ainda incorreta`);
        }
      });

      if (allCorrect) {
        console.log('✅ TODAS AS SENHAS CORRETAS!');
        console.log('✅ Sistema de autenticação restaurado');
      }
    }

    console.log('');
    console.log('🎯 PRÓXIMO PASSO: Testar login com senha "1234"');

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

resetPasswords();
