-- ============================================
-- FIX: Relacionamento user_profiles → instagram_profiles
-- ============================================
--
-- PROBLEMA:
--   user_profiles.profile_id aponta para profiles(id)
--   Mas o código usa instagram_profiles
--   PostgREST não encontra o relacionamento no cache
--
-- SOLUÇÃO:
--   1. Corrigir FK para apontar para instagram_profiles
--   2. Criar VIEW para facilitar JOINs (padrão do projeto)
-- ============================================

-- Passo 1: Verificar se há dados que precisam ser preservados
-- (Se user_profiles já tem vínculos com profiles, precisamos migrar)

-- Passo 2: Dropar constraint antiga (se existir)
DO $$
BEGIN
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_profile_id_fkey;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Passo 3: Adicionar FK correta para instagram_profiles
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES instagram_profiles(id)
  ON DELETE CASCADE;

-- Passo 4: Criar VIEW consolidada (padrão do projeto)
-- Isso facilita queries e contorna cache do PostgREST
DROP VIEW IF EXISTS user_profiles_with_instagram CASCADE;

CREATE VIEW user_profiles_with_instagram AS
SELECT
  up.user_id,
  up.profile_id,
  up.created_at AS linked_at,

  -- Dados do perfil do Instagram
  ip.id,
  ip.username,
  ip.full_name,
  ip.biography,
  ip.external_url,
  ip.followers_count,
  ip.following_count,
  ip.posts_count,
  ip.profile_pic_url,
  ip.profile_pic_url_hd,
  ip.profile_pic_cloudinary_url,
  ip.is_verified,
  ip.is_private,
  ip.is_business_account,
  ip.business_category,
  ip.total_audits,
  ip.last_scraped_at
FROM user_profiles up
LEFT JOIN instagram_profiles ip ON up.profile_id = ip.id
WHERE ip.deleted_at IS NULL;

-- Comentários
COMMENT ON VIEW user_profiles_with_instagram IS 'View consolidada de user_profiles + instagram_profiles. Contorna cache do PostgREST que não detecta FK automaticamente. Usar .from(user_profiles_with_instagram).select(*) em vez de JOIN manual.';

-- Passo 5: Recarregar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Rode estas queries após executar a migration:

-- 1. Verificar FK
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- WHERE tc.table_name='user_profiles'
--   AND tc.constraint_type = 'FOREIGN KEY';

-- 2. Verificar VIEW
-- SELECT * FROM user_profiles_with_instagram LIMIT 5;

-- 3. Testar query com PostgREST (via Supabase client)
-- .from('user_profiles_with_instagram')
-- .select('*')
-- .eq('user_id', 'USER_ID_HERE')
