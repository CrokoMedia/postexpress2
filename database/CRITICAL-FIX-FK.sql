-- ============================================
-- CORREÇÃO CRÍTICA: Foreign Key audits → instagram_profiles
-- Execute COMPLETO no Supabase SQL Editor
-- ============================================

-- PASSO 1: Verificar qual FK existe atualmente
SELECT
    'CONSTRAINT ATUAL:' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS aponta_para_tabela
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audits'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'profile_id';

-- PASSO 2: Remover TODAS as constraints relacionadas a profile_id
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_fkey CASCADE;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk CASCADE;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS fk_audits_profile CASCADE;
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_profile_id_key CASCADE;

-- PASSO 3: Verificar se a tabela instagram_profiles existe
SELECT 'VERIFICANDO instagram_profiles:' as info, count(*) as total_perfis
FROM instagram_profiles;

-- PASSO 4: Adicionar nova FK correta
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- PASSO 5: Verificar se funcionou
SELECT
    'CONSTRAINT NOVA:' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS aponta_para_tabela
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audits'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'profile_id';

-- PASSO 6: Testar INSERT
DO $$
DECLARE
    test_profile_id UUID;
    test_audit_id UUID;
BEGIN
    -- Pegar um profile_id existente
    SELECT id INTO test_profile_id FROM instagram_profiles LIMIT 1;

    IF test_profile_id IS NULL THEN
        RAISE NOTICE 'ERRO: Nenhum perfil encontrado na tabela instagram_profiles!';
    ELSE
        RAISE NOTICE 'Testando INSERT com profile_id: %', test_profile_id;

        -- Tentar fazer INSERT
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
            0,
            '{"test": true}'::jsonb
        ) RETURNING id INTO test_audit_id;

        RAISE NOTICE 'SUCESSO! Audit de teste criado: %', test_audit_id;

        -- Remover audit de teste
        DELETE FROM audits WHERE id = test_audit_id;
        RAISE NOTICE 'Audit de teste removido.';
    END IF;
END $$;
