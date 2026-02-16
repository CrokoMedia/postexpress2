-- ============================================
-- ROLLBACK 003: Materialized Views e Views
-- Descrição: Reverter migration 003_add_materialized_views.sql
-- Data: 2026-02-16
-- ============================================

-- ============================================
-- DROP FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS refresh_all_materialized_views();
DROP FUNCTION IF EXISTS refresh_dashboard_stats();

-- ============================================
-- DROP MATERIALIZED VIEWS
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS mv_engagement_trends CASCADE;
DROP INDEX IF EXISTS idx_mv_engagement_trends;

DROP MATERIALIZED VIEW IF EXISTS mv_score_distribution CASCADE;
DROP INDEX IF EXISTS idx_mv_score_distribution;

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats CASCADE;
DROP INDEX IF EXISTS idx_mv_dashboard_stats;

-- ============================================
-- DROP VIEWS
-- ============================================

DROP VIEW IF EXISTS recent_activity CASCADE;
DROP VIEW IF EXISTS top_performers CASCADE;
DROP VIEW IF EXISTS profile_evolution CASCADE;
DROP VIEW IF EXISTS latest_audits CASCADE;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

DO $$
DECLARE
  view_count INTEGER;
  mv_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN ('latest_audits', 'profile_evolution', 'top_performers', 'recent_activity');

  SELECT COUNT(*) INTO mv_count
  FROM pg_matviews
  WHERE schemaname = 'public'
    AND matviewname IN ('mv_dashboard_stats', 'mv_score_distribution', 'mv_engagement_trends');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Rollback 003 concluído!';
  RAISE NOTICE 'Views removidas: % (esperado: 0)', view_count;
  RAISE NOTICE 'Materialized views removidas: % (esperado: 0)', mv_count;
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FIM DO ROLLBACK 003
-- ============================================
