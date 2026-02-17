-- ============================================
-- MIGRATION 001: Initial Schema
-- Descrição: Criação completa do schema inicial
-- Data: 2026-02-16
-- Autor: @data-engineer
-- ============================================

-- IMPORTANTE: Este é o schema completo e otimizado
-- Baseado em optimized-schema.sql

-- ============================================
-- EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE post_type_enum AS ENUM ('Image', 'Video', 'Sidecar', 'Reels', 'Story');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_type_enum AS ENUM ('express', 'complete', 'quick', 'deep');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE comment_category_enum AS ENUM ('perguntas', 'elogios', 'duvidas', 'experiencias', 'criticas', 'outros');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE queue_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_classification_enum AS ENUM ('CRÍTICO', 'RUIM', 'MEDIANO', 'BOM', 'EXCELENTE', 'EXTRAORDINÁRIO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELAS
-- ============================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9._]+$'),
  full_name VARCHAR(255),
  biography TEXT,
  external_url VARCHAR(500),
  followers_count INTEGER CHECK (followers_count >= 0),
  following_count INTEGER CHECK (following_count >= 0),
  posts_count INTEGER CHECK (posts_count >= 0),
  profile_pic_url TEXT,
  profile_pic_url_hd TEXT,
  profile_pic_cloudinary_url TEXT,
  url VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_business_account BOOLEAN DEFAULT FALSE,
  business_category VARCHAR(100),
  category_enum VARCHAR(50),
  contact_phone_number VARCHAR(50),
  contact_email VARCHAR(255),
  first_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_audits INTEGER DEFAULT 0,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AUDITS
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audit_type audit_type_enum DEFAULT 'express',
  posts_analyzed INTEGER CHECK (posts_analyzed >= 0),
  audit_duration_seconds INTEGER,
  gemini_cost_usd NUMERIC(10,4),
  total_api_calls INTEGER,
  total_tokens_used INTEGER,
  score_overall INTEGER CHECK (score_overall BETWEEN 0 AND 100),
  classification audit_classification_enum,
  score_behavior INTEGER CHECK (score_behavior BETWEEN 0 AND 100),
  score_copy INTEGER CHECK (score_copy BETWEEN 0 AND 100),
  score_offers INTEGER CHECK (score_offers BETWEEN 0 AND 100),
  score_metrics INTEGER CHECK (score_metrics BETWEEN 0 AND 100),
  score_anomalies INTEGER CHECK (score_anomalies BETWEEN 0 AND 100),
  engagement_rate NUMERIC(6,3) CHECK (engagement_rate >= 0),
  total_likes INTEGER CHECK (total_likes >= 0),
  total_comments INTEGER CHECK (total_comments >= 0),
  avg_likes_per_post INTEGER CHECK (avg_likes_per_post >= 0),
  avg_comments_per_post INTEGER CHECK (avg_comments_per_post >= 0),
  snapshot_followers INTEGER,
  snapshot_following INTEGER,
  snapshot_posts_count INTEGER,
  raw_json JSONB,
  top_strengths JSONB,
  critical_problems JSONB,
  quick_wins JSONB,
  strategic_moves JSONB,
  hypotheses JSONB,
  audit_summary TEXT,
  search_vector tsvector,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. POSTS
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  post_id VARCHAR(50),
  short_code VARCHAR(50),
  post_url TEXT NOT NULL,
  post_type post_type_enum,
  caption TEXT,
  hashtags TEXT[],
  mentions TEXT[],
  accessibility_caption TEXT,
  location_name VARCHAR(255),
  likes_count INTEGER CHECK (likes_count >= 0),
  comments_count INTEGER CHECK (comments_count >= 0),
  video_view_count INTEGER,
  is_pinned BOOLEAN DEFAULT FALSE,
  post_timestamp TIMESTAMP WITH TIME ZONE,
  display_url TEXT,
  images TEXT[],
  video_url TEXT,
  ocr_total_images INTEGER DEFAULT 0,
  ocr_analyzed INTEGER DEFAULT 0,
  ocr_data JSONB,
  comments_total INTEGER DEFAULT 0,
  comments_relevant INTEGER DEFAULT 0,
  comments_raw JSONB,
  comments_categorized JSONB,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  comment_id VARCHAR(50),
  text TEXT NOT NULL CHECK (length(text) > 0),
  owner_username VARCHAR(100),
  owner_id VARCHAR(50),
  owner_profile_pic_url TEXT,
  owner_is_verified BOOLEAN DEFAULT FALSE,
  replied_to_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  reply_level INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  category comment_category_enum DEFAULT 'outros',
  is_relevant BOOLEAN DEFAULT TRUE,
  sentiment_score NUMERIC(3,2),
  comment_timestamp TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMPARISONS
