-- ============================================
-- ROLLBACK 001: Initial Schema
-- Descrição: Reverter migration 001_initial_schema.sql
-- Data: 2026-02-16
-- ============================================

-- ATENÇÃO: Este script DELETA TODOS OS DADOS!
-- Use com extremo cuidado!

-- ============================================
-- CONFIRMAÇÃO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ATENÇÃO: Rollback vai DELETAR TODOS OS DADOS!';
  RAISE NOTICE 'Pressione Ctrl+C para cancelar nos próximos 5 segundos...';
  RAISE NOTICE '========================================';
  PERFORM pg_sleep(5);
END $$;

-- ============================================
-- DROP RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public read access" ON analysis_queue;
DROP POLICY IF EXISTS "Public read access" ON comparisons;
DROP POLICY IF EXISTS "Public read access" ON comments;
DROP POLICY IF EXISTS "Public read access" ON posts;
DROP POLICY IF EXISTS "Public read access" ON audits;
DROP POLICY IF EXISTS "Public read access" ON profiles;

-- ============================================
-- DROP TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS auto_comparison ON audits;
DROP TRIGGER IF EXISTS tsvectorupdate ON audits;
DROP TRIGGER IF EXISTS audit_created ON audits;
DROP TRIGGER IF EXISTS update_queue_updated_at ON analysis_queue;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
DROP TRIGGER IF EXISTS update_audits_updated_at ON audits;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- ============================================
-- DROP FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS auto_create_comparison();
DROP FUNCTION IF EXISTS audits_search_vector_trigger();
DROP FUNCTION IF EXISTS increment_profile_audits();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================
-- DROP INDEXES (básicos criados em 001)
-- ============================================

DROP INDEX IF EXISTS idx_queue_created;
DROP INDEX IF EXISTS idx_queue_username;
DROP INDEX IF EXISTS idx_queue_status;
DROP INDEX IF EXISTS idx_comparisons_profile_id;
DROP INDEX IF EXISTS idx_comments_category;
DROP INDEX IF EXISTS idx_comments_post_id;
DROP INDEX IF EXISTS idx_posts_timestamp;
DROP INDEX IF EXISTS idx_posts_audit_id;
DROP INDEX IF EXISTS idx_audits_date;
DROP INDEX IF EXISTS idx_audits_profile_id;
DROP INDEX IF EXISTS idx_profiles_created_at;
DROP INDEX IF EXISTS idx_profiles_username;

-- ============================================
-- DROP TABLES (ordem inversa de dependências)
-- ============================================

DROP TABLE IF EXISTS analysis_queue CASCADE;
DROP TABLE IF EXISTS comparisons CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS audits CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- DROP ENUMS
-- ============================================

DROP TYPE IF EXISTS audit_classification_enum;
DROP TYPE IF EXISTS queue_status_enum;
DROP TYPE IF EXISTS comment_category_enum;
DROP TYPE IF EXISTS audit_type_enum;
DROP TYPE IF EXISTS post_type_enum;

-- ============================================
-- DROP EXTENSIONS (opcional - comentado por segurança)
-- ============================================

-- DROP EXTENSION IF EXISTS "btree_gin";
-- DROP EXTENSION IF EXISTS "pg_trgm";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- ============================================
-- VERIFICAÇÃO
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'audits', 'posts', 'comments', 'comparisons', 'analysis_queue');

  IF table_count = 0 THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Rollback 001 concluído com sucesso!';
    RAISE NOTICE 'Todas as tabelas foram removidas.';
    RAISE NOTICE '========================================';
  ELSE
    RAISE WARNING 'Algumas tabelas ainda existem: %', table_count;
  END IF;
END $$;

-- ============================================
-- FIM DO ROLLBACK 001
-- ============================================
