import { createRoot, Root } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

let appRoot: Root | null = null;

// Verificar se usuário está logado antes de renderizar React
const checkAuthAndRender = () => {
  const currentUser = localStorage.getItem('directAuth_currentUser');
  
  if (currentUser) {
  // ✅ Usuário logado, renderizando React
    const root = document.getElementById("root");
    if (root && !appRoot) {
      appRoot = createRoot(root);
      appRoot.render(<App />);
    } else if (appRoot) {
      appRoot.render(<App />);
    }
  } else {
  // ❌ Usuário não logado, aguardando login...
    // Não renderizar React até que usuário faça login
  }
};

// Tentar renderizar imediatamente
checkAuthAndRender();

// Ouvir evento de login do sistema externo
window.addEventListener('externalLogin', (event: CustomEvent) => {
  console.log('🔄 Evento externalLogin recebido:', event.detail);
  
  // Pequeno delay para garantir que localStorage foi atualizado
  setTimeout(() => {
    checkAuthAndRender();
  }, 100);
});

// Ouvir evento de logout do sistema externo
window.addEventListener('externalLogout', () => {
  console.log('🔄 Evento externalLogout recebido, limpando React');
  if (appRoot) {
    appRoot.unmount();
    appRoot = null;
  }
});
