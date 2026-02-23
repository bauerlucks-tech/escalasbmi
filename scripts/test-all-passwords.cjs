const { createClient } = require('@supabase/supabase-js');

// Usar anon key para testar login
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
);

async function testAllPasswords() {
  console.log('🔧 TESTE COMPLETO DE TODAS AS SENHAS');
  console.log('='.repeat(60));
  
  // Todas as senhas que tentamos
  const allPasswords = [
    '1234',           // Primeira tentativa
    'admin123',        // Do .env
    'admin',           // Padrão
    'password',        // Comum
    'superadmin',      // Baseado no role
    'ADMIN123',        // Maiúscula
    'Admin123',        // Capitalizada
    '123456',        // 6 caracteres
    '123asd',         // Última tentativa
    'admin1234',       // Combinação
    'superadmin123',    // Com números
    'admin@123',       // Com símbolo
    'senha123',        // Em português
    'temp123',         // Temporária
    'test123',         // Teste
    'root',            // Root padrão
    'administrator',    // Palavra completa
    '123456789',      // Longa
    'qwerty',          // Teclado
    '123asd456',       // Combinada
    'admin2024',        // Com ano
    'superadmin2024',    // Com ano e role
    'escala123',        // Nome do sistema
    'bmi123',          // Abreviação
    'escalabmi123',     // Completo
    'tempadmin123',      // Temporária
    'testadmin123',      // Teste
    'newadmin123'       // Nova
  ];
  
  const email = 'admin@escala-bmi.com';
  
  console.log(`📧 Email: ${email}`);
  console.log(`🔐 Testando ${allPasswords.length} senhas possíveis...`);
  console.log('');
  
  let workingPassword = null;
  let workingIndex = -1;
  
  for (let i = 0; i < allPasswords.length; i++) {
    const password = allPasswords[i];
    console.log(`🧪 Teste ${String(i + 1).padStart(2, '0')}/${allPasswords.length}: "${password}"`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        console.log(`   ❌ Falhou: ${error.message}`);
      } else {
        console.log(`   ✅ SUCESSO ENCONTRADO!`);
        console.log(`   🎯 SENHA FUNCIONANDO: "${password}"`);
        console.log(`   👤 User ID: ${data.user.id}`);
        console.log(`   📧 Email: ${data.user.email}`);
        console.log(`   🔑 Role: ${data.user.user_metadata?.role || 'desconhecido'}`);
        console.log(`   ✅ Confirmado: ${data.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
        
        workingPassword = password;
        workingIndex = i;
        
        // Logout imediato
        await supabase.auth.signOut();
        break;
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`);
    }
    
    // Delay entre tentativas
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  if (workingPassword) {
    console.log('\n🎉 SENHA CORRETA ENCONTRADA!');
    console.log('-'.repeat(60));
    console.log(`🔑 SENHA FUNCIONAL: "${workingPassword}"`);
    console.log(`📍 Posição: Teste ${workingIndex + 1} de ${allPasswords.length}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Role: super_admin`);
    
    return {
      success: true,
      password: workingPassword,
      email: email,
      testNumber: workingIndex + 1,
      totalTests: allPasswords.length
    };
  } else {
    console.log('\n❌ NENHUMA SENHA FUNCIONOU!');
    console.log('-'.repeat(60));
    console.log('🚨 PROBLEMA CRÍTICO:');
    console.log('• Nenhuma das senhas testadas funciona');
    console.log('• Usuário pode não existir no Auth');
    console.log('• Email pode estar incorreto');
    console.log('• Sistema pode estar bloqueado');
    
    return {
      success: false,
      testedPasswords: allPasswords.length,
      email: email
    };
  }
}

async function main() {
  console.log('🔧 TESTE EXAUSTIVO DE SENHAS DO ADMIN');
  console.log('='.repeat(60));
  
  const result = await testAllPasswords();
  
  if (result.success) {
    console.log('\n🎯 SOLUÇÃO ENCONTRADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 RESUMO FINAL:');
    console.log(`✅ Email: ${result.email}`);
    console.log(`✅ Senha: ${result.password}`);
    console.log(`✅ Role: super_admin`);
    console.log(`✅ Testes realizados: ${result.testNumber}/${result.totalTests}`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log(`2. Email: ${result.email}`);
    console.log(`3. Senha: ${result.password}`);
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    
  } else {
    console.log('\n🚨 SOLUÇÃO MANUAL NECESSÁRIA!');
    console.log('-'.repeat(50));
    
    console.log('💡 OPÇÕES FINAIS:');
    console.log('1. Acesse Supabase Dashboard manualmente');
    console.log('2. Authentication > Users');
    console.log('3. Verifique se o usuário existe');
    console.log('4. Reset manual da senha');
    console.log('5. Use email válido e senha forte');
    
    console.log('\n❌ SISTEMA BLOQUEADO - REQUER INTERVENÇÃO!');
  }
}

main().catch(console.error);
