-- ============================================
-- VALIDAÇÃO DA MIGRATION brand_kits
-- ============================================
-- Execute este script APÓS rodar 20260224000000_add_brand_kits.sql
-- para validar que tudo foi criado corretamente

-- 1. Verificar que a tabela foi criada
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'brand_kits';

-- 2. Verificar colunas
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'brand_kits'
ORDER BY ordinal_position;

-- 3. Verificar constraints (CHECK para cores HEX)
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'brand_kits'::regclass;

-- 4. Verificar indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'brand_kits'
ORDER BY indexname;

-- 5. Verificar triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'brand_kits';

-- 6. Verificar RLS policies
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'brand_kits';

-- 7. Verificar comments
SELECT
  col.column_name,
  pgd.description
FROM pg_catalog.pg_statio_all_tables AS st
INNER JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid)
INNER JOIN information_schema.columns col ON (
  pgd.objsubid = col.ordinal_position
  AND col.table_schema = st.schemaname
  AND col.table_name = st.relname
)
WHERE st.relname = 'brand_kits';

-- ============================================
-- TESTE DE INSERÇÃO (EXEMPLO)
-- ============================================
-- Descomente para testar se os triggers funcionam

/*
-- Buscar um profile_id existente para teste
DO $$
DECLARE
  test_profile_id UUID;
  test_kit_id_1 UUID;
  test_kit_id_2 UUID;
BEGIN
  -- Pegar primeiro profile
  SELECT id INTO test_profile_id FROM profiles LIMIT 1;

  IF test_profile_id IS NULL THEN
    RAISE NOTICE 'Nenhum profile encontrado. Crie um profile primeiro para testar.';
    RETURN;
  END IF;

  RAISE NOTICE 'Testando com profile_id: %', test_profile_id;

  -- Inserir primeiro kit (deve ser padrão automaticamente)
  INSERT INTO brand_kits (
    profile_id,
    brand_name,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    primary_font,
    secondary_font,
    tone_of_voice
  ) VALUES (
    test_profile_id,
    'Kit Principal',
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FFFFFF',
    '#000000',
    'Inter',
    'Roboto',
    '{"characteristics": ["profissional", "amigável"], "examples": ["Oi, tudo bem?"], "avoid": ["gírias"]}'::jsonb
  ) RETURNING id INTO test_kit_id_1;

  RAISE NOTICE 'Kit 1 criado: %. Deve ser is_default=TRUE', test_kit_id_1;

  -- Verificar se é padrão
  IF (SELECT is_default FROM brand_kits WHERE id = test_kit_id_1) THEN
    RAISE NOTICE 'TESTE 1 PASSOU: Primeiro kit é padrão!';
  ELSE
    RAISE EXCEPTION 'TESTE 1 FALHOU: Primeiro kit deveria ser padrão!';
  END IF;

  -- Inserir segundo kit (não padrão)
  INSERT INTO brand_kits (
    profile_id,
    brand_name,
    primary_color,
    is_default
  ) VALUES (
    test_profile_id,
    'Kit Secundário',
    '#123456',
    FALSE
  ) RETURNING id INTO test_kit_id_2;

  RAISE NOTICE 'Kit 2 criado: %. Deve ser is_default=FALSE', test_kit_id_2;

  -- Marcar segundo como padrão
  UPDATE brand_kits SET is_default = TRUE WHERE id = test_kit_id_2;

  -- Verificar que apenas um é padrão agora
  IF (SELECT COUNT(*) FROM brand_kits WHERE profile_id = test_profile_id AND is_default = TRUE) = 1 THEN
    RAISE NOTICE 'TESTE 2 PASSOU: Apenas um kit é padrão!';
  ELSE
    RAISE EXCEPTION 'TESTE 2 FALHOU: Deveria haver apenas 1 kit padrão!';
  END IF;

  -- Tentar deletar o kit padrão (deve promover outro)
  UPDATE brand_kits SET deleted_at = NOW() WHERE id = test_kit_id_2;

  IF (SELECT is_default FROM brand_kits WHERE id = test_kit_id_1) THEN
    RAISE NOTICE 'TESTE 3 PASSOU: Ao deletar kit padrão, outro foi promovido!';
  ELSE
    RAISE EXCEPTION 'TESTE 3 FALHOU: Deveria ter promovido outro kit!';
  END IF;

  -- Tentar deletar o último kit (deve falhar)
  BEGIN
    UPDATE brand_kits SET deleted_at = NOW() WHERE id = test_kit_id_1;
    RAISE EXCEPTION 'TESTE 4 FALHOU: Não deveria permitir deletar o último kit!';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%último brand kit%' THEN
        RAISE NOTICE 'TESTE 4 PASSOU: Impediu delete do último kit!';
      ELSE
        RAISE EXCEPTION 'TESTE 4 FALHOU: Erro inesperado: %', SQLERRM;
      END IF;
  END;

  -- Limpar dados de teste
  DELETE FROM brand_kits WHERE profile_id = test_profile_id;

  RAISE NOTICE 'TODOS OS TESTES PASSARAM! Migration funcionando corretamente.';
END $$;
*/
