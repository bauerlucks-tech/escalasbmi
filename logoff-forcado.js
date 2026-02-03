// LOGOFF FORÇADO - EXECUTAR IMEDIATAMENTO
// Script para forçar logout funcionar

(function forcarLogoutAgora() {
  console.log('🔧 FORÇANDO LOGOFF IMEDIATO...');
  console.log('===============================');
  
  // 1. Limpar tudo imediatamente
  console.log('🧹 Limpando todos os dados...');
  
  // Limpar localStorage
  const keysToRemove = [
    'directAuth_currentUser',
    'reactCurrentUser', 
    'escala_currentUser',
    'currentUser',
    'escala_scheduleStorage',
    'escala_scheduleData',
    'escala_currentSchedules',
    'escala_archivedSchedules'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   ✅ Removido: ${key}`);
  });
  
  // Limpar sessionStorage
  sessionStorage.clear();
  console.log('   ✅ SessionStorage limpo');
  
  // 2. Disparar evento para React
  console.log('🔄 Disparando evento para React...');
  try {
    const event = new CustomEvent('externalLogout', {
      detail: { timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
    console.log('   ✅ Evento externalLogout disparado');
  } catch (error) {
    console.error('   ❌ Erro ao disparar evento:', error);
  }
  
  // 3. Limpar estado do DirectAuthManager
  console.log('🔧 Limpando estado do DirectAuthManager...');
  if (window.DirectAuthManager) {
    window.DirectAuthManager.currentUser = null;
    console.log('   ✅ DirectAuthManager limpo');
  }
  
  // 4. Limpar estado do SystemAuthIntegration
  console.log('🔧 Limpando estado do SystemAuthIntegration...');
  if (window.SystemAuthIntegration) {
    window.SystemAuthIntegration.currentUser = null;
    console.log('   ✅ SystemAuthIntegration limpo');
  }
  
  // 5. Esconder header de usuário se existir
  console.log('📱 Escondendo header de usuário...');
  const userHeader = document.getElementById('auth-user-header');
  if (userHeader) {
    userHeader.style.display = 'none';
    console.log('   ✅ Header escondido');
  }
  
  // 6. Mostrar tela de login se existir
  console.log('📱 Mostrando tela de login...');
  const loginScreen = document.getElementById('auth-login-screen');
  if (loginScreen) {
    loginScreen.style.display = 'flex';
    console.log('   ✅ Tela de login mostrada');
  }
  
  // 7. Esconder conteúdo principal
  console.log('🔄 Escondendo conteúdo principal...');
  const root = document.getElementById('root');
  if (root) {
    root.style.display = 'none';
    console.log('   ✅ React root escondido');
  }
  
  // 8. Forçar reload completo
  console.log('🔄 Forçando reload completo...');
  console.log('   ⏳ Recarregando em 2 segundos...');
  
  setTimeout(() => {
    console.log('🔄 RECAREGANDO...');
    window.location.reload(true);
  }, 2000);
  
  console.log('✅ LOGOFF FORÇADO CONCLUÍDO!');
  
})();

// Sobrescrever todos os métodos de logout
function sobrescreverLogout() {
  console.log('🔧 SOBRESCREVENDO MÉTODOS DE LOGOUT...');
  
  // Sobrescrever DirectAuthManager.logout
  if (window.DirectAuthManager) {
    window.DirectAuthManager.logout = function() {
      console.log('🚪 LOGOUT SOBRESCRITO - DirectAuthManager');
      forcarLogoutAgora();
      return { success: true };
    };
    console.log('   ✅ DirectAuthManager.logout sobrescrito');
  }
  
  // Sobrescrever SystemAuthIntegration.logout
  if (window.SystemAuthIntegration) {
    window.SystemAuthIntegration.logout = function() {
      console.log('🚪 LOGOUT SOBRESCRITO - SystemAuthIntegration');
      forcarLogoutAgora();
      return { success: true };
    };
    console.log('   ✅ SystemAuthIntegration.logout sobrescrito');
  }
  
  // Adicionar evento a todos os botões de logout
  console.log('🔧 Adicionando eventos a todos os botões...');
  const logoutButtons = document.querySelectorAll('button[id*="logout"], button[id*="sair"], button:contains("Sair")');
  
  logoutButtons.forEach((btn, index) => {
    // Remover eventos existentes
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Adicionar novo evento
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚪 Botão de logout clicado (sobrescrito)');
      forcarLogoutAgora();
    });
    
    console.log(`   ✅ Botão ${index + 1} sobrescrito`);
  });
  
  // Adicionar botão de logout forçado
  if (!document.getElementById('forced-logout-btn')) {
    const forcedBtn = document.createElement('button');
    forcedBtn.id = 'forced-logout-btn';
    forcedBtn.textContent = 'SAIR FORÇADO';
    forcedBtn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #dc3545;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    forcedBtn.addEventListener('click', () => {
      console.log('🚪 Botão SAIR FORÇADO clicado');
      forcarLogoutAgora();
    });
    
    document.body.appendChild(forcedBtn);
    console.log('   ✅ Botão SAIR FORÇADO adicionado');
  }
  
  console.log('✅ SOBRESCRITÇÃO DE LOGOUT CONCLUÍDA!');
}

// Exportar funções
window.forcarLogoutAgora = forcarLogoutAgora;
window.sobrescreverLogout = sobrescreverLogout;

console.log('🔧 FERRAMENTAS DE LOGOFF FORÇADO CARREGADAS!');
console.log('📋 Para usar: forcarLogoutAgora()');
console.log('📋 Para sobrescrever: sobrescreverLogout()');

// Executar sobrescrição imediata
setTimeout(() => {
  sobrescreverLogout();
}, 500);
