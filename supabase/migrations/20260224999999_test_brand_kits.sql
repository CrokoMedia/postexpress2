-- ============================================
-- TESTES COMPLETOS DO SISTEMA BRAND KITS
-- QA Engineer - Fase 1: Database Testing
-- ============================================

-- Este script testa:
-- 1. Estrutura da tabela
-- 2. Constraints (CHECK de cores HEX)
-- 3. Triggers (ensure_default, prevent_last_deletion)
-- 4. Unique index (apenas 1 padrão por perfil)
-- 5. Soft delete
-- 6. RLS policies

\echo '=========================================='
\echo 'TESTE 1: Verificar tabela foi criada'
\echo '=========================================='

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'brand_kits'
    )
    THEN '✅ PASSOU: Tabela brand_kits existe'
    ELSE '❌ FALHOU: Tabela brand_kits não foi criada'
  END AS resultado;

\echo ''
\echo '=========================================='
\echo 'TESTE 2: Verificar colunas esperadas'
\echo '=========================================='

SELECT
  column_name,
  data_type,
  is_nullable,
  SUBSTRING(column_default, 1, 50) AS column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'brand_kits'
ORDER BY ordinal_position;

\echo ''
\echo '=========================================='
\echo 'TESTE 3: Verificar constraints (CHECK HEX)'
\echo '=========================================='

SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'brand_kits'::regclass
  AND contype = 'c';  -- CHECK constraints

\echo ''
\echo '=========================================='
\echo 'TESTE 4: Verificar indexes'
\echo '=========================================='

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'brand_kits'
ORDER BY indexname;

\echo ''
\echo '=========================================='
\echo 'TESTE 5: Verificar triggers'
\echo '=========================================='

SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'brand_kits'
ORDER BY trigger_name;

\echo ''
\echo '=========================================='
\echo 'TESTE 6: Verificar RLS policies'
\echo '=========================================='

SELECT
  policyname,
  cmd,
  roles,
  qual IS NOT NULL AS has_using_clause,
  with_check IS NOT NULL AS has_with_check_clause
FROM pg_policies
WHERE tablename = 'brand_kits'
ORDER BY policyname;

\echo ''
\echo '=========================================='
\echo 'TESTE 7: Teste funcional dos triggers'
\echo '=========================================='

-- Criar transação de teste
BEGIN;

-- Buscar um profile existente para teste
DO $$
DECLARE
  test_profile_id UUID;
  test_kit_id_1 UUID;
  test_kit_id_2 UUID;
  test_kit_id_3 UUID;
  default_count INTEGER;
