// VERIFICAR CARREGAMENTO DOS SCRIPTS
// Debug para identificar por que DirectAuthManager não está disponível

(function verificarCarregamentoScripts() {
  console.log('🔍 VERIFICANDO CARREGAMENTO DOS SCRIPTS');
  console.log('=====================================');
  
  // 1. Verificar scripts carregados
  console.log('');
  console.log('📜 1. SCRIPTS CARREGADOS:');
  
  const scripts = document.querySelectorAll('script');
  console.log(`   📊 Total de scripts: ${scripts.length}`);
  
  const authScripts = [];
  scripts.forEach((script, index) => {
    if (script.src) {
      if (script.src.includes('login-direto') || script.src.includes('integrar-login')) {
        authScripts.push(script.src);
        console.log(`   ✅ ${index + 1}. ${script.src}`);
      }
    }
  });
  
  if (authScripts.length === 0) {
    console.log('   ❌ Nenhum script de autenticação encontrado');
  }
  
  // 2. Verificar se há erros nos scripts
  console.log('');
  console.log('❌ 2. VERIFICANDO ERROS:');
  
  // Verificar se há erros no console
  console.log('   📋 Verificando se há erros de carregamento...');
  
  // 3. Verificar se os objetos globais existem
  console.log('');
  console.log('🔧 3. OBJETOS GLOBAIS:');
  
  console.log(`   📊 window.DirectAuthManager: ${typeof window.DirectAuthManager}`);
  console.log(`   📊 window.SystemAuthIntegration: ${typeof window.SystemAuthIntegration}`);
  console.log(`   📊 window.DirectAuthManager?.isLoggedIn: ${typeof window.DirectAuthManager?.isLoggedIn}`);
  
  // 4. Tentar carregar manualmente
  console.log('');
  console.log('🔄 4. TENTANDO CARREGAR MANUALMENTE:');
  
  if (!window.DirectAuthManager) {
    console.log('   📝 DirectAuthManager não encontrado, tentando carregar...');
    
    // Verificar se o script existe
    const loginDiretoScript = Array.from(scripts).find(s => s.src && s.src.includes('login-direto.js'));
    
    if (loginDiretoScript) {
      console.log('   ✅ Script login-direto.js encontrado, mas não executou');
      console.log('   📋 Possíveis causas:');
      console.log('      - Erro de sintaxe no script');
      console.log('      - Script bloqueado por CSP');
      console.log('      - Script carregou após a execução do debug');
    } else {
      console.log('   ❌ Script login-direto.js não encontrado');
    }
  }
  
  // 5. Verificar timing
  console.log('');
  console.log('⏰ 5. VERIFICANDO TIMING:');
  
  console.log('   📋 Aguardando 2 segundos e verificando novamente...');
  
  setTimeout(() => {
    console.log('');
    console.log('🔄 VERIFICAÇÃO APÓS 2 SEGUNDOS:');
    console.log(`   📊 window.DirectAuthManager: ${typeof window.DirectAuthManager}`);
    console.log(`   📊 window.SystemAuthIntegration: ${typeof window.SystemAuthIntegration}`);
    
    if (window.DirectAuthManager) {
      console.log('   ✅ Agora está disponível!');
      console.log('   📋 Execute: debugLoginProblem() novamente');
    } else {
      console.log('   ❌ Ainda não disponível');
      console.log('   📋 Execute: carregarScriptsManualmente()');
    }
  }, 2000);
  
  // 6. Função para carregar manualmente
  window.carregarScriptsManualmente = function() {
    console.log('🔄 CARREGANDO SCRIPTS MANUALMENTE...');
    console.log('================================');
    
    // Carregar login-direto.js
    const script1 = document.createElement('script');
    script1.src = '/login-direto.js';
    script1.onload = () => console.log('✅ login-direto.js carregado');
    script1.onerror = () => console.log('❌ Erro ao carregar login-direto.js');
    document.head.appendChild(script1);
    
    // Carregar integrar-login-sistema.js
    const script2 = document.createElement('script');
    script2.src = '/integrar-login-sistema.js';
    script2.onload = () => console.log('✅ integrar-login-sistema.js carregado');
    script2.onerror = () => console.log('❌ Erro ao carregar integrar-login-sistema.js');
    document.head.appendChild(script2);
    
    // Verificar após carregar
    setTimeout(() => {
      console.log('');
      console.log('🔍 VERIFICAÇÃO APÓS CARREGAMENTO MANUAL:');
      console.log(`   📊 window.DirectAuthManager: ${typeof window.DirectAuthManager}`);
      console.log(`   📊 window.SystemAuthIntegration: ${typeof window.SystemAuthIntegration}`);
      
      if (window.DirectAuthManager && window.SystemAuthIntegration) {
        console.log('   ✅ Scripts carregados com sucesso!');
        console.log('   📋 Execute: debugLoginProblem()');
      } else {
        console.log('   ❌ Scripts ainda não disponíveis');
      }
    }, 3000);
  };
  
  console.log('');
  console.log('🎯 7. RECOMENDAÇÕES:');
  console.log('   📋 1. Aguarde 2 segundos e execute debugLoginProblem() novamente');
  console.log('   📋 2. Se não funcionar, execute carregarScriptsManualmente()');
  console.log('   📋 3. Recarregue a página com Ctrl+Shift+R');
  console.log('   📋 4. Verifique o console por erros de carregamento');
  
})();

