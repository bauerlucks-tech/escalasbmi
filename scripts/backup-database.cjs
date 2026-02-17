#!/usr/bin/env node

/**
 * SCRIPT DE BACKUP DO BANCO DE DADOS SUPABASE
 * 
 * Este script exporta todas as tabelas importantes do banco de dados
 * para um arquivo JSON estruturado.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tabelas para backup
const tables = [
  'users',
  'month_schedules', 
  'swap_requests',
  'vacation_requests',
  'audit_logs'
];

async function backupDatabase(outputFile) {
  console.log('🚀 INICIANDO BACKUP DO BANCO DE DADOS SUPABASE');
  console.log(`📁 Arquivo de saída: ${outputFile}`);
  
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0',
      source: 'supabase',
      project: supabaseUrl.split('//')[1].split('.')[0]
    },
    tables: {}
  };
  
  let totalRecords = 0;
  
  try {
    for (const tableName of tables) {
      console.log(`📋 Exportando tabela: ${tableName}`);
      
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error(`❌ Erro na tabela ${tableName}:`, error.message);
        continue;
      }
      
      backupData.tables[tableName] = {
        records: data || [],
        count: count || 0,
        exported_at: new Date().toISOString()
      };
      
      totalRecords += count || 0;
      console.log(`✅ ${tableName}: ${count} registros`);
    }
    
    // Adicionar estatísticas
    backupData.metadata.total_records = totalRecords;
    backupData.metadata.total_tables = Object.keys(backupData.tables).length;
    
    // Salvar arquivo
    const jsonString = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(outputFile, jsonString);
    
    const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);
    console.log(`\n✅ BACKUP CONCLUÍDO COM SUCESSO!`);
    console.log(`📊 Total de registros: ${totalRecords}`);
    console.log(`📊 Total de tabelas: ${Object.keys(backupData.tables).length}`);
    console.log(`📁 Tamanho do arquivo: ${fileSize} KB`);
    console.log(`📁 Caminho: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ ERRO NO BACKUP:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const outputFile = process.argv[2] || `./database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  backupDatabase(outputFile);
}

module.exports = { backupDatabase };
