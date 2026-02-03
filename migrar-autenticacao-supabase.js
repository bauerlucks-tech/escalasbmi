// MIGRAÇÃO DE AUTENTICAÇÃO COMPLETA PARA SUPABASE
// Implementação de login/senha com Supabase Auth

class SupabaseAuthManager {
  constructor() {
    this.supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
    this.supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    this.client = null;
    this.currentUser = null;
  }

  // Inicializar cliente Supabase
  async initialize() {
    console.log('🔧 Inicializando Supabase Auth...');
    
    // Carregar biblioteca Supabase se necessário
    if (typeof window.supabase === 'undefined') {
      await this.loadSupabaseLibrary();
    }
    
    const { createClient } = window.supabase;
    this.client = createClient(this.supabaseUrl, this.supabaseAnonKey);
    
    // Verificar sessão atual
    const { data: { session } } = await this.client.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      console.log('✅ Usuário já logado:', this.currentUser.email);
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

  // Criar usuário no Supabase Auth
  async createUser(email, password, userData) {
    console.log('👤 Criando usuário:', email);
    
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: userData
        }
      });

      if (authError) {
        console.log('❌ Erro ao criar usuário Auth:', authError.message);
        return { success: false, error: authError.message };
      }

      console.log('✅ Usuário criado no Auth:', authData.user?.email);

      // 2. Criar perfil na tabela users
      const { error: profileError } = await this.client
        .from('users')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: email,
          role: userData.role || 'operador',
          status: 'ativo',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.log('❌ Erro ao criar perfil:', profileError.message);
        return { success: false, error: profileError.message };
      }

      console.log('✅ Perfil criado com sucesso');
      return { success: true, user: authData.user };

    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return { success: false, error: error.message };
    }
  }

  // Login de usuário
  async login(email, password) {
    console.log('🔑 Fazendo login:', email);
    
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.log('❌ Erro no login:', error.message);
        return { success: false, error: error.message };
      }

      this.currentUser = data.user;
      console.log('✅ Login successful:', data.user.email);

      // Buscar dados completos do usuário
      const { data: profile } = await this.client
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return { 
        success: true, 
        user: data.user,
        profile: profile
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
      const { error } = await this.client.auth.signOut();
      
      if (error) {
        console.log('❌ Erro no logout:', error.message);
        return { success: false, error: error.message };
      }

      this.currentUser = null;
      console.log('✅ Logout successful');
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

  // Resetar senha
  async resetPassword(email) {
    console.log('🔄 Enviando email de reset para:', email);
    
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email);

      if (error) {
        console.log('❌ Erro ao enviar reset:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Email de reset enviado');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no reset:', error);
      return { success: false, error: error.message };
    }
  }
}

