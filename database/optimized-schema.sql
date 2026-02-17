-- ============================================
-- SCHEMA OTIMIZADO - INSTAGRAM AUDIT SYSTEM
-- PostgreSQL 14+ / Supabase
-- Version: 2.0
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Para full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- Para indexes compostos GIN

-- ============================================
-- ENUMS - Tipos de dados fixos
-- ============================================

CREATE TYPE post_type_enum AS ENUM ('Image', 'Video', 'Sidecar', 'Reels', 'Story');
CREATE TYPE audit_type_enum AS ENUM ('express', 'complete', 'quick', 'deep');
CREATE TYPE comment_category_enum AS ENUM ('perguntas', 'elogios', 'duvidas', 'experiencias', 'criticas', 'outros');
CREATE TYPE queue_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE audit_classification_enum AS ENUM ('CRÍTICO', 'RUIM', 'MEDIANO', 'BOM', 'EXCELENTE', 'EXTRAORDINÁRIO');

-- ============================================
-- 1. PROFILES - Dados dos Perfis
-- ============================================
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Identificação
  username VARCHAR(100) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9._]+$'),
  full_name VARCHAR(255),
  biography TEXT,
  external_url VARCHAR(500),

  -- Métricas do perfil
  followers_count INTEGER CHECK (followers_count >= 0),
  following_count INTEGER CHECK (following_count >= 0),
  posts_count INTEGER CHECK (posts_count >= 0),

  -- URLs de imagem
  profile_pic_url TEXT,
  profile_pic_url_hd TEXT,
  profile_pic_cloudinary_url TEXT,  -- URL do Cloudinary (upload local)
  url VARCHAR(255),

  -- Flags
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_business_account BOOLEAN DEFAULT FALSE,

  -- Categorias
  business_category VARCHAR(100),
  category_enum VARCHAR(50),

  -- Contato
  contact_phone_number VARCHAR(50),
  contact_email VARCHAR(255),

  -- Metadados
  first_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_audits INTEGER DEFAULT 0,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes profiles
