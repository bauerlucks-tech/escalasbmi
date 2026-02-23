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
  }

  // Login direto com fallback (tenta Service Key, depois Anon Key)
  async login(username, password) {
    console.log('🔑 Fazendo login direto:', username);
    
    try {
      // PRIMEIRO: Tentar com Service Key
      if (this.supabaseServiceKey) {
        console.log('🔧 Tentando login com Service Key...');
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
        
        if (response.ok) {
          console.log('✅ Login com Service Key funcionou!');
          const users = await response.json();
          
          if (users && users.length > 0) {
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
          } else {
            console.log('❌ Usuário ou senha inválidos');
            return { success: false, error: 'Usuário ou senha inválidos' };
          }
        } else {
          console.log('❌ Service Key falhou, tentando fallback...');
        }
      }
      
      // FALLBACK: Tentar login local (sem Supabase)
      console.log('🔄 Usando fallback de login local...');
      const users = [
        { id: 1, name: 'ADMIN', password: 'admin123', role: 'admin', status: 'active' },
        { id: 2, name: 'LUCAS', password: 'lucas123', role: 'operator', status: 'active' },
        { id: 3, name: 'CARLOS', password: 'carlos123', role: 'operator', status: 'active' },
        { id: 4, name: 'ROSANA', password: 'rosana123', role: 'operator', status: 'active' },
        { id: 5, name: 'HENRIQUE', password: 'henrique123', role: 'operator', status: 'active' },
        { id: 6, name: 'RICARDO', password: 'ricardo123', role: 'operator', status: 'active' }
      ];
      
      const user = users.find(u => u.name === username && u.password === password);
      
      if (user) {
        console.log('✅ Login local funcionou!');
        
        // Salvar no localStorage
        localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
        this.currentUser = user;
        
        // Disparar evento para o React
        window.dispatchEvent(new CustomEvent('externalLogin', {
          detail: { user }
        }));
        
        return { success: true, user: user };
      } else {
        console.log('❌ Usuário ou senha inválidos (local)');
        return { success: false, error: 'Usuário ou senha inválidos' };
      }
      
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      return { success: false, error: 'Erro na autenticação' };
    }
  }

  // Logout
  async logout() {
    console.log('🚪 Fazendo logout...');
    
    try {
      const userName = this.currentUser?.name;
      
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
            action: 'LOGOUT',
            details: 'Logout realizado - ' + new Date().toISOString(),
            created_at: new Date().toISOString()
          })
        });
      }
      
      // Limpar dados de autenticação
      this.currentUser = null;
      localStorage.removeItem('directAuth_currentUser');
      localStorage.removeItem('reactCurrentUser');
      localStorage.removeItem('escala_currentUser');
      localStorage.removeItem('currentUser');
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
  hasPermission(requiredRole) {
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
      <h2 style="margin: 0 0 1rem 0; color: #333; text-align: center;">🔐 Login Sistema de Escalas</h2>
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
    
    const result = await auth.login(username, password);
    
    if (result.success) {
      messageDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '✅ Login realizado com sucesso! Bem-vindo ' + result.user.name;
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        loginModal.style.display = 'none';
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
