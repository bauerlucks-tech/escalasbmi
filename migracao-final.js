// MIGRAÇÃO CORRIGIDA E SIMPLIFICADA
// Execute no console após o script anterior

async function migrarCorrigido() {
  console.log('🚀 MIGRAÇÃO CORRIGIDA INICIADA');
  console.log('==================================');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  const { createClient } = window.supabase;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // 1. Migrar ESCALAS (principal)
    console.log('');
    console.log('📅 MIGRANDO ESCALAS...');
    const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
    
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      console.log('📊 Encontradas ' + schedules.current.length + ' escalas para migrar');
      
      // Buscar usuário ADMIN
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('name', 'ADMIN')
        .single();
      
      const adminId = adminUser ? adminUser.id : null;
      console.log('👤 Admin ID: ' + adminId);
      
      // Migrar cada escala
      for (let i = 0; i < schedules.current.length; i++) {
        const schedule = schedules.current[i];
        
        try {
          const { error } = await supabase.from('month_schedules').insert({
            month: schedule.month,
            year: schedule.year,
            entries: schedule.entries || [],
            imported_by: adminId,
            imported_at: schedule.importedAt || new Date().toISOString(),
            is_active: schedule.isActive !== false
          });
          
          if (error) {
            console.log('❌ Erro na escala ' + schedule.month + '/' + schedule.year + ': ' + error.message);
          } else {
            console.log('✅ Escala ' + schedule.month + '/' + schedule.year + ' migrada com sucesso');
          }
        } catch (err) {
          console.log('❌ Erro ao migrar escala ' + schedule.month + '/' + schedule.year + ': ' + err.message);
        }
      }
    }
    
    // 2. Migrar USUÁRIOS
    console.log('');
    console.log('👥 MIGRANDO USUÁRIOS...');
    const usersData = localStorage.getItem('escala_users');
    
    if (usersData) {
      const users = JSON.parse(usersData);
      console.log('📊 Encontrados ' + users.length + ' usuários para migrar');
      
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        // Verificar se usuário já existe
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('name', user.name)
          .single();
        
        if (!existingUser) {
          try {
            const { error } = await supabase.from('users').insert({
              name: user.name,
              email: user.email || user.name.toLowerCase() + '@escalas.com',
              password: user.password || '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe',
              role: user.role || 'operador',
              status: user.status || 'ativo',
              hide_from_schedule: user.hideFromSchedule || false
            });
            
            if (error) {
              console.log('❌ Erro no usuário ' + user.name + ': ' + error.message);
            } else {
              console.log('✅ Usuário ' + user.name + ' migrado com sucesso');
            }
          } catch (err) {
            console.log('❌ Erro ao migrar usuário ' + user.name + ': ' + err.message);
          }
        } else {
          console.log('⏭️ Usuário ' + user.name + ' já existe');
        }
      }
    }
    
    // 3. Criar log de migração
    console.log('');
    console.log('📝 CRIANDO LOG DE MIGRAÇÃO...');
    try {
      await supabase.from('audit_logs').insert({
        user_name: 'SYSTEM',
        action: 'MIGRATION_CORRECTED',
        details: 'Migração corrigida concluída - ' + new Date().toISOString()
      });
      console.log('✅ Log de migração criado');
    } catch (err) {
      console.log('❌ Erro ao criar log: ' + err.message);
    }
    
    console.log('');
    console.log('🎉 MIGRAÇÃO CORRIGIDA CONCLUÍDA!');
    console.log('==================================');
    
    // Verificar resultado
    setTimeout(async () => {
      console.log('');
      console.log('🔍 VERIFICANDO RESULTADO...');
      
      const { count: scheduleCount } = await supabase
        .from('month_schedules')
        .select('*', { count: 'exact', head: true });
      
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      console.log('✅ Escalas no Supabase: ' + scheduleCount);
      console.log('✅ Usuários no Supabase: ' + userCount);
      
      if (scheduleCount > 0) {
        console.log('🎊 MIGRAÇÃO BEM-SUCEDIDA!');
      } else {
        console.log('⚠️ VERIFIQUE OS ERROS ACIMA');
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ ERRO GERAL NA MIGRAÇÃO:', error);
  }
}

// Exportar função
window.migrarCorrigido = migrarCorrigido;

console.log('🔧 FUNÇÃO DE MIGRAÇÃO CORRIGIDA CARREGADA!');
console.log('🚀 Para executar: migrarCorrigido()');
