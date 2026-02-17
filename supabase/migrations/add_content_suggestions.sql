-- Tabela para armazenar sugestões de conteúdo geradas pelo Content Squad
CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_json JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Índices para busca rápida
  CONSTRAINT unique_audit_content UNIQUE (audit_id)
);

-- Índice para buscar por profile_id
CREATE INDEX IF NOT EXISTS idx_content_suggestions_profile_id ON content_suggestions(profile_id);

-- Índice para buscar por audit_id
CREATE INDEX IF NOT EXISTS idx_content_suggestions_audit_id ON content_suggestions(audit_id);

-- Índice para ordenar por data
CREATE INDEX IF NOT EXISTS idx_content_suggestions_generated_at ON content_suggestions(generated_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_content_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_suggestions_updated_at
  BEFORE UPDATE ON content_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_content_suggestions_updated_at();

-- Comentários
COMMENT ON TABLE content_suggestions IS 'Armazena sugestões de carrosséis geradas pelo Content Squad';
COMMENT ON COLUMN content_suggestions.content_json IS 'JSON completo com carrosséis, estratégia e próximos passos';
COMMENT ON COLUMN content_suggestions.generated_at IS 'Data e hora em que o conteúdo foi gerado pela IA';
