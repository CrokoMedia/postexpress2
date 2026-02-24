-- ============================================
-- MIGRAÇÃO: Atualizar foreign key de audits
-- ============================================
--
-- PROBLEMA:
--   A tabela 'audits' tem foreign key para 'profiles' (creators)
--   Mas deveria apontar para 'instagram_profiles'
--
-- SOLUÇÃO:
--   1. Remover constraint antiga
--   2. Adicionar nova constraint apontando para instagram_profiles
--
-- ============================================

-- Primeiro, vamos ver qual é o nome da constraint atual
-- (pode variar dependendo de quando foi criada)

-- Opção 1: Se a constraint se chama 'audits_profile_id_fkey'
ALTER TABLE audits
DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;

-- Opção 2: Se tem outro nome comum
ALTER TABLE audits
DROP CONSTRAINT IF EXISTS fk_audits_profile;

-- Opção 3: Se foi criada com nome padrão do Supabase
ALTER TABLE audits
DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;

-- Adicionar nova foreign key apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;

-- Verificar se funcionou
COMMENT ON CONSTRAINT audits_profile_id_fkey ON audits
IS 'Foreign key para instagram_profiles (perfis do Instagram auditados)';

-- ============================================
-- APÓS EXECUTAR:
-- Reinicie o servidor Next.js e teste a API
-- ============================================
