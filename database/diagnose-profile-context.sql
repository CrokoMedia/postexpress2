-- ============================================
-- DIAGNÓSTICO: Verificar estado da tabela profile_context
-- Execute este script PRIMEIRO no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se a tabela existe
SELECT
  CASE
    WHEN EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_context')
    THEN '✅ Tabela profile_context existe'
    ELSE '❌ Tabela profile_context NÃO existe'
  END as status;

-- 2. Listar TODAS as colunas da tabela
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profile_context'
ORDER BY ordinal_position;

-- 3. Verificar especificamente as colunas críticas
SELECT
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'profile_context' AND column_name = 'documents'
    )
    THEN '✅ Coluna documents existe'
    ELSE '❌ Coluna documents NÃO existe'
  END as documents_status,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'profile_context' AND column_name = 'files'
    )
    THEN '✅ Coluna files existe'
    ELSE '❌ Coluna files NÃO existe'
  END as files_status,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_name = 'profile_context' AND column_name = 'raw_text'
    )
    THEN '✅ Coluna raw_text existe'
    ELSE '❌ Coluna raw_text NÃO existe'
  END as raw_text_status;

-- 4. Contar registros na tabela
SELECT
  COUNT(*) as total_registros,
  COUNT(documents) as registros_com_documents,
  COUNT(files) as registros_com_files,
  COUNT(raw_text) as registros_com_raw_text
FROM profile_context;

-- 5. Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profile_context'
ORDER BY indexname;
