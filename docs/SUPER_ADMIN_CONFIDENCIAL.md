# 🔐 ACESSO SUPER ADMIN - DOCUMENTO CONFIDENCIAL

> **⚠️ ATENÇÃO: ESTE DOCUMENTO É CONFIDENCIAL E RESTRITO**  
> Acesso permitido apenas a pessoal autorizado. Não compartilhar.

---

## 📋 Visão Geral

Sistema de acesso discreto ao usuário Super Admin através de Easter Egg na tela de login.

### Características de Segurança:

- ✅ Acesso discreto através de sequência de cliques
- ✅ Senha forte obrigatória (12+ caracteres)
- ✅ Rate limiting (3 tentativas por sessão)
- ✅ Logs de auditoria completos
- ✅ Timeout de sessão (30 minutos)
- ✅ Indicador discreto no header (badge "SA" roxo)

---

## 🔑 Como Acessar

### Passo a Passo:

1. **Abrir tela de login** do sistema
   - Pode ser através do modal de login direto ou página de login

2. **Clicar 7 vezes rapidamente** no logo do helicóptero (🚁)
   - ⏱️ **Importante:** Os 7 cliques devem ser feitos dentro de **3 segundos**
   - Se demorar mais, o contador reseta automaticamente

3. **Feedback de Ativação:**
   - Logo terá um brilho suave (animação sutil)
   - Vibração no dispositivo (se disponível)
   - Campo de usuário será preenchido automaticamente com `SUPERADMIN`
   - Campo de usuário ficará bloqueado (apenas leitura)

4. **Digitar senha do Super Admin**
   - Foco automático no campo de senha
   - Placeholder: "Digite a senha de Super Admin"

5. **Pressionar "Entrar"**
   - Se senha correta: Login bem-sucedido
   - Se senha incorreta: Mensagem genérica "Acesso negado"

---

## 🔒 Credenciais

### Usuário:
```
SUPERADMIN
```
_(preenchido automaticamente ao ativar o Easter Egg)_

### Senha:
```
[DEFINIR SENHA FORTE AQUI]
```

