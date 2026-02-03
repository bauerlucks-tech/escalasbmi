// DEBUG E CORREÇÃO FINAL DO LOGOUT
// Script para diagnosticar e corrigir o problema do logout

(function debugLogoutFinal() {
  console.log('🔍 DEBUG FINAL DO LOGOUT...');
  console.log('=============================');
  
  // 1. Verificar estado atual
  console.log('');
  console.log('📊 1. ESTADO ATUAL:');
  
  const authKeys = ['directAuth_currentUser', 'reactCurrentUser', 'escala_currentUser', 'currentUser'];
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`   ✅ ${key}: ${parsed.name || 'sem nome'} (${parsed.role || 'sem role'})`);
      } catch {
        console.log(`   ❌ ${key}: ${value.length} chars (inválido)`);
      }
    } else {
      console.log(`   ❌ ${key}: vazio`);
    }
  });
  
  // 2. Verificar elementos da UI
  console.log('');
  console.log('📱 2. ELEMENTOS DA UI:');
  
  const loginScreen = document.getElementById('auth-login-screen');
  console.log(`   📊 Tela de login: ${loginScreen ? (loginScreen.style.display === 'none' ? 'escondida' : loginScreen.style.display === 'flex' ? 'visível' : 'estado desconhecido') : 'não encontrada'}`);
  
  const userHeader = document.getElementById('auth-user-header');
  console.log(`   📊 Header usuário: ${userHeader ? (userHeader.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);
  
  const root = document.getElementById('root');
  console.log(`   📊 React root: ${root ? (root.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);
  
  // 3. Verificar se há múltiplas telas de login
  console.log('');
  console.log('🔍 3. VERIFICANDO MÚLTIPLAS TELAS:');
  
  const allLoginScreens = document.querySelectorAll('[id*="login-screen"]');
  console.log(`   📊 Telas de login encontradas: ${allLoginScreens.length}`);
  
  allLoginScreens.forEach((screen, index) => {
    console.log(`   ${index + 1}. ID: ${screen.id}, Display: ${screen.style.display}, Visível: ${screen.offsetWidth > 0 && screen.offsetHeight > 0}`);
  });
  
  // 4. Testar logout manual
  console.log('');
  console.log('🧪 4. TESTE MANUAL DE LOGOUT:');
  console.log('   📋 Executando logout manual...');
  
  // Função de logout definitiva
  window.logoutDefinitivo = function() {
    console.log('🚪 LOGOUT DEFINITIVO INICIADO...');
    
    try {
      // Limpar todos os dados
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`   ✅ Removido: ${key}`);
      });
      
      // Limpar sessionStorage
      sessionStorage.clear();
      console.log('   ✅ SessionStorage limpo');
      
      // Limpar estado dos sistemas
      if (window.DirectAuthManager) {
        window.DirectAuthManager.currentUser = null;
        console.log('   ✅ DirectAuthManager limpo');
      }
      
      if (window.SystemAuthIntegration) {
        window.SystemAuthIntegration.currentUser = null;
        console.log('   ✅ SystemAuthIntegration limpo');
      }
      
      // Disparar evento para React
      try {
        const event = new CustomEvent('externalLogout', {
          detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
        console.log('   ✅ Evento externalLogout disparado');
      } catch (error) {
        console.error('   ❌ Erro ao disparar evento:', error);
      }
      
      // Esconder todos os headers
      const allUserHeaders = document.querySelectorAll('[id*="user-header"]');
      allUserHeaders.forEach(header => {
        header.style.display = 'none';
        console.log('   ✅ Header escondido');
      });
      
      // Esconder React root
      if (root) {
        root.style.display = 'none';
        console.log('   ✅ React root escondido');
      }
      
      // Remover todas as telas de login existentes
      allLoginScreens.forEach(screen => {
        screen.remove();
        console.log('   ✅ Tela de login antiga removida');
      });
      
      // Criar nova tela de login
      criarTelaLoginDefinitiva();
      
      console.log('✅ LOGOUT DEFINITIVO CONCLUÍDO!');
      
      // Forçar reload completo
      setTimeout(() => {
        console.log('🔄 Forçando reload completo...');
        window.location.reload(true);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no logout definitivo:', error);
    }
  };
  
  // Função para criar tela de login definitiva
  function criarTelaLoginDefinitiva() {
    console.log('🔧 CRIANDO TELA DE LOGIN DEFINITIVA...');
    
    // Criar tela de login
    const loginScreen = document.createElement('div');
    loginScreen.id = 'auth-login-screen';
    loginScreen.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 999999 !important;
      backdrop-filter: blur(20px) !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;
    
    loginScreen.innerHTML = `
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
                type="text"
                id="auth-username"
                placeholder="Digite seu nome"
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.75rem; color: #fff; font-size: 1rem; transition: all 0.3s ease; outline: none; placeholder: rgba(255, 255, 255, 0.5);"
                required
              />
            </div>
          </div>
          
          <div style="margin-bottom: 1.75rem;">
            <label for="auth-password" style="display: block; margin-bottom: 0.75rem; color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; font-weight: 500;">
              Senha de Acesso
            </label>
            <div style="position: relative;">
              <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1.25rem; height: 1.25rem; color: rgba(255, 255, 255, 0.55); font-size: 1.1rem;">🔒</span>
              <input
                type="password"
                id="auth-password"
                placeholder="Digite sua senha"
                style="width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 0.75rem; color: #fff; font-size: 1rem; transition: all 0.3s ease; outline: none; placeholder: rgba(255, 255, 255, 0.5);"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            style="width: 100%; padding: 0.875rem 1rem; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #fff; border: none; border-radius: 0.75rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; outline: none; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);"
          >
            Entrar no Sistema
          </button>
        </form>
        
        <!-- Footer -->
        <div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 0.8rem;">
          <p>© 2026 Área Branca SBMI - Todos os direitos reservados</p>
        </div>
      </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(loginScreen);
    
    // Adicionar evento de submit
    const form = loginScreen.querySelector('#auth-login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('auth-username').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        
        if (username && password) {
          console.log('🔐 Tentando login com:', username);
          
          // Usar o DirectAuthManager para fazer login
          if (window.DirectAuthManager && typeof window.DirectAuthManager.login === 'function') {
            const result = await window.DirectAuthManager.login(username, password);
            
            if (result.success) {
              console.log('✅ Login bem-sucedido!');
              // Esconder tela de login
              loginScreen.style.display = 'none';
              // Mostrar conteúdo principal
              const root = document.getElementById('root');
              if (root) {
                root.style.display = '';
              }
            } else {
              console.log('❌ Falha no login:', result.error);
            }
          }
        }
      });
    }
    
    console.log('✅ Tela de login definitiva criada');
  }
  
  // 5. Capturar todos os botões de logout
  console.log('');
  console.log('🔧 5. CAPTURANDO BOTÕES DE LOGOUT:');
  
  const logoutButtons = document.querySelectorAll('button svg.lucide-log-out');
  console.log(`   📊 Botões de logout encontrados: ${logoutButtons.length}`);
  
  logoutButtons.forEach((btn, index) => {
    const button = btn.closest('button');
    if (button && !button.hasAttribute('data-logout-final')) {
      // Remover eventos existentes
      const newBtn = button.cloneNode(true);
      button.parentNode.replaceChild(newBtn, button);
      
      // Adicionar novo evento
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 Botão de logout clicado (versão final)');
        logoutDefinitivo();
      });
      
      // Marcar como corrigido
      newBtn.setAttribute('data-logout-final', 'true');
      newBtn.style.border = '3px solid #dc3545';
      newBtn.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.5)';
      
      console.log(`   ✅ Botão ${index + 1} capturado e corrigido`);
    }
  });
  
  console.log('');
  console.log('🎯 6. RECOMENDAÇÕES:');
  console.log('   📋 Para testar logout: logoutDefinitivo()');
  console.log('   📋 Verificar console para detalhes');
  console.log('   📋 Recarregar página se necessário');
  
}

// Exportar função
window.debugLogoutFinal = debugLogoutFinal;

console.log('🔧 DEBUG FINAL DO LOGOUT CARREGADO!');
console.log('📋 Para usar: debugLogoutFinal()');

// Executar debug automático
setTimeout(() => {
  debugLogoutFinal();
}, 1000);
