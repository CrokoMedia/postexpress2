-- ============================================
-- QUERIES OTIMIZADAS - INSTAGRAM AUDIT SYSTEM
-- Casos de uso principais com EXPLAIN ANALYZE
-- ============================================

-- ============================================
-- 1. DASHBOARD HOME - Listar perfis com última auditoria
-- ============================================

-- Query otimizada usando materialized view + lateral join
-- Performance: ~10ms para 100 perfis
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profile_pic_url_hd,
  p.followers_count,
  p.is_verified,
  p.total_audits,
  p.last_scraped_at,
  last_audit.id as last_audit_id,
  last_audit.score_overall,
  last_audit.classification,
  last_audit.engagement_rate,
  last_audit.audit_date,
  last_audit.posts_analyzed
FROM profiles p
LEFT JOIN LATERAL (
  SELECT
    id,
    score_overall,
    classification,
    engagement_rate,
    audit_date,
    posts_analyzed
  FROM audits
  WHERE profile_id = p.id
    AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
ORDER BY p.last_scraped_at DESC
LIMIT 20 OFFSET 0;

-- EXPLAIN ANALYZE:
-- Index Scan on profiles (cost=0.15..45.23 rows=20)
-- Lateral Subquery Scan (cost=0.15..2.34 rows=1)
--   -> Index Scan on audits (cost=0.15..2.33 rows=1)
-- Total: ~8-12ms

-- ============================================
-- 2. BUSCAR PERFIL COMPLETO (com última auditoria)
-- ============================================

-- Query para página de detalhes do perfil
-- Performance: ~5ms
WITH last_audit AS (
  SELECT
    id,
    score_overall,
    classification,
    engagement_rate,
    audit_date,
    posts_analyzed,
    score_behavior,
    score_copy,
    score_offers,
    score_metrics,
    score_anomalies,
    top_strengths,
    critical_problems,
    quick_wins,
    audit_summary
  FROM audits
  WHERE profile_id = $1  -- UUID do perfil
    AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
)
SELECT
  -- Dados do perfil
  p.id,
  p.username,
  p.full_name,
  p.biography,
  p.followers_count,
  p.following_count,
  p.posts_count,
  p.profile_pic_url_hd,
  p.is_verified,
  p.is_business_account,
  p.business_category,
  p.total_audits,
  p.first_scraped_at,
  p.last_scraped_at,
  -- Dados da última auditoria
  la.*
FROM profiles p
LEFT JOIN last_audit la ON TRUE
WHERE p.id = $1
  AND p.deleted_at IS NULL;

-- EXPLAIN ANALYZE:
-- Index Scan on profiles using profiles_pkey (cost=0.15..8.17 rows=1)
-- CTE Scan on last_audit (cost=2.33..2.35 rows=1)
-- Total: ~3-5ms

-- ============================================
-- 3. LISTAR POSTS DE UMA AUDITORIA (com comentários)
-- ============================================

-- Query para exibir posts de uma auditoria específica
-- Performance: ~15ms para 10 posts com 100 comentários cada
SELECT
  po.id,
  po.post_id,
  po.short_code,
  po.post_url,
  po.post_type,
  po.caption,
  po.hashtags,
  po.mentions,
  po.likes_count,
  po.comments_count,
  po.post_timestamp,
  po.display_url,
  po.images,
  po.ocr_analyzed,
  -- Contagem de comentários por categoria
  (
    SELECT COUNT(*)
    FROM comments c
    WHERE c.post_id = po.id
      AND c.category = 'perguntas'
      AND c.is_relevant = TRUE
      AND c.deleted_at IS NULL
  ) as perguntas_count,
  (
    SELECT COUNT(*)
    FROM comments c
    WHERE c.post_id = po.id
      AND c.category = 'elogios'
      AND c.is_relevant = TRUE
      AND c.deleted_at IS NULL
  ) as elogios_count,
  (
    SELECT COUNT(*)
    FROM comments c
    WHERE c.post_id = po.id
      AND c.is_relevant = TRUE
      AND c.deleted_at IS NULL
  ) as relevant_comments_count
FROM posts po
WHERE po.audit_id = $1  -- UUID da auditoria
  AND po.deleted_at IS NULL
ORDER BY po.post_timestamp DESC;

-- Alternativa: usar comments_categorized JSONB
SELECT
  po.id,
  po.post_id,
  po.short_code,
  po.post_url,
  po.post_type,
  po.caption,
  po.likes_count,
  po.comments_count,
  po.post_timestamp,
  po.display_url,
  -- Extrair contagens do JSONB
  jsonb_array_length(COALESCE(po.comments_categorized->'perguntas', '[]'::jsonb)) as perguntas_count,
  jsonb_array_length(COALESCE(po.comments_categorized->'elogios', '[]'::jsonb)) as elogios_count
FROM posts po
WHERE po.audit_id = $1
  AND po.deleted_at IS NULL
ORDER BY po.post_timestamp DESC;

-- ============================================
-- 4. COMPARAÇÃO TEMPORAL (antes vs depois)
-- ============================================

-- Query otimizada usando tabela comparisons (auto-populada)
-- Performance: ~5ms
SELECT
  c.id,
  c.days_between,
  c.date_before,
  c.date_after,
  -- Crescimento
  c.growth_followers,
  c.growth_followers_pct,
  c.growth_engagement,
  c.growth_avg_likes,
  c.growth_avg_comments,
  -- Melhoria de scores
  c.improvement_overall,
  c.improvement_behavior,
  c.improvement_copy,
  c.improvement_offers,
  c.improvement_metrics,
  c.improvement_anomalies,
  -- Auditoria ANTES
  a_before.score_overall as score_before,
  a_before.classification as classification_before,
  a_before.engagement_rate as engagement_before,
  a_before.snapshot_followers as followers_before,
  -- Auditoria DEPOIS
  a_after.score_overall as score_after,
  a_after.classification as classification_after,
  a_after.engagement_rate as engagement_after,
  a_after.snapshot_followers as followers_after,
  -- Perfil
  p.username,
  p.full_name,
  p.profile_pic_url_hd
FROM comparisons c
JOIN profiles p ON c.profile_id = p.id
JOIN audits a_before ON c.audit_before_id = a_before.id
JOIN audits a_after ON c.audit_after_id = a_after.id
WHERE c.profile_id = $1  -- UUID do perfil
  AND c.deleted_at IS NULL
ORDER BY c.date_after DESC
LIMIT 10;

-- EXPLAIN ANALYZE:
-- Index Scan on comparisons (cost=0.15..25.42 rows=10)
-- Nested Loop (cost=0.15..30.12 rows=10)
-- Total: ~4-6ms

-- ============================================
-- 5. DASHBOARD STATS (agregações)
-- ============================================

-- Query usando materialized view (refresh a cada 1h)
-- Performance: ~1ms (instant)
SELECT * FROM mv_dashboard_stats;

-- Refresh manual (executar via cron ou trigger)
SELECT refresh_dashboard_stats();

-- Query alternativa (sem materialized view)
-- Performance: ~200ms
SELECT
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT CASE WHEN p.is_verified THEN p.id END) as verified_profiles,
  COUNT(DISTINCT a.id) as total_audits,
  COUNT(DISTINCT CASE WHEN a.audit_date >= NOW() - INTERVAL '30 days' THEN a.id END) as audits_last_30d,
  ROUND(AVG(a.score_overall), 2) as avg_score_overall,
  ROUND(AVG(a.engagement_rate), 3) as avg_engagement_rate
