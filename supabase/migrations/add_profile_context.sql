-- Tabela para armazenar contexto adicional dos perfis
CREATE TABLE IF NOT EXISTS profile_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Contexto textual
  nicho TEXT,
  objetivos TEXT,
  publico_alvo TEXT,
  produtos_servicos TEXT,
  tom_voz TEXT,
  contexto_adicional TEXT,

  -- Arquivos
  files JSONB DEFAULT '[]'::jsonb,
  -- Estrutura: [{ "name": "arquivo.pdf", "url": "https://...", "type": "pdf", "size": 1024 }]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(profile_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_profile_context_profile_id ON profile_context(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_context_deleted_at ON profile_context(deleted_at);

-- RLS
ALTER TABLE profile_context ENABLE ROW LEVEL SECURITY;

-- Policy para service role (nossa API)
CREATE POLICY "Service role can do everything on profile_context"
  ON profile_context
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profile_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_context_updated_at
  BEFORE UPDATE ON profile_context
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_context_updated_at();

-- Comentários
COMMENT ON TABLE profile_context IS 'Contexto adicional sobre o expert para auditorias mais precisas';
COMMENT ON COLUMN profile_context.files IS 'Array JSON com URLs dos arquivos uploadados (PDFs, CSVs, etc.)';
