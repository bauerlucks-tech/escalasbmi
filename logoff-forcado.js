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
  
  // Procurar por botões com diferentes seletores
  const selectors = [
    'button[id*="logout"]',
    'button[id*="sair"]',
    'button:contains("Sair")',
    'button:contains("Logout")',
    'button:contains("sair")',
    'button:contains("logout")',
    'button[class*="logout"]',
    'button[class*="sair"]',
    // Botão com ícone de logout (lucide-log-out)
    'button svg.lucide-log-out',
    // Botão com classes Tailwind que podem ser de logout
    'button[class*="text-destructive"]',
    'button[class*="hover:text-destructive"]',
    // Botão com hover:destructive (muito provável ser o botão de logout)
    'button[class*="hover:bg-destructive"]'
  ];
  
  let foundButtons = [];
  
  selectors.forEach(selector => {
    try {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        if (!foundButtons.includes(btn)) {
          foundButtons.push(btn);
        }
      });
    } catch (error) {
      // Ignorar erros de seletores inválidos
    }
  });
  
  // Procurar especificamente por botões com SVG de logout
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(btn => {
    const svg = btn.querySelector('svg.lucide-log-out');
    if (svg && !foundButtons.includes(btn)) {
      foundButtons.push(btn);
    }
  });
  
  console.log(`   📊 Botões de logout encontrados: ${foundButtons.length}`);
  
  foundButtons.forEach((btn, index) => {
    // Verificar se o botão realmente é de logout
    const hasLogoutIcon = btn.querySelector('svg.lucide-log-out');
    const hasLogoutClass = btn.className.includes('logout') || btn.className.includes('sair');
    const hasLogoutText = btn.textContent.toLowerCase().includes('sair') || btn.textContent.toLowerCase().includes('logout');
    const hasDestructiveClass = btn.className.includes('destructive');
    
    const isLogoutButton = hasLogoutIcon || hasLogoutClass || hasLogoutText || hasDestructiveClass;
    
    if (isLogoutButton) {
      console.log(`   ✅ Botão ${index + 1}: ${btn.className.substring(0, 50)}...`);
      
      // Remover eventos existentes
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Adicionar novo evento
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 Botão de logout clicado (sobrescrito)');
        console.log(`   📋 Botão: ${newBtn.className}`);
        forcarLogoutAgora();
      });
      
      // Adicionar estilo visual para indicar que está funcionando
      newBtn.style.border = '2px solid #dc3545';
      newBtn.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.3)';
      
      console.log(`   ✅ Botão ${index + 1} sobrescrito e estilizado`);
    } else {
      console.log(`   ❌ Botão ${index + 1}: não é de logout`);
    }
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
  
  // Buscar contínua por novos botões de logout
  setInterval(() => {
    const newLogoutButtons = document.querySelectorAll('button svg.lucide-log-out');
    newLogoutButtons.forEach(btn => {
      if (!btn.hasAttribute('data-logout-fixed')) {
        console.log('🔍 Novo botão de logout encontrado, aplicando correção...');
        
        // Remover eventos existentes
        const newBtn = btn.closest('button').cloneNode(true);
        btn.closest('button').parentNode.replaceChild(newBtn, btn.closest('button'));
        
        // Adicionar evento
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🚪 Novo botão de logout clicado');
          forcarLogoutAgora();
        });
        
        // Marcar como corrigido
        newBtn.setAttribute('data-logout-fixed', 'true');
        newBtn.style.border = '2px solid #dc3545';
        newBtn.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.3)';
        
        console.log('✅ Novo botão corrigido');
      }
    });
  }, 2000);
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
