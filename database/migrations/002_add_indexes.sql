-- ============================================
-- MIGRATION 002: Indexes Otimizados
-- Descrição: Adicionar indexes avançados para performance
-- Data: 2026-02-16
-- Autor: @data-engineer
-- ============================================

-- IMPORTANTE: Rodar APÓS 001_initial_schema.sql
-- Use CONCURRENTLY para não bloquear a tabela em produção

-- ============================================
-- PROFILES - Indexes Avançados
-- ============================================

-- Full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_full_name_trgm
  ON profiles USING GIN (full_name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_biography_trgm
  ON profiles USING GIN (biography gin_trgm_ops);

-- Filtros comuns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_verified
  ON profiles(is_verified) WHERE is_verified = TRUE AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_followers
  ON profiles(followers_count DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_scraped
  ON profiles(last_scraped_at DESC);

-- ============================================
-- AUDITS - Indexes Avançados
-- ============================================

-- Scores e classificação
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_score
  ON audits(score_overall DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_classification
  ON audits(classification);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_type
  ON audits(audit_type);

-- Index composto para queries comuns (perfil + score + data)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_profile_score_date
  ON audits(profile_id, score_overall DESC, audit_date DESC);

-- JSONB indexes (GIN)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_raw_json_gin
  ON audits USING GIN (raw_json);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_strengths_gin
  ON audits USING GIN (top_strengths);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_problems_gin
  ON audits USING GIN (critical_problems);

-- Full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_search_vector
  ON audits USING GIN (search_vector);

-- ============================================
-- POSTS - Indexes Avançados
-- ============================================

-- Métricas de engajamento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_likes
  ON posts(likes_count DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_comments
  ON posts(comments_count DESC NULLS LAST);

-- Tipo de post
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_type
  ON posts(post_type);

-- Index composto para queries comuns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_audit_likes_ts
  ON posts(audit_id, likes_count DESC, post_timestamp DESC);

-- Unicidade do post_id do Instagram
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_instagram_id
  ON posts(post_id) WHERE post_id IS NOT NULL AND deleted_at IS NULL;

-- JSONB indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_ocr_data_gin
  ON posts USING GIN (ocr_data);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_comments_gin
  ON posts USING GIN (comments_categorized);

-- Full-text search no caption
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_caption_trgm
  ON posts USING GIN (caption gin_trgm_ops);

-- ============================================
-- COMMENTS - Indexes Avançados
-- ============================================

-- Filtros comuns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_relevant
  ON comments(is_relevant) WHERE is_relevant = TRUE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_timestamp
  ON comments(comment_timestamp DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_owner
  ON comments(owner_username);

-- Index composto para queries comuns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_category_relevant
  ON comments(post_id, category, is_relevant);

-- Unicidade do comment_id do Instagram
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_instagram_id
  ON comments(comment_id) WHERE comment_id IS NOT NULL AND deleted_at IS NULL;

-- Full-text search no texto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_text_trgm
  ON comments USING GIN (text gin_trgm_ops);

-- Index para threads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_replied_to
  ON comments(replied_to_comment_id) WHERE replied_to_comment_id IS NOT NULL;

-- ============================================
-- COMPARISONS - Indexes Avançados
-- ============================================

-- Métricas de crescimento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comparisons_improvement
  ON comparisons(improvement_overall DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comparisons_growth
  ON comparisons(growth_followers_pct DESC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comparisons_date
  ON comparisons(created_at DESC);

-- Unicidade: não permitir comparações duplicadas
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_comparisons_unique
  ON comparisons(profile_id, audit_before_id, audit_after_id)
  WHERE deleted_at IS NULL;

-- ============================================
-- ANALYSIS_QUEUE - Indexes Avançados
-- ============================================

-- Username
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_queue_username
  ON analysis_queue(username);

-- Prioridade (para pegar próximo job)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_queue_priority
  ON analysis_queue(priority ASC, created_at ASC)
  WHERE status = 'pending' AND deleted_at IS NULL;

-- Worker assignment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_queue_processing
  ON analysis_queue(worker_id, started_at DESC)
  WHERE status = 'processing';

-- ============================================
-- ESTATÍSTICAS E ANÁLISE
-- ============================================

-- Atualizar estatísticas de todas as tabelas
ANALYZE profiles;
ANALYZE audits;
ANALYZE posts;
ANALYZE comments;
ANALYZE comparisons;
ANALYZE analysis_queue;

-- ============================================
-- VERIFICAÇÃO DE INDEXES
-- ============================================

-- Query para verificar indexes criados
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'audits', 'posts', 'comments', 'comparisons', 'analysis_queue');

  RAISE NOTICE 'Total de indexes criados: %', index_count;
  RAISE NOTICE 'Migration 002 aplicada com sucesso!';
  RAISE NOTICE 'Próximo passo: executar 003_add_materialized_views.sql';
END $$;

-- Listar todos os indexes por tabela
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'audits', 'posts', 'comments', 'comparisons', 'analysis_queue')
ORDER BY tablename, indexname;

-- ============================================
-- FIM DA MIGRATION 002
-- ============================================
