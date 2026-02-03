// INTEGRAÇÃO AUTOMÁTICA DE LOGIN AO SISTEMA
// Verifica autenticação ao carregar a página

class SystemAuthIntegration {
  constructor() {
    this.authManager = new DirectAuthManager();
    this.isInitialized = false;
  }

  // Inicializar sistema
  async initialize() {
    console.log('🔧 Inicializando integração de autenticação...');
    
    // Carregar biblioteca Supabase se necessário
    if (typeof window.DirectAuthManager === 'undefined') {
      await this.loadAuthManager();
    }
    
    this.authManager = new DirectAuthManager();
    this.isInitialized = true;
    
    // Verificar autenticação
    await this.checkAuthentication();
    
    console.log('✅ Integração inicializada');
  }

  // Carregar gerenciador de autenticação
  async loadAuthManager() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'data:text/javascript;base64,' + btoa(`
        class DirectAuthManager {
          constructor() {
            this.supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
            this.supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
            this.currentUser = null;
          }

          async login(username, password) {
            try {
              const response = await fetch(this.supabaseUrl + '/rest/v1/users?select=*&name=eq.' + username + '&password=eq.' + password + '&status=eq.ativo', {
                headers: {
                  'apikey': this.supabaseServiceKey,
                  'Authorization': 'Bearer ' + this.supabaseServiceKey,
                  'Content-Type': 'application/json'
                }
              });
              
              const users = await response.json();
              if (!users || users.length === 0) {
                return { success: false, error: 'Usuário ou senha inválidos' };
              }
              
              const user = users[0];
              this.currentUser = user;
              localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
              
              return { success: true, user: user };
            } catch (error) {
              return { success: false, error: error.message };
            }
          }

          isLoggedIn() {
            if (!this.currentUser) {
              const storedUser = localStorage.getItem('directAuth_currentUser');
              if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
              }
            }
            return this.currentUser !== null;
          }

          getCurrentUser() {
            if (!this.currentUser) {
              const storedUser = localStorage.getItem('directAuth_currentUser');
              if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
              }
            }
            return this.currentUser;
          }

          async logout() {
            this.currentUser = null;
            localStorage.removeItem('directAuth_currentUser');
            localStorage.removeItem('reactCurrentUser');
            localStorage.removeItem('escala_currentUser');
            localStorage.removeItem('currentUser');
            
            // Limpar cache de escalas para forçar recarregamento
            localStorage.removeItem('escala_scheduleStorage');
            localStorage.removeItem('escala_scheduleData');
            localStorage.removeItem('escala_currentSchedules');
            localStorage.removeItem('escala_archivedSchedules');
            
            console.log('🧹 Cache de escalas limpo');
            
            // Disparar evento para React
            try {
              const event = new CustomEvent('externalLogout', {
                detail: { timestamp: new Date().toISOString() }
              });
              window.dispatchEvent(event);
              console.log('🔄 Evento externalLogout disparado para React');
            } catch (error) {
              console.error('❌ Erro ao disparar evento logout:', error);
            }
            
            // Forçar reload completo para limpar qualquer cache restante
            console.log('🔄 Forçando reload completo...');
            window.location.reload();
            
            return { success: true };
          }
        }
        
        window.DirectAuthManager = DirectAuthManager;
      `);
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Verificar autenticação
  async checkAuthentication() {
    console.log('🔍 Verificando autenticação...');
    
    if (this.authManager.isLoggedIn()) {
      const user = this.authManager.getCurrentUser();
      console.log('✅ Usuário já logado:', user.name);
      console.log('📋 Role:', user.role);
      
      // Usuário está logado - mostrar sistema
      this.showSystemInterface(user);
    } else {
      console.log('❌ Usuário não está logado');
      
      // Usuário não está logado - mostrar tela de login
      this.showLoginScreen();
    }
  }

  // Mostrar tela de login
  showLoginScreen() {
    console.log('🖥️ Mostrando tela de login...');
    
    // Esconder conteúdo principal
    this.hideMainContent();
    
    // Criar tela de login
    this.createLoginScreen();
  }

  // Mostrar interface do sistema
  showSystemInterface(user) {
    console.log('📱 Mostrando interface do sistema para:', user.name);
    
    // Remover tela de login se existir
    const loginScreen = document.getElementById('auth-login-screen');
    if (loginScreen) {
      loginScreen.remove();
    }
    
    // Sincronizar com AuthContext do React
    this.syncWithReactUser(user);
    
    // Mostrar conteúdo principal
    this.showMainContent();
    
    // NÃO adicionar header ou barra - apenas mostrar sistema
  }

