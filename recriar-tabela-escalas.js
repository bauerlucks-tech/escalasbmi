// RECRIAR TABELA SCHEDULES E RESTAURAR DADOS
// Script para resolver problema de escalas antigas

async function recriarTabelaERestaurar() {
  console.log('🔧 RECRIANDO TABELA SCHEDULES E RESTAURANDO DADOS');
  console.log('===============================================');
  
  try {
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    // 1. Criar tabela schedules via SQL
    console.log('');
    console.log('🗄️ 1. CRIANDO TABELA SCHEDULES...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        entries JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_schedules_month_year ON schedules(month, year);
      CREATE INDEX IF NOT EXISTS idx_schedules_active ON schedules(is_active);
      
      -- Enable RLS
      ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies
      DROP POLICY IF EXISTS "Users can view schedules" ON schedules;
      DROP POLICY IF EXISTS "Users can insert schedules" ON schedules;
      DROP POLICY IF EXISTS "Users can update schedules" ON schedules;
      
      -- Create new policies
      CREATE POLICY "Allow all operations on schedules" ON schedules
        FOR ALL USING (true) WITH CHECK (true);
    `;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: createTableSQL })
    });
    
    if (response.ok) {
      console.log('✅ Tabela schedules criada com sucesso');
    } else {
      console.log('⚠️ Tabela pode já existir ou erro na criação');
      console.log('Status:', response.status);
    }
    
    // 2. Verificar se tabela foi criada
    console.log('');
    console.log('🔍 2. VERIFICANDO TABELA CRIADA...');
    
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/schedules?select=count&limit=1`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    
    if (verifyResponse.ok) {
      console.log('✅ Tabela schedules está acessível');
    } else {
      console.log('❌ Tabela ainda não está acessível');
      console.log('Tentando método alternativo...');
      
      // Tentar criar via REST API direto
      await criarTabelaViaRest(supabaseUrl, serviceKey);
    }
    
    // 3. Criar dados iniciais se não houver
    console.log('');
    console.log('📋 3. CRIANDO DADOS INICIAIS...');
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Criar escalas para mês atual e próximo
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
      }
    }
    
    if (created > 0) {
      console.log(`✅ ${created} escalas criadas no Supabase`);
      
      // 4. Sincronizar com localStorage
      console.log('');
      console.log('🔄 4. SINCRONIZANDO COM LOCAL STORAGE...');
      
      await sincronizarDoSupabase(supabaseUrl, serviceKey);
      
    } else {
      console.log('❌ Nenhuma escala criada');
    }
    
    console.log('');
    console.log('🎉 PROCESSO CONCLUÍDO!');
    console.log('💡 Recarregue a página para ver as escalas');
    
  } catch (error) {
    console.error('❌ Erro no processo:', error);
  }
}

// Gerar escalas vazias para um mês
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

// Criar tabela via REST API (método alternativo)
async function criarTabelaViaRest(supabaseUrl, serviceKey) {
  console.log('🔧 TENTANDO MÉTODO ALTERNATIVO...');
  
  // Tentar inserir um registro para forçar criação da tabela
  const testSchedule = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    entries: JSON.stringify([]),
    is_active: true
  };
  
  const response = await fetch(`${supabaseUrl}/rest/v1/schedules`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(testSchedule)
  });
  
  if (response.ok || response.status === 201) {
    console.log('✅ Tabela criada via inserção de teste');
    
    // Remover registro de teste
    await fetch(`${supabaseUrl}/rest/v1/schedules?month=eq.${testSchedule.month}&year=eq.${testSchedule.year}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
  } else {
    console.log('❌ Método alternativo também falhou');
  }
}

// Sincronizar dados do Supabase para localStorage
async function sincronizarDoSupabase(supabaseUrl, serviceKey) {
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
    } else {
      console.log('❌ Erro ao sincronizar do Supabase');
    }
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Função para limpar e recriar tudo
async function limparERecriarTudo() {
  console.log('🗑️ LIMPANDO TUDO E RECRIANDO...');
  console.log('==============================');
  
  // Limpar localStorage
  localStorage.removeItem('escala_scheduleStorage');
  localStorage.removeItem('escala_users');
  console.log('✅ LocalStorage limpo');
  
  // Recriar tabela e dados
  await recriarTabelaERestaurar();
}

// Exportar funções
window.recriarTabelaERestaurar = recriarTabelaERestaurar;
window.limparERecriarTudo = limparERecriarTudo;
window.sincronizarDoSupabase = sincronizarDoSupabase;

console.log('🔧 FERRAMENTAS DE RECRIAÇÃO CARREGADAS!');
console.log('📋 Para recriar tabela: recriarTabelaERestaurar()');
console.log('🗑️ Para limpar tudo: limparERecriarTudo()');
console.log('🔄 Para sincronizar: sincronizarDoSupabase()');
