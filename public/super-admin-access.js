// ACESSO SUPER ADMIN - SCRIPT INDEPENDENTE
// Carrega automaticamente em qualquer página do sistema

(function() {
    'use strict';
    
    console.log('🔑 Carregando módulo de acesso Super Admin...');
    
    // Variável global para controle
    let keyAdded = false;
    let observer = null;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    
    // Função principal para adicionar a chave
    function addSuperAdminKey() {
        if (keyAdded) {
            console.log('🔑 Chave do Super Admin já adicionada');
            return;
        }
        
        // Parar observer se existir
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        
        console.log('🔍 Procurando elemento "Lucas Pott"...');
        
        // Múltiplos seletores para encontrar o elemento "Lucas Pott"
        const selectors = [
            'p',
            'span',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6'
        ];
        
        let targetElement = null;
        
        // Tentar encontrar por seletores
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (element.textContent && element.textContent.includes('Lucas Pott')) {
                    targetElement = element;
                    console.log('✅ Elemento encontrado via seletor:', selector);
                    break;
                }
            }
            if (targetElement) break;
        }
        
        // Se não encontrou, tentar busca por texto
        if (!targetElement) {
            console.log('🔍 Tentando busca por texto...');
            const allElements = document.querySelectorAll('*');
            for (const element of allElements) {
                if (element.children.length === 0 && element.textContent && element.textContent.includes('Lucas Pott')) {
                    targetElement = element;
                    console.log('✅ Elemento encontrado via texto');
                    break;
                }
            }
        }
        
        if (targetElement) {
            console.log('✅ Elemento "Lucas Pott" encontrado:', targetElement);
            
            // Verificar se já tem chave
            if (targetElement.querySelector('.super-admin-key')) {
                console.log('🔑 Chave já existe no elemento');
                keyAdded = true;
                return;
            }
            
            // Criar elemento da chave
            const keyElement = document.createElement('span');
            keyElement.className = 'super-admin-key';
            keyElement.innerHTML = '🔑';
            keyElement.style.cssText = `
                cursor: pointer;
                margin-left: 8px;
                font-size: 14px;
                opacity: 0.7;
                transition: opacity 0.3s ease;
                vertical-align: middle;
            `;
            
            // Adicionar evento de clique
            keyElement.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔑 Chave de Super Admin clicada!');
                
                // Mostrar prompt para senha do Super Admin
                const password = prompt('🔐 Acesso Super Admin - Digite a senha:');
                if (password === 'hidden_super_2026') {
                    console.log('✅ Senha correta, fazendo login como Super Admin...');
                    
                    // Login como Super Admin
                    localStorage.setItem('directAuth_superAdminMode', 'true');
                    localStorage.setItem('directAuth_currentUser', JSON.stringify({
                        id: 'super-admin',
                        name: 'SUPER_ADMIN_HIDDEN',
                        role: 'super_admin',
                        status: 'active'
                    }));
                    
                    // Disparar evento para o React
                    window.dispatchEvent(new CustomEvent('externalLogin', {
                        detail: {
                            user: {
                                id: 'super-admin',
                                name: 'SUPER_ADMIN_HIDDEN',
                                role: 'super_admin',
                                status: 'active'
                            }
                        }
                    }));
                    
                    alert('✅ Acesso Super Admin concedido!');
                    
                    // Pequeno delay antes de recarregar para garantir processamento
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } else if (password !== null) {
                    console.log('❌ Senha incorreta');
                    alert('❌ Senha incorreta!');
                } else {
                    console.log('🚫 Prompt cancelado');
                }
            });
            
            // Adicionar efeito hover
            keyElement.addEventListener('mouseenter', () => {
                keyElement.style.opacity = '1';
            });
            
            keyElement.addEventListener('mouseleave', () => {
                keyElement.style.opacity = '0.7';
            });
            
            // Adicionar a chave ao lado do texto
            targetElement.appendChild(keyElement);
            
            keyAdded = true;
            console.log('✅ Chave do Super Admin adicionada com sucesso!');
            
        } else {
            console.log('❌ Elemento "Lucas Pott" não encontrado');
            
            // Tentar novamente se ainda não excedeu o limite
            retryCount++;
            if (retryCount < MAX_RETRIES) {
                console.log(`🔄 Tentativa ${retryCount}/${MAX_RETRIES} em 2 segundos...`);
                setTimeout(addSuperAdminKey, 2000);
            } else {
                console.log('❌ Máximo de tentativas atingido');
            }
        }
    }
    
    // Função para iniciar o observer
    function startObserver() {
        if (observer) return;
        
        observer = new MutationObserver((mutations) => {
            let shouldRetry = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Verificar se algum nó adicionado contém "Lucas Pott"
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
                            if (node.textContent && node.textContent.includes('Lucas Pott')) {
                                shouldRetry = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldRetry && !keyAdded) {
                console.log('🔄 DOM modificado, verificando novamente...');
                setTimeout(addSuperAdminKey, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 Observer iniciado');
    }
    
    // Inicialização
    function init() {
        // Tentar imediatamente
        addSuperAdminKey();
        
        // Se não encontrou, iniciar observer
        if (!keyAdded) {
            startObserver();
        }
    }
    
    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Adicionar listener para mudanças no DOM (caso o elemento apareça depois)
    const domObserver = new MutationObserver(() => {
        console.log('🔄 DOM modificado, verificando novamente...');
        setTimeout(addSuperAdminKey, 100);
    });
    
    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Módulo de acesso Super Admin carregado!');
    
})();
