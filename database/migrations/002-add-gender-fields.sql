-- ============================================
-- Migração 002: Adicionar campos de gênero
-- ============================================

-- Adicionar campos de gênero na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('masculino', 'feminino', 'neutro', 'empresa')),
ADD COLUMN IF NOT EXISTS gender_auto_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gender_confidence NUMERIC(3,2) CHECK (gender_confidence BETWEEN 0 AND 1);

-- Comentários explicativos
COMMENT ON COLUMN profiles.gender IS 'Gênero do perfil: masculino, feminino, neutro, empresa';
COMMENT ON COLUMN profiles.gender_auto_detected IS 'Se o gênero foi detectado automaticamente ou definido manualmente';
COMMENT ON COLUMN profiles.gender_confidence IS 'Confiança da detecção automática (0.00 a 1.00)';

-- Index para buscar perfis por gênero
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender) WHERE gender IS NOT NULL;
