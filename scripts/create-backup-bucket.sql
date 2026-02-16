-- Script para criar bucket de backup e configurar políticas de acesso
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar extensão necessária (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar o bucket Backup_DADOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'Backup_DADOS', 
    'Backup_DADOS', 
    false, -- privado (apenas service role pode acessar)
    52428800, -- 50MB de limite por arquivo
    ARRAY['application/octet-stream', 'application/json', 'text/plain', 'application/sql']
) ON CONFLICT (id) DO NOTHING;

-- 3. Criar políticas de acesso (RLS - Row Level Security)

-- Política para permitir uploads (apenas service role)
CREATE POLICY "Allow service role uploads to Backup_DADOS" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

-- Política para permitir downloads/leitura (apenas service role)
CREATE POLICY "Allow service role downloads from Backup_DADOS" ON storage.objects
FOR SELECT USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

-- Política para permitir listagem de arquivos (apenas service role)
CREATE POLICY "Allow service role list Backup_DADOS" ON storage.objects
FOR SELECT USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

-- Política para permitir atualização (apenas service role)
CREATE POLICY "Allow service role updates in Backup_DADOS" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

-- Política para permitir deleção (apenas service role)
CREATE POLICY "Allow service role delete from Backup_DADOS" ON storage.objects
FOR DELETE USING (
    bucket_id = 'Backup_DADOS' AND 
    auth.role() = 'service_role'
);

-- 4. Verificar configuração
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    created_at
FROM storage.buckets 
WHERE name = 'Backup_DADOS';

-- 5. Verificar políticas criadas
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Backup_DADOS%';

-- 6. Criar função para verificar espaço usado no bucket (opcional)
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

-- 7. Criar função para limpar backups antigos (backup manual)
CREATE OR REPLACE FUNCTION cleanup_old_backups(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE(
    files_deleted BIGINT,
    space_freed BIGINT
) AS $$
DECLARE
    cutoff_date TIMESTAMPTZ;
    deleted_count BIGINT;
    freed_space BIGINT;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * days_to_keep;
    
    -- Calcular espaço que será liberado
    SELECT 
        COUNT(*),
        COALESCE(SUM(CAST(metadata->>'size' AS BIGINT)), 0)
    INTO deleted_count, freed_space
    FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS'
    AND created_at < cutoff_date
    AND name NOT LIKE 'metadata_%';
    
    -- Deletar arquivos antigos
    DELETE FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS'
    AND created_at < cutoff_date
    AND name NOT LIKE 'metadata_%';
    
    -- Deletar metadados correspondentes
    DELETE FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS'
    AND created_at < cutoff_date
    AND name LIKE 'metadata_%';
    
    RETURN QUERY SELECT deleted_count, freed_space;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Testar permissões (opcional - para verificação)
-- Este comando deve ser executado com a service_role_key
-- SELECT * FROM storage.objects WHERE bucket_id = 'Backup_DADOS' LIMIT 1;

-- 9. Criar view para monitoramento (opcional)
CREATE OR REPLACE VIEW backup_monitoring AS
SELECT 
    name as filename,
    created_at as backup_date,
    CAST(metadata->>'size' AS BIGINT) as file_size_bytes,
    metadata->>'mimetype' as mime_type,
    CASE 
        WHEN name LIKE 'metadata_%' THEN 'metadata'
        ELSE 'backup'
    END as file_type
FROM storage.objects
WHERE bucket_id = 'Backup_DADOS'
ORDER BY created_at DESC;

-- 10. Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Bucket Backup_DADOS criado com sucesso!';
    RAISE NOTICE '📋 Políticas de acesso configuradas para service_role';
    RAISE NOTICE '🔧 Funções de manutenção criadas';
    RAISE NOTICE '📊 View de monitoramento criada';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Pronto para usar com GitHub Actions!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Próximos passos:';
    RAISE NOTICE '1. Configure os secrets no GitHub (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)';
    RAISE NOTICE '2. Execute o workflow manualmente para testar';
    RAISE NOTICE '3. Verifique os backups no bucket Backup_DADOS';
END $$;
