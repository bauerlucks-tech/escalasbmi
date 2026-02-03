// MIGRAÇÃO DE USUÁRIOS PARA SUPABASE AUTH - VERSÃO SIMPLES
// Script focado apenas na migração das contas

async function migrarUsuariosParaAuth() {
  console.log('👥 MIGRANDO USUÁRIOS PARA SUPABASE AUTH');
  console.log('=======================================');
  
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
    
    // 3. Migrar cada usuário
    console.log('');
    console.log('📧 3. CRIANDO CONTAS DE AUTENTICAÇÃO...');
    
    const migrationResults = [];
    
    for (const user of users) {
      console.log('👤 Migrando usuário:', user.name);
      
      // Gerar email e senha
      const email = user.name.toLowerCase().replace(/\s+/g, '.') + '@escalasbmi.com';
      const password = user.name.toLowerCase().replace(/\s+/g, '') + '123';
      
      console.log('   📧 Email:', email);
      console.log('   🔑 Senha:', password);
      
      try {
        // Criar usuário no Auth
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: user.name,
              role: user.role,
              original_id: user.id
            }
          }
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            console.log('   ⚠️ Usuário já existe no Auth');
            migrationResults.push({ 
              name: user.name, 
              status: 'exists', 
              email: email,
              password: password
            });
          } else {
            console.log('   ❌ Erro:', error.message);
            migrationResults.push({ 
              name: user.name, 
              status: 'error', 
              error: error.message 
            });
          }
        } else {
          console.log('   ✅ Usuário criado com sucesso');
          migrationResults.push({ 
            name: user.name, 
            status: 'created', 
            email: email,
            password: password,
            userId: data.user?.id
          });
        }
        
        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log('   ❌ Erro:', error.message);
        migrationResults.push({ 
          name: user.name, 
          status: 'error', 
          error: error.message 
        });
      }
    }
    
    // 4. Resumo da migração
    console.log('');
    console.log('📊 4. RESUMO DA MIGRAÇÃO');
    console.log('========================');
    
    const created = migrationResults.filter(r => r.status === 'created').length;
    const existing = migrationResults.filter(r => r.status === 'exists').length;
    const errors = migrationResults.filter(r => r.status === 'error').length;
    
    console.log('✅ Criados: ' + created);
    console.log('⚠️ Já existiam: ' + existing);
    console.log('❌ Erros: ' + errors);
    
    // 5. Mostrar credenciais
    console.log('');
    console.log('🔑 5. CREDENCIAIS DOS USUÁRIOS');
    console.log('==============================');
    
    migrationResults.forEach(result => {
      console.log('👤 ' + result.name);
      console.log('   📧 Email: ' + result.email);
      console.log('   🔑 Senha: ' + result.password);
      console.log('   📊 Status: ' + result.status);
      console.log('');
    });
    
    // 6. Testar login com um usuário
    if (migrationResults.length > 0) {
      console.log('🧪 6. TESTANDO LOGIN...');
      
      const testUser = migrationResults.find(r => r.status === 'created' || r.status === 'exists');
      if (testUser) {
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
    }
    
    // 7. Conclusão
    console.log('');
    console.log('🎉 7. CONCLUSÃO');
    console.log('================');
    
    if (created > 0 || existing > 0) {
      console.log('✅ Migração concluída com sucesso!');
      console.log('📋 Use as credenciais acima para fazer login');
      console.log('🔐 Sistema de autenticação pronto para uso');
      
      if (created > 0) {
        console.log('🆕 ' + created + ' novos usuários criados');
      }
      if (existing > 0) {
        console.log('🔄 ' + existing + ' usuários já existiam');
      }
    } else {
      console.log('❌ Migração falhou. Verifique os erros acima.');
    }
    
    console.log('');
    console.log('🔗 Próximo passo: criarInterfaceLogin()');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Exportar função
window.migrarUsuariosParaAuth = migrarUsuariosParaAuth;

console.log('👥 FUNÇÃO DE MIGRAÇÃO CARREGADA!');
console.log('🔧 Para migrar: migrarUsuariosParaAuth()');
console.log('🐌 Indo com calma, passo a passo!');
