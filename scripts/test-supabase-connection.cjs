/**
 * TESTE DE CONEXÃO SUPABASE
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

console.log('🔗 Testando conexão com Supabase...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${serviceRoleKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  try {
    console.log('\n📡 Fazendo ping na API...');

    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      console.log('❌ Erro de conexão:', error.message);
      console.log('Detalhes:', error);

      // Try without selecting anything
      console.log('\n🔄 Tentando conexão básica...');
      const { data: testData, error: testError } = await supabase.auth.getSession();
      console.log('Auth session:', testError ? testError.message : 'OK');
    } else {
      console.log('✅ Conexão OK!');
      console.log('Dados recebidos:', data);
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

testConnection();
