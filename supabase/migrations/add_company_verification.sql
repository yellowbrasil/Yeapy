-- Adicionar campo de verificação na tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending'; -- pending, approved, rejected
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_rejected_reason text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_reviewed_at timestamptz;

-- Tabela para documentos de verificação
CREATE TABLE IF NOT EXISTS company_verification_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL, -- pdf, png, jpg, jpeg
  file_size integer NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_company_verification_documents_company_id ON company_verification_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_company_verification_documents_status ON company_verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_companies_verification_status ON companies(verification_status);

-- RLS
ALTER TABLE company_verification_documents ENABLE ROW LEVEL SECURITY;

-- Leitura pública de documentos aprovados
CREATE POLICY IF NOT EXISTS "Documentos aprovados são visíveis" ON company_verification_documents
  FOR SELECT USING (status = 'approved');

-- Proprietário vê seus documentos
CREATE POLICY IF NOT EXISTS "Proprietário vê seus documentos" ON company_verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );

-- Proprietário envia documentos
CREATE POLICY IF NOT EXISTS "Proprietário envia documentos" ON company_verification_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );

-- Admin revisa documentos
CREATE POLICY IF NOT EXISTS "Admin revisa documentos" ON company_verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND app_metadata->>'role' = 'admin'
    )
  );
