// VERIFICAR APENAS LOCAL STORAGE - SEM SUPABASE
// Script para diagnosticar dados atuais no localStorage

function verificarLocalStorageApenas() {
  console.log('📱 VERIFICANDO LOCAL STORAGE APENAS');
  console.log('==================================');
  
  try {
    // 1. Verificar escalas
    console.log('');
    console.log('📋 1. ESCALAS NO LOCAL STORAGE...');
    
    const scheduleStorage = localStorage.getItem('escala_scheduleStorage');
    
    if (scheduleStorage) {
      const schedules = JSON.parse(scheduleStorage);
      console.log(`✅ Encontradas ${schedules.length} escalas:`);
      
      schedules.forEach((schedule, index) => {
        const entriesCount = schedule.entries ? schedule.entries.length : 0;
        const isActive = schedule.isActive !== false ? 'ativo' : 'inativo';
        console.log(`   ${index + 1}. ${schedule.month}/${schedule.year} - ${entriesCount} dias (${isActive})`);
        
        // Mostrar algumas datas de exemplo
        if (schedule.entries && schedule.entries.length > 0) {
          const sampleDates = schedule.entries.slice(0, 3);
          const datesStr = sampleDates.map(e => e.date).join(', ');
          console.log(`      📅 Exemplo: ${datesStr}${schedule.entries.length > 3 ? '...' : ''}`);
        }
      });
    } else {
      console.log('❌ Nenhuma escala encontrada no localStorage');
      console.log('💡 Possíveis causas:');
      console.log('   - Reload limpou o localStorage');
      console.log('   - Dados nunca foram salvos');
      console.log('   - Nome da chave está diferente');
    }
    
    // 2. Verificar usuários
    console.log('');
    console.log('👥 2. USUÁRIOS NO LOCAL STORAGE...');
    
    const usersStorage = localStorage.getItem('escala_users');
    
    if (usersStorage) {
      const users = JSON.parse(usersStorage);
      console.log(`✅ Encontrados ${users.length} usuários:`);
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.role} (${user.status})`);
      });
    } else {
      console.log('❌ Nenhum usuário encontrado no localStorage');
    }
    
    // 3. Verificar outras chaves relacionadas
    console.log('');
    console.log('🔍 3. OUTRAS CHAVES RELACIONADAS...');
    
    const relatedKeys = [
      'escala_currentUser',
      'reactCurrentUser',
      'directAuth_currentUser',
      'currentUser',
      'schedules',
      'users'
    ];
    
    relatedKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`✅ ${key}: ${Array.isArray(parsed) ? parsed.length + ' itens' : typeof parsed}`);
        } catch {
          console.log(`✅ ${key}: ${typeof value} (${value.length} chars)`);
        }
      }
    });
    
    // 4. Sugestões
    console.log('');
    console.log('💡 5. SUGESTÕES...');
    
    if (!scheduleStorage) {
      console.log('🔧 Opção 1: Verificar se há dados em outra chave');
      console.log('🔧 Opção 2: Recriar escalas do zero');
      console.log('🔧 Opção 3: Verificar backup do navegador');
    } else {
      console.log('✅ Dados encontrados no localStorage!');
      console.log('🔧 Opção 1: Manter dados atuais');
      console.log('🔧 Opção 2: Exportar dados para backup');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Função para mostrar todas as chaves do localStorage
function mostrarTodasChaves() {
  console.log('🔍 TODAS AS CHAVES DO LOCAL STORAGE');
  console.log('==================================');
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      console.log(`📦 ${key}: ${value ? value.length + ' caracteres' : 'vazio'}`);
    }
  }
}

// Exportar funções
window.verificarLocalStorageApenas = verificarLocalStorageApenas;
window.mostrarTodasChaves = mostrarTodasChaves;

console.log('🔧 FERRAMENTAS DE LOCAL STORAGE CARREGADAS!');
console.log('📋 Para verificar: verificarLocalStorageApenas()');
console.log('🔍 Para ver todas chaves: mostrarTodasChaves()');
