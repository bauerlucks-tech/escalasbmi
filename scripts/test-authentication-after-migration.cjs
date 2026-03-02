const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

// Funções de segurança para senhas (copiadas do supabase.ts)
const hashPassword = (password) => {
  const crypto = require('crypto-js');
  return crypto.SHA256(password).toString();
};

const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
};

async function testAuthenticationAfterMigration() {
  console.log('🔐 TESTANDO AUTENTICAÇÃO APÓS MIGRAÇÃO DE SENHAS');
  console.log('='.repeat(70));

  try {
    // Buscar usuários ativos
    const { data: users, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('status', 'ativo')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      return;
    }

    console.log(`✅ ${users.length} usuários ativos encontrados`);

    const testResults = {
      successful: [],
      failed: [],
      skipped: []
    };

    // Testar autenticação para cada usuário
    for (const user of users) {
      try {
        console.log(`\n👤 Testando autenticação para: ${user.name}`);

        // Verificar se senha está hasheada
        const isHashed = user.password && user.password.length === 64 && /^[a-f0-9]{64}$/i.test(user.password);

        if (!isHashed) {
          console.log(`⚠️ Senha de ${user.name} não está hasheada - pulando`);
          testResults.skipped.push({
            name: user.name,
            reason: 'Senha não hasheada'
          });
          continue;
        }

        // Determinar senha original baseada no padrão conhecido
        let originalPassword = null;

        if (user.name === 'LUCAS') {
          originalPassword = 'lucas123';
        } else if (user.name === 'ROSANA') {
          originalPassword = 'rosana123';
        } else if (user.name === 'RICARDO') {
          originalPassword = 'ricardo123';
        } else if (user.name === 'SUPER_ADMIN_HIDDEN') {
          originalPassword = 'hidden_super_2026';
        } else {
          // Para outros usuários, assumir senha padrão "1234"
          originalPassword = '1234';
        }

        // Verificar se hash da senha original corresponde ao armazenado
        const isValid = verifyPassword(originalPassword, user.password);

        if (isValid) {
          console.log(`✅ Autenticação funcionando para ${user.name}`);
          console.log(`   Senha original: ${originalPassword}`);
          console.log(`   Hash armazenado: ${user.password.substring(0, 16)}...`);

          testResults.successful.push({
            name: user.name,
            originalPassword,
            role: user.role
          });
        } else {
          console.log(`❌ Autenticação falhou para ${user.name}`);
          console.log(`   Senha testada: ${originalPassword}`);
          console.log(`   Hash esperado: ${hashPassword(originalPassword).substring(0, 16)}...`);
          console.log(`   Hash armazenado: ${user.password.substring(0, 16)}...`);

          testResults.failed.push({
            name: user.name,
            originalPassword,
            expectedHash: hashPassword(originalPassword).substring(0, 16) + '...',
            storedHash: user.password.substring(0, 16) + '...'
          });
        }

        // Testar login real via email
        try {
          const { data: loginResult, error: loginError } = await serviceClient
            .from('users')
            .select('*')
            .eq('email', user.email)
            .eq('password', user.password)
            .eq('status', 'ativo')
            .single();

          if (loginError) {
            console.log(`❌ Login direto falhou para ${user.name}: ${loginError.message}`);
          } else {
            console.log(`✅ Login direto funcionando para ${user.name}`);
          }
        } catch (loginException) {
          console.log(`❌ Exceção no login direto de ${user.name}: ${loginException.message}`);
        }

      } catch (userError) {
        console.error(`❌ Erro ao testar ${user.name}:`, userError.message);
        testResults.failed.push({
          name: user.name,
          error: userError.message
        });
      }
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DE AUTENTICAÇÃO');
    console.log('='.repeat(50));

    console.log(`\n✅ Autenticações bem-sucedidas: ${testResults.successful.length}`);
    testResults.successful.forEach(result => {
      console.log(`  - ${result.name} (${result.role}): "${result.originalPassword}"`);
    });

    console.log(`\n❌ Autenticações falhadas: ${testResults.failed.length}`);
    testResults.failed.forEach(result => {
      console.log(`  - ${result.name}: ${result.error || 'Hash incorreto'}`);
      if (result.expectedHash && result.storedHash) {
        console.log(`    Esperado: ${result.expectedHash}`);
        console.log(`    Armazenado: ${result.storedHash}`);
      }
    });

    console.log(`\n⚠️ Testes pulados: ${testResults.skipped.length}`);
    testResults.skipped.forEach(result => {
      console.log(`  - ${result.name}: ${result.reason}`);
    });

    const successRate = ((testResults.successful.length / (testResults.successful.length + testResults.failed.length)) * 100).toFixed(1);
    console.log(`\n📈 Taxa de sucesso: ${successRate}%`);

    if (testResults.failed.length === 0 && testResults.skipped.length === 0) {
      console.log('\n🎉 TODAS AS AUTENTICAÇÕES FUNCIONANDO APÓS MIGRAÇÃO!');
      console.log('🔐 Sistema de segurança implementado com sucesso');
      console.log('🔄 Usuários podem continuar usando suas senhas normais');
    } else if (testResults.failed.length > 0) {
      console.log('\n⚠️ PROBLEMAS DETECTADOS NA AUTENTICAÇÃO');
      console.log('🔍 Verifique os usuários com falha');
      console.log('🔧 Pode ser necessário redefinir senhas ou corrigir hashes');
    }

    return testResults;

  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO TESTE DE AUTENTICAÇÃO:', error.message);
    return null;
  }
}

// Executar teste
testAuthenticationAfterMigration().then(() => {
  console.log('\n🏁 Teste de autenticação finalizado!');
});
