// INTEGRAÇÃO AUTOMÁTICA DE LOGIN AO SISTEMA
// Verifica autenticação ao carregar a página

class SystemAuthIntegration {
  constructor() {
    this.authManager = null; // Não criar instância aqui
    this.isInitialized = false;
    this.authChecked = false; // Nova flag para controlar piscamento
    this.loginEventDispatched = false; // Prevenir múltiplos eventos
    this.currentVersion = this.generateVersion(); // Versão dinâmica
  }

  // Gerar versão no formato 2.0.DDHH (dia + hora + minutos)
  generateVersion() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // Formato: 2.0.DDHH (ex: 2.0.0515 para dia 5, hora 15)
    return `2.0.${day}${hours}${minutes}`;
  }

  // Obter commit hash atual (fallback)
  getCommitHash() {
    try {
      // Tentar obter do sistema de build
      if (typeof window !== 'undefined' && window.__COMMIT_HASH__) {
        return window.__COMMIT_HASH__;
      }
      
      // Fallback para deploy atual
      return '9e7a7fe'; // Commit atual
    } catch (error) {
      return 'unknown';
    }
  }

  // Inicializar sistema
  async initialize() {
    console.log('🔧 Inicializando integração de autenticação...');
    
    // Ocultar conteúdo inicialmente para evitar piscamento
    this.hideMainContentInitially();
    
    try {
      console.log('🔍 Verificando DirectAuthManager...');
      console.log('🔍 window.DirectAuthManager:', typeof window.DirectAuthManager);
      
      // Carregar biblioteca Supabase se necessário
      if (typeof window.DirectAuthManager === 'undefined') {
        console.log('🔍 Carregando DirectAuthManager...');
        await this.loadAuthManager();
        console.log('✅ DirectAuthManager carregado');
      } else {
        console.log('✅ DirectAuthManager já existe');
      }
      
      console.log('🔍 Criando instância do authManager...');
      this.authManager = new DirectAuthManager();
      console.log('✅ authManager criado:', this.authManager);
      
      this.isInitialized = true;
      console.log('✅ Sistema inicializado');
      
      // Verificar autenticação
      console.log('🔍 Iniciando verificação de autenticação...');
      await this.checkAuthentication();
      
      // Marcar que autenticação foi verificada
      this.authChecked = true;
      
      console.log('✅ Integração inicializada com sucesso');
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      console.error('❌ Stack:', error.stack);
      // Em caso de erro, mostrar tela de login
      await this.showLoginScreen();
      this.authChecked = true;
    }
  }

  // Ocultar conteúdo inicialmente para evitar piscamento
  hideMainContentInitially() {
    console.log('🔄 Ocultando conteúdo inicialmente...');
    const rootElement = document.querySelector('#root');
    if (rootElement) {
      rootElement.style.visibility = 'hidden';
      rootElement.style.opacity = '0';
      rootElement.style.transition = 'none';
    }
  }

  // Mostrar conteúdo com transição suave
  showMainContentSmooth() {
    console.log('📱 Mostrando conteúdo principal com transição suave...');
    const rootElement = document.querySelector('#root');
    if (rootElement) {
      // REMOVER todos os estilos de esconder
      rootElement.style.display = '';
      rootElement.style.visibility = 'visible';
      rootElement.style.opacity = '1';
      rootElement.style.position = '';
      rootElement.style.top = '';
      rootElement.style.left = '';
      rootElement.style.width = '';
      rootElement.style.height = '';
      rootElement.style.zIndex = '';
      
      // Forçar reflow e aplicar transição
      rootElement.style.transition = 'opacity 0.3s ease-in-out';
      rootElement.style.opacity = '1';
      
      console.log('✅ Elemento #root mostrado com transição suave');
      console.log('🔍 Estilos atuais:', {
        display: rootElement.style.display,
        visibility: rootElement.style.visibility,
        opacity: rootElement.style.opacity,
        position: rootElement.style.position
      });
    } else {
      console.warn('❌ Elemento #root não encontrado');
    }
  }

  // Carregar gerenciador de autenticação
  async loadAuthManager() {
    return new Promise((resolve, reject) => {
      // Definir DirectAuthManager diretamente no window
      window.DirectAuthManager = class DirectAuthManager {
        constructor() {
          this.supabaseUrl = window.ENV?.SUPABASE_URL || 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
          this.supabaseServiceKey = window.ENV?.SUPABASE_ANON_KEY || '';
          if (!this.supabaseServiceKey) {
            console.warn('⚠️ SUPABASE_ANON_KEY not configured. Authentication will fail.');
          }
          this.currentUser = null;
        }

        async login(username, password) {
          try {
            console.log('🔑 Tentando login com Supabase Auth...');
            
            // Método 1: Autenticação nativa do Supabase
            try {
              const response = await fetch(this.supabaseUrl + '/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                  'apikey': this.supabaseServiceKey,
                  'Authorization': 'Bearer ' + this.supabaseServiceKey,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: username + '@escalasbmi.com',
                  password: password
                })
              });
              
              const data = await response.json();
              
              if (response.ok && data.session) {
                console.log('✅ Autenticação nativa funcionou, buscando dados do usuário...');
                
                // Buscar dados completos do usuário
                const userResponse = await fetch(this.supabaseUrl + '/rest/v1/users?select=*&name=eq.' + username + '&status=eq.ativo', {
                  method: 'GET',
                  headers: {
                    'apikey': this.supabaseServiceKey,
                    'Authorization': 'Bearer ' + this.supabaseServiceKey,
                    'Content-Type': 'application/json'
                  }
                });

                const users = await userResponse.json();
                if (!users || users.length === 0) {
                  console.error('❌ Usuário não encontrado na tabela users:', username);
                  return { success: false, error: 'Usuário não encontrado' };
                }

                const user = users[0];
                user.session = data.session; // Adicionar sessão ao objeto usuário
                
                this.currentUser = user;
                localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
                
                console.log('✅ Login bem-sucedido:', user.name);
                return { success: true, user };
              } else {
                console.log('❌ Autenticação nativa falhou:', data);
                throw new Error('Auth failed');
              }
            } catch (authError) {
              console.log('🔄 Autenticação nativa falhou, tentando fallback...');
            }
            
            // Método 2: Fallback direto (sem RLS)
            console.log('🔄 Tentando método fallback direto...');
            const response = await fetch(this.supabaseUrl + '/rest/v1/users?select=*&name=eq.' + username + '&password=eq.' + password + '&status=eq.ativo', {
              method: 'GET',
              headers: {
                'apikey': this.supabaseServiceKey,
                'Authorization': 'Bearer ' + this.supabaseServiceKey,
                'Content-Type': 'application/json'
              }
            });
            
            const users = await response.json();
            console.log('🔍 Resposta do fallback:', users);
            
            if (!users || users.length === 0) {
              console.error('❌ Fallback também falhou:', username);
              return { success: false, error: 'Usuário ou senha inválidos' };
            }
            
            const user = users[0];
            this.currentUser = user;
            localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
            
            console.log('✅ Login bem-sucedido (fallback):', user.name);
            return { success: true, user };
            
          } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, error: 'Erro ao conectar com o servidor' };
          }
        }

        isLoggedIn() {
          if (!this.currentUser) {
            const storedUser = localStorage.getItem('directAuth_currentUser');
            if (storedUser) {
              try {
                this.currentUser = JSON.parse(storedUser);
              } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem('directAuth_currentUser');
                return false;
              }
            }
          }
          return this.currentUser !== null;
        }

        getCurrentUser() {
          if (!this.currentUser) {
            const storedUser = localStorage.getItem('directAuth_currentUser');
            if (storedUser) {
              try {
                this.currentUser = JSON.parse(storedUser);
              } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem('directAuth_currentUser');
                return null;
              }
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
          
          // Limpar cache de escalas
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
          
          // Forçar reload completo
          console.log('🔄 Forçando reload completo...');
          window.location.reload();
          
          return { success: true };
        }
      };
      
      console.log('✅ DirectAuthManager definido diretamente');
      resolve();
    });
  }

  // Verificar autenticação
  async checkAuthentication() {
    console.log('🔍 Verificando autenticação...');
    
    try {
      console.log('🔍 Verificando se authManager existe...');
      if (!this.authManager) {
        console.error('❌ authManager não existe!');
        await this.autoLoginAsAdmin();
        return;
      }
      
      console.log('🔍 Verificando método isLoggedIn...');
      if (typeof this.authManager.isLoggedIn !== 'function') {
        console.error('❌ isLoggedIn não é uma função!');
        await this.autoLoginAsAdmin();
        return;
      }
      
      // LOGIN AUTOMÁTICO COMO ADMIN
      await this.autoLoginAsAdmin();
      
    } catch (error) {
      console.error('❌ Erro em checkAuthentication:', error);
      await this.autoLoginAsAdmin();
    }
  }

  // Login automático como ADMIN
  async autoLoginAsAdmin() {
    console.log('� Fazendo login automático como ADMIN...');
    
    try {
      // Buscar usuário ADMIN diretamente
      const response = await fetch(this.authManager.supabaseUrl + '/rest/v1/users?select=*&name=eq.ADMIN&status=eq.ativo', {
        method: 'GET',
        headers: {
          'apikey': this.authManager.supabaseServiceKey,
          'Authorization': 'Bearer ' + this.authManager.supabaseServiceKey,
          'Content-Type': 'application/json'
        }
      });
      
      const users = await response.json();
      if (!users || users.length === 0) {
        console.error('❌ Usuário ADMIN não encontrado');
        return;
      }
      
      const adminUser = users[0];
      this.authManager.currentUser = adminUser;
      localStorage.setItem('directAuth_currentUser', JSON.stringify(adminUser));
      
      console.log('✅ Login automático como ADMIN bem-sucedido');
      
      // Mostrar sistema diretamente
      await this.showSystemInterface(adminUser);
      
    } catch (error) {
      console.error('❌ Erro no login automático:', error);
    }
  }

  // Mostrar tela de login
  async showLoginScreen() {
    console.log('🖥️ Mostrando tela de login...');
    
    // Esconder conteúdo principal
    this.hideMainContent();
    
    // Criar tela de login
    await this.createLoginScreen();
  }

  // Mostrar interface do sistema
  async showSystemInterface(user) {
    console.log(`📱 Mostrando interface do sistema para: ${user.name}`);
    
    // Remover tela de login se existir
    const loginScreen = document.getElementById('auth-login-screen');
    if (loginScreen) {
      loginScreen.remove();
    }
    
    // Adicionar header com versão no canto superior esquerdo
    await this.addVersionHeader();
    
    // Sincronizar com AuthContext do React
    this.syncWithReactUser(user);
    
    // Mostrar conteúdo principal com transição suave
    this.showMainContentSmooth();
    
    // Conectar ao botão CORRETO do React
    this.connectReactLogoutButton();
    
    // NÃO adicionar header ou barra - apenas mostrar sistema
  }

  // Adicionar header com versão no canto superior esquerdo (REMOVIDO)
  async addVersionHeader() {
    console.log('🚫 Version header removido - não será adicionado');
    return;
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

  // Obter commit hash atual dinamicamente
  async getCurrentCommitHash() {
    try {
      // Tentar obter do sistema de build
      if (typeof window !== 'undefined' && window.__COMMIT_HASH__) {
        return window.__COMMIT_HASH__;
      }
      
      // Tentar obter da API do GitHub
      return await this.fetchLatestCommit();
    } catch (error) {
      console.warn('Não foi possível obter hash do commit:', error);
      return '4befc43'; // Fallback
    }
  }

  // Buscar último commit do GitHub
  async fetchLatestCommit() {
    try {
      const response = await fetch('https://api.github.com/repos/bauerlucks-tech/escalasbmi/commits/main', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'EscalasBMI-System'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.sha.substring(0, 7); // Primeiros 7 caracteres
    } catch (error) {
      console.warn('Erro ao buscar commit do GitHub:', error);
      return '4befc43'; // Fallback
    }
  }

  // Atualizar versão dinamicamente
  async updateVersionDisplay() {
    const commitHash = this.getCommitHash();
    const versionElements = document.querySelectorAll('[data-version-display]');
    
    versionElements.forEach(element => {
      if (element.dataset.versionDisplay === 'login') {
        element.innerHTML = `Versão: <span style="color: #60a5fa; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;">${this.currentVersion}</span> <span style="color: rgba(255, 255, 255, 0.35);">(${commitHash})</span>`;
      } else if (element.dataset.versionDisplay === 'header') {
        element.textContent = `v${this.currentVersion}`; // Mostrar versão dinâmica
      }
    });
  }

  // Criar tela de login
  async createLoginScreen() {
    // Obter versão dinâmica atual
    const currentVersion = this.currentVersion;
    const commitHash = this.getCommitHash();
    
    // Remover tela de login anterior se existir
    const existingScreen = document.getElementById('auth-login-screen');
    if (existingScreen) {
      existingScreen.remove();
    }
    
    // Criar tela de login
    const loginScreen = document.createElement('div');
    loginScreen.id = 'auth-login-screen';
    loginScreen.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: all !important;
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
              <span style="color: rgba(255, 255, 255, 0.9); font-size: 0.75rem; font-weight: 600;">v${currentVersion}</span>
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
              <p style="margin: 0; color: rgba(255, 255, 255, 0.55); font-size: 0.875rem;" data-version-display="login">
                Versão: <span style="color: #60a5fa; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;">${currentVersion}</span> <span style="color: rgba(255, 255, 255, 0.35);">(${commitHash})</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(loginScreen);
    console.log('✅ Tela de login adicionada ao body:', loginScreen);
    console.log('✅ Elemento existe no DOM:', document.getElementById('auth-login-screen'));
    console.log('✅ Estilos aplicados:', loginScreen.style.cssText);
    
    // Atualizar versão dinamicamente
    await this.updateVersionDisplay();
    
    // Forçar visibilidade adicional
    setTimeout(() => {
      const screen = document.getElementById('auth-login-screen');
      if (screen) {
        console.log('✅ Verificação pós-append - elemento encontrado');
        screen.style.visibility = 'visible';
        screen.style.opacity = '1';
        screen.style.display = 'flex';
        console.log('✅ Visibilidade forçada');
      } else {
        console.error('❌ Elemento não encontrado após append!');
      }
    }, 100);
    
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
          // Disparar evento para React saber que usuário logou
          try {
            // Verificar se result.user existe antes de acessar
            if (!result.user) {
              console.error('❌ result.user is undefined:', result);
              throw new Error('Usuário não encontrado no resultado do login');
            }
            
            // Prevenir múltiplos eventos
            if (this.loginEventDispatched) {
              console.log('⚠️ Evento de login já foi disparado, ignorando...');
              return;
            }
            
            const event = new CustomEvent('externalLogin', {
              detail: { 
                user: result.user,
                timestamp: new Date().toISOString()
              }
            });
            window.dispatchEvent(event);
            this.loginEventDispatched = true;
            console.log('✅ Evento externalLogin disparado para React');
            
            // REMOVER reload forçado - deixar React gerenciar
            console.log('🔄 Aguardando React processar login...');
            
            // Remover tela de login manualmente
            const loginScreen = document.getElementById('auth-login-screen');
            if (loginScreen) {
              loginScreen.remove();
            }
            
            // Mostrar sistema diretamente
            this.showSystemInterface(result.user);
            
          } catch (error) {
            console.error('❌ Erro ao disparar evento externalLogin:', error);
            // Fallback: reload apenas se der erro
            window.location.reload();
          }
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
    
    // Esconder apenas o elemento #root (React app)
    const rootElement = document.querySelector('#root');
    if (rootElement) {
      console.log('📦 Escondendo elemento #root');
      rootElement.style.display = 'none';
      return;
    }
    
    // Se não encontrar #root, tentar outros seletores
    const selectors = [
      'main',
      '[id*="root"]',
      '[class*="app"]',
      'body > div:first-child'
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
    
    // Usar a função suave se a autenticação foi verificada
    if (this.authChecked) {
      this.showMainContentSmooth();
      return;
    }
    
    // Mostrar apenas o elemento #root (React app)
    const rootElement = document.querySelector('#root');
    if (rootElement) {
      console.log('📦 Mostrando elemento #root');
      rootElement.style.display = '';
      return;
    }
    
    // Se não encontrar #root, tentar outros seletores
    const selectors = [
      'main',
      '[id*="root"]',
      '[class*="app"]',
      'body > div:first-child'
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
        <span style="color: #6c757d; margin-left: 0.5rem;">v2.0</span>
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
        console.log(' BOTÃO DE LOGOUT CLICADO!');
        this.logout();
        this.addLogoutButton();
      });
    }
  }
  
  addLogoutButton() {
    // Verificar se já tem botão flutuante
    if (document.getElementById('auth-logout-float')) {
      return;
    }
    
    // Criar botão flutuante BEM visível
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'auth-logout-float';
    logoutBtn.innerHTML = '';
    logoutBtn.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: #dc3545 !important;
      color: white !important;
      padding: 12px 20px !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
      font-size: 14px !important;
      font-weight: bold !important;
      z-index: 999999 !important;
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3) !important;
      transition: all 0.3s ease !important;
    `;
    
    // Efeito hover
    logoutBtn.addEventListener('mouseenter', () => {
      logoutBtn.style.background = '#c82333 !important';
      logoutBtn.style.transform = 'scale(1.05) !important';
    });
    
    logoutBtn.addEventListener('mouseleave', () => {
      logoutBtn.style.background = '#dc3545 !important';
      logoutBtn.style.transform = 'scale(1) !important';
    });
    
    document.body.appendChild(logoutBtn);
    
    // Adicionar evento de logout
    logoutBtn.addEventListener('click', () => {
      console.log(' BOTÃO DE LOGOUT CLICADO!');
      this.logout();
    });
    
    console.log('✅ Botão de logout flutuante criado');
  }
  
  // Conectar ao botão CORRETO do React
  connectReactLogoutButton() {
    // Esperar um pouco para o React renderizar
    setTimeout(() => {
      // Procurar pelo botão com ícone lucide-log-out
      const reactLogoutBtn = document.querySelector('button svg.lucide-log-out')?.closest('button');
      
      if (reactLogoutBtn) {
        console.log('✅ Botão React encontrado:', reactLogoutBtn);
        
        // Remover eventos existentes para evitar duplicação
        const newBtn = reactLogoutBtn.cloneNode(true);
        reactLogoutBtn.parentNode.replaceChild(newBtn, reactLogoutBtn);
        
        // Adicionar evento correto
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🚪 BOTÃO REACT DE LOGOUT CLICADO!');
          this.logout();
        });
        
        console.log('✅ Evento adicionado ao botão React');
      } else {
        console.log('❌ Botão React não encontrado, tentando novamente...');
        // Tentar novamente após um tempo
        setTimeout(() => this.connectReactLogoutButton(), 2000);
      }
    }, 1000);
  }
  
  // Método logout para SystemAuthIntegration
  async logout() {
    console.log('🚪 EXECUTANDO LOGOUT DO SYSTEM AUTH...');
    
    try {
      // Limpar todos os dados de autenticação
      this.authManager.currentUser = null;
      localStorage.removeItem('directAuth_currentUser');
      localStorage.removeItem('reactCurrentUser');
      localStorage.removeItem('escala_currentUser');
      localStorage.removeItem('currentUser');
      
      // Limpar cache de escalas
      localStorage.removeItem('escala_scheduleStorage');
      localStorage.removeItem('escala_scheduleData');
      localStorage.removeItem('escala_currentSchedules');
      localStorage.removeItem('escala_archivedSchedules');
      
      console.log('🧹 Cache e autenticação limpos');
      
      // Disparar evento para React
      try {
        const event = new CustomEvent('externalLogout', {
          detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
        console.log('🔄 Evento externalLogout disparado');
      } catch (error) {
        console.error('❌ Erro ao disparar evento:', error);
      }
      
      // Remover botões de logout
      const floatBtn = document.getElementById('auth-logout-float');
      if (floatBtn) floatBtn.remove();
      
      const userHeader = document.getElementById('auth-user-header');
      if (userHeader) userHeader.remove();
      
      // Remover header de versão
      const versionHeader = document.getElementById('version-header');
      if (versionHeader) versionHeader.remove();
      
      // Criar tela de login
      this.showLoginScreen();
      
      console.log('✅ Logout concluído');
      
      // Forçar reload completo
      setTimeout(() => {
        console.log('🔄 Forçando reload completo...');
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  }
}

// Inicializar sistema
(async () => {
  console.log(' Página carregada - Iniciando sistema de autenticação...');
  const authIntegration = new SystemAuthIntegration();
  await authIntegration.initialize();
})();

// Exportar para uso manual se necessário
window.SystemAuthIntegration = SystemAuthIntegration;

console.log('🔐 SISTEMA DE AUTENTICAÇÃO INTEGRADO!');
console.log('🔄 Verificação automática ao carregar a página');
console.log('🖥️ Login automático se não estiver logado');
console.log('📱 Interface adaptativa conforme status do usuário');
