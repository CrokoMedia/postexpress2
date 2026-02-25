-- ============================================
-- MULTI-TENANCY: Vincular perfis a usuários
-- ============================================
--
-- OBJETIVO:
--   Implementar RLS (Row Level Security) completo para que cada usuário
--   veja apenas seus próprios perfis e auditorias
--
-- CONTEXTO:
--   - Tabela user_roles já existe (role: admin | client)
--   - Tabela user_profiles já existe (many-to-many: user ↔ instagram_profiles)
--   - Tabela instagram_profiles pode ter user_id (opcional, para primeiro perfil)
--   - Tabela profiles original precisa de user_id (para compatibilidade)
--
-- ============================================

-- ============================================
-- 1. ADICIONAR user_id NA TABELA profiles (se não existir)
-- ============================================

-- Adicionar coluna user_id na tabela profiles (referencia auth.users)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Comentário
COMMENT ON COLUMN profiles.user_id IS 'User owner (opcional, para vincular perfil a um único usuário)';

-- ============================================
-- 2. VERIFICAR user_id NA TABELA instagram_profiles
-- ============================================

-- Garantir que instagram_profiles tenha user_id (normalmente já existe)
ALTER TABLE instagram_profiles
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_instagram_profiles_user_id ON instagram_profiles(user_id);

-- Comentário
COMMENT ON COLUMN instagram_profiles.user_id IS 'User owner (opcional, para perfis vinculados diretamente)';

-- ============================================
-- 3. RLS POLICIES - instagram_profiles
-- ============================================

-- Dropar policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can read own profiles" ON instagram_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON instagram_profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON instagram_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON instagram_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON instagram_profiles;
DROP POLICY IF EXISTS "Public read access" ON instagram_profiles;

-- Habilitar RLS
ALTER TABLE instagram_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all profiles" ON instagram_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem apenas perfis vinculados na tabela user_profiles
CREATE POLICY "Clients can read linked profiles" ON instagram_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.profile_id = instagram_profiles.id
      AND user_profiles.user_id = auth.uid()
    )
  );

-- Policy 3: Service role pode fazer tudo (backend)
-- (sem policy = apenas service_role pode INSERT/UPDATE/DELETE)

-- ============================================
-- 4. RLS POLICIES - profiles (tabela legada)
-- ============================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can read own profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Public read access" ON profiles;

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem apenas seus próprios perfis (user_id match)
CREATE POLICY "Clients can read own profiles" ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- 5. RLS POLICIES - audits
-- ============================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can read own audits" ON audits;
DROP POLICY IF EXISTS "Admins can read all audits" ON audits;
DROP POLICY IF EXISTS "Public read access" ON audits;

-- Habilitar RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all audits" ON audits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem auditorias de perfis vinculados
CREATE POLICY "Clients can read linked audits" ON audits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      JOIN instagram_profiles ON instagram_profiles.id = user_profiles.profile_id
      WHERE user_profiles.user_id = auth.uid()
      AND instagram_profiles.id = audits.profile_id
    )
  );

-- ============================================
-- 6. RLS POLICIES - posts
-- ============================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can read own posts" ON posts;
DROP POLICY IF EXISTS "Admins can read all posts" ON posts;
DROP POLICY IF EXISTS "Public read access" ON posts;

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all posts" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem posts de auditorias vinculadas
CREATE POLICY "Clients can read linked posts" ON posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN instagram_profiles ON instagram_profiles.id = audits.profile_id
      JOIN user_profiles ON user_profiles.profile_id = instagram_profiles.id
      WHERE user_profiles.user_id = auth.uid()
      AND audits.id = posts.audit_id
    )
  );

-- ============================================
-- 7. RLS POLICIES - comments
-- ============================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can read own comments" ON comments;
DROP POLICY IF EXISTS "Admins can read all comments" ON comments;
DROP POLICY IF EXISTS "Public read access" ON comments;

-- Habilitar RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all comments" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem comentários de posts vinculados
CREATE POLICY "Clients can read linked comments" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN audits ON audits.id = posts.audit_id
      JOIN instagram_profiles ON instagram_profiles.id = audits.profile_id
      JOIN user_profiles ON user_profiles.profile_id = instagram_profiles.id
      WHERE user_profiles.user_id = auth.uid()
      AND posts.id = comments.post_id
    )
  );

-- ============================================
-- 8. RLS POLICIES - comparisons
-- ============================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can read own comparisons" ON comparisons;
DROP POLICY IF EXISTS "Admins can read all comparisons" ON comparisons;
DROP POLICY IF EXISTS "Public read access" ON comparisons;

-- Habilitar RLS
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all comparisons" ON comparisons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem comparações de perfis vinculados
CREATE POLICY "Clients can read linked comparisons" ON comparisons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      JOIN instagram_profiles ON instagram_profiles.id = user_profiles.profile_id
      WHERE user_profiles.user_id = auth.uid()
      AND instagram_profiles.id = comparisons.profile_id
    )
  );

-- ============================================
-- 9. RLS POLICIES - analysis_queue
-- ============================================

-- Dropar policies antigas
DROP POLICY IF EXISTS "Users can read own queue" ON analysis_queue;
DROP POLICY IF EXISTS "Admins can read all queue" ON analysis_queue;
DROP POLICY IF EXISTS "Public read access" ON analysis_queue;

-- Habilitar RLS
ALTER TABLE analysis_queue ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins veem tudo
CREATE POLICY "Admins can read all queue" ON analysis_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Policy 2: Clientes veem apenas suas próprias análises (se profile_id existir)
CREATE POLICY "Clients can read own queue" ON analysis_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.profile_id = analysis_queue.profile_id
    )
  );

-- ============================================
-- 10. VIEWS - Atualizar para considerar RLS
-- ============================================

-- Recriar view latest_audits (já considera RLS automaticamente)
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
JOIN instagram_profiles p ON a.profile_id = p.id
WHERE a.deleted_at IS NULL AND p.deleted_at IS NULL
ORDER BY a.audit_date DESC;

COMMENT ON VIEW latest_audits IS 'Latest audits (RLS policies apply automatically)';

-- ============================================
-- 11. FUNÇÃO AUXILIAR - Verificar se usuário tem acesso a perfil
-- ============================================

CREATE OR REPLACE FUNCTION user_has_profile_access(profile_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Admin tem acesso a tudo
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Cliente precisa ter perfil vinculado
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND profile_id = profile_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_has_profile_access IS 'Check if current user has access to a profile';

-- ============================================
-- 12. COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON TABLE user_roles IS 'User roles (admin | client) - managed by admin API';
COMMENT ON TABLE user_profiles IS 'Many-to-many: users ↔ instagram_profiles';
COMMENT ON COLUMN instagram_profiles.user_id IS 'Optional direct link to user (first profile)';
COMMENT ON COLUMN profiles.user_id IS 'Optional direct link to user (legacy table)';

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

-- TESTES RECOMENDADOS:
-- 1. Criar usuário admin e cliente via /api/admin/users
-- 2. Vincular perfis ao cliente
-- 3. Fazer login como cliente e verificar que vê apenas seus perfis
-- 4. Fazer login como admin e verificar que vê tudo
-- 5. Tentar acessar profile_id de outro usuário (deve falhar RLS)

-- ROLLBACK (se necessário):
-- ALTER TABLE instagram_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE audits DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE comparisons DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE analysis_queue DISABLE ROW LEVEL SECURITY;
