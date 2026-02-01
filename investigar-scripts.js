// INVESTIGAÇÃO COMPLETA - ENCONTRAR SCRIPTS EXTERNOS
// Execute no console para identificar o problema

function investigarScriptsExternos() {
  console.log('🔍 INVESTIGANDO SCRIPTS EXTERNOS');
  console.log('==================================');
  
  // 1. Verificar todos os scripts carregados
  console.log('');
  console.log('📋 SCRIPTS CARREGADOS:');
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    console.log('📄 ' + (i + 1) + '. ' + (script.src || 'inline'));
    if (script.src && script.src.includes('escalasbmi')) {
      console.log('   ⚠️ SCRIPT DO PROJETO DETECTADO');
    }
  }
  
  // 2. Verificar event listeners suspeitos
  console.log('');
  console.log('👂 EVENT LISTENERS:');
  const eventos = ['storage', 'beforeunload', 'unload', 'load'];
  eventos.forEach(evento => {
    const listeners = getEventListeners ? getEventListeners(window)[evento] : [];
    if (listeners && listeners.length > 0) {
      console.log('🔔 ' + evento + ': ' + listeners.length + ' listeners');
    }
  });
  
  // 3. Verificar funções globais suspeitas
  console.log('');
  console.log('🔧 FUNÇÕES GLOBAIS:');
  const funcoesSuspeitas = [
    'createScheduleStorage',
    'refreshSchedules', 
    'updateScheduleData',
    'limparDados',
    'resetData',
    'clearStorage',
    'restoreData',
    'recoverData'
  ];
  
  funcoesSuspeitas.forEach(funcao => {
    if (typeof window[funcao] === 'function') {
      console.log('⚠️ ' + funcao + ': função encontrada');
      console.log('   Fonte: ' + window[funcao].toString().substring(0, 100) + '...');
    }
  });
  
  // 4. Verificar localStorage watchers
  console.log('');
  console.log('👁️ LOCALSTORAGE WATCHERS:');
  
  // Salvar localStorage original
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  
  // Verificar se foi sobrescrito
  if (localStorage.setItem !== originalSetItem) {
    console.log('⚠️ localStorage.setItem foi sobrescrito!');
  }
  
  // 5. Verificar intervalos ativos
  console.log('');
  console.log('⏰ INTERVALOS ATIVOS:');
  let intervalCount = 0;
  for (let i = 1; i < 99999; i++) {
    if (window.clearInterval(i)) {
      intervalCount++;
    }
  }
  console.log('🔄 Intervalos encontrados: ' + intervalCount);
  
  // 6. Verificar se há algum script de recuperação
  console.log('');
  console.log('🔍 PROCURANDO SCRIPTS DE RECUPERAÇÃO:');
  const palavrasChave = ['recuperar', 'restore', 'recover', 'backup', 'january', 'reset'];
  const todosOsScripts = Array.from(document.scripts);
  
  todosOsScripts.forEach((script, index) => {
    if (script.textContent) {
      const conteudo = script.textContent.toLowerCase();
      palavrasChave.forEach(palavra => {
        if (conteudo.includes(palavra)) {
          console.log('🚨 SCRIPT SUSPEITO ENCONTRADO (script ' + index + '):');
          console.log('   Palavra: ' + palavra);
          console.log('   Conteúdo: ' + conteudo.substring(0, 200) + '...');
        }
      });
    }
  });
  
  console.log('');
  console.log('🎯 RECOMENDAÇÕES:');
  console.log('1. Verifique se há scripts de recuperação rodando');
  console.log('2. Desative extensões do navegador');
  console.log('3. Limpe cache e cookies');
  console.log('4. Verifique o console por erros automáticos');
}

// Função para monitorar mudanças no localStorage
function monitorarLocalStorage() {
  console.log('👁️ MONITORANDO LOCALSTORAGE...');
  console.log('================================');
  
  // Interceptar localStorage.setItem
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    console.log('🔄 localStorage.setItem chamado:');
    console.log('   Chave: ' + key);
    console.log('   Valor: ' + (value.length > 100 ? value.substring(0, 100) + '...' : value));
    console.log('   Stack: ' + new Error().stack);
    
    // Chamar função original
    return originalSetItem.call(this, key, value);
  };
  
  console.log('✅ Monitoramento ativo. Qualquer mudança será logada.');
}

// Função para desativar scripts suspeitos
function desativarScriptsSuspeitos() {
  console.log('🛑 DESATIVANDO SCRIPTS SUSPEITOS...');
  console.log('===================================');
  
  // Remover scripts suspeitos
  const scripts = document.getElementsByTagName('script');
  const scriptsParaRemover = [];
  
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script.src && (
      script.src.includes('recuperar') ||
      script.src.includes('restore') ||
      script.src.includes('recover') ||
      script.src.includes('january')
    )) {
      scriptsParaRemover.push(script);
      console.log('🗑️ Removendo script: ' + script.src);
    }
  }
  
  // Remover scripts
  scriptsParaRemover.forEach(script => {
    script.remove();
  });
  
  // Limpar intervalos suspeitos
  const maxIntervalId = setInterval(() => {}, 1000);
  for (let i = 1; i < maxIntervalId; i++) {
    clearInterval(i);
  }
  console.log('🧹 Intervalos limpos');
  
  console.log('✅ Scripts suspeitos desativados');
}

// Exportar funções
window.investigarScripts = investigarScriptsExternos;
window.monitorarStorage = monitorarLocalStorage;
window.desativarScripts = desativarScriptsSuspeitos;

console.log('🔧 FUNÇÕES DE INVESTIGAÇÃO CARREGADAS!');
console.log('🔍 Para investigar: investigarScripts()');
console.log('👁️ Para monitorar: monitorarStorage()');
console.log('🛑 Para desativar: desativarScripts()');
