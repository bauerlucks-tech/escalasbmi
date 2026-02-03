// LIMPAR CACHE COMPLETO
// Script para limpar todo cache e forçar reload limpo

function limparCacheCompleto() {
  console.log('🧹 LIMPANDO CACHE COMPLETO...');
  console.log('================================');
  
  // Limpar todos os dados de escalas
  const keysToRemove = [
    'escala_scheduleStorage',
    'escala_scheduleData',
    'escala_currentSchedules',
    'escala_archivedSchedules',
    'escala_currentUser',
    'reactCurrentUser',
    'currentUser',
    'directAuth_currentUser'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido: ${key}`);
  });
  
  // Limpar sessionStorage se houver
  if (sessionStorage.length > 0) {
    console.log('🗑️ Limpando sessionStorage...');
    sessionStorage.clear();
  }
  
  console.log('✅ Cache limpo completamente!');
  console.log('🔄 Forçando reload em 2 segundos...');
  
  // Forçar reload completo
  setTimeout(() => {
    console.log('🔄 Recarregando...');
    window.location.reload(true); // true = bypass cache
  }, 2000);
}

// Exportar função
window.limparCacheCompleto = limparCacheCompleto;

console.log('🧹 FERRAMENTA DE LIMPEZA DE CACHE CARREGADA!');
console.log('📋 Para usar: limparCacheCompleto()');
