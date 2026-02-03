// SCRIPT AUTOMÁTICO - SINCRONIZAR ESCALAS CORRETAS
// Vai executar tudo automaticamente sem precisar colar nada

// Auto-executar quando carregar
(async function autoSincronizarEscalas() {
  console.log('🚀 INICIANDO SINCRONIZAÇÃO AUTOMÁTICA...');
  console.log('====================================');
  
  try {
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    // 1. Verificar estado atual
    console.log('');
    console.log('📱 1. VERIFICANDO ESTADO ATUAL...');
    
    const currentData = localStorage.getItem('escala_scheduleStorage');
    if (currentData) {
      const current = JSON.parse(currentData);
      console.log(`⚠️ LocalStorage atual: ${current.length} escalas`);
    } else {
      console.log('❌ LocalStorage vazio');
    }
    
    // 2. Buscar dados corretos do Supabase
    console.log('');
    console.log('🗄️ 2. BUSCANDO DADOS CORRETOS DO SUPABASE...');
    
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
    console.log(`✅ Encontradas ${schedules.length} escalas no Supabase`);
    
    // 3. Analisar dados encontrados
    console.log('');
    console.log('📊 3. ANALISANDO DADOS ENCONTRADOS...');
    
    let totalDays = 0;
    let totalWithCrew = 0;
    
    schedules.forEach((schedule, index) => {
      const entriesCount = schedule.entries ? schedule.entries.length : 0;
      const withCrew = schedule.entries ? schedule.entries.filter(entry => entry.meioPeriodo || entry.fechamento).length : 0;
      
      totalDays += entriesCount;
      totalWithCrew += withCrew;
      
      console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias (${withCrew} com tripulação)`);
      
      // Mostrar exemplo de tripulação
      if (withCrew > 0 && schedule.entries) {
        const example = schedule.entries.find(entry => entry.meioPeriodo || entry.fechamento);
        if (example) {
          console.log(`      👥 Exemplo: ${example.date} - ${example.meioPeriodo || '---'} / ${example.fechamento || '---'}`);
        }
      }
    });
    
    console.log(`📈 Total: ${totalDays} dias, ${totalWithCrew} com tripulação (${Math.round(totalWithCrew/totalDays*100)}%)`);
    
    // 4. Sincronizar com localStorage
    console.log('');
    console.log('🔄 4. SINCRONIZANDO COM LOCAL STORAGE...');
    
    localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
    
    // 5. Verificar sincronização
    const saved = localStorage.getItem('escala_scheduleStorage');
    const parsed = JSON.parse(saved);
    
    if (parsed.length === schedules.length) {
      console.log('✅ Sincronização bem-sucedida!');
      console.log(`📋 ${parsed.length} escalas salvas no localStorage`);
    } else {
      console.log('❌ Erro na sincronização');
      return;
    }
    
    // 6. Criar patch temporário para redirecionar chamadas
    console.log('');
    console.log('🔧 6. CRIANDO PATCH TEMPORÁRIO...');
    
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const url = args[0];
      
      if (typeof url === 'string' && url.includes('/rest/v1/schedules')) {
        const newUrl = url.replace('/rest/v1/schedules', '/rest/v1/month_schedules');
        console.log('🔄 Redirecionando chamada:', newUrl);
        args[0] = newUrl;
      }
      
      return originalFetch.apply(this, args);
    };
    
    console.log('✅ Patch aplicado - chamadas para /schedules serão redirecionadas');
    
    // 7. Resultado final
    console.log('');
    console.log('🎉 SINCRONIZAÇÃO AUTOMÁTICA CONCLUÍDA!');
    console.log('======================================');
    console.log('✅ Dados corretos sincronizados');
    console.log('✅ Patch temporário aplicado');
    console.log('✅ Sistema pronto para usar');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('   1. Recarregue a página (F5)');
    console.log('   2. As escalas corretas devem aparecer');
    console.log('   3. Se necessário, limpe o cache (Ctrl+Shift+R)');
    console.log('');
    console.log('🔧 CORREÇÃO PERMANENTE:');
    console.log('   - Ainda precisa atualizar o código fonte');
    console.log('   - Substituir "schedules" por "month_schedules"');
    console.log('   - Remover este patch temporário');
    
    // 8. Auto-recarregar após 3 segundos
    console.log('');
    console.log('🔄 A página será recarregada em 3 segundos...');
    
    setTimeout(() => {
      console.log('🔄 Recarregando...');
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro na sincronização automática:', error);
    console.log('💡 Tente manualmente ou verifique a conexão');
  }
})();

console.log('🚀 SCRIPT AUTOMÁTICO CARREGADO!');
console.log('⏳ Executando sincronização automática...');
