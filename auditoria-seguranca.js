// Script de Verificação de Segurança do Sistema
// Execute no console do navegador para realizar auditoria completa

function realizarAuditoriaSeguranca() {
  console.log('🔍 INICIANDO AUDITORIA DE SEGURANÇA DO SISTEMA...');
  console.log('='.repeat(60));
  
  const resultados = {
    auditoria: {
      logs: [],
      usuarios: [],
      acessos: [],
      dados: [],
      vulnerabilidades: []
    },
    timestamp: new Date().toISOString(),
    versao: '1.2beta'
  };
  
  // 1. Verificar Logs de Auditoria
  console.log('\n📋 1. VERIFICANDO LOGS DE AUDITORIA...');
  const auditLogs = JSON.parse(localStorage.getItem('escala_auditLogs') || '{"logs": []}');
  const logs = auditLogs.logs || [];
  
  console.log(`📊 Total de logs: ${logs.length}`);
  
  // Verificar tentativas de login falhadas
  const loginsFalhados = logs.filter(log => log.action === 'LOGIN' && !log.success);
  console.log(`❌ Logins falhados: ${loginsFalhados.length}`);
  
  if (loginsFalhados.length > 0) {
    console.log('🚨 DETALHES DOS LOGINS FALHADOS:');
    loginsFalhados.slice(0, 5).forEach(log => {
      console.log(`  - ${log.userName}: ${log.errorMessage} (${new Date(log.timestamp).toLocaleString()})`);
    });
    resultados.auditoria.logs.push({
      tipo: 'logins_falhados',
      quantidade: loginsFalhados.length,
      detalhes: loginsFalhados.slice(0, 10)
    });
  }
  
  // Verificar acessos de Super Admin
  const acessosSuperAdmin = logs.filter(log => 
    (log.action === 'LOGIN' || log.action === 'ADMIN_LOGIN') && 
    log.userName && (
      log.userName.includes('SUPER') || 
      log.userName.includes('ADMIN') ||
      log.userName.toUpperCase() === 'RICARDO'
    )
  );
  console.log(`👑 Acessos de Super Admin: ${acessosSuperAdmin.length}`);
  
  if (acessosSuperAdmin.length > 0) {
    console.log('🔐 ÚLTIMOS ACESSOS DE SUPER ADMIN:');
    acessosSuperAdmin.slice(0, 5).forEach(log => {
      console.log(`  - ${log.userName}: ${new Date(log.timestamp).toLocaleString()}`);
    });
    resultados.auditoria.acessos.push({
      tipo: 'super_admin_acessos',
      quantidade: acessosSuperAdmin.length,
      detalhes: acessosSuperAdmin.slice(0, 10)
    });
  }
  
  // Verificar alterações críticas
  const alteracoesCriticas = logs.filter(log => 
    ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'SCHEDULE_IMPORT'].includes(log.action)
  );
  console.log(`⚙️ Alterações críticas: ${alteracoesCriticas.length}`);
  
  if (alteracoesCriticas.length > 0) {
    console.log('🔧 ÚLTIMAS ALTERAÇÕES CRÍTICAS:');
    alteracoesCriticas.slice(0, 5).forEach(log => {
      console.log(`  - ${log.action}: ${log.details} (${new Date(log.timestamp).toLocaleString()})`);
    });
    resultados.auditoria.dados.push({
      tipo: 'alteracoes_criticas',
      quantidade: alteracoesCriticas.length,
      detalhes: alteracoesCriticas.slice(0, 10)
    });
  }
  
  // 2. Verificar Usuários
  console.log('\n👥 2. VERIFICANDO USUÁRIOS...');
  const usuarios = JSON.parse(localStorage.getItem('escala_users') || '[]');
  console.log(`📊 Total de usuários: ${usuarios.length}`);
  
  // Verificar usuários com senhas padrão
  const usuariosSenhasPadrao = usuarios.filter(user => user.password === '1234');
  console.log(`⚠️ Usuários com senha padrão: ${usuariosSenhasPadrao.length}`);
  
  if (usuariosSenhasPadrao.length > 0) {
    console.log('🔓 USUÁRIOS COM SENHA PADRÃO:');
    usuariosSenhasPadrao.forEach(user => {
      console.log(`  - ${user.name} (${user.role})`);
    });
    resultados.auditoria.vulnerabilidades.push({
      tipo: 'senhas_padrao',
      quantidade: usuariosSenhasPadrao.length,
      usuarios: usuariosSenhasPadrao.map(u => ({ nome: u.name, role: u.role }))
    });
  }
  
  // Verificar usuários inativos
  const usuariosInativos = usuarios.filter(user => user.status === 'inativo');
  console.log(`🚫 Usuários inativos: ${usuariosInativos.length}`);
  
  // Verificar Super Admins
  const superAdmins = usuarios.filter(user => user.role === 'super_admin');
  console.log(`👑 Super Admins: ${superAdmins.length}`);
  
  if (superAdmins.length > 0) {
    console.log('🔐 CONTAS DE SUPER ADMIN:');
    superAdmins.forEach(user => {
      console.log(`  - ${user.name} (${user.status})`);
    });
  }
  
  resultados.auditoria.usuarios.push({
    total: usuarios.length,
    senhas_padrao: usuariosSenhasPadrao.length,
    inativos: usuariosInativos.length,
    super_admins: superAdmins.length
  });
  
  // 3. Verificar Dados do Sistema
  console.log('\n💾 3. VERIFICANDO DADOS DO SISTEMA...');
  
  // Verificar escalas
  const escalasAtuais = JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]');
  const escalasArquivadas = JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]');
  const dadosEscala = JSON.parse(localStorage.getItem('escala_scheduleData') || '[]');
  
  console.log(`📅 Escalas atuais: ${escalasAtuais.length}`);
  console.log(`📁 Escalas arquivadas: ${escalasArquivadas.length}`);
  console.log(`📊 Dias na escala atual: ${dadosEscala.length}`);
  
  // Verificar solicitações de troca
  const solicitacoesTroca = JSON.parse(localStorage.getItem('escala_swapRequests') || '[]');
  console.log(`🔄 Solicitações de troca: ${solicitacoesTroca.length}`);
  
  // Verificar status das solicitações
  const statusCounts = solicitacoesTroca.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Status das solicitações:', statusCounts);
  
  resultados.auditoria.dados.push({
    escalas_atuais: escalasAtuais.length,
    escalas_arquivadas: escalasArquivadas.length,
    dias_escala: dadosEscala.length,
    solicitacoes_troca: solicitacoesTroca.length,
    status_solicitacoes: statusCounts
  });
  
  // 4. Verificar Vulnerabilidades
  console.log('\n🚨 4. VERIFICANDO VULNERABILIDADES...');
  
  // Verificar se há dados em localStorage que não deveriam
  const chavesLocalStorage = Object.keys(localStorage);
  const chavesSuspeitas = chavesLocalStorage.filter(chave => 
    chave.includes('password') || 
    chave.includes('token') || 
    chave.includes('secret') ||
    chave.includes('key')
  );
  
  if (chavesSuspeitas.length > 0) {
    console.log('⚠️ CHAVES SUSPEITAS ENCONTRADAS:');
    chavesSuspeitas.forEach(chave => {
      console.log(`  - ${chave}`);
    });
    resultados.auditoria.vulnerabilidades.push({
      tipo: 'chaves_suspeitas',
      chaves: chavesSuspeitas
    });
  }
  
  // 5. Verificar integridade dos dados
  console.log('\n🔍 5. VERIFICANDO INTEGRIDADE DOS DADOS...');
  
  // Verificar se há escalas corrompidas
  let escalasCorrompidas = 0;
  escalasAtuais.forEach(escala => {
    if (!escala.entries || !Array.isArray(escala.entries)) {
      escalasCorrompidas++;
    }
  });
  
  if (escalasCorrompidas > 0) {
    console.log(`🚨 Escalas corrompidas: ${escalasCorrompidas}`);
    resultados.auditoria.vulnerabilidades.push({
      tipo: 'escalas_corrompidas',
      quantidade: escalasCorrompidas
    });
  }
  
  // 6. Gerar Relatório
  console.log('\n📋 6. RELATÓRIO DE SEGURANÇA');
  console.log('='.repeat(60));
  
  const nivelSeguranca = resultados.auditoria.vulnerabilidades.length === 0 ? '✅ ALTO' : 
                         resultados.auditoria.vulnerabilidades.length <= 2 ? '⚠️ MÉDIO' : '🚨 BAIXO';
  
  console.log(`🛡️ Nível de Segurança: ${nivelSeguranca}`);
  console.log(`📊 Logs analisados: ${logs.length}`);
  console.log(`👥 Usuários verificados: ${usuarios.length}`);
  console.log(`🚨 Vulnerabilidades: ${resultados.auditoria.vulnerabilidades.length}`);
  
  // Salvar relatório
  const relatorio = {
    ...resultados,
    nivel_seguranca: nivelSeguranca,
    recomendacoes: gerarRecomendacoes(resultados.auditoria)
  };
  
  localStorage.setItem('auditoria_seguranca_' + Date.now(), JSON.stringify(relatorio));
  
  // Download do relatório
  const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria_seguranca_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('\n✅ AUDITORIA CONCLUÍDA!');
  console.log('📁 Relatório salvo e baixado automaticamente');
  
  return relatorio;
}

