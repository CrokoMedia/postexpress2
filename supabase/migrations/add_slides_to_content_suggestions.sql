-- Adicionar coluna para armazenar slides gerados (URLs do Cloudinary)
ALTER TABLE content_suggestions
ADD COLUMN IF NOT EXISTS slides_json JSONB;

COMMENT ON COLUMN content_suggestions.slides_json IS 'URLs dos slides visuais gerados no Cloudinary';
