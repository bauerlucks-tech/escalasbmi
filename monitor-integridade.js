// MONITOR DE INTEGRIDADE DOS DADOS
// Verifica se algo está alterando os dados do Supabase

(function iniciarMonitorIntegridade() {
  console.log('🔍 INICIANDO MONITOR DE INTEGRIDADE DOS DADOS...');
  console.log('===============================================');
  
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  let lastKnownState = null;
  let monitorInterval = null;
  let isMonitoring = false;
  
  // Função para buscar estado atual do Supabase
  async function buscarEstadoSupabase() {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/month_schedules?select=id,month,year,entries&order=year.desc,month.desc`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }
      
      const schedules = await response.json();
      
      // Criar hash simples para detectar mudanças
      const stateHash = criarHashEstado(schedules);
      
      return {
        schedules: schedules,
        hash: stateHash,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estado do Supabase:', error);
      return null;
    }
  }
  
  // Criar hash simples do estado
  function criarHashEstado(schedules) {
    const stateString = schedules.map(schedule => ({
      id: schedule.id,
      month: schedule.month,
      year: schedule.year,
      entriesCount: schedule.entries ? schedule.entries.length : 0,
      entriesHash: schedule.entries ? criarHashEntries(schedule.entries) : ''
    }));
    
    return btoa(JSON.stringify(stateString));
  }
  
  // Criar hash das entradas
  function criarHashEntries(entries) {
    const entriesString = entries.map(entry => ({
      date: entry.date,
      meioPeriodo: entry.meioPeriodo || '',
      fechamento: entry.fechamento || ''
    }));
    
    return btoa(JSON.stringify(entriesString));
  }
  
  // Verificar integridade
  async function verificarIntegridade() {
    if (isMonitoring) return;
    
    isMonitoring = true;
    
    try {
      const currentState = await buscarEstadoSupabase();
      
      if (!currentState) {
        console.log('❌ Não foi possível buscar estado atual');
        return;
      }
      
      if (!lastKnownState) {
        // Primeira verificação
        lastKnownState = currentState;
        console.log('✅ Estado inicial capturado:');
        console.log(`   📋 ${currentState.schedules.length} escalas`);
        currentState.schedules.forEach((schedule, index) => {
          const entriesCount = schedule.entries ? schedule.entries.length : 0;
          console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias`);
        });
        return;
      }
      
      // Comparar estados
      if (currentState.hash !== lastKnownState.hash) {
        console.log('⚠️ MUDANÇA DETECTADA NO SUPABASE!');
        console.log('====================================');
        
        // Analisar diferenças
        analisarDiferencas(lastKnownState.schedules, currentState.schedules);
        
        // Atualizar estado conhecido
        lastKnownState = currentState;
        
        // Mostrar alerta
        mostrarAlertaMudanca();
      } else {
        console.log('✅ Nenhuma mudança detectada');
      }
      
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
    } finally {
      isMonitoring = false;
    }
  }
  
  // Analisar diferenças entre estados
  function analisarDiferencas(estadoAnterior, estadoAtual) {
    console.log('📊 ANÁLISE DE DIFERENÇAS:');
    console.log('========================');
    
    // Comparar quantidade
    if (estadoAnterior.length !== estadoAtual.length) {
      console.log(`📈 Quantidade mudou: ${estadoAnterior.length} → ${estadoAtual.length}`);
    }
    
    // Encontrar escalas adicionadas/removidas
    const escalasAnteriores = new Map(estadoAnterior.map(s => [`${s.month}/${s.year}`, s]));
    const escalasAtuais = new Map(estadoAtual.map(s => [`${s.month}/${s.year}`, s]));
    
    // Escalas removidas
    for (const [key, escala] of escalasAnteriores) {
      if (!escalasAtuais.has(key)) {
        console.log(`❌ Escala removida: ${escala.month}/${escala.year}`);
      }
    }
    
    // Escalas adicionadas
    for (const [key, escala] of escalasAtuais) {
      if (!escalasAnteriores.has(key)) {
        console.log(`➕ Escala adicionada: ${escala.month}/${escala.year}`);
      }
    }
    
    // Comparar escalas existentes
    for (const [key, escalaAtual] of escalasAtuais) {
      const escalaAnterior = escalasAnteriores.get(key);
      
      if (escalaAnterior) {
        const entradasAnteriores = escalaAnterior.entries || [];
        const entradasAtuais = escalaAtual.entries || [];
        
        if (entradasAnteriores.length !== entradasAtuais.length) {
          console.log(`📝 ${key}: Dias mudaram ${entradasAnteriores.length} → ${entradasAtuais.length}`);
        }
        
        // Encontrar mudanças específicas nas entradas
        const mudancas = [];
        for (let i = 0; i < Math.max(entradasAnteriores.length, entradasAtuais.length); i++) {
          const anterior = entradasAnteriores[i];
          const atual = entradasAtuais[i];
          
          if (!anterior && atual) {
            mudancas.push(`➕ ${atual.date}: ${atual.meioPeriodo || '---'} / ${atual.fechamento || '---'}`);
          } else if (anterior && !atual) {
            mudancas.push(`❌ ${anterior.date}: ${anterior.meioPeriodo || '---'} / ${anterior.fechamento || '---'}`);
          } else if (anterior && atual) {
            const mudouTripulacao = 
              anterior.meioPeriodo !== atual.meioPeriodo || 
              anterior.fechamento !== atual.fechamento;
            
            if (mudouTripulacao) {
              mudancas.push(`🔄 ${atual.date}: ${anterior.meioPeriodo || '---'}/${anterior.fechamento || '---'} → ${atual.meioPeriodo || '---'}/${atual.fechamento || '---'}`);
            }
          }
        }
        
        if (mudancas.length > 0) {
          console.log(`📋 Mudanças em ${key}:`);
          mudancas.slice(0, 5).forEach(mudanca => console.log(`   ${mudanca}`));
          if (mudancas.length > 5) {
            console.log(`   ... e mais ${mudancas.length - 5} mudanças`);
          }
        }
      }
    }
  }
  
  // Mostrar alerta visual
  function mostrarAlertaMudanca() {
    // Criar alerta visual
    let alerta = document.getElementById('integrity-alert');
    
    if (!alerta) {
      alerta = document.createElement('div');
      alerta.id = 'integrity-alert';
      alerta.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10001;
        box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
        animation: pulse 2s infinite;
        pointer-events: none;
      `;
      
      // Adicionar animação
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) scale(1.05); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(alerta);
    }
    
    alerta.textContent = '⚠️ MUDANÇA DETECTADA NO SUPABASE!';
    
    // Esconder após 10 segundos
    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.parentNode.removeChild(alerta);
      }
    }, 10000);
  }
  
  // Interceptar tentativas de escrita no localStorage
  function interceptarEscritaLocalStorage() {
    const originalSetItem = localStorage.setItem;
    
    localStorage.setItem = function(key, value) {
      // Se alguém tentar alterar as escalas no localStorage
      if (key === 'escala_scheduleStorage') {
        console.log('⚠️ TENTATIVA DE ALTERAÇÃO NO LOCAL STORAGE!');
        console.log('🔍 Chave:', key);
        console.log('📝 Valor:', value ? value.length + ' caracteres' : 'null');
        
        // Verificar se é diferente do Supabase
        verificarContraSupabase(value);
      }
      
      return originalSetItem.call(this, key, value);
    };
    
    console.log('✅ Interceptor de localStorage ativado');
  }
  
  // Verificar contra Supabase
  async function verificarContraSupabase(localValue) {
    try {
      const supabaseState = await buscarEstadoSupabase();
      
      if (supabaseState) {
        const localData = JSON.parse(localValue);
        
        // Comparar hashes
        const localHash = criarHashEstado(Array.isArray(localData) ? localData : localData.current || []);
        const supabaseHash = supabaseState.hash;
        
        if (localHash !== supabaseHash) {
          console.log('❌ DADOS DO LOCAL STORAGE DIFEREM DO SUPABASE!');
          console.log('💡 Sobrescrevendo com dados do Supabase...');
          
          // Sobrescrever com dados do Supabase
          setTimeout(() => {
            localStorage.setItem('escala_scheduleStorage', JSON.stringify(supabaseState.schedules));
            console.log('✅ Dados restaurados do Supabase');
          }, 1000);
        } else {
          console.log('✅ Dados consistentes com Supabase');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar contra Supabase:', error);
    }
  }
  
  // Interceptar chamadas fetch para Supabase
  function interceptarChamadasSupabase() {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      // Se for uma chamada para o Supabase
      if (typeof url === 'string' && url.includes('lsxmwwwmgfjwnowlsmzf.supabase.co')) {
        // Se for uma escrita (POST, PUT, DELETE, PATCH)
        if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
          console.log('⚠️ TENTATIVA DE ESCRITA NO SUPABASE!');
          console.log('🌐 URL:', url);
          console.log('📝 Método:', options.method);
          
          // Verificar se está tentando alterar month_schedules
          if (url.includes('/month_schedules')) {
            console.log('🚨 TENTATIVA DE ALTERAR month_schedules!');
            console.log('💡 Isso não deveria acontecer - apenas leitura permitida');
            
            // Poderíamos bloquear aqui, mas por agora apenas alertamos
            mostrarAlertaEscrita(url, options.method);
          }
        }
      }
      
      return originalFetch.apply(this, args);
    };
    
    console.log('✅ Interceptor de chamadas Supabase ativado');
  }
  
  // Mostrar alerta de escrita
  function mostrarAlertaEscrita(url, method) {
    let alerta = document.getElementById('write-alert');
    
    if (!alerta) {
      alerta = document.createElement('div');
      alerta.id = 'write-alert';
      alerta.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        z-index: 10002;
        box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
        max-width: 300px;
        pointer-events: none;
      `;
      document.body.appendChild(alerta);
    }
    
    alerta.innerHTML = `
      <div>🚨 TENTATIVA DE ESCRITA!</div>
      <div style="font-size: 10px; margin-top: 4px;">${method} ${url}</div>
    `;
    
    // Esconder após 5 segundos
    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.parentNode.removeChild(alerta);
      }
    }, 5000);
  }
  
  // Iniciar monitoramento contínuo
  function iniciarMonitoramento() {
    // Verificação inicial
    setTimeout(() => {
      verificarIntegridade();
    }, 2000);
    
    // Verificação a cada 10 segundos
    monitorInterval = setInterval(() => {
      verificarIntegridade();
    }, 10000);
    
    console.log('✅ Monitoramento contínuo iniciado (verificação a cada 10s)');
  }
  
  // Funções de controle
  window.pararMonitorIntegridade = function() {
    if (monitorInterval) {
      clearInterval(monitorInterval);
      monitorInterval = null;
      console.log('⏹️ Monitoramento de integridade parado');
    }
  };
  
  window.verificarIntegridadeAgora = function() {
    console.log('🔍 Verificação manual de integridade...');
    verificarIntegridade();
  };
  
  // Iniciar tudo
  interceptarEscritaLocalStorage();
  interceptarChamadasSupabase();
  iniciarMonitoramento();
  
  console.log('🎉 MONITOR DE INTEGRIDADE ATIVADO!');
  console.log('📋 Funcionalidades:');
  console.log('   ✅ Monitoramento contínuo do Supabase');
  console.log('   ✅ Detecção de mudanças não autorizadas');
  console.log('   ✅ Interceptor de escrita no localStorage');
  console.log('   ✅ Interceptor de chamadas Supabase');
  console.log('   ✅ Alertas visuais de mudanças');
  console.log('');
  console.log('🔧 Controles:');
  console.log('   🔍 verificarIntegridadeAgora() - Verificação manual');
  console.log('   ⏹️ pararMonitorIntegridade() - Parar monitoramento');
  
})();
