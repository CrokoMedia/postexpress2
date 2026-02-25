-- ============================================
-- TESTES DE MULTI-TENANCY
-- ============================================
--
-- Execute estes testes no SQL Editor do Supabase
-- para validar que RLS está funcionando corretamente
--
-- ============================================

-- ============================================
-- SETUP: Criar dados de teste
-- ============================================

-- 1. Criar usuários de teste (via Supabase Auth)
-- NOTA: Execute via API ou dashboard admin, não via SQL direto
-- POST /api/admin/users
-- {
--   "email": "admin@test.com",
--   "password": "test123",
--   "role": "admin"
-- }
-- {
--   "email": "client1@test.com",
--   "password": "test123",
--   "role": "client",
--   "profile_ids": ["uuid-profile-1"]
-- }
-- {
--   "email": "client2@test.com",
--   "password": "test123",
--   "role": "client",
--   "profile_ids": ["uuid-profile-2"]
-- }

-- ============================================
-- TESTE 1: Verificar estrutura de tabelas
-- ============================================

-- Verificar se user_id existe em profiles
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name = 'user_id'
) AS profiles_has_user_id;

-- Verificar se user_id existe em instagram_profiles
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'instagram_profiles'
  AND column_name = 'user_id'
) AS instagram_profiles_has_user_id;

-- Verificar se user_roles existe
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_name = 'user_roles'
) AS user_roles_exists;

-- Verificar se user_profiles existe
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_name = 'user_profiles'
) AS user_profiles_exists;

-- ============================================
-- TESTE 2: Verificar RLS habilitado
-- ============================================

SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'instagram_profiles',
  'audits',
  'posts',
  'comments',
  'comparisons',
  'analysis_queue'
)
ORDER BY tablename;

-- Resultado esperado: rowsecurity = true para todas

-- ============================================
-- TESTE 3: Verificar policies criadas
-- ============================================

SELECT
  tablename,
  policyname,
  cmd,
  qual AS policy_definition
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'profiles',
  'instagram_profiles',
  'audits',
  'posts',
  'comments'
)
ORDER BY tablename, policyname;

-- Resultado esperado:
-- - 2 policies por tabela (admin + client)
-- - Policy de admin usa user_roles.role = 'admin'
-- - Policy de client usa user_profiles join

-- ============================================
-- TESTE 4: Verificar indexes de performance
-- ============================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND (
  indexname LIKE '%user_id%'
  OR indexname LIKE '%user_profiles%'
)
ORDER BY tablename, indexname;

-- Resultado esperado:
-- - idx_profiles_user_id
-- - idx_instagram_profiles_user_id
-- - PRIMARY KEY em user_profiles (user_id, profile_id)

-- ============================================
-- TESTE 5: Verificar dados de roles
-- ============================================

-- Contar usuários por role
SELECT
  role,
  COUNT(*) AS total_users
FROM user_roles
GROUP BY role
ORDER BY role;

-- Resultado esperado:
-- role    | total_users
-- --------+-------------
-- admin   | 1+
-- client  | 2+

-- ============================================
-- TESTE 6: Verificar vínculos user ↔ profiles
-- ============================================

-- Listar vínculos com detalhes
SELECT
  ur.role,
  up.user_id,
  up.profile_id,
  ip.username,
  ip.full_name
FROM user_profiles up
JOIN user_roles ur ON ur.user_id = up.user_id
JOIN instagram_profiles ip ON ip.id = up.profile_id
ORDER BY ur.role, up.user_id;

-- Resultado esperado:
-- - Clientes têm perfis vinculados
-- - Cada cliente vê apenas seus perfis (validar manualmente via API)

-- ============================================
-- TESTE 7: Verificar acesso via service_role
-- ============================================

-- Como service_role (bypass RLS), deve ver tudo
SELECT
  COUNT(*) AS total_profiles
FROM instagram_profiles
WHERE deleted_at IS NULL;

-- Como service_role, ver todos os perfis
SELECT
  id,
  username,
  full_name,
  followers_count
FROM instagram_profiles
WHERE deleted_at IS NULL
ORDER BY last_scraped_at DESC
LIMIT 5;

-- ============================================
-- TESTE 8: Simular acesso de cliente
-- ============================================

-- IMPORTANTE: Este teste só funciona com auth.uid()
-- que requer autenticação real via Supabase Auth
--
-- Para testar via API:
-- 1. Fazer login como client1@test.com
-- 2. GET /api/profiles
-- 3. Verificar que só retorna perfis vinculados

-- Query que seria executada pelo cliente (via anon key + auth):
-- SELECT * FROM instagram_profiles WHERE deleted_at IS NULL;
-- RLS aplica automaticamente:
-- AND EXISTS (
--   SELECT 1 FROM user_profiles
--   WHERE user_profiles.profile_id = instagram_profiles.id
--   AND user_profiles.user_id = auth.uid()
-- )

