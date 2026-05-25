-- Add logo_square field to companies
ALTER TABLE companies ADD COLUMN logo_square_url text;

-- Create storage bucket for square logos if it doesn't exist
-- This would be done via Supabase dashboard, but documenting here

COMMENT ON COLUMN companies.logo_square_url IS 'Quadrado (1:1) logo for offer cards and compact displays';
