// Sistema de Autenticação Simplificado - Login Moderno
class SystemAuthIntegration {
  constructor() {
    this.authManager = null;
    this.loginEventDispatched = false;
    this.authChecked = false;
    this.currentVersion = this.generateVersion();
  }

  generateVersion() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `2.0.${day}${hour}${minute}`;
  }

  async initialize() {
    console.log('🚀 Inicializando sistema de autenticação...');
    
    // Inicializar auth manager
    this.authManager = new DirectAuthManager();
    
    // Verificar autenticação
    await this.checkAuthentication();
  }

  async checkAuthentication() {
    console.log('🔍 Verificando autenticação...');
    
    try {
      if (!this.authManager || typeof this.authManager.isLoggedIn !== 'function') {
        console.log('❌ AuthManager não disponível');
        await this.showLoginScreen();
        return;
      }
      
      const isLoggedIn = this.authManager.isLoggedIn();
      
      if (isLoggedIn) {
        const user = this.authManager.getCurrentUser();
        if (user) {
          await this.showSystemInterface(user);
          return;
        }
      }
      
      // Não logado - mostrar login
      await this.showLoginScreen();
      
    } catch (error) {
      console.error('❌ Erro:', error);
      await this.showLoginScreen();
    }
  }

  async showLoginScreen() {
    console.log('🖥️ Mostrando login moderno...');
    this.hideMainContent();
    await this.renderModernLogin();
  }

  async renderModernLogin() {
    // Criar container
    let container = document.getElementById('modern-login-container');
    if (container) container.remove();
    
    container = document.createElement('div');
    container.id = 'modern-login-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999999;';
    document.body.appendChild(container);

    try {
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(container);

      // Componente inline
      const LoginComponent = () => {
        const [password, setPassword] = React.useState('');
        const [loading, setLoading] = React.useState(false);
        const [error, setError] = React.useState('');
        
        const users = [
          { name: 'ADMIN', role: 'super_admin' },
          { name: 'CARLOS', role: 'operador' },
          { name: 'GUILHERME', role: 'operador' },
          { name: 'HENRIQUE', role: 'operador' },
          { name: 'KELLY', role: 'operador' },
          { name: 'LUCAS', role: 'operador' },
          { name: 'RICARDO', role: 'administrador' },
          { name: 'ROSANA', role: 'operador' }
        ];
        
        const handleLogin = async (e) => {
          e.preventDefault();
          setError('');
          if (!password) { setError('Digite a senha'); return; }
          
          setLoading(true);
          try {
            const res = await fetch('https://lsxmwwwmgfjwnowlsmzf.supabase.co/rest/v1/users?select=*&name=eq.ADMIN&password=eq.' + encodeURIComponent(password) + '&status=eq.ativo', {
              headers: { 
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8',
                'Content-Type': 'application/json'
              }
            });
            const data = await res.json();
            if (data && data.length > 0) {
              const user = data[0];
              localStorage.setItem('directAuth_currentUser', JSON.stringify(user));
              root.unmount();
              container.remove();
              this.showSystemInterface(user);
            } else {
              setError('Senha incorreta');
            }
          } catch (err) {
            setError('Erro de conexão');
          } finally {
            setLoading(false);
          }
        };

        // Estilos inline
        const styles = {
          container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1A1B', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
          card: { width: '100%', maxWidth: '400px', background: '#2D2D2E', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(111, 29, 27, 0.25)' },
          header: { textAlign: 'center', marginBottom: '24px' },
          iconBox: { width: '64px', height: '64px', margin: '0 auto 16px', background: 'linear-gradient(135deg, rgba(111, 29, 27, 0.3) 0%, rgba(111, 29, 27, 0.1) 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(111, 29, 27, 0.3)' },
          title: { color: '#FFFFFF', fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0' },
          subtitle: { color: '#A1A1A1', fontSize: '14px', margin: 0 },
          form: { display: 'flex', flexDirection: 'column', gap: '16px' },
          label: { color: '#A1A1A1', fontSize: '14px', fontWeight: 500, marginBottom: '4px' },
          select: { width: '100%', padding: '12px', background: 'rgba(26, 26, 27, 0.8)', border: '1px solid rgba(111, 29, 27, 0.3)', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px' },
          input: { width: '100%', padding: '12px', background: 'rgba(26, 26, 27, 0.8)', border: '1px solid rgba(111, 29, 27, 0.3)', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', boxSizing: 'border-box' },
          button: { width: '100%', padding: '14px', background: loading ? '#4a4a4b' : 'linear-gradient(135deg, #6F1D1B 0%, #8B2635 100%)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' },
          error: { background: 'rgba(111, 29, 27, 0.15)', border: '1px solid rgba(111, 29, 27, 0.3)', borderRadius: '8px', padding: '12px', color: '#FFFFFF', fontSize: '14px' },
          footer: { marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(111, 29, 27, 0.2)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#A1A1A1' },
          version: { background: 'rgba(111, 29, 27, 0.2)', color: '#6F1D1B', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }
        };

        return React.createElement('div', { style: styles.container },
          React.createElement('div', { style: styles.card }, [
            // Header
            React.createElement('div', { key: 'h', style: styles.header }, [
              React.createElement('div', { key: 'icon', style: styles.iconBox }, '✈️'),
              React.createElement('h1', { key: 't', style: styles.title }, 'Operações Aéreas Offshore'),
              React.createElement('p', { key: 's', style: styles.subtitle }, 'Área Branca SBMI')
            ]),
            // Form
            React.createElement('form', { key: 'f', onSubmit: handleLogin, style: styles.form }, [
              React.createElement('div', { key: 'u' }, [
                React.createElement('label', { key: 'ul', style: styles.label }, 'Operador'),
                React.createElement('select', { key: 'us', defaultValue: 'ADMIN', style: styles.select },
                  users.map(u => React.createElement('option', { key: u.name, value: u.name, style: { background: '#2D2D2E' } }, u.name + ' — ' + u.role))
                )
              ]),
              React.createElement('div', { key: 'p' }, [
                React.createElement('label', { key: 'pl', style: styles.label }, 'Senha'),
                React.createElement('input', { key: 'pi', type: 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: 'admin123', required: true, style: styles.input })
              ]),
              error && React.createElement('div', { key: 'e', style: styles.error }, '⚠️ ' + error),
              React.createElement('button', { key: 'b', type: 'submit', disabled: loading, style: styles.button }, loading ? 'Autenticando...' : 'Acessar Sistema →')
            ]),
            // Footer
            React.createElement('div', { key: 'ft', style: styles.footer }, [
              React.createElement('span', { key: 'l' }, '🔒 Conexão Segura'),
              React.createElement('span', { key: 'v', style: styles.version }, 'v2.0')
            ])
          ])
        );
      };

      root.render(React.createElement(LoginComponent));
      console.log('✅ Login moderno ativo!');

    } catch (err) {
      console.error('❌ Erro ao renderizar:', err);
      container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1A1A1B;color:#fff;font-family:sans-serif;"><div style="text-align:center;"><h2 style="color:#6F1D1B;">Erro</h2><p>Recarregue a página</p></div></div>';
    }
  }

  showSystemInterface(user) {
    console.log('✅ Mostrando sistema para:', user.name);
    
    // Sync com React
    const event = new CustomEvent('externalLogin', { detail: { user } });
    window.dispatchEvent(event);
    localStorage.setItem('reactCurrentUser', JSON.stringify(user));
    
    // Mostrar conteúdo
    const root = document.querySelector('#root');
    if (root) {
      root.style.display = 'block';
      root.style.opacity = '0';
      setTimeout(() => root.style.transition = 'opacity 0.5s', 10);
      setTimeout(() => root.style.opacity = '1', 20);
    }
  }

  hideMainContent() {
    const root = document.querySelector('#root');
    if (root) root.style.display = 'none';
  }
}

// Auth Manager simplificado
class DirectAuthManager {
  constructor() {
    this.currentUser = null;
    this.supabaseUrl = window.SUPABASE_URL || 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    this.supabaseKey = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
    
    // Carregar usuário do localStorage
    const saved = localStorage.getItem('directAuth_currentUser');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// Inicializar
(async () => {
  console.log('🚀 Sistema iniciando...');
  const auth = new SystemAuthIntegration();
  await auth.initialize();
})();
