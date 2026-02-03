// SISTEMA DE LOGIN SIMPLES - SEM EMAIL
// Apenas nome de usuário e senha

class SimpleAuthManager {
  constructor() {
    this.supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
    this.supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    this.currentUser = null;
  }

  // Inicializar
  async initialize() {
    console.log('🔧 Inicializando sistema de login simples...');
    
    // Carregar biblioteca Supabase se necessário
    if (typeof window.supabase === 'undefined') {
      await this.loadSupabaseLibrary();
    }
    
    const { createClient } = window.supabase;
    this.client = createClient(this.supabaseUrl, this.supabaseAnonKey);
    
    // Verificar se já está logado
    const storedUser = localStorage.getItem('simpleAuth_currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      console.log('✅ Usuário já logado:', this.currentUser.name);
    }
    
    return this.client;
  }

  // Carregar biblioteca Supabase
  async loadSupabaseLibrary() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Login simples
  async login(username, password) {
    console.log('🔑 Fazendo login:', username);
    
    try {
      // Buscar usuário na tabela users
      const { data: users, error } = await this.client
        .from('users')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .eq('status', 'ativo')
        .single();
      
      if (error || !users) {
        console.log('❌ Usuário ou senha inválidos');
        return { success: false, error: 'Usuário ou senha inválidos' };
      }
      
      // Login bem-sucedido
      this.currentUser = users;
      
      // Salvar no localStorage
      localStorage.setItem('simpleAuth_currentUser', JSON.stringify(users));
      
      // Criar log de login
      await this.client.from('audit_logs').insert({
        user_name: users.name,
        action: 'LOGIN',
        details: 'Login realizado - ' + new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      
      console.log('✅ Login successful:', users.name);
      
      return { 
        success: true, 
        user: users
      };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    console.log('🚪 Fazendo logout...');
    
    try {
      const userName = this.currentUser?.name;
      
      // Criar log de logout
      if (userName) {
        await this.client.from('audit_logs').insert({
          user_name: userName,
          action: 'LOGOUT',
          details: 'Logout realizado - ' + new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
      
      // Limpar dados
      this.currentUser = null;
      localStorage.removeItem('simpleAuth_currentUser');
      
      console.log('✅ Logout realizado');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se está logado
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar permissão
  hasRole(requiredRole) {
    if (!this.currentUser) return false;
    
    const roleHierarchy = {
      'operador': 1,
      'administrador': 2,
      'super_admin': 3
    };
    
    const userLevel = roleHierarchy[this.currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }
}

// Função para configurar senhas para usuários existentes
async function configurarSenhasUsuarios() {
  console.log('🔑 CONFIGURANDO SENHAS PARA USUÁRIOS');
  console.log('==================================');
  
  try {
    // Carregar biblioteca se necessário
    if (typeof window.supabase === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    const { createClient } = window.supabase;
    const supabase = createClient(
      'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
    );
    
    // Buscar usuários atuais
    const response = await fetch('https://lsxmwwwmgfjwnowlsmzf.supabase.co/rest/v1/users?select=*', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94'
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
      // Senha simples: nome em minúsculas + 123
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
        const { error } = await supabase
          .from('users')
          .update({ password: user.password })
          .eq('name', user.name);
        
        if (error) {
          console.log('❌ Erro ao atualizar ' + user.name + ': ' + error.message);
          errors++;
        } else {
          console.log('✅ ' + user.name + ' atualizado');
          updated++;
        }
      } catch (error) {
        console.log('❌ Erro ao atualizar ' + user.name + ': ' + error.message);
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
      console.log('🔧 Próximo passo: criarInterfaceLoginSimples()');
    }
    
    return { updated, errors, total: users.length };
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    return { updated: 0, errors: 1, total: 0 };
  }
}

// Função para criar interface de login simples
function criarInterfaceLoginSimples() {
  console.log('🖥️ Criando interface de login simples...');
  
  // Remover modal anterior se existir
  const existingModal = document.getElementById('simple-login-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Criar modal de login simples
  const loginModal = document.createElement('div');
  loginModal.id = 'simple-login-modal';
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
      <p style="margin: 0 0 1rem 0; color: #666; text-align: center; font-size: 0.9rem;">Use nome de usuário e senha</p>
      
      <form id="simple-login-form">
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
  
  // Adicionar event listeners
  document.getElementById('simple-login-form').addEventListener('submit', async (e) => {
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
    
    const authManager = new SimpleAuthManager();
    await authManager.initialize();
    
    const result = await authManager.login(username, password);
    
    if (result.success) {
      messageDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '✅ Login realizado com sucesso! Bem-vindo ' + result.user.name;
      
      setTimeout(() => {
        loginModal.style.display = 'none';
        window.location.reload();
      }, 1500);
    } else {
      messageDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '❌ ' + result.error;
    }
    
    messageDiv.style.display = 'block';
  });
}

// Exportar funções
window.SimpleAuthManager = SimpleAuthManager;
window.configurarSenhasUsuarios = configurarSenhasUsuarios;
window.criarInterfaceLoginSimples = criarInterfaceLoginSimples;

console.log('🔐 SISTEMA DE LOGIN SIMPLES CARREGADO!');
console.log('🔑 Para configurar senhas: configurarSenhasUsuarios()');
console.log('🖥️ Para criar interface: criarInterfaceLoginSimples()');
console.log('🔧 Para usar: const auth = new SimpleAuthManager();');
console.log('✨ Sem email - apenas nome e senha!');
