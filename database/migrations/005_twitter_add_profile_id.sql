-- ========================================
-- Migration 005: Adicionar profile_id aos Twitter Experts
-- ========================================
-- Created: 2026-02-19
-- Epic: EPIC-001 - Twitter Stream API Integration
-- Story: 3.1 - Integração com Perfis de Clientes
-- ========================================

-- Adicionar coluna profile_id à tabela twitter_experts
ALTER TABLE twitter_experts
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_twitter_experts_profile_id ON twitter_experts(profile_id);

-- Comentário
COMMENT ON COLUMN twitter_experts.profile_id IS 'FK para profiles - expert associado a um perfil específico';

-- Remover constraint de UNIQUE do twitter_username
-- (agora um expert pode ser monitorado por múltiplos perfis)
ALTER TABLE twitter_experts DROP CONSTRAINT IF EXISTS twitter_experts_twitter_username_key;

-- Adicionar constraint UNIQUE composto (username + profile_id)
ALTER TABLE twitter_experts
ADD CONSTRAINT twitter_experts_username_profile_unique UNIQUE (twitter_username, profile_id);

COMMENT ON CONSTRAINT twitter_experts_username_profile_unique ON twitter_experts
IS 'Um expert pode ser monitorado apenas uma vez por perfil';