// Debug simplificado que não depende de DirectAuthManager
function debugSimplificado() {
  console.log('🔍 DEBUG SIMPLIFICADO (SEM DEPENDÊNCIAS)');
  console.log('==========================================');
  
  // Verificar localStorage
  console.log('');
  console.log('📱 localStorage:');
  const authKeys = ['directAuth_currentUser', 'reactCurrentUser', 'escala_currentUser', 'currentUser'];
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`   ✅ ${key}: ${parsed.name || 'sem nome'} (${parsed.role || 'sem role'})`);
      } catch {
        console.log(`   ❌ ${key}: ${value.length} chars (inválido)`);
      }
    } else {
      console.log(`   ❌ ${key}: vazio`);
    }
  });
  
  // Verificar elementos da UI
  console.log('');
  console.log('📱 ELEMENTOS DA UI:');
  
  const loginScreen = document.getElementById('auth-login-screen');
  console.log(`   📊 Tela de login: ${loginScreen ? (loginScreen.style.display === 'none' ? 'escondida' : 'visível') : 'não encontrada'}`);
  
  const userHeader = document.getElementById('auth-user-header');
  console.log(`   📊 Header usuário: ${userHeader ? (userHeader.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);
  
  const reactRoot = document.getElementById('root');
  if (reactRoot) {
    console.log(`   📊 React root: ${reactRoot.innerHTML.length > 0 ? 'com conteúdo' : 'vazio'}`);
    
    if (reactRoot.innerHTML.includes('Dashboard')) {
      console.log('   ✅ React está mostrando Dashboard');
    } else if (reactRoot.innerHTML.includes('LoginScreen')) {
      console.log('   ⚠️ React está mostrando LoginScreen');
    } else {
      console.log('   🔍 React conteúdo desconhecido');
    }
  }
  
  console.log('');
  console.log('🎯 ANÁLISE:');
  
  const hasUserInStorage = authKeys.some(key => localStorage.getItem(key));
  const hasLoginScreenVisible = loginScreen && loginScreen.style.display !== 'none';
  const hasUserHeaderVisible = userHeader && userHeader.style.display !== 'none';
  const hasDashboardVisible = reactRoot && reactRoot.innerHTML.includes('Dashboard');
  
  if (hasUserInStorage && !hasLoginScreenVisible && (hasUserHeaderVisible || hasDashboardVisible)) {
    console.log('   ✅ Sistema parece estar funcionando corretamente');
  } else if (hasUserInStorage && hasLoginScreenVisible) {
    console.log('   ⚠️ Usuário no localStorage mas tela de login ainda visível');
    console.log('   📋 Problema: sincronização entre sistemas');
  } else if (!hasUserInStorage && !hasLoginScreenVisible) {
    console.log('   ❌ Nenhum usuário e tela de login não visível');
    console.log('   📋 Problema: sistema não inicializado corretamente');
  } else {
    console.log('   🔍 Estado desconhecido,需要 mais análise');
  }
}

// Exportar funções
window.verificarCarregamentoScripts = verificarCarregamentoScripts;
window.debugSimplificado = debugSimplificado;

console.log('🔧 FERRAMENTAS DE VERIFICAÇÃO CARREGADAS!');
console.log('📋 Para usar: verificarCarregamentoScripts()');
console.log('📋 Para debug simples: debugSimplificado()');

// Executar verificação automática
setTimeout(() => {
  verificarCarregamentoScripts();
}, 500);
