// DEBUG DETALHADO DO CARREGAMENTO DE USUÁRIOS DO RICARDO
const path = require('path');
const { SupabaseAPI } = require(path.join(process.cwd(), 'src', 'lib', 'supabase.js'));

async function debugRicardoLoading() {
  console.log('🔍 DEBUG DETALHADO DO CARREGAMENTO DO RICARDO\n');

  try {
    console.log('📋 PASSO 1: Testando carregamento direto do Supabase...');
    const users = await SupabaseAPI.getUsers();
    console.log(`✅ ${users.length} usuários carregados do Supabase`);

    const ricardo = users.find(u => u.name === 'RICARDO');
    if (!ricardo) {
      console.log('❌ RICARDO não encontrado no Supabase!');
      return;
    }

    console.log('\n📋 PASSO 2: Dados brutos do RICARDO no Supabase:');
    console.log(JSON.stringify(ricardo, null, 2));

    console.log('\n📋 PASSO 3: Verificação de propriedades:');
    console.log('  - ID:', ricardo.id);
    console.log('  - Nome:', ricardo.name);
    console.log('  - Email:', ricardo.email);
    console.log('  - Role:', ricardo.role);
    console.log('  - Status:', ricardo.status);
    console.log('  - Hide from schedule:', ricardo.hide_from_schedule);
    console.log('  - Created at:', ricardo.created_at);
    console.log('  - Updated at:', ricardo.updated_at);

    console.log('\n📋 PASSO 4: Teste de conversão para AuthContext:');
    const convertedUser = {
      id: ricardo.id,
      name: ricardo.name,
      password: ricardo.password || '',
      role: ricardo.role,
      status: ricardo.status,
      email: ricardo.email,
      profileImage: ricardo.profileImage,
      hideFromSchedule: ricardo.hide_from_schedule
    };
    console.log('Usuário convertido:', JSON.stringify(convertedUser, null, 2));

    console.log('\n📋 PASSO 5: Verificação de role convertida:');
    console.log('  - Role original:', ricardo.role);
    console.log('  - Role convertida:', convertedUser.role);
    console.log('  - É administrador:', convertedUser.role === 'administrador' ? '✅ SIM' : '❌ NÃO');

    console.log('\n📋 PASSO 6: Teste de login:');
    try {
      const loginResult = await SupabaseAPI.signIn('ricardo@escala-bmi.com', '1234');
      if (loginResult && loginResult.user) {
        console.log('✅ Login bem-sucedido');
        console.log('  - Nome:', loginResult.user.name);
        console.log('  - Role:', loginResult.user.role);
        console.log('  - Status:', loginResult.user.status);
        console.log('  - É administrador:', loginResult.user.role === 'administrador' ? '✅ SIM' : '❌ NÃO');
      } else {
        console.log('❌ Login falhou');
      }
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.message);
    }

    console.log('\n📋 PASSO 7: Comparação com dados esperados:');
    const expected = {
      id: 'bbad7a98-2412-43e6-8dd6-cf52fae171be',
      name: 'RICARDO',
      role: 'administrador',
      status: 'ativo',
      email: 'ricardo@escala-bmi.com'
    };

    console.log('Dados esperados:');
    console.log(JSON.stringify(expected, null, 2));

    console.log('\nDados atuais:');
    console.log(JSON.stringify({
      id: ricardo.id,
      name: ricardo.name,
      role: ricardo.role,
      status: ricardo.status,
      email: ricardo.email
    }, null, 2));

    const matches = (
      ricardo.id === expected.id &&
      ricardo.name === expected.name &&
      ricardo.role === expected.role &&
      ricardo.status === expected.status &&
      ricardo.email === expected.email
    );

    console.log('\n🎯 RESULTADO FINAL:');
    console.log('  - Dados batem com esperado:', matches ? '✅ SIM' : '❌ NÃO');

    if (!matches) {
      console.log('  - Diferenças encontradas:');
      if (ricardo.id !== expected.id) console.log('    - ID diferente');
      if (ricardo.name !== expected.name) console.log('    - Nome diferente');
      if (ricardo.role !== expected.role) console.log('    - Role diferente:', ricardo.role, 'vs', expected.role);
      if (ricardo.status !== expected.status) console.log('    - Status diferente');
      if (ricardo.email !== expected.email) console.log('    - Email diferente');
    }

  } catch (error) {
    console.error('❌ Erro no debug:', error);
    console.error('Stack:', error.stack);
  }
}

debugRicardoLoading();
