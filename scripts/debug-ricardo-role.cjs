const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function debugRicardoRole() {
  console.log('🔍 DEBUG DO ROLE DO RICARDO');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar status atual no banco
    console.log('\n📋 PASSO 1: Verificando status atual no banco...');
    
    const { data: ricardo, error: findError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'RICARDO')
      .single();
    
    if (findError) {
      console.log('❌ Ricardo não encontrado:', findError.message);
      return;
    }
    
    console.log('✅ Ricardo no banco de dados:');
    console.log(`  - ID: ${ricardo.id}`);
    console.log(`  - Nome: ${ricardo.name}`);
    console.log(`  - Email: ${ricardo.email}`);
    console.log(`  - Senha: ${ricardo.password}`);
    console.log(`  - Role: ${ricardo.role}`);
    console.log(`  - Status: ${ricardo.status}`);
    console.log(`  - Hide from schedule: ${ricardo.hide_from_schedule}`);
    
    // 2. Verificar se há múltiplos Ricardo
    console.log('\n📋 PASSO 2: Verificando se há múltiplos Ricardo...');
    
    const { data: allRicardos, error: listError } = await serviceClient
      .from('users')
      .select('*')
      .ilike('name', '%RICA%') // Busca por Ricardo
      .order('created_at', { ascending: true });
    
    if (listError) {
      console.log('❌ Erro ao listar Ricardos:', listError.message);
    } else {
      console.log(`✅ Encontrados ${allRicardos.length} usuários com "RICA" no nome:`);
      
      allRicardos.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Status: ${user.status}`);
        console.log(`   - Criado: ${new Date(user.created_at).toLocaleDateString('pt-BR')}`);
      });
    }
    
    // 3. Verificar no frontend (localStorage)
    console.log('\n📋 PASSO 3: Verificando sessão no frontend...');
    
    // Simular verificação do frontend
    const directAuthUser = localStorage.getItem('directAuth_currentUser');
    const escalaSession = localStorage.getItem('escala_session');
    
    console.log('🔍 Sessões encontradas:');
    if (directAuthUser) {
      try {
        const session = JSON.parse(directAuthUser);
        console.log(`  - directAuth: ${session.name} (${session.role})`);
      } catch (e) {
        console.log('  - directAuth: Dados corrompidos');
      }
    }
    
    if (escalaSession) {
      try {
        const session = JSON.parse(escalaSession);
        console.log(`  - escala_session: ${session.user?.name} (${session.user?.role})`);
      } catch (e) {
        console.log('  - escala_session: Dados corrompidos');
      }
    }
    
    // 4. Verificar userMapping
    console.log('\n📋 PASSO 4: Verificando userMapping...');
    
    try {
      const { getUserUUID } = require('../src/config/userMapping.ts');
      
      const ricardoUUID = getUserUUID('RICARDO');
      console.log(`🔍 UUID no userMapping: ${ricardoUUID}`);
      
      if (ricardoUUID) {
        // Verificar se corresponde ao ID correto
        const { data: mappedUser, error: mappedError } = await serviceClient
          .from('users')
          .select('*')
          .eq('id', ricardoUUID)
          .single();
        
        if (mappedError) {
          console.log('❌ Erro ao buscar usuário mapeado:', mappedError.message);
        } else {
          console.log('✅ Usuário mapeado:');
          console.log(`  - Nome: ${mappedUser.name}`);
          console.log(`  - Role: ${mappedUser.role}`);
          console.log(`  - Status: ${mappedUser.status}`);
        }
      }
    } catch (mappingError) {
      console.log('❌ Erro ao verificar userMapping:', mappingError.message);
    }
    
    // 5. Testar login do Ricardo
    console.log('\n📋 PASSO 5: Testando login do Ricardo...');
    
    try {
      const { data: loginTest, error: loginError } = await serviceClient
        .from('users')
        .select('*')
        .eq('email', ricardo.email)
        .eq('password', ricardo.password)
        .eq('status', 'ativo')
        .single();
      
      if (loginError) {
        console.log('❌ Login Ricardo falhou:', loginError.message);
      } else {
        console.log('✅ Login Ricardo funcionando!');
        console.log(`  - Usuário: ${loginTest.name}`);
        console.log(`  - Email: ${loginTest.email}`);
        console.log(`  - Role: ${loginTest.role}`);
        console.log(`  - Senha: ${loginTest.password}`);
      }
    } catch (loginException) {
      console.log('❌ Exceção no login:', loginException.message);
    }
    
    // 6. Verificar cache do frontend
    console.log('\n📋 PASSO 6: Verificando possíveis problemas de cache...');
    
    console.log('🔍 Possíveis causas do problema:');
    console.log('  1. Cache do navegador com dados antigos');
    console.log('  2. Sessão expirada mas não limpa');
    console.log('  3. UserMapping desatualizado');
    console.log('  4. Login usando nome em vez de email');
    console.log('  5. Contexto React com dados desatualizados');
    
    // 7. Soluções recomendadas
    console.log('\n🎯 SOLUÇÕES RECOMENDADAS:');
    console.log('='.repeat(40));
    
    console.log('\n🔧 Para o usuário:');
    console.log('  1. Limpar cache do navegador');
    console.log('  2. Usar modo incógnito');
    console.log('  3. Fazer logout e login novamente');
    console.log('  4. Usar email: ricardo@escala-bmi.com');
    console.log('  5. Usar senha: ricardo123');
    
    console.log('\n🔧 Para o desenvolvedor:');
    console.log('  1. Verificar se userMapping está atualizado');
    console.log('  2. Limpar localStorage manualmente');
    console.log('  3. Verificar se há múltiplos usuários Ricardo');
    console.log('  4. Confirmar role no banco vs frontend');
    
    // 8. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log('='.repeat(40));
    
    console.log(`\n✅ Ricardo no banco: ${ricardo.role}`);
    console.log(`🔍 Email: ${ricardo.email}`);
    console.log(`🔑 Senha: ${ricardo.password}`);
    console.log(`🆔 ID: ${ricardo.id}`);
    
    if (ricardo.role === 'administrador') {
      console.log('\n✅ Ricardo está CORRETAMENTE como administrador no banco!');
      console.log('❌ O problema está no frontend ou cache');
    } else {
      console.log('\n❌ Ricardo NÃO está como administrador no banco!');
      console.log('🔧 Precisa corrigir no banco primeiro');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugRicardoRole();
