-- ============================================
-- MIGRATION 005: Soft Delete para Profiles
-- ============================================
-- Adiciona coluna deleted_at para soft delete de perfis

-- Adicionar coluna deleted_at (se não existir)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Índice para deleted_at
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at);

-- Atualizar políticas RLS para filtrar perfis deletados
DROP POLICY IF EXISTS "Public read access" ON profiles;

CREATE POLICY "Public read access" ON profiles
  FOR SELECT
  USING (deleted_at IS NULL);

-- Política de soft delete (marca deleted_at ao invés de remover)
CREATE POLICY "Public delete access" ON profiles
  FOR DELETE
  USING (true);

-- Comentários
COMMENT ON COLUMN profiles.deleted_at IS 'Data/hora em que o perfil foi deletado (soft delete)';
