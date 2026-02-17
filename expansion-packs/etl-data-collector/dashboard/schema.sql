-- ============================================================
-- ETL Mind Cloner — Schema Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Mentes sendo clonadas
CREATE TABLE IF NOT EXISTS etl_minds (
  id TEXT PRIMARY KEY,                         -- ex: "gary_vaynerchuk"
  display_name TEXT NOT NULL,                  -- ex: "Gary Vaynerchuk"
  status TEXT DEFAULT 'pending',               -- pending | collecting | partial | complete
  pipeline_phase TEXT,                         -- viability | research | analysis | synthesis | system_prompt | testing
  purpose TEXT,                                -- para qual projeto este clone está sendo feito
  collected_sources INT DEFAULT 0,
  total_sources INT DEFAULT 0,
  failed_sources INT DEFAULT 0,
  total_words BIGINT DEFAULT 0,
  audio_minutes INT DEFAULT 0,
  sources_by_type JSONB DEFAULT '{}',          -- { "youtube": 5, "blog": 12, "pdf": 4, ... }
  assemblyai_minutes_used INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log cronológico de cada coleta realizada
CREATE TABLE IF NOT EXISTS etl_collection_log (
  id BIGSERIAL PRIMARY KEY,
  mind_id TEXT,
  source_type TEXT,                            -- youtube | blog | pdf | audio | tiktok | instagram | twitter | linkedin
  title TEXT,
  status TEXT,                                 -- success | failed | skipped
  api_used TEXT,                               -- youtube-transcript | assemblyai | apify | cheerio | pdf-parse
  duration_or_size TEXT,                       -- ex: "2.341 palavras" ou "45min"
  plan TEXT DEFAULT 'free',                    -- free | paid
  error_message TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumo de APIs externas por coleta
CREATE TABLE IF NOT EXISTS etl_api_usage (
  id BIGSERIAL PRIMARY KEY,
  api_name TEXT NOT NULL,                      -- assemblyai | apify | youtube-transcript
  mind_id TEXT,
  operation TEXT,                              -- transcribe | scrape | extract-captions
  units_used NUMERIC,                          -- horas para assemblyai, compute units para apify
  unit_type TEXT,                              -- 'hours' | 'minutes' | 'compute_units' | 'requests'
  cost_usd NUMERIC,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Índices para performance ───────────────────────────────

CREATE INDEX IF NOT EXISTS idx_collection_log_mind ON etl_collection_log (mind_id);
CREATE INDEX IF NOT EXISTS idx_collection_log_logged_at ON etl_collection_log (logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_api ON etl_api_usage (api_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_logged_at ON etl_api_usage (logged_at DESC);

-- ─── RLS (Row Level Security) ───────────────────────────────
-- Habilitar RLS nas tabelas
ALTER TABLE etl_minds ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_collection_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_api_usage ENABLE ROW LEVEL SECURITY;

-- Política: leitura pública (para o dashboard HTML com anon key)
CREATE POLICY "etl_minds_public_read" ON etl_minds
  FOR SELECT USING (true);

CREATE POLICY "etl_collection_log_public_read" ON etl_collection_log
  FOR SELECT USING (true);

CREATE POLICY "etl_api_usage_public_read" ON etl_api_usage
  FOR SELECT USING (true);

-- Política: escrita apenas com service_role key (sync-to-supabase.js)
CREATE POLICY "etl_minds_service_write" ON etl_minds
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "etl_collection_log_service_write" ON etl_collection_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "etl_api_usage_service_write" ON etl_api_usage
  FOR ALL USING (auth.role() = 'service_role');

-- ─── Dados iniciais ─────────────────────────────────────────

-- Inserir gary_vaynerchuk como primeira mente
INSERT INTO etl_minds (id, display_name, status, purpose)
VALUES ('gary_vaynerchuk', 'Gary Vaynerchuk', 'pending', 'Post Express — Consultor de conteúdo')
ON CONFLICT (id) DO NOTHING;
