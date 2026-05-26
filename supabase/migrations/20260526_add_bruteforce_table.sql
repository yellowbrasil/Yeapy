-- Tabela de tentativas de login (para detectar brute force)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_login_attempts_email_created ON login_attempts(email, created_at DESC);
CREATE INDEX idx_login_attempts_ip_created ON login_attempts(ip_address, created_at DESC);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at DESC);

-- Política de retenção: deletar tentativas com mais de 30 dias
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Apenas admins e o próprio usuário podem ver suas tentativas
CREATE POLICY "Admin can view all login attempts"
  ON login_attempts FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "User can view own login attempts"
  ON login_attempts FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Ninguém pode deletar manualmente (apenas via função de cleanup)
CREATE POLICY "No one can delete login attempts"
  ON login_attempts FOR DELETE
  USING (false);