CREATE TABLE IF NOT EXISTS comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  audit_before_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  audit_after_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  days_between INTEGER CHECK (days_between >= 0),
  date_before TIMESTAMP WITH TIME ZONE NOT NULL,
  date_after TIMESTAMP WITH TIME ZONE NOT NULL,
  growth_followers INTEGER,
  growth_followers_pct NUMERIC(6,2),
  growth_engagement NUMERIC(6,3),
  growth_avg_likes INTEGER,
  growth_avg_comments INTEGER,
  improvement_overall INTEGER,
  improvement_behavior INTEGER,
  improvement_copy INTEGER,
  improvement_offers INTEGER,
  improvement_metrics INTEGER,
  improvement_anomalies INTEGER,
  problems_solved JSONB,
  wins_implemented JSONB,
  roi_summary TEXT,
  full_comparison JSONB,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_audit_order CHECK (date_after > date_before),
  CONSTRAINT different_audits CHECK (audit_before_id != audit_after_id)
);

-- 6. ANALYSIS_QUEUE
CREATE TABLE IF NOT EXISTS analysis_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(100) NOT NULL CHECK (username ~ '^[a-zA-Z0-9._]+$'),
  post_limit INTEGER DEFAULT 10 CHECK (post_limit > 0 AND post_limit <= 100),
  skip_ocr BOOLEAN DEFAULT FALSE,
  audit_type audit_type_enum DEFAULT 'express',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status queue_status_enum DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  current_phase VARCHAR(50),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  audit_id UUID REFERENCES audits(id) ON DELETE SET NULL,
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,
  worker_id VARCHAR(100),
  worker_ip VARCHAR(50),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BASIC INDEXES (mais indexes em 002_add_indexes.sql)
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Audits
CREATE INDEX IF NOT EXISTS idx_audits_profile_id ON audits(profile_id, audit_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audits_date ON audits(audit_date DESC) WHERE deleted_at IS NULL;

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_audit_id ON posts(audit_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(post_timestamp DESC NULLS LAST);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_comments_category ON comments(category);

-- Comparisons
CREATE INDEX IF NOT EXISTS idx_comparisons_profile_id ON comparisons(profile_id) WHERE deleted_at IS NULL;

-- Analysis Queue
CREATE INDEX IF NOT EXISTS idx_queue_status ON analysis_queue(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_queue_created ON analysis_queue(created_at DESC);

-- ============================================
-- TRIGGERS E FUNCTIONS
-- ============================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audits_updated_at ON audits;
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_queue_updated_at ON analysis_queue;
CREATE TRIGGER update_queue_updated_at BEFORE UPDATE ON analysis_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para incrementar total_audits
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

DROP TRIGGER IF EXISTS audit_created ON audits;
CREATE TRIGGER audit_created AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION increment_profile_audits();

-- Trigger para search_vector
CREATE OR REPLACE FUNCTION audits_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.audit_summary, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.classification::text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON audits;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION audits_search_vector_trigger();

-- Trigger para auto-criar comparação
CREATE OR REPLACE FUNCTION auto_create_comparison()
RETURNS TRIGGER AS $$
DECLARE
  prev_audit audits%ROWTYPE;
BEGIN
  SELECT * INTO prev_audit
  FROM audits
  WHERE profile_id = NEW.profile_id
    AND id != NEW.id
    AND audit_date < NEW.audit_date
    AND deleted_at IS NULL
  ORDER BY audit_date DESC
  LIMIT 1;

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

DROP TRIGGER IF EXISTS auto_comparison ON audits;
CREATE TRIGGER auto_comparison AFTER INSERT ON audits
  FOR EACH ROW EXECUTE FUNCTION auto_create_comparison();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_queue ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (ajustar depois com auth)
DROP POLICY IF EXISTS "Public read access" ON profiles;
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public read access" ON audits;
CREATE POLICY "Public read access" ON audits FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public read access" ON posts;
CREATE POLICY "Public read access" ON posts FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public read access" ON comments;
CREATE POLICY "Public read access" ON comments FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public read access" ON comparisons;
CREATE POLICY "Public read access" ON comparisons FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public read access" ON analysis_queue;
CREATE POLICY "Public read access" ON analysis_queue FOR SELECT USING (deleted_at IS NULL);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE profiles IS 'Perfis do Instagram scrapeados (com soft delete)';
COMMENT ON TABLE audits IS 'Auditorias completas com scores dos 5 auditores (com full-text search)';
COMMENT ON TABLE posts IS 'Posts individuais com OCR e comentários';
COMMENT ON TABLE comments IS 'Comentários individuais categorizados (com threads)';
COMMENT ON TABLE comparisons IS 'Comparações temporais (antes/depois) com auto-criação';
COMMENT ON TABLE analysis_queue IS 'Fila de análises em andamento';

-- ============================================
-- FIM DA MIGRATION 001
-- ============================================

-- Verificar se migration foi aplicada com sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 aplicada com sucesso!';
  RAISE NOTICE 'Tabelas criadas: profiles, audits, posts, comments, comparisons, analysis_queue';
  RAISE NOTICE 'Próximo passo: executar 002_add_indexes.sql';
END $$;
