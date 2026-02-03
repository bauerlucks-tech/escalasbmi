// ANÁLISE COMPLETA DO PROBLEMA DE LOGOUT
// Diagnóstico detalhado para identificar por que não funciona

(function analisarProblemaLogout() {
  console.log('🔍 ANÁLISE COMPLETA DO PROBLEMA DE LOGOUT');
  console.log('==========================================');
  
  // 1. Verificar se logoutDefinitivo existe
  console.log('');
  console.log('🔧 1. VERIFICANDO FUNÇÃO logoutDefinitivo:');
  
  if (typeof window.logoutDefinitivo === 'function') {
    console.log('   ✅ logoutDefinitivo() existe e é uma função');
  } else {
    console.log('   ❌ logoutDefinitivo() não existe ou não é função');
    console.log('   📋 Verifique se debug-logout-final-corrigido2.js carregou');
  }
  
  // 2. Verificar se há botões na página
  console.log('');
  console.log('🔍 2. VERIFICANDO BOTÕES NA PÁGINA:');
  
  const allButtons = document.querySelectorAll('button');
  console.log(`   📊 Total de botões na página: ${allButtons.length}`);
  
  // Buscar botões com SVG
  const svgButtons = document.querySelectorAll('button svg.lucide-log-out');
  console.log(`   📊 Botões com SVG lucide-log-out: ${svgButtons.length}`);
  
  // Buscar botões com destructive
  const destructiveButtons = document.querySelectorAll('button[class*="destructive"]');
  console.log(`   📊 Botões com destructive: ${destructiveButtons.length}`);
  
  // 3. Verificar se o usuário está logado
  console.log('');
  console.log('🔍 3. VERIFICANDO SE USUÁRIO ESTÁ LOGADO:');
  
  const authKeys = ['directAuth_currentUser', 'reactCurrentUser', 'escala_currentUser', 'currentUser'];
  let userLogado = false;
  
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.name) {
          console.log(`   ✅ Usuário logado em ${key}: ${parsed.name}`);
          userLogado = true;
        }
      } catch {
        console.log(`   ❌ ${key}: inválido`);
      }
    }
  });
  
  if (!userLogado) {
    console.log('   ❌ Nenhum usuário logado encontrado');
    console.log('   📋 Se não há usuário logado, não há botão de logout');
  }
  
  // 4. Verificar elementos da UI
  console.log('');
  console.log('🔍 4. VERIFICANDO ELEMENTOS DA UI:');
  
  const userHeader = document.getElementById('auth-user-header');
  console.log(`   📊 Header usuário: ${userHeader ? (userHeader.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);
  
  const loginScreen = document.getElementById('auth-login-screen');
  console.log(`   📊 Tela de login: ${loginScreen ? (loginScreen.style.display === 'none' ? 'escondida' : loginScreen.style.display === 'flex' ? 'visível' : 'estado desconhecido') : 'não encontrada'}`);
  
  const root = document.getElementById('root');
  console.log(`   📊 React root: ${root ? (root.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);
  
  // 5. Testar logout manual
  console.log('');
  console.log('🧪 5. TESTE MANUAL DE LOGOUT:');
  
  if (typeof window.logoutDefinitivo === 'function') {
    console.log('   📋 Para testar logout manual: logoutDefinitivo()');
    console.log('   📋 Execute no console e veja se funciona');
  } else {
    console.log('   ❌ logoutDefinitivo() não disponível para teste');
  }
  
  // 6. Verificar scripts carregados
  console.log('');
  console.log('📜 6. VERIFICANDO SCRIPTS CARREGADOS:');
  
  const scripts = document.querySelectorAll('script');
  const logoutScripts = Array.from(scripts).filter(script => {
    if (script.src) {
      const src = script.src;
      return src.includes('logout') || src.includes('debug') || src.includes('verificar');
    }
    return false;
  });
  
  console.log(`   📊 Scripts de logout encontrados: ${logoutScripts.length}`);
  logoutScripts.forEach((script, index) => {
    console.log(`   ${index + 1}. ${script.src}`);
  });
  
  // 7. Verificar se há erros no console
  console.log('');
  console.log('❌ 7. VERIFICANDO ERROS:');
  console.log('   📋 Verifique se há erros de JavaScript no console');
  console.log('   📋 Erros podem impedir o carregamento dos scripts');
  
  // 8. Recomendações
  console.log('');
  console.log('🎯 8. RECOMENDAÇÕES:');
  
  if (!userLogado) {
    console.log('   📋 1. Faça login primeiro');
    console.log('   📋 2. Verifique se o botão de logout aparece após login');
  } else if (svgButtons.length === 0) {
    console.log('   📋 1. Botão de logout não encontrado');
    console.log('   📋 2. Verifique se o usuário tem permissão para ver botão');
    console.log('   📋 3. Verifique se o botão está em outro elemento');
  } else {
    console.log('   📋 1. Execute verificarBotaoLogout() manualmente');
    console.log('   📋 2. Execute logoutDefinitivo() para teste');
    console.log('   📋 3. Verifique se há erros no console');
  }
  
  console.log('');
  console.log('🔍 FIM DA ANÁLISE - VERIFIQUE OS LOGS ACIMA');
})();

// Exportar função
window.analisarProblemaLogout = analisarProblemaLogout;

console.log('🔧 ANÁLISE DE PROBLEMA DE LOGOUT CARREGADA!');
console.log('📋 Para usar: analisarProblemaLogout()');

// Executar análise automática
setTimeout(() => {
  analisarProblemaLogout();
}, 1000);
