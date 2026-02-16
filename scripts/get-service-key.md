# Como Obter a SERVICE_ROLE_KEY do Supabase

## 📍 Onde Encontrar

1. **Acesse o Painel Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto: `lsxmwwwmgfjwnowlsmzf`

2. **Navegue para Configurações:**
   - No menu lateral esquerdo, clique em **Settings**
   - Em **Configuration**, clique em **API**

3. **Copie a Service Role Key:**
   - Role para baixo até encontrar **Project API keys**
   - Copie a chave **service_role** (começa com `eyJ...`)
   - ⚠️ **NUNCA** compartilhe esta chave publicamente!

## 🔐 Segurança

- ✅ A service_role_key tem permissões completas no banco
- ✅ Use apenas em ambientes seguros (backend, GitHub Actions)
- ❌ NUNCA use em código frontend
- ❌ NUNCA comite em repositórios públicos

## 🚀 Configuração

### Via Terminal (Windows):
```cmd
set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### Via PowerShell:
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"
```

### Para GitHub Actions:
```bash
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "sua_service_role_key_aqui"
```

## 📋 Formato Esperado

A service_role_key deve ter este formato:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.sua_chave_aqui
```

## ⚠️ Importante

- A service_role_key é diferente da anon_key
- A anon_key tem permissões limitadas
- A service_role_key tem acesso completo ao banco
- Use sempre a service_role_key para operações de backup
