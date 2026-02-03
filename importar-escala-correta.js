// IMPORTAÇÃO DE ESCALA CORRETA E VERIFICAÇÃO DO BANCO
// Script para importar escala atualizada e verificar alinhamento

async function importarEscalaCorreta() {
  console.log('📊 IMPORTANDO ESCALA CORRETA');
  console.log('=============================');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    // 1. VERIFICAR ESTADO ATUAL DO BANCO
    console.log('');
    console.log('📋 1. VERIFICANDO ESTADO ATUAL DO BANCO...');
    
    const [schedulesResponse, usersResponse] = await Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/month_schedules?select=month,year,created_at&order=month', {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
      }),
      fetch(SUPABASE_URL + '/rest/v1/users?select=name,role&order=name', {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
      })
    ]);
    
    const schedules = await schedulesResponse.json();
    const users = await usersResponse.json();
    
    console.log('📅 Escalas atuais no Supabase:');
    schedules.forEach(schedule => {
      console.log('   📅 ' + schedule.month + '/' + schedule.year + ' (criada: ' + new Date(schedule.created_at).toLocaleDateString() + ')');
    });
    
    console.log('👥 Usuários atuais no Supabase:');
    users.forEach(user => {
      console.log('   👤 ' + user.name + ' (' + user.role + ')');
    });
    
    // 2. VERIFICAR ESCALA NO LOCALSTORAGE
    console.log('');
    console.log('📱 2. VERIFICANDO ESCALA NO LOCALSTORAGE...');
    
    const localStorageSchedules = localStorage.getItem('escala_scheduleStorage');
    if (localStorageSchedules) {
      const schedulesData = JSON.parse(localStorageSchedules);
      console.log('📊 Escalas no LocalStorage:');
      
      if (schedulesData.current && schedulesData.current.length > 0) {
        schedulesData.current.forEach((schedule, index) => {
          console.log('   📅 Escala ' + (index + 1) + ': ' + schedule.month + '/' + schedule.year);
          console.log('      - Entradas: ' + (schedule.entries ? schedule.entries.length : 0));
          console.log('      - Ativa: ' + schedule.isActive);
          console.log('      - Importada por: ' + (schedule.importedBy || 'N/A'));
          
          // Verificar estrutura das entradas
          if (schedule.entries && schedule.entries.length > 0) {
            const firstEntry = schedule.entries[0];
            console.log('      - Estrutura: ' + Object.keys(firstEntry).join(', '));
          }
        });
      }
    }
    
    // 3. IDENTIFICAR QUAL ESCALA IMPORTAR
    console.log('');
    console.log('🎯 3. IDENTIFICANDO ESCALA PARA IMPORTAR...');
    
    // Verificar qual mês/ano está ativo na interface
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    console.log('📅 Data atual: ' + currentMonth + '/' + currentYear);
    
    // Verificar se já existe escala para o mês atual
    const existingSchedule = schedules.find(s => s.month === currentMonth && s.year === currentYear);
    
    if (existingSchedule) {
      console.log('✅ Escala para ' + currentMonth + '/' + currentYear + ' já existe no Supabase');
      console.log('🔄 Verificando se precisa atualizar...');
      
      // Comparar com localStorage
      if (localStorageSchedules) {
        const localSchedules = JSON.parse(localStorageSchedules);
        const localSchedule = localSchedules.current?.find(s => s.month === currentMonth && s.year === currentYear);
        
        if (localSchedule) {
          console.log('📊 Escala local encontrada com ' + (localSchedule.entries?.length || 0) + ' entradas');
          
          // Perguntar se quer atualizar
          console.log('');
          console.log('🤔 ESCALA JÁ EXISTE - O QUE DESEJA FAZER?');
          console.log('   1. Manter escala atual no Supabase');
          console.log('   2. Atualizar com dados do LocalStorage');
          console.log('   3. Importar nova escala manualmente');
          console.log('');
          console.log('💡 Para atualizar, execute: atualizarEscalaAtual()');
          console.log('💡 Para importar manual, execute: importarEscalaManual()');
        }
      }
    } else {
      console.log('❌ Escala para ' + currentMonth + '/' + currentYear + ' não encontrada no Supabase');
      console.log('🔄 Será importada do LocalStorage...');
      
      // Importar do localStorage
      await importarDoLocalStorage(currentMonth, currentYear);
    }
    
    // 4. VERIFICAR INTEGRIDADE DOS DADOS
    console.log('');
    console.log('🔍 4. VERIFICANDO INTEGRIDADE DOS DADOS...');
    
    await verificarIntegridadeDados();
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  }
}

