-- ============================================
-- FIX: Criar links faltando em content_profile_links
-- Execute no SQL Editor do Supabase
-- ============================================
-- Cria entradas 'original' para todo content_suggestion
-- que ainda não tem um link na tabela content_profile_links

INSERT INTO content_profile_links (content_id, profile_id, link_type, linked_at)
SELECT
  cs.id          AS content_id,
  cs.profile_id,
  'original'     AS link_type,
  cs.generated_at AS linked_at
FROM content_suggestions cs
WHERE NOT EXISTS (
  SELECT 1
  FROM content_profile_links cpl
  WHERE cpl.content_id = cs.id
    AND cpl.profile_id = cs.profile_id
)
ON CONFLICT (content_id, profile_id) DO NOTHING;

-- Verificar resultado
SELECT
  COUNT(*) AS total_content_suggestions,
  (SELECT COUNT(*) FROM content_profile_links WHERE deleted_at IS NULL) AS total_links
FROM content_suggestions;
