-- LIMPEZA COMPLETA DAS TABELAS ANTIGAS
-- Copie e cole este código PRIMEIRO no SQL Editor

-- 1. Remover views (se existirem)
DROP VIEW IF EXISTS pending_swaps CASCADE;
DROP VIEW IF EXISTS active_schedules CASCADE;

-- 2. Remover triggers (se existirem)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_month_schedules_updated_at ON month_schedules;

-- 3. Remover função (se existir)
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 4. Remover políticas (se existirem)
DROP POLICY IF EXISTS "Anyone can view active schedules" ON month_schedules;
DROP POLICY IF EXISTS "Anyone can view swap requests" ON swap_requests;
DROP POLICY IF EXISTS "Anyone can view vacation requests" ON vacation_requests;

-- 5. Remover tabelas em ordem correta (dependências primeiro)
DROP TABLE IF EXISTS system_backups CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS vacation_requests CASCADE;
DROP TABLE IF EXISTS swap_requests CASCADE;
DROP TABLE IF EXISTS schedule_entries CASCADE;
DROP TABLE IF EXISTS month_schedules CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 6. Confirmar limpeza
SELECT 'Tabelas limpas com sucesso!' as status;
