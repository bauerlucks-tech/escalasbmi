// DEBUG IMEDIATO DO PROBLEMA
// Verificar exatamente o que está acontecendo

console.log('🔍 DEBUG IMEDIATO INICIADO...');
console.log('================================');

// 1. Verificar se o script carregou
console.log('');
console.log('📜 1. SCRIPTS CARREGADOS:');
const scripts = document.querySelectorAll('script');
scripts.forEach((script, index) => {
  if (script.src) {
    console.log(`   ${index + 1}. ${script.src}`);
  } else if (script.textContent) {
    console.log(`   ${index + 1}. Script inline (${script.textContent.substring(0, 50)}...)`);
  }
});

// 2. Verificar se logout-direto.js existe
console.log('');
console.log('🔧 2. VERIFICANDO logout-direto.js:');
if (typeof window.logoutAgora === 'function') {
  console.log('   ✅ logoutAgora() existe');
} else {
  console.log('   ❌ logoutAgora() NÃO existe');
}

// 3. Verificar botões
console.log('');
console.log('🔍 3. VERIFICANDO BOTÕES:');
const allButtons = document.querySelectorAll('button');
console.log(`   📊 Total de botões: ${allButtons.length}`);

const logoutButtons = document.querySelectorAll('button svg.lucide-log-out');
console.log(`   📊 Botões com SVG lucide-log-out: ${logoutButtons.length}`);

logoutButtons.forEach((btn, index) => {
  const button = btn.closest('button');
  if (button) {
    console.log(`   ${index + 1}. Botão logout:`);
    console.log(`      ID: ${button.id || 'sem-id'}`);
    console.log(`      Classes: ${button.className}`);
    console.log(`      Tem evento logout-direto: ${button.hasAttribute('data-logout-direto')}`);
    console.log(`      Visível: ${button.offsetWidth > 0 && button.offsetHeight > 0}`);
  }
});

// 4. Verificar se usuário está logado
console.log('');
console.log('👤 4. VERIFICANDO USUÁRIO LOGADO:');
const authKeys = ['directAuth_currentUser', 'reactCurrentUser', 'escala_currentUser', 'currentUser'];
let userLogado = false;

authKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (parsed.name) {
        console.log(`   ✅ ${key}: ${parsed.name} (${parsed.role})`);
        userLogado = true;
      }
    } catch {
      console.log(`   ❌ ${key}: inválido`);
    }
  } else {
    console.log(`   ❌ ${key}: vazio`);
  }
});

if (!userLogado) {
  console.log('   ❌ NENHUM USUÁRIO LOGADO!');
  console.log('   📋 Se não há usuário logado, não há botão de logout');
}

// 5. Verificar elementos da UI
console.log('');
console.log('📱 5. ELEMENTOS DA UI:');
const userHeader = document.getElementById('auth-user-header');
console.log(`   📊 Header usuário: ${userHeader ? (userHeader.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);

const loginScreen = document.getElementById('auth-login-screen');
console.log(`   📊 Tela de login: ${loginScreen ? (loginScreen.style.display === 'none' ? 'escondida' : loginScreen.style.display === 'flex' ? 'visível' : 'estado desconhecido') : 'não encontrada'}`);

const root = document.getElementById('root');
console.log(`   📊 React root: ${root ? (root.style.display === 'none' ? 'escondido' : 'visível') : 'não encontrado'}`);

// 6. Testar logout manual
console.log('');
console.log('🧪 6. TESTE MANUAL:');
if (typeof window.logoutAgora === 'function') {
  console.log('   📋 Para testar: logoutAgora()');
  console.log('   📋 Execute no console AGORA');
} else {
  console.log('   ❌ logoutAgora() não disponível');
}

// 7. Adicionar botão de logout manual se não existir
if (!document.getElementById('manual-logout-btn')) {
  const manualBtn = document.createElement('button');
  manualBtn.id = 'manual-logout-btn';
  manualBtn.textContent = 'LOGOUT MANUAL';
  manualBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #dc3545;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  
  manualBtn.addEventListener('click', () => {
    console.log('🚪 BOTÃO MANUAL CLICADO!');
    if (typeof window.logoutAgora === 'function') {
      window.logoutAgora();
    } else {
      console.error('❌ logoutAgora() não encontrado');
    }
  });
  
  document.body.appendChild(manualBtn);
  console.log('   ✅ Botão manual de logout adicionado');
}

console.log('');
console.log('🎯 7. RECOMENDAÇÕES:');
console.log('   📋 1. Verifique se logoutAgora() existe');
console.log('   📋 2. Verifique se há botões com SVG lucide-log-out');
console.log('   📋 3. Clique no botão vermelho "LOGOUT MANUAL"');
console.log('   📋 4. Execute logoutAgora() no console');

console.log('');
console.log('🔍 FIM DO DEBUG - VERIFIQUE OS LOGS ACIMA');
