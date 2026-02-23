/**
 * Script para buscar o UUID do usuário GUILHERME
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjMzNjQsImV4cCI6MjA4NTQ5OTM2NH0.EarBTpSeSO9JcA_6jH6wmz0l_iVwg8pVO7_ASWXkOK8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getGuilhermeUUID() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('name', 'GUILHERME')
    .single();

  if (error) {
    console.error('Erro:', error.message);
    return;
  }

  console.log('UUID de GUILHERME:', data.id);
  console.log('Nome:', data.name);
}

getGuilhermeUUID();
