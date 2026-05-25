-- Adicionar coluna images (array de URLs) na tabela offers
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]';

-- Criar bucket de storage para imagens de ofertas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'offers',
  'offers',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Politica: qualquer pessoa pode ver as imagens
CREATE POLICY "offers_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'offers');

-- Politica: usuarios autenticados podem fazer upload
CREATE POLICY "offers_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'offers'
    AND auth.role() = 'authenticated'
  );

-- Politica: usuario pode deletar suas proprias imagens
CREATE POLICY "offers_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'offers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