**Requisitos da senha:**
- ✅ Mínimo de 12 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial (!@#$%^&*()_+-=[]{};\\"\\|,.<>\/?)

**Exemplo de senha forte:**
```
SuperAdm!n#2026$BMI
```

**⚠️ IMPORTANTE:** A senha deve ser alterada no banco de dados Supabase (tabela `users`, registro `name='SUPERADMIN'`).

---

## 🎯 Indicadores Visuais

### Durante o Login:
- Logo do helicóptero reage aos cliques (escala 0.95 temporariamente)
- Após 7 cliques: brilho suave no logo
- Campo de usuário fica cinza com texto em cor diferenciada

### Após Login:
- **Badge discreto "SA"** no canto superior direito do header
- Cor roxa: `bg-purple-500/10` com borda `border-purple-500/20`
- Ícone de Shield roxo + texto "SA"

---

## 🔐 Medidas de Segurança

### Rate Limiting:
- **Máximo de 3 tentativas** de senha por sessão
- Após 3 tentativas incorretas: bloqueio temporário
- Mensagem: "Acesso temporariamente bloqueado"
- Reset ao reiniciar navegador (usa `sessionStorage`)

### Timeout do Easter Egg:
- Easter Egg ativado expira em **2 minutos** se não fizer login
- Campo de usuário volta ao normal automaticamente

### Timeout de Sessão:
- Sessão de Super Admin expira em **30 minutos** de inatividade
- Logout automático executado
- Log de auditoria registra o timeout

### Logs de Auditoria:
Todos os eventos são registrados na tabela `audit_logs`:

| Ação | Descrição |
|------|-----------|
| `SUPER_ADMIN_LOGIN_SUCCESS` | Login bem-sucedido |
| `SUPER_ADMIN_LOGIN_FAILED` | Senha incorreta ou usuário não encontrado |
| `SUPER_ADMIN_LOGIN_BLOCKED` | Tentativas excedidas |
| `SUPER_ADMIN_LOGIN_ERROR` | Erro no sistema |
| `SUPER_ADMIN_LOGOUT` | Logout realizado |
| `SUPER_ADMIN_TIMEOUT` | Sessão expirada |

---

## 🛠️ Configuração Inicial

### 1. Criar Usuário Super Admin no Supabase

Execute no SQL Editor do Supabase:

```sql
-- Inserir usuário SUPERADMIN (se não existir)
INSERT INTO users (name, role, password, created_at, updated_at)
VALUES (
  'SUPERADMIN',
  'super_admin',
  'SUA_SENHA_FORTE_AQUI',  -- Trocar pela senha real
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE
SET password = EXCLUDED.password,
    updated_at = NOW();
```

### 2. Verificar Permissões

```sql
-- Confirmar que o usuário foi criado
SELECT name, role, created_at FROM users WHERE name = 'SUPERADMIN';
```

### 3. Testar Acesso

1. Abrir console do navegador (F12)
2. Executar: `criarInterfaceLoginDireto()`
3. Clicar 7 vezes no logo
4. Tentar login com a senha configurada

---

## 🧪 Testes de Segurança

### Teste 1: Ativação do Easter Egg
- **Executar:** 7 cliques rápidos (< 3s)
- **Esperado:** Campo preenchido com "SUPERADMIN", feedback visual
- **Status:** ✅ Implementado

### Teste 2: Timeout de Cliques
- **Executar:** 5 cliques, esperar 4s, 2 cliques
- **Esperado:** Easter Egg NÃO ativado (reset automático)
- **Status:** ✅ Implementado

### Teste 3: Senha Fraca
- **Executar:** Login com senha "admin123"
- **Esperado:** Rejeição com mensagem "Acesso negado"
- **Status:** ✅ Implementado

### Teste 4: Rate Limiting
- **Executar:** 3 tentativas com senha errada
- **Esperado:** Bloqueio com mensagem "Acesso temporariamente bloqueado"
- **Status:** ✅ Implementado

### Teste 5: Timeout de Sessão
- **Executar:** Fazer login e aguardar 30 minutos sem atividade
- **Esperado:** Logout automático
- **Status:** ✅ Implementado

---

## 🔧 Troubleshooting

### Problema: Easter Egg não ativa

**Possíveis causas:**
1. Cliques muito lentos (> 3 segundos)
2. Não clicou no logo correto (`#login-logo`)
3. JavaScript desabilitado

**Solução:**
- Verificar console do navegador (F12)
- Em ambiente de desenvolvimento, verá: `🔍 Cliques: X/7`
- Tentar novamente mais rápido

### Problema: "Acesso negado" mesmo com senha correta

**Possíveis causas:**
1. Senha não atende requisitos de força
2. Usuário não existe no banco
3. Service Key não configurada

**Solução:**
```javascript
// Testar no console
const auth = new DirectAuthManager();
console.log('Service Key configurada:', !!auth.supabaseServiceKey);
```

### Problema: Badge "SA" não aparece

**Possíveis causas:**
1. Flag `directAuth_superAdminMode` não foi setada
2. Componente Header não está lendo o contexto correto

**Solução:**
```javascript
// Verificar no console
console.log('Super Admin Mode:', localStorage.getItem('directAuth_superAdminMode'));
```

---

## 📊 Monitoramento

### Consultar Logs de Acesso:

```sql
-- Ver todos os acessos de Super Admin
SELECT 
  user_name,
  action,
  details,
  created_at
FROM audit_logs
WHERE action LIKE 'SUPER_ADMIN_%'
ORDER BY created_at DESC
LIMIT 50;
```

### Análise de Tentativas Falhas:

```sql
-- Contar tentativas falhas
SELECT 
  DATE(created_at) as data,
  COUNT(*) as tentativas_falhas
FROM audit_logs
WHERE action = 'SUPER_ADMIN_LOGIN_FAILED'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

---

## 🚨 Procedimentos de Emergência

### Caso 1: Senha Comprometida

1. **Desativar imediatamente:**
```sql
UPDATE users SET password = '' WHERE name = 'SUPERADMIN';
```

2. **Gerar nova senha forte**
3. **Atualizar no banco de dados**
4. **Notificar equipe autorizada**
5. **Revisar logs de auditoria**

### Caso 2: Tentativas de Acesso Suspeitas

1. **Consultar logs:**
```sql
SELECT * FROM audit_logs 
WHERE action LIKE 'SUPER_ADMIN_%' 
AND created_at > NOW() - INTERVAL '24 hours';
```

2. **Identificar padrões suspeitos**
3. **Considerar mudança de senha**
4. **Implementar IP whitelist se necessário**

---

## 📝 Changelog

### v1.0.0 - 2026-02-21
- ✅ Implementação inicial do sistema de Easter Egg
- ✅ Validação de senha forte
- ✅ Rate limiting (3 tentativas)
- ✅ Logs de auditoria
- ✅ Timeout de sessão (30 minutos)
- ✅ Indicador discreto "SA" no header
- ✅ Animação CSS sutil

---

## 👥 Pessoal Autorizado

| Nome | Função | Email | Data de Autorização |
|------|--------|-------|---------------------|
| [NOME] | [FUNÇÃO] | [EMAIL] | [DATA] |

---

## 📞 Contatos

**Suporte Técnico:**  
[DEFINIR CONTATO]

**Emergências de Segurança:**  
[DEFINIR CONTATO]

---

**Última atualização:** 2026-02-21  
**Versão do documento:** 1.0.0  
**Classificação:** CONFIDENCIAL