  // Sincronizar usuário com AuthContext do React
  syncWithReactUser(user) {
    try {
      // Disparar evento customizado para React ouvir
      const event = new CustomEvent('externalLogin', {
        detail: {
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            status: user.status,
            email: user.email || `${user.name.toLowerCase()}@escalasbmi.com`
          }
        }
      });
      
      window.dispatchEvent(event);
      console.log('🔄 Evento externalLogin disparado para React');
      
      // Também salvar no localStorage que React possa ler
      const reactUser = {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
        email: user.email || `${user.name.toLowerCase()}@escalasbmi.com`,
        password: user.password // Para compatibilidade
      };
      
      localStorage.setItem('reactCurrentUser', JSON.stringify(reactUser));
      console.log('💾 Usuário salvo no localStorage para React');
      
    } catch (error) {
      console.error('❌ Erro ao sincronizar com React:', error);
    }
  }

  // Criar tela de login
  createLoginScreen() {
    // Remover tela de login anterior se existir
    const existingScreen = document.getElementById('auth-login-screen');
    if (existingScreen) {
      existingScreen.remove();
    }
    
    // Criar tela de login
    const loginScreen = document.createElement('div');
    loginScreen.id = 'auth-login-screen';
    loginScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #f8f9fa;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    loginScreen.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
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
              <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.75rem; font-weight: 600;">v1.3.100433</span>
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
                  id="auth-username"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  required
                  style="width: 100%; padding-left: 3rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 1rem; background: rgba(255, 255, 255, 0.04); border: 2px solid rgba(255, 255, 255, 0.15); border-radius: 0.75rem; color: #fff; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;"
                />
              </div>
            </div>

            <div style="margin-bottom: 2rem;">
              <label for="auth-password" style="display: block; margin-bottom: 0.75rem; color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; font-weight: 500;">
                Senha
              </label>
              <div style="position: relative;">
                <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; color: rgba(255, 255, 255, 0.55); font-size: 1.1rem;">🔒</span>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="Digite sua senha"
                  required
                  style="width: 100%; padding-left: 3rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 1rem; background: rgba(255, 255, 255, 0.04); border: 2px solid rgba(255, 255, 255, 0.15); border-radius: 0.75rem; color: #fff; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;"
                />
              </div>
            </div>

            <div id="auth-login-message" style="display: none; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: 0.75rem; font-size: 0.95rem; margin-bottom: 2rem;">
              <span style="width: 1.25rem; height: 1.25rem; font-size: 1.1rem;">⚠️</span>
              <span id="auth-login-message-text"></span>
            </div>

            <button 
              type="submit" 
              style="width: 100%; padding: 1.25rem; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.35); outline: none; letter-spacing: 0.025em;"
            >
              Acessar Sistema
            </button>
          </form>

          <!-- User hints -->
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <p style="margin: 0; color: rgba(255, 255, 255, 0.55); font-size: 0.875rem; text-align: center; line-height: 1.4;">
              Credenciais de teste: <span style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; color: #60a5fa; background: rgba(96, 165, 250, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">ADMIN / admin123</span>
            </p>
          </div>

          <!-- Footer info -->
          <div style="margin-top: 1.5rem; space-y: 0.75rem;">
            <div style="text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.55); font-size: 0.875rem;">
                Criado por: <span style="color: #60a5fa; font-weight: 600;">Lucas Pott</span>
              </p>
            </div>
            <div style="text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.55); font-size: 0.875rem;">
                Versão: <span style="color: #60a5fa; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;">1.3.100433</span> <span style="color: rgba(255, 255, 255, 0.35);">(c872c5f)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(loginScreen);
    
    // Adicionar event listeners
    this.setupLoginEventListeners();
  }

  // Configurar event listeners do login
  setupLoginEventListeners() {
    const form = document.getElementById('auth-login-form');
    const messageDiv = document.getElementById('auth-login-message');
    const messageText = document.getElementById('auth-login-message-text');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      
      if (!username || !password) {
        messageText.textContent = 'Preencha todos os campos';
        messageDiv.style.display = 'flex';
        messageDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        messageDiv.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        messageDiv.style.color = '#ef4444';
        return;
      }
      
      // Mostrar loading
      messageText.textContent = 'Autenticando...';
      messageDiv.style.display = 'flex';
      messageDiv.style.background = 'rgba(59, 130, 246, 0.1)';
      messageDiv.style.border = '1px solid rgba(59, 130, 246, 0.2)';
      messageDiv.style.color = '#3b82f6';
      
      const result = await this.authManager.login(username, password);
      
      if (result.success) {
        messageText.textContent = 'Login realizado! Redirecionando...';
        messageDiv.style.background = 'rgba(34, 197, 94, 0.1)';
        messageDiv.style.border = '1px solid rgba(34, 197, 94, 0.2)';
        messageDiv.style.color = '#22c55e';
        
        setTimeout(() => {
          // Forçar reload completo para garantir que React recarregue com usuário correto
          console.log('🔄 Forçando reload completo...');
          window.location.reload();
        }, 1000);
      } else {
        messageText.textContent = result.error;
        messageDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        messageDiv.style.border = '1px solid rgba(239, 68, 68, 0.2)';
        messageDiv.style.color = '#ef4444';
      }
    });
    
    // Adicionar efeitos de hover e focus nos inputs (desktop优先)
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = 'rgba(59, 130, 246, 0.6)';
        input.style.background = 'rgba(255, 255, 255, 0.08)';
        input.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        input.style.transform = 'translateY(-1px)';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        input.style.background = 'rgba(255, 255, 255, 0.04)';
        input.style.boxShadow = 'none';
        input.style.transform = 'translateY(0)';
      });
    });
    
    // Adicionar efeito no botão (desktop优先)
    const button = form.querySelector('button');
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px) scale(1.02)';
      button.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      button.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.35)';
      button.style.background = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
    });
    
    // Adicionar efeito de clique no botão
    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(0) scale(0.98)';
      button.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    });
    
    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-2px) scale(1.02)';
      button.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    });
  }

  // Esconder conteúdo principal
  hideMainContent() {
    console.log('🔄 Escondendo conteúdo principal...');
    
    // Tentar múltiplos seletores para encontrar o conteúdo
    const selectors = [
      '#root',
      'main',
      '[id*="root"]',
      '[class*="app"]',
      'body > div:first-child',
      'body > *:not(script):not(style):not(link):not(meta)'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.id !== 'auth-login-screen') {
        console.log('📦 Escondendo elemento:', selector, element.tagName);
        element.style.display = 'none';
        break;
      }
    }
  }

  // Mostrar conteúdo principal
  showMainContent() {
    console.log('📱 Mostrando conteúdo principal...');
    
    // Tentar múltiplos seletores para encontrar o conteúdo
    const selectors = [
      '#root',
      'main',
      '[id*="root"]',
      '[class*="app"]',
      'body > div:first-child',
      'body > *:not(script):not(style):not(link):not(meta)'
    ];
    
    let found = false;
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.id !== 'auth-login-screen') {
        console.log('📦 Mostrando elemento:', selector, element.tagName);
        element.style.display = '';
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('⚠️ Nenhum conteúdo principal encontrado, tentando mostrar body');
      document.body.style.display = '';
    }
  }

  // Adicionar informações do usuário
  addUserInfo(user) {
    // Criar header de usuário discreto
    const userHeader = document.getElementById('auth-user-header');
    if (userHeader) {
      userHeader.remove();
    }
    
    const newUserHeader = document.createElement('div');
    newUserHeader.id = 'auth-user-header';
    newUserHeader.style.cssText = `
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    `;
    
    newUserHeader.innerHTML = `
      <div>
        <span style="color: #6c757d;">Bem-vindo,</span>
        <span style="color: #212529; font-weight: 500; margin-left: 0.5rem;">${user.name}</span>
        <span style="color: #6c757d; margin-left: 0.5rem;">(${user.role})</span>
        <span style="color: #28a745; font-weight: 600; margin-left: 0.5rem;">ATIVO</span>
        <span style="color: #6c757d; margin-left: 0.5rem;">|</span>
        <span style="color: #6c757d; margin-left: 0.5rem;">v1.3.100433</span>
      </div>
      <button id="auth-logout-btn" style="background: #dc3545; color: white; padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
        Sair
      </button>
    `;
    
    // Inserir no topo da página
    const firstElement = document.body.firstElementChild;
    document.body.insertBefore(newUserHeader, firstElement);
    
    // Adicionar evento de logout
    const logoutBtn = document.getElementById('auth-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        console.log('🚪 BOTÃO DE LOGOUT CLICADO!');
        this.logout();
      });
    }
  }
  
  addLogoutButton() {
    // Verificar se já tem header
    if (document.getElementById('auth-user-header')) {
      return;
    }
    
    // Criar botão flutuante discreto
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'auth-logout-float';
    logoutBtn.innerHTML = 'Sair';
    logoutBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      z-index: 1000;
    `;
    
    document.body.appendChild(logoutBtn);
    
    logoutBtn.addEventListener('click', async () => {
      await this.authManager.logout();
      // Remover botão e deixar reload fazer o trabalho
      logoutBtn.remove();
    });
  }
}

// Inicializar sistema
(async () => {
  console.log('🚀 Página carregada - Iniciando sistema de autenticação...');
  const authIntegration = new SystemAuthIntegration();
  await authIntegration.initialize();
})();

// Exportar para uso manual se necessário
window.SystemAuthIntegration = SystemAuthIntegration;

console.log('🔐 SISTEMA DE AUTENTICAÇÃO INTEGRADO!');
console.log('🔄 Verificação automática ao carregar a página');
console.log('🖥️ Login automático se não estiver logado');
console.log('📱 Interface adaptativa conforme status do usuário');
