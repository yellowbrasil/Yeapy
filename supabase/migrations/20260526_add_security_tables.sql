-- Tabela de logs de segurança
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_company_id ON security_logs(company_id);
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);

-- Tabela de 2FA
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_two_factor_auth_user_id ON two_factor_auth(user_id);

-- Tabela de admins (para controlar acesso ao painel admin)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admins_user_id ON admins(user_id);

-- RLS policies para security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all logs"
  ON security_logs FOR SELECT
  USING (
    (SELECT user_id FROM auth.users(id) = auth.uid()) IN (
      SELECT user_id FROM admins
    )
  );

CREATE POLICY "User can view own logs"
  ON security_logs FOR SELECT
  USING (user_id = auth.uid());

-- RLS policies para two_factor_auth
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view own 2FA"
  ON two_factor_auth FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User can update own 2FA"
  ON two_factor_auth FOR UPDATE
  USING (user_id = auth.uid());

-- RLS policies para admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view admin list"
  ON admins FOR SELECT
  USING (true);
