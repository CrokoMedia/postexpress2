-- ============================================
-- SCRIPT COMPLETO: VERIFICAR E CORRIGIR DATABASE
-- ============================================
--
-- Este script:
-- 1. Verifica tabelas existentes
-- 2. Verifica foreign keys da tabela audits
-- 3. Corrige FK se necessário
-- 4. Valida resultado final
--
-- ⚠️  IMPORTANTE: Execute este script no Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/sql/new
--
-- ============================================

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════╗'
\echo '║                    VERIFICAÇÃO E CORREÇÃO DE DATABASE                ║'
\echo '║                          Croko Lab - 2026-02-24                      ║'
\echo '╚══════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================
-- PARTE 1: VERIFICAR TABELAS EXISTENTES
-- ============================================

\echo ''
\echo '1️⃣  VERIFICANDO TABELAS EXISTENTES'
\echo '────────────────────────────────────────────────────────────────────────'

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') AS total_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'instagram_profiles', 'audits', 'posts')
ORDER BY table_name;

\echo ''
\echo '✓ Se "instagram_profiles" apareceu acima: ✅ OK'
\echo '✓ Se "audits" apareceu acima: ✅ OK'
\echo '✗ Se "profiles" apareceu: ⚠️  Pode ser tabela antiga (será ignorada)'
\echo ''

-- ============================================
-- PARTE 2: VERIFICAR FOREIGN KEYS ATUAIS
-- ============================================

\echo ''
\echo '2️⃣  VERIFICANDO FOREIGN KEYS DA TABELA AUDITS'
\echo '────────────────────────────────────────────────────────────────────────'

SELECT
  tc.constraint_name AS "Nome da Constraint",
  kcu.column_name AS "Coluna",
  ccu.table_name AS "Tabela Referenciada",
  ccu.column_name AS "Coluna Referenciada",
  rc.delete_rule AS "ON DELETE",
  rc.update_rule AS "ON UPDATE"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'audits'
  AND tc.table_schema = 'public'
  AND kcu.column_name = 'profile_id'
ORDER BY kcu.column_name;

\echo ''
\echo '✓ Se "Tabela Referenciada" = "instagram_profiles": ✅ JÁ ESTÁ CORRETO!'
\echo '✗ Se "Tabela Referenciada" = "profiles": ❌ PRECISA CORRIGIR (execute PARTE 3)'
\echo '✗ Se nenhum resultado apareceu: ❌ FK NÃO EXISTE (execute PARTE 3)'
\echo ''

-- ============================================
-- PARTE 3: CORRIGIR FOREIGN KEY
-- ============================================
--
-- ⚠️  ATENÇÃO: Só execute esta parte se a verificação acima mostrou que:
--    - FK aponta para "profiles" (tabela errada)
--    - OU nenhuma FK existe para audits.profile_id
--
-- Se já está apontando para "instagram_profiles", PULE esta parte!
--
-- ============================================

\echo ''
\echo '3️⃣  CORRIGINDO FOREIGN KEY (se necessário)'
\echo '────────────────────────────────────────────────────────────────────────'
\echo ''
\echo '⚠️  Se a verificação acima mostrou que FK JÁ aponta para "instagram_profiles",'
\echo '    você pode PULAR os comandos abaixo (já está correto).'
\echo ''
\echo 'Se precisa corrigir, execute os comandos abaixo:'
\echo ''

-- Remover constraints antigas (tentando todos os nomes possíveis)
-- OBS: IF EXISTS garante que não dará erro se não existir

DO $$
BEGIN
  -- Tentar remover constraint com nome padrão
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audits_profile_id_fkey'
    AND table_name = 'audits'
  ) THEN
    ALTER TABLE audits DROP CONSTRAINT audits_profile_id_fkey;
    RAISE NOTICE '✓ Removida constraint: audits_profile_id_fkey';
  END IF;

  -- Tentar remover constraint com nome alternativo 1
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_audits_profile'
    AND table_name = 'audits'
  ) THEN
    ALTER TABLE audits DROP CONSTRAINT fk_audits_profile;
    RAISE NOTICE '✓ Removida constraint: fk_audits_profile';
  END IF;

  -- Tentar remover constraint com nome alternativo 2
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audits_profile_id_profiles_id_fk'
    AND table_name = 'audits'
  ) THEN
    ALTER TABLE audits DROP CONSTRAINT audits_profile_id_profiles_id_fk;
    RAISE NOTICE '✓ Removida constraint: audits_profile_id_profiles_id_fk';
  END IF;
