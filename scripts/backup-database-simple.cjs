#!/usr/bin/env node

/**
 * SCRIPT DE BACKUP DO BANCO DE DADOS SUPABASE
 * 
 * Este script exporta todas as tabelas importantes do banco de dados
 * para um arquivo JSON estruturado usando o cliente Supabase.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configurações
const outputFile = process.argv[2] || `./backups/database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

// Obter credenciais do ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar credenciais
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada!');
  console.log('💡 Configure a variável de ambiente:');
  console.log('   Windows: $env:SUPABASE_SERVICE_ROLE_KEY="sua_chave"');
  console.log('   Linux/Mac: export SUPABASE_SERVICE_ROLE_KEY="sua_chave"');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function backupDatabase() {
  console.log('🚀 INICIANDO BACKUP DO BANCO DE DADOS SUPABASE');
  console.log(`📡 URL: ${SUPABASE_URL}`);
  console.log(`� Arquivo de saída: ${outputFile}`);
  
  // Criar diretório se não existir
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '3.0',
      source: 'supabase_client',
      project_ref: 'lsxmwwwmgfjwnowlsmzf',
      backup_type: 'full'
    },
    tables: {}
  };
  
  let totalRecords = 0;
  let errors = [];
  
  // Tabelas para backup
  const tables = [
    'users',
    'schedules', 
    'month_schedules',
    'swap_requests',
    'vacation_requests',
    'audit_logs',
    'notifications',
    'preferences',
    'operator_requests'
  ];
  
  try {
    for (const tableName of tables) {
      console.log(`📋 Exportando tabela: ${tableName}`);
      
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' });
        
        if (error) {
          console.warn(`⚠️ Erro ao exportar ${tableName}: ${error.message}`);
          errors.push({ table: tableName, error: error.message });
          backupData.tables[tableName] = {
            records: [],
            count: 0,
            error: error.message,
            exported_at: new Date().toISOString()
          };
        } else {
          backupData.tables[tableName] = {
            records: data || [],
            count: count || data?.length || 0,
            exported_at: new Date().toISOString()
          };
          
          const recordCount = count || data?.length || 0;
          totalRecords += recordCount;
          console.log(`   ✅ ${tableName}: ${recordCount} registros`);
        }
      } catch (tableError) {
        console.warn(`⚠️ Exceção ao exportar ${tableName}: ${tableError.message}`);
        errors.push({ table: tableName, error: tableError.message });
        backupData.tables[tableName] = {
          records: [],
          count: 0,
          error: tableError.message,
          exported_at: new Date().toISOString()
        };
      }
    }
    
    // Adicionar estatísticas
    backupData.metadata.total_records = totalRecords;
    backupData.metadata.total_tables = Object.keys(backupData.tables).length;
    backupData.metadata.successful_tables = Object.keys(backupData.tables).filter(
      t => !backupData.tables[t].error
    ).length;
    backupData.metadata.errors = errors;
    
    // Salvar arquivo
    const jsonString = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(outputFile, jsonString);
    
    const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
    
    console.log(`\n✅ BACKUP CONCLUÍDO COM SUCESSO!`);
    console.log(`📊 Total de registros: ${totalRecords}`);
    console.log(`📊 Total de tabelas: ${Object.keys(backupData.tables).length}`);
    console.log(`📊 Tabelas com erro: ${errors.length}`);
    console.log(`📁 Tamanho do arquivo: ${fileSize} KB`);
    console.log(`📁 Caminho: ${outputFile}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️ Tabelas com erro:`);
      errors.forEach(e => console.log(`   - ${e.table}: ${e.error}`));
    }
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO BACKUP:', error.message);
    
    // Salvar backup mesmo com erros parciais
    backupData.metadata.backup_failed = true;
    backupData.metadata.fatal_error = error.message;
    const jsonString = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(outputFile, jsonString);
    
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };
