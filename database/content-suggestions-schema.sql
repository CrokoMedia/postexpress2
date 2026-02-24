-- Tabela para armazenar sugestões de conteúdo geradas via WhatsApp
CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Vinculação
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  whatsapp_phone TEXT NOT NULL,

  -- Ideia original
  idea TEXT NOT NULL,
  sender_name TEXT,

  -- Conteúdo gerado (JSON)
  carousel_data JSONB NOT NULL,
  -- Estrutura: { titulo, descricao, slides: [{numero, titulo, texto, visual}], cta, legenda }

  -- Slides visuais (URLs do Cloudinary)
  slides_urls JSONB,
  -- Estrutura: ["https://cloudinary.com/slide1.png", ...]

  -- Status
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,

  -- Constraint para status
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'delivered')),

  -- Quem aprovou/rejeitou
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Entrega
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_content_suggestions_status
ON content_suggestions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_phone
ON content_suggestions(whatsapp_phone, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_profile
ON content_suggestions(profile_id, created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_content_suggestions_updated_at
BEFORE UPDATE ON content_suggestions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE content_suggestions IS 'Sugestões de conteúdo geradas via WhatsApp aguardando aprovação';
COMMENT ON COLUMN content_suggestions.carousel_data IS 'JSON com título, slides e legenda gerados pelo Claude';
COMMENT ON COLUMN content_suggestions.slides_urls IS 'Array de URLs das imagens dos slides no Cloudinary';
COMMENT ON COLUMN content_suggestions.status IS 'pending=aguardando | approved=aprovado | rejected=rejeitado | delivered=entregue';
