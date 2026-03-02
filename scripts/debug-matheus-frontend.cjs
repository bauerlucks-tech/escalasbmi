const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function debugMatheusFrontend() {
  console.log('🔍 DEBUG DO MATHEUS NO FRONTEND');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar status atual no banco
    console.log('\n📋 PASSO 1: Verificando Matheus no banco...');
    
    const { data: matheus, error: findError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'MATHEUS')
      .single();
    
    if (findError) {
      console.log('❌ Matheus não encontrado:', findError.message);
      return;
    }
    
    console.log('✅ Matheus no banco:');
    console.log(`  - ID: ${matheus.id}`);
    console.log(`  - Nome: ${matheus.name}`);
    console.log(`  - Email: ${matheus.email}`);
    console.log(`  - Senha: ${matheus.password}`);
    console.log(`  - Role: ${matheus.role}`);
    console.log(`  - Status: ${matheus.status}`);
    console.log(`  - Hide from schedule: ${matheus.hide_from_schedule}`);
    
    // 2. Verificar userMapping para Matheus
    console.log('\n📋 PASSO 2: Verificando userMapping para Matheus...');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const userMappingPath = path.join(__dirname, '../src/config/userMapping.ts');
      const userMappingContent = fs.readFileSync(userMappingPath, 'utf8');
      
      // Verificar se Matheus está no userMapping
      const hasMatheus = userMappingContent.includes('MATHEUS');
      
      if (hasMatheus) {
        console.log('✅ Matheus encontrado no userMapping.ts');
        
        // Extrair UUID do Matheus
        const uuidMatch = userMappingContent.match(/'MATHEUS':\s*'([^']+)'/);
        const mappedUUID = uuidMatch ? uuidMatch[1] : null;
        
        console.log(`🔍 UUID no userMapping: ${mappedUUID}`);
        console.log(`🔍 UUID real no banco: ${matheus.id}`);
        
        if (mappedUUID && mappedUUID !== matheus.id) {
          console.log('❌ userMapping desatualizado para Matheus!');
          console.log(`🔧 UUID correto: ${matheus.id}`);
          console.log(`🔧 UUID no arquivo: ${mappedUUID}`);
        } else {
          console.log('✅ userMapping está correto para Matheus');
        }
      } else {
        console.log('❌ Matheus NÃO encontrado no userMapping.ts');
        console.log('🔧 Matheus precisa ser adicionado ao userMapping');
        
        // Sugerir adição
        console.log('\n📝 Adição sugerida para userMapping.ts:');
        console.log(`'MATHEUS': '${matheus.id}', // UUID do Matheus`);
      }
    } catch (mappingError) {
      console.log('❌ Erro ao ler userMapping:', mappingError.message);
    }
    
    // 3. Verificar lista de usuários no frontend
    console.log('\n📋 PASSO 3: Analisando lista de usuários do frontend...');
    
    // Verificar arquivos que podem conter a lista de usuários
    const possibleFiles = [
      '../src/data/scheduleData.ts',
      '../src/contexts/AuthContext.tsx',
      '../src/contexts/SupabaseContext.tsx'
    ];
    
    for (const filePath of possibleFiles) {
      try {
        const fullPath = path.join(__dirname, filePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        if (content.includes('MATHEUS')) {
          console.log(`✅ Matheus encontrado em: ${filePath}`);

          // Verificar se está em alguma lista/array
          const lines = content.split('\n');
          const matheusLines = lines.filter((line) => line.includes('MATHEUS'));

          console.log(`🔍 Linhas com MATHEUS (${matheusLines.length}):`);
          matheusLines.forEach((line, index) => {
            console.log(`  ${index + 1}. ${line.trim()}`);
          });
        } else {
          console.log(`❌ Matheus NÃO encontrado em: ${filePath}`);
        }
      } catch (fileError) {
        console.log(`❌ Erro ao ler ${filePath}: ${fileError.message}`);
      }
    }

    // 4. Verificar se há algum filtro bloqueando Matheus
    console.log('\n📋 PASSO 4: Verificando possíveis filtros...');
    
    console.log('🔍 Possíveis razões para Matheus não aparecer:');
    console.log('  1. Não está no userMapping.ts');
    console.log('  2. Está em lista de usuários mas com status inativo');
    console.log('  3. Hide from schedule = true');
    console.log('  4. Filtro de nome não encontrando "MATHEUS"');
    console.log('  5. Case sensitivity no login');
    console.log('  6. Cache do frontend com usuário antigo');
    
    // 5. Testar diferentes variações do nome
    console.log('\n📋 PASSO 5: Testando variações do nome...');
    
    const nameVariations = [
      'MATHEUS',
      'Matheus',
      'matheus',
      'MATHEUS ',
      ' MATHEUS'
    ];
    
    for (const variation of nameVariations) {
      try {
        const { data: testUser, error: testError } = await serviceClient
          .from('users')
          .select('*')
          .eq('name', variation)
          .single();
        
        if (testError) {
          console.log(`❌ Variação "${variation}" não encontrada: ${testError.message}`);
        } else {
          console.log(`✅ Variação "${variation}" encontrada:`);
          console.log(`  - ID: ${testUser.id}`);
          console.log(`  - Role: ${testUser.role}`);
          console.log(`  - Status: ${testUser.status}`);
        }
      } catch (testException) {
        console.log(`❌ Exceção ao testar "${variation}": ${testException.message}`);
      }
    }
    
    // 6. Verificar se há problemas com a lista de operadores
    console.log('\n📋 PASSO 6: Verificando lista completa de operadores...');
    
    const { data: allOperators, error: opsError } = await serviceClient
      .from('users')
      .select('*')
      .eq('role', 'operador')
      .eq('status', 'ativo')
      .order('name', { ascending: true });
    
    if (opsError) {
      console.log('❌ Erro ao listar operadores:', opsError.message);
    } else {
      console.log(`✅ Encontrados ${allOperators.length} operadores ativos:`);
      
      const matheusInList = allOperators.find(op => op.name === 'MATHEUS');
      
      if (matheusInList) {
        console.log('✅ Matheus está na lista de operadores');
        console.log(`  - Posição: ${allOperators.findIndex(op => op.name === 'MATHEUS') + 1}`);
      } else {
        console.log('❌ Matheus NÃO está na lista de operadores');
      }
      
      console.log('\n📋 Lista completa:');
      allOperators.forEach((op, index) => {
        const isMatheus = op.name === 'MATHEUS';
        const marker = isMatheus ? '👤' : '  ';
        console.log(`${marker} ${index + 1}. ${op.name} (${op.email || 'sem email'})`);
      });
    }
    
    // 7. Diagnóstico final
    console.log('\n🎯 DIAGNÓSTICO FINAL:');
    console.log('='.repeat(50));
    
    console.log('\n📊 FATOS CONFIRMADOS:');
    console.log(`✅ Matheus no banco: ${matheus.role} (operador)`);
    console.log(`✅ Matheus ativo: ${matheus.status}`);
    console.log(`✅ Matheus email: ${matheus.email}`);
    console.log(`✅ Matheus ID: ${matheus.id}`);
    
    console.log('\n🔍 PROVÁVEL CAUSA:');
    if (!hasMatheus) {
      console.log('❌ Matheus NÃO está no userMapping.ts');
      console.log('🔧 Isso pode impedir que apareça na lista de login');
    } else {
      console.log('❌ Problema pode estar no frontend (cache, contexto, etc.)');
    }
    
    console.log('\n🎯 SOLUÇÕES:');
    console.log('='.repeat(30));
    
    console.log('\n🔧 PARA O DESENVOLVEDOR:');
    console.log('  1. Adicionar Matheus ao userMapping.ts');
    console.log('  2. Verificar se há lista fixa de usuários no frontend');
    console.log('  3. Limpar cache do localStorage');
    console.log('  4. Verificar contexto React');
    console.log('  5. Forçar reload da aplicação');
    
    console.log('\n🔧 PARA O USUÁRIO:');
    console.log('  1. Limpar cache do navegador');
    console.log('  2. Usar modo incógnito');
    console.log('  3. Recarregar a página (Ctrl+F5)');
    console.log('  4. Tentar login com:');
    console.log('     - Nome: MATHEUS');
    console.log('     - Email: matheus@escala-bmi.com');
    console.log('     - Senha: 1234');
    
    console.log('\n🚀 TESTE FINAL:');
    console.log('  Acesse: https://escalasbmi.vercel.app');
    console.log('  Matheus deverá aparecer na lista de login');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugMatheusFrontend();
