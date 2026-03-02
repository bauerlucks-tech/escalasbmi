const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function debugMatheusSimple() {
  console.log('🔍 DEBUG SIMPLES DO MATHEUS');
  console.log('='.repeat(40));
  
  try {
    // 1. Verificar Matheus no banco
    console.log('\n📋 Verificando Matheus no banco...');
    
    const { data: matheus, error: findError } = await serviceClient
      .from('users')
      .select('*')
      .eq('name', 'MATHEUS')
      .single();
    
    if (findError) {
      console.log('❌ Matheus não encontrado:', findError.message);
      return;
    }
    
    console.log('✅ Matheus encontrado:');
    console.log(`  - Nome: ${matheus.name}`);
    console.log(`  - Email: ${matheus.email}`);
    console.log(`  - Senha: ${matheus.password}`);
    console.log(`  - Role: ${matheus.role}`);
    console.log(`  - Status: ${matheus.status}`);
    console.log(`  - ID: ${matheus.id}`);
    
    // 2. Verificar userMapping
    console.log('\n📋 Verificando userMapping...');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const userMappingPath = path.join(__dirname, '../src/config/userMapping.ts');
      const userMappingContent = fs.readFileSync(userMappingPath, 'utf8');
      
      const hasMatheus = userMappingContent.includes('MATHEUS');
      
      if (hasMatheus) {
        console.log('✅ Matheus está no userMapping.ts');
        
        const uuidMatch = userMappingContent.match(/'MATHEUS':\s*'([^']+)'/);
        const mappedUUID = uuidMatch ? uuidMatch[1] : null;
        
        console.log(`🔍 UUID no userMapping: ${mappedUUID}`);
        console.log(`🔍 UUID real no banco: ${matheus.id}`);
        
        if (mappedUUID !== matheus.id) {
          console.log('❌ UUID incorreto no userMapping!');
          console.log('🔧 Precisa atualizar userMapping.ts');
        } else {
          console.log('✅ UUID correto no userMapping');
        }
      } else {
        console.log('❌ Matheus NÃO está no userMapping.ts');
        console.log('🔧 Este é o problema!');
      }
    } catch (mappingError) {
      console.log('❌ Erro ao ler userMapping:', mappingError.message);
    }
    
    // 3. Listar todos os operadores
    console.log('\n📋 Listando todos os operadores...');
    
    const { data: operators, error: opsError } = await serviceClient
      .from('users')
      .select('name, email, status')
      .eq('role', 'operador')
      .eq('status', 'ativo')
      .order('name', { ascending: true });
    
    if (opsError) {
      console.log('❌ Erro ao listar operadores:', opsError.message);
    } else {
      console.log(`✅ Encontrados ${operators.length} operadores ativos:`);
      
      const matheusInList = operators.find(op => op.name === 'MATHEUS');
      
      if (matheusInList) {
        console.log('✅ Matheus está na lista de operadores do banco');
      } else {
        console.log('❌ Matheus NÃO está na lista de operadores do banco');
      }
      
      console.log('\n📋 Lista completa:');
      operators.forEach((op, index) => {
        const isMatheus = op.name === 'MATHEUS';
        const marker = isMatheus ? '👤' : '  ';
        console.log(`${marker} ${index + 1}. ${op.name} (${op.email || 'sem email'})`);
      });
    }
    
    // 4. Diagnóstico
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('='.repeat(30));
    
    console.log('\n📊 Status do Matheus:');
    console.log(`✅ Banco de dados: ${matheus.role} - ${matheus.status}`);
    console.log(`✅ Email: ${matheus.email}`);
    console.log(`✅ ID: ${matheus.id}`);
    
    console.log('\n🔍 Problema provável:');
    if (!hasMatheus) {
      console.log('❌ Matheus não está no userMapping.ts');
      console.log('🔧 Isso impede que apareça na lista de login do frontend');
      console.log('🔧 O frontend usa userMapping para montar a lista');
    } else {
      console.log('❌ Problema pode ser cache do frontend');
      console.log('🔧 Ou contexto React desatualizado');
    }
    
    console.log('\n🎯 SOLUÇÃO:');
    if (!hasMatheus) {
      console.log('🔧 Adicionar Matheus ao userMapping.ts');
      console.log(`'MATHEUS': '${matheus.id}',`);
    } else {
      console.log('🔧 Limpar cache do navegador');
      console.log('🔧 Recarregar a aplicação');
    }
    
    console.log('\n🚀 INSTRUÇÕES FINAIS:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log('2. Use: MATHEUS / 1234');
    console.log('3. Matheus deverá aparecer na lista');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugMatheusSimple();
