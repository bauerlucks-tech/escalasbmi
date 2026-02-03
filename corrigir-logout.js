// CORRIGIR LOGOFF - VERSÃO SIMPLIFICADA
// Script para garantir que logout funcione corretamente

(function corrigirLogout() {
  console.log('🔧 CORRIGINDO FUNÇÃO DE LOGOUT');
  console.log('================================');
  
  // 1. Verificar se DirectAuthManager está disponível
  console.log('');
  console.log('🔧 1. VERIFICANDO DirectAuthManager:');
  
  if (window.DirectAuthManager) {
    console.log('   ✅ DirectAuthManager disponível');
    
    // Verificar se tem método logout
    if (typeof window.DirectAuthManager.logout === 'function') {
      console.log('   ✅ Método logout encontrado');
      
      // Substituir método logout
      const originalLogout = window.DirectAuthManager.logout;
      
      window.DirectAuthManager.logout = async function() {
        console.log('🚪 EXECUTANDO LOGOUT CORRIGIDO...');
        
        try {
          // Limpar todos os dados de autenticação
          localStorage.removeItem('directAuth_currentUser');
          localStorage.removeItem('reactCurrentUser');
          localStorage.removeItem('escala_currentUser');
          localStorage.removeItem('currentUser');
          
          // Limpar cache de escalas
          localStorage.removeItem('escala_scheduleStorage');
          localStorage.removeItem('escala_scheduleData');
          localStorage.removeItem('escala_currentSchedules');
          localStorage.removeItem('escala_archivedSchedules');
          
          console.log('🧹 Cache limpo');
          
          // Limpar estado interno
          this.currentUser = null;
          
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
          
          console.log('✅ Logout concluído');
          
          // Forçar reload completo
          console.log('🔄 Forçando reload completo...');
          window.location.reload(true);
          
          return { success: true };
          
        } catch (error) {
          console.error('❌ Erro no logout:', error);
          return { success: false, error: error.message };
        }
      };
      
      console.log('✅ Método logout substituído com sucesso');
      
    } else {
      console.log('   ❌ Método logout não encontrado');
      
      // Adicionar método logout
      window.DirectAuthManager.logout = async function() {
        console.log('🚪 EXECUTANDO LOGOUT (MÉTODO ADICIONADO)...');
        
        // Limpar dados
        localStorage.removeItem('directAuth_currentUser');
        localStorage.removeItem('reactCurrentUser');
        localStorage.removeItem('escala_currentUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('escala_scheduleStorage');
        localStorage.removeItem('escala_scheduleData');
        localStorage.removeItem('escala_currentSchedules');
        localStorage.removeItem('escala_archivedSchedules');
        
        this.currentUser = null;
        
        // Disparar evento
        try {
          const event = new CustomEvent('externalLogout', {
            detail: { timestamp: new Date().toISOString() }
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('❌ Erro ao disparar evento:', error);
        }
        
        console.log('✅ Logout concluído');
        window.location.reload(true);
        
        return { success: true };
      };
      
      console.log('✅ Método logout adicionado');
    }
    
  } else {
    console.log('   ❌ DirectAuthManager não encontrado');
    
    // Criar DirectAuthManager básico
    window.DirectAuthManager = {
      currentUser: null,
      logout: async function() {
        console.log('🚪 EXECUTANDO LOGOUT (DirectAuthManager criado)...');
        
        // Limpar tudo
        localStorage.removeItem('directAuth_currentUser');
        localStorage.removeItem('reactCurrentUser');
        localStorage.removeItem('escala_currentUser');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('escala_scheduleStorage');
        localStorage.removeItem('escala_scheduleData');
        localStorage.removeItem('escala_currentSchedules');
        localStorage.removeItem('escala_archivedSchedules');
        
        this.currentUser = null;
        
        // Disparar evento
        try {
          const event = new CustomEvent('externalLogout', {
            detail: { timestamp: new Date().toISOString() }
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('❌ Erro ao disparar evento:', error);
        }
        
        console.log('✅ Logout concluído');
        window.location.reload(true);
        
        return { success: true };
      }
    };
    
    console.log('✅ DirectAuthManager básico criado');
  }
  
  // 2. Verificar se SystemAuthIntegration está disponível
  console.log('');
  console.log('🔧 2. VERIFICANDO SystemAuthIntegration:');
  
  if (window.SystemAuthIntegration) {
    console.log('   ✅ SystemAuthIntegration disponível');
    
    // Adicionar botão de logout se não existir
    if (!document.getElementById('logout-btn-corrigido')) {
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'logout-btn-corrigido';
      logoutBtn.textContent = 'Sair (Corrigido)';
      logoutBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #dc3545;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        z-index: 10000;
      `;
      
      logoutBtn.addEventListener('click', async () => {
        console.log('🚪 Botão de logout corrigido clicado');
        await window.DirectAuthManager.logout();
      });
      
      document.body.appendChild(logoutBtn);
      console.log('✅ Botão de logout corrigido adicionado');
    }
    
  } else {
    console.log('   ❌ SystemAuthIntegration não encontrado');
  }
  
  // 3. Verificar se há botões de logout existentes
  console.log('');
  console.log('🔧 3. VERIFICANDO BOTÕES DE LOGOUT:');
  
  const logoutButtons = document.querySelectorAll('button[id*="logout"], button[id*="sair"]');
  console.log(`   📊 Botões de logout encontrados: ${logoutButtons.length}`);
  
  logoutButtons.forEach((btn, index) => {
    console.log(`   ${index + 1}. ID: ${btn.id || 'sem-id'}, Texto: ${btn.textContent || 'vazio'}`);
    
    // Adicionar evento de logout corrigido
    if (!btn.hasAttribute('data-logout-fixed')) {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 Botão de logout clicado (corrigido)');
        await window.DirectAuthManager.logout();
      });
      btn.setAttribute('data-logout-fixed', 'true');
      console.log(`   ✅ Evento corrigido adicionado ao botão ${index + 1}`);
    }
  });
  
  console.log('');
  console.log('🎯 4. TESTE MANUAL:');
  console.log('   📋 Para testar logout: testarLogoutCorrigido()');
  console.log('   📋 Ou clique no botão vermelho "Sair (Corrigido)"');
  
});

// Função para testar logout
async function testarLogoutCorrigido() {
  console.log('🧪 TESTANDO LOGOUT CORRIGIDO...');
  console.log('==============================');
  
  if (window.DirectAuthManager && typeof window.DirectAuthManager.logout === 'function') {
    console.log('📝 Executando logout...');
    const result = await window.DirectAuthManager.logout();
    console.log('📊 Resultado:', result.success ? '✅ Sucesso' : '❌ Falha');
  } else {
    console.log('❌ DirectAuthManager.logout não disponível');
  }
}

// Exportar funções
window.corrigirLogout = corrigirLogout;
window.testarLogoutCorrigido = testarLogoutCorrigido;

console.log('🔧 FERRAMENTA DE CORREÇÃO DE LOGOUT CARREGADA!');
console.log('📋 Para usar: corrigirLogout()');
console.log('📋 Para testar: testarLogoutCorrigido()');

// Executar correção automaticamente
setTimeout(() => {
  corrigirLogout();
}, 1000);
