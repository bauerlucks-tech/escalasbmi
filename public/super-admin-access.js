// ACESSO SUPER ADMIN - SCRIPT INDEPENDENTE
// Carrega automaticamente em qualquer página do sistema

(function() {
    'use strict';
    
    console.log('🔑 Carregando módulo de acesso Super Admin...');
    
    // Função para adicionar chave de acesso
    const addSuperAdminKey = () => {
        // Procurar pelo elemento "Lucas Pott" em qualquer lugar da página
        const selectors = [
            'span[data-component-name*="Lucas"]',
            'span:contains("Lucas Pott")',
            '*:contains("Lucas Pott")'
        ];
        
        let lucasElement = null;
        
        // Tentar encontrar o elemento
        for (const selector of selectors) {
            try {
                lucasElement = document.querySelector(selector);
                if (lucasElement) break;
            } catch (e) {
                // Ignorar erros de seletores inválidos
            }
        }
        
        // Se não encontrar com querySelector, tentar por texto
        if (!lucasElement) {
            const allSpans = document.querySelectorAll('span');
            for (const span of allSpans) {
                if (span.textContent && span.textContent.includes('Lucas Pott')) {
                    lucasElement = span;
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
            `;
            keyElement.title = 'Clique para acesso Super Admin';
            
            // Adicionar evento de clique
            keyElement.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Mostrar prompt para senha do Super Admin
                const password = prompt('🔐 Acesso Super Admin - Digite a senha:');
                if (password === 'hidden_super_2026') {
                    // Login como Super Admin
                    localStorage.setItem('directAuth_superAdminMode', 'true');
                    localStorage.setItem('currentUser', JSON.stringify({
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
                    window.location.reload();
                } else if (password !== null) {
                    alert('❌ Senha incorreta!');
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
            if (lucasElement.nextSibling) {
                lucasElement.parentNode.insertBefore(keyElement, lucasElement.nextSibling);
            } else {
                lucasElement.parentNode.appendChild(keyElement);
            }
            
            console.log('✅ Chave de Super Admin adicionada com sucesso!');
            return true;
        }
        
        return false;
    };
    
    // Tentar adicionar imediatamente
    if (!addSuperAdminKey()) {
        // Se não encontrar, tentar novamente após carregamento completo
        setTimeout(() => {
            if (!addSuperAdminKey()) {
                // Tentar novamente com mais delay
                setTimeout(addSuperAdminKey, 500);
            }
        }, 100);
    }
    
    // Também tentar quando o DOM estiver completamente carregado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addSuperAdminKey);
    }
    
})();
