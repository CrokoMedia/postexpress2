-- ============================================
-- MIGRAÇÃO: Criar tabela instagram_profiles
-- ============================================
--
-- CONTEXTO:
--   A tabela 'profiles' atual armazena perfis de creators do sistema
--   O sistema de auditoria precisa de uma tabela separada para perfis do Instagram
--
-- SOLUÇÃO:
--   Criar tabela 'instagram_profiles' para perfis do Instagram auditados
--   Manter tabela 'profiles' para creators (não quebra código existente)
--
-- ============================================

-- Criar tabela instagram_profiles
CREATE TABLE instagram_profiles (
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

-- Indexes
CREATE INDEX idx_instagram_profiles_username ON instagram_profiles(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_instagram_profiles_verified ON instagram_profiles(is_verified) WHERE is_verified = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_instagram_profiles_created_at ON instagram_profiles(created_at DESC);
CREATE INDEX idx_instagram_profiles_followers ON instagram_profiles(followers_count DESC NULLS LAST);
CREATE INDEX idx_instagram_profiles_last_scraped ON instagram_profiles(last_scraped_at DESC);

-- Full-text search
CREATE INDEX idx_instagram_profiles_full_name_trgm ON instagram_profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_instagram_profiles_biography_trgm ON instagram_profiles USING GIN (biography gin_trgm_ops);

-- Comentários
COMMENT ON TABLE instagram_profiles IS 'Perfis do Instagram auditados pelo sistema de auditoria';
COMMENT ON TABLE profiles IS 'Perfis de creators/usuários do sistema Croko Lab';

-- ============================================
-- NOTA: Após rodar esta migração, é necessário:
-- 1. Atualizar código do sistema de auditoria para usar 'instagram_profiles'
-- 2. Atualizar foreign keys da tabela 'audits' (migração separada)
-- ============================================
