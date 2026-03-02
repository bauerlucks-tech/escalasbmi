const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function debugUserMappingIssue() {
  console.log('🔍 DEBUG DETALHADO DO USERMAPPING');
  console.log('='.repeat(60));

  try {
    // 1. Buscar todos os usuários ativos
    console.log('\n📋 USUÁRIOS ATIVOS NO BANCO:');
    console.log('-'.repeat(40));

    const { data: dbUsers, error: dbError } = await serviceClient
      .from('users')
      .select('*')
      .eq('status', 'ativo')
      .order('name', { ascending: true });

    if (dbError) {
      console.error('❌ Erro ao buscar usuários do banco:', dbError.message);
      return;
    }

    console.log(`✅ ${dbUsers.length} usuários ativos encontrados:`);
    const dbUserMap = {};
    dbUsers.forEach(user => {
      dbUserMap[user.name] = user.id;
      console.log(`  ${user.name}: ${user.id}`);
    });

    // 2. Ler userMapping.ts
    console.log('\n📋 USERMAPPING.TS ATUAL:');
    console.log('-'.repeat(40));

    const fs = require('fs');
    const path = require('path');
    const userMappingPath = path.join(__dirname, '../src/config/userMapping.ts');

    const userMappingContent = fs.readFileSync(userMappingPath, 'utf8');
    console.log('Conteúdo do arquivo:');
    console.log(userMappingContent);

    // 3. Extrair UUIDs do arquivo
    const uuidMatches = userMappingContent.match(/'([^']+)':\s*'([^']+)'/g) || [];
    const fileUserMap = {};

    uuidMatches.forEach(match => {
      const [, name, uuid] = match.match(/'([^']+)':\s*'([^']+)'/);
      fileUserMap[name] = uuid;
    });

    console.log('\n📋 UUIDs extraídos do arquivo:');
    Object.entries(fileUserMap).forEach(([name, uuid]) => {
      console.log(`  ${name}: ${uuid}`);
    });

    // 4. Comparar
    console.log('\n🔍 COMPARAÇÃO:');
    console.log('-'.repeat(40));

    let allMatch = true;

    Object.entries(fileUserMap).forEach(([name, fileUUID]) => {
      const dbUUID = dbUserMap[name];

      if (!dbUUID) {
        console.log(`❌ ${name}: NÃO EXISTE NO BANCO`);
        console.log(`   Arquivo: ${fileUUID}`);
        allMatch = false;
      } else if (fileUUID !== dbUUID) {
        console.log(`⚠️ ${name}: UUID DIFERENTE`);
        console.log(`   Arquivo: ${fileUUID}`);
        console.log(`   Banco:   ${dbUUID}`);
        allMatch = false;
      } else {
        console.log(`✅ ${name}: UUID IGUAL`);
        console.log(`   UUID: ${fileUUID}`);
      }
    });

    // 5. Verificar se todos os usuários do banco estão no arquivo
    console.log('\n📋 USUÁRIOS DO BANCO NÃO NO ARQUIVO:');
    Object.entries(dbUserMap).forEach(([name, dbUUID]) => {
      if (!fileUserMap[name] && dbUsers.find(u => u.name === name)?.role !== 'super_admin') {
        console.log(`❌ ${name}: ${dbUUID} (não está no arquivo)`);
        allMatch = false;
      }
    });

    // 6. Conclusão
    console.log('\n🎯 CONCLUSÃO:');
    console.log('='.repeat(30));

    if (allMatch) {
      console.log('✅ USERMAPPING CORRETO!');
      console.log('🔄 Todos os UUIDs estão sincronizados');
    } else {
      console.log('❌ USERMAPPING COM PROBLEMAS!');
      console.log('🔧 UUIDs estão dessincronizados');
      console.log('🔄 Execute novamente o script de correção');
    }

    return { allMatch, dbUserMap, fileUserMap };

  } catch (error) {
    console.error('❌ ERRO NO DEBUG:', error.message);
    return null;
  }
}

// Executar debug
debugUserMappingIssue().then(() => {
  console.log('\n🏁 Debug do userMapping finalizado!');
});
