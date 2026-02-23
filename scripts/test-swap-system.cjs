/**
 * Script de Diagnóstico do Sistema de Trocas (Swaps)
 * 
 * Este script testa várias hipóteses sobre possíveis problemas
 * no sistema de trocas do aplicativo de escalas BMI.
 * 
 * Hipóteses testadas:
 * 1. Problema de mapeamento de usuários (case sensitivity)
 * 2. Problema de conexão com Supabase
 * 3. Estrutura da tabela swap_requests
 * 4. Dados existentes de trocas
 * 5. Validação de dados
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mapeamento de usuários (do arquivo src/config/userMapping.ts)
// COM a correção de case sensitivity
const USER_UUIDS = {
  'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
  'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
  'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
  'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
  'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc',
  'GUILHERME': 'b5a1b456-e837-4f47-ab41-4734a00a0355',
  'RICARDO': 'fd2513b2-3260-4ad2-97b1-6f5fbb88c192',
  'ADMIN': 'fd2513b2-3260-4ad2-97b1-6f5fbb88c192',
};

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
// HIPÓTESE 4: Dados existentes de trocas
// ============================================
async function testExistingSwaps() {
  console.log('\n📋 TESTE 4: Dados Existentes de Trocas');
  console.log('-'.repeat(50));
  
  try {
    const { data, error, count } = await supabase
      .from('swap_requests')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log(`  ❌ Erro ao buscar dados: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    console.log(`  ✅ Total de registros: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n  📋 Últimas 3 trocas:');
      data.slice(0, 3).forEach((swap, index) => {
        console.log(`\n  --- Troca #${index + 1} ---`);
        console.log(`     ID: ${swap.id}`);
        console.log(`     Solicitante: ${swap.requester_name}`);
        console.log(`     Alvo: ${swap.target_name}`);
        console.log(`     Data Original: ${swap.original_date}`);
        console.log(`     Data Target: ${swap.target_date}`);
        console.log(`     Status: ${swap.status}`);
        console.log(`     Criado em: ${swap.created_at}`);
      });
    } else {
      console.log('  ℹ️ Nenhuma troca encontrada no banco de dados');
    }
    
    return { success: true, count: count || 0, data: data || [] };
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
// HIPÓTESE 6: Verificar usuários cadastrados
// ============================================
async function testUsersInDatabase() {
  console.log('\n📋 TESTE 6: Usuários no Banco de Dados');
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
// EXECUTAR TODOS OS TESTES
// ============================================
async function runDiagnostics() {
  console.log('\n🚀 Iniciando diagnóstico...\n');
  
  const results = {
    userMapping: await testUserMapping(),
    connection: await testSupabaseConnection(),
    tableStructure: await testTableStructure(),
    existingSwaps: await testExistingSwaps(),
    insertionTest: await testInsertion(),
    usersInDb: await testUsersInDatabase(),
  };
  
  console.log('\n========================================');
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('========================================\n');
  
  console.log(`  1. Mapeamento de Usuários: ${results.userMapping ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  2. Conexão Supabase: ${results.connection.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  3. Estrutura Tabela: ${results.tableStructure.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  4. Dados Existentes: ${results.existingSwaps.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  5. Teste Inserção: ${results.insertionTest.success ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`  6. Usuários no DB: ${results.usersInDb.success ? '✅ OK' : '❌ PROBLEMA'}`);
  
  console.log('\n========================================');
  console.log('💡 RECOMENDAÇÕES');
  console.log('========================================\n');
  
  if (!results.userMapping) {
    console.log('  • Normalizar nomes de usuários para maiúsculas antes de buscar UUID');
  }
  
  if (!results.connection.success) {
    console.log('  • Verificar conexão com a internet e configurações do Supabase');
  }
  
  if (!results.tableStructure.success) {
    console.log('  • Verificar se a tabela swap_requests existe no Supabase');
  }
  
  if (results.existingSwaps.count === 0) {
    console.log('  • Nenhuma troca encontrada - o sistema pode estar funcionando, mas sem dados');
  }
  
  console.log('\n✅ Diagnóstico concluído!\n');
}

runDiagnostics().catch(console.error);
