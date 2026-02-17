-- ============================================
-- MIGRATION 003: Materialized Views e Views
-- Descrição: Criar views otimizadas para dashboard
-- Data: 2026-02-16
-- Autor: @data-engineer
-- ============================================

-- IMPORTANTE: Rodar APÓS 002_add_indexes.sql

-- ============================================
-- VIEWS NORMAIS (sempre atualizadas)
-- ============================================

-- View: Últimas auditorias com dados do perfil
CREATE OR REPLACE VIEW latest_audits AS
SELECT
  a.id,
  a.audit_date,
  a.audit_type,
  a.score_overall,
  a.classification,
  a.engagement_rate,
  a.posts_analyzed,
  p.id as profile_id,
  p.username,
  p.full_name,
  p.is_verified,
  p.profile_pic_url_hd,
  p.followers_count,
  ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY a.audit_date DESC) as audit_rank
FROM audits a
JOIN profiles p ON a.profile_id = p.id
WHERE a.deleted_at IS NULL AND p.deleted_at IS NULL
ORDER BY a.audit_date DESC;

COMMENT ON VIEW latest_audits IS 'Últimas auditorias com dados do perfil (sempre atualizada)';

-- View: Perfis com evolução (última vs primeira auditoria)
CREATE OR REPLACE VIEW profile_evolution AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.followers_count,
  p.total_audits,
  first_audit.id as first_audit_id,
  first_audit.score_overall as first_score,
  first_audit.audit_date as first_audit_date,
  last_audit.id as last_audit_id,
  last_audit.score_overall as last_score,
  last_audit.audit_date as last_audit_date,
  (last_audit.score_overall - first_audit.score_overall) as score_improvement,
  EXTRACT(DAY FROM (last_audit.audit_date - first_audit.audit_date))::INTEGER as days_between
FROM profiles p
LEFT JOIN LATERAL (
  SELECT id, score_overall, audit_date
  FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date ASC
  LIMIT 1
) first_audit ON TRUE
LEFT JOIN LATERAL (
  SELECT id, score_overall, audit_date
  FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
  AND first_audit.id IS NOT NULL
  AND last_audit.id IS NOT NULL;

COMMENT ON VIEW profile_evolution IS 'Evolução de perfis (primeira vs última auditoria)';

-- View: Top performers (melhores perfis por score)
CREATE OR REPLACE VIEW top_performers AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profile_pic_url_hd,
  p.followers_count,
  p.is_verified,
  a.score_overall,
  a.engagement_rate,
  a.classification,
  a.audit_date
FROM profiles p
JOIN LATERAL (
  SELECT score_overall, engagement_rate, classification, audit_date
  FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
) a ON TRUE
WHERE p.deleted_at IS NULL
ORDER BY a.score_overall DESC, a.engagement_rate DESC;

COMMENT ON VIEW top_performers IS 'Top performers por score e engajamento';

-- View: Recent activity (atividade recente)
CREATE OR REPLACE VIEW recent_activity AS
SELECT
  'audit_created' as activity_type,
  a.id as activity_id,
  p.username,
  p.full_name,
  a.score_overall as value,
  a.created_at as activity_date
FROM audits a
JOIN profiles p ON a.profile_id = p.id
WHERE a.deleted_at IS NULL AND p.deleted_at IS NULL

UNION ALL

SELECT
  'profile_created' as activity_type,
  p.id as activity_id,
  p.username,
  p.full_name,
  p.followers_count as value,
  p.created_at as activity_date
FROM profiles p
WHERE p.deleted_at IS NULL

ORDER BY activity_date DESC
LIMIT 50;

COMMENT ON VIEW recent_activity IS 'Atividade recente do sistema (últimos 50 eventos)';

-- ============================================
-- MATERIALIZED VIEWS (cache para dashboard)
-- ============================================

-- Dashboard stats (agregações)
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats CASCADE;

CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT CASE WHEN p.is_verified THEN p.id END) as verified_profiles,
  COUNT(DISTINCT a.id) as total_audits,
  COUNT(DISTINCT CASE WHEN a.audit_date >= NOW() - INTERVAL '30 days' THEN a.id END) as audits_last_30d,
  ROUND(AVG(a.score_overall), 2) as avg_score_overall,
  ROUND(AVG(a.engagement_rate), 3) as avg_engagement_rate,
  COUNT(DISTINCT po.id) as total_posts,
  COUNT(DISTINCT c.id) as total_comments,
  MAX(a.audit_date) as last_audit_date,
  NOW() as refreshed_at
FROM profiles p
LEFT JOIN audits a ON a.profile_id = p.id AND a.deleted_at IS NULL
LEFT JOIN posts po ON po.audit_id = a.id AND po.deleted_at IS NULL
LEFT JOIN comments c ON c.post_id = po.id AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

