-- ============================================
-- Teste Completo do CRON - Criar Agendamento Fake
-- ============================================
-- Execute no Supabase SQL Editor

-- 1. Verificar se há perfis e auditorias disponíveis
SELECT
  p.id as profile_id,
  p.username,
  a.id as audit_id,
  a.score_overall
FROM instagram_profiles p
LEFT JOIN audits a ON a.profile_id = p.id
LIMIT 5;

-- ============================================
-- 2. Criar um agendamento de TESTE
-- ============================================
-- IMPORTANTE: Substitua os IDs pelos valores reais da query acima

INSERT INTO content_generation_schedules (
  profile_id,
  audit_id,
  scheduled_at,
  quantity,
  status,
  custom_theme
) VALUES (
  1,  -- ← SUBSTITUA pelo profile_id real
  1,  -- ← SUBSTITUA pelo audit_id real
  NOW() - INTERVAL '1 minute',  -- Já passou (será processado imediatamente)
  1,  -- Gerar 1 conteúdo
  'pending',
  'Teste de CRON - pode ignorar este conteúdo'
)
RETURNING id, scheduled_at, status;

-- ============================================
-- 3. Executar o CRON manualmente
-- ============================================
-- No cron-job.org: Clique em ▶️ Run now

-- OU via terminal:
-- curl -X POST https://crokolab-production.up.railway.app/api/cron/process-schedules \
--   -H "Authorization: Bearer WCyjvNmpBH1y0jDvOLM9TFSvhca7ZnzCKvEj/ruRhco="

-- ============================================
-- 4. Verificar se foi processado
-- ============================================
SELECT
  id,
  status,
  attempts,
  scheduled_at,
  processing_started_at,
  processing_completed_at,
  content_suggestion_id,
  error_message
FROM content_generation_schedules
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- Resultados Esperados:
-- ============================================
-- ANTES de executar CRON:
--   status: 'pending'
--   attempts: 0
--   processing_started_at: NULL
--   content_suggestion_id: NULL

-- DEPOIS de executar CRON (sucesso):
--   status: 'completed'
--   attempts: 1
--   processing_started_at: [timestamp]
--   processing_completed_at: [timestamp]
--   content_suggestion_id: [ID do conteúdo gerado]

-- DEPOIS de executar CRON (falha):
--   status: 'failed' (após 3 tentativas) ou 'pending' (para retry)
--   attempts: 1, 2, ou 3
--   error_message: [mensagem de erro]

-- ============================================
-- 5. Ver o conteúdo gerado (se sucesso)
-- ============================================
SELECT
  cs.id,
  cs.content_json->>'title' as titulo,
  cs.created_by_schedule,
  cs.created_at
FROM content_suggestions cs
WHERE cs.created_by_schedule = true
ORDER BY cs.created_at DESC
LIMIT 3;

-- ============================================
-- 6. Limpar dados de teste (OPCIONAL)
-- ============================================
-- DELETE FROM content_generation_schedules
-- WHERE custom_theme LIKE '%Teste de CRON%';
