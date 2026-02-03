// VERIFICAR SE ESCALAS ESTÃO SENDO PUXADAS DO SUPABASE
// Script para identificar fonte dos dados

function verificarFonteDasEscalas() {
  console.log('🔍 VERIFICANDO FONTE DAS ESCALAS');
  console.log('================================');
  
  try {
    // 1. Verificar se há código buscando do Supabase
    console.log('');
    console.log('📱 1. VERIFICANDO LOCAL STORAGE...');
    
    const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
    
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      console.log(`✅ Escalas no localStorage: ${schedules.length} meses`);
      
      schedules.forEach((schedule, index) => {
        const entriesCount = schedule.entries ? schedule.entries.length : 0;
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias`);
      });
    } else {
      console.log('❌ Nenhuma escala no localStorage');
    }
    
    // 2. Verificar se há tentativas de conexão com Supabase
    console.log('');
    console.log('🗄️ 2. VERIFICANDO TENTATIVAS DE CONEXÃO COM SUPABASE...');
    
    // Verificar se há chaves do Supabase no localStorage
    const supabaseKeys = [
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.user',
      'sb-auth-token',
      'sb-refresh-token'
    ];
    
    let hasSupabaseAuth = false;
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`✅ ${key}: ${value.length > 50 ? 'presente' : value}`);
        hasSupabaseAuth = true;
      }
    });
    
    if (!hasSupabaseAuth) {
      console.log('❌ Nenhuma chave de autenticação do Supabase encontrada');
    }
    
    // 3. Verificar se há código buscando dados do Supabase
    console.log('');
    console.log('🔍 3. VERIFICANDO SE HÁ CÓDIGO BUSCANDO DO SUPABASE...');
    
    // Verificar se há funções globais que buscam do Supabase
    const globalFunctions = [
      'fetchSchedulesFromSupabase',
      'loadSchedulesFromSupabase',
      'syncWithSupabase',
      'getSupabaseData',
      'loadFromSupabase'
    ];
    
    let hasSupabaseFunctions = false;
    globalFunctions.forEach(funcName => {
      if (window[funcName]) {
        console.log(`✅ Função encontrada: ${funcName}`);
        hasSupabaseFunctions = true;
      }
    });
    
    if (!hasSupabaseFunctions) {
      console.log('❌ Nenhuma função de busca do Supabase encontrada');
    }
    
    // 4. Verificar se há chamadas de rede para Supabase
    console.log('');
    console.log('🌐 4. VERIFICANDO CHAMADAS DE REDE PARA SUPABASE...');
    
    // Verificar se há URLs do Supabase no código
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    
    // Verificar fetch interceptados (se possível)
    if (window.fetch) {
      const originalFetch = window.fetch;
      let supabaseCalls = 0;
      
      // Não vamos modificar o fetch, apenas verificar logs anteriores
      console.log('💡 Verifique o console por chamadas para:', supabaseUrl);
    }
    
    // 5. Verificar se há inicialização de dados que possa vir do Supabase
    console.log('');
    console.log('🔄 5. VERIFICANDO INICIALIZAÇÃO DE DADOS...');
    
    // Verificar se há dados que parecem vir de banco vs localStorage
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      
      // Indicadores de dados do Supabase
      let supabaseIndicators = [];
      
      schedules.forEach(schedule => {
        // Verificar se há IDs que parecem do Supabase
        if (schedule.id && typeof schedule.id === 'string' && schedule.id.length > 20) {
          supabaseIndicators.push(`ID longo em ${schedule.month}/${schedule.year}`);
        }
        
        // Verificar se há timestamps created_at/updated_at
        if (schedule.created_at || schedule.updated_at) {
          supabaseIndicators.push(`Timestamps em ${schedule.month}/${schedule.year}`);
        }
        
        // Verificar se há estrutura de dados do Supabase
        if (schedule.entries && Array.isArray(schedule.entries)) {
          const hasSupabaseIds = schedule.entries.some(entry => 
            entry.id && typeof entry.id === 'string' && entry.id.length > 20
          );
          
          if (hasSupabaseIds) {
            supabaseIndicators.push(`IDs de entradas em ${schedule.month}/${schedule.year}`);
          }
        }
      });
      
      if (supabaseIndicators.length > 0) {
        console.log('⚠️ INDICADORES DE DADOS DO SUPABASE:');
        supabaseIndicators.forEach(indicator => console.log(`   📍 ${indicator}`));
      } else {
        console.log('✅ Dados parecem ser apenas do localStorage');
      }
    }
    
    // 6. Verificar se há código de inicialização que busca do Supabase
    console.log('');
    console.log('🔍 6. VERIFICANDO CÓDIGO DE INICIALIZAÇÃO...');
    
    // Verificar se há useEffect ou similar que busca dados
    console.log('💡 Verifique no código React por:');
    console.log('   - useEffect(() => { ... fetch(supabaseUrl) ... }, [])');
    console.log('   - useState com dados do Supabase');
    console.log('   - Funções de load/sync no componentDidMount');
    
    // 7. Testar conexão direta com Supabase
    console.log('');
    console.log('🧪 7. TESTANDO CONEXÃO DIRETA COM SUPABASE...');
    
    testarConexaoSupabase();
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Função para testar conexão com Supabase
async function testarConexaoSupabase() {
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  try {
    console.log('🌐 Testando conexão com Supabase...');
    
    // Testar se a tabela schedules existe
    const schedulesResponse = await fetch(`${supabaseUrl}/rest/v1/schedules?select=count&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (schedulesResponse.ok) {
      console.log('✅ Tabela schedules existe e está acessível');
      
      // Buscar dados reais
      const dataResponse = await fetch(`${supabaseUrl}/rest/v1/schedules?select=*`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (dataResponse.ok) {
        const schedules = await dataResponse.json();
        console.log(`✅ Encontradas ${schedules.length} escalas no Supabase`);
        
        if (schedules.length > 0) {
          console.log('📋 Escalas no Supabase:');
          schedules.forEach((schedule, index) => {
            const entriesCount = schedule.entries ? schedule.entries.length : 0;
            console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias`);
          });
          
          // Comparar com localStorage
          const localSchedules = localStorage.getItem('escala_scheduleStorage');
          if (localSchedules) {
            const local = JSON.parse(localSchedules);
            console.log('');
            console.log('🔄 COMPARAÇÃO:');
            console.log(`📱 LocalStorage: ${local.length} escalas`);
            console.log(`🗄️ Supabase: ${schedules.length} escalas`);
            
            if (local.length !== schedules.length) {
              console.log('⚠️ Quantidade diferente - possível sincronização');
            } else {
              console.log('✅ Mesma quantidade - dados podem estar sincronizados');
            }
          }
        } else {
          console.log('❌ Nenhuma escala encontrada no Supabase');
        }
      } else {
        console.log('❌ Erro ao buscar dados do Supabase:', dataResponse.status);
      }
    } else {
      console.log('❌ Tabela schedules não existe ou não está acessível');
      console.log('Status:', schedulesResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar conexão com Supabase:', error);
  }
}

// Função para monitorar chamadas de rede
function monitorarChamadasSupabase() {
  console.log('🌐 MONITORANDO CHAMADAS PARA SUPABASE...');
  console.log('======================================');
  
  // Interceptar fetch para monitorar chamadas do Supabase
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('lsxmwwwmgfjwnowlsmzf.supabase.co')) {
      console.log('🌐 Chamada para Supabase detectada:', url);
      
      // Logar método e headers
      const options = args[1] || {};
      console.log('   Método:', options.method || 'GET');
      
      if (options.headers) {
        console.log('   Headers:', Object.keys(options.headers));
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Monitoramento de chamadas do Supabase ativado');
  console.log('💡 Execute algumas ações no sistema e veja se há chamadas para o Supabase');
}

// Função para verificar se há código React buscando do Supabase
function verificarCodigoReactSupabase() {
  console.log('⚛️ VERIFICANDO CÓDIGO REACT...');
  console.log('=============================');
  
  console.log('💡 Verifique manualmente no código React por:');
  console.log('');
  console.log('1. IMPORTAÇÕES DO SUPABASE:');
  console.log('   import { createClient } from "@supabase/supabase-js"');
  console.log('   import { supabase } from "@/lib/supabase"');
  console.log('');
  console.log('2. CHAMADAS DIRETAS:');
  console.log('   supabase.from("schedules").select("*")');
  console.log('   supabase.from("users").select("*")');
  console.log('');
  console.log('3. USEEFFECT COM DADOS:');
  console.log('   useEffect(() => {');
  console.log('     const fetchData = async () => {');
  console.log('       const { data } = await supabase...');
  console.log('       setData(data);');
  console.log('     };');
  console.log('     fetchData();');
  console.log('   }, []);');
  console.log('');
  console.log('4. FUNÇÕES DE SYNC:');
  console.log('   const syncData = async () => { ... }');
  console.log('   const loadData = async () => { ... }');
}

// Exportar funções
window.verificarFonteDasEscalas = verificarFonteDasEscalas;
window.testarConexaoSupabase = testarConexaoSupabase;
window.monitorarChamadasSupabase = monitorarChamadasSupabase;
window.verificarCodigoReactSupabase = verificarCodigoReactSupabase;

console.log('🔧 FERRAMENTAS DE VERIFICAÇÃO DO SUPABASE CARREGADAS!');
console.log('📋 Para verificar fonte: verificarFonteDasEscalas()');
console.log('🧪 Para testar conexão: testarConexaoSupabase()');
console.log('🌐 Para monitorar chamadas: monitorarChamadasSupabase()');
console.log('⚛️ Para verificar código React: verificarCodigoReactSupabase()');
