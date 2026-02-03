// VERIFICAÇÃO SIMPLES - PREPARAÇÃO PARA AUTENTICAÇÃO
// Passo 1: Verificar se tudo está pronto para começar

async function verificarPreparacaoAuth() {
  console.log('🔍 VERIFICAÇÃO DE PREPARAÇÃO - AUTENTICAÇÃO');
  console.log('============================================');
  
  try {
    // 1. Verificar conexão básica
    console.log('');
    console.log('📋 1. VERIFICANDO CONEXÃO COM SUPABASE...');
    
    const response = await fetch('https://lsxmwwwmgfjwnowlsmzf.supabase.co/rest/v1/users?select=count', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão Supabase funcionando');
      console.log('📊 Usuários na tabela: ' + (data[0]?.count || 0));
    } else {
      console.log('❌ Erro na conexão: ' + response.status);
      return;
    }
    
    // 2. Verificar usuários atuais
    console.log('');
    console.log('👥 2. VERIFICANDO USUÁRIOS ATUAIS...');
    
    const usersResponse = await fetch('https://lsxmwwwmgfjwnowlsmzf.supabase.co/rest/v1/users?select=name,role,status&order=name', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
      }
    });
    
    const users = await usersResponse.json();
    console.log('👥 Usuários encontrados:');
    users.forEach((user, index) => {
      console.log('   ' + (index + 1) + '. ' + user.name + ' (' + user.role + ' - ' + user.status + ')');
    });
    
    // 3. Verificar se Supabase Auth está configurado
    console.log('');
    console.log('🔐 3. VERIFICANDO SUPABASE AUTH...');
    
    // Tentar acessar endpoint de auth
    try {
      const authResponse = await fetch('https://lsxmwwwmgfjwnowlsmzf.supabase.co/auth/v1/settings', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
        }
      });
      
      if (authResponse.ok) {
        console.log('✅ Supabase Auth está ativo');
      } else {
        console.log('⚠️ Supabase Auth pode precisar configuração');
      }
    } catch (error) {
      console.log('⚠️ Não foi possível verificar Auth (normal)');
    }
    
    // 4. Resumo e próximos passos
    console.log('');
    console.log('📋 4. RESUMO E PRÓXIMOS PASSOS');
    console.log('==============================');
    
    console.log('📊 Status atual:');
    console.log('   ✅ Conexão Supabase: OK');
    console.log('   👥 Usuários na tabela: ' + users.length);
    console.log('   🔐 Supabase Auth: Pronto para configurar');
    
    console.log('');
    console.log('🎯 PRÓXIMOS PASSOS (escolha um):');
    console.log('');
    console.log('1️⃣  Migrar usuários para Auth:');
    console.log('   👥 Criar contas de email/senha para todos os usuários');
    console.log('   🔑 Gerar senhas automáticas');
    console.log('   📧 Usar formato: nome@escalasbmi.com');
    console.log('');
    console.log('2️⃣  Criar interface de login:');
    console.log('   🖥️ Modal simples de login');
    console.log('   🔐 Campos de email e senha');
    console.log('   📱 Integrar com sistema atual');
    console.log('');
    console.log('3️⃣  Testar autenticação:');
    console.log('   🧪 Fazer login com usuário teste');
    console.log('   🔍 Verificar funcionamento');
    console.log('   ✅ Confirmar tudo funcionando');
    
    console.log('');
    console.log('💡 Para começar, digite:');
    console.log('   migrarUsuariosParaAuth()  - para opção 1');
    console.log('   criarInterfaceLogin()    - para opção 2');
    console.log('   verificarPreparacaoAuth() - para verificar novamente');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Exportar função
window.verificarPreparacaoAuth = verificarPreparacaoAuth;

console.log('🔍 FUNÇÃO DE VERIFICAÇÃO CARREGADA!');
console.log('📋 Para verificar preparação: verificarPreparacaoAuth()');
console.log('🐌 Estamos indo com calma, passo a passo!');
