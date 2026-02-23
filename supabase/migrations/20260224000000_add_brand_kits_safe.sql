-- ============================================
-- BRAND KITS - Sistema de identidade visual
-- ============================================
-- VERSÃO SAFE: Pode ser executada múltiplas vezes
-- Permite que cada perfil tenha múltiplos brand kits
-- com cores, logos, tipografia e tom de voz personalizados

-- ============================================
-- TABELA PRINCIPAL
-- ============================================

CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Identificação
  brand_name VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  -- Paleta de cores (formato HEX: #RRGGBB)
  primary_color VARCHAR(7) CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color VARCHAR(7) CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color VARCHAR(7) CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color VARCHAR(7) CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  text_color VARCHAR(7) CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),

  -- Logo (Cloudinary URL)
  logo_url TEXT,
  logo_public_id VARCHAR(255),

  -- Tipografia
  primary_font VARCHAR(100),
  secondary_font VARCHAR(100),

  -- Tom de voz (JSONB para estrutura flexível)
  tone_of_voice JSONB,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Busca por profile_id (mais comum)
CREATE INDEX IF NOT EXISTS idx_brand_kits_profile_id
  ON brand_kits(profile_id)
  WHERE deleted_at IS NULL;

-- Busca por kit padrão
CREATE INDEX IF NOT EXISTS idx_brand_kits_default
  ON brand_kits(profile_id, is_default)
  WHERE is_default = TRUE AND deleted_at IS NULL;

-- Ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_brand_kits_created_at
  ON brand_kits(created_at DESC);

-- UNIQUE INDEX: apenas 1 kit padrão por perfil
DROP INDEX IF EXISTS idx_brand_kits_one_default_per_profile;
CREATE UNIQUE INDEX idx_brand_kits_one_default_per_profile
  ON brand_kits(profile_id)
  WHERE is_default = TRUE AND deleted_at IS NULL;

-- ============================================
-- RLS POLICIES (com DROP antes)
-- ============================================

-- Habilitar RLS
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Service role full access on brand_kits" ON brand_kits;
DROP POLICY IF EXISTS "Public read access on brand_kits" ON brand_kits;

-- Service role: acesso total
CREATE POLICY "Service role full access on brand_kits"
  ON brand_kits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public: apenas leitura (para exibição no frontend)
CREATE POLICY "Public read access on brand_kits"
  ON brand_kits
  FOR SELECT
  TO public
  USING (deleted_at IS NULL);

-- ============================================
-- FUNCTIONS (CREATE OR REPLACE)
-- ============================================

-- 1. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_brand_kits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para garantir que o primeiro kit é sempre padrão
CREATE OR REPLACE FUNCTION ensure_default_brand_kit()
RETURNS TRIGGER AS $$
DECLARE
  kit_count INTEGER;
BEGIN
  -- Contar quantos kits ativos existem para este perfil
  SELECT COUNT(*) INTO kit_count
  FROM brand_kits
  WHERE profile_id = NEW.profile_id
    AND deleted_at IS NULL
    AND id != NEW.id;  -- Excluir o kit atual se for UPDATE

  -- Se for o primeiro kit, forçar is_default = TRUE
  IF kit_count = 0 THEN
    NEW.is_default := TRUE;
  END IF;

  -- Se estiver marcando como padrão, desmarcar os outros
  IF NEW.is_default = TRUE THEN
    UPDATE brand_kits
    SET is_default = FALSE, updated_at = NOW()
    WHERE profile_id = NEW.profile_id
      AND id != NEW.id
      AND is_default = TRUE
      AND deleted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para impedir delete do último kit e auto-promover novo padrão
CREATE OR REPLACE FUNCTION prevent_last_kit_deletion()
RETURNS TRIGGER AS $$
DECLARE
  remaining_kits INTEGER;
  new_default_id UUID;
