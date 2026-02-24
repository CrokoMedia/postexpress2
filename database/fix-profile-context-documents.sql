-- ============================================
-- FIX: Adicionar coluna 'documents' à tabela profile_context
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se a tabela existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_context') THEN
    RAISE EXCEPTION 'Tabela profile_context não existe! Execute a migration 006_profile_context.sql primeiro.';
  END IF;
END $$;

-- 2. Adicionar coluna documents se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profile_context'
    AND column_name = 'documents'
  ) THEN
    ALTER TABLE profile_context ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Coluna documents adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna documents já existe.';
  END IF;
END $$;

-- 3. Criar índice GIN se não existir
CREATE INDEX IF NOT EXISTS idx_profile_context_documents_gin
ON profile_context USING GIN (documents);

-- 4. Adicionar comentário
COMMENT ON COLUMN profile_context.documents IS 'Metadados dos documentos uploaded (JSON array)';

-- 5. Verificar resultado
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profile_context'
AND column_name IN ('documents', 'files', 'raw_text')
ORDER BY column_name;

-- Resultado esperado:
-- documents | jsonb | YES | '[]'::jsonb
-- files     | jsonb | YES | '[]'::jsonb
-- raw_text  | text  | YES | NULL
