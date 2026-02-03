// SINCRONIZAÇÃO AUTOMÁTICA CONTÍNUA
// Atualiza com Supabase a cada click e periodicamente

(function iniciarSincronizacaoContinua() {
  console.log('🔄 INICIANDO SINCRONIZAÇÃO AUTOMÁTICA CONTÍNUA...');
  console.log('==============================================');
  
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  let lastSyncTime = 0;
  let syncInterval = null;
  let isSyncing = false;
  
  // Função principal de sincronização
  async function sincronizarComSupabase() {
    if (isSyncing) {
      console.log('⏳ Sincronização já em andamento...');
      return;
    }
    
    const now = Date.now();
    if (now - lastSyncTime < 1000) { // Máximo 1 sincronização por segundo
      console.log('⏸️ Sincronização muito recente, aguardando...');
      return;
    }
    
    isSyncing = true;
    lastSyncTime = now;
    
    try {
      console.log('🔄 Sincronizando com Supabase...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/month_schedules?select=*&order=year.desc,month.desc`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const schedules = await response.json();
      
      // Salvar no localStorage
      localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
      
      // Disparar evento para atualizar UI
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'escala_scheduleStorage',
        newValue: JSON.stringify(schedules)
      }));
      
      console.log(`✅ Sincronizado! ${schedules.length} escalas atualizadas`);
      
      // Mostrar indicador visual
      mostrarIndicadorSincronizacao();
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    } finally {
      isSyncing = false;
    }
  }
  
  // Mostrar indicador visual de sincronização
  function mostrarIndicadorSincronizacao() {
    // Criar ou atualizar indicador
    let indicator = document.getElementById('sync-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'sync-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);
        transition: all 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.textContent = '✅ Sincronizado';
    indicator.style.background = '#22c55e';
    
    // Esconder após 2 segundos
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 2000);
  }
  
  // Adicionar listener de clique global
  function adicionarListenerCliqueGlobal() {
    document.addEventListener('click', function(event) {
      // Ignorar cliques em inputs, botões de login, etc.
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'BUTTON' ||
          event.target.type === 'submit' ||
          event.target.closest('form')) {
        return;
      }
      
      // Pequeno delay para não interferir na ação do clique
      setTimeout(() => {
        sincronizarComSupabase();
      }, 100);
    }, true); // useCapture para pegar todos os cliques
    
    console.log('✅ Listener de clique global adicionado');
  }
  
  // Adicionar listener de mudanças no localStorage
  function adicionarListenerLocalStorage() {
    // Interceptar mudanças no localStorage
    const originalSetItem = localStorage.setItem;
    
    localStorage.setItem = function(key, value) {
      const result = originalSetItem.call(this, key, value);
      
      // Se for uma alteração nas escalas, sincronizar com Supabase
      if (key === 'escala_scheduleStorage' && value) {
        try {
          const schedules = JSON.parse(value);
          console.log('🔄 Mudança detectada, sincronizando...');
          
          // Aqui poderíamos enviar para o Supabase, mas por enquanto apenas sincronizamos
          setTimeout(() => {
            sincronizarComSupabase();
          }, 500);
        } catch (error) {
          console.error('❌ Erro ao processar mudança:', error);
        }
      }
      
      return result;
    };
    
    console.log('✅ Listener de localStorage adicionado');
  }
  
  // Sincronização periódica
  function iniciarSincronizacaoPeriodica() {
    // Sincronizar a cada 30 segundos
    syncInterval = setInterval(() => {
      console.log('⏰ Sincronização periódica...');
      sincronizarComSupabase();
    }, 30000);
    
    console.log('✅ Sincronização periódica iniciada (30s)');
  }
  
  // Sincronização quando a página ganha foco
  function adicionarListenerFoco() {
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        console.log('👁️ Página ganhou foco, sincronizando...');
        sincronizarComSupabase();
      }
    });
    
    window.addEventListener('focus', function() {
      console.log('🎯 Janela ganhou foco, sincronizando...');
      sincronizarComSupabase();
    });
    
    console.log('✅ Listener de foco adicionado');
  }
  
  // Iniciar todos os listeners
  function iniciarTodosListeners() {
    adicionarListenerCliqueGlobal();
    adicionarListenerLocalStorage();
    adicionarListenerFoco();
    iniciarSincronizacaoPeriodica();
    
    // Sincronização inicial
    setTimeout(() => {
      console.log('🚀 Sincronização inicial...');
      sincronizarComSupabase();
    }, 1000);
  }
  
  // Função para parar sincronização
  window.pararSincronizacao = function() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
      console.log('⏹️ Sincronização periódica parada');
    }
  };
  
  // Função para forçar sincronização
  window.forcarSincronizacao = function() {
    console.log('🔄 Forçando sincronização manual...');
    sincronizarComSupabase();
  };
  
  // Iniciar tudo
  iniciarTodosListeners();
  
  console.log('🎉 SINCRONIZAÇÃO AUTOMÁTICA ATIVADA!');
  console.log('📋 Funcionalidades:');
  console.log('   ✅ Sincronização a cada clique');
  console.log('   ✅ Sincronização periódica (30s)');
  console.log('   ✅ Sincronização ao ganhar foco');
  console.log('   ✅ Listener de mudanças no localStorage');
  console.log('   ✅ Indicador visual de sincronização');
  console.log('');
  console.log('🔧 Controles manuais:');
  console.log('   📱 forcarSincronizacao() - Forçar sincronização');
  console.log('   ⏹️ pararSincronizacao() - Parar sincronização periódica');
  
})();
