-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA DO BACKUP SYSTEM
-- =====================================================
-- Execute este script inteiro no SQL Editor do Supabase
-- Projeto: lsxmwwwmgfjwnowlsmzf

-- 1. Criar bucket Backup_DADOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'Backup_DADOS', 
    'Backup_DADOS', 
    false, -- privado
    52428800, -- 50MB
    ARRAY['application/octet-stream', 'application/json', 'text/plain', 'application/sql']
) ON CONFLICT (id) DO NOTHING;

-- 2. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow service role uploads to Backup_DADOS" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role downloads from Backup_DADOS" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role list Backup_DADOS" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role updates in Backup_DADOS" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role delete from Backup_DADOS" ON storage.objects;

-- 3. Criar políticas de acesso (apenas service_role)
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

-- 4. Criar funções de monitoramento
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

-- 5. Criar função de limpeza
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
    
    SELECT 
        COUNT(*),
        COALESCE(SUM(CAST(metadata->>'size' AS BIGINT)), 0)
    INTO deleted_count, freed_space
    FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS'
    AND created_at < cutoff_date
    AND name NOT LIKE 'metadata_%';
    
    DELETE FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS'
    AND created_at < cutoff_date
    AND name NOT LIKE 'metadata_%';
    
    DELETE FROM storage.objects
    WHERE bucket_id = 'Backup_DADOS'
    AND created_at < cutoff_date
    AND name LIKE 'metadata_%';
    
    RETURN QUERY SELECT deleted_count, freed_space;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar view de monitoramento
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

-- 7. Verificar configuração
SELECT '=== BUCKET CONFIGURADO ===' as status;
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    created_at
FROM storage.buckets 
WHERE name = 'Backup_DADOS';

SELECT '=== POLÍTICAS CRIADAS ===' as status;
SELECT 
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Backup_DADOS%'
ORDER BY policyname;

SELECT '=== FUNÇÕES DISPONÍVEIS ===' as status;
SELECT 
    proname as function_name,
    prosrc as description
FROM pg_proc 
WHERE proname IN ('get_backup_bucket_size', 'cleanup_old_backups');

SELECT '=== CONFIGURAÇÃO CONCLUÍDA ===' as status;
SELECT 'Bucket Backup_DADOS criado com sucesso!' as message;
SELECT 'Políticas RLS configuradas para service_role' as security;
SELECT 'Funções de monitoramento disponíveis' as monitoring;
SELECT 'Pronto para GitHub Actions!' as next_step;
