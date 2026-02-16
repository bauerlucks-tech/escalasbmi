# Sistema de Backup Automatizado

## 📋 Visão Geral

Sistema completo de backup automatizado do banco de dados Supabase usando GitHub Actions, com armazenamento no bucket `Backup_DADOS` do próprio Supabase.

## 🏗️ Arquitetura

```
GitHub Actions (Daily) 
    ↓
Supabase Database Export
    ↓
JSON/SQL Backup File
    ↓
Upload to Supabase Storage (Backup_DADOS)
    ↓
Metadata & Cleanup
```

## 📁 Estrutura de Arquivos

```
.github/workflows/
├── daily-database-backup.yml    # Workflow principal de backup

scripts/
├── create-backup-bucket.sql     # SQL para criar bucket e políticas
├── test-backup-config.js        # Script de teste local
└── setup-backup-secrets.md      # Guia de configuração

docs/
└── BACKUP_SYSTEM.md             # Esta documentação
```

## 🚀 Funcionalidades

### ✅ Backup Automatizado
- **Frequência**: Diário (02:00 UTC)
- **Trigger**: Cron job + manual
- **Formato**: JSON (dados) + metadados
- **Compressão**: Automática

### 📊 Dados Incluídos
- `users` - Usuários e autenticação
- `schedules` - Escalas e agendamentos
- `swap_requests` - Solicitações de troca
- `vacation_requests` - Solicitações de férias
- `audit_logs` - Logs de auditoria
- `notifications` - Sistema de notificações
- `preferences` - Preferências de usuário

### 🔄 Gerenciamento
- **Retenção**: 30 dias automáticos
- **Limpeza**: Backups antigos removidos
- **Metadados**: Informações completas de cada backup
- **Monitoramento**: Logs detalhados e relatórios

## 🛠️ Configuração

### 1. Pré-requisitos
- Node.js 18+
- Conta Supabase com permissões de admin
- Repositório GitHub com Actions habilitado

### 2. Configurar Bucket Supabase

Execute o script SQL:
```bash
# No SQL Editor do Supabase
cat scripts/create-backup-bucket.sql
# Copie e cole todo o conteúdo
```

### 3. Configurar Secrets GitHub

Via interface:
1. Repository → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `SUPABASE_URL`: `https://your-project-ref.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-key`

Via CLI:
```bash
gh secret set SUPABASE_URL --body "https://your-project-ref.supabase.co"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key"
```

### 4. Testar Configuração

Localmente:
```bash
# Instalar dependências
npm install @supabase/supabase-js

# Configurar variáveis
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Executar testes
node scripts/test-backup-config.js
```

GitHub Actions:
1. Actions → Daily Database Backup
2. Run workflow → Run workflow
3. Verificar logs e resultados

## 📋 Uso do Sistema

### Backup Automático
- Executa todos os dias às 02:00 UTC
- Sem intervenção manual necessária
- Logs disponíveis no GitHub Actions

### Backup Manual
1. Vá para Actions → Daily Database Backup
2. Clique em "Run workflow"
3. Aguarde conclusão

### Monitoramento
- **GitHub Actions**: Logs detalhados
- **Supabase Storage**: Arquivos no bucket
- **Artifacts**: Relatórios disponíveis por 30 dias

## 📊 Estrutura dos Backups

### Formato do Arquivo
```json
{
  "metadata": {
    "timestamp": "2024-02-16T02:00:00Z",
    "version": "1.0",
    "project_ref": "abcdefgh",
    "tables": ["users", "schedules", ...]
  },
  "data": {
    "users": [...],
    "schedules": [...],
    "swap_requests": [...]
  }
}
```

### Metadados
```json
{
  "timestamp": "2024-02-16T02:00:00Z",
  "filename": "backup_20240216_020000.json",
  "size_bytes": 1048576,
  "project_ref": "abcdefgh",
  "bucket": "Backup_DADOS",
  "url": "https://...",
  "workflow_run_id": "123456789",
  "trigger": "schedule"
}
```

