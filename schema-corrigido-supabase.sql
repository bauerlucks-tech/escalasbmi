-- SCHEMA CORRIGIDO - SEM COLUNAS DUPLICADAS
-- Copie e cole este no SQL Editor do Supabase

-- 1. TABELA DE USUÁRIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('operador', 'administrador', 'super_admin')) DEFAULT 'operador',
  status VARCHAR(20) CHECK (status IN ('ativo', 'arquivado')) DEFAULT 'ativo',
  hide_from_schedule BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE ESCALAS MENSAIS
CREATE TABLE month_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  entries JSONB NOT NULL,
  imported_by UUID REFERENCES users(id),
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year)
);

-- 3. TABELA DE ENTRADAS DE ESCALA
CREATE TABLE schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES month_schedules(id) ON DELETE CASCADE,
  date VARCHAR(10) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  meio_periodo VARCHAR(100) NOT NULL,
  fechamento VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE SOLICITAÇÕES DE TROCA (CORRIGIDA)
CREATE TABLE swap_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  requester_name VARCHAR(100) NOT NULL,
  target_id UUID REFERENCES users(id),
  target_name VARCHAR(100) NOT NULL,
  original_date VARCHAR(10) NOT NULL,
  original_shift VARCHAR(20) CHECK (original_shift IN ('meioPeriodo', 'fechamento')),
  target_date VARCHAR(10) NOT NULL,
  target_shift VARCHAR(20) CHECK (target_shift IN ('meioPeriodo', 'fechamento')),
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'approved')) DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by VARCHAR(100),
  admin_approved BOOLEAN DEFAULT FALSE,
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  admin_approved_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE FÉRIAS
CREATE TABLE vacation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES users(id),
  operator_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by VARCHAR(100),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL
);

-- 6. TABELA DE LOGS DE AUDITORIA
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE BACKUPS AUTOMÁTICOS
CREATE TABLE system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_data JSONB NOT NULL,
  backup_type VARCHAR(50) DEFAULT 'automatic',
  version VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size BIGINT
);

-- 8. ÍNDICES OTIMIZADOS
CREATE INDEX idx_month_schedules_month_year ON month_schedules(month, year);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_schedule_entries_meio_periodo ON schedule_entries(meio_periodo);
CREATE INDEX idx_schedule_entries_fechamento ON schedule_entries(fechamento);

-- 9. DADOS INICIAIS - USUÁRIOS
INSERT INTO users (name, password, role, status) VALUES
('LUCAS', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'operador', 'ativo'),
('CARLOS', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'operador', 'ativo'),
('ROSANA', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'operador', 'ativo'),
('HENRIQUE', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'operador', 'ativo'),
('KELLY', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'operador', 'ativo'),
('GUILHERME', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'operador', 'ativo'),
('RICARDO', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'administrador', 'ativo'),
('ADMIN', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe', 'super_admin', 'ativo');

-- 10. HABILITAR ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;

-- 11. POLÍTICAS DE SEGURANÇA
CREATE POLICY "Anyone can view active schedules" ON month_schedules
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view swap requests" ON swap_requests
  FOR SELECT USING (status = 'pending');

CREATE POLICY "Anyone can view vacation requests" ON vacation_requests
  FOR SELECT USING (status = 'pending');

-- 12. FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. TRIGGERS
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_month_schedules_updated_at BEFORE UPDATE ON month_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. VIEWS ÚTEIS
CREATE VIEW active_schedules AS
SELECT 
  ms.*,
  u.name as imported_by_name
FROM month_schedules ms
LEFT JOIN users u ON ms.imported_by = u.id
WHERE ms.is_active = TRUE
ORDER BY ms.year DESC, ms.month DESC;

CREATE VIEW pending_swaps AS
SELECT 
  sr.*,
  req_user.name as requester_name,
  target_user.name as target_name
FROM swap_requests sr
LEFT JOIN users req_user ON sr.requester_id = req_user.id
LEFT JOIN users target_user ON sr.target_id = target_user.id
WHERE sr.status = 'pending'
ORDER BY sr.created_at DESC;
