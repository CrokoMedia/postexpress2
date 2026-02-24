-- ============================================
-- MIGRAÇÃO: Corrigir conflito de tabela profiles
-- ============================================
--
-- PROBLEMA:
--   A tabela 'profiles' atual é da aplicação de creators/usuários
--   O sistema de auditoria precisa de uma tabela 'profiles' diferente
--   para armazenar perfis do Instagram auditados
--
-- SOLUÇÃO:
--   1. Renomear profiles → creator_profiles
--   2. Criar nova tabela profiles do schema de auditoria
--   3. Atualizar foreign keys da tabela audits
--
-- ============================================

-- 1. Renomear tabela atual profiles para creator_profiles
ALTER TABLE profiles RENAME TO creator_profiles;

-- 2. Criar tabela profiles do sistema de auditoria
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Identificação
  username VARCHAR(100) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9._]+$'),
  full_name VARCHAR(255),
  biography TEXT,
  external_url VARCHAR(500),

  -- Métricas do perfil
  followers_count INTEGER CHECK (followers_count >= 0),
  following_count INTEGER CHECK (following_count >= 0),
  posts_count INTEGER CHECK (posts_count >= 0),

  -- URLs de imagem
  profile_pic_url TEXT,
  profile_pic_url_hd TEXT,
  profile_pic_cloudinary_url TEXT,
  url VARCHAR(255),

  -- Flags
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_business_account BOOLEAN DEFAULT FALSE,

  -- Categorias
  business_category VARCHAR(100),
  category_enum VARCHAR(50),

  -- Contato
  contact_phone_number VARCHAR(50),
  contact_email VARCHAR(255),

  -- Metadados
  first_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_audits INTEGER DEFAULT 0,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes da tabela profiles
CREATE INDEX idx_profiles_username ON profiles(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_verified ON profiles(is_verified) WHERE is_verified = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_followers ON profiles(followers_count DESC NULLS LAST);
CREATE INDEX idx_profiles_last_scraped ON profiles(last_scraped_at DESC);

-- Full-text search no perfil
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_profiles_biography_trgm ON profiles USING GIN (biography gin_trgm_ops);

-- 3. A tabela audits já tem a foreign key correta (profile_id → profiles.id)
--    Não precisa alterar pois a nova tabela profiles tem a mesma estrutura

-- 4. Comentário explicativo
COMMENT ON TABLE creator_profiles IS 'Perfis de creators/usuários do sistema Croko Lab (antiga tabela profiles)';
COMMENT ON TABLE profiles IS 'Perfis do Instagram auditados pelo sistema de auditoria';

-- ============================================
-- NOTAS:
-- - A tabela audits.profile_id já aponta para profiles(id)
-- - Após rodar esta migração, os códigos que usam a antiga
--   tabela profiles (creators) precisam ser atualizados para
--   usar creator_profiles
-- ============================================