## 🔧 Manutenção

### Limpeza Automática
- Remove backups com mais de 30 dias
- Remove metadados correspondentes
- Executa após cada backup bem-sucedido

### Limpeza Manual (SQL)
```sql
-- Verificar espaço usado
SELECT * FROM get_backup_bucket_size();

-- Limpar backups antigos (personalizar dias)
SELECT * FROM cleanup_old_backups(15);

-- Verificar arquivos no bucket
SELECT * FROM backup_monitoring LIMIT 10;
```

### Monitoramento
```sql
-- View com todos os backups
SELECT * FROM backup_monitoring;

-- Estatísticas do bucket
SELECT 
    COUNT(*) as total_files,
    SUM(CAST(metadata->>'size' AS BIGINT)) as total_size,
    MAX(created_at) as last_backup
FROM storage.objects 
WHERE bucket_id = 'Backup_DADOS';
```

## 🚨 Solução de Problemas

### Erros Comuns

#### 1. "Permission denied"
**Causa**: Service role key incorreta ou políticas RLS
**Solução**:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Recriar políticas
-- Execute scripts/create-backup-bucket.sql novamente
```

#### 2. "Bucket not found"
**Causa**: Bucket não foi criado
**Solução**:
```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('Backup_DADOS', 'Backup_DADOS', false);
```

#### 3. "Upload failed"
**Causa**: Permissões insuficientes ou arquivo muito grande
**Solução**:
- Verificar tamanho do arquivo (limite: 50MB)
- Verificar service_role_key
- Testar com script local

#### 4. "Timeout"
**Causa**: Banco muito grande ou conexão lenta
**Solução**:
- Aumentar timeout no workflow
- Otimizar queries de exportação
- Considerar backup incremental

### Debug Steps

1. **Verificar Secrets**:
   ```bash
   gh secret list
   ```

2. **Testar Conexão Local**:
   ```bash
   node scripts/test-backup-config.js
   ```

3. **Verificar Logs GitHub Actions**:
   - Actions → Daily Database Backup
   - Clique na execução mais recente
   - Analisar step-by-step

4. **Verificar Bucket Supabase**:
   ```sql
   SELECT * FROM storage.objects WHERE bucket_id = 'Backup_DADOS';
   ```

## 📈 Performance

### Métricas Típicas
- **Tamanho do backup**: 1-10MB (depende dos dados)
- **Duração**: 2-5 minutos
- **Frequência**: Diária
- **Retenção**: 30 dias

### Otimizações
- Backup incremental (planejado)
- Compressão adicional
- Backup paralelo de tabelas grandes
- Cache de metadados

## 🔐 Segurança

### Best Practices
- ✅ Usar sempre `service_role_key` (nunca `anon`)
- ✅ Manter secrets seguros no GitHub
- ✅ Bucket privado (acesso apenas service_role)
- ✅ Logs de auditoria em todos os acessos
- ✅ Criptografia em trânsito (HTTPS)

### Permissões
- **GitHub Actions**: Leitura do repositório
- **Supabase**: Acesso completo ao bucket
- **Service Role**: Permissões de administrador

## 📞 Suporte

### Recursos
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

### Contingência
1. **Backup falha**: Executar manualmente
2. **Dados corrompidos**: Restaurar do backup anterior
3. **Bucket cheio**: Limpeza manual ou aumentar retention
4. **Permissões perdidas**: Recriar bucket e políticas

---

## 🚀 Resumo Rápido

1. **Setup**: Execute `create-backup-bucket.sql`
2. **Secrets**: Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
3. **Teste**: Execute `test-backup-config.js`
4. **Deploy**: GitHub Actions fará backup diário automaticamente
5. **Monitor**: Verifique logs e bucket regularmente

**🎉 Sistema pronto para uso em produção!**
