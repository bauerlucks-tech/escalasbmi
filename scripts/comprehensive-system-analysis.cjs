const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

// Análise completa do sistema
async function comprehensiveSystemAnalysis() {
  console.log('🔍 ANÁLISE COMPLETA DO SISTEMA - SUPABASE VS FRONTEND');
  console.log('='.repeat(80));
  console.log('⏰ Iniciado em:', new Date().toLocaleString('pt-BR'));
  console.log('');

  const analysisReport = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    info: []
  };

  function addIssue(severity, category, description, details = null) {
    const issue = {
      category,
      description,
      details,
      timestamp: new Date().toISOString()
    };
    analysisReport[severity].push(issue);
    console.log(`[${severity.toUpperCase()}] ${category}: ${description}`);
  }

  try {
    // 1. AUDITORIA DE BANCO DE DADOS
    console.log('📊 1. AUDITORIA DE BANCO DE DADOS');
    console.log('-'.repeat(40));

    // Verificar estrutura das tabelas principais
    const tablesToCheck = ['users', 'swap_requests', 'audit_logs'];

    for (const table of tablesToCheck) {
      try {
        // Verificar se tabela existe
        const { data, error } = await serviceClient
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.code !== 'PGRST116') {
          addIssue('critical', 'Database', `Tabela ${table} não acessível`, error.message);
        } else {
          console.log(`✅ Tabela ${table} acessível`);
        }

        // Contar registros
        const { count, error: countError } = await serviceClient
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (countError) {
          addIssue('high', 'Database', `Erro ao contar registros em ${table}`, countError.message);
        } else {
          console.log(`📊 ${table}: ${count} registros`);
        }

      } catch (tableError) {
        addIssue('critical', 'Database', `Erro crítico na tabela ${table}`, tableError.message);
      }
    }

    // 2. VERIFICAÇÃO DE USUÁRIOS
    console.log('\n👥 2. VERIFICAÇÃO DE USUÁRIOS');
    console.log('-'.repeat(40));

    // Verificar usuários ativos
    const { data: activeUsers, error: usersError } = await serviceClient
      .from('users')
      .select('*')
      .eq('status', 'ativo')
      .order('name', { ascending: true });

    if (usersError) {
      addIssue('critical', 'Users', 'Erro ao buscar usuários ativos', usersError.message);
    } else {
      console.log(`✅ ${activeUsers.length} usuários ativos encontrados`);

      // Verificar inconsistências
      activeUsers.forEach(user => {
        // Verificar campos obrigatórios
        const requiredFields = ['id', 'name', 'email', 'password', 'role'];
        const missingFields = requiredFields.filter(field => !user[field]);

        if (missingFields.length > 0) {
          addIssue('high', 'Users', `Usuário ${user.name} tem campos faltando`, missingFields.join(', '));
        }

        // Verificar roles válidos
        const validRoles = ['operador', 'administrador', 'super_admin'];
        if (!validRoles.includes(user.role)) {
          addIssue('high', 'Users', `Usuário ${user.name} tem role inválido: ${user.role}`, validRoles.join(', '));
        }

        // Verificar emails únicos
        const duplicateEmails = activeUsers.filter(u => u.email === user.email && u.id !== user.id);
        if (duplicateEmails.length > 0) {
          addIssue('medium', 'Users', `Email duplicado para ${user.name}`, user.email);
        }

        // Verificar UUIDs válidos
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.id)) {
          addIssue('medium', 'Users', `UUID inválido para ${user.name}`, user.id);
        }
      });

      // Verificar distribuição de roles
      const roleCounts = {};
      activeUsers.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });

      console.log('📋 Distribuição de roles:');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`  - ${role}: ${count} usuários`);
      });
    }

    // 3. ANÁLISE DO USERMAPPING
    console.log('\n🗺️ 3. ANÁLISE DO USERMAPPING');
    console.log('-'.repeat(40));

    // Ler userMapping.ts
    const fs = require('fs');
    const path = require('path');

    try {
      const userMappingPath = path.join(__dirname, '../src/config/userMapping.ts');
      const userMappingContent = fs.readFileSync(userMappingPath, 'utf8');

      // Extrair todos os UUIDs do userMapping
      const uuidMatches = userMappingContent.match(/'[^']+':\s*'([^']+)'/g) || [];
      const userMappingUUIDs = uuidMatches.map(match => {
        const [, uuid] = match.match(/'([^']+)':\s*'([^']+)'/);
        return uuid;
      });

      console.log(`✅ ${userMappingUUIDs.length} usuários no userMapping.ts`);

      // Verificar se todos os UUIDs existem no banco
      for (const uuid of userMappingUUIDs) {
        const userExists = activeUsers.find(user => user.id === uuid);
        if (!userExists) {
          addIssue('high', 'UserMapping', `UUID ${uuid} no userMapping não existe no banco`, 'Usuário pode estar inativo ou removido');
        }
      }

      // Verificar se todos os usuários ativos estão no userMapping
      const missingFromMapping = activeUsers.filter(user =>
        !userMappingUUIDs.includes(user.id) &&
        user.role !== 'super_admin' // Super admins podem não estar no mapping
      );

      if (missingFromMapping.length > 0) {
        addIssue('high', 'UserMapping', `${missingFromMapping.length} usuários ativos não estão no userMapping`, missingFromMapping.map(u => u.name).join(', '));
      }

    } catch (mappingError) {
      addIssue('high', 'UserMapping', 'Erro ao ler userMapping.ts', mappingError.message);
    }

    // 4. TESTES DE AUTENTICAÇÃO
    console.log('\n🔐 4. TESTES DE AUTENTICAÇÃO');
    console.log('-'.repeat(40));

    // Testar login de diferentes usuários
    const testUsers = [
      { name: 'ADMIN', expectedRole: 'super_admin' },
      { name: 'RICARDO', expectedRole: 'administrador' },
      { name: 'MATHEUS', expectedRole: 'operador' }
    ];

    for (const testUser of testUsers) {
      const user = activeUsers.find(u => u.name === testUser.name);
      if (!user) {
        addIssue('high', 'Auth', `Usuário de teste ${testUser.name} não encontrado`);
        continue;
      }

      try {
        const { data: loginResult, error: loginError } = await serviceClient
          .from('users')
          .select('*')
          .eq('email', user.email)
          .eq('password', user.password)
          .eq('status', 'ativo')
          .single();

        if (loginError) {
          addIssue('high', 'Auth', `Login falhou para ${testUser.name}`, loginError.message);
        } else if (loginResult.role !== testUser.expectedRole) {
          addIssue('high', 'Auth', `Role incorreto para ${testUser.name}`, `Esperado: ${testUser.expectedRole}, Encontrado: ${loginResult.role}`);
        } else {
          console.log(`✅ Login funcionando para ${testUser.name} (${loginResult.role})`);
        }
      } catch (authError) {
        addIssue('high', 'Auth', `Erro crítico no login de ${testUser.name}`, authError.message);
      }
    }

    // 5. VERIFICAÇÃO DE SWAPS
    console.log('\n🔄 5. VERIFICAÇÃO DE SWAPS');
    console.log('-'.repeat(40));

    const { data: swaps, error: swapsError } = await serviceClient
      .from('swap_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (swapsError && swapsError.code !== 'PGRST116') {
      addIssue('high', 'Swaps', 'Erro ao buscar swap requests', swapsError.message);
    } else {
      console.log(`✅ ${swaps ? swaps.length : 0} swap requests encontradas`);

      if (swaps && swaps.length > 0) {
        // Verificar integridade dos dados
        swaps.forEach(swap => {
          const requiredSwapFields = ['requester_id', 'requester_name', 'target_id', 'target_name', 'original_date', 'original_shift', 'target_date', 'target_shift', 'status'];
          const missingSwapFields = requiredSwapFields.filter(field => !swap[field]);

          if (missingSwapFields.length > 0) {
            addIssue('medium', 'Swaps', `Swap ${swap.id} tem campos faltando`, missingSwapFields.join(', '));
          }

          // Verificar se usuários existem
          const requesterExists = activeUsers.find(u => u.id === swap.requester_id);
          const targetExists = activeUsers.find(u => u.id === swap.target_id);

          if (!requesterExists) {
            addIssue('medium', 'Swaps', `Requester ID ${swap.requester_id} não existe`, swap.requester_name);
          }
          if (!targetExists) {
            addIssue('medium', 'Swaps', `Target ID ${swap.target_id} não existe`, swap.target_name);
          }
        });
      }
    }

    // 6. ANÁLISE DE AUDIT LOGS
    console.log('\n📋 6. ANÁLISE DE AUDIT LOGS');
    console.log('-'.repeat(40));

    const { data: auditLogs, error: auditError } = await serviceClient
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (auditError && auditError.code !== 'PGRST116') {
      addIssue('medium', 'Audit', 'Erro ao buscar audit logs', auditError.message);
    } else {
      console.log(`✅ ${auditLogs ? auditLogs.length : 0} registros de audit encontrados`);

      if (auditLogs && auditLogs.length > 0) {
        // Verificar integridade dos logs
        auditLogs.forEach(log => {
          if (!log.user_name || !log.action) {
            addIssue('low', 'Audit', `Audit log incompleto ID ${log.id}`);
          }
        });
      }
    }

    // 7. ANÁLISE DE PERFORMANCE
    console.log('\n⚡ 7. ANÁLISE DE PERFORMANCE');
    console.log('-'.repeat(40));

    // Testar tempo de resposta de queries comuns
    const performanceTests = [
      { name: 'Contar usuários ativos', query: () => serviceClient.from('users').select('*', { count: 'exact', head: true }).eq('status', 'ativo') },
      { name: 'Buscar usuário específico', query: () => serviceClient.from('users').select('*').eq('name', 'ADMIN').single() },
      { name: 'Listar swaps recentes', query: () => serviceClient.from('swap_requests').select('*').limit(5) }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        await test.query();
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`⏱️ ${test.name}: ${duration}ms`);

        if (duration > 1000) {
          addIssue('medium', 'Performance', `Query lenta: ${test.name}`, `${duration}ms`);
        }
      } catch (perfError) {
        addIssue('medium', 'Performance', `Erro na query: ${test.name}`, perfError.message);
      }
    }

    // 8. VERIFICAÇÃO DE SEGURANÇA
    console.log('\n🔒 8. VERIFICAÇÃO DE SEGURANÇA');
    console.log('-'.repeat(40));

    // Verificar exposição de dados sensíveis
    const sensitiveFields = ['password'];

    activeUsers.forEach(user => {
      sensitiveFields.forEach(field => {
        if (user[field] && user[field].length < 32) {
          addIssue('high', 'Security', `Senha em texto plano para ${user.name}`, 'Considerar migração para hash');
        }
      });
    });

    // Verificar emails vazios ou padrão
    const usersWithEmptyEmail = activeUsers.filter(user => !user.email || user.email.includes('@escala-bmi.com'));
    if (usersWithEmptyEmail.length > activeUsers.length * 0.5) {
      addIssue('medium', 'Security', 'Muitos usuários com emails padrão', 'Considerar emails únicos para todos os usuários');
    }

    console.log('\n✅ Verificação de segurança básica concluída');

    // 9. RELATÓRIO FINAL
    console.log('\n📊 9. RELATÓRIO FINAL DE ANÁLISE');
    console.log('='.repeat(80));

    const totalIssues = Object.values(analysisReport).reduce((sum, issues) => sum + issues.length, 0);

    console.log(`\n🔴 TOTAL DE PROBLEMAS ENCONTRADOS: ${totalIssues}`);
    console.log('');

    Object.entries(analysisReport).forEach(([severity, issues]) => {
      if (issues.length > 0) {
        const severityEmoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
          info: 'ℹ️'
        }[severity];

        console.log(`${severityEmoji} ${severity.toUpperCase()}: ${issues.length} problemas`);

        issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.category}: ${issue.description}`);
          if (issue.details) {
            console.log(`     Detalhes: ${issue.details}`);
          }
        });
        console.log('');
      }
    });

    // Recomendações
    console.log('🎯 RECOMENDAÇÕES DE CORREÇÃO:');
    console.log('-'.repeat(50));

    if (analysisReport.critical.length > 0) {
      console.log('🔴 PRIORIDADE CRÍTICA - Corrigir imediatamente:');
      analysisReport.critical.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
    }

    if (analysisReport.high.length > 0) {
      console.log('\n🟠 PRIORIDADE ALTA - Corrigir nos próximos dias:');
      analysisReport.high.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.description}`);
      });
    }

    console.log('\n✅ ANÁLISE COMPLETA FINALIZADA!');
    console.log('⏰ Finalizado em:', new Date().toLocaleString('pt-BR'));

    // Salvar relatório em arquivo
    const reportPath = path.join(__dirname, '../analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));
    console.log(`\n💾 Relatório salvo em: ${reportPath}`);

    return analysisReport;

  } catch (error) {
    console.error('❌ ERRO CRÍTICO NA ANÁLISE:', error.message);
    addIssue('critical', 'System', 'Erro crítico na análise do sistema', error.message);
    return analysisReport;
  }
}

// Executar análise
comprehensiveSystemAnalysis().then(() => {
  console.log('\n🏁 Análise concluída!');
});
