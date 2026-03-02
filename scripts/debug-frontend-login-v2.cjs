const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFrontendLogin() {
  console.log('🔍 DEBUG FRONTEND LOGIN V2');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar se o usuário ADMIN existe
    console.log('\n📋 PASSO 1: Verificando usuário ADMIN...');
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'admin@escala-bmi.com')
      .limit(1);
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ Usuário ADMIN não encontrado');
      return;
    }
    
    const adminUser = users[0];
    console.log('✅ Usuário encontrado:', adminUser.email);
    console.log('📛 Nome:', adminUser.nome);
    console.log('🔐 Role:', adminUser.role);
    console.log('🔑 Hash da senha:', adminUser.senha ? 'Presente' : 'Ausente');
    
    // 2. Testar validação da senha '1234'
    console.log('\n📋 PASSO 2: Testando validação da senha...');
    
    // Importar bcrypt para verificação
    const bcrypt = require('bcryptjs');
    
    // Testar diferentes senhas
    const testPasswords = ['1234', 'admin', '123asd', 'password'];
    
    for (const password of testPasswords) {
      console.log(`\n🔍 Testando senha: "${password}"`);
      
      try {
        const isValid = await bcrypt.compare(password, adminUser.senha);
        console.log(isValid ? '✅ Senha válida!' : '❌ Senha inválida');
        
        if (isValid) {
          console.log(`🎉 SENHA CORRETA ENCONTRADA: "${password}"`);
          break;
        }
      } catch (bcryptError) {
        console.error('❌ Erro no bcrypt:', bcryptError.message);
      }
    }
    
    // 3. Verificar se há algum problema com o frontend
    console.log('\n📋 PASSO 3: Verificando configuração do frontend...');
    
    // Verificar se a service role key está correta
    console.log('🔑 Service Role Key:', supabaseKey.substring(0, 20) + '...');
    
    // Verificar se o usuário está ativo
    console.log('📊 Status do usuário:', adminUser.ativo ? 'Ativo' : 'Inativo');
    
    // 4. Criar um token de teste para o frontend
    console.log('\n📋 PASSO 4: Criando token de teste...');
    
    const sessionData = {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        nome: adminUser.nome,
        role: adminUser.role
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('🎫 Token de sessão criado:');
    console.log(JSON.stringify(sessionData, null, 2));
    
    // 5. Verificar se há algum problema de cache ou CORS
    console.log('\n📋 PASSO 5: Verificando possíveis problemas...');
    console.log('🌐 URL do frontend:', 'https://escalasbmi.vercel.app');
    console.log('🗄️ URL do backend:', supabaseUrl);
    console.log('🔑 Service Role Key OK:', supabaseKey.length > 50);
    
    console.log('\n🎯 RECOMENDAÇÕES:');
    console.log('1. Limpar cache do navegador');
    console.log('2. Usar modo anônimo/incógnito');
    console.log('3. Verificar console do navegador para erros');
    console.log('4. Verificar se a service role key está sendo usada corretamente');
    console.log('5. Verificar se há algum bloqueio de CORS');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugFrontendLogin();
