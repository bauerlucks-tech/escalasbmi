// INSTRUÇÕES PARA CRIAR TABELA VIA DASHBOARD SUPABASE
// Script para criar tabela manualmente e depois sincronizar

function mostrarInstrucoesDashboard() {
  console.log('📋 INSTRUÇÕES PARA CRIAR TABELA VIA DASHBOARD');
  console.log('============================================');
  console.log('');
  console.log('🔧 PASSO 1: ACESSAR DASHBOARD SUPABASE');
  console.log('   1. Vá para: https://supabase.com/dashboard');
  console.log('   2. Faça login com sua conta');
  console.log('   3. Selecione o projeto: lsxmwwwmgfjwnowlsmzf');
  console.log('');
  console.log('🗄️ PASSO 2: CRIAR TABELA SCHEDULES');
  console.log('   1. Vá para "Table Editor" no menu lateral');
  console.log('   2. Clique em "Create a new table"');
  console.log('   3. Configure assim:');
  console.log('');
  console.log('   📝 Table Name: schedules');
  console.log('   📝 Description: Tabela de escalas mensais');
  console.log('');
  console.log('   📋 Columns:');
  console.log('   ├─ id (uuid, Primary Key, Default: uuid_generate_v4())');
  console.log('   ├─ month (integer, Not Null)');
  console.log('   ├─ year (integer, Not Null)');
  console.log('   ├─ entries (json, Not Null, Default: "[]")');
  console.log('   ├─ is_active (boolean, Default: true)');
  console.log('   ├─ created_at (timestamptz, Default: now())');
  console.log('   └─ updated_at (timestamptz, Default: now())');
  console.log('');
  console.log('🔐 PASSO 3: CONFIGURAR RLS');
  console.log('   1. Vá para "Authentication" > "Policies"');
  console.log('   2. Selecione a tabela "schedules"');
  console.log('   3. Clique em "Enable RLS" se não estiver ativado');
  console.log('   4. Crie uma nova política:');
  console.log('      - Policy Name: "Allow all operations"');
  console.log('      - Allowed Operations: ALL');
  console.log('      - Policy Definition: true');
  console.log('      - Check Expression: true');
  console.log('');
  console.log('✅ PASSO 4: TESTAR TABELA');
  console.log('   1. Volte para esta página');
  console.log('   2. Execute: testarTabelaCriada()');
  console.log('');
  console.log('🔄 PASSO 5: SINCRONIZAR DADOS');
  console.log('   1. Execute: criarDadosIniciais()');
  console.log('   2. Execute: sincronizarComLocalStorage()');
}

// Testar se tabela foi criada
async function testarTabelaCriada() {
  console.log('🧪 TESTANDO SE TABELA FOI CRIADA...');
  console.log('==================================');
  
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/schedules?select=count&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Tabela schedules está acessível!');
      
      // Verificar dados existentes
      const dataResponse = await fetch(`${supabaseUrl}/rest/v1/schedules?select=*`, {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      
      if (dataResponse.ok) {
        const schedules = await dataResponse.json();
        console.log(`📋 Encontradas ${schedules.length} escalas na tabela`);
        
        if (schedules.length > 0) {
          schedules.forEach((schedule, index) => {
            const entriesCount = schedule.entries ? schedule.entries.length : 0;
            console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias`);
          });
        }
      }
      
      return true;
    } else {
      console.log('❌ Tabela ainda não está acessível');
      console.log('Status:', response.status);
      console.log('Verifique se criou a tabela corretamente no dashboard');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar tabela:', error);
    return false;
  }
}

// Criar dados iniciais
async function criarDadosIniciais() {
  console.log('📋 CRIANDO DADOS INICIAIS...');
  console.log('==========================');
  
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  try {
    // Verificar se já há dados
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/schedules?select=count&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (checkResponse.ok) {
      const data = await checkResponse.json();
      if (data && data.length > 0) {
        console.log('⚠️ Já existem dados na tabela');
        console.log('💡 Se quiser limpar, execute: limparDadosSupabase()');
        return;
      }
    }
    
    // Criar escalas para mês atual e próximo
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const initialSchedules = [
      {
        month: currentMonth,
        year: currentYear,
        entries: gerarEscalasVazias(currentMonth, currentYear),
        is_active: true
      },
      {
        month: currentMonth === 12 ? 1 : currentMonth + 1,
        year: currentMonth === 12 ? currentYear + 1 : currentYear,
        entries: gerarEscalasVazias(currentMonth === 12 ? 1 : currentMonth + 1, currentMonth === 12 ? currentYear + 1 : currentYear),
        is_active: true
      }
    ];
    
    console.log(`📝 Criando ${initialSchedules.length} escalas...`);
    
    let created = 0;
    for (const schedule of initialSchedules) {
      const createResponse = await fetch(`${supabaseUrl}/rest/v1/schedules`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schedule)
      });
      
      if (createResponse.ok) {
        console.log(`✅ Escala ${schedule.month}/${schedule.year} criada`);
        created++;
      } else {
        console.log(`❌ Erro ao criar escala ${schedule.month}/${schedule.year}: ${createResponse.status}`);
        const errorText = await createResponse.text();
        console.log('Erro:', errorText);
      }
    }
    
    if (created > 0) {
      console.log(`✅ ${created} escalas criadas com sucesso!`);
    } else {
      console.log('❌ Nenhuma escala criada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
  }
}

// Sincronizar com localStorage
async function sincronizarComLocalStorage() {
  console.log('🔄 SINCRONIZANDO COM LOCAL STORAGE...');
  console.log('==================================');
  
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/schedules?select=*&order=year.desc,month.desc`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (response.ok) {
      const schedules = await response.json();
      
      // Salvar no localStorage
      localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
      
      console.log(`✅ ${schedules.length} escalas sincronizadas para localStorage`);
      
      schedules.forEach((schedule, index) => {
        const entriesCount = schedule.entries ? schedule.entries.length : 0;
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias`);
      });
      
      console.log('');
      console.log('🎉 SINCRONIZAÇÃO CONCLUÍDA!');
      console.log('💡 Recarregue a página para ver as escalas');
      
    } else {
      console.log('❌ Erro ao sincronizar do Supabase');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Gerar escalas vazias
function gerarEscalasVazias(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const entries = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    entries.push({
      date: date,
      meioPeriodo: null,
      fechamento: null,
      piloto: null,
      coPiloto: null,
      observacoes: null
    });
  }
  
  return entries;
}

// Limpar dados do Supabase
async function limparDadosSupabase() {
  console.log('🗑️ LIMPANDO DADOS DO SUPABASE...');
  console.log('==============================');
  
  const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/schedules`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Todos os dados removidos do Supabase');
    } else {
      console.log('❌ Erro ao limpar dados:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  }
}

// Exportar funções
window.mostrarInstrucoesDashboard = mostrarInstrucoesDashboard;
window.testarTabelaCriada = testarTabelaCriada;
window.criarDadosIniciais = criarDadosIniciais;
window.sincronizarComLocalStorage = sincronizarComLocalStorage;
window.limparDadosSupabase = limparDadosSupabase;

console.log('🔧 FERRAMENTAS PARA CRIAÇÃO MANUAL CARREGADAS!');
console.log('📋 Para ver instruções: mostrarInstrucoesDashboard()');
console.log('🧪 Para testar tabela: testarTabelaCriada()');
console.log('📋 Para criar dados: criarDadosIniciais()');
console.log('🔄 Para sincronizar: sincronizarComLocalStorage()');
console.log('🗑️ Para limpar: limparDadosSupabase()');

// Mostrar instruções automaticamente
mostrarInstrucoesDashboard();
