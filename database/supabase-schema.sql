-- ============================================
-- SCHEMA COMPLETO - INSTAGRAM AUDIT SYSTEM
-- Supabase (PostgreSQL)
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES - Dados dos Perfis
-- ============================================
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  biography TEXT,
  followers_count INTEGER,
  following_count INTEGER,
  posts_count INTEGER,
  profile_pic_url TEXT,
  profile_pic_url_hd TEXT,
  url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_business_account BOOLEAN DEFAULT FALSE,
  business_category VARCHAR(100),

  -- Metadados
  first_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================
-- 2. AUDITS - Auditorias Completas
-- ============================================
CREATE TABLE audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Data da auditoria
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audit_type VARCHAR(50) DEFAULT 'express', -- express, complete, quick
  posts_analyzed INTEGER,

  -- Scores gerais
  score_overall INTEGER CHECK (score_overall >= 0 AND score_overall <= 100),
  classification VARCHAR(50), -- CRÍTICO, BOM, EXCELENTE

  -- Scores por dimensão (5 auditores)
  score_behavior INTEGER CHECK (score_behavior >= 0 AND score_behavior <= 100),
  score_copy INTEGER CHECK (score_copy >= 0 AND score_copy <= 100),
  score_offers INTEGER CHECK (score_offers >= 0 AND score_offers <= 100),
  score_metrics INTEGER CHECK (score_metrics >= 0 AND score_metrics <= 100),
  score_anomalies INTEGER CHECK (score_anomalies >= 0 AND score_anomalies <= 100),

  -- Métricas de engajamento (no momento da auditoria)
  engagement_rate DECIMAL(5,2),
  total_likes INTEGER,
  total_comments INTEGER,
  avg_likes_per_post INTEGER,
  avg_comments_per_post INTEGER,

  -- Métricas do perfil (snapshot no momento)
  snapshot_followers INTEGER,
  snapshot_following INTEGER,
  snapshot_posts_count INTEGER,

  -- Dados completos (JSON)
  raw_json JSONB, -- Auditoria completa em JSON
  top_strengths JSONB, -- Array de pontos fortes
  critical_problems JSONB, -- Array de problemas
  quick_wins JSONB, -- Array de quick wins
  strategic_moves JSONB, -- Array de strategic moves
  hypotheses JSONB, -- Array de hipóteses

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audits_profile_id ON audits(profile_id);
CREATE INDEX idx_audits_date ON audits(audit_date DESC);
CREATE INDEX idx_audits_score ON audits(score_overall DESC);

-- ============================================
-- 3. POSTS - Posts Individuais
-- ============================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,

  -- Dados do post
  post_id VARCHAR(50), -- ID do Instagram
  short_code VARCHAR(50),
  post_url TEXT NOT NULL,
  post_type VARCHAR(50), -- Image, Video, Sidecar

  -- Conteúdo
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],

  -- Métricas
  likes_count INTEGER,
  comments_count INTEGER,

  -- Timestamp do post
  post_timestamp TIMESTAMP WITH TIME ZONE,

  -- Imagens
  display_url TEXT,
  images TEXT[], -- Array de URLs

  -- OCR (Gemini Vision)
  ocr_total_images INTEGER,
  ocr_analyzed INTEGER,
  ocr_data JSONB, -- Array de análises OCR completas

  -- Comentários
  comments_total INTEGER,
  comments_relevant INTEGER,
  comments_raw JSONB, -- Array de comentários brutos
  comments_categorized JSONB, -- {perguntas:[], elogios:[], etc}

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_audit_id ON posts(audit_id);
CREATE INDEX idx_posts_timestamp ON posts(post_timestamp DESC);
CREATE INDEX idx_posts_likes ON posts(likes_count DESC);

-- ============================================
-- 4. COMMENTS - Comentários Individuais
-- ============================================
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,

  -- Dados do comentário
  comment_id VARCHAR(50), -- ID do Instagram
  text TEXT NOT NULL,
  owner_username VARCHAR(100),
  owner_id VARCHAR(50),

  -- Métricas
  likes_count INTEGER DEFAULT 0,

  -- Categorização
  category VARCHAR(50), -- perguntas, elogios, duvidas, experiencias, outros
  is_relevant BOOLEAN DEFAULT TRUE,

  -- Timestamp
  comment_timestamp TIMESTAMP WITH TIME ZONE,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_category ON comments(category);
CREATE INDEX idx_comments_relevant ON comments(is_relevant);

