/**
 * Script para testar a configuração do backup
 * Execute localmente para verificar se tudo está funcionando antes de usar no GitHub Actions
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração - substitua com suas credenciais
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Test configuration
const TEST_CONFIG = {
  bucketName: 'Backup_DADOS',
  testFileName: `test_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  testData: {
    timestamp: new Date().toISOString(),
    test: true,
    tables: ['users', 'schedules', 'swap_requests'],
    version: '1.0'
  }
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runTests() {
  console.log('🚀 Iniciando testes de configuração do backup...\n');

  try {
    // Test 1: Verificar conexão com Supabase
    console.log('📡 Teste 1: Conexão com Supabase');
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.error('❌ Falha na conexão:', error.message);
      return false;
    }
    console.log('✅ Conexão estabelecida com sucesso\n');

    // Test 2: Verificar se o bucket existe
    console.log('🪣 Teste 2: Verificar bucket Backup_DADOS');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('❌ Erro ao listar buckets:', bucketError.message);
      return false;
    }

    const backupBucket = buckets.find(b => b.name === TEST_CONFIG.bucketName);
    if (!backupBucket) {
      console.error(`❌ Bucket ${TEST_CONFIG.bucketName} não encontrado!`);
      console.log('💡 Execute o script create-backup-bucket.sql primeiro');
      return false;
    }
    console.log(`✅ Bucket ${TEST_CONFIG.bucketName} encontrado\n`);

    // Test 3: Verificar permissões de upload
    console.log('📤 Teste 3: Upload de arquivo teste');
    const testFilePath = path.join(__dirname, TEST_CONFIG.testFileName);
    fs.writeFileSync(testFilePath, JSON.stringify(TEST_CONFIG.testData, null, 2));

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(TEST_CONFIG.bucketName)
      .upload(TEST_CONFIG.testFileName, fs.readFileSync(testFilePath), {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError.message);
      console.log('💡 Verifique as políticas RLS do bucket');
      fs.unlinkSync(testFilePath);
      return false;
    }
    console.log('✅ Upload realizado com sucesso\n');

    // Test 4: Verificar permissões de download
    console.log('📥 Teste 4: Download do arquivo');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(TEST_CONFIG.bucketName)
      .download(TEST_CONFIG.testFileName);

    if (downloadError) {
      console.error('❌ Erro no download:', downloadError.message);
      return false;
    }

    const downloadedContent = downloadData.text();
    const parsedContent = JSON.parse(downloadedContent);
    
    if (parsedContent.test !== true) {
      console.error('❌ Conteúdo do arquivo não corresponde ao esperado');
      return false;
    }
    console.log('✅ Download e verificação do conteúdo OK\n');

    // Test 5: Listar arquivos no bucket
    console.log('📋 Teste 5: Listar arquivos no bucket');
    const { data: files, error: listError } = await supabase.storage
      .from(TEST_CONFIG.bucketName)
      .list('', { limit: 10 });

    if (listError) {
      console.error('❌ Erro ao listar arquivos:', listError.message);
      return false;
    }

    console.log(`✅ Encontrados ${files.length} arquivos no bucket`);
    files.forEach(file => {
      console.log(`   📄 ${file.name} (${file.created_at})`);
    });
    console.log('');

    // Test 6: Verificar permissões de deleção
    console.log('🗑️ Teste 6: Deletar arquivo teste');
    const { error: deleteError } = await supabase.storage
      .from(TEST_CONFIG.bucketName)
      .remove([TEST_CONFIG.testFileName]);

    if (deleteError) {
      console.error('❌ Erro ao deletar arquivo:', deleteError.message);
      return false;
    }
    console.log('✅ Arquivo teste deletado com sucesso\n');

    // Limpar arquivo local
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    // Test 7: Exportar dados das tabelas principais
    console.log('📊 Teste 7: Exportar dados das tabelas principais');
    const tables = ['users', 'schedules', 'swap_requests', 'vacation_requests'];
    const exportData = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(5); // Limitar a 5 registros para teste

        if (tableError) {
          console.warn(`⚠️ Tabela ${table}: ${tableError.message}`);
          exportData.tables[table] = { error: tableError.message, count: 0 };
        } else {
          exportData.tables[table] = { 
            count: tableData.length, 
            sample: tableData.slice(0, 2) // Apenas 2 registros como exemplo
          };
          console.log(`✅ Tabela ${table}: ${tableData.length} registros`);
        }
      } catch (err) {
        console.error(`❌ Erro crítico na tabela ${table}:`, err.message);
        exportData.tables[table] = { error: err.message, count: 0 };
      }
    }

    // Salvar exportação de teste
    const exportFileName = `test_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const exportFilePath = path.join(__dirname, exportFileName);
    fs.writeFileSync(exportFilePath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Exportação de teste salva em: ${exportFileName}\n`);

    // Test 8: Verificar função de monitoramento (se existir)
    console.log('📈 Teste 8: Verificar funções de monitoramento');
    try {
      const { data: monitoringData, error: monitoringError } = await supabase
        .rpc('get_backup_bucket_size');

      if (monitoringError) {
        console.warn('⚠️ Função de monitoramento não encontrada (isso é normal se não foi criada)');
      } else {
        console.log('✅ Função de monitoramento encontrada:');
        console.log(`   📊 Arquivos: ${monitoringData[0]?.total_files || 0}`);
        console.log(`   💾 Espaço: ${monitoringData[0]?.total_size || 0} bytes`);
      }
    } catch (err) {
      console.warn('⚠️ Erro ao verificar função de monitoramento:', err.message);
    }

    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    console.log('\n📋 Resumo da configuração:');
    console.log('✅ Conexão com Supabase OK');
    console.log('✅ Bucket Backup_DADOS existe');
    console.log('✅ Permissões de upload OK');
    console.log('✅ Permissões de download OK');
    console.log('✅ Permissões de listagem OK');
    console.log('✅ Permissões de deleção OK');
    console.log('✅ Exportação de dados OK');
    console.log('\n🚀 Sistema pronto para GitHub Actions!');

    return true;

  } catch (error) {
    console.error('❌ Erro crítico durante os testes:', error);
    return false;
  }
}

// Função para mostrar configuração necessária
function showConfiguration() {
  console.log('\n📋 Configuração necessária para GitHub Actions:\n');
  console.log('1. Secrets no GitHub:');
  console.log('   - SUPABASE_URL: https://your-project-ref.supabase.co');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY: sua-service-role-key\n');
  console.log('2. Execute no Supabase SQL Editor:');
  console.log('   - scripts/create-backup-bucket.sql\n');
  console.log('3. Variáveis de ambiente (para teste local):');
  console.log('   export SUPABASE_URL="https://your-project-ref.supabase.co"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"\n');
}

// Executar testes
async function main() {
  console.log('🔧 Script de Teste de Backup - Sistema de Escalas\n');
  
  if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project-ref.supabase.co') {
    console.log('❌ Configure as variáveis de ambiente primeiro:\n');
    showConfiguration();
    process.exit(1);
  }

  const success = await runTests();
  
  if (!success) {
    console.log('\n❌ Alguns testes falharam. Verifique a configuração acima.');
    showConfiguration();
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runTests, showConfiguration };
