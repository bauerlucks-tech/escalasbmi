// LOGIN SIMPLES COM SERVICE KEY - ABORDAGEM DIRETA
// Contorna RLS usando Service Role Key

class DirectAuthManager {
  constructor() {
    this.supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    // SECURITY WARNING: This should be loaded from environment variables
    // The service_role key has been revoked and must be rotated in Supabase dashboard
    this.supabaseServiceKey = window.ENV?.SUPABASE_SERVICE_KEY || localStorage.getItem('temp_service_key') || '';
    if (!this.supabaseServiceKey) {
      console.warn('⚠️ SUPABASE_SERVICE_KEY not configured. Authentication will fail.');
    }
    this.currentUser = null;
    
    // Estado para Easter Egg
    this.logoClickCount = 0;
    this.lastLogoClick = 0;
    this.easterEggActivated = false;
    this.superAdminAttempts = 0;
    this.CLICK_TIMEOUT = 3000; // 3 segundos
    this.REQUIRED_CLICKS = 1; // Mudado para 1 clique
    this.MAX_SUPER_ADMIN_ATTEMPTS = 3;
  }

  // Login direto com Service Key (contorna RLS)
  async login(username, password) {
    console.log('🔑 Fazendo login direto:', username);
    
    try {
      // SECURITY FIX: Use POST with body instead of GET with password in URL
      const response = await fetch(this.supabaseUrl + '/rest/v1/rpc/login_user', {
        method: 'POST',
        headers: {
          'apikey': this.supabaseServiceKey,
          'Authorization': 'Bearer ' + this.supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_username: username,
          p_password: password
        })
      });
      
      if (!response.ok) {
        console.log('❌ Erro na requisição:', response.status);
        return { success: false, error: 'Erro na autenticação' };
      }
      
      const users = await response.json();
      
      if (!users || users.length === 0) {
        console.log('❌ Usuário ou senha inválidos');
        return { success: false, error: 'Usuário ou senha inválidos' };
      }
      
      const user = users[0];
      
      // Login bem-sucedido
      this.currentUser = user;
      
      // Salvar no localStorage
      localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
      
      // Criar log de login
      await fetch(this.supabaseUrl + '/rest/v1/audit_logs', {
        method: 'POST',
        headers: {
          'apikey': this.supabaseServiceKey,
          'Authorization': 'Bearer ' + this.supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_name: user.name,
          action: 'LOGIN',
          details: 'Login realizado - ' + new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      });
      
      console.log('✅ Login successful:', user.name);
      
      return { 
        success: true, 
        user: user
      };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Logout
  async logout() {
    console.log('🚪 Fazendo logout...');
    
    try {
      const userName = this.currentUser?.name;
      const isSuperAdmin = this.isSuperAdminMode();
      
      // Criar log de logout
      if (userName) {
        await fetch(this.supabaseUrl + '/rest/v1/audit_logs', {
          method: 'POST',
          headers: {
            'apikey': this.supabaseServiceKey,
            'Authorization': 'Bearer ' + this.supabaseServiceKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_name: userName,
            action: isSuperAdmin ? 'SUPER_ADMIN_LOGOUT' : 'LOGOUT',
            details: 'Logout realizado - ' + new Date().toISOString(),
            created_at: new Date().toISOString()
          })
        });
      }
      
      // Limpar dados de autenticação
      this.currentUser = null;
      localStorage.removeItem('directAuth_currentUser');
      localStorage.removeItem('directAuth_superAdminMode');
      localStorage.removeItem('reactCurrentUser');
      localStorage.removeItem('escala_currentUser');
      localStorage.removeItem('currentUser');
      
      // Limpar cache de escalas para forçar recarregamento
      localStorage.removeItem('escala_scheduleStorage');
      localStorage.removeItem('escala_scheduleData');
      localStorage.removeItem('escala_currentSchedules');
      localStorage.removeItem('escala_archivedSchedules');
      
      // Limpar tentativas de Super Admin
      this.clearSuperAdminAttempts();
      
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
      
      console.log('✅ Logout realizado');
      
      // Forçar reload completo para limpar qualquer cache restante
      console.log('🔄 Forçando reload completo...');
      window.location.reload();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Verificar se está logado
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

  // Obter usuário atual
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

  // Verificar permissão
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roleHierarchy = {
      'operador': 1,
      'administrador': 2,
      'super_admin': 3
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  // =========== SUPER ADMIN DISCRETO ===========
  
  // Detectar cliques no logo (Easter Egg)
  handleLogoClick(event) {
    const now = Date.now();
    
    // Reset se passou muito tempo
    if (now - this.lastLogoClick > this.CLICK_TIMEOUT) {
      this.logoClickCount = 0;
    }
    
    this.logoClickCount++;
    this.lastLogoClick = now;
    
    // Debug apenas em desenvolvimento
    if (window.location.hostname === 'localhost') {
      console.log(`🔍 Cliques: ${this.logoClickCount}/${this.REQUIRED_CLICKS}`);
    }
    
    // Ativar Easter Egg com 1 clique
    if (this.logoClickCount >= this.REQUIRED_CLICKS && !this.easterEggActivated) {
      this.activateEasterEgg();
    }
  }
  
  // Ativar modo Super Admin
  activateEasterEgg() {
    this.easterEggActivated = true;
    console.log('🔓 Easter Egg ativado - Modo Super Admin');
    
    // Feedback visual sutil (brilho suave no logo)
    const logo = document.querySelector('#login-logo');
    if (logo) {
      logo.style.animation = 'subtle-glow 0.5s ease-in-out';
      setTimeout(() => {
        logo.style.animation = '';
      }, 500);
    }
    
    // Vibração se disponível
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }
    
    // Auto-preencher campo de usuário
    const usernameField = document.getElementById('login-username');
    if (usernameField) {
      usernameField.value = 'SUPERADMIN';
      usernameField.readOnly = true;
      usernameField.style.background = '#f0f0f0';
      usernameField.style.color = '#6b7280';
    }
    
    // Focar no campo de senha
    const passwordField = document.getElementById('login-password');
    if (passwordField) {
      passwordField.placeholder = 'Digite a senha de Super Admin';
      passwordField.focus();
    }
    
    // Reset após 2 minutos
    setTimeout(() => {
      this.resetEasterEgg();
    }, 120000);
  }
  
  // Reset do Easter Egg
  resetEasterEgg() {
    this.logoClickCount = 0;
    this.easterEggActivated = false;
    
    const usernameField = document.getElementById('login-username');
    if (usernameField && usernameField.value === 'SUPERADMIN') {
      usernameField.value = '';
      usernameField.readOnly = false;
      usernameField.style.background = '';
      usernameField.style.color = '';
    }
    
    const passwordField = document.getElementById('login-password');
    if (passwordField) {
      passwordField.placeholder = 'Senha';
    }
  }
  
  // Login Super Admin
  async loginSuperAdmin(password) {
    console.log('🔐 Tentativa de login Super Admin');
    
    // Rate limiting
    const attempts = this.getSuperAdminAttempts();
    if (attempts >= this.MAX_SUPER_ADMIN_ATTEMPTS) {
      await this.logAuditEvent('SUPER_ADMIN_LOGIN_BLOCKED',
        'Tentativas excedidas');
      return {
        success: false,
        error: 'Acesso temporariamente bloqueado'
      };
    }
    
    try {
      // Validar senha forte
      if (!this.validateStrongPassword(password)) {
        this.incrementSuperAdminAttempts();
        await this.logAuditEvent('SUPER_ADMIN_LOGIN_FAILED',
          'Senha fraca ou inválida');
        return {
          success: false,
          error: 'Acesso negado'
        };
      }
      
      // Buscar Super Admin no banco
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/users?name=eq.SUPERADMIN&role=eq.super_admin`,
        {
          headers: {
            'apikey': this.supabaseServiceKey,
            'Authorization': `Bearer ${this.supabaseServiceKey}`
          }
        }
      );
      
      if (!response.ok) {
        this.incrementSuperAdminAttempts();
        await this.logAuditEvent('SUPER_ADMIN_LOGIN_ERROR',
          `HTTP ${response.status}`);
        return {
          success: false,
          error: 'Erro no sistema'
        };
      }
      
      const users = await response.json();
      
      if (!users || users.length === 0) {
        this.incrementSuperAdminAttempts();
        await this.logAuditEvent('SUPER_ADMIN_LOGIN_FAILED',
          'Usuário não encontrado');
        return {
          success: false,
          error: 'Acesso negado'
        };
      }
      
      const user = users[0];
      
      // Verificar senha (comparação direta - em produção usar hash)
      if (password !== user.password) {
        this.incrementSuperAdminAttempts();
        await this.logAuditEvent('SUPER_ADMIN_LOGIN_FAILED',
          'Senha incorreta');
        return {
          success: false,
          error: 'Acesso negado'
        };
      }
      
      // Login bem-sucedido
      this.clearSuperAdminAttempts();
      await this.logAuditEvent('SUPER_ADMIN_LOGIN_SUCCESS',
        `Acesso Super Admin realizado`);
      
      this.currentUser = user;
      localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
      localStorage.setItem('directAuth_superAdminMode', 'true');
      
      // Configurar timeout de sessão (30 minutos)
      this.setSuperAdminTimeout();
      
      console.log('✅ Login Super Admin bem-sucedido');
      
      return {
        success: true,
        user: user
      };
      
    } catch (error) {
      console.error('❌ Erro no login Super Admin:', error);
      await this.logAuditEvent('SUPER_ADMIN_LOGIN_ERROR',
        error.message);
      return {
        success: false,
        error: 'Erro no sistema'
      };
    }
  }
  
  // Validar senha forte
  validateStrongPassword(password) {
    // Mínimo 12 caracteres
    if (password.length < 12) return false;
    
    // Deve conter:
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }
  
  // Gerenciar tentativas de Super Admin
  getSuperAdminAttempts() {
    const attempts = sessionStorage.getItem('superAdminAttempts');
    return attempts ? parseInt(attempts, 10) : 0;
  }
  
  incrementSuperAdminAttempts() {
    const current = this.getSuperAdminAttempts();
    sessionStorage.setItem('superAdminAttempts', (current + 1).toString());
  }
  
  clearSuperAdminAttempts() {
    sessionStorage.removeItem('superAdminAttempts');
  }
  
  // Timeout de sessão Super Admin
  setSuperAdminTimeout() {
    // 30 minutos = 1800000 ms
    setTimeout(() => {
      if (this.isSuperAdminMode()) {
        console.log('⏰ Timeout de sessão Super Admin - Fazendo logout');
        this.logAuditEvent('SUPER_ADMIN_TIMEOUT', 'Sessão expirada');
        this.logout();
      }
    }, 1800000);
  }
  
  // Verificar se está em modo Super Admin
  isSuperAdminMode() {
    return localStorage.getItem('directAuth_superAdminMode') === 'true';
  }
  
  // Log de auditoria com mais detalhes
  async logAuditEvent(action, details) {
    try {
      await fetch(this.supabaseUrl + '/rest/v1/audit_logs', {
        method: 'POST',
        headers: {
          'apikey': this.supabaseServiceKey,
          'Authorization': 'Bearer ' + this.supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_name: this.currentUser?.name || 'SYSTEM',
          action: action,
          details: details + ' - ' + new Date().toISOString(),
          created_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('❌ Erro ao registrar log:', error);
    }
  }
}

// Função para configurar senhas com Service Key
async function configurarSenhasDireto() {
  console.log('🔑 CONFIGURANDO SENHAS (MÉTODO DIRETO)');
  console.log('========================================');
  
  try {
    // SECURITY FIX: Get key from environment or secure storage instead of hardcoding
    const serviceKey = window.ENV?.SUPABASE_SERVICE_KEY || localStorage.getItem('temp_service_key');
    if (!serviceKey) {
      console.error('❌ SUPABASE_SERVICE_KEY not configured');
      return { updated: 0, errors: 1, total: 0 };
    }
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    
    // Buscar usuários atuais
    const response = await fetch(supabaseUrl + '/rest/v1/users?select=*', {
      headers: {
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey
      }
    });
    
    const users = await response.json();
    console.log('👥 Encontrados ' + users.length + ' usuários');
    
    // Gerar senhas simples
    console.log('');
    console.log('🔑 GERANDO SENHAS SIMPLES...');
    console.log('===============================');
    
    const userCredentials = [];
    
    users.forEach(user => {
      const password = user.name.toLowerCase().replace(/\s+/g, '') + '123';
      
      userCredentials.push({
        name: user.name,
        password: password,
        role: user.role
      });
      
      console.log('👤 ' + user.name);
      console.log('   🔑 Senha: ' + password);
      console.log('   📋 Role: ' + user.role);
      console.log('');
    });
    
    // Atualizar senhas no banco
    console.log('💾 ATUALIZANDO SENHAS NO BANCO...');
    
    let updated = 0;
    let errors = 0;
    
    for (const user of userCredentials) {
      try {
        const updateResponse = await fetch(supabaseUrl + '/rest/v1/users?name=eq.' + user.name, {
          method: 'PATCH',
          headers: {
            'apikey': serviceKey,
            'Authorization': 'Bearer ' + serviceKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: user.password })
        });
        
        if (updateResponse.ok) {
          console.log('✅ ' + user.name + ' atualizado');
          updated++;
        } else {
          console.log('❌ Erro ao atualizar ' + user.name + ': ' + updateResponse.status);
          errors++;
        }
      } catch (error) {
        console.log('❌ Erro ao atualizar ' + user.name + ': ' + (error instanceof Error ? error.message : String(error)));
        errors++;
      }
    }
    
    // Resumo
    console.log('');
    console.log('📊 RESUMO DA ATUALIZAÇÃO');
    console.log('==========================');
    console.log('✅ Atualizados: ' + updated);
    console.log('❌ Erros: ' + errors);
    console.log('📋 Total: ' + users.length);
    
    if (updated > 0) {
      console.log('');
      console.log('🎉 SENHAS CONFIGURADAS COM SUCESSO!');
      console.log('💡 Use as credenciais acima para fazer login');
      console.log('🔧 Próximo passo: testarLoginDireto()');
    }
    
    return { updated, errors, total: users.length };
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    return { updated: 0, errors: 1, total: 0 };
  }
}

// Função para testar login
async function testarLoginDireto() {
  console.log('🧪 TESTANDO LOGIN DIRETO');
  console.log('========================');
  
  const auth = new DirectAuthManager();
  
  // Testar com ADMIN
  console.log('🧪 Testando com ADMIN/admin123...');
  const result = await auth.login('ADMIN', 'admin123');
  
  if (result.success) {
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', result.user.name);
    console.log('📋 Role:', result.user.role);
    
    // Testar logout
    console.log('');
    console.log('🚪 Testando logout...');
    const logoutResult = await auth.logout();
    console.log('📊 Logout:', logoutResult.success ? '✅ Sucesso' : '❌ Erro');
    
  } else {
    console.log('❌ Falha no login:', result.error);
  }
}

// Função para criar interface de login direto
function criarInterfaceLoginDireto() {
  console.log('🖥️ Criando interface de login direto...');
  
  // Remover modal anterior se existir
  const existingModal = document.getElementById('direct-login-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Adicionar CSS para animação
  if (!document.getElementById('login-animations-style')) {
    const style = document.createElement('style');
    style.id = 'login-animations-style';
    style.textContent = `
      @keyframes subtle-glow {
        0%, 100% {
          filter: brightness(1);
          box-shadow: 0 0 0 rgba(59, 130, 246, 0);
        }
        50% {
          filter: brightness(1.1);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Criar instância do auth manager
  const auth = new DirectAuthManager();
  
  // Criar modal de login
  const loginModal = document.createElement('div');
  loginModal.id = 'direct-login-modal';
  loginModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  
  loginModal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 8px; min-width: 300px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 1rem;">
        <div id="login-logo" style="font-size: 3rem; cursor: pointer; user-select: none; transition: transform 0.2s;">🚁</div>
        <h2 style="margin: 0.5rem 0 0 0; color: #333; text-align: center;">Login Sistema de Escalas</h2>
      </div>
      <p style="margin: 0 0 1rem 0; color: #666; text-align: center; font-size: 0.9rem;">Acesso direto ao sistema</p>
      
      <form id="direct-login-form">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #666;">Nome de Usuário:</label>
          <input type="text" id="login-username" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #666;">Senha:</label>
          <input type="password" id="login-password" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        
        <button type="submit" style="width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Entrar
        </button>
      </form>
      
      <div id="login-message" style="margin-top: 1rem; padding: 0.5rem; border-radius: 4px; display: none;"></div>
      
      <div style="margin-top: 1rem; text-align: center; font-size: 0.8rem; color: #666;">
        <p>📋 Credenciais de exemplo:</p>
        <p><strong>ADMIN</strong> / admin123</p>
        <p><strong>LUCAS</strong> / lucas123</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginModal);
  
  // Adicionar listener para Easter Egg no logo
  const logo = document.getElementById('login-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      // Feedback visual no clique
      logo.style.transform = 'scale(0.95)';
      setTimeout(() => {
        logo.style.transform = 'scale(1)';
      }, 100);
      
      // Detectar sequência de cliques
      auth.handleLogoClick(e);
    });
  }
  
  // Adicionar event listeners para o formulário
  document.getElementById('direct-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');
    
    if (!username || !password) {
      messageDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '❌ Preencha todos os campos';
      messageDiv.style.display = 'block';
      return;
    }
    
    let result;
    
    // Verificar se é login de Super Admin
    if (username === 'SUPERADMIN' && auth.easterEggActivated) {
      result = await auth.loginSuperAdmin(password);
    } else {
      result = await auth.login(username, password);
    }
    
    if (result.success) {
      messageDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '✅ Login realizado com sucesso! Bem-vindo ' + result.user.name;
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        loginModal.style.display = 'none';
        
        // Disparar evento personalizado para React
        const loginEvent = new CustomEvent('externalLogin', {
          detail: { user: result.user }
        });
        window.dispatchEvent(loginEvent);
        
        window.location.reload();
      }, 1500);
    } else {
      messageDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '❌ ' + result.error;
      messageDiv.style.display = 'block';
    }
  });
}

// Exportar funções
window.DirectAuthManager = DirectAuthManager;
window.configurarSenhasDireto = configurarSenhasDireto;
window.testarLoginDireto = testarLoginDireto;
window.criarInterfaceLoginDireto = criarInterfaceLoginDireto;

console.log('🔧 SISTEMA DE LOGIN DIRETO CARREGADO!');
console.log('🔑 Para configurar senhas: configurarSenhasDireto()');
console.log('🧪 Para testar login: testarLoginDireto()');
console.log('🖥️ Para criar interface: criarInterfaceLoginDireto()');
console.log('✅ Contorna RLS com Service Key!');
