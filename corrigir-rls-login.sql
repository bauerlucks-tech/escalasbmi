-- CORRIGIR POLÍTICAS RLS PARA LOGIN SIMPLES
-- Permitir acesso anônimo para autenticação

-- 1. REMOVER POLÍTICAS ANTIGAS DA TABELA USERS
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable all operations for anonymous users" ON users;
DROP POLICY IF EXISTS "Enable read only for users" ON users;

-- 2. CRIAR POLÍTICAS CORRETAS PARA LOGIN
-- Permitir leitura para login (qualquer um pode verificar nome/senha)
CREATE POLICY "Allow read for login" ON users
  FOR SELECT USING (true);

-- Permitir atualização de senhas (qualquer um pode atualizar própria senha)
CREATE POLICY "Allow update own password" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Permitir inserção (para criação de novos usuários)
CREATE POLICY "Allow insert for registration" ON users
  FOR INSERT WITH CHECK (true);

-- 3. VERIFICAR POLÍTICAS ATUAIS
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
  AND tablename = 'users'
ORDER BY policyname;

-- 4. DESABILITAR RLS TEMPORARIAMENTE (OPÇÃO ALTERNATIVA)
-- Se as políticas acima não funcionarem, desabilite RLS temporariamente:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 5. TESTAR ACESSO
-- Depois de executar este script, teste o login novamente
