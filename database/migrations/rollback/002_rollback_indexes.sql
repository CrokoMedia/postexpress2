-- ============================================
-- ROLLBACK 002: Indexes Otimizados
-- Descrição: Reverter migration 002_add_indexes.sql
-- Data: 2026-02-16
-- ============================================

-- ============================================
-- DROP PROFILES INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_profiles_last_scraped;
DROP INDEX IF EXISTS idx_profiles_followers;
DROP INDEX IF EXISTS idx_profiles_verified;
DROP INDEX IF EXISTS idx_profiles_biography_trgm;
DROP INDEX IF EXISTS idx_profiles_full_name_trgm;

-- ============================================
-- DROP AUDITS INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_audits_search_vector;
DROP INDEX IF EXISTS idx_audits_problems_gin;
DROP INDEX IF EXISTS idx_audits_strengths_gin;
DROP INDEX IF EXISTS idx_audits_raw_json_gin;
DROP INDEX IF EXISTS idx_audits_profile_score_date;
DROP INDEX IF EXISTS idx_audits_type;
DROP INDEX IF EXISTS idx_audits_classification;
DROP INDEX IF EXISTS idx_audits_score;

-- ============================================
-- DROP POSTS INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_posts_caption_trgm;
DROP INDEX IF EXISTS idx_posts_comments_gin;
DROP INDEX IF EXISTS idx_posts_ocr_data_gin;
DROP INDEX IF EXISTS idx_posts_instagram_id;
DROP INDEX IF EXISTS idx_posts_audit_likes_ts;
DROP INDEX IF EXISTS idx_posts_type;
DROP INDEX IF EXISTS idx_posts_comments;
DROP INDEX IF EXISTS idx_posts_likes;

-- ============================================
-- DROP COMMENTS INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_comments_replied_to;
DROP INDEX IF EXISTS idx_comments_text_trgm;
DROP INDEX IF EXISTS idx_comments_instagram_id;
DROP INDEX IF EXISTS idx_comments_post_category_relevant;
DROP INDEX IF EXISTS idx_comments_owner;
DROP INDEX IF EXISTS idx_comments_timestamp;
DROP INDEX IF EXISTS idx_comments_relevant;

-- ============================================
-- DROP COMPARISONS INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_comparisons_unique;
DROP INDEX IF EXISTS idx_comparisons_date;
DROP INDEX IF EXISTS idx_comparisons_growth;
DROP INDEX IF EXISTS idx_comparisons_improvement;

-- ============================================
-- DROP ANALYSIS_QUEUE INDEXES
-- ============================================

DROP INDEX IF EXISTS idx_queue_processing;
DROP INDEX IF EXISTS idx_queue_priority;
DROP INDEX IF EXISTS idx_queue_username;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'audits', 'posts', 'comments', 'comparisons', 'analysis_queue')
    AND indexname NOT LIKE '%_pkey'
    AND indexname NOT IN (
      'idx_profiles_username',
      'idx_profiles_created_at',
      'idx_audits_profile_id',
      'idx_audits_date',
      'idx_posts_audit_id',
      'idx_posts_timestamp',
      'idx_comments_post_id',
      'idx_comments_category',
      'idx_comparisons_profile_id',
      'idx_queue_status',
      'idx_queue_created'
    );

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Rollback 002 concluído!';
  RAISE NOTICE 'Indexes removidos (exceto básicos de 001).';
  RAISE NOTICE 'Indexes básicos restantes: %', index_count;
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FIM DO ROLLBACK 002
-- ============================================
