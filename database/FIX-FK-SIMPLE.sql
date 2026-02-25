-- ============================================
-- FIX SIMPLES: Verificar e corrigir FK
-- ============================================

-- 1. Verificar se a tabela existe
SELECT
  'content_suggestions' as tabela,
  COUNT(*) as registros
FROM content_suggestions;

-- 2. Verificar foreign keys existentes
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'content_suggestions';

-- 3. Verificar se a FK específica para profiles existe
DO $$
DECLARE
  fk_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'content_suggestions'
      AND kcu.column_name = 'profile_id'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) INTO fk_exists;

  IF fk_exists THEN
    RAISE NOTICE '✅ Foreign key profile_id → profiles existe!';
  ELSE
    RAISE NOTICE '❌ Foreign key profile_id → profiles NÃO existe!';
    RAISE NOTICE 'Tentando adicionar...';

    -- Adicionar FK
    ALTER TABLE content_suggestions
      ADD CONSTRAINT content_suggestions_profile_id_fkey
      FOREIGN KEY (profile_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;

    RAISE NOTICE '✅ Foreign key adicionada com sucesso!';
  END IF;
END $$;

-- 4. Forçar refresh do schema cache (importante!)
NOTIFY pgrst, 'reload schema';

-- 5. Verificação final - listar todas as constraints
SELECT
  'VERIFICAÇÃO FINAL' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'content_suggestions'
ORDER BY constraint_type, constraint_name;

SELECT '✅ Verificação completa!' as resultado;
