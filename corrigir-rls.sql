-- CORREÇÃO DAS POLÍTICAS RLS - PERMITIR INSERÇÃO
-- Execute no SQL Editor do Supabase

-- 1. REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Enable read access for all users" ON month_schedules;
DROP POLICY IF EXISTS "Enable read access for all users" ON swap_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON vacation_requests;
DROP POLICY IF EXISTS "Anyone can view active schedules" ON month_schedules;
DROP POLICY IF EXISTS "Anyone can view swap requests" ON swap_requests;
DROP POLICY IF EXISTS "Anyone can view vacation requests" ON vacation_requests;

-- 2. POLÍTICAS CORRETAS - PERMITIR TUDO TEMPORARIAMENTE
CREATE POLICY "Enable all operations for anonymous users" ON month_schedules
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anonymous users" ON swap_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anonymous users" ON vacation_requests
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anonymous users" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anonymous users" ON system_backups
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read only for users" ON users
  FOR SELECT USING (true);

-- 3. DESABILITAR RLS TEMPORARIAMENTE (OPÇÃO ALTERNATIVA)
-- ALTER TABLE month_schedules DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE swap_requests DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE vacation_requests DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE system_backups DISABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR POLÍTICAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
