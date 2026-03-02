const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

// Função para criar hash SHA256
function hashPassword(password) {
  return crypto.SHA256(password).toString();
}

// Função para verificar se senha já é hash (64 caracteres hex)
function isHashed(password) {
  return password && password.length === 64 && /^[a-f0-9]{64}$/i.test(password);
}

async function migratePasswordsToHash() {
  console.log('🔐 MIGRANDO SENHAS PARA HASH SHA256');
  console.log('='.repeat(60));
  console.log('⚠️ IMPORTANTE: Esta operação é irreversível!');
  console.log('   Certifique-se de que todos os usuários sabem suas senhas atuais.');
  console.log('');

  const migrationReport = {
    migrated: [],
    alreadyHashed: [],
    errors: [],
    skipped: []
  };

  try {
    // Buscar todos os usuários ativos
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

    // Processar cada usuário
    for (const user of users) {
      try {
        console.log(`\n👤 Processando: ${user.name}`);

        if (!user.password) {
          console.log(`⚠️ Usuário ${user.name} não tem senha definida - pulando`);
          migrationReport.skipped.push({
            name: user.name,
            reason: 'Senha não definida'
          });
          continue;
        }

        // Verificar se senha já está hasheada
        if (isHashed(user.password)) {
          console.log(`✅ Senha já está hasheada para ${user.name}`);
          migrationReport.alreadyHashed.push(user.name);
          continue;
        }

        // Fazer backup da senha original para log
        const originalPassword = user.password;

        // Criar hash da senha
        const hashedPassword = hashPassword(user.password);

        console.log(`🔄 Migrando senha de ${user.name}...`);
        console.log(`   Original: ${originalPassword.length} caracteres`);
        console.log(`   Hash: ${hashedPassword.substring(0, 16)}...`);

        // Atualizar senha no banco
        const { data: updatedUser, error: updateError } = await serviceClient
          .from('users')
          .update({ password: hashedPassword })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Erro ao atualizar senha de ${user.name}:`, updateError.message);
          migrationReport.errors.push({
            name: user.name,
            error: updateError.message
          });
          continue;
        }

        // Verificar se a migração funcionou
        const { data: verifyUser, error: verifyError } = await serviceClient
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (verifyError) {
          console.error(`❌ Erro ao verificar migração de ${user.name}:`, verifyError.message);
          migrationReport.errors.push({
            name: user.name,
            error: verifyError.message
          });
          continue;
        }

        if (isHashed(verifyUser.password)) {
          console.log(`✅ Senha migrada com sucesso para ${user.name}`);
          migrationReport.migrated.push({
            name: user.name,
            originalLength: originalPassword.length,
            hashedLength: hashedPassword.length
          });
        } else {
          console.error(`❌ Migração falhou para ${user.name} - senha não foi hasheada`);
          migrationReport.errors.push({
            name: user.name,
            error: 'Migração falhou - senha não foi hasheada'
          });
        }

        // Pequena pausa para não sobrecarregar o banco
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (userError) {
        console.error(`❌ Erro crítico ao processar ${user.name}:`, userError.message);
        migrationReport.errors.push({
          name: user.name,
          error: userError.message
        });
      }
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL DA MIGRAÇÃO');
    console.log('='.repeat(50));

    console.log(`\n✅ Migradas: ${migrationReport.migrated.length}`);
    migrationReport.migrated.forEach(item => {
      console.log(`  - ${item.name}: ${item.originalLength} → ${item.hashedLength} caracteres`);
    });

    console.log(`\n🔄 Já hasheadas: ${migrationReport.alreadyHashed.length}`);
    migrationReport.alreadyHashed.forEach(name => {
      console.log(`  - ${name}`);
    });

    console.log(`\n⚠️ Puladas: ${migrationReport.skipped.length}`);
    migrationReport.skipped.forEach(item => {
      console.log(`  - ${item.name}: ${item.reason}`);
    });

    console.log(`\n❌ Erros: ${migrationReport.errors.length}`);
    migrationReport.errors.forEach(item => {
      console.log(`  - ${item.name}: ${item.error}`);
    });

    const successRate = ((migrationReport.migrated.length + migrationReport.alreadyHashed.length) / users.length * 100).toFixed(1);
    console.log(`\n📈 Taxa de sucesso: ${successRate}%`);

    if (migrationReport.errors.length === 0) {
      console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('🔐 Todas as senhas foram protegidas com hash SHA256');
      console.log('🔄 O sistema continuará funcionando normalmente');
      console.log('📝 Os usuários devem usar as mesmas senhas de antes');
    } else {
      console.log('\n⚠️ MIGRAÇÃO CONCLUÍDA COM ERROS');
      console.log('🔍 Verifique os usuários com erro e tente novamente');
    }

    // Salvar relatório em arquivo
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2));
    console.log(`\n💾 Relatório salvo em: ${reportPath}`);

    return migrationReport;

  } catch (error) {
    console.error('❌ ERRO CRÍTICO NA MIGRAÇÃO:', error.message);
    return null;
  }
}

// Executar migração
console.log('🚨 INICIANDO MIGRAÇÃO DE SENHAS PARA HASH');
console.log('Esta operação irá converter todas as senhas em texto plano para hash SHA256.');
console.log('Certifique-se de que todos os usuários conhecem suas senhas atuais.');
console.log('');

migratePasswordsToHash().then(() => {
  console.log('\n🏁 Migração finalizada!');
});
