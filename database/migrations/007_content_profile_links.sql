-- ============================================
-- MIGRATION 007: Relacionamento Content <> Profiles
-- ============================================
-- Permite vincular um mesmo conteúdo a múltiplos perfis

-- 1. Criar tabela de relacionamento many-to-many
CREATE TABLE IF NOT EXISTS content_profile_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_suggestions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Tipo de vinculação
  link_type VARCHAR(50) DEFAULT 'shared', -- 'original', 'shared', 'adapted'

  -- Metadados
  linked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  linked_by VARCHAR(100), -- Quem fez a vinculação (futuro: auth)
  notes TEXT, -- Notas sobre adaptações ou motivo da vinculação

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Constraint: um perfil não pode ter o mesmo conteúdo vinculado duas vezes
  CONSTRAINT unique_content_profile UNIQUE (content_id, profile_id)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_content_links_content ON content_profile_links(content_id);
CREATE INDEX IF NOT EXISTS idx_content_links_profile ON content_profile_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_links_deleted ON content_profile_links(deleted_at);

-- 3. Popular tabela com vínculos existentes
-- Criar vínculo 'original' para cada content_suggestion existente
INSERT INTO content_profile_links (content_id, profile_id, link_type, linked_at)
SELECT
  id as content_id,
  profile_id,
  'original' as link_type,
  generated_at as linked_at
FROM content_suggestions
ON CONFLICT (content_id, profile_id) DO NOTHING;

-- 4. RLS Policy
ALTER TABLE content_profile_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON content_profile_links
  FOR SELECT
  USING (deleted_at IS NULL);

-- 5. View útil: Conteúdos com todos os perfis vinculados
CREATE OR REPLACE VIEW content_with_profiles AS
SELECT
  cs.id as content_id,
  cs.audit_id,
  cs.content_json,
  cs.slides_json,
  cs.generated_at,

  -- Profile original (creator)
  original_profile.id as original_profile_id,
  original_profile.username as original_username,

  -- Todos os profiles vinculados (agregado)
  json_agg(
    json_build_object(
      'profile_id', p.id,
      'username', p.username,
      'link_type', cpl.link_type,
      'linked_at', cpl.linked_at,
      'notes', cpl.notes
    ) ORDER BY cpl.linked_at
  ) FILTER (WHERE p.id IS NOT NULL) as linked_profiles,

  -- Contadores
  COUNT(DISTINCT cpl.profile_id) as total_linked_profiles

FROM content_suggestions cs
LEFT JOIN profiles original_profile ON cs.profile_id = original_profile.id
LEFT JOIN content_profile_links cpl ON cs.id = cpl.content_id AND cpl.deleted_at IS NULL
LEFT JOIN profiles p ON cpl.profile_id = p.id AND p.deleted_at IS NULL
GROUP BY
  cs.id,
  cs.audit_id,
  cs.content_json,
  cs.slides_json,
  cs.generated_at,
  original_profile.id,
  original_profile.username;

-- 6. Comentários
COMMENT ON TABLE content_profile_links IS 'Relacionamento many-to-many entre conteúdos e perfis';
COMMENT ON COLUMN content_profile_links.link_type IS 'Tipo: original (criador), shared (compartilhado), adapted (adaptado)';
COMMENT ON COLUMN content_profile_links.notes IS 'Notas sobre adaptações ou motivo da vinculação';

-- 7. Function helper: Vincular conteúdo a um perfil
CREATE OR REPLACE FUNCTION link_content_to_profile(
  p_content_id UUID,
  p_profile_id UUID,
  p_link_type VARCHAR DEFAULT 'shared',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_link_id UUID;
BEGIN
  INSERT INTO content_profile_links (content_id, profile_id, link_type, notes)
  VALUES (p_content_id, p_profile_id, p_link_type, p_notes)
  ON CONFLICT (content_id, profile_id)
  DO UPDATE SET
    link_type = EXCLUDED.link_type,
    notes = EXCLUDED.notes,
    deleted_at = NULL,
    linked_at = NOW()
  RETURNING id INTO v_link_id;

  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Function helper: Desvincular conteúdo de um perfil (soft delete)
CREATE OR REPLACE FUNCTION unlink_content_from_profile(
  p_content_id UUID,
  p_profile_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE content_profile_links
  SET deleted_at = NOW()
  WHERE content_id = p_content_id
    AND profile_id = p_profile_id
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CONCLUÍDO
-- ============================================

COMMENT ON VIEW content_with_profiles IS 'View consolidada de conteúdos com todos os perfis vinculados';
COMMENT ON FUNCTION link_content_to_profile IS 'Vincula um conteúdo a um perfil (upsert)';
COMMENT ON FUNCTION unlink_content_from_profile IS 'Desvincula um conteúdo de um perfil (soft delete)';
