# Configuração de Secrets para Backup Diário

## 📋 Secrets Necessários no GitHub

Para que o workflow de backup funcione corretamente, você precisa configurar os seguintes secrets no repositório GitHub:

### 1. SUPABASE_URL
- **Descrição**: URL do projeto Supabase
- **Como obter**: Painel Supabase → Settings → API → Project URL
- **Exemplo**: `https://abcdefgh.supabase.co`

### 2. SUPABASE_SERVICE_ROLE_KEY
- **Descrição**: Chave de serviço com permissões de administrador
- **Como obter**: Painel Supabase → Settings → API → service_role (secret)
- **Importante**: NUNCA use a chave anon! Use sempre a service_role

## 🔧 Como Configurar os Secrets

### Via Interface Web:
1. Acesse o repositório no GitHub
2. Vá para **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione os secrets listados acima

### Via GitHub CLI:
```bash
# Configurar SUPABASE_URL
gh secret set SUPABASE_URL --body "https://your-project-ref.supabase.co"

# Configurar SUPABASE_SERVICE_ROLE_KEY
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key"
```

## 🪣 Configuração do Bucket Supabase

### 1. Criar o Bucket "Backup_DADOS"
```sql
-- Execute no SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('Backup_DADOS', 'Backup_DADOS', false);
```

### 2. Configurar Políticas de Acesso (RLS)
```sql
-- Política para permitir uploads (apenas service role)
CREATE POLICY "Allow service role uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'Backup_DADOS' AND 
  auth.role() = 'service_role'
);

-- Política para permitir downloads (apenas service role)
CREATE POLICY "Allow service role downloads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Backup_DADOS' AND 
  auth.role() = 'service_role'
);

-- Política para permitir listagem (apenas service role)
CREATE POLICY "Allow service role list" ON storage.objects
FOR SELECT USING (
  bucket_id = 'Backup_DADOS' AND 
  auth.role() = 'service_role'
);

-- Política para permitir deleção (apenas service role)
CREATE POLICY "Allow service role delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'Backup_DADOS' AND 
  auth.role() = 'service_role'
);
```

### 3. Verificar Configuração
```sql
-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE name = 'Backup_DADOS';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

## 🚀 Teste Manual do Workflow

### 1. Via GitHub Actions:
1. Vá para **Actions** no repositório
2. Selecione o workflow **Daily Database Backup**
3. Clique em **Run workflow** → **Run workflow**

### 2. Verificar Resultados:
- O backup será criado no bucket `Backup_DADOS`
- Arquivo de metadados será salvo
- Relatório será gerado como artifact
- Logs estarão disponíveis no GitHub Actions

## 📊 Estrutura dos Backups

### Formato do Arquivo:
- **Nome**: `backup_YYYYMMDD_HHMMSS.sql` ou `.json`
- **Conteúdo**: Dados completos das tabelas principais
- **Metadados**: Informações sobre o backup

### Tabelas Incluídas:
- `users` - Usuários do sistema
- `schedules` - Escalas e agendamentos
- `swap_requests` - Solicitações de troca
- `vacation_requests` - Solicitações de férias
- `audit_logs` - Logs de auditoria
- `notifications` - Notificações do sistema
- `preferences` - Preferências de usuário

## 🔄 Frequência e Retenção

### Agendamento:
- **Frequência**: Diário
- **Horário**: 02:00 UTC (23:00 BRT)
- **Trigger**: Automático via cron

### Retenção:
- **Período**: 30 dias
- **Limpeza**: Automática
- **Metadados**: Mantidos para referência

## 🔍 Monitoramento

### Logs:
- Todos os logs estão disponíveis no GitHub Actions
- Erros são notificados automaticamente
- Sucessos geram relatórios detalhados

### Alertas:
- Falhas geram notificações no workflow
- É possível configurar notificações adicionais via email ou Slack

## 🛠️ Solução de Problemas

### Erros Comuns:
1. **Permissões negadas**: Verifique se a service_role_key está correta
2. **Bucket não encontrado**: Confirme se o bucket `Backup_DADOS` existe
3. **RLS bloqueando**: Verifique as políticas de acesso
4. **Timeout**: Aumente o timeout-minutes no workflow

### Debug:
- Verifique os logs detalhados no GitHub Actions
- Teste manualmente o workflow
- Verifique a configuração dos secrets
- Confirme as permissões no Supabase

## 📞 Suporte

Caso precise de ajuda:
1. Verifique os logs no GitHub Actions
2. Confirme a configuração dos secrets
3. Valide as permissões no Supabase
4. Teste manualmente o workflow

---

**⚠️ Importante**: Mantenha suas secrets seguras e nunca as exponha em código público!
