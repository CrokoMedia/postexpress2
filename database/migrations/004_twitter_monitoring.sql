-- ========================================
-- Migration 004: Twitter Monitoring System
-- ========================================
-- Created: 2026-02-19
-- Epic: EPIC-001 - Twitter Stream API Integration
-- Story: 1.2 - Schema Supabase para Twitter Monitoring
-- ========================================

-- Criar função helper para updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 1. TABELA: twitter_experts
-- Armazena experts monitorados do Twitter
-- ========================================

CREATE TABLE IF NOT EXISTS twitter_experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do Expert
  twitter_username TEXT NOT NULL UNIQUE,
  twitter_user_id TEXT,
  display_name TEXT,

  -- Monitoramento
  is_active BOOLEAN DEFAULT TRUE,
  themes TEXT[] DEFAULT '{}', -- Ex: ['marketing', 'sales', 'frameworks']

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- FK para auth.users (futuro)

  -- Constraints
  CONSTRAINT twitter_username_format CHECK (twitter_username ~ '^[A-Za-z0-9_]{1,15}$')
);

-- Comentários para documentação
COMMENT ON TABLE twitter_experts IS 'Experts do Twitter monitorados pelo sistema';
COMMENT ON COLUMN twitter_experts.twitter_username IS 'Username do Twitter (sem @)';
COMMENT ON COLUMN twitter_experts.themes IS 'Temas de interesse para filtrar tweets';
COMMENT ON COLUMN twitter_experts.is_active IS 'Se o monitoramento está ativo';