// Função para migrar usuários existentes
async function migrarUsuariosParaAuth() {
  console.log('👥 MIGRANDO USUÁRIOS PARA SUPABASE AUTH');
  console.log('=======================================');
  
  const authManager = new SupabaseAuthManager();
  await authManager.initialize();
  
  try {
    // 1. Buscar usuários atuais no Supabase
    console.log('');
    console.log('📋 1. BUSCANDO USUÁRIOS ATUAIS...');
    
    const response = await fetch(authManager.supabaseUrl + '/rest/v1/users?select=*', {
      headers: {
        'apikey': authManager.supabaseServiceKey,
        'Authorization': 'Bearer ' + authManager.supabaseServiceKey
      }
    });
    
    const users = await response.json();
    console.log('👥 Encontrados ' + users.length + ' usuários para migrar');
    
    // 2. Criar emails para usuários (baseado no nome)
    console.log('');
    console.log('📧 2. CRIANDO CONTAS DE AUTENTICAÇÃO...');
    
    const migrationResults = [];
    
    for (const user of users) {
      // Gerar email baseado no nome
      const email = user.name.toLowerCase().replace(/\s+/g, '.') + '@escalasbmi.com';
      const password = user.name.toLowerCase().replace(/\s+/g, '') + '123';
      
      console.log('👤 Migrando usuário:', user.name);
      console.log('   📧 Email:', email);
      
      // Verificar se já existe no Auth
      try {
        const { data: existingUsers } = await authManager.client.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === email);
        
        if (existingUser) {
          console.log('   ⚠️ Usuário já existe no Auth');
          migrationResults.push({ name: user.name, status: 'exists', email: email });
          continue;
        }
        
        // Criar usuário no Auth
        const result = await authManager.createUser(email, password, {
          name: user.name,
          role: user.role,
          original_id: user.id
        });
        
        if (result.success) {
          console.log('   ✅ Usuário criado com sucesso');
          migrationResults.push({ 
            name: user.name, 
            status: 'created', 
            email: email, 
            password: password 
          });
        } else {
          console.log('   ❌ Erro:', result.error);
          migrationResults.push({ 
            name: user.name, 
            status: 'error', 
            error: result.error 
          });
        }
        
      } catch (error) {
        console.log('   ❌ Erro:', error.message);
        migrationResults.push({ 
          name: user.name, 
          status: 'error', 
          error: error.message 
        });
      }
    }
    
    // 3. Resumo da migração
    console.log('');
    console.log('📊 3. RESUMO DA MIGRAÇÃO');
    console.log('========================');
    
    const created = migrationResults.filter(r => r.status === 'created').length;
    const existing = migrationResults.filter(r => r.status === 'exists').length;
    const errors = migrationResults.filter(r => r.status === 'error').length;
    
    console.log('✅ Criados: ' + created);
    console.log('⚠️ Já existiam: ' + existing);
    console.log('❌ Erros: ' + errors);
    
    // 4. Mostrar credenciais
    if (created > 0) {
      console.log('');
      console.log('🔑 CREDENCIAIS DOS NOVOS USUÁRIOS:');
      console.log('==================================');
      
      migrationResults
        .filter(r => r.status === 'created')
        .forEach(result => {
          console.log('👤 ' + result.name);
          console.log('   📧 Email: ' + result.email);
          console.log('   🔑 Senha: ' + result.password);
          console.log('');
        });
    }
    
    // 5. Testar login
    console.log('🧪 5. TESTANDO LOGIN...');
    
    if (migrationResults.some(r => r.status === 'created')) {
      const testUser = migrationResults.find(r => r.status === 'created');
      if (testUser) {
        console.log('🧪 Testando login com:', testUser.email);
        const loginResult = await authManager.login(testUser.email, testUser.password);
        
        if (loginResult.success) {
          console.log('✅ Login testado com sucesso!');
          await authManager.logout();
        } else {
          console.log('❌ Falha no teste de login:', loginResult.error);
        }
      }
    }
    
    console.log('');
    console.log('🎉 MIGRAÇÃO DE AUTENTICAÇÃO CONCLUÍDA!');
    console.log('💡 Use as credenciais acima para fazer login');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Função para criar interface de login
function criarInterfaceLogin() {
  console.log('🖥️ Criando interface de login...');
  
  // Criar modal de login
  const loginModal = document.createElement('div');
  loginModal.id = 'supabase-login-modal';
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
      <h2 style="margin: 0 0 1rem 0; color: #333;">🔐 Login Sistema de Escalas</h2>
      
      <form id="login-form">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #666;">Email:</label>
          <input type="email" id="login-email" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
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
      
      <div style="margin-top: 1rem; text-align: center;">
        <button id="forgot-password" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;">
          Esqueci minha senha
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginModal);
  
  // Adicionar event listeners
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');
    
    const authManager = new SupabaseAuthManager();
    await authManager.initialize();
    
    const result = await authManager.login(email, password);
    
    if (result.success) {
      messageDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 0.5rem; border-radius: 4px;';
      messageDiv.textContent = '✅ Login realizado com sucesso!';
      
      // Salvar no localStorage
      localStorage.setItem('supabase_current_user', JSON.stringify(result.user));
      localStorage.setItem('supabase_user_profile', JSON.stringify(result.profile));
      
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
  
  document.getElementById('forgot-password').addEventListener('click', async () => {
    const email = prompt('Digite seu email para resetar a senha:');
    if (email) {
      const authManager = new SupabaseAuthManager();
      await authManager.initialize();
      
      const result = await authManager.resetPassword(email);
      
      const messageDiv = document.getElementById('login-message');
      if (result.success) {
        messageDiv.style.cssText = 'background: #d1ecf1; color: #0c5460; padding: 0.5rem; border-radius: 4px;';
        messageDiv.textContent = '✅ Email de reset enviado!';
      } else {
        messageDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 0.5rem; border-radius: 4px;';
        messageDiv.textContent = '❌ ' + result.error;
      }
      messageDiv.style.display = 'block';
    }
  });
}

// Exportar funções
window.SupabaseAuthManager = SupabaseAuthManager;
window.migrarUsuariosParaAuth = migrarUsuariosParaAuth;
window.criarInterfaceLogin = criarInterfaceLogin;

console.log('🔐 SISTEMA DE AUTENTICAÇÃO SUPABASE CARREGADO!');
console.log('👥 Para migrar usuários: migrarUsuariosParaAuth()');
console.log('🖥️ Para criar interface: criarInterfaceLogin()');
console.log('🔧 Para usar: const auth = new SupabaseAuthManager();');
