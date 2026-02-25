-- ============================================
-- Migration: Sistema de Permissões Granulares
-- Execute no SQL Editor do Supabase
-- Versão: 1.0
-- Data: 2026-02-26
-- ============================================

-- ============================================
-- 1. TABELA user_permissions
-- Controle granular de acesso por usuário
-- ============================================

CREATE TABLE IF NOT EXISTS user_permissions (
  -- Chave composta (user_id + permission)
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text NOT NULL,

  -- Estado da permissão
  enabled boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Chave primária composta
  PRIMARY KEY (user_id, permission),

  -- Validação: apenas permissões conhecidas
  CHECK (permission IN (
    'view_audits',        -- Ver auditorias completas
    'create_content',     -- Criar novos conteúdos/carrosséis
    'edit_content',       -- Editar conteúdos existentes
    'delete_content',     -- Deletar conteúdos
    'export_drive',       -- Exportar para Google Drive
    'export_zip',         -- Baixar ZIP
    'view_comparisons',   -- Ver comparações temporais
    'manage_profiles'     -- Gerenciar perfis (adicionar/remover)
  ))
);

-- Index para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Index para busca por permissão específica (útil para admin)
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON user_permissions(permission) WHERE enabled = true;

-- Comentários nas colunas
COMMENT ON TABLE user_permissions IS 'Sistema de permissões granulares por usuário';
COMMENT ON COLUMN user_permissions.user_id IS 'Referência ao usuário (auth.users)';
COMMENT ON COLUMN user_permissions.permission IS 'Nome da permissão (enum fixo)';
COMMENT ON COLUMN user_permissions.enabled IS 'Se a permissão está ativa ou não';

-- ============================================
-- 2. TRIGGER para atualizar updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_permissions_updated_at ON user_permissions;
CREATE TRIGGER trigger_update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- ============================================
-- 3. RLS (Row Level Security)
-- ============================================

-- Habilitar RLS na tabela
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Usuário pode ler suas próprias permissões
DROP POLICY IF EXISTS "Users can read own permissions" ON user_permissions;
CREATE POLICY "Users can read own permissions" ON user_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Apenas service_role pode inserir permissões
-- (sem policy de INSERT = apenas service_role pode inserir)

-- Policy 3: Apenas service_role pode atualizar permissões
-- (sem policy de UPDATE = apenas service_role pode atualizar)

-- Policy 4: Apenas service_role pode deletar permissões
-- (sem policy de DELETE = apenas service_role pode deletar)

-- IMPORTANTE: Admins devem usar service_role key para gerenciar permissões
-- Clientes (role='client') só podem ler suas próprias permissões via anon key

-- ============================================
-- 4. SEED de Permissões Padrão
-- ============================================

-- Função helper para inserir permissões padrão para um usuário
CREATE OR REPLACE FUNCTION seed_default_permissions(target_user_id uuid, user_role text DEFAULT 'client')
RETURNS void AS $$
BEGIN
  -- Permissões padrão para role "client"
  IF user_role = 'client' THEN
    INSERT INTO user_permissions (user_id, permission, enabled) VALUES
      (target_user_id, 'view_audits', true),
      (target_user_id, 'create_content', true),
      (target_user_id, 'edit_content', true),
      (target_user_id, 'delete_content', false),      -- Desabilitado por padrão
      (target_user_id, 'export_drive', true),
      (target_user_id, 'export_zip', true),
      (target_user_id, 'view_comparisons', true),
      (target_user_id, 'manage_profiles', true)
    ON CONFLICT (user_id, permission) DO NOTHING;
  END IF;

  -- Permissões padrão para role "admin"
  IF user_role = 'admin' THEN
    INSERT INTO user_permissions (user_id, permission, enabled) VALUES
      (target_user_id, 'view_audits', true),
      (target_user_id, 'create_content', true),
      (target_user_id, 'edit_content', true),
      (target_user_id, 'delete_content', true),       -- Admins podem deletar
      (target_user_id, 'export_drive', true),
      (target_user_id, 'export_zip', true),
      (target_user_id, 'view_comparisons', true),
      (target_user_id, 'manage_profiles', true)
    ON CONFLICT (user_id, permission) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION seed_default_permissions IS 'Insere permissões padrão para um usuário baseado em sua role';

-- ============================================
-- 5. TRIGGER para criar permissões ao criar usuário
-- ============================================

-- Função que cria permissões automaticamente quando user_roles é inserido
CREATE OR REPLACE FUNCTION auto_create_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Chama a função seed com a role do usuário
  PERFORM seed_default_permissions(NEW.user_id, NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na tabela user_roles
DROP TRIGGER IF EXISTS trigger_auto_create_permissions ON user_roles;
CREATE TRIGGER trigger_auto_create_permissions
  AFTER INSERT ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_permissions();

-- ============================================
-- 6. VIEW helper para consulta rápida
-- ============================================

-- View que junta user_roles + user_permissions para facilitar consultas
CREATE OR REPLACE VIEW user_access_matrix AS
SELECT
  ur.user_id,
  ur.role,
  up.permission,
  COALESCE(up.enabled, false) as has_permission,
  up.created_at as permission_granted_at
FROM user_roles ur
LEFT JOIN user_permissions up ON ur.user_id = up.user_id
ORDER BY ur.user_id, up.permission;

-- Comentário na view
COMMENT ON VIEW user_access_matrix IS 'View consolidada de roles + permissões por usuário';

-- ============================================
-- 7. FUNÇÕES HELPER para verificação de permissão
-- ============================================

-- Função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION user_has_permission(
  target_user_id uuid,
  required_permission text
)
RETURNS boolean AS $$
DECLARE
  has_perm boolean;
BEGIN
  SELECT enabled INTO has_perm
  FROM user_permissions
  WHERE user_id = target_user_id
    AND permission = required_permission;

  -- Se não encontrou registro, retorna false
  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION user_has_permission IS 'Verifica se um usuário tem uma permissão específica habilitada';

-- Função para verificar se USUÁRIO ATUAL tem permissão (usa auth.uid())
CREATE OR REPLACE FUNCTION current_user_has_permission(required_permission text)
RETURNS boolean AS $$
BEGIN
  RETURN user_has_permission(auth.uid(), required_permission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION current_user_has_permission IS 'Verifica se o usuário autenticado atual tem uma permissão específica';

-- ============================================
-- 8. SEED para usuários existentes (OPCIONAL)
-- ============================================

-- Descomentar as linhas abaixo para aplicar permissões padrão a todos os usuários existentes

-- INSERT INTO user_permissions (user_id, permission, enabled)
-- SELECT
--   ur.user_id,
--   perm.permission,
--   CASE
--     WHEN ur.role = 'admin' THEN true
--     WHEN ur.role = 'client' AND perm.permission != 'delete_content' THEN true
--     ELSE false
--   END as enabled
-- FROM user_roles ur
-- CROSS JOIN (
--   SELECT unnest(ARRAY[
--     'view_audits',
--     'create_content',
--     'edit_content',
--     'delete_content',
--     'export_drive',
--     'export_zip',
--     'view_comparisons',
--     'manage_profiles'
--   ]) as permission
-- ) perm
-- ON CONFLICT (user_id, permission) DO NOTHING;

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Para verificar se a migration rodou corretamente:
-- SELECT * FROM user_permissions LIMIT 10;
-- SELECT * FROM user_access_matrix LIMIT 10;
-- SELECT current_user_has_permission('view_audits');
