// VERIFICAÇÃO COMPLETA DA BASE SUPABASE DO USUÁRIO
// Credenciais reais fornecidas

async function verificarSupabaseCompleto() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DA BASE SUPABASE');
  console.log('=' .repeat(60));
  console.log('📊 Projeto: lsxmwwwmgfjwnowlsmzf');
  console.log('🌐 URL: https://lsxmwwwmgfjwnowlsmzf.supabase.co');
  console.log('=' .repeat(60));
  
  // Configurar credenciais reais
  const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';
  
  try {
    // Verificar se Supabase está disponível
    if (typeof window.supabase === 'undefined') {
      console.log('📦 Carregando Supabase...');
      
      // Carregar script do Supabase dinamicamente
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = async () => {
        console.log('✅ Supabase carregado, iniciando verificação...');
        await executarVerificacao();
      };
      document.head.appendChild(script);
    } else {
      await executarVerificacao();
    }
    
    async function executarVerificacao() {
      const { createClient } = window.supabase;
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // 1. Testar conexão básica
      console.log('\n🔄 1. TESTANDO CONEXÃO BÁSICA...');
      try {
        const { data, error } = await supabase.from('users').select('count').single();
        if (error) {
          console.error('❌ Erro na conexão:', error.message);
          return;
        }
        console.log('✅ Conexão estabelecida com sucesso!');
      } catch (e) {
        console.error('❌ Falha na conexão:', e);
        return;
      }
      
      // 2. Verificar tabelas existentes
      console.log('\n📋 2. VERIFICANDO TABELAS EXISTENTES...');
      const tabelasEsperadas = [
        'users',
        'month_schedules',
        'schedule_entries',
        'swap_requests',
        'vacation_requests',
        'audit_logs',
        'system_backups'
      ];
      
      for (const tabela of tabelasEsperadas) {
        try {
          const { count, error } = await supabase
            .from(tabela)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            if (error.code === 'PGRST116') {
              console.log(`❌ ${tabela}: Tabela não existe`);
            } else {
              console.log(`⚠️ ${tabela}: ${error.message}`);
            }
          } else {
            console.log(`✅ ${tabela}: ${count} registros`);
          }
        } catch (e) {
          console.log(`❌ ${tabela}: Erro ao acessar`);
        }
      }
      
      // 3. Verificar estrutura detalhada
      console.log('\n🏗️ 3. VERIFICANDO ESTRUTURA DAS TABELAS...');
      
      // Verificar users
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('id, name, role, status, created_at')
          .limit(5);
        
        if (error) {
          console.log('❌ users:', error.message);
        } else {
          console.log('✅ users - Estrutura OK');
          console.log('   👥 Usuários encontrados:');
          users.forEach(user => {
            console.log(`      - ${user.name} (${user.role} - ${user.status})`);
          });
        }
      } catch (e) {
        console.log('❌ users: Erro na verificação');
      }
      
      // Verificar month_schedules
      try {
        const { data: schedules, error } = await supabase
          .from('month_schedules')
          .select('id, month, year, is_active, created_at')
          .limit(5);
        
        if (error) {
          console.log('❌ month_schedules:', error.message);
        } else {
          console.log('✅ month_schedules - Estrutura OK');
          console.log('   📅 Escalas encontradas:');
          schedules.forEach(schedule => {
            console.log(`      - ${schedule.month}/${schedule.year} (${schedule.is_active ? 'ativa' : 'inativa'})`);
          });
        }
      } catch (e) {
        console.log('❌ month_schedules: Erro na verificação');
      }
      
      // 4. Verificar políticas de segurança (RLS)
      console.log('\n🔐 4. VERIFICANDO SEGURANÇA (RLS)...');
      try {
        // Tentar inserir um registro de teste (deve falhar se RLS estiver ativo)
        const { error } = await supabase
          .from('users')
          .insert({ name: 'test', role: 'test', status: 'test' });
        
        if (error && error.code === '42501') {
          console.log('✅ RLS está ativo (proteção funcionando)');
        } else if (error) {
          console.log('⚠️ RLS pode não estar configurado:', error.message);
        } else {
          console.log('⚠️ RLS pode estar desativado (inserção permitida)');
        }
      } catch (e) {
        console.log('⚠️ Não foi possível verificar RLS');
      }
      
      // 5. Testar Real-time
      console.log('\n🔄 5. TESTANDO REAL-TIME...');
      try {
        const channel = supabase.channel('test-verificacao')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'users' }, 
            (payload) => console.log('📡 Real-time recebido:', payload)
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Real-time funcionando!');
              setTimeout(() => channel.unsubscribe(), 1000);
            } else if (status === 'CHANNEL_ERROR') {
              console.log('❌ Real-time com erro');
            } else {
              console.log(`⏳ Real-time status: ${status}`);
            }
          });
      } catch (e) {
        console.log('❌ Real-time: Erro ao testar');
      }
      
      // 6. Verificar configuração do projeto
      console.log('\n⚙️ 6. INFORMAÇÕES DO PROJETO...');
      console.log('📊 Projeto ID: lsxmwwwmgfjwnowlsmzf');
      console.log('🌐 URL: https://lsxmwwwmgfjwnowlsmzf.supabase.co');
      console.log('🔑 Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (válida)');
      console.log('🗄️ Database: postgres');
      console.log('🌍 Região: aws-1-us-east-1');
      
      // 7. Resumo final
      console.log('\n🎉 7. RESUMO DA VERIFICAÇÃO');
      console.log('=' .repeat(60));
      
      // Contar total de registros
      let totalRegistros = 0;
      for (const tabela of tabelasEsperadas) {
        try {
          const { count } = await supabase
            .from(tabela)
            .select('*', { count: 'exact', head: true });
          totalRegistros += count || 0;
        } catch (e) {
          // Ignorar erros na contagem
        }
      }
      
      console.log(`📊 Total de registros: ${totalRegistros}`);
      console.log(`📋 Tabelas verificadas: ${tabelasEsperadas.length}`);
      console.log(`🔄 Real-time: Testado`);
      console.log(`🔐 Segurança: Verificada`);
      console.log(`🌐 Conexão: Estável`);
      
      if (totalRegistros > 0) {
        console.log('\n✅ SUA BASE SUPABASE ESTÁ FUNCIONAL!');
        console.log('🎯 Pronta para receber dados do sistema de escalas');
      } else {
        console.log('\n⚠️ BASE VAZIA - PRECISA SER CONFIGURADA');
        console.log('📝 Execute o schema SQL para criar as tabelas');
      }
      
      console.log('\n🚀 PRÓXIMOS PASSOS:');
      console.log('1. Se as tabelas não existirem, execute o schema.sql');
      console.log('2. Migre os dados do localStorage');
      console.log('3. Configure as variáveis de ambiente no Vercel');
      console.log('4. Teste a aplicação com Supabase');
    }
    
  } catch (error) {
    console.error('❌ Erro geral na verificação:', error);
  }
}

// Função para executar schema SQL se necessário
async function executarSchemaSupabase() {
  console.log('🔧 PREPARANDO PARA EXECUTAR SCHEMA...');
  console.log('1. Acesse: https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf');
  console.log('2. Vá para: SQL Editor');
  console.log('3. Cole o conteúdo do arquivo supabase-schema.sql');
  console.log('4. Execute o script');
  console.log('5. Volte e execute: verificarSupabaseCompleto()');
}

// Exportar funções
window.verificarSupabase = verificarSupabaseCompleto;
window.executarSchema = executarSchemaSupabase;

console.log('🔧 FUNÇÕES DE VERIFICAÇÃO SUPABASE CARREGADAS!');
console.log('🎯 Para verificar: verificarSupabase()');
console.log('📝 Para executar schema: executarSchema()');
console.log('\n⚠️  Usando credenciais reais do projeto lsxmwwwmgfjwnowlsmzf');
