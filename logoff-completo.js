// CORREÇÃO COMPLETA DO LOGOUT
// Garante que tela de login apareça após logout

(function corrigirLogoutCompleto() {
  console.log('🔧 CORRIGINDO LOGOUT COMPLETO...');
  console.log('================================');
  
  // 1. Sobrescrever todos os métodos de logout existentes
  if (window.DirectAuthManager) {
    const originalLogout = window.DirectAuthManager.logout;
    
    window.DirectAuthManager.logout = async function() {
      console.log('🚪 LOGOUT COMPLETO INICIADO...');
      
      try {
        // Limpar todos os dados
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
        
        // Limpar estado interno
        this.currentUser = null;
        
        // Disparar evento para React
        try {
          const event = new CustomEvent('externalLogout', {
            detail: { timestamp: new Date().toISOString() }
          });
          window.dispatchEvent(event);
          console.log('   ✅ Evento externalLogout disparado');
        } catch (error) {
          console.error('   ❌ Erro ao disparar evento:', error);
        }
        
        // Limpar estado do SystemAuthIntegration
        if (window.SystemAuthIntegration) {
          window.SystemAuthIntegration.currentUser = null;
          console.log('   ✅ SystemAuthIntegration limpo');
        }
        
        // Esconder header de usuário
        const userHeader = document.getElementById('auth-user-header');
        if (userHeader) {
          userHeader.style.display = 'none';
          console.log('   ✅ Header escondido');
        }
        
        // Esconder conteúdo principal
        const root = document.getElementById('root');
        if (root) {
          root.style.display = 'none';
          console.log('   ✅ React root escondido');
        }
        
        // Mostrar tela de login
        const loginScreen = document.getElementById('auth-login-screen');
        if (loginScreen) {
          loginScreen.style.display = 'flex';
          console.log('   ✅ Tela de login mostrada');
        } else {
          console.log('   ❌ Tela de login não encontrada, criando...');
          criarTelaLogin();
        }
        
        console.log('✅ LOGOFF COMPLETO CONCLUÍDO!');
        
        // Forçar reload completo
        console.log('🔄 Forçando reload completo...');
        setTimeout(() => {
          window.location.reload(true);
        }, 1000);
        
        return { success: true };
        
      } catch (error) {
        console.error('❌ Erro no logout:', error);
        return { success: false, error: error.message };
      }
    };
    
    console.log('✅ DirectAuthManager.logout sobrescrito');
  }
  
  // Sobrescrever SystemAuthIntegration
  if (window.SystemAuthIntegration) {
    window.SystemAuthIntegration.logout = function() {
      console.log('🚪 LOGOUT COMPLETO - SystemAuthIntegration');
      
      // Usar o mesmo método do DirectAuthManager
      if (window.DirectAuthManager && typeof window.DirectAuthManager.logout === 'function') {
        return window.DirectAuthManager.logout();
      }
      
      // Implementação local
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
      
      sessionStorage.clear();
      this.currentUser = null;
      
      // Disparar evento para React
      try {
        const event = new CustomEvent('externalLogout', {
          detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('   ❌ Erro ao disparar evento:', error);
      }
      
      // Esconder header
      const userHeader = document.getElementById('auth-user-header');
      if (userHeader) {
        userHeader.style.display = 'none';
      }
      
      // Esconder conteúdo principal
      const root = document.getElementById('root');
      if (root) {
        root.style.display = 'none';
      }
      
      // Mostrar tela de login
      const loginScreen = document.getElementById('auth-login-screen');
      if (loginScreen) {
        loginScreen.style.display = 'flex';
      } else {
        criarTelaLogin();
      }
      
      console.log('✅ LOGOFF CONCLUÍDO!');
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
      
      return { success: true };
    };
    
    console.log('✅ SystemAuthIntegration.logout sobrescrito');
  }
  
  // Função para criar tela de login se não existir
  function criarTelaLogin() {
    console.log('🔧 CRIANDO TELA DE LOGIN...');
    
    // Remover tela antiga se existir
    const existingScreen = document.getElementById('auth-login-screen');
    if (existingScreen) {
      existingScreen.remove();
    }
    
    // Criar nova tela de login
    const loginScreen = document.createElement('div');
    loginScreen.id = 'auth-login-screen';
    loginScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(20px);
    `;
    
    loginScreen.innerHTML = `
      <div style="width: 100%; max-width: 480px; padding: 3rem; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 5rem; height: 5rem; border-radius: 1.25rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); margin-bottom: 1.5rem; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.25);">
            <span style="font-size: 3rem;">🚁</span>
          </div>
          <h1 style="margin: 0; color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 0.75rem; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.025em;">Operações Aéreas Offshore</h1>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.65); font-size: 1rem; line-height: 1.5;">
            Sistema de Gestão de Escalas - Área Branca SBMI
          </p>
          <div style="margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: rgba(255, 255, 255, 0.1); border-radius: 0.375rem; border: 1px solid rgba(255, 255, 255, 0.2);">
            <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.75rem; font-weight: 600;">v2.1.0 - 03/02/2026</span>
          </div>
        </div>

        <!-- Login Form -->
        <form id="auth-login-form" style="margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1.75rem;">
            <label for="auth-username" style="display: block; margin-bottom: 0.75rem; color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; font-weight: 500;">
              Nome do Operador
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; color: rgba(255, 255, 255, 0.55); font-size: 1.1rem;">👤</span>
              <input
                type="text"
                id="auth-username"
                placeholder="Digite seu nome"
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.75rem; color: #fff; font-size: 1rem; transition: all 0.3s ease; outline: none; placeholder: rgba(255, 255, 255, 0.5);"
                required
              />
            </div>
          </div>
          
          <div style="margin-bottom: 1.75rem;">
            <label for="auth-password" style="display: block; margin-bottom: 0.75rem; color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; font-weight: 500;">
              Senha de Acesso
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; color: rgba(255, 255, 255, 0.55); font-size: 1.1rem;">🔒</span>
              <input
                type="password"
                id="auth-password"
                placeholder="Digite sua senha"
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.75rem; color: #fff; font-size: 1rem; transition: all 0.3s ease; outline: none; placeholder: rgba(255, 255, 255, 0.5);"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            style="width: 100%; padding: 0.875rem 1rem; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #fff; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; outline: none; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);"
          >
            Entrar no Sistema
          </button>
        </form>
        
        <!-- Footer -->
        <div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 0.8rem;">
          <p>© 2026 Área Branca SBMI - Todos os direitos reservados</p>
        </div>
      </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(loginScreen);
    
    // Adicionar evento de submit
    const form = loginScreen.querySelector('#auth-login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('auth-username').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        
        if (username && password) {
          console.log(' Tentando login com:', username);
          
          // Usar o DirectAuthManager para fazer login
          if (window.DirectAuthManager && typeof window.DirectAuthManager.login === 'function') {
            const result = await window.DirectAuthManager.login(username, password);
            
            if (result.success) {
              console.log('✅ Login bem-sucedido!');
              // Esconder tela de login e mostrar conteúdo principal
              loginScreen.style.display = 'none';
              const root = document.getElementById('root');
              if (root) {
                root.style.display = '';
              }
            } else {
              console.log('❌ Falha no login:', result.error);
            }
          }
        }
      });
    }
    
    console.log('✅ Tela de login criada com sucesso');
  }
  
  // Adicionar evento a todos os botões de logout
  const logoutButtons = document.querySelectorAll('button svg.lucide-log-out');
  logoutButtons.forEach(btn => {
    if (!btn.hasAttribute('data-logout-fixed')) {
      const button = btn.closest('button');
      if (button) {
        // Remover eventos existentes
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);
        
        // Adicionar novo evento
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🚪 Botão de logout clicado (corrigido)');
          forcarLogoutCompleto();
        });
        
        // Marcar como corrigido
        newBtn.setAttribute('data-logout-fixed', 'true');
        newBtn.style.border = '2px solid #dc3545';
        newBtn.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.3)';
        
        console.log('   ✅ Botão de logout corrigido');
      }
    }
  });
  
  console.log('✅ CORREÇÃO COMPLETA APLICADA!');
}

// Exportar função
window.forcarLogoutCompleto = forcarLogoutCompleto;

console.log('🔧 FERRAMENTA DE LOGOFF COMPLETO CARREGADA!');
console.log('📋 Para usar: forcarLogoutCompleto()');

// Executar correção automática
setTimeout(() => {
  corrigirLogoutCompleto();
}, 1000);