-- ============================================
-- TESTE 9: Verificar cascade deletes
-- ============================================

-- Verificar FKs com ON DELETE CASCADE
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  confdeltype AS delete_action
FROM pg_constraint
WHERE contype = 'f'
AND (
  confrelid::regclass::text = 'user_roles'
  OR confrelid::regclass::text = 'user_profiles'
  OR confrelid::regclass::text = 'instagram_profiles'
)
ORDER BY table_name;

-- Resultado esperado:
-- - user_roles.user_id → auth.users (CASCADE)
-- - user_profiles.user_id → auth.users (CASCADE)
-- - user_profiles.profile_id → instagram_profiles (CASCADE)

-- ============================================
-- TESTE 10: Verificar função auxiliar
-- ============================================

-- Verificar se função user_has_profile_access existe
SELECT EXISTS (
  SELECT 1
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
  AND p.proname = 'user_has_profile_access'
) AS function_exists;

-- Resultado esperado: true

-- ============================================
-- TESTE 11: Performance de queries com RLS
-- ============================================

-- Explicar query de cliente (deve mostrar uso de indexes)
EXPLAIN ANALYZE
SELECT ip.*
FROM instagram_profiles ip
WHERE ip.deleted_at IS NULL
AND EXISTS (
  SELECT 1 FROM user_profiles up
  WHERE up.profile_id = ip.id
  AND up.user_id = '00000000-0000-0000-0000-000000000001' -- UUID fictício
);

-- Resultado esperado:
-- - Usa index em user_profiles(user_id, profile_id)
-- - Usa index em instagram_profiles(deleted_at)
-- - Execution time < 10ms (para poucos perfis)

-- ============================================
-- TESTE 12: Verificar auditorias vinculadas
-- ============================================

-- Contar auditorias por perfil (todas visíveis como service_role)
SELECT
  ip.username,
  COUNT(a.id) AS total_audits,
  MAX(a.audit_date) AS last_audit
FROM instagram_profiles ip
LEFT JOIN audits a ON a.profile_id = ip.id AND a.deleted_at IS NULL
WHERE ip.deleted_at IS NULL
GROUP BY ip.id, ip.username
ORDER BY total_audits DESC
LIMIT 10;

-- ============================================
-- TESTE 13: Verificar posts vinculados
-- ============================================

-- Contar posts por auditoria (todas visíveis como service_role)
SELECT
  ip.username,
  a.audit_date,
  COUNT(p.id) AS total_posts
FROM instagram_profiles ip
JOIN audits a ON a.profile_id = ip.id AND a.deleted_at IS NULL
LEFT JOIN posts p ON p.audit_id = a.id AND p.deleted_at IS NULL
WHERE ip.deleted_at IS NULL
GROUP BY ip.id, ip.username, a.id, a.audit_date
ORDER BY a.audit_date DESC
LIMIT 10;

-- ============================================
-- TESTE 14: Verificar comentários vinculados
-- ============================================

-- Contar comentários por post (todas visíveis como service_role)
SELECT
  ip.username,
  p.post_url,
  COUNT(c.id) AS total_comments
FROM instagram_profiles ip
JOIN audits a ON a.profile_id = ip.id AND a.deleted_at IS NULL
JOIN posts p ON p.audit_id = a.id AND p.deleted_at IS NULL
LEFT JOIN comments c ON c.post_id = p.id AND c.deleted_at IS NULL
WHERE ip.deleted_at IS NULL
GROUP BY ip.id, ip.username, p.id, p.post_url
ORDER BY total_comments DESC
LIMIT 10;

-- ============================================
-- TESTE 15: Limpar dados de teste (OPCIONAL)
-- ============================================

-- CUIDADO: Isso remove todos os usuários de teste!
-- DELETE FROM auth.users WHERE email LIKE '%@test.com';
-- Cascade vai deletar user_roles e user_profiles automaticamente

-- ============================================
-- CHECKLIST FINAL
-- ============================================

-- ✅ user_id existe em profiles e instagram_profiles
-- ✅ RLS habilitado em todas as tabelas relevantes
-- ✅ Policies criadas (admin + client)
-- ✅ Indexes de performance criados
-- ✅ Usuários criados (admin + clientes)
-- ✅ Vínculos user ↔ profiles funcionando
-- ✅ Cascade deletes configurados
-- ✅ Função auxiliar user_has_profile_access existe
-- ✅ Queries performáticas (< 10ms)
-- ✅ Testes manuais via API (login + GET /api/profiles)

-- ============================================
-- FIM DOS TESTES
-- ============================================

-- Para testes completos, use:
-- 1. SQL Editor (testes de estrutura)
-- 2. API/Postman (testes de autenticação e RLS)
-- 3. Browser (testes de UI e isolamento)

-- Documentação completa:
-- /database/MULTI-TENANCY-GUIDE.md
