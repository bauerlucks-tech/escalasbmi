// SCRIPT DE MIGRAÇÃO CORRIGIDO - LOCALSTORAGE PARA SUPABASE
// Execute no console do navegador na sua aplicação

async function migrarParaSupabase() {
  console.log('🚀 INICIANDO MIGRAÇÃO PARA SUPABASE');
  console.log('========================================');
  
  // Configurar Supabase
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  // Carregar Supabase se necessário
  if (typeof window.supabase === 'undefined') {
    console.log('📦 Carregando Supabase...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = executarMigracao;
    document.head.appendChild(script);
  } else {
    executarMigracao();
  }
  
  async function executarMigracao() {
    const { createClient } = window.supabase;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    try {
      // 1. Migrar Escalas
      console.log('');
      console.log('📅 MIGRANDO ESCALAS...');
      const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
      if (scheduleStorage) {
        const schedules = JSON.parse(scheduleStorage);
        
        if (schedules.current && schedules.current.length > 0) {
          for (const schedule of schedules.current) {
            try {
              // Buscar usuário que importou
              const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('name', schedule.importedBy || 'ADMIN')
                .limit(1);
              
              const importedBy = users && users.length > 0 ? users[0].id : null;
              
              await supabase.from('month_schedules').insert({
                month: schedule.month,
                year: schedule.year,
                entries: schedule.entries || [],
                imported_by: importedBy,
                imported_at: schedule.importedAt || new Date().toISOString(),
                is_active: schedule.isActive !== false
              });
              
              console.log('✅ Escala ' + schedule.month + '/' + schedule.year + ' migrada');
            } catch (error) {
              console.log('⚠️ Erro na escala ' + schedule.month + '/' + schedule.year + ': ' + error.message);
            }
          }
        }
      }
      
      // 2. Migrar Solicitações de Troca
      console.log('');
      console.log('🔄 MIGRANDO TROCAS...');
      const swapRequests = localStorage.getItem('escala_swapRequests');
      if (swapRequests) {
        const swaps = JSON.parse(swapRequests);
        
        if (Array.isArray(swaps) && swaps.length > 0) {
          for (const swap of swaps) {
            try {
              await supabase.from('swap_requests').insert({
                requester_id: null,
                target_id: null,
                original_date: swap.originalDate,
                original_shift: swap.originalShift,
                target_date: swap.targetDate,
                target_shift: swap.targetShift,
                status: swap.status || 'pending',
                responded_at: swap.respondedAt,
                responded_by: swap.respondedBy,
                admin_approved: swap.adminApproved,
                admin_approved_at: swap.adminApprovedAt,
                admin_approved_by: swap.adminApprovedBy,
                created_at: swap.createdAt || new Date().toISOString()
              });
              
              console.log('✅ Troca ' + swap.originalDate + ' migrada');
            } catch (error) {
              console.log('⚠️ Erro na troca ' + swap.originalDate + ': ' + error.message);
            }
          }
        }
      }
      
      // 3. Migrar Férias
      console.log('');
      console.log('🏖️ MIGRANDO FÉRIAS...');
      const vacations = localStorage.getItem('escala_vacations');
      if (vacations) {
        const vacationData = JSON.parse(vacations);
        
        if (vacationData.requests && Array.isArray(vacationData.requests)) {
          for (const vacation of vacationData.requests) {
            try {
              await supabase.from('vacation_requests').insert({
                operator_id: null,
                start_date: vacation.startDate,
                end_date: vacation.endDate,
                total_days: vacation.totalDays,
                reason: vacation.reason,
                status: vacation.status || 'pending',
                requested_at: vacation.requestedAt || new Date().toISOString(),
                approved_by: vacation.approvedBy,
                approved_at: vacation.approvedAt,
                rejection_reason: vacation.rejectionReason,
                month: vacation.month,
                year: vacation.year
              });
              
              console.log('✅ Férias ' + vacation.startDate + ' migradas');
            } catch (error) {
              console.log('⚠️ Erro nas férias ' + vacation.startDate + ': ' + error.message);
            }
          }
        }
      }
      
      // 4. Criar Log de Auditoria
      console.log('');
      console.log('📝 CRIANDO LOG DE MIGRAÇÃO...');
      await supabase.from('audit_logs').insert({
        user_name: 'SYSTEM',
        action: 'MIGRATION',
        details: 'Migração do localStorage para Supabase concluída com sucesso'
      });
      
      console.log('');
      console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('========================================');
      console.log('📊 Verifique no dashboard Supabase os dados migrados');
      console.log('🔗 https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf');
      
    } catch (error) {
      console.error('❌ Erro na migração:', error);
    }
  }
}

// Função para verificar dados migrados
async function verificarDadosMigrados() {
  console.log('🔍 VERIFICANDO DADOS MIGRADOS...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  const { createClient } = window.supabase;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const tabelas = ['users', 'month_schedules', 'swap_requests', 'vacation_requests', 'audit_logs'];
  
  for (const tabela of tabelas) {
    const { count, error } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ ' + tabela + ': ' + error.message);
    } else {
      console.log('✅ ' + tabela + ': ' + count + ' registros');
    }
  }
}

// Exportar funções
window.migrarParaSupabase = migrarParaSupabase;
window.verificarMigracao = verificarDadosMigrados;

console.log('🔧 FUNÇÕES DE MIGRAÇÃO CARREGADAS!');
console.log('🚀 Para migrar: migrarParaSupabase()');
console.log('🔍 Para verificar: verificarMigracao()');
