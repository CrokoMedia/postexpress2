-- ============================================
-- MIGRATION 003: Content Generation Schedules
-- Adiciona sistema de agendamento de geração de conteúdo
-- ============================================

-- Enum para status do agendamento
CREATE TYPE schedule_status_enum AS ENUM (
  'pending',      -- Aguardando horário
  'processing',   -- Gerando conteúdo
  'completed',    -- Concluído
  'failed',       -- Falhou
  'cancelled'     -- Cancelado pelo usuário
);

-- Tabela de agendamentos de geração de conteúdo
CREATE TABLE content_generation_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Vinculação
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Configuração do agendamento
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Quando gerar
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 20), -- Quantos carrosséis gerar
  custom_theme TEXT,  -- Tema personalizado (opcional)

  -- Status e rastreamento
  status schedule_status_enum DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,  -- Número de tentativas
  max_attempts INTEGER DEFAULT 3,

  -- Resultado
  content_suggestion_id UUID REFERENCES content_suggestions(id),  -- Link para o conteúdo gerado
  error_message TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_scheduled_future CHECK (scheduled_at > created_at)
);

-- Indexes
CREATE INDEX idx_schedules_status ON content_generation_schedules(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_schedules_scheduled_at ON content_generation_schedules(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_schedules_audit_id ON content_generation_schedules(audit_id);
CREATE INDEX idx_schedules_profile_id ON content_generation_schedules(profile_id);
CREATE INDEX idx_schedules_created_at ON content_generation_schedules(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schedules_timestamp
BEFORE UPDATE ON content_generation_schedules
FOR EACH ROW
EXECUTE FUNCTION update_schedules_updated_at();

-- View para agendamentos ativos (não concluídos/cancelados)
CREATE VIEW active_schedules AS
SELECT
  s.*,
  p.username,
  p.full_name,
  a.audit_date,
  a.score_overall
FROM content_generation_schedules s
JOIN profiles p ON s.profile_id = p.id
JOIN audits a ON s.audit_id = a.id
WHERE s.status NOT IN ('completed', 'cancelled', 'failed')
ORDER BY s.scheduled_at ASC;

-- RLS (Row Level Security) - ajustar conforme sua autenticação
ALTER TABLE content_generation_schedules ENABLE ROW LEVEL SECURITY;

-- Policy de leitura (todos podem ler seus próprios agendamentos)
CREATE POLICY "Users can view their own schedules"
  ON content_generation_schedules
  FOR SELECT
  USING (true);  -- Ajustar quando tiver autenticação

-- Policy de inserção
CREATE POLICY "Users can create schedules"
  ON content_generation_schedules
  FOR INSERT
  WITH CHECK (true);  -- Ajustar quando tiver autenticação

-- Policy de atualização
CREATE POLICY "Users can update their own schedules"
  ON content_generation_schedules
  FOR UPDATE
  USING (true);  -- Ajustar quando tiver autenticação

-- Policy de deleção
CREATE POLICY "Users can delete their own schedules"
  ON content_generation_schedules
  FOR DELETE
  USING (true);  -- Ajustar quando tiver autenticação

-- Comentários
COMMENT ON TABLE content_generation_schedules IS 'Agendamentos de geração automática de conteúdo';
COMMENT ON COLUMN content_generation_schedules.quantity IS 'Quantidade de carrosséis a gerar (1-20)';
COMMENT ON COLUMN content_generation_schedules.scheduled_at IS 'Data/hora agendada para geração';
COMMENT ON COLUMN content_generation_schedules.custom_theme IS 'Tema personalizado opcional para geração';
COMMENT ON COLUMN content_generation_schedules.attempts IS 'Número de tentativas de processamento';
