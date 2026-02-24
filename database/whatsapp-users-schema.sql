-- Tabela de usuários autorizados do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  active_profile_id UUID,
  authorized BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo whatsapp_phone na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

-- Adicionar foreign key de profiles para whatsapp_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_whatsapp_phone'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_whatsapp_phone
    FOREIGN KEY (whatsapp_phone)
    REFERENCES whatsapp_users(phone)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Adicionar foreign key de whatsapp_users para profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_whatsapp_users_active_profile'
  ) THEN
    ALTER TABLE whatsapp_users
    ADD CONSTRAINT fk_whatsapp_users_active_profile
    FOREIGN KEY (active_profile_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON whatsapp_users(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_authorized ON whatsapp_users(authorized);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_phone ON profiles(whatsapp_phone);

-- RLS (Row Level Security)
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura para usuários autenticados
CREATE POLICY "Allow read for authenticated users"
  ON whatsapp_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Permitir escrita apenas para service_role
CREATE POLICY "Allow write for service_role only"
  ON whatsapp_users
  FOR ALL
  TO service_role
  USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_whatsapp_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_whatsapp_users_updated_at ON whatsapp_users;
CREATE TRIGGER trigger_update_whatsapp_users_updated_at
  BEFORE UPDATE ON whatsapp_users
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_users_updated_at();

-- Inserir primeiro usuário (Felipe Ricardo)
INSERT INTO whatsapp_users (phone, name, authorized)
VALUES ('66632607531', 'Felipe Ricardo', true)
ON CONFLICT (phone) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE whatsapp_users IS 'Usuários autorizados a usar o bot via WhatsApp';
COMMENT ON COLUMN whatsapp_users.phone IS 'Número de telefone no formato internacional sem +';
COMMENT ON COLUMN whatsapp_users.active_profile_id IS 'Perfil do Instagram ativo para geração de conteúdo';
COMMENT ON COLUMN whatsapp_users.authorized IS 'Se false, bloqueia acesso ao bot';
