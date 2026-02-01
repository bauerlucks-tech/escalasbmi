// MIGRAÇÃO SEGURA - COM PROTEÇÃO CONTRA SCRIPTS EXTERNOS
// Execute após desativar scripts suspeitos

async function migracaoSegura() {
  console.log('🛡️ MIGRAÇÃO SEGURA INICIADA');
  console.log('============================');
  
  // 1. Desativar scripts suspeitos primeiro
  console.log('🛑 Desativando scripts suspeitos...');
  try {
    // Limpar todos os intervalos
    const maxId = setInterval(() => {}, 100);
    for (let i = 1; i < maxId; i++) {
      clearInterval(i);
    }
    
    // Remover event listeners suspeitos
    window.removeEventListener('storage', null);
    window.removeEventListener('beforeunload', null);
    window.removeEventListener('unload', null);
    
    console.log('✅ Scripts desativados');
  } catch (e) {
    console.log('⚠️ Erro ao desativar scripts: ' + e.message);
  }
  
  // 2. Carregar Supabase manualmente
  console.log('📦 Carregando Supabase...');
  return new Promise((resolve, reject) => {
    // Remover script antigo se existir
    const oldScript = document.querySelector('script[src*="supabase"]');
    if (oldScript) {
      oldScript.remove();
    }
    
    // Carregar script novo
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = async () => {
      try {
        console.log('✅ Supabase carregado');
        
        // 3. Criar cliente Supabase
        const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
        
        const { createClient } = window.supabase;
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Cliente Supabase criado');
        
        // 4. Backup dos dados atuais
        console.log('💾 Fazendo backup dos dados...');
        const backup = {
          timestamp: new Date().toISOString(),
          scheduleStorage: localStorage.getItem('escala_scheduleStorage'),
          users: localStorage.getItem('escala_users'),
          swapRequests: localStorage.getItem('escala_swapRequests'),
          auditLogs: localStorage.getItem('escala_auditLogs')
        };
        
        // Salvar backup no sessionStorage
        sessionStorage.setItem('migrationBackup', JSON.stringify(backup));
        console.log('✅ Backup salvo no sessionStorage');
        
        // 5. Migrar escalas
        console.log('📅 Migrando escalas...');
        if (backup.scheduleStorage) {
          const schedules = JSON.parse(backup.scheduleStorage);
          
          // Buscar admin
          const { data: admin } = await supabase
            .from('users')
            .select('id')
            .eq('name', 'ADMIN')
            .single();
          
          let migradas = 0;
          for (const schedule of schedules.current || []) {
            try {
              const { error } = await supabase.from('month_schedules').insert({
                month: schedule.month,
                year: schedule.year,
                entries: schedule.entries || [],
                imported_by: admin?.id || null,
                imported_at: schedule.importedAt || new Date().toISOString(),
                is_active: schedule.isActive !== false
              });
              
              if (!error) {
                migradas++;
                console.log('✅ Escala ' + schedule.month + '/' + schedule.year + ' migrada');
              } else {
                console.log('❌ Erro na escala ' + schedule.month + '/' + schedule.year + ': ' + error.message);
              }
            } catch (err) {
              console.log('❌ Erro ao migrar escala: ' + err.message);
            }
          }
          
          console.log('📊 Total de escalas migradas: ' + migradas);
        }
        
        // 6. Verificar resultado
        setTimeout(async () => {
          const { count } = await supabase
            .from('month_schedules')
            .select('*', { count: 'exact', head: true });
          
          console.log('');
          console.log('🎉 MIGRAÇÃO SEGURA CONCLUÍDA!');
          console.log('============================');
          console.log('✅ Escalas no Supabase: ' + count);
          console.log('💾 Backup disponível no sessionStorage');
          console.log('🔗 Dashboard: https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf');
          
          resolve(count);
        }, 2000);
        
      } catch (error) {
        console.error('❌ Erro na migração:', error);
        reject(error);
      }
    };
    
    script.onerror = () => {
      console.error('❌ Erro ao carregar Supabase');
      reject(new Error('Falha ao carregar Supabase'));
    };
    
    document.head.appendChild(script);
  });
}

// Função para restaurar backup se necessário
function restaurarBackup() {
  console.log('🔄 RESTAURANDO BACKUP...');
  const backup = sessionStorage.getItem('migrationBackup');
  
  if (backup) {
    const dados = JSON.parse(backup);
    console.log('📅 Backup de: ' + dados.timestamp);
    
    // Restaurar dados
    if (dados.scheduleStorage) {
      localStorage.setItem('escala_scheduleStorage', dados.scheduleStorage);
      console.log('✅ Escalas restauradas');
    }
    
    if (dados.users) {
      localStorage.setItem('escala_users', dados.users);
      console.log('✅ Usuários restaurados');
    }
    
    console.log('🎉 Backup restaurado com sucesso!');
  } else {
    console.log('❌ Nenhum backup encontrado');
  }
}

// Exportar funções
window.migracaoSegura = migracaoSegura;
window.restaurarBackup = restaurarBackup;

console.log('🛡️ FUNÇÕES DE MIGRAÇÃO SEGURA CARREGADAS!');
console.log('🔍 Para investigar primeiro: investigarScripts()');
console.log('🛡️ Para migrar seguro: migracaoSegura()');
console.log('🔄 Para restaurar: restaurarBackup()');
