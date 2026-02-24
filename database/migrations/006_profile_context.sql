-- ============================================
-- MIGRATION 006: PROFILE CONTEXT
-- Adiciona sistema de contexto personalizado por perfil
-- com suporte a upload de documentos
-- ============================================

-- Criar tabela de contexto do perfil
CREATE TABLE IF NOT EXISTS profile_context (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Informações estruturadas do perfil/cliente (nomes em português para consistência)
  nicho TEXT,                           -- Nicho de atuação
  objetivos TEXT,                       -- Objetivos de conteúdo/negócio
  publico_alvo TEXT,                    -- Público-alvo
  produtos_servicos TEXT,               -- Produtos/serviços que oferece
  tom_voz TEXT,                         -- Tom de voz desejado
  contexto_adicional TEXT,              -- Contexto e notas adicionais
  files JSONB DEFAULT '[]'::jsonb,      -- Arquivos anexados (legacy, migrar para documents)

  -- Documentos uploaded (metadados)
  documents JSONB DEFAULT '[]'::jsonb,  -- Array de {id, filename, url, type, size, uploaded_at}

  -- Texto extraído de todos os documentos (para contexto dos squads)
  raw_text TEXT,                        -- Texto completo extraído dos documentos

  -- Metadados de uso
  last_used_in_audit_at TIMESTAMP WITH TIME ZONE,
  last_used_in_content_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profile_context_profile_id ON profile_context(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_context_updated_at ON profile_context(updated_at DESC);

-- Full-text search no contexto
CREATE INDEX IF NOT EXISTS idx_profile_context_raw_text_trgm ON profile_context USING GIN (raw_text gin_trgm_ops);

-- Índice GIN no JSONB de documentos
CREATE INDEX IF NOT EXISTS idx_profile_context_documents_gin ON profile_context USING GIN (documents);

-- ============================================
-- FUNCTION: Atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_profile_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profile_context_updated_at
  BEFORE UPDATE ON profile_context
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_context_updated_at();

-- ============================================
-- FUNCTION: Incrementar usage_count ao usar contexto
-- ============================================

CREATE OR REPLACE FUNCTION increment_context_usage(
  p_profile_id UUID,
  p_usage_type TEXT -- 'audit' ou 'content'
)
RETURNS VOID AS $$
BEGIN
  UPDATE profile_context
  SET
    usage_count = usage_count + 1,
    last_used_in_audit_at = CASE WHEN p_usage_type = 'audit' THEN NOW() ELSE last_used_in_audit_at END,
    last_used_in_content_at = CASE WHEN p_usage_type = 'content' THEN NOW() ELSE last_used_in_content_at END
  WHERE profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Perfis com contexto (para queries otimizadas)
-- ============================================

CREATE OR REPLACE VIEW profiles_with_context AS
SELECT
  p.*,
  pc.who_is,
  pc.niche,
  pc.target_audience,
  pc.products_services,
  pc.pain_points,
  pc.tone_of_voice,
  pc.goals,
  pc.unique_value_prop,
  pc.documents,
  pc.raw_text,
  pc.usage_count as context_usage_count,
  pc.last_used_in_audit_at,
  pc.last_used_in_content_at,
  (pc.id IS NOT NULL) as has_context
FROM profiles p
LEFT JOIN profile_context pc ON p.id = pc.profile_id
WHERE p.deleted_at IS NULL;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE profile_context IS 'Contexto personalizado de cada perfil para análises e criação de conteúdo';
COMMENT ON COLUMN profile_context.nicho IS 'Nicho de atuação do perfil';
COMMENT ON COLUMN profile_context.objetivos IS 'Objetivos de conteúdo e negócio';
COMMENT ON COLUMN profile_context.publico_alvo IS 'Público-alvo principal';
COMMENT ON COLUMN profile_context.produtos_servicos IS 'Produtos ou serviços oferecidos';
COMMENT ON COLUMN profile_context.tom_voz IS 'Tom de voz desejado para o conteúdo';
COMMENT ON COLUMN profile_context.contexto_adicional IS 'Notas e contexto adicional livre';
COMMENT ON COLUMN profile_context.files IS 'Arquivos anexados (metadados)';
COMMENT ON COLUMN profile_context.documents IS 'Metadados dos documentos uploaded (JSON array)';
COMMENT ON COLUMN profile_context.raw_text IS 'Texto completo extraído de todos os documentos (usado pelos squads)';
COMMENT ON COLUMN profile_context.usage_count IS 'Número de vezes que o contexto foi usado em análises/conteúdo';
