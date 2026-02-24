-- ============================================
-- CORREÇÃO ULTRA FINAL: Foreign Key audits
-- Execute TUDO no Supabase SQL Editor
-- ============================================

-- PASSO 1: Ver estado atual
SELECT
    'ESTADO ATUAL:' as status,
    tc.constraint_name,
    ccu.table_name AS aponta_para
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audits'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%profile%';

-- PASSO 2: FORÇAR remoção de TODAS as FKs
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'audits'
          AND constraint_type = 'FOREIGN KEY'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE audits DROP CONSTRAINT ' || r.constraint_name || ' CASCADE';
            RAISE NOTICE 'Removida: %', r.constraint_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover %, continuando...', r.constraint_name;
        END;
    END LOOP;
END $$;

-- PASSO 3: Verificar se instagram_profiles existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'instagram_profiles'
    ) THEN
        RAISE NOTICE 'OK: Tabela instagram_profiles existe';
    ELSE
        RAISE EXCEPTION 'ERRO CRÍTICO: Tabela instagram_profiles NÃO existe!';
    END IF;
END $$;

-- PASSO 4: Criar FK nova
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- PASSO 5: Verificar resultado
SELECT
    'RESULTADO FINAL:' as status,
    tc.constraint_name,
    ccu.table_name AS aponta_para
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audits'
  AND tc.constraint_type = 'FOREIGN KEY';

-- PASSO 6: TESTE REAL
DO $$
DECLARE
    test_profile_id UUID;
    test_audit_id UUID;
BEGIN
    -- Pegar um perfil real
    SELECT id INTO test_profile_id
    FROM instagram_profiles
    LIMIT 1;

    IF test_profile_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum perfil encontrado em instagram_profiles!';
    END IF;

    RAISE NOTICE '===========================================';
    RAISE NOTICE 'TESTANDO INSERT com profile_id: %', test_profile_id;
    RAISE NOTICE '===========================================';

    -- INSERT DE TESTE
    INSERT INTO audits (
        profile_id,
        audit_date,
        posts_analyzed,
        score_overall,
        raw_json
    ) VALUES (
        test_profile_id,
        NOW(),
        0,
        100,
        '{"test": "squad_auditores_ok"}'::jsonb
    ) RETURNING id INTO test_audit_id;

    RAISE NOTICE '';
    RAISE NOTICE '✅✅✅ SUCESSO TOTAL! ✅✅✅';
    RAISE NOTICE 'Audit de teste criado: %', test_audit_id;
    RAISE NOTICE '';

    -- Limpar teste
    DELETE FROM audits WHERE id = test_audit_id;
    RAISE NOTICE 'Audit de teste removido.';
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '🎉 SISTEMA PRONTO PARA FRESH AUDITS! 🎉';
    RAISE NOTICE '===========================================';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌❌❌ ERRO NO TESTE: ❌❌❌';
    RAISE NOTICE 'Mensagem: %', SQLERRM;
    RAISE NOTICE 'Detalhe: %', SQLSTATE;
    RAISE NOTICE '';
END $$;
