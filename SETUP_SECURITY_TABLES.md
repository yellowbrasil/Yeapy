# Setup de Tabelas de Segurança

Para finalizar a implementação de segurança, você precisa criar as tabelas no Supabase.

## Opção 1: Via Dashboard (Recomendado)

1. Acesse: https://app.supabase.com/project/vypoivvincfrjndqdmus
2. Vá em: **SQL Editor**
3. Clique em **New Query**
4. Cole o SQL abaixo e execute:

```sql
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

-- Tabela de admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admins_user_id ON admins(user_id);

-- Enable RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS policies para security_logs (admin pode ver tudo, user vê seus próprios logs)
CREATE POLICY "Admin can view all logs"
  ON security_logs FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "User can view own logs"
  ON security_logs FOR SELECT
  USING (user_id = auth.uid());

-- RLS policies para 2FA
CREATE POLICY "User can view own 2FA"
  ON two_factor_auth FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User can update own 2FA"
  ON two_factor_auth FOR UPDATE
  USING (user_id = auth.uid());

-- RLS policies para admins
CREATE POLICY "Anyone can view admin list"
  ON admins FOR SELECT
  USING (true);
```

5. Clique em **Run** e aguarde a execução.

✅ **Pronto!** As tabelas foram criadas.

---

## Opção 2: Criar Dados de Teste

Para popular o banco com ofertas de teste:

```bash
# No seu terminal local, na pasta do projeto:
npm run ts-node scripts/seed-data.ts
```

Isso vai criar:
- 1 usuário de teste: `anunciante@yeapy.shop`
- 1 empresa de teste
- 5 ofertas de teste com imagens

---

## Próximos Passos

1. ✅ Tabelas criadas
2. ⏳ Testar 2FA (endpoint será criado depois)
3. ⏳ Verificar logs (Dashboard será criado depois)
4. ⏳ Configurar admins (rodar SQL INSERT)

---

## Verificar se funcionou

```bash
curl https://yeapy.shop/api/offers?limit=5
```

Se retornar ofertas, as tabelas estão OK! ✅
