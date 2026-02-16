# 🚀 CONFIGURAÇÃO DO SISTEMA DE BACKUP - GUIA PASSO A PASSO

## ✅ STATUS ATUAL
- ✅ SUPABASE_URL: Configurado
- ❌ SUPABASE_SERVICE_ROLE_KEY: Precisa ser configurado
- ❌ Bucket Backup_DADOS: Precisa ser criado
- ❌ GitHub Actions Secrets: Precisam ser configurados

---

## 📋 PASSO 1: OBTER A SERVICE_ROLE_KEY

### 1.1 Acessar Painel Supabase
```
🌐 https://supabase.com/dashboard
📧 Faça login
🎯 Selecione projeto: lsxmwwwmgfjwnowlsmzf
```

### 1.2 Navegar para API Settings
```
⚙️ Settings (menu lateral)
📡 API (em Configuration)
🔑 Role para baixo até "Project API keys"
```

### 1.3 Copiar Service Role Key
```
🔑 Copie a chave "service_role" (longa, começa com eyJ...)
⚠️ NUNCA compartilhe esta chave publicamente!
```

---

## 📋 PASSO 2: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 2.1 No PowerShell (Windows)
```powershell
# Execute estes comandos no terminal
$env:SUPABASE_SERVICE_ROLE_KEY="cole_sua_service_role_key_aqui"
```

### 2.2 Verificar Configuração
```powershell
# Testar se está tudo OK
node scripts/quick-test.js
```

---

## 📋 PASSO 3: CRIAR BUCKET NO SUPABASE

### 3.1 Acessar SQL Editor
```
🌐 https://supabase.com/dashboard/project/lsxmwwwmgfjwnowlsmzf/sql
📝 Cole o script completo abaixo
▶️ Execute (RUN)
```

### 3.2 Script SQL (Copie e cole inteiro)
```sql
-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA DO BACKUP SYSTEM
-- =====================================================

-- 1. Criar bucket Backup_DADOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'Backup_DADOS', 
    'Backup_DADOS', 
    false, -- privado
    52428800, -- 50MB
    ARRAY['application/octet-stream', 'application/json', 'text/plain', 'application/sql']
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar políticas de acesso (apenas service_role)
CREATE POLICY "Allow service role uploads to Backup_DADOS" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

CREATE POLICY "Allow service role downloads from Backup_DADOS" ON storage.objects
FOR SELECT USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

CREATE POLICY "Allow service role list Backup_DADOS" ON storage.objects
FOR SELECT USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

CREATE POLICY "Allow service role updates in Backup_DADOS" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

CREATE POLICY "Allow service role delete from Backup_DADOS" ON storage.objects
FOR DELETE USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

-- 3. Criar funções de monitoramento
CREATE OR REPLACE FUNCTION get_backup_bucket_size()
RETURNS TABLE(
    total_files BIGINT,
    total_size BIGINT,
    last_backup TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_files,
        COALESCE(SUM(CAST(metadata->>'size' AS BIGINT)), 0) as total_size,
        MAX(created_at) as last_backup
    FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar configuração
SELECT '=== BUCKET CONFIGURADO ===' as status;
SELECT * FROM storage.buckets WHERE name = 'Backup_DADOS';
```

---

## 📋 PASSO 4: TESTAR CONFIGURAÇÃO LOCAL

### 4.1 Configurar Service Role Key
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role_aqui"
```

### 4.2 Executar Teste Completo
```powershell
node scripts/test-backup-config.js
```

### 4.3 Resultado Esperado
```
🚀 Iniciando testes de configuração do backup...
✅ Conexão estabelecida com sucesso
✅ Bucket Backup_DADOS encontrado
✅ Upload realizado com sucesso
✅ Download e verificação do conteúdo OK
✅ Encontrados X arquivos no bucket
✅ Arquivo teste deletado com sucesso
✅ Exportação de dados OK
🎉 Todos os testes concluídos com sucesso!
```

---

## 📋 PASSO 5: CONFIGURAR GITHUB ACTIONS

### 5.1 Instalar GitHub CLI (se não tiver)
```powershell
winget install GitHub.cli
# ou baixe de: https://cli.github.com/
```

### 5.2 Configurar Secrets no GitHub
```powershell
# Fazer login no GitHub
gh auth login

# Configurar secrets
gh secret set SUPABASE_URL --body "https://lsxmwwwmgfjwnowlsmzf.supabase.co"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "sua_chave_service_role_aqui"
```

### 5.3 Verificar Secrets
```powershell
gh secret list
```

---

## 📋 PASSO 6: TESTAR GITHUB ACTIONS

### 6.1 Acessar GitHub Actions
```
🌐 https://github.com/bauerlucks-tech/escalasbmi/actions
🔄 Selecione "Daily Database Backup"
▶️ Clique em "Run workflow"
✅ Aguarde conclusão
```

### 6.2 Verificar Resultados
```
📊 Verifique logs no GitHub Actions
🪣 Verifique arquivos no bucket Supabase
📋 Baixe artifacts se disponíveis
```

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problema: "Permission denied"
```
❌ Causa: Service role key incorreta
✅ Solução: Verifique se copiou a chave correta (service_role, não anon)
```

### Problema: "Bucket not found"
```
❌ Causa: Script SQL não executado
✅ Solução: Execute novamente o script SQL completo
```

### Problema: "Upload failed"
```
❌ Causa: Políticas RLS incorretas
✅ Solução: Recrie bucket e políticas com o script SQL
```

---

## 📞 SUPORTE

### Scripts Disponíveis:
- `scripts/quick-test.js` - Verificação rápida
- `scripts/test-backup-config.js` - Teste completo
- `scripts/setup-backup.sql` - Configuração bucket
- `scripts/get-service-key.md` - Guia da service key

### Documentação:
- `docs/BACKUP_SYSTEM.md` - Documentação completa
- `scripts/setup-backup-secrets.md` - Configuração secrets

---

## 🎯 CHECKLIST FINAL

- [ ] Obter service_role_key do Supabase
- [ ] Configurar variáveis de ambiente locais
- [ ] Executar script SQL no Supabase
- [ ] Testar configuração local
- [ ] Configurar secrets no GitHub
- [ ] Testar GitHub Actions manualmente
- [ ] Verificar backup automático diário

---

**🚀 Após concluir todos os passos, o sistema fará backup diário automático!**
