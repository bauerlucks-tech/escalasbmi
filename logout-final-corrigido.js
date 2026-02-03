// Arquivo temporário para evitar 404 enquanto cache do Vercel atualiza
// Este arquivo será removido quando o cache limpar

console.log('🔄 logout-final-corrigido.js carregado (temporário)');

// Redirecionar para a função correta
if (window.SystemAuthIntegration && !window.SystemAuthIntegration.logout) {
  // Carregar função do arquivo correto se disponível
  const script = document.createElement('script');
  script.src = '/corrigir-logout-integrar.js';
  document.head.appendChild(script);
}
