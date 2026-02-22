// ACESSO SUPER ADMIN - SCRIPT INDEPENDENTE
// Carrega automaticamente em qualquer página do sistema

(function() {
    'use strict';
    
    console.log('🔑 Carregando módulo de acesso Super Admin...');
    
    // Função para adicionar chave de acesso
    const addSuperAdminKey = () => {
        console.log('🔍 Procurando elemento "Lucas Pott"...');
        
        // Procurar pelo elemento "Lucas Pott" em qualquer lugar da página
        const selectors = [
            'span[data-component-name*="Lucas"]',
            'span[data-component-name*="Pott"]',
            '[data-component-name*="Lucas"]',
            '[data-component-name*="Pott"]'
        ];
        
        let lucasElement = null;
        
        // Tentar encontrar o elemento
        for (const selector of selectors) {
            try {
                lucasElement = document.querySelector(selector);
                if (lucasElement) {
                    console.log(`✅ Elemento encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`❌ Erro no seletor ${selector}:`, e.message);
            }
        }
        
        // Se não encontrar com querySelector, tentar por texto
        if (!lucasElement) {
            console.log('🔍 Tentando busca por texto...');
            const allSpans = document.querySelectorAll('span');
            console.log(`📊 Encontrados ${allSpans.length} spans`);
            
            for (let i = 0; i < allSpans.length; i++) {
                const span = allSpans[i];
                console.log(`🔍 Verificando span ${i}: "${span.textContent}"`);
                
                if (span.textContent && (
                    span.textContent.includes('Lucas Pott') || 
                    span.textContent.includes('Lucas') ||
                    span.textContent.includes('Pott')
                )) {
                    lucasElement = span;
                    console.log(`✅ Elemento encontrado por texto: "${span.textContent}"`);
                    break;
                }
            }
        }
        
        // Se encontrou o elemento e ainda não tem a chave
        if (lucasElement && !document.getElementById('super-admin-key-global')) {
            console.log('🔑 Elemento "Lucas Pott" encontrado, adicionando chave...');
            
            // Criar elemento da chave
            const keyElement = document.createElement('span');
            keyElement.id = 'super-admin-key-global';
            keyElement.innerHTML = '🔑';
            keyElement.style.cssText = `
                margin-left: 8px;
                cursor: pointer;
                font-size: 14px;
                opacity: 0.7;
                transition: opacity 0.3s ease;
                vertical-align: middle;
                position: relative;
                z-index: 1000;
            `;
            keyElement.title = 'Clique para acesso Super Admin';
            
            // Adicionar evento de clique
            keyElement.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
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
            
            // Inserir a chave após o elemento "Lucas Pott"
            try {
                if (lucasElement.nextSibling) {
                    lucasElement.parentNode.insertBefore(keyElement, lucasElement.nextSibling);
                } else {
                    lucasElement.parentNode.appendChild(keyElement);
                }
                console.log('✅ Chave de Super Admin adicionada com sucesso!');
                return true;
            } catch (e) {
                console.error('❌ Erro ao adicionar chave:', e);
                return false;
            }
        } else {
            if (!lucasElement) {
                console.log('❌ Elemento "Lucas Pott" não encontrado');
            } else {
                console.log('ℹ️ Chave já existe');
            }
        }
        
        return false;
    };
    
    // Tentar adicionar imediatamente
    console.log('🚀 Tentando adicionar chave imediatamente...');
    if (!addSuperAdminKey()) {
        // Se não encontrar, tentar novamente após carregamento completo
        setTimeout(() => {
            console.log('🔄 Tentando novamente após 100ms...');
            if (!addSuperAdminKey()) {
                // Tentar novamente com mais delay
                setTimeout(() => {
                    console.log('🔄 Tentando novamente após 500ms...');
                    addSuperAdminKey();
                }, 500);
            }
        }, 100);
    }
    
    // Também tentar quando o DOM estiver completamente carregado
    if (document.readyState === 'loading') {
        console.log('📄 DOM ainda carregando, aguardando DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOMContentLoaded disparado, tentando adicionar chave...');
            addSuperAdminKey();
        });
    } else {
        console.log('📄 DOM já carregado');
    }
    
    // Adicionar listener para mudanças no DOM (caso o elemento apareça depois)
    const observer = new MutationObserver(() => {
        console.log('🔄 DOM modificado, verificando novamente...');
        setTimeout(addSuperAdminKey, 100);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Módulo de acesso Super Admin carregado!');
    
})();
