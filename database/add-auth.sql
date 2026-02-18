-- Migration: Autenticação por Perfil
-- Execute no SQL Editor do Supabase

-- 1. Adicionar user_id na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 2. Tabela de roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'client')) DEFAULT 'client',
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. RLS na tabela user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver seu próprio role
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas service role pode inserir/atualizar/deletar (admin usa service role)
-- Sem policies de escrita = apenas service_role pode escrever
