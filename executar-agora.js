// EXECUÇÃO MANUAL IMEDIATA
// Execute isso no console AGORA

console.log('🚀 EXECUÇÃO MANUAL IMEDIATA...');
console.log('================================');

(async function executarAgora() {
  try {
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    // 1. Verificar estado atual
    console.log('📱 Estado atual:');
    const currentData = localStorage.getItem('escala_scheduleStorage');
    if (currentData) {
      const current = JSON.parse(currentData);
      console.log(`   LocalStorage: ${current.length} escalas`);
    } else {
      console.log('   LocalStorage: vazio');
    }
    
    // 2. Buscar dados corretos
    console.log('🗄️ Buscando dados do Supabase...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/month_schedules?select=*&order=year.desc,month.desc`, {
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
    console.log(`✅ Encontradas ${schedules.length} escalas`);
    
    // 3. Mostrar exemplos
    schedules.slice(0, 3).forEach((schedule, index) => {
      const entriesCount = schedule.entries ? schedule.entries.length : 0;
      const withCrew = schedule.entries ? schedule.entries.filter(entry => entry.meioPeriodo || entry.fechamento).length : 0;
      console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias (${withCrew} com tripulação)`);
    });
    
    // 4. Sincronizar
    console.log('🔄 Sincronizando com localStorage...');
    localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
    
    // 5. Verificar
    const saved = localStorage.getItem('escala_scheduleStorage');
    const parsed = JSON.parse(saved);
    
    if (parsed.length === schedules.length) {
      console.log('✅ Sincronização bem-sucedida!');
      console.log('🔄 Recarregue a página (F5) para ver as escalas corretas');
    } else {
      console.log('❌ Erro na sincronização');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();

console.log('⏳ Executando...');
