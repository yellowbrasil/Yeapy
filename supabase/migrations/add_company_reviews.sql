-- Tabela de avaliações de empresas
CREATE TABLE company_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id) -- Um usuário avalia uma empresa apenas uma vez
);

-- Tabela de respostas do proprietário a avaliações
CREATE TABLE company_review_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES company_reviews(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_company_reviews_company_id ON company_reviews(company_id);
CREATE INDEX idx_company_reviews_user_id ON company_reviews(user_id);
CREATE INDEX idx_company_reviews_created_at ON company_reviews(created_at DESC);
CREATE INDEX idx_company_review_responses_review_id ON company_review_responses(review_id);
CREATE INDEX idx_company_review_responses_company_id ON company_review_responses(company_id);

-- RLS Policies
ALTER TABLE company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_review_responses ENABLE ROW LEVEL SECURITY;

-- Leitura pública de avaliações
CREATE POLICY "Avaliações públicas são legíveis por todos" ON company_reviews
  FOR SELECT USING (is_public = true);

-- Usuários podem ver suas próprias avaliações
CREATE POLICY "Usuários veem suas próprias avaliações" ON company_reviews
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Usuários logados podem criar avaliações
CREATE POLICY "Usuários logados podem criar avaliações" ON company_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias avaliações
CREATE POLICY "Usuários atualizam suas próprias avaliações" ON company_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Respostas públicas
CREATE POLICY "Respostas são legíveis por todos" ON company_review_responses
  FOR SELECT USING (true);

-- Apenas proprietário pode responder
CREATE POLICY "Proprietário responde avaliações" ON company_review_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );

-- Proprietário pode atualizar suas respostas
CREATE POLICY "Proprietário atualiza respostas" ON company_review_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE id = company_id AND owner_id = auth.uid()
    )
  );
