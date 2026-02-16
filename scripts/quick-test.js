/**
 * Script rápido para testar se o ambiente está configurado
 */

console.log('🔧 Teste Rápido de Configuração - Backup System\n');

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
  console.log('❌ SUPABASE_URL não configurado');
  console.log('💡 Execute: export SUPABASE_URL="https://your-project-ref.supabase.co"');
} else {
  console.log('✅ SUPABASE_URL configurado');
}

if (!supabaseKey || supabaseKey === 'your-service-role-key') {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurado');
  console.log('💡 Execute: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY configurado');
}

if (!supabaseUrl || !supabaseKey || 
    supabaseUrl === 'https://your-project-ref.supabase.co' || 
    supabaseKey === 'your-service-role-key') {
  console.log('\n📋 Para configurar o ambiente:');
  console.log('1. Obtenha suas credenciais no painel Supabase');
  console.log('2. Execute os comandos abaixo:');
  console.log('   export SUPABASE_URL="https://your-project-ref.supabase.co"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.log('3. Execute: node scripts/test-backup-config.js');
  console.log('\n📖 Para mais detalhes, veja: scripts/setup-backup-secrets.md');
} else {
  console.log('\n🎉 Ambiente configurado! Execute o teste completo:');
  console.log('node scripts/test-backup-config.js');
}
