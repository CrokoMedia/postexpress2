-- ============================================
-- TESTE RÁPIDO: Sistema de Vinculação
-- ============================================
-- Use este script no SQL Editor do Supabase para testar

-- 1. Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'content_profile_links'
) as tabela_existe;

-- 2. Contar vínculos existentes
SELECT
  COUNT(*) as total_vinculos,
  COUNT(*) FILTER (WHERE link_type = 'original') as originais,
  COUNT(*) FILTER (WHERE link_type = 'shared') as compartilhados
FROM content_profile_links
WHERE deleted_at IS NULL;

-- 3. Ver últimos 5 vínculos criados
SELECT
  cpl.id,
  cpl.link_type,
  p.username as perfil,
  LEFT(cs.id::TEXT, 8) as content_id_short,
  cpl.linked_at
FROM content_profile_links cpl
JOIN profiles p ON cpl.profile_id = p.id
JOIN content_suggestions cs ON cpl.content_id = cs.id
WHERE cpl.deleted_at IS NULL
ORDER BY cpl.linked_at DESC
LIMIT 5;

-- 4. Ver estatísticas por perfil
SELECT
  p.username,
  COUNT(*) as total_conteudos,
  COUNT(*) FILTER (WHERE cpl.link_type = 'original') as criados,
  COUNT(*) FILTER (WHERE cpl.link_type = 'shared') as recebidos
FROM profiles p
LEFT JOIN content_profile_links cpl ON p.id = cpl.profile_id AND cpl.deleted_at IS NULL
GROUP BY p.id, p.username
HAVING COUNT(*) > 0
ORDER BY total_conteudos DESC;

-- 5. Ver conteúdos mais compartilhados
SELECT
  cs.id,
  COUNT(DISTINCT cpl.profile_id) as total_perfis_vinculados,
  array_agg(DISTINCT p.username) as perfis
FROM content_suggestions cs
JOIN content_profile_links cpl ON cs.id = cpl.content_id AND cpl.deleted_at IS NULL
JOIN profiles p ON cpl.profile_id = p.id
GROUP BY cs.id
HAVING COUNT(DISTINCT cpl.profile_id) > 1
ORDER BY total_perfis_vinculados DESC;

-- ============================================
-- TESTE PRÁTICO: Vincular e Desvincular
-- ============================================

-- IMPORTANTE: Substitua os UUIDs pelos reais do seu banco!

-- 6. Pegar IDs para teste
SELECT
  'Content ID: ' || cs.id::TEXT as info,
  'Profile ID: ' || p.id::TEXT as profile_info
FROM content_suggestions cs
CROSS JOIN profiles p
WHERE cs.profile_id != p.id -- Pegar perfil diferente do criador
LIMIT 1;

-- 7. EXEMPLO: Vincular conteúdo (descomente e ajuste os UUIDs)
/*
SELECT link_content_to_profile(
  'COLE-UUID-DO-CONTEUDO'::UUID,
  'COLE-UUID-DO-PERFIL'::UUID,
  'shared',
  'Teste de vinculação via SQL'
);
*/

-- 8. EXEMPLO: Desvincular conteúdo (descomente e ajuste os UUIDs)
/*
SELECT unlink_content_from_profile(
  'COLE-UUID-DO-CONTEUDO'::UUID,
  'COLE-UUID-DO-PERFIL'::UUID
);
*/

-- 9. Ver usando a VIEW consolidada
SELECT
  content_id,
  original_username,
  total_linked_profiles,
  linked_profiles
FROM content_with_profiles
WHERE total_linked_profiles > 0
LIMIT 5;

-- ============================================
-- CLEANUP (opcional - use com cuidado!)
-- ============================================

-- Remover TODOS os vínculos compartilhados (manter apenas originais)
-- ATENÇÃO: Isto é destrutivo! Só use se quiser resetar tudo.
/*
UPDATE content_profile_links
SET deleted_at = NOW()
WHERE link_type = 'shared' AND deleted_at IS NULL;
*/
