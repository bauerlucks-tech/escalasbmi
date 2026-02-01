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
      background: #f8f9fa;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    loginScreen.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4 bg-background">
        <div class="glass-card-elevated w-full max-w-md p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              🚁
            </div>
            <h1 class="text-2xl font-bold text-gradient mb-2">Operações Aéreas Offshore</h1>
            <p class="text-muted-foreground text-sm">
              Sistema de Gestão de Escalas - Área Branca SBMI
            </p>
          </div>

          <!-- Login Form -->
          <form id="auth-login-form" class="space-y-5">
            <div class="space-y-2">
              <label for="auth-username" class="text-sm text-muted-foreground">
                Nome do Operador
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">👤</span>
                <input
                  id="auth-username"
                  type="text"
                  placeholder="Seu nome"
                  required
                  class="w-full pl-10 bg-muted/50 border-border/50 focus:border-primary transition-colors p-3 border rounded-md"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="auth-password" class="text-sm text-muted-foreground">
                Senha
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">🔒</span>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••"
                  required
                  class="w-full pl-10 bg-muted/50 border-border/50 focus:border-primary transition-colors p-3 border rounded-md"
                />
              </div>
            </div>

            <div id="auth-login-message" class="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg" style="display: none;">
              <span class="w-4 h-4">⚠️</span>
              <span id="auth-login-message-text"></span>
            </div>

            <button 
              type="submit" 
              class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 glow-primary transition-all p-3 border rounded-md"
            >
              Acessar Sistema
            </button>
          </form>

          <!-- User hints -->
          <div class="mt-6 pt-6 border-t border-border/50">
            <p class="text-xs text-muted-foreground text-center">
              Credenciais: <span class="font-mono text-primary">ADMIN/admin123</span>
            </p>
          </div>

          <!-- Footer info -->
          <div class="mt-4 space-y-2">
            <div class="text-center">
              <p class="text-xs text-muted-foreground">
                Criado por: <span class="text-primary font-medium">Lucas Pott</span>
              </p>
            </div>
            <div class="text-center">
              <p class="text-xs text-muted-foreground">
                Versão: <span class="text-primary font-mono">1.3.100433</span> <span class="text-muted-foreground">(27f2ff7)</span>
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
        return;
      }
      
      // Mostrar loading
      messageText.textContent = 'Autenticando...';
      messageDiv.className = 'flex items-center gap-2 text-primary text-sm bg-primary/10 p-3 rounded-lg';
      messageDiv.style.display = 'flex';
      
      const result = await this.authManager.login(username, password);
      
      if (result.success) {
        messageText.textContent = 'Login realizado! Redirecionando...';
        messageDiv.className = 'flex items-center gap-2 text-primary text-sm bg-primary/10 p-3 rounded-lg';
        
        setTimeout(() => {
          this.showSystemInterface(result.user);
        }, 1000);
      } else {
        messageText.textContent = result.error;
        messageDiv.className = 'flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg';
      }
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
        <span style="color: #212529; font-weight: 500; margin-left: 0.5rem;">${user.name}</span>
        <span style="color: #6c757d; margin-left: 0.5rem;">(${user.role})</span>
      </div>
      <button id="auth-logout-btn" style="background: #dc3545; color: white; padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
        Sair
      </button>
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
