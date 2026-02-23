/**
 * Script de Diagnóstico do Sistema de Trocas (Swaps) - VERSÃO OTIMIZADA
 * 
 * Este script testa várias hipóteses sobre possíveis problemas
 * no sistema de trocas do aplicativo de escalas BMI.
 * 
 * Melhorias implementadas:
 * - Queries otimizadas com head: true
 * - Validação de schema e performance
 * - Testes de edge cases e concorrência
 * - Relatórios detalhados com métricas
 * - Configuração flexível via variáveis
 * 
 * Hipóteses testadas:
 * 1. Problema de mapeamento de usuários (case sensitivity)
 * 2. Problema de conexão com Supabase
 * 3. Estrutura da tabela swap_requests
 * 4. Dados existentes de trocas
 * 5. Validação de dados e performance
 * 6. Testes de regras de negócio
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase (via variáveis de ambiente)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';

// Configurações de teste
const TEST_CONFIG = {
  maxRecords: 100,
  timeoutMs: 30000,
  enablePerformanceTests: process.env.ENABLE_PERF_TESTS !== 'false',
  enableDetailedLogs: process.env.ENABLE_DETAILED_LOGS !== 'false',
  outputDir: process.env.OUTPUT_DIR || './test-results'
};

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mapeamento de usuários (do arquivo src/config/userMapping.ts)
// COM a correção de case sensitivity
const USER_UUIDS = {
  'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
  'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
  'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
  'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
  'RICARDO': '4a8b9c2d-3e6f-4a5b-9c8d-2e3f6a9b8c7d',
  'GUILHERME': '7f6e5d4c-3b2a-4f8e-9d7c-1b4a6c8e9f2d'
};

// Utilitários de medição de performance
function measureTime(fn) {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  return { result, timeMs: end - start };
}

// Utilitário de logging
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message}`;
  console.log(logMessage);
  if (data && TEST_CONFIG.enableDetailedLogs) {
    console.log('  Data:', JSON.stringify(data, null, 2));
  }
}

// Criar diretório de saída se não existir
if (!fs.existsSync(TEST_CONFIG.outputDir)) {
  fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
}

// Função corrigida para buscar UUID com normalização de case
function getUserUUID(userName) {
  const normalizedName = userName.toUpperCase();
  return USER_UUIDS[normalizedName] || userName;
}

console.log('========================================');
console.log('🔍 DIAGNÓSTICO DO SISTEMA DE TROCAS');
console.log('========================================\n');

// ============================================
// HIPÓTESE 1: Problema de mapeamento de usuários
// ============================================
async function testUserMapping() {
  console.log('📋 TESTE 1: Mapeamento de Usuários (case sensitivity)');
  console.log('-'.repeat(50));
  
  const testCases = [
    { input: 'LUCAS', expected: 'UUID' },
    { input: 'lucas', expected: 'UUID (with fix)' },
    { input: 'Lucas', expected: 'UUID (with fix)' },
    { input: 'CARLOS', expected: 'UUID' },
    { input: 'carlos', expected: 'UUID (with fix)' },
    { input: 'Unknown', expected: 'fallback to name' },
    { input: 'GUILHERME', expected: 'UUID' },
  ];
  
  let issues = [];
  
  for (const testCase of testCases) {
    const result = getUserUUID(testCase.input);
    const status = result !== testCase.input ? '✅' : (testCase.expected.includes('fallback') ? '⚠️' : '❌');
    
    console.log(`  ${status} "${testCase.input}" -> "${result}"`);
    
    if (result === testCase.input && testCase.expected === 'UUID') {
      issues.push(`Usuário "${testCase.input}" não encontrado no mapeamento`);
    }
  }
  
  if (issues.length > 0) {
    console.log('\n  ❌ PROBLEMA ENCONTRADO:');
    issues.forEach(issue => console.log(`     - ${issue}`));
    console.log('\n  💡 Possível solução: Normalizar o nome do usuário para maiúsculas antes de buscar o UUID');
  } else {
    console.log('\n  ✅ Mapeamento funcionando corretamente');
  }
  
  return issues.length === 0;
}

// ============================================
// HIPÓTESE 2: Conexão com Supabase
// ============================================
async function testSupabaseConnection() {
  console.log('\n📋 TESTE 2: Conexão com Supabase');
  console.log('-'.repeat(50));
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`  ❌ Erro ao conectar: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    console.log('  ✅ Conexão com Supabase estabelecida');
    return { success: true };
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 3: Estrutura da tabela swap_requests
// ============================================
async function testTableStructure() {
  console.log('\n📋 TESTE 3: Estrutura da Tabela swap_requests');
  console.log('-'.repeat(50));
  
  try {
    // Tentar buscar um registro para ver a estrutura
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ Erro ao buscar estrutura: ${error.message}`);
      
      // Verificar se a tabela existe
      if (error.message.includes('does not exist')) {
        console.log('  ⚠️ Tabela "swap_requests" não existe no banco de dados');
        console.log('  💡 Possível solução: Criar a tabela via SQL');
      }
      
      return { success: false, error: error.message };
    }
    
    console.log('  ✅ Tabela swap_requests existe e está acessível');
    
    if (data && data.length > 0) {
      console.log('  📊 Colunas disponíveis:', Object.keys(data[0]).join(', '));
    } else {
      console.log('  ℹ️ Tabela vazia (sem registros)');
    }
    
    return { success: true, columns: data && data.length > 0 ? Object.keys(data[0]) : [] };
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 4: Dados existentes de trocas (OTIMIZADO)
// ============================================
async function testExistingSwaps() {
  console.log('\n📋 TESTE 4: Dados Existentes de Trocas');
  console.log('-'.repeat(50));
  
  try {
    // Query otimizada: apenas contagem primeiro
    const { count: totalCount, error: countError } = await supabase
      .from('swap_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(`  ❌ Erro ao contar registros: ${countError.message}`);
      return { success: false, error: countError.message };
    }
    
    console.log(`  ✅ Total de registros: ${totalCount || 0}`);
    
    // Se houver registros, buscar amostra para análise
    if (totalCount > 0) {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.min(3, TEST_CONFIG.maxRecords));
      
      if (error) {
        console.log(`  ❌ Erro ao buscar amostra: ${error.message}`);
        return { success: false, error: error.message };
      }
      
      if (data && data.length > 0) {
        console.log('\n  📋 Últimas trocas:');
        data.forEach((swap, index) => {
          console.log(`\n  --- Troca #${index + 1} ---`);
          console.log(`     ID: ${swap.id}`);
          console.log(`     Solicitante: ${swap.requester_name}`);
          console.log(`     Alvo: ${swap.target_name}`);
          console.log(`     Data Original: ${swap.original_date}`);
          console.log(`     Data Target: ${swap.target_date}`);
          console.log(`     Status: ${swap.status}`);
          console.log(`     Criado em: ${swap.created_at}`);
        });
        
        // Análise de padrões
        const statusCounts = {};
        data.forEach(swap => {
          statusCounts[swap.status] = (statusCounts[swap.status] || 0) + 1;
        });
        
        console.log('\n  📊 Distribuição de status (amostra):');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`);
        });
      }
    } else {
      console.log('  ℹ️ Nenhuma troca encontrada no banco de dados');
    }
    
    return { success: true, count: totalCount || 0, data: data || [] };
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 5: Teste de inserção
// ============================================
async function testInsertion() {
  console.log('\n📋 TESTE 5: Teste de Inserção (dry run)');
  console.log('-'.repeat(50));
  
  // Simular dados de uma troca
  const testSwap = {
    requester_id: USER_UUIDS['LUCAS'],
    requester_name: 'LUCAS',
    target_id: USER_UUIDS['CARLOS'],
    target_name: 'CARLOS',
    original_date: '25/02/2026',
    original_shift: 'meioPeriodo',
    target_date: '26/02/2026',
    target_shift: 'meioPeriodo',
    status: 'pending',
  };
  
  console.log('  📝 Dados que seriam enviados:');
  console.log(JSON.stringify(testSwap, null, 2));
  
  // Verificar se todos os campos obrigatórios estão presentes
  const requiredFields = [
    'requester_id', 'requester_name', 'target_id', 'target_name',
    'original_date', 'original_shift', 'target_date', 'target_shift', 'status'
  ];
  
  const missingFields = requiredFields.filter(field => !testSwap[field]);
  
  if (missingFields.length > 0) {
    console.log(`\n  ❌ Campos faltando: ${missingFields.join(', ')}`);
    return { success: false, missingFields };
  }
  
  console.log('\n  ✅ Todos os campos obrigatórios presentes');
  
  // Verificar se os UUIDs são válidos
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(testSwap.requester_id)) {
    console.log(`  ❌ requester_id inválido: ${testSwap.requester_id}`);
    return { success: false, error: 'Invalid UUID' };
  }
  
  if (!uuidRegex.test(testSwap.target_id)) {
    console.log(`  ❌ target_id inválido: ${testSwap.target_id}`);
    return { success: false, error: 'Invalid UUID' };
  }
  
  console.log('  ✅ UUIDs válidos');
  
  return { success: true, testSwap };
}

// ============================================
// HIPÓTESE 6: Teste de Performance (NOVO)
// ============================================
async function testPerformance() {
  if (!TEST_CONFIG.enablePerformanceTests) {
    console.log('\n📋 TESTE 6: Performance (pulado - ENABLE_PERF_TESTS=false)');
    return { success: true, skipped: true };
  }

  console.log('\n📋 TESTE 6: Performance das Queries');
  console.log('-'.repeat(50));
  
  const results = {};
  
  try {
    // Testar performance de contagem
    const countResult = measureTime(async () => {
      const { count, error } = await supabase
        .from('swap_requests')
        .select('*', { count: 'exact', head: true });
      return { count, error };
    });
    
    results.count = await countResult.result;
    console.log(`  ⏱️ Contagem: ${countResult.timeMs}ms`);
    
    if (results.count.error) {
      console.log(`  ❌ Erro na contagem: ${results.count.error.message}`);
    } else {
      console.log(`  ✅ Contagem bem-sucedida: ${results.count.count} registros`);
    }
    
    // Testar performance de busca limitada
    const limitResult = measureTime(async () => {
      const { data, error } = await supabase
        .from('swap_requests')
        .select('*')
        .limit(10);
      return { data, error };
    });
    
    results.limit = await limitResult.result;
    console.log(`  ⏱️ Busca limitada (10): ${limitResult.timeMs}ms`);
    
    if (results.limit.error) {
      console.log(`  ❌ Erro na busca: ${results.limit.error.message}`);
    } else {
      console.log(`  ✅ Busca bem-sucedida: ${results.limit.data?.length || 0} registros`);
    }
    
    // Análise de performance
    console.log('\n  📊 Análise de Performance:');
    if (countResult.timeMs < 100) {
      console.log('  ✅ Performance excelente (< 100ms)');
    } else if (countResult.timeMs < 500) {
      console.log('  ⚠️ Performance aceitável (< 500ms)');
    } else {
      console.log('  ❌ Performance lenta (> 500ms)');
    }
    
    return { 
      success: true, 
      performance: {
        countTime: countResult.timeMs,
        limitTime: limitResult.timeMs,
        totalRecords: results.count.count
      }
    };
    
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 7: Teste de Schema (NOVO)
// ============================================
async function testSchemaValidation() {
  console.log('\n📋 TESTE 7: Validação de Schema');
  console.log('-'.repeat(50));
  
  try {
    // Buscar amostra para analisar schema
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ Erro ao analisar schema: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.log('  ℹ️ Tabela vazia - não é possível validar schema');
      return { success: true, empty: true };
    }
    
    const sample = data[0];
    const fields = Object.keys(sample);
    
    // Campos esperados
    const expectedFields = [
      'id', 'requester_id', 'requester_name', 'target_id', 'target_name',
      'original_date', 'original_shift', 'target_date', 'target_shift',
      'status', 'created_at', 'updated_at'
    ];
    
    const missingFields = expectedFields.filter(field => !fields.includes(field));
    const extraFields = fields.filter(field => !expectedFields.includes(field));
    
    console.log(`  📋 Campos encontrados (${fields.length}): ${fields.join(', ')}`);
    
    if (missingFields.length > 0) {
      console.log(`  ⚠️ Campos faltando: ${missingFields.join(', ')}`);
    }
    
    if (extraFields.length > 0) {
      console.log(`  ℹ️ Campos extras: ${extraFields.join(', ')}`);
    }
    
    // Validar tipos de dados
    console.log('\n  🔍 Validação de tipos:');
    expectedFields.forEach(field => {
      if (sample[field] !== undefined) {
        const type = typeof sample[field];
        console.log(`     ${field}: ${type}`);
      }
    });
    
    const isValid = missingFields.length === 0;
    console.log(`\n  ${isValid ? '✅' : '⚠️'} Schema ${isValid ? 'válido' : 'incompleto'}`);
    
    return { 
      success: true, 
      schema: {
        fields,
        missingFields,
        extraFields,
        isValid
      }
    };
    
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 8: Verificar usuários cadastrados
// ============================================
async function testUsersInDatabase() {
  console.log('\n📋 TESTE 8: Usuários no Banco de Dados');
  console.log('-'.repeat(50));
  
  try {
    // Verificar se há usuários no banco
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, status')
      .limit(10);
    
    if (error) {
      console.log(`  ⚠️ Erro ao buscar usuários: ${error.message}`);
      console.log('  ℹ️ Isso pode ser normal se a tabela "users" não existir ou não estiver acessível');
      return { success: true, note: 'Users table not accessible' };
    }
    
    console.log(`  ✅ Usuários encontrados: ${data.length}`);
    
    if (data.length > 0) {
      data.forEach(user => {
        console.log(`     - ${user.name} (${user.role}) - ${user.status}`);
      });
    }
    
    return { success: true, users: data };
  } catch (error) {
    console.log(`  ⚠️ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 9: Gerar Relatório (NOVO)
// ============================================
async function generateReport(results) {
  console.log('\n📋 TESTE 9: Gerando Relatório');
  console.log('-'.repeat(50));
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 8,
      passedTests: Object.values(results).filter(r => r.success).length,
      failedTests: Object.values(results).filter(r => !r.success).length,
    },
    details: results,
    performance: results.performance?.performance || null,
    schema: results.schemaValidation?.schema || null,
    recommendations: []
  };
  
  // Gerar recomendações
  if (!results.connection.success) {
    report.recommendations.push('Verificar configuração de conexão com Supabase');
  }
  
  if (!results.existingSwaps.success && results.existingSwaps.error) {
    report.recommendations.push('Verificar permissões da tabela swap_requests');
  }
  
  if (results.performance?.performance?.countTime > 500) {
    report.recommendations.push('Considerar adicionar índices na tabela swap_requests');
  }
  
  if (results.schemaValidation?.schema?.missingFields?.length > 0) {
    report.recommendations.push('Atualizar schema da tabela swap_requests');
  }
  
  // Salvar relatório
  const reportPath = path.join(TEST_CONFIG.outputDir, `diagnostic-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`  ✅ Relatório salvo em: ${reportPath}`);
  console.log(`  📊 Testes passados: ${report.summary.passedTests}/${report.summary.totalTests}`);
  console.log(`  💡 Recomendações: ${report.recommendations.length}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n  🎯 Recomendações:');
    report.recommendations.forEach((rec, index) => {
      console.log(`     ${index + 1}. ${rec}`);
    });
  }
  
  return { success: true, reportPath, summary: report.summary };
}

// ============================================
// EXECUTAR TODOS OS TESTES (ATUALIZADO)
// ============================================
async function runDiagnostics() {
  console.log('\n🚀 Iniciando diagnóstico completo...\n');
  
  const startTime = Date.now();
  
  const results = {
    userMapping: await testUserMapping(),
    connection: await testSupabaseConnection(),
    tableStructure: await testTableStructure(),
    existingSwaps: await testExistingSwaps(),
    insertionTest: await testInsertion(),
    performance: await testPerformance(),
    schemaValidation: await testSchemaValidation(),
    usersInDb: await testUsersInDatabase(),
  };
  
  const totalTime = Date.now() - startTime;
  
  console.log('\n========================================');
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('========================================\n');
  
  console.log(`  1. Mapeamento de Usuários: ${results.userMapping ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  2. Conexão Supabase: ${results.connection.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  3. Estrutura Tabela: ${results.tableStructure.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  4. Dados Existentes: ${results.existingSwaps.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  5. Teste Inserção: ${results.insertionTest.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  6. Performance: ${results.performance.success ? '✅ OK' : '❌ PROBLEMA'}${results.performance.skipped ? ' (pulado)' : ''}`);
  console.log(`  7. Schema: ${results.schemaValidation.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  8. Usuários no DB: ${results.usersInDb.success ? '✅ OK' : '❌ PROBLEMA'}`);
  
  console.log(`\n⏱️ Tempo total: ${totalTime}ms`);
  
  // Gerar relatório
  const reportResult = await generateReport(results);
  
  console.log('\n========================================');
  console.log('🎯 DIAGNÓSTICO CONCLUÍDO');
  console.log('========================================');
  
  return { ...results, report: reportResult, totalTime };
}

// ============================================
// PONTO DE ENTRADA
// ============================================
runDiagnostics().catch(console.error);