-- ============================================
-- 5. COMPARISONS - Comparações Temporais
-- ============================================
CREATE TABLE comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Auditorias sendo comparadas
  audit_before_id UUID REFERENCES audits(id),
  audit_after_id UUID REFERENCES audits(id),

  -- Período
  days_between INTEGER,
  date_before TIMESTAMP WITH TIME ZONE,
  date_after TIMESTAMP WITH TIME ZONE,

  -- Crescimento de métricas
  growth_followers INTEGER, -- Diferença absoluta
  growth_followers_pct DECIMAL(5,2), -- Percentual
  growth_engagement DECIMAL(5,2), -- Diferença em pontos percentuais
  growth_avg_likes INTEGER,
  growth_avg_comments INTEGER,

  -- Melhoria de scores
  improvement_overall INTEGER, -- Diferença de pontos
  improvement_behavior INTEGER,
  improvement_copy INTEGER,
  improvement_offers INTEGER,
  improvement_metrics INTEGER,
  improvement_anomalies INTEGER,

  -- Análise qualitativa
  problems_solved JSONB, -- Array de problemas resolvidos
  wins_implemented JSONB, -- Quick wins que foram implementados
  roi_summary TEXT, -- Resumo do ROI

  -- Dados completos
  full_comparison JSONB, -- Comparação detalhada completa

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comparisons_profile_id ON comparisons(profile_id);
CREATE INDEX idx_comparisons_date ON comparisons(created_at DESC);

-- ============================================
-- 6. ANALYSIS_QUEUE - Fila de Análises
-- ============================================
CREATE TABLE analysis_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Dados da análise
  username VARCHAR(100) NOT NULL,
  post_limit INTEGER DEFAULT 10,
  skip_ocr BOOLEAN DEFAULT FALSE,

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100
  current_phase VARCHAR(50), -- scraping, comments, ocr, audit

  -- Resultado
  profile_id UUID REFERENCES profiles(id),
  audit_id UUID REFERENCES audits(id),
  error_message TEXT,

  -- Tempos
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_queue_status ON analysis_queue(status);
CREATE INDEX idx_queue_username ON analysis_queue(username);
CREATE INDEX idx_queue_created ON analysis_queue(created_at DESC);

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
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON analysis_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Últimas auditorias com dados do perfil
CREATE VIEW latest_audits AS
SELECT
  a.*,
  p.username,
  p.full_name,
  p.is_verified,
  p.profile_pic_url_hd
FROM audits a
JOIN profiles p ON a.profile_id = p.id
ORDER BY a.created_at DESC;

-- View: Perfis com evolução (última vs primeira auditoria)
CREATE VIEW profile_evolution AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.followers_count,
  first_audit.score_overall as first_score,
  first_audit.audit_date as first_audit_date,
  last_audit.score_overall as last_score,
  last_audit.audit_date as last_audit_date,
  (last_audit.score_overall - first_audit.score_overall) as score_improvement,
  EXTRACT(DAY FROM (last_audit.audit_date - first_audit.audit_date)) as days_between
FROM profiles p
LEFT JOIN LATERAL (
  SELECT * FROM audits
  WHERE profile_id = p.id
  ORDER BY audit_date ASC
  LIMIT 1
) first_audit ON TRUE
LEFT JOIN LATERAL (
  SELECT * FROM audits
  WHERE profile_id = p.id
  ORDER BY audit_date DESC
  LIMIT 1
) last_audit ON TRUE
WHERE first_audit.id IS NOT NULL AND last_audit.id IS NOT NULL;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS em todas as tabelas (quando houver auth)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queue ENABLE ROW LEVEL SECURITY;

-- Política pública de leitura (ajustar depois se precisar auth)
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON audits FOR SELECT USING (true);
CREATE POLICY "Public read access" ON posts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON comparisons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON analysis_queue FOR SELECT USING (true);

-- ============================================
-- SEED DATA (exemplo)
-- ============================================

-- Inserir exemplo de perfil
-- INSERT INTO profiles (username, full_name, followers_count)
-- VALUES ('rodrigogunter_', 'Rodrigo Gunter', 56327);

-- ============================================
-- COMENTÁRIOS & DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis do Instagram scrapeados';
COMMENT ON TABLE audits IS 'Auditorias completas com scores dos 5 auditores';
COMMENT ON TABLE posts IS 'Posts individuais com OCR e comentários';
COMMENT ON TABLE comments IS 'Comentários individuais categorizados';
COMMENT ON TABLE comparisons IS 'Comparações temporais (antes/depois)';
COMMENT ON TABLE analysis_queue IS 'Fila de análises em andamento';

COMMENT ON COLUMN audits.raw_json IS 'JSON completo da auditoria (backup)';
COMMENT ON COLUMN posts.ocr_data IS 'Array de análises OCR do Gemini Vision';
COMMENT ON COLUMN comments.category IS 'perguntas|elogios|duvidas|experiencias|outros';
