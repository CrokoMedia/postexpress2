-- Adicionar colunas de gênero na tabela instagram_profiles
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE instagram_profiles
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS gender_auto_detected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gender_confidence DECIMAL(3,2);

-- Adicionar comentários
COMMENT ON COLUMN instagram_profiles.gender IS 'Gênero detectado (male, female, non_binary, unknown)';
COMMENT ON COLUMN instagram_profiles.gender_auto_detected IS 'Se foi detectado automaticamente';
COMMENT ON COLUMN instagram_profiles.gender_confidence IS 'Confiança da detecção (0.0 a 1.0)';
