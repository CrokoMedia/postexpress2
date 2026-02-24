-- ============================================
-- CORREÇÃO URGENTE: Foreign Key de audits
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar qual tabela a foreign key está apontando
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS referencias_tabela
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audits'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'profile_id';

-- 2. Remover TODAS as foreign keys de profile_id
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'audits'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%profile%'
    LOOP
        EXECUTE 'ALTER TABLE audits DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
        RAISE NOTICE 'Removida constraint: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- 3. Adicionar nova foreign key correta
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;

-- 4. Verificar se funcionou
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS referencias_tabela_agora
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'audits'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'profile_id';

-- ✅ Se aparecer "referencias_tabela_agora" = "instagram_profiles", está CORRETO!
