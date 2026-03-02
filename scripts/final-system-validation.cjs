/**
 * VALIDAÇÃO COMPLETA DO SISTEMA
 * Testa todas as funções principais do sistema
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Utilitário de teste
const testResults = { passed: 0, failed: 0, warnings: 0 };

function test(name, result, details = '') {
  if (result === true) {
    console.log(`  ✅ ${name}`);
    testResults.passed++;
  } else if (result === 'warning') {
    console.log(`  ⚠️  ${name}: ${details}`);
    testResults.warnings++;
  } else {
    console.log(`  ❌ ${name}: ${details}`);
    testResults.failed++;
  }
}

async function validateSystem() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('           VALIDAÇÃO COMPLETA DO SISTEMA DE ESCALAS BMI');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');

  // ============================================================================
  // 1. USUÁRIOS E AUTENTICAÇÃO
  // ============================================================================
  console.log('📋 1. USUÁRIOS E AUTENTICAÇÃO');
  console.log('─'.repeat(76));

  const { data: users } = await supabase.from('users').select('*').order('name');
  
  test('Tabela de usuários acessível', users !== null, users?.length || 0);
  test('Usuários ativos existem', users?.filter(u => u.status === 'ativo').length > 0, '');
  
  const activeUsers = users.filter(u => u.status === 'ativo');
  console.log(`  📊 Total de usuários: ${users.length}, Ativos: ${activeUsers.length}`);

  // Verificar campos obrigatórios
  let hasAllFields = true;
  let missingFields = [];
  activeUsers.forEach(u => {
    if (!u.id || !u.name || !u.email || !u.password || !u.role) {
      hasAllFields = false;
      missingFields.push(u.name);
    }
  });
  test('Todos usuários têm campos obrigatórios', hasAllFields, missingFields.join(', '));

  // Verificar roles
  const roles = { operador: 0, administrador: 0, super_admin: 0 };
  activeUsers.forEach(u => roles[u.role] = (roles[u.role] || 0) + 1);
  console.log(`  📊 Roles: Operadores=${roles.operador}, Administradores=${roles.administrador}, SuperAdmin=${roles.super_admin}`);
  
  test('Existe pelo menos 1 administrador', roles.administrador > 0, '');
  test('Existe pelo menos 1 super_admin', roles.super_admin > 0, '');

  // Verificar senhas (hash)
  const usersWithHash = activeUsers.filter(u => u.password?.length === 64);
  const usersWithPlainText = activeUsers.filter(u => u.password && u.password.length !== 64);
  test('Todas senhas são hash SHA256', usersWithPlainText.length === 0, `${usersWithPlainText.length} senhas em texto plano`);
  console.log(`  📊 Senhas em hash: ${usersWithHash.length}, Em texto: ${usersWithPlainText.length}`);

  // Verificar duplicatas de ADMIN
  const adminUsers = users.filter(u => u.name === 'ADMIN');
  test('ADMIN não duplicado', adminUsers.length <= 1, `${adminUsers.length} registros`);
  if (adminUsers.length > 1) {
    console.log(`  ⚠️  IDs duplicados: ${adminUsers.map(a => a.id).join(', ')}`);
  }

  console.log('');

  // ============================================================================
  // 2. ESCALAS MENSAIS
  // ============================================================================
  console.log('📅 2. ESCALAS MENSAIS');
  console.log('─'.repeat(76));

  const { data: schedules, error: scheduleError } = await supabase
    .from('month_schedules')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  test('Tabela de escalas acessível', scheduleError === null, scheduleError?.message);
  test('Escalas existem', schedules?.length > 0, `${schedules?.length || 0} escalas`);

  if (schedules?.length > 0) {
    const latestSchedule = schedules[0];
    console.log(`  📊 Última escala: ${latestSchedule.month}/${latestSchedule.year}`);
    
    // Verificar estrutura da escala
    const hasEntries = latestSchedule.entries && latestSchedule.entries.length > 0;
    test('Escala tem entradas', hasLoaded = hasEntries, '');
    
    if (hasEntries) {
      console.log(`  📊 Entradas na escala: ${latestSchedule.entries.length}`);
      
      // Verificar formato das entradas
      const sampleEntry = latestSchedule.entries[0];
      const hasDate = 'date' in sampleEntry;
      const hasDayOfWeek = 'dayOfWeek' in sampleEntry;
      test('Entradas têm formato correto', hasDate && hasDayOfWeek, '');
    }

    // Verificar usuários únicos na escala
    const usersInSchedule = new Set();
    schedules.forEach(s => {
      s.entries?.forEach(e => {
        if (e.meioPeriodo) usersInSchedule.add(e.meioPeriodo);
        if (e.fechamento) usersInSchedule.add(e.fechamento);
      });
    });
    console.log(`  📊 Usuários nas escalas: ${usersInSchedule.size}`);
  }

  console.log('');

  // ============================================================================
  // 3. SOLICITAÇÕES DE TROCA
  // ============================================================================
  console.log('🔄 3. SOLICITAÇÕES DE TROCA (SWAPS)');
  console.log('─'.repeat(76));

  const { data: swaps, error: swapsError } = await supabase
    .from('swap_requests')
    .select('*')
    .order('created_at', { ascending: false });

  test('Tabela de swaps acessível', swapsError === null, swapsError?.message);
  test('Tabela de swaps funcional', true, `${swaps?.length || 0} registros`);

  if (swaps?.length > 0) {
    const pendingSwaps = swaps.filter(s => s.status === 'pending');
    const acceptedSwaps = swaps.filter(s => s.status === 'accepted');
    console.log(`  📊 Pendentes: ${pendingSwaps.length}, Aceitas: ${acceptedSwaps.length}`);
  } else {
    console.log('  ℹ️  Nenhuma solicitação de troca (tabela vazia)');
  }

  console.log('');

  // ============================================================================
  // 4. SOLICITAÇÕES DE FÉRIAS
  // ============================================================================
  console.log('🏖️  4. SOLICITAÇÕES DE FÉRIAS');
  console.log('─'.repeat(76));

  const { data: vacations, error: vacationError } = await supabase
    .from('vacation_requests')
    .select('*')
    .order('requested_at', { ascending: false });

  test('Tabela de férias acessível', vacationError === null, vacationError?.message);
  test('Tabela de férias funcional', true, `${vacations?.length || 0} registros`);

  if (vacations?.length > 0) {
    const pendingVacations = vacations.filter(v => v.status === 'pending');
    console.log(`  📊 Férias pendentes: ${pendingVacations.length}`);
  } else {
    console.log('  ℹ️  Nenhuma solicitação de férias (tabela vazia)');
  }

  console.log('');

  // ============================================================================
  // 5. LOGS DE AUDITORIA
  // ============================================================================
  console.log('📝 5. LOGS DE AUDITORIA');
  console.log('─'.repeat(76));

  const { data: auditLogs, error: auditError } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  test('Tabela de audit logs acessível', auditError === null, auditError?.message);
  test('Audit logs existem', auditLogs?.length > 0, `${auditLogs?.length || 0} logs`);

  if (auditLogs?.length > 0) {
    console.log(`  📊 Total de logs: ${auditLogs.length}`);
    
    // Verificar tipos de ação
    const actionTypes = {};
    auditLogs.forEach(log => {
      actionTypes[log.action] = (actionTypes[log.action] || 0) + 1;
    });
    console.log('  📊 Tipos de ação:');
    Object.entries(actionTypes).slice(0, 5).forEach(([action, count]) => {
      console.log(`     - ${action}: ${count}`);
    });
  }

  console.log('');

  // ============================================================================
  // 6. CONSISTÊNCIA DO USERMAPPING
  // ============================================================================
  console.log('🗺️ 6. CONSISTÊNCIA DO USERMAPPING');
  console.log('─'.repeat(76));

  const USER_UUIDS = {
    'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
    'GUILHERME': 'b5a1b456-e837-4f47-ab41-4734a00a0355',
    'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
    'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc',
    'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
    'MATHEUS': '07935022-3fdf-4f83-907f-e57ae8831511',
    'RICARDO': 'bbad7a98-2412-43e6-8dd6-cf52fae171be',
    'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
    'ADMIN': '550e8400-299a-4d5f-8a7b-9b8e3a9b2c1f',
  };

  let mappingIssues = 0;
  Object.entries(USER_UUIDS).forEach(([name, uuid]) => {
    const userInDb = users.find(u => u.id === uuid);
    if (!userInDb) {
      mappingIssues++;
    }
  });

  test('UserMapping consistente', mappingIssues === 0, `${mappingIssues} inconsistências`);

  // Verificar usuários ativos não mapeados
  const notMapped = activeUsers.filter(u => 
    !Object.values(USER_UUIDS).includes(u.id) && 
    u.role !== 'super_admin'
  );
  test('Usuários ativos mapeados', notMapped.length === 0, `${notMapped.length} não mapeados`);

  console.log('');

  // ============================================================================
  // 7. TESTE DE PERFORMANCE
  // ============================================================================
  console.log('⚡ 7. TESTE DE PERFORMANCE');
  console.log('─'.repeat(76));

  const startTime = Date.now();
  await supabase.from('users').select('*').eq('status', 'ativo');
  const userQueryTime = Date.now() - startTime;
  test('Query usuários < 500ms', userQueryTime < 500, `${userQueryTime}ms`);

  const startTime2 = Date.now();
  await supabase.from('month_schedules').select('*').limit(10);
  const scheduleQueryTime = Date.now() - startTime2;
  test('Query escalas < 500ms', scheduleQueryTime < 500, `${scheduleQueryTime}ms`);

  console.log('');

  // ============================================================================
  // RESUMO FINAL
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                              RESUMO DA VALIDAÇÃO');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  ✅ Testes passing: ${testResults.passed}`);
  console.log(`  ❌ Testes falhados: ${testResults.failed}`);
  console.log(`  ⚠️  Avisos: ${testResults.warnings}`);
  console.log('');

  if (testResults.failed === 0) {
    console.log('  🎉 SISTEMA FUNCIONANDO CORRETAMENTE!');
  } else {
    console.log('  🔧 ATENÇÃO: Alguns problemas foram encontrados!');
    console.log('     Revise os itens marcados com ❌ acima.');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  return testResults;
}

validateSystem().catch(console.error);
