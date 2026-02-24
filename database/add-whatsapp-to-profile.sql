-- Adicionar campo whatsapp_phone na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT UNIQUE;

-- Índice para buscar perfil por WhatsApp
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_phone
ON profiles(whatsapp_phone)
WHERE whatsapp_phone IS NOT NULL;

-- Comentário
COMMENT ON COLUMN profiles.whatsapp_phone IS 'Número de WhatsApp vinculado a este perfil (formato internacional sem +)';

-- Exemplo: Vincular seu número ao perfil
-- UPDATE profiles
-- SET whatsapp_phone = '66632607531'
-- WHERE username = 'seu_perfil_instagram';