BEGIN
  -- Contar kits ativos restantes (excluindo o que está sendo deletado)
  SELECT COUNT(*) INTO remaining_kits
  FROM brand_kits
  WHERE profile_id = OLD.profile_id
    AND id != OLD.id
    AND deleted_at IS NULL;

  -- Se for o último kit, impedir soft delete
  IF remaining_kits = 0 THEN
    RAISE EXCEPTION 'Não é possível deletar o último brand kit. Cada perfil deve ter ao menos um kit ativo.';
  END IF;

  -- Se estava deletando o kit padrão, promover outro
  IF OLD.is_default = TRUE AND remaining_kits > 0 THEN
    -- Buscar o kit mais recente para ser o novo padrão
    SELECT id INTO new_default_id
    FROM brand_kits
    WHERE profile_id = OLD.profile_id
      AND id != OLD.id
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    -- Promover o novo padrão
    UPDATE brand_kits
    SET is_default = TRUE, updated_at = NOW()
    WHERE id = new_default_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS (com DROP antes)
-- ============================================

-- Trigger 1: Atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_brand_kits_updated_at ON brand_kits;
CREATE TRIGGER trigger_update_brand_kits_updated_at
  BEFORE UPDATE ON brand_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_kits_updated_at();

-- Trigger 2: Garantir primeiro kit como padrão
DROP TRIGGER IF EXISTS trigger_ensure_default_brand_kit ON brand_kits;
CREATE TRIGGER trigger_ensure_default_brand_kit
  BEFORE INSERT OR UPDATE ON brand_kits
  FOR EACH ROW
  EXECUTE FUNCTION ensure_default_brand_kit();

-- Trigger 3: Impedir delete do último kit
DROP TRIGGER IF EXISTS trigger_prevent_last_kit_deletion ON brand_kits;
CREATE TRIGGER trigger_prevent_last_kit_deletion
  BEFORE UPDATE OF deleted_at ON brand_kits
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION prevent_last_kit_deletion();

-- ============================================
-- COMMENTS (Documentação)
-- ============================================

COMMENT ON TABLE brand_kits IS 'Brand kits com identidade visual completa (cores, logo, tipografia, tom de voz)';

COMMENT ON COLUMN brand_kits.id IS 'Identificador único do brand kit';
COMMENT ON COLUMN brand_kits.profile_id IS 'ID do perfil dono do brand kit (FK para profiles)';
COMMENT ON COLUMN brand_kits.brand_name IS 'Nome identificador do brand kit (ex: "Principal", "Black Friday", "Verão 2026")';
COMMENT ON COLUMN brand_kits.is_default IS 'Se TRUE, este é o brand kit padrão do perfil (apenas 1 por perfil)';

COMMENT ON COLUMN brand_kits.primary_color IS 'Cor primária da marca (formato HEX: #RRGGBB)';
COMMENT ON COLUMN brand_kits.secondary_color IS 'Cor secundária da marca (formato HEX: #RRGGBB)';
COMMENT ON COLUMN brand_kits.accent_color IS 'Cor de destaque/acento (formato HEX: #RRGGBB)';
COMMENT ON COLUMN brand_kits.background_color IS 'Cor de fundo padrão (formato HEX: #RRGGBB)';
COMMENT ON COLUMN brand_kits.text_color IS 'Cor de texto padrão (formato HEX: #RRGGBB)';

COMMENT ON COLUMN brand_kits.logo_url IS 'URL completa do logo no Cloudinary';
COMMENT ON COLUMN brand_kits.logo_public_id IS 'Public ID do Cloudinary para manipulação (transformações, delete)';

COMMENT ON COLUMN brand_kits.primary_font IS 'Fonte tipográfica primária (ex: "Inter", "Montserrat")';
COMMENT ON COLUMN brand_kits.secondary_font IS 'Fonte tipográfica secundária (ex: "Roboto", "Open Sans")';

COMMENT ON COLUMN brand_kits.tone_of_voice IS 'Tom de voz em JSONB: {characteristics: [...], examples: [...], avoid: [...]}';

COMMENT ON COLUMN brand_kits.deleted_at IS 'Soft delete: se preenchido, o kit está deletado logicamente';
COMMENT ON COLUMN brand_kits.created_at IS 'Data de criação do brand kit';
COMMENT ON COLUMN brand_kits.updated_at IS 'Data da última atualização (auto-gerenciado por trigger)';