END $$;

-- Adicionar nova foreign key apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;

-- Adicionar comentário explicativo
COMMENT ON CONSTRAINT audits_profile_id_fkey ON audits
IS 'Foreign key para instagram_profiles (perfis do Instagram auditados). Migração: 2026-02-24';

\echo ''
\echo '✅ Foreign key corrigida com sucesso!'
\echo '   - audits.profile_id agora aponta para instagram_profiles.id'
\echo '   - ON DELETE CASCADE ativado (se perfil for deletado, auditorias também são)'
\echo ''

-- ============================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ============================================

\echo ''
\echo '4️⃣  VERIFICAÇÃO FINAL'
\echo '────────────────────────────────────────────────────────────────────────'

-- Re-verificar foreign keys
SELECT
  tc.constraint_name AS "Nome da Constraint",
  kcu.column_name AS "Coluna",
  ccu.table_name AS "Tabela Referenciada",
  ccu.column_name AS "Coluna Referenciada",
  rc.delete_rule AS "ON DELETE",
  rc.update_rule AS "ON UPDATE"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'audits'
  AND tc.table_schema = 'public'
  AND kcu.column_name = 'profile_id'
ORDER BY kcu.column_name;

\echo ''
\echo '✅ Se "Tabela Referenciada" = "instagram_profiles": PERFEITO!'
\echo '✅ Se "ON DELETE" = "CASCADE": PERFEITO!'
\echo ''

-- Testar relacionamento com dados reais
\echo ''
\echo '5️⃣  TESTANDO RELACIONAMENTO COM DADOS REAIS'
\echo '────────────────────────────────────────────────────────────────────────'

SELECT
  a.id AS audit_id,
  a.profile_id,
  ip.username AS instagram_username,
  ip.followers_count,
  a.score_overall,
  a.posts_analyzed,
  a.created_at::date AS audit_date
FROM audits a
JOIN instagram_profiles ip ON a.profile_id = ip.id
ORDER BY a.created_at DESC
LIMIT 5;

\echo ''
\echo '✅ Se apareceram resultados acima: RELACIONAMENTO FUNCIONANDO!'
\echo '✗ Se deu erro: Algo está errado, verifique os passos anteriores'
\echo ''

-- ============================================
-- ESTATÍSTICAS FINAIS
-- ============================================

\echo ''
\echo '6️⃣  ESTATÍSTICAS DO DATABASE'
\echo '────────────────────────────────────────────────────────────────────────'

SELECT
  'instagram_profiles' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(DISTINCT username) AS usernames_unicos,
  SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) AS perfis_verificados
FROM instagram_profiles
WHERE deleted_at IS NULL

UNION ALL

SELECT
  'audits' AS tabela,
  COUNT(*) AS total_registros,
  COUNT(DISTINCT profile_id) AS perfis_auditados,
  ROUND(AVG(score_overall), 1) AS score_medio
FROM audits
WHERE deleted_at IS NULL;

\echo ''
\echo '╔══════════════════════════════════════════════════════════════════════╗'
\echo '║                        ✅ VERIFICAÇÃO CONCLUÍDA                       ║'
\echo '╚══════════════════════════════════════════════════════════════════════╝'
\echo ''
\echo '📝 Próximos passos:'
\echo '   1. Reinicie o servidor Next.js: npm run dev'
\echo '   2. Teste a API: http://localhost:3001/api/profiles'
\echo '   3. Teste o dashboard: http://localhost:3001/dashboard'
\echo '   4. Crie uma nova auditoria para validar'
\echo ''
\echo '💾 Backup: Supabase faz backup automático, mas você pode exportar manualmente:'
\echo '   https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/database/backups'
\echo ''

-- ============================================
-- FIM DO SCRIPT
-- ============================================
