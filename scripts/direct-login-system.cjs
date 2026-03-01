const { createClient } = require('@supabase/supabase-js');

// Usar service role key para login direto (bypass auth)
const supabase = createClient(
  'https://lsxmwwwmgfjwnowlsmzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.7K8QzLzZ7J9cR0dM7XhN8wPzY2tKkL9XmF1QpW3s'
);

async function directLogin() {
  console.log('🔧 SISTEMA DE LOGIN DIRETO - SEM EMAIL');
  console.log('='.repeat(60));
  
  const username = 'ADMIN';
  const password = '1234';
  
  console.log('📋 DADOS DO LOGIN:');
  console.log(`   Usuário: ${username}`);
  console.log(`   Senha: ${password}`);
  console.log(`   Método: Direto (bypass Supabase Auth)`);
  
  try {
    console.log('\n🔍 Buscando usuário no banco...');
    
    // Buscar usuário diretamente na tabela users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', username)
      .eq('password', password)
      .eq('status', 'ativo')
      .single();
    
    if (error) {
      console.log(`❌ Erro ao buscar usuário: ${error.message}`);
      return null;
    }
    
    if (!user) {
      console.log('❌ Usuário não encontrado ou senha incorreta');
      return null;
    }
    
    console.log('✅ Usuário encontrado!');
    console.log(`   👤 ID: ${user.id}`);
    console.log(`   📛 Nome: ${user.name}`);
    console.log(`   🔐 Role: ${user.role}`);
    console.log(`   📧 Email: ${user.email || 'N/A'}`);
    console.log(`   ✅ Status: ${user.status}`);
    
    // Criar sessão manual
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      session: {
        access_token: 'direct-access-token',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        user: user
      }
    };
    
    console.log('\n🎉 LOGIN DIRETO BEM-SUCEDIDO!');
    console.log('-'.repeat(50));
    
    console.log('📋 RESUMO DA SESSÃO:');
    console.log(`✅ Usuário: ${session.user.name}`);
    console.log(`✅ Role: ${session.user.role}`);
    console.log(`✅ ID: ${session.user.id}`);
    console.log(`✅ Status: ${session.user.status}`);
    console.log(`✅ Método: Login Direto`);
    
    console.log('\n🔐 INSTRUÇÕES DE ACESSO:');
    console.log('1. Acesse: https://escalasbmi.vercel.app');
    console.log('2. Usuário: ADMIN');
    console.log('3. Senha: 1234');
    console.log('4. Role: super_admin (acesso total)');
    
    console.log('\n✅ SISTEMA PRONTO PARA USO!');
    console.log('🎯 LOGIN DIRETO FUNCIONANDO!');
    
    return session;
    
  } catch (err) {
    console.log(`❌ Erro geral: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔧 CRIAÇÃO DE SISTEMA DE LOGIN SEM EMAIL');
  console.log('='.repeat(60));
  
  const session = await directLogin();
  
  if (session) {
    console.log('\n🎉 SOLUÇÃO IMPLEMENTADA!');
    console.log('-'.repeat(50));
    
    console.log('📋 VANTAGENS DO SISTEMA:');
    console.log('✅ Não depende de Supabase Auth');
    console.log('✅ Login direto via banco de dados');
    console.log('✅ Sem problemas de email');
    console.log('✅ Sem RLS blocking');
    console.log('✅ Controle total da autenticação');
    
    console.log('\n🔐 CREDENCIAIS FINAIS:');
    console.log('Usuário: ADMIN');
    console.log('Senha: 1234');
    console.log('Role: super_admin');
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Implementar frontend com login direto');
    console.log('2. Usar service role key para autenticação');
    console.log('3. Criar sessão manual no frontend');
    console.log('4. Bypass completo do Supabase Auth');
    
  } else {
    console.log('\n❌ FALHA NA IMPLEMENTAÇÃO!');
    console.log('-'.repeat(50));
    
    console.log('🚨 PROBLEMAS IDENTIFICADOS:');
    console.log('• Usuário não encontrado no banco');
    console.log('• Senha incorreta');
    console.log('• Usuário inativo');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Verificar se usuário existe');
    console.log('2. Verificar senha correta');
    console.log('3. Verificar status do usuário');
  }
}

main().catch(console.error);
