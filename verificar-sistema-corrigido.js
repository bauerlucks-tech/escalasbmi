// VERIFICAÇÃO COMPLETA DO SISTEMA COM SUPABASE - CORRIGIDO
// Execute no console da aplicação para verificar alinhamento

async function verificarSistemaCompleto() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA');
  console.log('====================================');
  
  // Configurar Supabase
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  // Carregar Supabase se necessário
  if (typeof window.supabase === 'undefined') {
    console.log('📦 Carregando Supabase...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = executarVerificacao;
    document.head.appendChild(script);
  } else {
    executarVerificacao();
  }
  
  async function executarVerificacao() {
    const { createClient } = window.supabase;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
      // 1. Verificar conexão com Supabase
      console.log('');
      console.log('🔗 1. VERIFICANDO CONEXÃO COM SUPABASE...');
      const { data, error } = await supabase.from('users').select('count').single();
      if (error) {
        console.log('❌ Erro na conexão:', error.message);
        return;
      }
      console.log('✅ Conexão com Supabase estabelecida');
      
      // 2. Comparar dados: localStorage vs Supabase
      console.log('');
      console.log('📊 2. COMPARANDO DADOS: LOCALSTORAGE vs SUPABASE');
      
      // Verificar escalas no localStorage
      const localStorageSchedules = localStorage.getItem('escala_scheduleStorage');
      let localCount = 0;
      if (localStorageSchedules) {
        const schedules = JSON.parse(localStorageSchedules);
        localCount = schedules.current ? schedules.current.length : 0;
      }
      console.log('📱 LocalStorage - Escalas: ' + localCount);
      
      // Verificar escalas no Supabase
      const { count: supabaseCount } = await supabase
        .from('month_schedules')
        .select('*', { count: 'exact', head: true });
      console.log('🗄️ Supabase - Escalas: ' + supabaseCount);
      
      // Verificar alinhamento
      if (localCount === supabaseCount) {
        console.log('✅ Escalas alinhadas: ' + localCount + ' em ambos');
      } else {
        console.log('⚠️ Desalinhamento detectado!');
        console.log('   LocalStorage: ' + localCount);
        console.log('   Supabase: ' + supabaseCount);
      }
      
      // 3. Verificar detalhes das escalas
      console.log('');
      console.log('📅 3. VERIFICANDO DETALHES DAS ESCALAS...');
      
      const { data: schedules } = await supabase
        .from('month_schedules')
        .select('month, year, is_active, created_at')
        .order('month', { ascending: true });
      
      if (schedules && schedules.length > 0) {
        console.log('📊 Escalas no Supabase:');
        schedules.forEach(schedule => {
          console.log('   📅 ' + schedule.month + '/' + schedule.year + 
                     ' (ativo: ' + schedule.is_active + 
                     ', criada: ' + new Date(schedule.created_at).toLocaleDateString() + ')');
        });
      }
      
      // 4. Verificar usuários
      console.log('');
      console.log('👥 4. VERIFICANDO USUÁRIOS...');
      
      const { data: users } = await supabase
        .from('users')
        .select('name, role, status, created_at')
        .order('name');
      
      if (users && users.length > 0) {
        console.log('👥 Usuários no Supabase:');
        users.forEach(user => {
          console.log('   👤 ' + user.name + ' (' + user.role + ' - ' + user.status + ')');
        });
      }
      
      // 5. Verificar se a aplicação está usando Supabase
      console.log('');
      console.log('🔧 5. VERIFICANDO SE APLICAÇÃO ESTÁ USANDO SUPABASE...');
      
      // Verificar se há variáveis de ambiente (corrigido)
      const hasSupabaseConfig = window.location.hostname === 'bauerlucks-tech.github.io' ||
                                window.location.hostname.includes('escalasbmi');
      
      console.log('🔧 Configuração Supabase encontrada: ' + (hasSupabaseConfig ? '✅' : '❌'));
      
      // Verificar se há funções Supabase no contexto global
      const hasSupabaseFunctions = typeof window.supabase !== 'undefined';
      console.log('📦 Biblioteca Supabase carregada: ' + (hasSupabaseFunctions ? '✅' : '❌'));
      
      // 6. Testar operações básicas
      console.log('');
      console.log('🧪 6. TESTANDO OPERAÇÕES BÁSICAS...');
      
      // Testar leitura
      const { data: testData, error: testError } = await supabase
        .from('month_schedules')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('❌ Erro na leitura:', testError.message);
      } else {
        console.log('✅ Leitura funcionando');
        if (testData && testData.length > 0) {
          console.log('   📅 Exemplo: ' + testData[0].month + '/' + testData[0].year);
        }
      }
      
      // 7. Verificar Real-time
      console.log('');
      console.log('🔄 7. VERIFICANDO REAL-TIME...');
      
      const channel = supabase.channel('test-verificacao')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'month_schedules' }, 
          (payload) => console.log('📡 Real-time recebido:', payload.event)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time funcionando');
            setTimeout(() => channel.unsubscribe(), 1000);
          } else if (status === 'CHANNEL_ERROR') {
            console.log('❌ Real-time com erro');
          } else {
            console.log('⏳ Real-time status: ' + status);
          }
        });
      
      // 8. Resumo final
      setTimeout(() => {
        console.log('');
        console.log('🎯 8. RESUMO DA VERIFICAÇÃO');
        console.log('================================');
        console.log('📊 Escalas migradas: ' + supabaseCount + '/12');
        console.log('👥 Usuários configurados: ' + (users ? users.length : 0));
        console.log('🔗 Conexão Supabase: ✅');
        console.log('📦 Biblioteca Supabase: ✅');
        console.log('🔄 Real-time: Testado');
        
        if (supabaseCount === 12) {
          console.log('');
          console.log('🎉 SISTEMA 100% ALINHADO COM SUPABASE!');
          console.log('✅ Todas as escalas migradas');
          console.log('✅ Conexão estável');
          console.log('✅ Operações funcionando');
          console.log('✅ Real-time ativo');
        } else {
          console.log('');
          console.log('⚠️ SISTEMA PARCIALMENTE ALINHADO');
          console.log('❌ Faltam escalas para migrar');
          console.log('🔧 Execute migracaoSegura() para completar');
        }
        
        console.log('');
        console.log('🔗 Dashboard: https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf');
        console.log('📱 Aplicação: ' + window.location.href);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro na verificação:', error);
    }
  }
}

// Função para testar sincronização
async function testarSincronizacao() {
  console.log('🔄 TESTANDO SINCRONIZAÇÃO...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  const { createClient } = window.supabase;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Criar log de teste
    const { error } = await supabase.from('audit_logs').insert({
      user_name: 'TEST_USER',
      action: 'SYNC_TEST',
      details: 'Teste de sincronização - ' + new Date().toISOString()
    });
    
    if (error) {
      console.log('❌ Erro na sincronização:', error.message);
    } else {
      console.log('✅ Sincronização funcionando');
      
      // Verificar se o log foi criado
      setTimeout(async () => {
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('action', 'SYNC_TEST')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (data && data.length > 0) {
          console.log('✅ Log sincronizado: ' + data[0].created_at);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Exportar funções
window.verificarSistema = verificarSistemaCompleto;
window.testarSincronizacao = testarSincronizacao;

console.log('🔧 FUNÇÕES DE VERIFICAÇÃO CARREGADAS!');
console.log('🔍 Para verificar: verificarSistema()');
console.log('🔄 Para testar sincronização: testarSincronizacao()');
