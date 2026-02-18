-- Adiciona coluna slides_v2_json para armazenar slides do template V2 (com imagens IA)
-- separadamente do slides_json (template V1 padrão)
ALTER TABLE content_suggestions ADD COLUMN IF NOT EXISTS slides_v2_json JSONB;