function gerarRecomendacoes(auditoria) {
  const recomendacoes = [];
  
  if (auditoria.logs.some(l => l.tipo === 'logins_falhados' && l.quantidade > 10)) {
    recomendacoes.push('🔒 Considere implementar bloqueio temporário após múltiplas tentativas falhadas');
  }
  
  if (auditoria.usuarios.senhas_padrao > 0) {
    recomendacoes.push('🔐 Exija que usuários alterem senhas padrão no primeiro login');
  }
  
  if (auditoria.vulnerabilidades.some(v => v.tipo === 'chaves_suspeitas')) {
    recomendacoes.push('🔍 Revise chaves suspeitas no localStorage');
  }
  
  if (auditoria.acessos.some(a => a.tipo === 'super_admin_acessos' && a.quantidade > 50)) {
    recomendacoes.push('👑 Monitore acessos de Super Admin com frequência');
  }
  
  if (recomendacoes.length === 0) {
    recomendacoes.push('✅ Sistema seguro - continue monitorando regularmente');
  }
  
  return recomendacoes;
}

// Verificar logs específicos
function verificarLogsEspecificos() {
  console.log('🔍 VERIFICANDO LOGS ESPECÍFICOS...');
  
  const auditLogs = JSON.parse(localStorage.getItem('escala_auditLogs') || '{"logs": []}');
  const logs = auditLogs.logs || [];
  
  // Últimas 24 horas
  const ultimas24h = logs.filter(log => {
    const logTime = new Date(log.timestamp);
    const agora = new Date();
    return (agora - logTime) < (24 * 60 * 60 * 1000);
  });
  
  console.log(`📊 Logs das últimas 24h: ${ultimas24h.length}`);
  
  // Agrupar por tipo
  const logsPorTipo = ultimas24h.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📋 Logs por tipo (últimas 24h):', logsPorTipo);
  
  return ultimas24h;
}

// Exportar funções
window.realizarAuditoriaSeguranca = realizarAuditoriaSeguranca;
window.verificarLogsEspecificos = verificarLogsEspecificos;

console.log('🔍 FUNÇÕES DE SEGURANÇA DISPONÍVEIS:');
console.log('- realizarAuditoriaSeguranca() - Auditoria completa do sistema');
console.log('- verificarLogsEspecificos() - Verificar logs recentes');
console.log('');
console.log('🎯 Para auditoria completa, digite: realizarAuditoriaSeguranca()');
