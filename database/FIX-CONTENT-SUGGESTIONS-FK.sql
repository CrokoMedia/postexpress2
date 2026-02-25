-- ============================================
-- FIX: Criar tabela content_suggestions
-- com foreign key correta para profiles
-- ============================================

-- Verificar se a tabela já existe
DO $$
BEGIN
  -- Se a tabela não existe, criar
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_suggestions') THEN

    -- Criar tabela
    CREATE TABLE content_suggestions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      content_json JSONB NOT NULL,
      generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

      -- Constraint único
      CONSTRAINT unique_audit_content UNIQUE (audit_id)
    );

    -- Criar índices
    CREATE INDEX idx_content_suggestions_profile_id ON content_suggestions(profile_id);
    CREATE INDEX idx_content_suggestions_audit_id ON content_suggestions(audit_id);
    CREATE INDEX idx_content_suggestions_generated_at ON content_suggestions(generated_at DESC);

    -- Trigger para updated_at
    CREATE OR REPLACE FUNCTION update_content_suggestions_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_content_suggestions_updated_at
      BEFORE UPDATE ON content_suggestions
      FOR EACH ROW
      EXECUTE FUNCTION update_content_suggestions_updated_at();

    -- Comentários
    COMMENT ON TABLE content_suggestions IS 'Armazena sugestões de carrosséis geradas pelo Content Squad';
    COMMENT ON COLUMN content_suggestions.content_json IS 'JSON completo com carrosséis, estratégia e próximos passos';

    RAISE NOTICE '✓ Tabela content_suggestions criada com sucesso!';

  ELSE
    -- Se a tabela existe, verificar se a FK está correta
    RAISE NOTICE '⚠ Tabela content_suggestions já existe. Verificando foreign keys...';

    -- Verificar se FK existe
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'content_suggestions_profile_id_fkey'
    ) THEN
      -- Adicionar FK se não existir
      ALTER TABLE content_suggestions
        ADD CONSTRAINT content_suggestions_profile_id_fkey
        FOREIGN KEY (profile_id)
        REFERENCES profiles(id)
        ON DELETE CASCADE;

      RAISE NOTICE '✓ Foreign key profile_id adicionada!';
    ELSE
      RAISE NOTICE '✓ Foreign key profile_id já existe!';
    END IF;

  END IF;
END $$;

-- Adicionar colunas que podem estar faltando (de migrations posteriores)
DO $$
BEGIN
  -- slides_json (migration add_slides_to_content_suggestions.sql)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_suggestions' AND column_name = 'slides_json'
  ) THEN
    ALTER TABLE content_suggestions ADD COLUMN slides_json JSONB;
    COMMENT ON COLUMN content_suggestions.slides_json IS 'URLs das imagens dos slides no Cloudinary';
    RAISE NOTICE '✓ Coluna slides_json adicionada!';
  END IF;

  -- approval_status (migration add_carousel_approval_docs.sql)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_suggestions' AND column_name = 'approval_status'
  ) THEN
    CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected');

    ALTER TABLE content_suggestions ADD COLUMN approval_status approval_status_enum DEFAULT 'pending';
    ALTER TABLE content_suggestions ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE content_suggestions ADD COLUMN rejection_reason TEXT;

    RAISE NOTICE '✓ Colunas de aprovação adicionadas!';
  END IF;

  -- reel_videos_json (migration 008_add_reel_videos.sql)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_suggestions' AND column_name = 'reel_videos_json'
  ) THEN
    ALTER TABLE content_suggestions ADD COLUMN reel_videos_json JSONB;
    COMMENT ON COLUMN content_suggestions.reel_videos_json IS 'JSON array de vídeos Reels gerados (URLs Cloudinary + metadados)';
    RAISE NOTICE '✓ Coluna reel_videos_json adicionada!';
  END IF;

  -- slides_v2_json (migration 20260218120000_add_slides_v2_to_content_suggestions.sql)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_suggestions' AND column_name = 'slides_v2_json'
  ) THEN
    ALTER TABLE content_suggestions ADD COLUMN slides_v2_json JSONB;
    COMMENT ON COLUMN content_suggestions.slides_v2_json IS 'Versão 2 dos slides com mais metadados e opções de design';
    RAISE NOTICE '✓ Coluna slides_v2_json adicionada!';
  END IF;

END $$;

-- Verificação final
SELECT
  'content_suggestions' as tabela,
  COUNT(*) as registros_existentes
FROM content_suggestions;

SELECT
  'Foreign Keys' as tipo,
  conname as nome,
  pg_get_constraintdef(oid) as definicao
FROM pg_constraint
WHERE conrelid = 'content_suggestions'::regclass
  AND contype = 'f';

-- Sucesso!
SELECT '✅ Migration aplicada com sucesso!' as status;