-- Index único na materialized view (necessário para REFRESH CONCURRENTLY)
CREATE UNIQUE INDEX idx_mv_dashboard_stats ON mv_dashboard_stats((true));

COMMENT ON MATERIALIZED VIEW mv_dashboard_stats IS 'Estatísticas do dashboard (refresh a cada 1h)';

-- ============================================
-- FUNCTION PARA REFRESH DE MATERIALIZED VIEWS
-- ============================================

-- Function para refresh automático
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
  RAISE NOTICE 'mv_dashboard_stats refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_dashboard_stats IS 'Refresh da materialized view mv_dashboard_stats (usar em cron job)';

-- ============================================
-- MATERIALIZED VIEW: Score Distribution
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS mv_score_distribution CASCADE;

CREATE MATERIALIZED VIEW mv_score_distribution AS
SELECT
  CASE
    WHEN score_overall BETWEEN 0 AND 20 THEN '0-20 (Crítico)'
    WHEN score_overall BETWEEN 21 AND 40 THEN '21-40 (Ruim)'
    WHEN score_overall BETWEEN 41 AND 60 THEN '41-60 (Mediano)'
    WHEN score_overall BETWEEN 61 AND 80 THEN '61-80 (Bom)'
    WHEN score_overall BETWEEN 81 AND 100 THEN '81-100 (Excelente)'
  END as score_range,
  COUNT(*) as count,
  ROUND(AVG(engagement_rate), 3) as avg_engagement,
  ROUND(AVG(total_likes), 0) as avg_likes
FROM audits
WHERE deleted_at IS NULL
  AND audit_date >= NOW() - INTERVAL '90 days'  -- Últimos 90 dias
GROUP BY score_range
ORDER BY score_range;

CREATE UNIQUE INDEX idx_mv_score_distribution ON mv_score_distribution(score_range);

COMMENT ON MATERIALIZED VIEW mv_score_distribution IS 'Distribuição de scores (últimos 90 dias)';

-- ============================================
-- MATERIALIZED VIEW: Engagement Trends
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS mv_engagement_trends CASCADE;

CREATE MATERIALIZED VIEW mv_engagement_trends AS
SELECT
  DATE_TRUNC('day', audit_date)::DATE as date,
  COUNT(*) as audits_count,
  ROUND(AVG(score_overall), 2) as avg_score,
  ROUND(AVG(engagement_rate), 3) as avg_engagement,
  ROUND(AVG(total_likes), 0) as avg_likes,
  ROUND(AVG(total_comments), 0) as avg_comments
FROM audits
WHERE deleted_at IS NULL
  AND audit_date >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', audit_date)
ORDER BY date DESC;

CREATE UNIQUE INDEX idx_mv_engagement_trends ON mv_engagement_trends(date);

COMMENT ON MATERIALIZED VIEW mv_engagement_trends IS 'Tendências de engajamento por dia (últimos 90 dias)';

-- ============================================
-- FUNCTION PARA REFRESH DE TODAS AS MATERIALIZED VIEWS
-- ============================================

CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
  RAISE NOTICE 'mv_dashboard_stats refreshed';

  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_score_distribution;
  RAISE NOTICE 'mv_score_distribution refreshed';

  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_engagement_trends;
  RAISE NOTICE 'mv_engagement_trends refreshed';

  RAISE NOTICE 'All materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views IS 'Refresh de todas as materialized views (executar via cron a cada 1h)';

-- ============================================
-- SCHEDULE REFRESH (Supabase/pg_cron)
-- ============================================

-- NOTA: Se usar pg_cron extension (Supabase Pro):
-- SELECT cron.schedule('refresh-dashboard-stats', '0 * * * *', 'SELECT refresh_all_materialized_views()');
-- Isso executará a cada hora (minuto 0)

-- Alternativa: executar manualmente via API/backend
-- ou usar Supabase Edge Functions com cron trigger

-- ============================================
-- ANÁLISE DE VIEWS
-- ============================================

-- Atualizar estatísticas
ANALYZE profiles;
ANALYZE audits;
ANALYZE posts;
ANALYZE comments;

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

  RAISE NOTICE 'Views criadas: %', view_count;
  RAISE NOTICE 'Materialized views criadas: %', mv_count;
  RAISE NOTICE 'Migration 003 aplicada com sucesso!';
  RAISE NOTICE 'Próximo passo: executar seeds (migrations/seeds/)';
END $$;

-- Listar todas as views
SELECT
  schemaname,
  matviewname,
  definition
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- ============================================
-- REFRESH INICIAL
-- ============================================

-- Executar refresh inicial (pode demorar se houver muitos dados)
SELECT refresh_all_materialized_views();

-- ============================================
-- FIM DA MIGRATION 003
-- ============================================
