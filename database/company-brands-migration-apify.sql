-- Migração: Adicionar campos da Apify à tabela company_brands
-- Execute no SQL Editor do Supabase

-- Adicionar novos campos
ALTER TABLE company_brands
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS extracted_images JSONB DEFAULT '[]';

-- Comentários
COMMENT ON COLUMN company_brands.hero_image_url IS 'Imagem hero/principal extraída do site (Apify)';
COMMENT ON COLUMN company_brands.extracted_images IS 'Array de URLs de imagens extraídas do site (Apify)';

-- Verificar estrutura
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'company_brands'
ORDER BY ordinal_position;
