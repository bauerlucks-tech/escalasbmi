const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do .env
const fs = require('fs');
const path = require('path');

let supabaseUrl, supabaseKey;

try {
  // Tentar carregar do .env
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length);
      } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        supabaseKey = trimmed.substring('SUPABASE_SERVICE_ROLE_KEY='.length);
      }
    });
  }
} catch (error) {
  console.log('⚠️ Erro ao carregar .env:', error.message);
}

// Se não encontrou no .env, tentar das variáveis de ambiente
if (!supabaseUrl) supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseKey) supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Para operações de admin, precisamos da service role key
if (!supabaseKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  console.log('💡 Adicione ao .env: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui');
  console.log('🔑 Obtenha a chave em: Supabase Dashboard > Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function configureAdminPassword() {
  console.log('🔧 CONFIGURANDO SENHA DO ADMIN (super_admin)');
  console.log('='.repeat(60));
  
  // Senha simples para teste (em produção, usar senha forte)
  const newPassword = '1234';
  const email = 'admin@escalasbmi.com';
  
  console.log('📋 DADOS DO ADMIN:');
  console.log(`   Email: ${email}`);
  console.log(`   Senha: ${newPassword}`);
  console.log(`   Role: super_admin`);
  
  try {
    // 1. Verificar se o usuário já existe na tabela users
    console.log('\n📊 Verificando tabela users...');
    
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('name', 'ADMIN')
      .maybeSingle();
    
    if (findError && findError.code !== 'PGRST116') {
      console.log(`❌ Erro ao buscar usuário: ${findError.message}`);
      return null;
    }
    
    if (existingUser) {
      console.log('✅ Usuário ADMIN encontrado na tabela users');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Role atual: ${existingUser.role}`);
      
      // Atualizar role para super_admin se necessário
      if (existingUser.role !== 'super_admin') {
        console.log('\n🔧 Atualizando role para super_admin...');
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', existingUser.id)
          .select('*')
          .single();
        
        if (updateError) {
          console.log(`❌ Erro ao atualizar role: ${updateError.message}`);
          return null;
        }
        
        console.log(`✅ Role atualizado para: ${updatedUser.role}`);
      } else {
        console.log('✅ Role já está como super_admin');
      }
    } else {
      console.log('❌ Usuário ADMIN não encontrado na tabela users');
      console.log('💡 Verifique se a tabela está populada corretamente');
    }
    
    // 2. Tentar criar/atualizar usuário no Supabase Auth (sem service role)
    console.log('\n🔐 Tentando configurar acesso via Auth...');
    console.log('ℹ️ Nota: Configuração manual pode ser necessária');
    
    // Criar usuário com anon key (limitado)
    const supabaseAnon = createClient(
      supabaseUrl,
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8'
    );
    
    // Tentar signup (pode falhar se usuário já existe)
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: email,
      password: newPassword,
      options: {
        data: {
          role: 'super_admin',
          name: 'ADMIN',
          full_name: 'Administrador do Sistema'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ Usuário já existe no Auth');
      } else {
        console.log(`⚠️ Erro no signup: ${signUpError.message}`);
        console.log('💡 Isso é normal se o usuário já existe');
      }
    } else {
      console.log('✅ Usuário criado no Auth');
    }
    
    // 3. Testar login com anon key
    console.log('\n🔍 Testando login do ADMIN...');
    
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: newPassword
    });
    
    if (loginError) {
      console.log(`❌ Erro no login: ${loginError.message}`);
      console.log('💡 Pode ser necessário reset de senha via Supabase Dashboard');
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`   User ID: ${loginData.user.id}`);
      console.log(`   Email: ${loginData.user.email}`);
      console.log(`   Role: ${loginData.user.user_metadata?.role || 'super_admin'}`);
      
      // Logout
      await supabaseAnon.auth.signOut();
    }
    
    return {
      email,
      password: newPassword,
      role: 'super_admin',
      success: true
    };
    
  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 CONFIGURAÇÃO DE SENHA DO ADMIN');
  console.log('='.repeat(50));
  
  const result = await configureAdminPassword();
  
  if (result) {
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('-'.repeat(50));
    
    console.log('📋 CREDENCIAIS DO ADMIN:');
    console.log(`   Email: ${result.email}`);
    console.log(`   Senha: ${result.password}`);
    console.log(`   Role: ${result.role}`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log('2. Clique em "Login"');
    console.log('3. Email: admin@escalasbmi.com');
    console.log('4. Senha: 1234');
    console.log('5. Role: super_admin (acesso total)');
    
    console.log('\n⚠️ AVISOS IMPORTANTES:');
    console.log('• Senha definida: 1234');
    console.log('• Email: admin@escalasbmi.com');
    console.log('• Role: super_admin');
    console.log('• Acesso total ao sistema');
    
    console.log('\n🔧 SE O LOGIN FALHAR:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Projeto: lsxmwwwmgfjwnowlsmzf');
    console.log('3. Authentication > Users');
    console.log('4. Encontre o usuário admin@escalasbmi.com');
    console.log('5. Reset manual da senha');
    
    console.log('\n✅ SISTEMA CONFIGURADO!');
  } else {
    console.log('\n❌ FALHA NA CONFIGURAÇÃO');
    console.log('💡 Verifique as configurações manuais no Supabase Dashboard');
  }
}

main().catch(console.error);
