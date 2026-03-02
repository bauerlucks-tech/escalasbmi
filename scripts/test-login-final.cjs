const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginFinal() {
  console.log('🔍 TESTE FINAL DE LOGIN');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar usuário ADMIN
    console.log('\n📋 PASSO 1: Verificando usuário ADMIN...');
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@escala-bmi.com')
      .single();
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log(`  - Nome: ${user.name}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Senha: ${user.password}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Status: ${user.status}`);
    
    // 2. Testar login direto (senha em texto puro)
    console.log('\n📋 PASSO 2: Testando login direto...');
    
    const testPassword = '1234';
    
    if (user.password === testPassword) {
      console.log('✅ LOGIN DIRETO BEM-SUCEDIDO!');
      console.log('🎉 Senha "1234" está correta (texto puro)');
      
      // Criar sessão simulada
      const session = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('\n🎫 Sessão criada:');
      console.log(JSON.stringify(session, null, 2));
      
      console.log('\n🔐 INSTRUÇÕES FINAIS:');
      console.log('1. Acesse: https://escalasbmi.vercel.app');
      console.log('2. Usuário: ADMIN');
      console.log('3. Senha: 1234');
      console.log('4. Role: super_admin');
      console.log('5. Status: ativo');
      
      console.log('\n🚀 O FRONTEND PRECISA USAR LOGIN DIRETO!');
      console.log('📋 Implementação necessária:');
      console.log('- Usar service role key');
      console.log('- Consultar tabela users diretamente');
      console.log('- Comparar senha em texto puro');
      console.log('- Criar sessão manual');
      
    } else {
      console.log('❌ Senha incorreta');
      console.log(`🔍 Senha no banco: "${user.password}"`);
      console.log(`🔍 Senha testada: "${testPassword}"`);
    }
    
    // 3. Verificar se há outros usuários
    console.log('\n📋 PASSO 3: Verificando outros usuários...');
    
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('name, email, role, status')
      .order('created_at', { ascending: false });
    
    if (!allUsersError) {
      console.log(`✅ Total de usuários: ${allUsers.length}`);
      allUsers.forEach(u => {
        console.log(`  - ${u.name} (${u.email}) - ${u.role} - ${u.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testLoginFinal();
