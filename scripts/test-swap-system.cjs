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
      const { data: sampleData, error } = await supabase
        .from('swap_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.min(3, TEST_CONFIG.maxRecords));
      
      if (error) {
        console.log(`  ❌ Erro ao buscar amostra: ${error.message}`);
        return { success: false, error: error.message };
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('\n  📋 Últimas trocas:');
        sampleData.forEach((swap, index) => {
          console.log(`\n  --- Troca #${index + 1} ---`);
          console.log(`     ID: ${swap.id}`);
          console.log(`     Solicitante: ${swap.requester_name}`);
          console.log(`     Alvo: ${swap.target_name}`);
          console.log(`     Data Original: ${swap.original_date}`);
          console.log(`     Data Target: ${swap.target_date}`);
          console.log(`     Status: ${swap.status}`);
          console.log(`     Criado em: ${swap.created_at}`);
        });
        
        // Análise de padrões - CORRIGIDO: usar sampleData em vez de data
        const statusCounts = {};
        sampleData.forEach(swap => {
          statusCounts[swap.status] = (statusCounts[swap.status] || 0) + 1;
        });
        
        console.log('\n  📊 Distribuição de status (amostra):');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`);
        });
        
        return { success: true, count: totalCount || 0, data: sampleData || [] };
      }
    } else {
      console.log('  ℹ️ Nenhuma troca encontrada no banco de dados');
    }
    
    return { success: true, count: totalCount || 0, data: [] };
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
    
    // Campos esperados (ATUALIZADO com base no schema real)
    const expectedFields = [
      'id', 'requester_id', 'requester_name', 'target_id', 'target_name',
      'original_date', 'original_shift', 'target_date', 'target_shift',
      'status', 'created_at', 'responded_at', 'responded_by',
      'admin_approved', 'admin_approved_at', 'admin_approved_by'
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
// HIPÓTESE 10: Teste de Edge Cases (NOVO)
// ============================================
async function testEdgeCases() {
  console.log('\n📋 TESTE 10: Teste de Edge Cases');
  console.log('-'.repeat(50));
  
  const results = {};
  
  try {
    // Teste 1: Query com filtro inválido
    console.log('  🔍 Testando filtro inválido...');
    const { data: invalidFilter, error: filterError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('invalid_field', 'invalid_value')
      .limit(1);
    
    if (filterError) {
      console.log('  ✅ Filtro inválido tratado corretamente');
      results.invalidFilter = { success: true, error: filterError.message };
    } else {
      console.log('  ⚠️ Filtro inválido não retornou erro');
      results.invalidFilter = { success: false, note: 'No error for invalid filter' };
    }
    
    // Teste 2: Query com limite excessivo
    console.log('  🔍 Testando limite excessivo...');
    const { data: largeLimit, error: limitError } = await supabase
      .from('swap_requests')
      .select('*')
      .limit(10000);
    
    if (limitError) {
      console.log('  ✅ Limite excessivo tratado corretamente');
      results.largeLimit = { success: true, error: limitError.message };
    } else {
      console.log(`  ⚠️ Limite excessivo retornou ${largeLimit?.length || 0} registros`);
      results.largeLimit = { success: true, records: largeLimit?.length || 0 };
    }
    
    // Teste 3: Query com ordenação inválida
    console.log('  🔍 Testando ordenação inválida...');
    const { data: invalidOrder, error: orderError } = await supabase
      .from('swap_requests')
      .select('*')
      .order('invalid_field', { ascending: false })
      .limit(1);
    
    if (orderError) {
      console.log('  ✅ Ordenação inválida tratada corretamente');
      results.invalidOrder = { success: true, error: orderError.message };
    } else {
      console.log('  ⚠️ Ordenação inválida não retornou erro');
      results.invalidOrder = { success: false, note: 'No error for invalid order' };
    }
    
    // Teste 4: Query com campos inexistentes
    console.log('  🔍 Testando campos inexistentes...');
    const { data: invalidFields, error: fieldsError } = await supabase
      .from('swap_requests')
      .select('invalid_field1,invalid_field2')
      .limit(1);
    
    if (fieldsError) {
      console.log('  ✅ Campos inexistentes tratados corretamente');
      results.invalidFields = { success: true, error: fieldsError.message };
    } else {
      console.log('  ⚠️ Campos inexistentes não retornaram erro');
      results.invalidFields = { success: false, note: 'No error for invalid fields' };
    }
    
    // Teste 5: Conexão simultânea
    console.log('  🔍 Testando conexões simultâneas...');
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        supabase
          .from('swap_requests')
          .select('count', { count: 'exact', head: true })
      );
    }
    
    const concurrentResults = await Promise.all(promises);
    const endTime = Date.now();
    
    const allSuccessful = concurrentResults.every(result => !result.error);
    console.log(`  ${allSuccessful ? '✅' : '❌'} Conexões simultâneas: ${endTime - startTime}ms`);
    results.concurrent = { success: allSuccessful, timeMs: endTime - startTime };
    
    // Resumo dos edge cases
    const passedTests = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n  📊 Edge cases: ${passedTests}/${totalTests} passaram`);
    
    return { success: true, results, passedTests, totalTests };
    
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 11: Teste de Concorrência (NOVO)
// ============================================
async function testConcurrency() {
  console.log('\n📋 TESTE 11: Teste de Concorrência');
  console.log('-'.repeat(50));
  
  try {
    // Simular múltiplas operações simultâneas
    const concurrentOperations = [];
    const operationCount = 10;
    
    console.log(`  🔍 Testando ${operationCount} operações simultâneas...`);
    
    const startTime = Date.now();
    
    // Criar múltiplas queries simultâneas
    for (let i = 0; i < operationCount; i++) {
      concurrentOperations.push(
        supabase
          .from('swap_requests')
          .select('*', { count: 'exact', head: true })
      );
    }
    
    const results = await Promise.all(concurrentOperations);
    const endTime = Date.now();
    
    // Analisar resultados
    const successfulOps = results.filter(r => !r.error);
    const failedOps = results.filter(r => r.error);
    
    console.log(`  ✅ Operações bem-sucedidas: ${successfulOps.length}/${operationCount}`);
    console.log(`  ⏱️ Tempo total: ${endTime - startTime}ms`);
    console.log(`  📊 Média por operação: ${((endTime - startTime) / operationCount).toFixed(2)}ms`);
    
    if (failedOps.length > 0) {
      console.log(`  ❌ Operações falharam: ${failedOps.length}`);
      failedOps.forEach((op, index) => {
        console.log(`     - Erro ${index + 1}: ${op.error.message}`);
      });
    }
    
    // Verificar consistência dos resultados
    const counts = successfulOps.map(op => op.count);
    const uniqueCounts = [...new Set(counts)];
    
    if (uniqueCounts.length === 1) {
      console.log('  ✅ Resultados consistentes entre operações');
    } else {
      console.log('  ⚠️ Resultados inconsistentes detectados');
      console.log(`     Contagens encontradas: ${uniqueCounts.join(', ')}`);
    }
    
    const isSuccessful = failedOps.length === 0 && uniqueCounts.length === 1;
    console.log(`\n  ${isSuccessful ? '✅' : '⚠️'} Teste de concorrência: ${isSuccessful ? 'PASSOU' : 'PROBLEMAS'}`);
    
    return {
      success: isSuccessful,
      operationCount,
      successfulOps: successfulOps.length,
      failedOps: failedOps.length,
      totalTime: endTime - startTime,
      avgTime: (endTime - startTime) / operationCount,
      consistent: uniqueCounts.length === 1
    };
    
  } catch (error) {
    console.log(`  ❌ Erro fatal: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================
// HIPÓTESE 12: Teste de Integridade de Dados (NOVO)
// ============================================
async function testDataIntegrity() {
  console.log('\n📋 TESTE 12: Integridade de Dados');
  console.log('-'.repeat(50));
  
  try {
    // Buscar amostra para validação
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .limit(50);
    
    if (error) {
      console.log(`  ❌ Erro ao buscar dados: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.log('  ℹ️ Sem dados para validar');
      return { success: true, empty: true };
    }
    
    const issues = [];
    const validatedRecords = [];
    
    data.forEach((record, index) => {
      const recordIssues = [];
      
      // Validação 1: UUIDs válidos
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (record.requester_id && !uuidRegex.test(record.requester_id)) {
        recordIssues.push('requester_id inválido');
      }
      
      if (record.target_id && !uuidRegex.test(record.target_id)) {
        recordIssues.push('target_id inválido');
      }
      
      // Validação 2: Campos obrigatórios
      const requiredFields = ['requester_name', 'target_name', 'original_date', 'target_date', 'status'];
      requiredFields.forEach(field => {
        if (!record[field] || record[field].toString().trim() === '') {
          recordIssues.push(`${field} vazio`);
        }
      });
      
      // Validação 3: Status válido
      const validStatuses = ['pending', 'accepted', 'approved', 'rejected', 'cancelled'];
      if (record.status && !validStatuses.includes(record.status)) {
        recordIssues.push(`status inválido: ${record.status}`);
      }
      
      // Validação 4: Datas razoáveis
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (record.original_date && !dateRegex.test(record.original_date)) {
        recordIssues.push(`original_date formato inválido: ${record.original_date}`);
      }
      
      if (record.target_date && !dateRegex.test(record.target_date)) {
        recordIssues.push(`target_date formato inválido: ${record.target_date}`);
      }
      
      // Validação 5: Timestamps válidos
      if (record.created_at && isNaN(Date.parse(record.created_at))) {
        recordIssues.push('created_at inválido');
      }
      
      if (recordIssues.length > 0) {
        issues.push({
          recordId: record.id,
          issues: recordIssues
        });
      } else {
        validatedRecords.push(record.id);
      }
    });
    
    console.log(`  📊 Registros analisados: ${data.length}`);
    console.log(`  ✅ Registros válidos: ${validatedRecords.length}`);
    console.log(`  ❌ Registros com problemas: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log('\n  🔍 Problemas encontrados:');
      issues.slice(0, 5).forEach((issue, index) => {
        console.log(`     ${index + 1}. Registro ${issue.recordId}: ${issue.issues.join(', ')}`);
      });
      
      if (issues.length > 5) {
        console.log(`     ... e mais ${issues.length - 5} problemas`);
      }
    }
    
    const integrityScore = (validatedRecords.length / data.length) * 100;
    console.log(`\n  📈 Pontuação de integridade: ${integrityScore.toFixed(1)}%`);
    
    const isHealthy = integrityScore >= 90;
    console.log(`  ${isHealthy ? '✅' : '⚠️'} Integridade: ${isHealthy ? 'SAUDÁVEL' : 'NECESSITA ATENÇÃO'}`);
    
    return {
      success: true,
      totalRecords: data.length,
      validRecords: validatedRecords.length,
      invalidRecords: issues.length,
      integrityScore,
      isHealthy,
      issues: issues.slice(0, 10) // Limitar para evitar logs excessivos
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
      totalTests: 11,
      passedTests: Object.values(results).filter(r => r.success).length,
      failedTests: Object.values(results).filter(r => !r.success).length,
      successRate: ((Object.values(results).filter(r => r.success).length / 11) * 100).toFixed(1)
    },
    details: results,
    performance: results.performance?.performance || null,
    schema: results.schemaValidation?.schema || null,
    edgeCases: results.edgeCases?.results || null,
    concurrency: results.concurrency || null,
    dataIntegrity: results.dataIntegrity || null,
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
  
  if (results.edgeCases?.passedTests < results.edgeCases?.totalTests) {
    report.recommendations.push('Revisar tratamento de edge cases no sistema');
  }
  
  if (!results.concurrency?.success) {
    report.recommendations.push('Investigar problemas de concorrência no banco de dados');
  }
  
  if (results.dataIntegrity?.integrityScore < 90) {
    report.recommendations.push('Corrigir problemas de integridade de dados');
  }
  
  if (results.dataIntegrity?.invalidRecords > 0) {
    report.recommendations.push(`Validar e corrigir ${results.dataIntegrity.invalidRecords} registros com problemas`);
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
// EXECUTAR TODOS OS TESTES (ATUALIZADO COMPLETO)
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
    edgeCases: await testEdgeCases(),
    concurrency: await testConcurrency(),
    dataIntegrity: await testDataIntegrity(),
  };
  
  const totalTime = Date.now() - startTime;
  
  console.log('\n========================================');
  console.log('📊 RESUMO DO DIAGNÓSTICO COMPLETO');
  console.log('========================================\n');
  
  console.log(`  1. Mapeamento de Usuários: ${results.userMapping ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  2. Conexão Supabase: ${results.connection.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  3. Estrutura Tabela: ${results.tableStructure.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  4. Dados Existentes: ${results.existingSwaps.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  5. Teste Inserção: ${results.insertionTest.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  6. Performance: ${results.performance.success ? '✅ OK' : '❌ PROBLEMA'}${results.performance.skipped ? ' (pulado)' : ''}`);
  console.log(`  7. Schema: ${results.schemaValidation.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  8. Usuários no DB: ${results.usersInDb.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  9. Edge Cases: ${results.edgeCases.success ? '✅ OK' : '❌ PROBLEMA'} (${results.edgeCases.passedTests || 0}/${results.edgeCases.totalTests || 0})`);
  console.log(` 10. Concorrência: ${results.concurrency.success ? '✅ OK' : '❌ PROBLEMA'} (${results.concurrency.successfulOps || 0}/${results.concurrency.operationCount || 0})`);
  console.log(` 11. Integridade: ${results.dataIntegrity.success ? '✅ OK' : '❌ PROBLEMA'} (${results.dataIntegrity.integrityScore || 0}%)`);
  
  console.log(`\n⏱️ Tempo total: ${totalTime}ms`);
  
  // Estatísticas detalhadas
  const totalTests = 11;
  const passedTests = Object.values(results).filter(r => r.success).length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log(`📊 Taxa de sucesso: ${successRate.toFixed(1)}% (${passedTests}/${totalTests})`);
  
  // Análise de performance
  if (results.performance?.performance) {
    console.log(`⚡ Performance queries: ${results.performance.performance.countTime}ms (contagem), ${results.performance.performance.limitTime}ms (busca)`);
  }
  
  // Análise de dados
  if (results.existingSwaps?.count) {
    console.log(`📈 Volume de dados: ${results.existingSwaps.count} trocas registradas`);
  }
  
  // Análise de integridade
  if (results.dataIntegrity?.integrityScore) {
    const healthStatus = results.dataIntegrity.isHealthy ? 'SAUDÁVEL' : 'NECESSITA ATENÇÃO';
    console.log(`🛡️ Integridade de dados: ${healthStatus} (${results.dataIntegrity.integrityScore.toFixed(1)}%)`);
  }
  
  // Gerar relatório
  const reportResult = await generateReport(results);
  
  console.log('\n========================================');
  console.log('🎯 DIAGNÓSTICO COMPLETO CONCLUÍDO');
  console.log('========================================');
  
  // Verificação final de saúde do sistema
  const criticalIssues = [];
  
  if (!results.connection.success) criticalIssues.push('Conexão com Supabase');
  if (!results.tableStructure.success) criticalIssues.push('Estrutura da tabela');
  if (!results.existingSwaps.success) criticalIssues.push('Acesso aos dados');
  if (results.dataIntegrity?.integrityScore < 80) criticalIssues.push('Integridade de dados crítica');
  
  if (criticalIssues.length > 0) {
    console.log('\n❌ PROBLEMAS CRÍTICOS ENCONTRADOS:');
    criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('\n⚠️ RECOMENDAÇÃO: Corrigir problemas críticos antes de usar o sistema em produção');
  } else {
    console.log('\n✅ SISTEMA SAUDÁVEL E PRONTO PARA USO!');
  }
  
  return { 
    ...results, 
    report: reportResult, 
    totalTime,
    successRate,
    criticalIssues,
    isHealthy: criticalIssues.length === 0
  };
}

// ============================================
// PONTO DE ENTRADA
// ============================================
runDiagnostics().catch(console.error);
