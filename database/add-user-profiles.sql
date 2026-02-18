-- Migration: Suporte a múltiplos perfis por cliente
-- Execute no SQL Editor do Supabase

-- 1. Criar tabela de vínculo user ↔ profiles (many-to-many)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, profile_id)
);

-- 2. Migrar dados existentes de user_roles.profile_id → user_profiles
INSERT INTO user_profiles (user_id, profile_id)
SELECT user_id, profile_id
FROM user_roles
WHERE profile_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Remover coluna profile_id de user_roles (não é mais necessária)
ALTER TABLE user_roles DROP COLUMN IF EXISTS profile_id;

-- 4. RLS em user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profiles" ON user_profiles;
CREATE POLICY "Users can read own profiles" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
