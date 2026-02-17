-- ============================================
-- MIGRATION 006: Soft Delete para TODAS as tabelas
-- ============================================
-- Adiciona coluna deleted_at para soft delete em todas as tabelas

-- 1. ANALYSIS_QUEUE
ALTER TABLE analysis_queue
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_analysis_queue_deleted ON analysis_queue(deleted_at);

COMMENT ON COLUMN analysis_queue.deleted_at IS 'Data/hora em que a análise foi deletada (soft delete)';

-- 2. PROFILES (caso não tenha sido aplicada migration 005)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at);

COMMENT ON COLUMN profiles.deleted_at IS 'Data/hora em que o perfil foi deletado (soft delete)';

-- 3. AUDITS
ALTER TABLE audits
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_audits_deleted ON audits(deleted_at);

COMMENT ON COLUMN audits.deleted_at IS 'Data/hora em que a auditoria foi deletada (soft delete)';

-- 4. POSTS
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_posts_deleted ON posts(deleted_at);

COMMENT ON COLUMN posts.deleted_at IS 'Data/hora em que o post foi deletado (soft delete)';

-- 5. COMMENTS
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_comments_deleted ON comments(deleted_at);

COMMENT ON COLUMN comments.deleted_at IS 'Data/hora em que o comentário foi deletado (soft delete)';

-- 6. COMPARISONS
ALTER TABLE comparisons
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_comparisons_deleted ON comparisons(deleted_at);

COMMENT ON COLUMN comparisons.deleted_at IS 'Data/hora em que a comparação foi deletada (soft delete)';

-- 7. UPLOADED_DOCUMENTS (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'uploaded_documents'
  ) THEN
    ALTER TABLE uploaded_documents
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

    CREATE INDEX IF NOT EXISTS idx_documents_deleted ON uploaded_documents(deleted_at);

    COMMENT ON COLUMN uploaded_documents.deleted_at IS 'Data/hora em que o documento foi deletado (soft delete)';
  END IF;
END $$;

-- ============================================
-- ATUALIZAR POLÍTICAS RLS
-- ============================================

-- PROFILES
DROP POLICY IF EXISTS "Public read access" ON profiles;
CREATE POLICY "Public read access" ON profiles
  FOR SELECT
  USING (deleted_at IS NULL);

-- AUDITS
DROP POLICY IF EXISTS "Public read access" ON audits;
CREATE POLICY "Public read access" ON audits
  FOR SELECT
  USING (deleted_at IS NULL);

-- POSTS
DROP POLICY IF EXISTS "Public read access" ON posts;
CREATE POLICY "Public read access" ON posts
  FOR SELECT
  USING (deleted_at IS NULL);

-- COMMENTS
DROP POLICY IF EXISTS "Public read access" ON comments;
CREATE POLICY "Public read access" ON comments
  FOR SELECT
  USING (deleted_at IS NULL);

-- COMPARISONS
DROP POLICY IF EXISTS "Public read access" ON comparisons;
CREATE POLICY "Public read access" ON comparisons
  FOR SELECT
  USING (deleted_at IS NULL);

-- ANALYSIS_QUEUE
DROP POLICY IF EXISTS "Public read access" ON analysis_queue;
CREATE POLICY "Public read access" ON analysis_queue
  FOR SELECT
  USING (deleted_at IS NULL);

-- ============================================
-- CONCLUÍDO
-- ============================================

-- Verificar estrutura
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name = 'deleted_at'
  AND table_schema = 'public'
ORDER BY table_name;
