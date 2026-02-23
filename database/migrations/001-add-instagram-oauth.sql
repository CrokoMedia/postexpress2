-- ============================================
-- MIGRATION: Adicionar campos Instagram OAuth
-- Data: 2026-02-22
-- Descrição: Adiciona campos para autenticação via Instagram Graph API
-- ============================================

-- Adicionar campos à tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instagram_account_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT,
ADD COLUMN IF NOT EXISTS instagram_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instagram_connected_at TIMESTAMP WITH TIME ZONE;

-- Index para buscar por conta do Instagram
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_account
ON profiles(instagram_account_id)
WHERE instagram_account_id IS NOT NULL AND deleted_at IS NULL;

-- Index para tokens ativos
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_connected
ON profiles(instagram_connected, instagram_token_expires_at)
WHERE instagram_connected = TRUE AND deleted_at IS NULL;

-- Comentários
COMMENT ON COLUMN profiles.instagram_account_id IS 'ID da conta Instagram Business/Creator (para Graph API)';
COMMENT ON COLUMN profiles.instagram_access_token IS 'Access token da Graph API (criptografado no código)';
COMMENT ON COLUMN profiles.instagram_token_expires_at IS 'Data de expiração do token (60 dias)';
COMMENT ON COLUMN profiles.facebook_page_id IS 'ID da Facebook Page vinculada ao Instagram';
COMMENT ON COLUMN profiles.instagram_connected IS 'Se a conta está conectada via OAuth';
COMMENT ON COLUMN profiles.instagram_connected_at IS 'Data da última conexão OAuth';

-- ============================================
-- Tabela para rastrear publicações via API
-- ============================================
CREATE TABLE IF NOT EXISTS instagram_publications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Relacionamentos
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Dados da publicação
  carousel_index INTEGER NOT NULL CHECK (carousel_index >= 0),
  instagram_media_id VARCHAR(50),           -- ID retornado pelo Instagram
  instagram_permalink TEXT,                  -- URL do post publicado

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'published', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Metadados
  slide_count INTEGER,
  caption TEXT,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_instagram_pubs_audit ON instagram_publications(audit_id);
CREATE INDEX idx_instagram_pubs_profile ON instagram_publications(profile_id);
CREATE INDEX idx_instagram_pubs_status ON instagram_publications(status, scheduled_for);
CREATE INDEX idx_instagram_pubs_instagram_id ON instagram_publications(instagram_media_id)
  WHERE instagram_media_id IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER update_instagram_pubs_updated_at
BEFORE UPDATE ON instagram_publications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE instagram_publications IS 'Rastreia carrosséis publicados via Instagram Graph API';
COMMENT ON COLUMN instagram_publications.instagram_media_id IS 'ID do container criado no Instagram';
COMMENT ON COLUMN instagram_publications.instagram_permalink IS 'URL do post publicado (retornado pela API)';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
