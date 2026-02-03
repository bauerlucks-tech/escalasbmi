// DEBUG DO PROBLEMA DE LOGIN
// Verificar por que login só funciona após refresh

(function debugLoginProblem() {
  console.log('🔍 DEBUG DO PROBLEMA DE LOGIN');
  console.log('=================================');
  
  // 1. Verificar estado atual do sistema
  console.log('');
  console.log('📊 1. ESTADO ATUAL DO SISTEMA:');
  
  // Verificar se há usuário no localStorage
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
  
  // 2. Verificar se o sistema de autenticação está ativo
  console.log('');
  console.log('🔧 2. SISTEMA DE AUTENTICAÇÃO:');
  
  if (window.DirectAuthManager) {
    console.log('   ✅ DirectAuthManager disponível');
    console.log(`   📊 Usuário atual: ${window.DirectAuthManager.currentUser?.name || 'null'}`);
    console.log(`   🔐 Logado: ${window.DirectAuthManager.isLoggedIn()}`);
  } else {
    console.log('   ❌ DirectAuthManager não encontrado');
  }
  
  if (window.SystemAuthIntegration) {
    console.log('   ✅ SystemAuthIntegration disponível');
    console.log(`   📊 Usuário atual: ${window.SystemAuthIntegration.currentUser?.name || 'null'}`);
  } else {
    console.log('   ❌ SystemAuthIntegration não encontrado');
  }
  
  // 3. Verificar se há conflito com React
  console.log('');
  console.log('⚛️ 3. VERIFICANDO CONFLITO COM REACT:');
  
  const reactRoot = document.getElementById('root');
  if (reactRoot) {
    console.log('   ✅ React root encontrado');
    console.log(`   📊 Conteúdo: ${reactRoot.innerHTML.length > 0 ? 'com conteúdo' : 'vazio'}`);
    
    // Verificar se React está tentando mostrar LoginScreen
    if (reactRoot.innerHTML.includes('LoginScreen') || reactRoot.innerHTML.includes('login-screen')) {
      console.log('   ⚠️ React está tentando mostrar LoginScreen');
    }
  } else {
    console.log('   ❌ React root não encontrado');
  }
  
  // 4. Verificar se há múltiplos sistemas de login
  console.log('');
  console.log('🔄 4. VERIFICANDO MÚLTIPLOS SISTEMAS:');
  
  const loginScreens = document.querySelectorAll('[id*="login"], [class*="login"]');
  console.log(`   📊 Telas de login encontradas: ${loginScreens.length}`);
  
  loginScreens.forEach((screen, index) => {
    console.log(`   ${index + 1}. ID: ${screen.id || 'sem-id'}, Tag: ${screen.tagName}`);
  });
  
  // 5. Verificar se há interferência de scripts
  console.log('');
  console.log('📜 5. VERIFICANDO SCRIPTS CARREGADOS:');
  
  const scripts = document.querySelectorAll('script');
  console.log(`   📊 Scripts encontrados: ${scripts.length}`);
  
  scripts.forEach((script, index) => {
    if (script.src) {
      console.log(`   ${index + 1}. ${script.src}`);
    } else if (script.textContent) {
      const preview = script.textContent.substring(0, 50);
      console.log(`   ${index + 1}. Script inline (${preview}...)`);
    }
  });
  
  // 6. Testar login manual
  console.log('');
  console.log('🧪 6. TESTE MANUAL DE LOGIN:');
  console.log('   📋 Para testar manualmente:');
  console.log('      1. execute: testarLoginManual()');
  console.log('      2. execute: verificarEstadoAposLogin()');
  
  // 7. Verificar se há eventos bloqueando
  console.log('');
  console.log('🚫 7. VERIFICANDO EVENTOS BLOQUEADORES:');
  
  const eventListeners = [];
  
  // Verificar se há preventDefault ou stopPropagation
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  
  console.log('   📋 Verificando se há listeners que podem bloquear...');
  
  // 8. Verificar sincronização
  console.log('');
  console.log('🔄 8. VERIFICANDO SINCRONIZAÇÃO:');
  
  if (window.SystemAuthIntegration) {
    console.log('   ✅ Sistema de sincronização disponível');
  } else {
    console.log('   ❌ Sistema de sincronização não encontrado');
  }
  
  console.log('');
  console.log('🎯 9. RECOMENDAÇÕES:');
  console.log('   📋 1. Execute testarLoginManual() para testar login');
  console.log('   📋 2. Execute limparCacheCompleto() para limpar tudo');
  console.log('   📋 3. Recarregue a página com Ctrl+Shift+R');
  console.log('   📋 4. Verifique os logs para identificar o problema');
  
}

// Testar login manual
async function testarLoginManual() {
  console.log('🧪 TESTANDO LOGIN MANUAL...');
  console.log('============================');
  
  if (!window.DirectAuthManager) {
    console.log('❌ DirectAuthManager não encontrado');
    return;
  }
  
  try {
    console.log('📝 Tentando login com ADMIN/admin123...');
    const result = await window.DirectAuthManager.login('ADMIN', 'admin123');
    
    console.log('📊 Resultado:', result.success ? '✅ Sucesso' : '❌ Falha');
    console.log('📋 Usuário:', result.user?.name || 'null');
    console.log('📋 Token:', result.token ? 'presente' : 'ausente');
    
    if (result.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('🔄 Verificando estado após login...');
      verificarEstadoAposLogin();
    } else {
      console.log('❌ Falha no login:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste manual:', error);
  }
}

// Verificar estado após login
function verificarEstadoAposLogin() {
  console.log('🔍 VERIFICANDO ESTADO APÓS LOGIN...');
  console.log('================================');
  
  // Verificar localStorage
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
  
  // Verificar se o sistema reconhece
  if (window.DirectAuthManager) {
    console.log('🔧 DirectAuthManager:');
    console.log(`   📊 Usuário: ${window.DirectAuthManager.currentUser?.name || 'null'}`);
    console.log(`   🔐 Logado: ${window.DirectAuthManager.isLoggedIn()}`);
  }
  
  if (window.SystemAuthIntegration) {
    console.log('🔧 SystemAuthIntegration:');
    console.log(`   📊 Usuário: ${window.SystemAuthIntegration.currentUser?.name || 'null'}`);
  }
  
  // Verificar se a UI foi atualizada
  const loginScreen = document.getElementById('auth-login-screen');
  if (loginScreen) {
    console.log('📱 Tela de login:', loginScreen.style.display === 'none' ? 'escondida' : 'visível');
  } else {
    console.log('📱 Tela de login: não encontrada');
  }
  
  const userHeader = document.getElementById('auth-user-header');
  if (userHeader) {
    console.log('📱 Header usuário:', userHeader.style.display === 'none' ? 'escondido' : 'visível');
  } else {
    console.log('📱 Header usuário: não encontrado');
  }
  
  // Verificar se React foi atualizado
  const reactRoot = document.getElementById('root');
  if (reactRoot) {
    console.log('📱 React root:', reactRoot.innerHTML.length > 0 ? 'com conteúdo' : 'vazio');
    
    if (reactRoot.innerHTML.includes('Dashboard')) {
      console.log('✅ React está mostrando Dashboard');
    } else if (reactRoot.innerHTML.includes('LoginScreen')) {
      console.log('⚠️ React está mostrando LoginScreen');
    } else {
      console.log('🔍 React conteúdo desconhecido');
    }
  }
}

// Forçar verificação completa
function forcarVerificacaoCompleta() {
  console.log('🔄 FORÇANDO VERIFICAÇÃO COMPLETA...');
  console.log('=================================');
  
  debugLoginProblem();
  
  // Verificar novamente após 2 segundos
  setTimeout(() => {
    console.log('');
    console.log('🔄 VERIFICAÇÃO APÓS 2 SEGUNDOS:');
    verificarEstadoAposLogin();
  }, 2000);
}

// Exportar funções
window.debugLoginProblem = debugLoginProblem;
window.testarLoginManual = testarLoginManual;
window.verificarEstadoAposLogin = verificarEstadoAposLogin;
window.forcarVerificacaoCompleta = forcarVerificacaoCompleta;

console.log('🔧 FERRAMENTAS DE DEBUG DO LOGIN CARREGADAS!');
console.log('📋 Para usar: debugLoginProblem()');
  console.log('📋 Para testar: testarLoginManual()');
  console.log('📋 Para verificar: verificarEstadoAposLogin()');
  console.log('📋 Para completo: forcarVerificacaoCompleta()');

// Executar verificação automaticamente
setTimeout(() => {
  debugLoginProblem();
}, 1000);
