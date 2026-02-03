// VERIFICAÇÃO E CORREÇÃO DO BOTÃO DE LOGOUT
// Garante que o botão correto esteja capturado

(function verificarBotaoLogout() {
  console.log('🔍 VERIFICANDO BOTÃO DE LOGOUT...');
  console.log('==============================');
  
  // 1. Buscar todos os botões possíveis
  console.log('');
  console.log('🔍 1. BUSCANDO TODOS OS BOTÕES:');
  
  // Botões com SVG de logout
  const logoutSvgButtons = document.querySelectorAll('button svg.lucide-log-out');
  console.log(`   📊 Botões com SVG lucide-log-out: ${logoutSvgButtons.length}`);
  
  // Botões com classes de logout
  const logoutClassButtons = document.querySelectorAll('button[class*="logout"], button[class*="sair"]');
  console.log(`   📊 Botões com classe logout/sair: ${logoutClassButtons.length}`);
  
  // Botões com texto de logout
  const allButtons = document.querySelectorAll('button');
  const logoutTextButtons = Array.from(allButtons).filter(btn => {
    const text = btn.textContent.toLowerCase();
    return text.includes('logout') || text.includes('sair') || text.includes('sign out');
  });
  console.log(`   📊 Botões com texto logout/sair: ${logoutTextButtons.length}`);
  
  // Botões com hover destructive (muito provável ser o botão real)
  const destructiveButtons = document.querySelectorAll('button[class*="destructive"]');
  console.log(`   📊 Botões com destructive: ${destructiveButtons.length}`);
  
  // 2. Mostrar detalhes de cada botão encontrado
  console.log('');
  console.log('🔍 2. DETALHES DOS BOTÕES:');
  
  let totalButtons = 0;
  
  // Analisar botões SVG
  logoutSvgButtons.forEach((btn, index) => {
    const button = btn.closest('button');
    if (button) {
      totalButtons++;
      console.log(`   ${totalButtons}. SVG Botão ${index + 1}:`);
      console.log(`      ID: ${button.id || 'sem-id'}`);
      console.log(`      Classes: ${button.className.substring(0, 100)}...`);
      console.log(`      Texto: "${button.textContent.trim()}"`);
      console.log(`      Visível: ${button.offsetWidth > 0 && button.offsetHeight > 0}`);
      console.log(`      Pai: ${button.parentElement?.tagName || 'desconhecido'}`);
      console.log('');
    }
  });
  
  // Analisar botões destructive
  destructiveButtons.forEach((button, index) => {
    if (!logoutSvgButtons.includes(button.querySelector('svg.lucide-log-out'))) {
      totalButtons++;
      console.log(`   ${totalButtons}. Destructive Botão ${index + 1}:`);
      console.log(`      ID: ${button.id || 'sem-id'}`);
      console.log(`      Classes: ${button.className.substring(0, 100)}...`);
      console.log(`      Texto: "${button.textContent.trim()}"`);
      console.log(`      Visível: ${button.offsetWidth > 0 && button.offsetHeight > 0}`);
      console.log(`      Pai: ${button.parentElement?.tagName || 'desconhecido'}`);
      console.log('');
    }
  });
  
  // 3. Identificar o botão mais provável
  console.log('');
  console.log('🎯 3. BOTÃO MAIS PROVÁVEL:');
  
  let targetButton = null;
  
  // Prioridade 1: Botão com SVG lucide-log-out
  if (logoutSvgButtons.length > 0) {
    targetButton = logoutSvgButtons[0].closest('button');
    console.log('   ✅ Botão com SVG lucide-log-out selecionado');
  }
  // Prioridade 2: Botão com destructive e hover
  else if (destructiveButtons.length > 0) {
    targetButton = destructiveButtons[0];
    console.log('   ✅ Botão destructive selecionado');
  }
  // Prioridade 3: Botão com texto de logout
  else if (logoutTextButtons.length > 0) {
    targetButton = logoutTextButtons[0];
    console.log('   ✅ Botão com texto logout selecionado');
  }
  
  if (targetButton) {
    console.log(`   📋 ID: ${targetButton.id || 'sem-id'}`);
    console.log(`   📋 Classes: ${targetButton.className.substring(0, 100)}...`);
    console.log(`   📋 Texto: "${targetButton.textContent.trim()}"`);
    console.log(`   📋 Visível: ${targetButton.offsetWidth > 0 && target.offsetHeight > 0}`);
    
    // 4. Aplicar correção ao botão alvo
    console.log('');
    console.log('🔧 4. APLICANDO CORREÇÃO:');
    
    if (!targetButton.hasAttribute('data-logout-fixed-final')) {
      // Remover eventos existentes
      const newBtn = targetButton.cloneNode(true);
      targetButton.parentNode.replaceChild(newBtn, targetButton);
      
      // Adicionar evento de logout
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 BOTÃO DE LOGOUT CORRIGIDO CLICADO!');
        console.log('   📋 Executando logoutDefinitivo()...');
        
        // Executar logout definitivo
        if (typeof window.logoutDefinitivo === 'function') {
          window.logoutDefinitivo();
        } else {
          console.error('❌ logoutDefinitivo() não encontrado');
        }
      });
      
      // Marcar como corrigido
      newBtn.setAttribute('data-logout-fixed-final', 'true');
      newBtn.style.border = '3px solid #dc3545';
      newBtn.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.5)';
      newBtn.style.position = 'relative';
      
      // Adicionar indicador visual
      const indicator = document.createElement('div');
      indicator.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        font-size: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      `;
      indicator.textContent = '✓';
      newBtn.appendChild(indicator);
      
      console.log('   ✅ Botão corrigido com sucesso!');
      console.log('   ✅ Indicador visual adicionado');
      console.log('   ✅ Evento de logout aplicado');
      
    } else {
      console.log('   ℹ️ Botão já foi corrigido anteriormente');
    }
    
  } else {
    console.log('   ❌ Nenhum botão de logout encontrado');
    console.log('   📋 Verifique se o usuário está logado');
    console.log('   📋 Verifique se o botão existe na página');
  }
  
  // 5. Verificação final
  console.log('');
  console.log('🎯 5. VERIFICAÇÃO FINAL:');
  
  setTimeout(() => {
    const fixedButtons = document.querySelectorAll('button[data-logout-fixed-final]');
    console.log(`   📊 Botões corrigidos: ${fixedButtons.length}`);
    
    if (fixedButtons.length > 0) {
      console.log('   ✅ Botão de logout está corrigido e pronto para uso!');
      console.log('   📋 Clique no botão com borda vermelha para testar');
    } else {
      console.log('   ❌ Nenhum botão foi corrigido');
      console.log('   📋 Execute novamente: verificarBotaoLogout()');
    }
  }, 1000);
  
})();

// Exportar função
window.verificarBotaoLogout = verificarBotaoLogout;

console.log('🔧 VERIFICAÇÃO DE BOTÃO DE LOGOUT CARREGADA!');
console.log('📋 Para usar: verificarBotaoLogout()');

// Executar verificação automática
setTimeout(() => {
  verificarBotaoLogout();
}, 2000);
