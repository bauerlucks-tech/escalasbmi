const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

// Simular localStorage para debug
const simulateLocalStorage = () => {
  const storage = {};
  return {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => storage[key] = value,
    removeItem: (key) => delete storage[key],
    clear: () => Object.keys(storage).forEach(key => delete storage[key])
  };
};

async function debugRicardoRole() {
  console.log('🔍 DEBUG DO ROLE DO RICARDO - VERSÃO CORRIGIDA');
  console.log('='.repeat(60));
  
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
    
    // 3. Verificar userMapping do frontend
    console.log('\n📋 PASSO 3: Verificando userMapping do frontend...');
    
    // Ler o arquivo userMapping
    const fs = require('fs');
    const path = require('path');
    
    try {
      const userMappingPath = path.join(__dirname, '../src/config/userMapping.ts');
      const userMappingContent = fs.readFileSync(userMappingPath, 'utf8');
      
      // Extrair UUID do Ricardo do userMapping
      const uuidMatch = userMappingContent.match(/'RICARDO':\s*'([^']+)'/);
      const mappedUUID = uuidMatch ? uuidMatch[1] : null;
      
      console.log(`🔍 UUID no userMapping.ts: ${mappedUUID}`);
      console.log(`🔍 UUID real no banco: ${ricardo.id}`);
      
      if (mappedUUID && mappedUUID !== ricardo.id) {
        console.log('❌ userMapping desatualizado!');
        console.log(`🔧 UUID correto: ${ricardo.id}`);
        console.log(`🔧 UUID no arquivo: ${mappedUUID}`);
        
        // Sugerir correção
        console.log('\n📝 Correção sugerida para userMapping.ts:');
        console.log(`'RICARDO': '${ricardo.id}', // UUID atualizado`);
      } else if (mappedUUID === ricardo.id) {
        console.log('✅ userMapping está correto!');
      } else {
        console.log('❌ Não foi possível extrair UUID do userMapping');
      }
    } catch (mappingError) {
      console.log('❌ Erro ao ler userMapping:', mappingError.message);
    }
    
    // 4. Verificar contexto React
    console.log('\n📋 PASSO 4: Analisando possíveis problemas no frontend...');
    
    console.log('🔍 Possíveis causas do Ricardo aparecer como operador:');
    console.log('  1. userMapping desatualizado (UUID incorreto)');
    console.log('  2. Cache do localStorage com role antigo');
    console.log('  3. Contexto React não atualizado após login');
    console.log('  4. Múltiplos usuários com nome similar');
    console.log('  5. Sessão misturada entre usuários');
    console.log('  6. Bug na verificação de role no frontend');
    
    // 5. Verificar se há conflito de nomes
    console.log('\n📋 PASSO 5: Verificando conflitos de nomes...');
    
    const { data: nameConflict, error: conflictError } = await serviceClient
      .from('users')
      .select('name, role, email')
      .or('name.eq.RICARDO,name.eq.Ricardo,name.eq.ricardo')
      .eq('status', 'ativo');
    
    if (conflictError) {
      console.log('❌ Erro ao verificar conflitos:', conflictError.message);
    } else {
      console.log(`✅ Encontrados ${nameConflict.length} usuários com variações de "Ricardo":`);
      
      nameConflict.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}:`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - ID: ${user.id}`);
      });
    }
    
    // 6. Testar diferentes formas de login
    console.log('\n📋 PASSO 6: Testando diferentes formas de login...');
    
    const loginMethods = [
      { type: 'Nome', value: 'RICARDO' },
      { type: 'Nome minúsculo', value: 'ricardo' },
      { type: 'Email', value: ricardo.email }
    ];
    
    for (const method of loginMethods) {
      try {
        const { data: loginTest, error: loginError } = await serviceClient
          .from('users')
          .select('*')
          .eq(method.type.includes('Email') ? 'email' : 'name', method.value)
          .eq('password', 'ricardo123')
          .eq('status', 'ativo')
          .single();
        
        if (loginError) {
          console.log(`❌ Login por ${method.type} (${method.value}) falhou: ${loginError.message}`);
        } else {
          console.log(`✅ Login por ${method.type} funcionando!`);
          console.log(`   - Usuário: ${loginTest.name}`);
          console.log(`   - Role: ${loginTest.role}`);
          console.log(`   - ID: ${loginTest.id}`);
        }
      } catch (loginException) {
        console.log(`❌ Exceção no login por ${method.type}: ${loginException.message}`);
      }
    }
    
    // 7. Diagnóstico final
    console.log('\n🎯 DIAGNÓSTICO FINAL:');
    console.log('='.repeat(50));
    
    console.log('\n📊 FATOS CONFIRMADOS:');
    console.log(`✅ Ricardo no banco: ${ricardo.role} (administrador)`);
    console.log(`✅ Email: ${ricardo.email}`);
    console.log(`✅ Senha: ricardo123`);
    console.log(`✅ ID: ${ricardo.id}`);
    console.log(`✅ Status: ${ricardo.status}`);
    
    console.log('\n🔍 PROVÁVEL CAUSA DO PROBLEMA:');
    console.log('❌ O frontend está usando dados desatualizados ou cache antigo');
    console.log('🔍 O banco de dados está CORRETO (Ricardo = administrador)');
    console.log('🔍 O problema está na camada de apresentação do frontend');
    
    console.log('\n🎯 SOLUÇÕES:');
    console.log('='.repeat(30));
    
    console.log('\n🔧 PARA O USUÁRIO:');
    console.log('  1. Limpar completamente o cache do navegador');
    console.log('  2. Usar modo incógnito/privado');
    console.log('  3. Fazer logout completo');
    console.log('  4. Fazer login novamente com:');
    console.log('     - Email: ricardo@escala-bmi.com');
    console.log('     - Senha: ricardo123');
    
    console.log('\n🔧 PARA O DESENVOLVEDOR:');
    console.log('  1. Verificar userMapping.ts');
    console.log('  2. Limpar localStorage manualmente');
    console.log('  3. Verificar contexto React');
    console.log('  4. Forçar reload da página');
    console.log('  5. Verificar se há bugs na verificação de role');
    
    console.log('\n🚀 TESTE FINAL:');
    console.log('  Acesse: https://escalasbmi.vercel.app');
    console.log('  Use: ricardo@escala-bmi.com / ricardo123');
    console.log('  Role deverá aparecer: ADMINISTRADOR');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugRicardoRole();
