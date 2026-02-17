-- ============================================
-- SEED 001: Perfil de Exemplo (rodrigogunter_)
-- Descrição: Inserir perfil de exemplo com auditoria
-- Data: 2026-02-16
-- ============================================

-- IMPORTANTE: Este seed serve apenas para demonstração
-- Use dados reais via API/backend para produção

-- ============================================
-- 1. INSERT PROFILE
-- ============================================

DO $$
DECLARE
  profile_uuid UUID;
  audit_uuid UUID;
BEGIN
  -- Insert profile (ou update se já existe)
  INSERT INTO profiles (
    username,
    full_name,
    biography,
    followers_count,
    following_count,
    posts_count,
    profile_pic_url_hd,
    url,
    is_verified,
    is_business_account
  ) VALUES (
    'rodrigogunter_',
    'Rodrigo Gunter',
    'Ex-militar•Empresário•Mentor de negócios
@goldmix.lentes @next.laboratorio
📈Ajudo empresários a expandirem seus negócios.
✍️Escrita, treinos e trips.',
    56327,
    1124,
    1243,
    'https://instagram.fsac1-2.fna.fbcdn.net/v/t51.2885-19/561538234_18538487116019127_6286969918983636116_n.jpg',
    'https://www.instagram.com/rodrigogunter_',
    FALSE,
    FALSE
  )
  ON CONFLICT (username)
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    biography = EXCLUDED.biography,
    followers_count = EXCLUDED.followers_count,
    following_count = EXCLUDED.following_count,
    posts_count = EXCLUDED.posts_count,
    last_scraped_at = NOW()
  RETURNING id INTO profile_uuid;

  RAISE NOTICE 'Profile inserted/updated: % (UUID: %)', 'rodrigogunter_', profile_uuid;

  -- ============================================
  -- 2. INSERT AUDIT (exemplo)
  -- ============================================

  INSERT INTO audits (
    profile_id,
    audit_type,
    posts_analyzed,
    score_overall,
    classification,
    score_behavior,
    score_copy,
    score_offers,
    score_metrics,
    score_anomalies,
    engagement_rate,
    total_likes,
    total_comments,
    avg_likes_per_post,
    avg_comments_per_post,
    snapshot_followers,
    snapshot_following,
    snapshot_posts_count,
    audit_summary,
    top_strengths,
    critical_problems,
    quick_wins
  ) VALUES (
    profile_uuid,
    'express',
    10,
    75,
    'BOM',
    80,
    70,
    75,
    85,
    65,
    174.32,
    249530,
    45038,
    24953,
    4504,
    56327,
    1124,
    1243,
    'Perfil com alto engajamento, mas precisa melhorar copy e anomalias.',
    '[
      "Alto engajamento (174%)",
      "Seguidores engajados",
      "Conteúdo consistente"
    ]'::jsonb,
    '[
      "Copy não otimizada",
      "Pouca clareza nas ofertas",
      "Anomalias em alguns posts"
    ]'::jsonb,
    '[
      "Adicionar CTA claro nas legendas",
      "Criar carrossel educacional",
      "Testar diferentes ganchos"
    ]'::jsonb
  ) RETURNING id INTO audit_uuid;

  RAISE NOTICE 'Audit inserted: UUID %', audit_uuid;

  -- ============================================
  -- 3. INSERT POSTS (exemplo simplificado)
  -- ============================================

  INSERT INTO posts (
    audit_id,
    post_id,
    short_code,
    post_url,
    post_type,
    caption,
    likes_count,
    comments_count,
    post_timestamp,
    display_url
  ) VALUES
  (
    audit_uuid,
    '3702608718680621292',
    'DNiTwMrOQDs',
    'https://www.instagram.com/p/DNiTwMrOQDs/',
    'Sidecar',
    'A notícia que mudou minha vida. 🙌🏼

Agradeço ao dr. @rodrigovclima , por ser uma pessoa incrível e um médico muito competente.',
    4658,
    86,
    '2025-08-19T12:09:36.000Z',
    'https://instagram.fsac1-2.fna.fbcdn.net/v/t51.2885-15/535436289_18526841902019127_4375002701198958884_n.jpg'
  ),
  (
    audit_uuid,
    '3702608718680621293',
    'DNiTwMrOQDt',
    'https://www.instagram.com/p/DNiTwMrOQDt/',
    'Image',
    'Quando você finalmente entende como funciona o marketing digital.',
    5234,
    102,
    '2025-08-18T10:30:00.000Z',
    'https://example.com/image2.jpg'
  );

  RAISE NOTICE 'Posts inserted: 2';

  -- ============================================
  -- 4. INSERT COMMENTS (exemplo)
  -- ============================================

  INSERT INTO comments (
    post_id,
    comment_id,
    text,
    owner_username,
    category,
    is_relevant,
    comment_timestamp
  )
  SELECT
    p.id,
    'comment_' || p.post_id || '_1',
    'Parabéns! Que notícia incrível!',
    'usuario_exemplo',
    'elogios',
    TRUE,
    NOW() - INTERVAL '1 day'
  FROM posts p
  WHERE p.audit_id = audit_uuid
  LIMIT 1;

  RAISE NOTICE 'Comments inserted: 1';

  -- ============================================
  -- SUMMARY
  -- ============================================

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Seed 001 aplicado com sucesso!';
  RAISE NOTICE 'Profile: rodrigogunter_';
  RAISE NOTICE 'Audit score: 75 (BOM)';
  RAISE NOTICE 'Posts: 2';
  RAISE NOTICE 'Comments: 1';
  RAISE NOTICE '========================================';

END $$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Contar registros inseridos
SELECT
  (SELECT COUNT(*) FROM profiles WHERE username = 'rodrigogunter_') as profiles_count,
  (SELECT COUNT(*) FROM audits WHERE profile_id = (SELECT id FROM profiles WHERE username = 'rodrigogunter_')) as audits_count,
  (SELECT COUNT(*) FROM posts WHERE audit_id IN (SELECT id FROM audits WHERE profile_id = (SELECT id FROM profiles WHERE username = 'rodrigogunter_'))) as posts_count,
  (SELECT COUNT(*) FROM comments) as comments_count;

-- ============================================
-- FIM DO SEED 001
-- ============================================