CREATE INDEX idx_profiles_username ON profiles(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_verified ON profiles(is_verified) WHERE is_verified = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_followers ON profiles(followers_count DESC NULLS LAST);
CREATE INDEX idx_profiles_last_scraped ON profiles(last_scraped_at DESC);

-- Full-text search no perfil
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_profiles_biography_trgm ON profiles USING GIN (biography gin_trgm_ops);

-- ============================================
-- 2. AUDITS - Auditorias Completas
-- ============================================
CREATE TABLE audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Data da auditoria
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audit_type audit_type_enum DEFAULT 'express',
  posts_analyzed INTEGER CHECK (posts_analyzed >= 0),

  -- Performance da auditoria
  audit_duration_seconds INTEGER,      -- Tempo total de processamento
  gemini_cost_usd NUMERIC(10,4),       -- Custo de OCR (Gemini)
  total_api_calls INTEGER,              -- Total de chamadas API
  total_tokens_used INTEGER,            -- Total de tokens (LLM)

  -- Scores gerais
  score_overall INTEGER CHECK (score_overall BETWEEN 0 AND 100),
  classification audit_classification_enum,

  -- Scores por dimensão (5 auditores)
  score_behavior INTEGER CHECK (score_behavior BETWEEN 0 AND 100),
  score_copy INTEGER CHECK (score_copy BETWEEN 0 AND 100),
  score_offers INTEGER CHECK (score_offers BETWEEN 0 AND 100),
  score_metrics INTEGER CHECK (score_metrics BETWEEN 0 AND 100),
  score_anomalies INTEGER CHECK (score_anomalies BETWEEN 0 AND 100),

  -- Métricas de engajamento (no momento da auditoria)
  engagement_rate NUMERIC(6,3) CHECK (engagement_rate >= 0),  -- Até 999.999%
  total_likes INTEGER CHECK (total_likes >= 0),
  total_comments INTEGER CHECK (total_comments >= 0),
  avg_likes_per_post INTEGER CHECK (avg_likes_per_post >= 0),
  avg_comments_per_post INTEGER CHECK (avg_comments_per_post >= 0),

  -- Métricas do perfil (snapshot no momento)
  snapshot_followers INTEGER,
  snapshot_following INTEGER,
  snapshot_posts_count INTEGER,

  -- Dados completos (JSONB)
  raw_json JSONB,                       -- Auditoria completa em JSON
  top_strengths JSONB,                  -- Array de pontos fortes
  critical_problems JSONB,              -- Array de problemas
  quick_wins JSONB,                     -- Array de quick wins
  strategic_moves JSONB,                -- Array de strategic moves
  hypotheses JSONB,                     -- Array de hipóteses

  -- Análise de texto dos auditores (para busca)
  audit_summary TEXT,                   -- Resumo executivo
  search_vector tsvector,               -- Full-text search vector

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes audits
CREATE INDEX idx_audits_profile_id ON audits(profile_id, audit_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_audits_date ON audits(audit_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_audits_score ON audits(score_overall DESC NULLS LAST);
CREATE INDEX idx_audits_classification ON audits(classification);
CREATE INDEX idx_audits_type ON audits(audit_type);

-- Index composto para queries comuns (perfil + score + data)
CREATE INDEX idx_audits_profile_score_date ON audits(profile_id, score_overall DESC, audit_date DESC);

-- JSONB indexes (GIN)
CREATE INDEX idx_audits_raw_json_gin ON audits USING GIN (raw_json);
CREATE INDEX idx_audits_strengths_gin ON audits USING GIN (top_strengths);
CREATE INDEX idx_audits_problems_gin ON audits USING GIN (critical_problems);

-- Full-text search
CREATE INDEX idx_audits_search_vector ON audits USING GIN (search_vector);

-- Trigger para atualizar search_vector
CREATE OR REPLACE FUNCTION audits_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.audit_summary, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.classification::text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION audits_search_vector_trigger();

-- ============================================
-- 3. POSTS - Posts Individuais
-- ============================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,

  -- Dados do post (Instagram)
  post_id VARCHAR(50),                  -- ID do Instagram (garantir unicidade)
  short_code VARCHAR(50),
  post_url TEXT NOT NULL,
  post_type post_type_enum,

  -- Conteúdo
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  accessibility_caption TEXT,           -- Alt text do Instagram
  location_name VARCHAR(255),

  -- Métricas
  likes_count INTEGER CHECK (likes_count >= 0),
  comments_count INTEGER CHECK (comments_count >= 0),
  video_view_count INTEGER,             -- Para vídeos
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Timestamp do post
  post_timestamp TIMESTAMP WITH TIME ZONE,

  -- Mídia
  display_url TEXT,
  images TEXT[],                        -- Array de URLs
  video_url TEXT,                       -- URL do vídeo (se aplicável)

  -- OCR (Gemini Vision)
  ocr_total_images INTEGER DEFAULT 0,
  ocr_analyzed INTEGER DEFAULT 0,
  ocr_data JSONB,                       -- Array de análises OCR completas

  -- Comentários
  comments_total INTEGER DEFAULT 0,
  comments_relevant INTEGER DEFAULT 0,
  comments_raw JSONB,                   -- Array de comentários brutos
  comments_categorized JSONB,           -- {perguntas:[], elogios:[], etc}

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes posts
CREATE INDEX idx_posts_audit_id ON posts(audit_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_timestamp ON posts(post_timestamp DESC NULLS LAST);
CREATE INDEX idx_posts_likes ON posts(likes_count DESC NULLS LAST);
CREATE INDEX idx_posts_comments ON posts(comments_count DESC NULLS LAST);
CREATE INDEX idx_posts_type ON posts(post_type);

-- Index composto para queries comuns
CREATE INDEX idx_posts_audit_likes_ts ON posts(audit_id, likes_count DESC, post_timestamp DESC);

-- Unicidade do post_id do Instagram
CREATE UNIQUE INDEX idx_posts_instagram_id ON posts(post_id) WHERE post_id IS NOT NULL AND deleted_at IS NULL;

-- JSONB indexes
CREATE INDEX idx_posts_ocr_data_gin ON posts USING GIN (ocr_data);
CREATE INDEX idx_posts_comments_gin ON posts USING GIN (comments_categorized);

-- Full-text search no caption
CREATE INDEX idx_posts_caption_trgm ON posts USING GIN (caption gin_trgm_ops);

-- ============================================
-- 4. COMMENTS - Comentários Individuais
-- ============================================
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Dados do comentário
  comment_id VARCHAR(50),               -- ID do Instagram
  text TEXT NOT NULL CHECK (length(text) > 0),
  owner_username VARCHAR(100),
  owner_id VARCHAR(50),
  owner_profile_pic_url TEXT,
  owner_is_verified BOOLEAN DEFAULT FALSE,

  -- Threads (respostas)
  replied_to_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  reply_level INTEGER DEFAULT 0,        -- 0 = comentário raiz, 1+ = resposta

  -- Métricas
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),

  -- Categorização
  category comment_category_enum DEFAULT 'outros',
  is_relevant BOOLEAN DEFAULT TRUE,
  sentiment_score NUMERIC(3,2),         -- -1.00 a 1.00 (negativo a positivo)

  -- Timestamp
  comment_timestamp TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes comments
CREATE INDEX idx_comments_post_id ON comments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_category ON comments(category);
CREATE INDEX idx_comments_relevant ON comments(is_relevant) WHERE is_relevant = TRUE;
CREATE INDEX idx_comments_timestamp ON comments(comment_timestamp DESC NULLS LAST);
CREATE INDEX idx_comments_owner ON comments(owner_username);

-- Index composto para queries comuns
CREATE INDEX idx_comments_post_category_relevant ON comments(post_id, category, is_relevant);

-- Unicidade do comment_id do Instagram
CREATE UNIQUE INDEX idx_comments_instagram_id ON comments(comment_id) WHERE comment_id IS NOT NULL AND deleted_at IS NULL;

-- Full-text search no texto
CREATE INDEX idx_comments_text_trgm ON comments USING GIN (text gin_trgm_ops);

-- Index para threads
CREATE INDEX idx_comments_replied_to ON comments(replied_to_comment_id) WHERE replied_to_comment_id IS NOT NULL;

-- ============================================
-- 5. COMPARISONS - Comparações Temporais
-- ============================================
CREATE TABLE comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Auditorias sendo comparadas
  audit_before_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  audit_after_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,

  -- Período
  days_between INTEGER CHECK (days_between >= 0),
  date_before TIMESTAMP WITH TIME ZONE NOT NULL,
  date_after TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Crescimento de métricas
  growth_followers INTEGER,             -- Diferença absoluta
  growth_followers_pct NUMERIC(6,2),    -- Percentual
  growth_engagement NUMERIC(6,3),       -- Diferença em pontos percentuais
  growth_avg_likes INTEGER,
  growth_avg_comments INTEGER,

  -- Melhoria de scores
  improvement_overall INTEGER,          -- Diferença de pontos
  improvement_behavior INTEGER,
  improvement_copy INTEGER,
  improvement_offers INTEGER,
  improvement_metrics INTEGER,
  improvement_anomalies INTEGER,

  -- Análise qualitativa
  problems_solved JSONB,                -- Array de problemas resolvidos
  wins_implemented JSONB,               -- Quick wins implementados
  roi_summary TEXT,                     -- Resumo do ROI

  -- Dados completos
  full_comparison JSONB,                -- Comparação detalhada completa

  -- Validação
  CONSTRAINT valid_audit_order CHECK (date_after > date_before),
  CONSTRAINT different_audits CHECK (audit_before_id != audit_after_id),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes comparisons
CREATE INDEX idx_comparisons_profile_id ON comparisons(profile_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comparisons_date ON comparisons(created_at DESC);
CREATE INDEX idx_comparisons_improvement ON comparisons(improvement_overall DESC NULLS LAST);
CREATE INDEX idx_comparisons_growth ON comparisons(growth_followers_pct DESC NULLS LAST);

-- Unicidade: não permitir comparações duplicadas
CREATE UNIQUE INDEX idx_comparisons_unique ON comparisons(profile_id, audit_before_id, audit_after_id)
  WHERE deleted_at IS NULL;

-- ============================================
-- 6. ANALYSIS_QUEUE - Fila de Análises
-- ============================================
CREATE TABLE analysis_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Dados da análise
  username VARCHAR(100) NOT NULL CHECK (username ~ '^[a-zA-Z0-9._]+$'),
  post_limit INTEGER DEFAULT 10 CHECK (post_limit > 0 AND post_limit <= 100),
  skip_ocr BOOLEAN DEFAULT FALSE,

  -- Configurações
  audit_type audit_type_enum DEFAULT 'express',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),  -- 1 = highest, 10 = lowest

  -- Status
  status queue_status_enum DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  current_phase VARCHAR(50),            -- scraping, comments, ocr, audit

  -- Resultado
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,

  -- Erros
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Tempos
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,

  -- Worker info
  worker_id VARCHAR(100),
  worker_ip VARCHAR(50),

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes analysis_queue
CREATE INDEX idx_queue_status ON analysis_queue(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_queue_username ON analysis_queue(username);
CREATE INDEX idx_queue_created ON analysis_queue(created_at DESC);
CREATE INDEX idx_queue_priority ON analysis_queue(priority ASC, created_at ASC)
  WHERE status = 'pending' AND deleted_at IS NULL;

-- Index para worker assignment
CREATE INDEX idx_queue_processing ON analysis_queue(worker_id, started_at DESC)
  WHERE status = 'processing';

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON analysis_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para incrementar total_audits em profiles
CREATE OR REPLACE FUNCTION increment_profile_audits()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_audits = total_audits + 1,
      last_scraped_at = NEW.audit_date
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_created AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION increment_profile_audits();

-- Trigger para auto-criar comparação (quando houver 2+ audits)
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

CREATE TRIGGER auto_comparison AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION auto_create_comparison();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Últimas auditorias com dados do perfil
CREATE OR REPLACE VIEW latest_audits AS
SELECT
  a.id,
  a.audit_date,
  a.audit_type,
  a.score_overall,
  a.classification,
  a.engagement_rate,
  a.posts_analyzed,
  p.id as profile_id,
  p.username,
  p.full_name,
  p.is_verified,
  p.profile_pic_url_hd,
  p.followers_count,
  ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY a.audit_date DESC) as audit_rank
FROM audits a
JOIN profiles p ON a.profile_id = p.id
WHERE a.deleted_at IS NULL AND p.deleted_at IS NULL
ORDER BY a.audit_date DESC;

-- View: Perfis com evolução (última vs primeira auditoria)
CREATE OR REPLACE VIEW profile_evolution AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.followers_count,
  p.total_audits,
  first_audit.id as first_audit_id,
  first_audit.score_overall as first_score,
  first_audit.audit_date as first_audit_date,
  last_audit.id as last_audit_id,
  last_audit.score_overall as last_score,
  last_audit.audit_date as last_audit_date,
  (last_audit.score_overall - first_audit.score_overall) as score_improvement,
  EXTRACT(DAY FROM (last_audit.audit_date - first_audit.audit_date))::INTEGER as days_between
FROM profiles p
LEFT JOIN LATERAL (
  SELECT id, score_overall, audit_date
  FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date ASC
  LIMIT 1
) first_audit ON TRUE
LEFT JOIN LATERAL (
  SELECT id, score_overall, audit_date
  FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
) last_audit ON TRUE
WHERE p.deleted_at IS NULL
  AND first_audit.id IS NOT NULL
  AND last_audit.id IS NOT NULL;

-- View: Top performers (melhores perfis por score)
CREATE OR REPLACE VIEW top_performers AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.profile_pic_url_hd,
  p.followers_count,
  p.is_verified,
  a.score_overall,
  a.engagement_rate,
  a.classification,
  a.audit_date
FROM profiles p
JOIN LATERAL (
  SELECT score_overall, engagement_rate, classification, audit_date
  FROM audits
  WHERE profile_id = p.id AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1
) a ON TRUE
WHERE p.deleted_at IS NULL
ORDER BY a.score_overall DESC, a.engagement_rate DESC;

-- View: Recent activity (atividade recente)
CREATE OR REPLACE VIEW recent_activity AS
SELECT
  'audit_created' as activity_type,
  a.id as activity_id,
  p.username,
  p.full_name,
  a.score_overall as value,
  a.created_at as activity_date
FROM audits a
JOIN profiles p ON a.profile_id = p.id
WHERE a.deleted_at IS NULL AND p.deleted_at IS NULL

UNION ALL

SELECT
  'profile_created' as activity_type,
  p.id as activity_id,
  p.username,
  p.full_name,
  p.followers_count as value,
  p.created_at as activity_date
FROM profiles p
WHERE p.deleted_at IS NULL

ORDER BY activity_date DESC
LIMIT 50;

-- ============================================
-- MATERIALIZED VIEWS (para dashboard)
-- ============================================

-- Dashboard stats (agregações)
CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  COUNT(DISTINCT p.id) as total_profiles,
  COUNT(DISTINCT CASE WHEN p.is_verified THEN p.id END) as verified_profiles,
  COUNT(DISTINCT a.id) as total_audits,
  COUNT(DISTINCT CASE WHEN a.audit_date >= NOW() - INTERVAL '30 days' THEN a.id END) as audits_last_30d,
  ROUND(AVG(a.score_overall), 2) as avg_score_overall,
  ROUND(AVG(a.engagement_rate), 3) as avg_engagement_rate,
  COUNT(DISTINCT po.id) as total_posts,
  COUNT(DISTINCT c.id) as total_comments,
  MAX(a.audit_date) as last_audit_date
FROM profiles p
LEFT JOIN audits a ON a.profile_id = p.id AND a.deleted_at IS NULL
LEFT JOIN posts po ON po.audit_id = a.id AND po.deleted_at IS NULL
LEFT JOIN comments c ON c.post_id = po.id AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

-- Index na materialized view
CREATE UNIQUE INDEX idx_mv_dashboard_stats ON mv_dashboard_stats((true));

-- Function para refresh automático
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queue ENABLE ROW LEVEL SECURITY;

-- Política pública de leitura (ajustar depois com auth)
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON audits FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON posts FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON comments FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON comparisons FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read access" ON analysis_queue FOR SELECT USING (deleted_at IS NULL);

-- Política de insert/update para service role (backend)
-- CREATE POLICY "Service role full access" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COMENTÁRIOS & DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis do Instagram scrapeados (com soft delete)';
COMMENT ON TABLE audits IS 'Auditorias completas com scores dos 5 auditores (com full-text search)';
COMMENT ON TABLE posts IS 'Posts individuais com OCR e comentários (particionável)';
COMMENT ON TABLE comments IS 'Comentários individuais categorizados (com threads)';
COMMENT ON TABLE comparisons IS 'Comparações temporais (antes/depois) com auto-criação';
COMMENT ON TABLE analysis_queue IS 'Fila de análises em andamento (com prioridade e worker tracking)';

COMMENT ON COLUMN audits.raw_json IS 'JSON completo da auditoria (backup)';
COMMENT ON COLUMN audits.search_vector IS 'Full-text search vector (atualizado via trigger)';
COMMENT ON COLUMN posts.ocr_data IS 'Array de análises OCR do Gemini Vision';
COMMENT ON COLUMN comments.category IS 'perguntas|elogios|duvidas|experiencias|criticas|outros';
COMMENT ON COLUMN comments.sentiment_score IS 'Score de sentimento: -1.00 (negativo) a 1.00 (positivo)';
COMMENT ON COLUMN comparisons.full_comparison IS 'Comparação detalhada completa em JSON';

-- ============================================
-- OTIMIZAÇÕES DE PERFORMANCE
-- ============================================

-- Ajustar configurações de performance (se aplicável)
-- ALTER DATABASE your_db SET random_page_cost = 1.1;  -- Para SSD
-- ALTER DATABASE your_db SET effective_cache_size = '4GB';

-- Habilitar pg_stat_statements (monitoramento)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================
-- FIM DO SCHEMA OTIMIZADO
-- ============================================
