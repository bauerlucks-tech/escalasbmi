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
            this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            this.currentUser = null;
          }

          async login(username, password) {
            try {
              // Usar Supabase Auth em vez de consulta direta à tabela
              const response = await fetch(this.supabaseUrl + '/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                  'apikey': this.supabaseAnonKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: username.toLowerCase() + '@bmi.local',
                  password: password
                })
              });
              
              if (!response.ok) {
                return { success: false, error: 'Usuário ou senha inválidos' };
              }
              
              const data = await response.json();
              
              // Buscar dados completos do usuário
              const userResponse = await fetch(this.supabaseUrl + '/rest/v1/users?select=*&name=eq.' + encodeURIComponent(username) + '&status=eq.ativo', {
                headers: {
                  'apikey': this.supabaseAnonKey,
                  'Authorization': 'Bearer ' + data.access_token,
                  'Content-Type': 'application/json'
                }
              });
              
              if (!userResponse.ok) {
                return { success: false, error: 'Erro ao buscar dados do usuário' };
              }
              
              const users = await userResponse.json();
              if (!users || users.length === 0) {
                return { success: false, error: 'Usuário não encontrado ou inativo' };
              }
              
              const user = users[0];
              this.currentUser = user;
              
              // Armazenar apenas token de acesso, não senha
              localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
              localStorage.setItem('directAuth_token', data.access_token);
              
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
            localStorage.removeItem('directAuth_token');
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
    
    // Mostrar conteúdo principal
    this.showMainContent();
    
    // Adicionar informações do usuário
    this.addUserInfo(user);
    
    // Adicionar botão de logout
    this.addLogoutButton();
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
      <div style="background: white; padding: 2rem; border: 1px solid #dee2e6; border-radius: 8px; max-width: 400px; width: 90%;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <h1 style="margin: 0; color: #212529; font-size: 1.5rem; font-weight: 500;">Sistema de Escalas</h1>
          <p style="margin: 0.5rem 0 0 0; color: #6c757d; font-size: 0.9rem;">Acesso ao Sistema</p>
        </div>
        
        <form id="auth-login-form" style="margin-bottom: 1rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #495057; font-weight: 400;">Nome de Usuário</label>
            <input type="text" id="auth-username" required style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.9rem;">
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #495057; font-weight: 400;">Senha</label>
            <input type="password" id="auth-password" required style="width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px; font-size: 0.9rem;">
          </div>
          
          <button type="submit" style="width: 100%; padding: 0.5rem; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 0.9rem; cursor: pointer;">
            Entrar
          </button>
        </form>
        
        <div id="auth-login-message" style="padding: 0.5rem; border-radius: 4px; text-align: center; font-size: 0.85rem; display: none;"></div>
        
        <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 4px; font-size: 0.8rem; color: #6c757d; border: 1px solid #e9ecef;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 500;">Credenciais:</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem;">
            <div><strong>ADMIN</strong></div>
            <div>admin123</div>
            <div><strong>LUCAS</strong></div>
            <div>lucas123</div>
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
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      
      if (!username || !password) {
        messageDiv.style.cssText = 'background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 8px; text-align: center; font-size: 0.9rem;';
        messageDiv.textContent = '❌ Preencha todos os campos';
        messageDiv.style.display = 'block';
        return;
      }
      
      // Mostrar loading
      messageDiv.style.cssText = 'background: #dbeafe; color: #1e40af; padding: 0.75rem; border-radius: 8px; text-align: center; font-size: 0.9rem;';
      messageDiv.textContent = '🔄 Autenticando...';
      messageDiv.style.display = 'block';
      
      const result = await this.authManager.login(username, password);
      
      if (result.success) {
        messageDiv.style.cssText = 'background: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 8px; text-align: center; font-size: 0.9rem;';
        messageDiv.textContent = '✅ Login realizado! Redirecionando...';
        
        setTimeout(() => {
          this.showSystemInterface(result.user);
        }, 1000);
      } else {
        messageDiv.style.cssText = 'background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 8px; text-align: center; font-size: 0.9rem;';
        messageDiv.textContent = '❌ ' + result.error;
      }
    });
    
    // Remover efeitos de foco customizados para manter design simples
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#80bdff';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = '#ced4da';
      });
    });
  }

  // Esconder conteúdo principal
  hideMainContent() {
    const mainContent = document.querySelector('main') || document.body.querySelector('#root') || document.body;
    if (mainContent) {
      mainContent.style.display = 'none';
    }
  }

  // Mostrar conteúdo principal
  showMainContent() {
    const mainContent = document.querySelector('main') || document.body.querySelector('#root') || document.body;
    if (mainContent) {
      mainContent.style.display = '';
    }
  }

  // Adicionar informações do usuário
  addUserInfo(user) {
    // Criar header de usuário discreto
    const userHeader = document.createElement('div');
    userHeader.id = 'auth-user-header';
    userHeader.style.cssText = `
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    `;
    
    userHeader.innerHTML = `
      <div>
        <span style="color: #6c757d;">Bem-vindo,</span>
        <span id="user-name-display" style="color: #212529; font-weight: 500; margin-left: 0.5rem;"></span>
        <span style="color: #6c757d; margin-left: 0.5rem;">(${user.role})</span>
      </div>
      <button id="auth-logout-btn" style="background: #dc3545; color: white; padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
        Sair
      </button>
    `;
    
    // Inserir no topo da página PRIMEIRO
    const firstElement = document.body.firstElementChild;
    document.body.insertBefore(userHeader, firstElement);
    
    // Set user name safely using textContent (DEPOIS de inserir no DOM)
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay) {
      userNameDisplay.textContent = user.name;
    }
    
    // Adicionar evento de logout
    document.getElementById('auth-logout-btn').addEventListener('click', async () => {
      await this.authManager.logout();
      this.showLoginScreen();
    });
  }

  // Adicionar botão de logout flutuante (se não tiver header)
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
      this.showLoginScreen();
      logoutBtn.remove();
    });
  }
}

// Inicializar automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Página carregada - Iniciando sistema de autenticação...');
  
  const authIntegration = new SystemAuthIntegration();
  await authIntegration.initialize();
});

// Exportar para uso manual se necessário
window.SystemAuthIntegration = SystemAuthIntegration;

console.log('🔐 SISTEMA DE AUTENTICAÇÃO INTEGRADO!');
console.log('🔄 Verificação automática ao carregar a página');
console.log('🖥️ Login automático se não estiver logado');
console.log('📱 Interface adaptativa conforme status do usuário');
