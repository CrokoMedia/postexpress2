-- Adiciona coluna reels_json para armazenar ideias de Reels geradas pelo Content Squad
ALTER TABLE content_suggestions
ADD COLUMN IF NOT EXISTS reels_json JSONB;

COMMENT ON COLUMN content_suggestions.reels_json IS 'JSON com ideias de Reels em tópicos geradas pelo Content Squad';
