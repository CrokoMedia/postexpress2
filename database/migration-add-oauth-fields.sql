-- ============================================
-- MIGRAÇÃO: Adicionar campos OAuth do Instagram
-- ============================================
--
-- CONTEXTO:
--   Os perfis auditados do Instagram podem também ter OAuth
--   para publicar conteúdo gerado no próprio Instagram
--
-- CAMPOS A ADICIONAR:
--   - instagram_account_id: ID da conta do Instagram Business
--   - instagram_access_token: Token de acesso de longa duração (60 dias)
--   - instagram_token_expires_at: Data de expiração do token
--   - facebook_page_id: ID da página do Facebook vinculada
--   - instagram_connected: Flag se OAuth está conectado
--   - instagram_connected_at: Data da primeira conexão
--   - user_id: ID do usuário dono do perfil (para controle de acesso)
--
-- ============================================

ALTER TABLE instagram_profiles
ADD COLUMN IF NOT EXISTS instagram_account_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT,
ADD COLUMN IF NOT EXISTS instagram_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instagram_connected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_instagram_profiles_user_id
ON instagram_profiles(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_instagram_profiles_connected
ON instagram_profiles(instagram_connected) WHERE instagram_connected = TRUE;

CREATE INDEX IF NOT EXISTS idx_instagram_profiles_token_expires
ON instagram_profiles(instagram_token_expires_at) WHERE instagram_token_expires_at IS NOT NULL;

-- Comentários
COMMENT ON COLUMN instagram_profiles.instagram_account_id IS 'ID da conta Instagram Business (para publicação via Graph API)';
COMMENT ON COLUMN instagram_profiles.instagram_access_token IS 'Token de acesso de longa duração (60 dias)';
COMMENT ON COLUMN instagram_profiles.instagram_token_expires_at IS 'Data de expiração do token OAuth';
COMMENT ON COLUMN instagram_profiles.facebook_page_id IS 'ID da página do Facebook vinculada ao Instagram';
COMMENT ON COLUMN instagram_profiles.instagram_connected IS 'Flag se OAuth está conectado (pode publicar)';
COMMENT ON COLUMN instagram_profiles.instagram_connected_at IS 'Data da primeira conexão OAuth';
COMMENT ON COLUMN instagram_profiles.user_id IS 'Usuário dono do perfil (para controle de acesso)';

-- ============================================
-- VERIFICAÇÃO:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'instagram_profiles'
-- AND column_name IN (
--   'instagram_account_id',
--   'instagram_access_token',
--   'instagram_token_expires_at',
--   'facebook_page_id',
--   'instagram_connected',
--   'instagram_connected_at',
--   'user_id'
-- );
-- ============================================
