-- Tabela para cache de identidade visual de empresas/marcas
-- Evita re-análise de sites já processados

CREATE TABLE IF NOT EXISTS company_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  domain TEXT UNIQUE NOT NULL,              -- "nike.com", "cocacola.com"
  name TEXT,                                 -- "Nike", "Coca-Cola"

  -- Identidade Visual
  logo_url TEXT,                             -- URL do logo no Cloudinary
  hero_image_url TEXT,                       -- Imagem principal/hero do site
  screenshot_url TEXT,                       -- Screenshot do site (Cloudinary)
  extracted_images JSONB DEFAULT '[]',       -- Todas as imagens extraídas do site
  color_palette JSONB NOT NULL DEFAULT '[]', -- ["#111111", "#FFFFFF", "#FF5700"]
  primary_color TEXT,                        -- "#111111"
  secondary_color TEXT,                      -- "#FF5700"
  accent_color TEXT,                         -- Cor de destaque

  -- Estilo e Contexto
  visual_style TEXT,                         -- "esportivo moderno, atletas em movimento"
  industry TEXT,                             -- "esportes", "bebidas", "tecnologia"
  description TEXT,                          -- Descrição da marca

  -- Metadados
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Controle
  is_manual BOOLEAN DEFAULT FALSE,           -- Cadastrado manualmente vs auto-análise
  analysis_version INTEGER DEFAULT 1         -- Versionamento (para re-análise futura)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_company_brands_domain ON company_brands(domain);
CREATE INDEX IF NOT EXISTS idx_company_brands_analyzed_at ON company_brands(analyzed_at DESC);

-- Comentários
COMMENT ON TABLE company_brands IS 'Cache de identidade visual de empresas para Templates Pro';
COMMENT ON COLUMN company_brands.domain IS 'Domínio único da empresa (ex: nike.com)';
COMMENT ON COLUMN company_brands.color_palette IS 'Array de cores em hex (JSONB)';
COMMENT ON COLUMN company_brands.is_manual IS 'TRUE se cadastrado manualmente, FALSE se auto-análise';