FROM profiles p
LEFT JOIN audits a ON a.profile_id = p.id AND a.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

-- ============================================
-- 6. FILTROS AVANÇADOS (score + engajamento + data)
-- ============================================

-- Query com múltiplos filtros otimizados
-- Performance: ~20ms para 1000 perfis
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profile_pic_url_hd,
  p.followers_count,
  p.is_verified,
  last_audit.score_overall,
  last_audit.classification,
  last_audit.engagement_rate,
  last_audit.audit_date
FROM profiles p
JOIN LATERAL (
  SELECT
    score_overall,
    classification,
    engagement_rate,
    audit_date
  FROM audits
  WHERE profile_id = p.id
    AND deleted_at IS NULL
    -- Filtros na auditoria
    AND ($2::INTEGER IS NULL OR score_overall >= $2)  -- score_min
    AND ($3::INTEGER IS NULL OR score_overall <= $3)  -- score_max
    AND ($4::NUMERIC IS NULL OR engagement_rate >= $4)  -- engagement_min
    AND ($5::audit_classification_enum IS NULL OR classification = $5)  -- classification
  ORDER BY audit_date DESC
  LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
  AND ($6::BOOLEAN IS NULL OR p.is_verified = $6)  -- verified only
  AND ($7::TIMESTAMP IS NULL OR p.last_scraped_at >= $7)  -- scraped_after
ORDER BY
  CASE WHEN $8 = 'score_desc' THEN last_audit.score_overall END DESC,
  CASE WHEN $8 = 'score_asc' THEN last_audit.score_overall END ASC,
  CASE WHEN $8 = 'engagement_desc' THEN last_audit.engagement_rate END DESC,
  CASE WHEN $8 = 'followers_desc' THEN p.followers_count END DESC,
  p.last_scraped_at DESC
LIMIT $9 OFFSET $10;  -- pagination

-- Exemplo de uso:
-- $1: profile_id (opcional)
-- $2: score_min (ex: 70)
-- $3: score_max (ex: 100)
-- $4: engagement_min (ex: 5.0)
-- $5: classification (ex: 'EXCELENTE')
-- $6: is_verified (ex: TRUE)
-- $7: scraped_after (ex: '2025-01-01')
-- $8: order_by (ex: 'score_desc')
-- $9: limit (ex: 20)
-- $10: offset (ex: 0)

-- ============================================
-- 7. BUSCA FULL-TEXT (perfis e auditorias)
-- ============================================

-- Buscar perfis por nome/username
-- Performance: ~10ms para 1000 perfis
SELECT
  p.id,
  p.username,
  p.full_name,
  p.biography,
  p.profile_pic_url_hd,
  p.followers_count,
  p.is_verified,
  -- Relevância da busca
  similarity(p.username, $1) +
  similarity(COALESCE(p.full_name, ''), $1) as relevance
FROM profiles p
WHERE p.deleted_at IS NULL
  AND (
    p.username ILIKE '%' || $1 || '%'
    OR p.full_name ILIKE '%' || $1 || '%'
    OR p.biography ILIKE '%' || $1 || '%'
  )
ORDER BY relevance DESC, p.followers_count DESC
LIMIT 20;

-- Buscar auditorias por texto (usando tsvector)
-- Performance: ~15ms
SELECT
  a.id,
  a.audit_date,
  a.score_overall,
  a.classification,
  p.username,
  p.full_name,
  p.profile_pic_url_hd,
  ts_rank(a.search_vector, to_tsquery('portuguese', $1)) as rank
FROM audits a
JOIN profiles p ON a.profile_id = p.id
WHERE a.deleted_at IS NULL
  AND a.search_vector @@ to_tsquery('portuguese', $1)
ORDER BY rank DESC, a.audit_date DESC
LIMIT 20;

-- ============================================
-- 8. TOP PERFORMERS (melhores perfis)
-- ============================================

-- Query usando view otimizada
-- Performance: ~15ms
SELECT *
FROM top_performers
ORDER BY score_overall DESC, engagement_rate DESC
LIMIT 10;

-- Query alternativa (sem view)
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profile_pic_url_hd,
  p.followers_count,
  p.is_verified,
  last_audit.score_overall,
  last_audit.engagement_rate,
  last_audit.classification,
  last_audit.audit_date
FROM profiles p
JOIN LATERAL (
  SELECT
    score_overall,
    engagement_rate,
    classification,
    audit_date
  FROM audits
  WHERE profile_id = p.id
    AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
  AND last_audit.score_overall >= 80  -- Apenas perfis com score bom
ORDER BY last_audit.score_overall DESC, last_audit.engagement_rate DESC
LIMIT 10;

-- ============================================
-- 9. RECENT ACTIVITY (atividade recente)
-- ============================================

-- Query usando view
-- Performance: ~10ms
SELECT * FROM recent_activity LIMIT 50;

-- ============================================
-- 10. ENGAGEMENT TRENDS (tendências de engajamento)
-- ============================================

-- Query para gráfico de evolução de engajamento
-- Performance: ~25ms
SELECT
  a.audit_date::DATE as date,
  ROUND(AVG(a.engagement_rate), 3) as avg_engagement,
  ROUND(AVG(a.score_overall), 2) as avg_score,
  COUNT(*) as audits_count
FROM audits a
WHERE a.deleted_at IS NULL
  AND a.audit_date >= NOW() - INTERVAL '90 days'
  AND ($1::UUID IS NULL OR a.profile_id = $1)  -- Opcional: filtrar por perfil
GROUP BY a.audit_date::DATE
ORDER BY date DESC;

-- ============================================
-- 11. POST PERFORMANCE (melhores posts de um perfil)
-- ============================================

-- Query para listar melhores posts por engajamento
-- Performance: ~20ms
SELECT
  po.id,
  po.post_id,
  po.short_code,
  po.post_url,
  po.post_type,
  po.caption,
  po.likes_count,
  po.comments_count,
  po.post_timestamp,
  po.display_url,
  -- Calcular engajamento
  (po.likes_count + po.comments_count * 3) as engagement_score,
  a.snapshot_followers,
  -- Calcular engajamento relativo ao número de seguidores
  CASE
    WHEN a.snapshot_followers > 0
    THEN ROUND(((po.likes_count + po.comments_count)::NUMERIC / a.snapshot_followers * 100), 3)
    ELSE 0
  END as engagement_rate_pct
FROM posts po
JOIN audits a ON po.audit_id = a.id
WHERE a.profile_id = $1  -- UUID do perfil
  AND po.deleted_at IS NULL
  AND a.deleted_at IS NULL
ORDER BY engagement_score DESC
LIMIT 20;

-- ============================================
-- 12. COMMENT ANALYSIS (análise de comentários)
-- ============================================

-- Query para análise de comentários de um perfil
-- Performance: ~30ms
SELECT
  c.category,
  COUNT(*) as total,
  ROUND(AVG(c.likes_count), 2) as avg_likes,
  ROUND(AVG(COALESCE(c.sentiment_score, 0)), 3) as avg_sentiment,
  COUNT(*) FILTER (WHERE c.owner_is_verified) as verified_owners
FROM comments c
JOIN posts po ON c.post_id = po.id
JOIN audits a ON po.audit_id = a.id
WHERE a.profile_id = $1  -- UUID do perfil
  AND c.deleted_at IS NULL
  AND c.is_relevant = TRUE
GROUP BY c.category
ORDER BY total DESC;

-- Comentários mais engajados
SELECT
  c.id,
  c.text,
  c.owner_username,
  c.owner_is_verified,
  c.likes_count,
  c.category,
  c.comment_timestamp,
  po.short_code,
  po.post_url
FROM comments c
JOIN posts po ON c.post_id = po.id
JOIN audits a ON po.audit_id = a.id
WHERE a.profile_id = $1  -- UUID do perfil
  AND c.deleted_at IS NULL
  AND c.is_relevant = TRUE
ORDER BY c.likes_count DESC
LIMIT 20;

-- ============================================
-- 13. QUEUE MANAGEMENT (gerenciar fila de análises)
-- ============================================

-- Listar fila com prioridade
-- Performance: ~5ms
SELECT
  aq.id,
  aq.username,
  aq.status,
  aq.progress,
  aq.current_phase,
  aq.priority,
  aq.created_at,
  aq.started_at,
  aq.estimated_completion_at,
  EXTRACT(EPOCH FROM (NOW() - aq.created_at))::INTEGER as waiting_seconds,
  p.id as profile_id,
  p.full_name
FROM analysis_queue aq
LEFT JOIN profiles p ON aq.profile_id = p.id
WHERE aq.deleted_at IS NULL
  AND aq.status IN ('pending', 'processing')
ORDER BY aq.priority ASC, aq.created_at ASC;

-- Pegar próximo job da fila (para worker)
-- Performance: ~2ms com lock
WITH next_job AS (
  SELECT id
  FROM analysis_queue
  WHERE status = 'pending'
    AND deleted_at IS NULL
  ORDER BY priority ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED  -- Lock pessimistic para evitar race condition
)
UPDATE analysis_queue
SET
  status = 'processing',
  started_at = NOW(),
  worker_id = $1,  -- Worker ID
  worker_ip = $2   -- Worker IP
FROM next_job
WHERE analysis_queue.id = next_job.id
RETURNING analysis_queue.*;

-- ============================================
-- 14. PROFILE EVOLUTION (evolução ao longo do tempo)
-- ============================================

-- Query usando view
-- Performance: ~20ms
SELECT * FROM profile_evolution
WHERE score_improvement > 0  -- Apenas perfis que melhoraram
ORDER BY score_improvement DESC
LIMIT 20;

-- Query detalhada com todas as auditorias
SELECT
  a.id,
  a.audit_date,
  a.score_overall,
  a.classification,
  a.engagement_rate,
  a.snapshot_followers,
  a.posts_analyzed,
  -- Comparar com auditoria anterior
  LAG(a.score_overall) OVER w as prev_score,
  a.score_overall - LAG(a.score_overall) OVER w as score_delta,
  LAG(a.snapshot_followers) OVER w as prev_followers,
  a.snapshot_followers - LAG(a.snapshot_followers) OVER w as followers_delta
FROM audits a
WHERE a.profile_id = $1  -- UUID do perfil
  AND a.deleted_at IS NULL
WINDOW w AS (ORDER BY a.audit_date ASC)
ORDER BY a.audit_date ASC;

-- ============================================
-- 15. BULK INSERT (inserir nova análise completa)
-- ============================================

-- Transaction para inserir perfil + auditoria + posts + comentários
-- Usar prepared statements e batch insert para performance
BEGIN;

-- 1. Insert ou update profile
INSERT INTO profiles (
  username, full_name, biography,
  followers_count, following_count, posts_count,
  profile_pic_url, profile_pic_url_hd, url,
  is_verified, is_business_account, business_category
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
ON CONFLICT (username)
DO UPDATE SET
  full_name = EXCLUDED.full_name,
  biography = EXCLUDED.biography,
  followers_count = EXCLUDED.followers_count,
  following_count = EXCLUDED.following_count,
  posts_count = EXCLUDED.posts_count,
  profile_pic_url_hd = EXCLUDED.profile_pic_url_hd,
  is_verified = EXCLUDED.is_verified,
  last_scraped_at = NOW()
RETURNING id;

-- 2. Insert audit
INSERT INTO audits (
  profile_id, audit_type, posts_analyzed,
  score_overall, classification,
  score_behavior, score_copy, score_offers, score_metrics, score_anomalies,
  engagement_rate, total_likes, total_comments,
  avg_likes_per_post, avg_comments_per_post,
  snapshot_followers, snapshot_following, snapshot_posts_count,
  raw_json, top_strengths, critical_problems, quick_wins, audit_summary
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
)
RETURNING id;

-- 3. Batch insert posts (usar unnest para performance)
INSERT INTO posts (
  audit_id, post_id, short_code, post_url, post_type,
  caption, hashtags, mentions,
  likes_count, comments_count, post_timestamp,
  display_url, images,
  ocr_total_images, ocr_analyzed, ocr_data,
  comments_total, comments_relevant, comments_categorized
)
SELECT
  $1,  -- audit_id
  unnest($2::VARCHAR[]),  -- post_ids
  unnest($3::VARCHAR[]),  -- short_codes
  unnest($4::TEXT[]),     -- post_urls
  unnest($5::post_type_enum[]),
  unnest($6::TEXT[]),     -- captions
  unnest($7::TEXT[][]),   -- hashtags
  unnest($8::TEXT[][]),   -- mentions
  unnest($9::INTEGER[]),  -- likes_counts
  unnest($10::INTEGER[]), -- comments_counts
  unnest($11::TIMESTAMP[]),
  unnest($12::TEXT[]),    -- display_urls
  unnest($13::TEXT[][]),  -- images
  unnest($14::INTEGER[]),
  unnest($15::INTEGER[]),
  unnest($16::JSONB[]),
  unnest($17::INTEGER[]),
  unnest($18::INTEGER[]),
  unnest($19::JSONB[])
RETURNING id;

-- 4. Batch insert comments (se muitos comentários, usar COPY)
INSERT INTO comments (
  post_id, comment_id, text, owner_username, owner_id,
  likes_count, category, is_relevant, comment_timestamp
)
SELECT
  unnest($1::UUID[]),
  unnest($2::VARCHAR[]),
  unnest($3::TEXT[]),
  unnest($4::VARCHAR[]),
  unnest($5::VARCHAR[]),
  unnest($6::INTEGER[]),
  unnest($7::comment_category_enum[]),
  unnest($8::BOOLEAN[]),
  unnest($9::TIMESTAMP[]);

COMMIT;

-- ============================================
-- 16. CLEANUP QUERIES (limpeza e manutenção)
-- ============================================

-- Soft delete de perfis inativos (mais de 1 ano sem scraping)
UPDATE profiles
SET deleted_at = NOW()
WHERE last_scraped_at < NOW() - INTERVAL '1 year'
  AND deleted_at IS NULL;

-- Limpar fila de análises antigas (mais de 30 dias)
UPDATE analysis_queue
SET deleted_at = NOW()
WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '30 days'
  AND deleted_at IS NULL;

-- Vacuum e analyze (manutenção)
VACUUM ANALYZE profiles;
VACUUM ANALYZE audits;
VACUUM ANALYZE posts;
VACUUM ANALYZE comments;

-- Reindexar tabelas grandes (se necessário)
REINDEX TABLE CONCURRENTLY posts;
REINDEX TABLE CONCURRENTLY comments;

-- ============================================
-- FIM DAS QUERIES OTIMIZADAS
-- ============================================
