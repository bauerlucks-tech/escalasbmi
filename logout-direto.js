// LOGOUT DIRETO - SOLUÇÃO IMEDIATA
// Script simples e direto para logout funcionar

(function logoutDireto() {
  console.log('🚪 INICIANDO LOGOUT DIRETO...');
  
  // 1. Criar função de logout
  window.logoutAgora = function() {
    console.log('🚪 EXECUTANDO LOGOUT...');
    
    try {
      // Limpar todos os dados de autenticação
      localStorage.removeItem('directAuth_currentUser');
      localStorage.removeItem('reactCurrentUser');
      localStorage.removeItem('escala_currentUser');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('escala_scheduleStorage');
      localStorage.removeItem('escala_scheduleData');
      localStorage.removeItem('escala_currentSchedules');
      localStorage.removeItem('escala_archivedSchedules');
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Limpar estado dos sistemas
      if (window.DirectAuthManager) {
        window.DirectAuthManager.currentUser = null;
      }
      
      if (window.SystemAuthIntegration) {
        window.SystemAuthIntegration.currentUser = null;
      }
      
      // Esconder header de usuário
      const userHeader = document.getElementById('auth-user-header');
      if (userHeader) {
        userHeader.style.display = 'none';
      }
      
      // Esconder React root
      const root = document.getElementById('root');
      if (root) {
        root.style.display = 'none';
      }
      
      // Criar tela de login simples
      const loginScreen = document.createElement('div');
      loginScreen.id = 'auth-login-screen';
      loginScreen.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 999999 !important;
        backdrop-filter: blur(20px) !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      loginScreen.innerHTML = `
        <div style="width: 100%; max-width: 480px; padding: 3rem; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
          <div style="text-align: center; margin-bottom: 3rem;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 5rem; height: 5rem; border-radius: 1.25rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); margin-bottom: 1.5rem; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.25);">
              <span style="font-size: 3rem;">🚁</span>
            </div>
            <h1 style="margin: 0; color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 0.75rem; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.025em;">Operações Aéreas Offshore</h1>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.65); font-size: 1rem; line-height: 1.5;">
              Sistema de Gestão de Escalas - Área Branca SBMI
            </p>
            <div style="margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.1); border-radius: 0.375rem; border: 1px solid rgba(255, 255, 255, 0.2);">
              <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.75rem; font-weight: 600;">v1.3.100433</span>
            </div>
          </div>
          <div style="text-align: center; color: rgba(255, 255, 255, 0.8); font-size: 1.1rem;">
            <p>Logout realizado com sucesso!</p>
            <p style="margin-top: 1rem;">Recarregando a página...</p>
          </div>
        </div>
      `;
      
      // Adicionar ao body
      document.body.appendChild(loginScreen);
      
      console.log('✅ Logout concluído!');
      
      // Forçar reload após 2 segundos
      setTimeout(() => {
        window.location.reload(true);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };
  
  // 2. Capturar botão de logout
  console.log('🔍 CAPTURANDO BOTÃO DE LOGOUT...');
  
  const logoutButtons = document.querySelectorAll('button svg.lucide-log-out');
  console.log(`📊 Botões encontrados: ${logoutButtons.length}`);
  
  logoutButtons.forEach((btn, index) => {
    const button = btn.closest('button');
    if (button && !button.hasAttribute('data-logout-direto')) {
      // Remover eventos existentes
      const newBtn = button.cloneNode(true);
      button.parentNode.replaceChild(newBtn, button);
      
      // Adicionar evento de logout
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 Botão de logout clicado!');
        logoutAgora();
      });
      
      // Marcar como corrigido
      newBtn.setAttribute('data-logout-direto', 'true');
      newBtn.style.border = '3px solid #dc3545';
      newBtn.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.5)';
      
      console.log(`✅ Botão ${index + 1} corrigido`);
    }
  });
  
  console.log('✅ LOGOUT DIRETO CONFIGURADO!');
  console.log('📋 Para usar: logoutAgora()');
}

// Executar imediatamente
logoutDireto();

console.log('🔧 LOGOUT DIRETO CARREGADO!');
