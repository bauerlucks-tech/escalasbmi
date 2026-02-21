-- =========================================
-- SETUP SUPER ADMIN - SISTEMA DE ESCALAS
-- =========================================
-- Este script configura o usuário Super Admin no banco de dados
-- 
-- ⚠️ ATENÇÃO: Execute apenas em ambiente seguro
-- 🔒 IMPORTANTE: Altere a senha padrão imediatamente após a criação
-- 
-- Data de criação: 2026-02-21
-- Versão: 1.0.0
-- =========================================

-- 1. Criar/Atualizar usuário SUPERADMIN
INSERT INTO users (name, role, password, created_at, updated_at)
VALUES (
  'SUPERADMIN',
  'super_admin',
  'SuperAdm!n#2026$BMI',  -- ⚠️ TROCAR POR UMA SENHA FORTE E ÚNICA
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE
SET 
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  updated_at = NOW();

-- 2. Verificar que o usuário foi criado
SELECT 
  id,
  name, 
  role, 
  created_at,
  updated_at
FROM users 
WHERE name = 'SUPERADMIN';

-- 3. Criar log de auditoria da configuração
INSERT INTO audit_logs (user_name, action, details, created_at)
VALUES (
  'SYSTEM',
  'SUPER_ADMIN_SETUP',
  'Usuário Super Admin configurado/atualizado - ' || NOW()::text,
  NOW()
);

-- =========================================
-- QUERIES ÚTEIS PARA ADMINISTRAÇÃO
-- =========================================

-- Ver todos os logs de Super Admin
/*
SELECT 
  user_name,
  action,
  details,
  created_at
FROM audit_logs
WHERE action LIKE 'SUPER_ADMIN_%'
ORDER BY created_at DESC
LIMIT 50;
*/

-- Contar tentativas de login (últimas 24h)
/*
SELECT 
  action,
  COUNT(*) as total
FROM audit_logs
WHERE action LIKE 'SUPER_ADMIN_%'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY action
ORDER BY total DESC;
*/

-- Resetar senha do Super Admin (em caso de emergência)
/*
UPDATE users 
SET password = 'NOVA_SENHA_FORTE_AQUI',
    updated_at = NOW()
WHERE name = 'SUPERADMIN';
*/

-- Desativar temporariamente o acesso (definir senha vazia)
/*
UPDATE users 
SET password = '',
    updated_at = NOW()
WHERE name = 'SUPERADMIN';
*/

-- =========================================
-- REQUISITOS DE SENHA FORTE
-- =========================================
-- 
-- A senha deve atender TODOS os seguintes requisitos:
-- ✅ Mínimo de 12 caracteres
-- ✅ Pelo menos 1 letra maiúscula (A-Z)
-- ✅ Pelo menos 1 letra minúscula (a-z)
-- ✅ Pelo menos 1 número (0-9)
-- ✅ Pelo menos 1 caractere especial (!@#$%^&*()_+-=[]{};\\"\\|,.<>\/?)
-- 
-- Exemplos de senhas fortes:
-- - SuperAdm!n#2026$BMI
-- - Adm1n_Secur3@2026!
-- - Str0ng#Pass_2026$
-- 
-- ⚠️ NÃO USE EXEMPLOS ACIMA EM PRODUÇÃO
-- =========================================

-- =========================================
-- CHECKLIST DE SEGURANÇA
-- =========================================
-- 
-- [ ] Senha forte configurada (não usar exemplo)
-- [ ] Senha armazenada em gerenciador de senhas
-- [ ] Documentação confidencial criada
-- [ ] Pessoal autorizado notificado
-- [ ] Logs de auditoria verificados
-- [ ] Teste de acesso realizado
-- [ ] Procedimento de emergência documentado
-- 
-- =========================================

-- Fim do script