BEGIN
  -- Pegar primeiro profile
  SELECT id INTO test_profile_id FROM profiles WHERE deleted_at IS NULL LIMIT 1;

  IF test_profile_id IS NULL THEN
    RAISE NOTICE '⚠️  Nenhum profile encontrado. Pulando testes funcionais.';
    RAISE NOTICE 'Execute este script depois de ter ao menos 1 profile no banco.';
    RETURN;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🧪 Testando com profile_id: %', test_profile_id;
  RAISE NOTICE '';

  -- ========================================
  -- TESTE 7.1: Primeiro kit é automaticamente padrão
  -- ========================================
  RAISE NOTICE '📋 TESTE 7.1: Primeiro kit deve ser is_default=TRUE';

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

  IF (SELECT is_default FROM brand_kits WHERE id = test_kit_id_1) THEN
    RAISE NOTICE '✅ TESTE 7.1 PASSOU: Primeiro kit criado com is_default=TRUE';
  ELSE
    RAISE EXCEPTION '❌ TESTE 7.1 FALHOU: Primeiro kit deveria ser padrão!';
  END IF;

  -- ========================================
  -- TESTE 7.2: Segundo kit NÃO é padrão
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.2: Segundo kit NÃO deve ser padrão';

  INSERT INTO brand_kits (
    profile_id,
    brand_name,
    primary_color
  ) VALUES (
    test_profile_id,
    'Kit Secundário',
    '#123456'
  ) RETURNING id INTO test_kit_id_2;

  IF (SELECT is_default FROM brand_kits WHERE id = test_kit_id_2) = FALSE THEN
    RAISE NOTICE '✅ TESTE 7.2 PASSOU: Segundo kit criado com is_default=FALSE';
  ELSE
    RAISE EXCEPTION '❌ TESTE 7.2 FALHOU: Segundo kit NÃO deveria ser padrão!';
  END IF;

  -- ========================================
  -- TESTE 7.3: Apenas 1 kit padrão por perfil (UNIQUE INDEX)
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.3: Marcar 2º kit como padrão desmarca o 1º';

  UPDATE brand_kits SET is_default = TRUE WHERE id = test_kit_id_2;

  SELECT COUNT(*) INTO default_count
  FROM brand_kits
  WHERE profile_id = test_profile_id
    AND is_default = TRUE
    AND deleted_at IS NULL;

  IF default_count = 1 AND (SELECT is_default FROM brand_kits WHERE id = test_kit_id_2) THEN
    RAISE NOTICE '✅ TESTE 7.3 PASSOU: Apenas 1 kit é padrão (UNIQUE INDEX funcionando)';
    RAISE NOTICE '   - Kit 1 is_default=%', (SELECT is_default FROM brand_kits WHERE id = test_kit_id_1);
    RAISE NOTICE '   - Kit 2 is_default=%', (SELECT is_default FROM brand_kits WHERE id = test_kit_id_2);
  ELSE
    RAISE EXCEPTION '❌ TESTE 7.3 FALHOU: Deveria haver apenas 1 kit padrão! (count=%)', default_count;
  END IF;

  -- ========================================
  -- TESTE 7.4: Validação de cores HEX inválidas
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.4: Validação de cores HEX inválidas';

  BEGIN
    INSERT INTO brand_kits (
      profile_id,
      brand_name,
      primary_color
    ) VALUES (
      test_profile_id,
      'Kit Inválido',
      'ZZZZZZ'  -- HEX inválido (sem #)
    );
    RAISE EXCEPTION '❌ TESTE 7.4 FALHOU: Deveria ter impedido HEX inválido!';
  EXCEPTION
    WHEN check_violation THEN
      RAISE NOTICE '✅ TESTE 7.4 PASSOU: CHECK constraint impediu HEX inválido';
  END;

  -- ========================================
  -- TESTE 7.5: Soft delete do kit padrão promove outro
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.5: Soft delete do kit padrão auto-promove outro';

  -- Kit 2 é o padrão atual, deletar ele
  UPDATE brand_kits SET deleted_at = NOW() WHERE id = test_kit_id_2;

  -- Kit 1 deve ter sido promovido
  IF (SELECT is_default FROM brand_kits WHERE id = test_kit_id_1 AND deleted_at IS NULL) THEN
    RAISE NOTICE '✅ TESTE 7.5 PASSOU: Ao deletar kit padrão, outro foi auto-promovido';
  ELSE
    RAISE EXCEPTION '❌ TESTE 7.5 FALHOU: Deveria ter promovido o Kit 1 ao deletar Kit 2!';
  END IF;

  -- ========================================
  -- TESTE 7.6: Impedir delete do último kit
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.6: Impedir soft delete do último kit ativo';

  BEGIN
    UPDATE brand_kits SET deleted_at = NOW() WHERE id = test_kit_id_1;
    RAISE EXCEPTION '❌ TESTE 7.6 FALHOU: Não deveria permitir deletar o último kit!';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%último brand kit%' THEN
        RAISE NOTICE '✅ TESTE 7.6 PASSOU: Trigger impediu delete do último kit';
        RAISE NOTICE '   Mensagem de erro: %', SQLERRM;
      ELSE
        RAISE EXCEPTION '❌ TESTE 7.6 FALHOU: Erro inesperado: %', SQLERRM;
      END IF;
  END;

  -- ========================================
  -- TESTE 7.7: Criar 3º kit e deletar não-padrão (deve passar)
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.7: Deletar kit não-padrão quando há outros ativos';

  INSERT INTO brand_kits (
    profile_id,
    brand_name,
    primary_color
  ) VALUES (
    test_profile_id,
    'Kit Terciário',
    '#ABCDEF'
  ) RETURNING id INTO test_kit_id_3;

  -- Deletar o Kit 3 (não é padrão)
  UPDATE brand_kits SET deleted_at = NOW() WHERE id = test_kit_id_3;

  IF (SELECT deleted_at IS NOT NULL FROM brand_kits WHERE id = test_kit_id_3) THEN
    RAISE NOTICE '✅ TESTE 7.7 PASSOU: Permitiu deletar kit não-padrão';
  ELSE
    RAISE EXCEPTION '❌ TESTE 7.7 FALHOU: Deveria permitir deletar kit não-padrão!';
  END IF;

  -- ========================================
  -- TESTE 7.8: Validar tone_of_voice JSONB
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.8: Validar campo tone_of_voice (JSONB)';

  UPDATE brand_kits
  SET tone_of_voice = '{"characteristics": ["test"], "examples": [], "avoid": ["spam"]}'::jsonb
  WHERE id = test_kit_id_1;

  IF (SELECT tone_of_voice->>'characteristics' FROM brand_kits WHERE id = test_kit_id_1) = '["test"]' THEN
    RAISE NOTICE '✅ TESTE 7.8 PASSOU: Campo JSONB tone_of_voice funciona corretamente';
  ELSE
    RAISE EXCEPTION '❌ TESTE 7.8 FALHOU: Problema com campo JSONB!';
  END IF;

  -- ========================================
  -- TESTE 7.9: Validar updated_at trigger
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '📋 TESTE 7.9: Trigger updated_at automático';

  DECLARE
    old_updated_at TIMESTAMP WITH TIME ZONE;
    new_updated_at TIMESTAMP WITH TIME ZONE;
  BEGIN
    SELECT updated_at INTO old_updated_at FROM brand_kits WHERE id = test_kit_id_1;

    -- Aguardar 1 segundo
    PERFORM pg_sleep(1);

    -- Fazer update
    UPDATE brand_kits SET brand_name = 'Kit Principal Atualizado' WHERE id = test_kit_id_1;

    SELECT updated_at INTO new_updated_at FROM brand_kits WHERE id = test_kit_id_1;

    IF new_updated_at > old_updated_at THEN
      RAISE NOTICE '✅ TESTE 7.9 PASSOU: Trigger updated_at funcionando';
      RAISE NOTICE '   - Antes: %', old_updated_at;
      RAISE NOTICE '   - Depois: %', new_updated_at;
    ELSE
      RAISE EXCEPTION '❌ TESTE 7.9 FALHOU: updated_at não foi atualizado!';
    END IF;
  END;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TODOS OS TESTES PASSARAM!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Resumo:';
  RAISE NOTICE '- ✅ Primeiro kit é padrão automaticamente';
  RAISE NOTICE '- ✅ Segundo kit NÃO é padrão';
  RAISE NOTICE '- ✅ Apenas 1 kit padrão por perfil (UNIQUE INDEX)';
  RAISE NOTICE '- ✅ Validação de cores HEX';
  RAISE NOTICE '- ✅ Soft delete de padrão promove outro';
  RAISE NOTICE '- ✅ Impede delete do último kit';
  RAISE NOTICE '- ✅ Permite delete de kit não-padrão';
  RAISE NOTICE '- ✅ Campo JSONB tone_of_voice';
  RAISE NOTICE '- ✅ Trigger updated_at automático';
  RAISE NOTICE '';

END $$;

-- Rollback da transação de teste (não commitar dados de teste)
ROLLBACK;

\echo ''
\echo '=========================================='
\echo '📝 FIM DOS TESTES'
\echo '=========================================='
\echo ''
\echo 'NOTA: Todos os dados de teste foram descartados (ROLLBACK).'
\echo 'A tabela brand_kits está limpa e pronta para uso em produção.'
\echo ''
