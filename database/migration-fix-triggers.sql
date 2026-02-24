-- ============================================
-- MIGRAÇÃO: Corrigir triggers após migração
-- ============================================
--
-- PROBLEMA:
--   Triggers e functions ainda referenciam tabela 'profiles'
--   Mas a tabela foi migrada para 'instagram_profiles'
--
-- SOLUÇÃO:
--   Atualizar todas as functions e triggers para usar
--   'instagram_profiles' em vez de 'profiles'
--
-- ============================================

-- 1. REMOVER triggers antigos da tabela audits
DROP TRIGGER IF EXISTS audit_created ON audits;
DROP TRIGGER IF EXISTS auto_comparison ON audits;

-- 2. REMOVER function antiga
DROP FUNCTION IF EXISTS increment_profile_audits();

-- 3. RECRIAR function corrigida (usando instagram_profiles)
CREATE OR REPLACE FUNCTION increment_profile_audits()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE instagram_profiles
  SET total_audits = total_audits + 1,
      last_scraped_at = NEW.audit_date
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. RECRIAR trigger
CREATE TRIGGER audit_created AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION increment_profile_audits();

-- 5. CORRIGIR function auto_create_comparison (se existir)
DROP FUNCTION IF EXISTS auto_create_comparison();

CREATE OR REPLACE FUNCTION auto_create_comparison()
RETURNS TRIGGER AS $$
DECLARE
  prev_audit audits%ROWTYPE;
BEGIN
  -- Buscar auditoria anterior
  SELECT * INTO prev_audit
  FROM audits
  WHERE profile_id = NEW.profile_id
    AND id != NEW.id
    AND audit_date < NEW.audit_date
    AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1;

  -- Se encontrou, criar comparação
  IF prev_audit.id IS NOT NULL THEN
    INSERT INTO comparisons (
      profile_id,
      audit_before_id,
      audit_after_id,
      days_between,
      date_before,
      date_after,
      growth_followers,
      growth_followers_pct,
      growth_engagement,
      improvement_overall
    ) VALUES (
      NEW.profile_id,
      prev_audit.id,
      NEW.id,
      EXTRACT(DAY FROM (NEW.audit_date - prev_audit.audit_date)),
      prev_audit.audit_date,
      NEW.audit_date,
      NEW.snapshot_followers - prev_audit.snapshot_followers,
      CASE
        WHEN prev_audit.snapshot_followers > 0
        THEN ((NEW.snapshot_followers - prev_audit.snapshot_followers)::NUMERIC / prev_audit.snapshot_followers * 100)
        ELSE 0
      END,
      NEW.engagement_rate - prev_audit.engagement_rate,
      NEW.score_overall - prev_audit.score_overall
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. RECRIAR trigger de comparação (se necessário)
CREATE TRIGGER auto_comparison AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION auto_create_comparison();

-- 7. VERIFICAR se comparisons existe e tem FK correta
-- (Se a tabela comparisons existir, corrigir FK também)

DO $$
BEGIN
  -- Verificar se tabela comparisons existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comparisons') THEN
    -- Remover FK antiga
    ALTER TABLE comparisons
    DROP CONSTRAINT IF EXISTS comparisons_profile_id_fkey;

    -- Adicionar FK correta
    ALTER TABLE comparisons
    ADD CONSTRAINT comparisons_profile_id_fkey
    FOREIGN KEY (profile_id)
    REFERENCES instagram_profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- COMENTÁRIOS & DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION increment_profile_audits IS 'Incrementa total_audits em instagram_profiles (atualizado após migração)';
COMMENT ON FUNCTION auto_create_comparison IS 'Auto-cria comparações entre auditorias (atualizado após migração)';

-- ============================================
-- VERIFICAÇÃO (Execute após migração)
-- ============================================

-- Ver triggers atualizados
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'audits';

-- Ver functions atualizadas
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%profile%'
  AND routine_type = 'FUNCTION';