-- Índices
CREATE INDEX IF NOT EXISTS idx_twitter_experts_username ON twitter_experts(twitter_username);
CREATE INDEX IF NOT EXISTS idx_twitter_experts_active ON twitter_experts(is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_twitter_experts_updated_at ON twitter_experts;
CREATE TRIGGER update_twitter_experts_updated_at
  BEFORE UPDATE ON twitter_experts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. TABELA: twitter_stream_rules
-- Regras ativas no Twitter Filtered Stream API
-- ========================================

CREATE TABLE IF NOT EXISTS twitter_stream_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Regra do Twitter
  twitter_rule_id TEXT UNIQUE, -- ID retornado pela API
  rule_value TEXT NOT NULL, -- Ex: "from:garyvee (marketing OR sales)"
  rule_tag TEXT NOT NULL, -- Ex: "garyvee-marketing"

  -- Associação
  expert_id UUID REFERENCES twitter_experts(id) ON DELETE CASCADE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ, -- Última vez que sincronizou com API

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE twitter_stream_rules IS 'Regras ativas no Twitter Filtered Stream API';
COMMENT ON COLUMN twitter_stream_rules.twitter_rule_id IS 'ID da regra retornado pela API do Twitter';
COMMENT ON COLUMN twitter_stream_rules.rule_value IS 'Regra completa (max 512 caracteres)';
COMMENT ON COLUMN twitter_stream_rules.rule_tag IS 'Tag identificadora da regra';

-- Índices
CREATE INDEX IF NOT EXISTS idx_twitter_rules_expert ON twitter_stream_rules(expert_id);
CREATE INDEX IF NOT EXISTS idx_twitter_rules_active ON twitter_stream_rules(is_active) WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_twitter_rules_tag ON twitter_stream_rules(rule_tag);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_twitter_rules_updated_at ON twitter_stream_rules;
CREATE TRIGGER update_twitter_rules_updated_at
  BEFORE UPDATE ON twitter_stream_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. TABELA: twitter_content_updates
-- Tweets capturados pelo stream em tempo real
-- ========================================

CREATE TABLE IF NOT EXISTS twitter_content_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do Tweet
  tweet_id TEXT NOT NULL UNIQUE,
  tweet_text TEXT NOT NULL,
  tweet_url TEXT NOT NULL,

  -- Autor
  expert_id UUID REFERENCES twitter_experts(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  author_display_name TEXT,

  -- Métricas (snapshot no momento da captura)
  likes_count INTEGER DEFAULT 0,
  retweets_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,

  -- Metadados
  published_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(), -- Quando o stream detectou

  -- Classificação (futuro - IA)
  themes TEXT[], -- Ex: ['marketing', 'frameworks']
  sentiment TEXT, -- 'positive' | 'neutral' | 'negative'

  -- Notificação
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,

  -- JSON completo (backup)
  raw_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE twitter_content_updates IS 'Tweets capturados pelo stream em tempo real';
COMMENT ON COLUMN twitter_content_updates.tweet_id IS 'ID único do tweet no Twitter';
COMMENT ON COLUMN twitter_content_updates.detected_at IS 'Timestamp de quando o worker detectou o tweet';
COMMENT ON COLUMN twitter_content_updates.themes IS 'Temas classificados automaticamente (IA)';
COMMENT ON COLUMN twitter_content_updates.raw_data IS 'JSON completo retornado pela API (backup)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_twitter_updates_expert ON twitter_content_updates(expert_id);
CREATE INDEX IF NOT EXISTS idx_twitter_updates_detected ON twitter_content_updates(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_updates_published ON twitter_content_updates(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_updates_notified ON twitter_content_updates(notified) WHERE notified = FALSE;
CREATE INDEX IF NOT EXISTS idx_twitter_updates_themes ON twitter_content_updates USING GIN(themes);

-- Full-text search (português)
CREATE INDEX IF NOT EXISTS idx_twitter_updates_text_search ON twitter_content_updates
  USING GIN(to_tsvector('portuguese', tweet_text));

-- ========================================
-- 4. TABELA: twitter_monitoring_log
-- Log de atividades do sistema de monitoramento
-- ========================================

CREATE TABLE IF NOT EXISTS twitter_monitoring_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tipo de evento
  event_type TEXT NOT NULL, -- 'stream_connect' | 'stream_disconnect' | 'rule_added' | 'rule_removed' | 'tweet_detected' | 'error'

  -- Contexto
  expert_id UUID REFERENCES twitter_experts(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES twitter_stream_rules(id) ON DELETE SET NULL,
  tweet_id TEXT,

  -- Detalhes
  success BOOLEAN,
  error_message TEXT,
  metadata JSONB, -- Dados adicionais

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE twitter_monitoring_log IS 'Log de eventos do sistema de monitoramento Twitter';
COMMENT ON COLUMN twitter_monitoring_log.event_type IS 'Tipo de evento (stream_connect, tweet_detected, error, etc.)';
COMMENT ON COLUMN twitter_monitoring_log.metadata IS 'Dados adicionais do evento (JSON)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_twitter_log_event_type ON twitter_monitoring_log(event_type);
CREATE INDEX IF NOT EXISTS idx_twitter_log_created ON twitter_monitoring_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_log_errors ON twitter_monitoring_log(success) WHERE success = FALSE;

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE twitter_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_stream_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_content_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_monitoring_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (Público - anon key)
CREATE POLICY "Public read twitter_experts" ON twitter_experts
  FOR SELECT USING (TRUE);

CREATE POLICY "Public read twitter_updates" ON twitter_content_updates
  FOR SELECT USING (TRUE);

-- Políticas de Escrita (Somente service_role)
CREATE POLICY "Service role write twitter_experts" ON twitter_experts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role write twitter_rules" ON twitter_stream_rules
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role write twitter_updates" ON twitter_content_updates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role write twitter_log" ON twitter_monitoring_log
  FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- 6. SEEDS DE TESTE (Opcional - para desenvolvimento)
-- ========================================

-- Descomentar para inserir dados de teste
/*
-- Inserir expert de teste
INSERT INTO twitter_experts (twitter_username, display_name, themes, is_active)
VALUES ('garyvee', 'Gary Vaynerchuk', ARRAY['marketing', 'social media', 'entrepreneurship'], TRUE)
ON CONFLICT (twitter_username) DO NOTHING;

-- Inserir regra de teste
INSERT INTO twitter_stream_rules (rule_value, rule_tag, expert_id)
SELECT
  'from:garyvee (marketing OR content)',
  'garyvee-marketing',
  id
FROM twitter_experts
WHERE twitter_username = 'garyvee'
ON CONFLICT (rule_tag) DO NOTHING;
*/

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Verificar tabelas criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE 'twitter_%';

  RAISE NOTICE '✅ Migration 004 completa: % tabelas Twitter criadas', table_count;
END $$;
