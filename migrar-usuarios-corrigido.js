// MIGRAÇÃO DE USUÁRIOS - VERSÃO CORRIGIDA
// Usando emails temporários válidos e abordagem mais segura

async function migrarUsuariosCorrigido() {
  console.log('🔧 MIGRAÇÃO CORRIGIDA - USUÁRIOS PARA AUTH');
  console.log('==========================================');
  
  try {
    // 1. Carregar biblioteca Supabase
    console.log('📦 Carregando biblioteca Supabase...');
    
    if (typeof window.supabase === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    const { createClient } = window.supabase;
    const supabase = createClient(
      'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
    );
    
    console.log('✅ Biblioteca carregada');
    
    // 2. Buscar usuários atuais
    console.log('');
    console.log('📋 2. BUSCANDO USUÁRIOS ATUAIS...');
    
    const response = await fetch('https://lsxmwwwmgfjwnowlsmzf.supabase.co/rest/v1/users?select=*', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94'
      }
    });
    
    const users = await response.json();
    console.log('👥 Encontrados ' + users.length + ' usuários para migrar');
    
    // 3. Gerar emails válidos (usando domínios temporários)
    console.log('');
    console.log('📧 3. GERANDO EMAILS VÁLIDOS...');
    
    // Lista de domínios temporários válidos
    const tempDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com'];
    const userCredentials = [];
    
    users.forEach((user, index) => {
      const domain = tempDomains[index % tempDomains.length];
      const email = user.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000) + '@' + domain;
      const password = user.name.toLowerCase().replace(/\s+/g, '') + '123';
      
      userCredentials.push({
        name: user.name,
        email: email,
        password: password,
        role: user.role,
        original_id: user.id
      });
      
      console.log('👤 ' + user.name + ':');
      console.log('   📧 Email: ' + email);
      console.log('   🔑 Senha: ' + password);
    });
    
    // 4. Migrar usuários um por um com pausa longa
    console.log('');
    console.log('🔄 4. MIGRANDO USUÁRIOS (COM PAUSA)...');
    
    const migrationResults = [];
    
    for (let i = 0; i < userCredentials.length; i++) {
      const user = userCredentials[i];
      
      console.log('🔄 Migrando usuário ' + (i + 1) + '/' + userCredentials.length + ': ' + user.name);
      
      try {
        // Criar usuário no Auth
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
              role: user.role,
              original_id: user.original_id
            }
          }
        });
        
        if (error) {
          console.log('   ❌ Erro:', error.message);
          migrationResults.push({
            name: user.name,
            email: user.email,
            password: user.password,
            status: 'error',
            error: error.message
          });
        } else {
          console.log('   ✅ Usuário criado com sucesso');
          migrationResults.push({
            name: user.name,
            email: user.email,
            password: user.password,
            status: 'created',
            userId: data.user?.id
          });
        }
        
        // Pausa longa para evitar rate limit
        if (i < userCredentials.length - 1) {
          console.log('   ⏳ Aguardando 10 segundos para evitar rate limit...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
      } catch (error) {
        console.log('   ❌ Erro:', error.message);
        migrationResults.push({
          name: user.name,
          email: user.email,
          password: user.password,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // 5. Resumo da migração
    console.log('');
    console.log('📊 5. RESUMO DA MIGRAÇÃO');
    console.log('========================');
    
    const created = migrationResults.filter(r => r.status === 'created').length;
    const errors = migrationResults.filter(r => r.status === 'error').length;
    
    console.log('✅ Criados: ' + created);
    console.log('❌ Erros: ' + errors);
    
    // 6. Mostrar credenciais dos usuários criados
    console.log('');
    console.log('🔑 6. CREDENCIAIS DOS USUÁRIOS');
    console.log('==============================');
    
    migrationResults.forEach(result => {
      console.log('👤 ' + result.name);
      console.log('   📧 Email: ' + result.email);
      console.log('   🔑 Senha: ' + result.password);
      console.log('   📊 Status: ' + result.status);
      if (result.error) {
        console.log('   ❌ Erro: ' + result.error);
      }
      console.log('');
    });
    
    // 7. Testar login se tiver sucesso
    const successfulUsers = migrationResults.filter(r => r.status === 'created');
    if (successfulUsers.length > 0) {
      console.log('🧪 7. TESTANDO LOGIN...');
      
      const testUser = successfulUsers[0];
      console.log('🧪 Testando login com:', testUser.email);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password
        });
        
        if (error) {
          console.log('❌ Falha no teste de login:', error.message);
        } else {
          console.log('✅ Login testado com sucesso!');
          console.log('👤 Usuário:', data.user.email);
          
          // Fazer logout
          await supabase.auth.signOut();
          console.log('🚪 Logout realizado');
        }
      } catch (error) {
        console.log('❌ Erro no teste:', error.message);
      }
    }
    
    // 8. Conclusão
    console.log('');
    console.log('🎉 8. CONCLUSÃO');
    console.log('================');
    
    if (created > 0) {
      console.log('✅ Migração parcialmente concluída!');
      console.log('🆕 ' + created + ' usuários criados com sucesso');
      console.log('📋 Use as credenciais acima para fazer login');
      console.log('🔐 Sistema de autenticação parcialmente pronto');
      
      if (errors > 0) {
        console.log('⚠️ ' + errors + ' usuários falharam (rate limit)');
        console.log('💡 Tente novamente mais tarde para os usuários restantes');
      }
    } else {
      console.log('❌ Migração falhou. Verifique os erros acima.');
      console.log('💡 Possíveis causas: rate limit, emails inválidos, configuração Supabase');
    }
    
    console.log('');
    console.log('🔗 Próximo passo: criarInterfaceLogin()');
    console.log('💡 Ou tentar novamente mais tarde: migrarUsuariosCorrigido()');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Função alternativa - criar apenas um usuário de teste
async function criarUsuarioTeste() {
  console.log('🧪 CRIANDO USUÁRIO DE TESTE');
  console.log('===========================');
  
  try {
    // Carregar biblioteca se necessário
    if (typeof window.supabase === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    const { createClient } = window.supabase;
    const supabase = createClient(
      'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
    );
    
    // Criar usuário de teste
    const testEmail = 'test' + Date.now() + '@10minutemail.com';
    const testPassword = 'test123';
    
    console.log('📧 Email de teste:', testEmail);
    console.log('🔑 Senha de teste:', testPassword);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'USUARIO TESTE',
          role: 'operador'
        }
      }
    });
    
    if (error) {
      console.log('❌ Erro ao criar usuário:', error.message);
    } else {
      console.log('✅ Usuário de teste criado com sucesso!');
      console.log('👤 ID:', data.user?.id);
      
      // Testar login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (loginError) {
        console.log('❌ Falha no login:', loginError.message);
      } else {
        console.log('✅ Login testado com sucesso!');
        console.log('👤 Usuário logado:', loginData.user.email);
        
        // Logout
        await supabase.auth.signOut();
        console.log('🚪 Logout realizado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Exportar funções
window.migrarUsuariosCorrigido = migrarUsuariosCorrigido;
window.criarUsuarioTeste = criarUsuarioTeste;

console.log('🔧 FUNÇÕES DE MIGRAÇÃO CORRIGIDAS CARREGADAS!');
console.log('🔄 Para migrar: migrarUsuariosCorrigido()');
console.log('🧪 Para criar usuário teste: criarUsuarioTeste()');
console.log('🐌 Versão corrigida com emails válidos!');
