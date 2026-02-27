-- ============================================
-- Criar Tabela de Agendamentos (se não existir)
-- ============================================
-- Execute no Supabase SQL Editor se der erro de tabela não encontrada

CREATE TABLE IF NOT EXISTS content_generation_schedules (
  id BIGSERIAL PRIMARY KEY,

  -- Relacionamentos
  profile_id BIGINT NOT NULL REFERENCES instagram_profiles(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,

  -- Dados do agendamento
  scheduled_at TIMESTAMPTZ NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  custom_theme TEXT,

  -- Status e controle
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,

  -- Processamento
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,

  -- Resultado
  content_suggestion_id BIGINT REFERENCES content_suggestions(id) ON DELETE SET NULL,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_schedules_status ON content_generation_schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_at ON content_generation_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_schedules_profile_id ON content_generation_schedules(profile_id);
CREATE INDEX IF NOT EXISTS idx_schedules_audit_id ON content_generation_schedules(audit_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_schedules_updated_at ON content_generation_schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON content_generation_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE content_generation_schedules IS 'Agendamentos de geração automática de conteúdo';
COMMENT ON COLUMN content_generation_schedules.status IS 'pending | processing | completed | failed';
COMMENT ON COLUMN content_generation_schedules.attempts IS 'Número de tentativas de processamento (máx 3)';