// Função para importar do localStorage
async function importarDoLocalStorage(month, year) {
  console.log('📥 IMPORTANDO ESCALA ' + month + '/' + year + ' DO LOCALSTORAGE...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    // Buscar escala no localStorage
    const localStorageSchedules = localStorage.getItem('escala_scheduleStorage');
    if (!localStorageSchedules) {
      console.log('❌ Nenhuma escala encontrada no LocalStorage');
      return;
    }
    
    const schedulesData = JSON.parse(localStorageSchedules);
    const schedule = schedulesData.current?.find(s => s.month === month && s.year === year);
    
    if (!schedule) {
      console.log('❌ Escala ' + month + '/' + year + ' não encontrada no LocalStorage');
      return;
    }
    
    // Buscar usuário ADMIN
    const { data: adminUser } = await fetch(SUPABASE_URL + '/rest/v1/users?name=eq.ADMIN&select=id', {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
    }).then(r => r.json());
    
    const adminId = adminUser && adminUser.length > 0 ? adminUser[0].id : null;
    
    // Inserir no Supabase
    const response = await fetch(SUPABASE_URL + '/rest/v1/month_schedules', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        month: schedule.month,
        year: schedule.year,
        entries: schedule.entries || [],
        imported_by: adminId,
        imported_at: schedule.importedAt || new Date().toISOString(),
        is_active: schedule.isActive !== false
      })
    });
    
    if (response.ok) {
      console.log('✅ Escala ' + month + '/' + year + ' importada com sucesso!');
      console.log('📊 ' + (schedule.entries?.length || 0) + ' entradas migradas');
    } else {
      console.log('❌ Erro ao importar escala: ' + response.status);
      console.log('   Detalhes: ' + await response.text());
    }
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  }
}

// Função para atualizar escala existente
async function atualizarEscalaAtual() {
  console.log('🔄 ATUALIZANDO ESCALA ATUAL...');
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  // Primeiro remover a escala existente
  await removerEscala(currentMonth, currentYear);
  
  // Depois importar do localStorage
  await importarDoLocalStorage(currentMonth, currentYear);
}

// Função para remover escala
async function removerEscala(month, year) {
  console.log('🗑️ REMOVENDO ESCALA ' + month + '/' + year + '...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    const response = await fetch(SUPABASE_URL + '/rest/v1/month_schedules?month=eq.' + month + '&year=eq.' + year, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      console.log('✅ Escala ' + month + '/' + year + ' removida');
    } else {
      console.log('❌ Erro ao remover escala: ' + response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao remover escala:', error);
  }
}

// Função para verificar integridade dos dados
async function verificarIntegridadeDados() {
  console.log('🔍 VERIFICANDO INTEGRIDADE DOS DADOS...');
  
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    // Verificar escalas
    const schedulesResponse = await fetch(SUPABASE_URL + '/rest/v1/month_schedules', {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
    });
    
    const schedules = await schedulesResponse.json();
    
    console.log('📊 INTEGRIDADE DAS ESCALAS:');
    schedules.forEach(schedule => {
      const entries = schedule.entries || [];
      const validEntries = entries.filter(entry => 
        entry.date && entry.dayOfWeek && entry.meioPeriodo && entry.fechamento
      );
      
      console.log('   📅 ' + schedule.month + '/' + schedule.year + ':');
      console.log('      - Total entradas: ' + entries.length);
      console.log('      - Entradas válidas: ' + validEntries.length);
      console.log('      - Integridade: ' + (validEntries.length === entries.length ? '✅' : '⚠️'));
      
      if (validEntries.length !== entries.length) {
        console.log('      - ⚠️ Entradas inválidas encontradas!');
      }
    });
    
    // Verificar usuários
    const usersResponse = await fetch(SUPABASE_URL + '/rest/v1/users', {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY }
    });
    
    const users = await usersResponse.json();
    
    console.log('👥 INTEGRIDADE DOS USUÁRIOS:');
    users.forEach(user => {
      const validUser = user.name && user.role && user.status;
      console.log('   👤 ' + user.name + ': ' + (validUser ? '✅' : '⚠️'));
    });
    
    // Testar operação
    const testResponse = await fetch(SUPABASE_URL + '/rest/v1/audit_logs', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_name: 'INTEGRITY_CHECK',
        action: 'DATA_VERIFICATION',
        details: 'Verificação de integridade - ' + new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    });
    
    console.log('🧪 Teste de escrita: ' + (testResponse.ok ? '✅' : '❌'));
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Exportar funções
window.importarEscalaCorreta = importarEscalaCorreta;
window.atualizarEscalaAtual = atualizarEscalaAtual;
window.importarDoLocalStorage = importarDoLocalStorage;
window.removerEscala = removerEscala;
window.verificarIntegridadeDados = verificarIntegridadeDados;

console.log('📊 FUNÇÕES DE IMPORTAÇÃO E VERIFICAÇÃO CARREGADAS!');
console.log('🔍 Para importar: importarEscalaCorreta()');
console.log('🔄 Para atualizar: atualizarEscalaAtual()');
console.log('🔍 Para verificar integridade: verificarIntegridadeDados()');
