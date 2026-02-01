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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    loginScreen.innerHTML = `
      <div style="background: white; padding: 3rem; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); max-width: 400px; width: 90%;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="margin: 0; color: #333; font-size: 2rem; font-weight: 600;">🔐 Sistema de Escalas</h1>
          <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 1rem;">Acesso ao Sistema de Gerenciamento de Escalas</p>
        </div>
        
        <form id="auth-login-form" style="margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Nome de Usuário</label>
            <input type="text" id="auth-username" required style="width: 100%; padding: 0.75rem; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Senha</label>
            <input type="password" id="auth-password" required style="width: 100%; padding: 0.75rem; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;">
          </div>
          
          <button type="submit" style="width: 100%; padding: 0.75rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background-color 0.3s;">
            Entrar no Sistema
          </button>
        </form>
        
        <div id="auth-login-message" style="padding: 0.75rem; border-radius: 8px; text-align: center; font-size: 0.9rem; display: none;"></div>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; font-size: 0.85rem; color: #64748b;">
          <p style="margin: 0 0 0.5rem 0; font-weight: 500;">📋 Credenciais de Exemplo:</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div><strong>ADMIN</strong></div>
            <div>admin123</div>
            <div><strong>LUCAS</strong></div>
            <div>lucas123</div>
            <div><strong>CARLOS</strong></div>
            <div>carlos123</div>
            <div><strong>RICARDO</strong></div>
            <div>ricardo123</div>
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
    
    // Adicionar efeito de foco nos inputs
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#4f46e5';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = '#e1e5e9';
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
    // Criar header de usuário
    const userHeader = document.createElement('div');
    userHeader.id = 'auth-user-header';
    userHeader.style.cssText = `
      background: #f8fafc;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    `;
    
    userHeader.innerHTML = `
      <div>
        <span style="color: #64748b;">Bem-vindo,</span>
        <span style="color: #1e293b; font-weight: 600; margin-left: 0.5rem;">${user.name}</span>
        <span style="color: #64748b; margin-left: 0.5rem;">(${user.role})</span>
      </div>
      <div id="auth-logout-btn" style="background: #ef4444; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
        Sair
      </div>
    `;
    
    // Inserir no topo da página
    const firstElement = document.body.firstElementChild;
    document.body.insertBefore(userHeader, firstElement);
    
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
    
    // Criar botão flutuante
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'auth-logout-float';
    logoutBtn.innerHTML = '🚪 Sair';
    logoutBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
