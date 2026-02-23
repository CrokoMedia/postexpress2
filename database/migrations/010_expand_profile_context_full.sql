-- ============================================
-- MIGRATION 010: EXPAND PROFILE CONTEXT (FULL USER PROFILE)
-- Adiciona estrutura completa de UserProfile com identity, credibility,
-- philosophy, contentStyle, contentPillars, business e DNA
-- ============================================

-- Adicionar novos campos estruturados à tabela profile_context
ALTER TABLE profile_context
ADD COLUMN IF NOT EXISTS identity JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS credibility JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS philosophy JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS content_style JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS content_pillars JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS business JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS dna JSONB DEFAULT '{}'::jsonb;

-- Índices GIN para busca nos campos JSONB
CREATE INDEX IF NOT EXISTS idx_profile_context_identity_gin ON profile_context USING GIN (identity);
CREATE INDEX IF NOT EXISTS idx_profile_context_credibility_gin ON profile_context USING GIN (credibility);
CREATE INDEX IF NOT EXISTS idx_profile_context_philosophy_gin ON profile_context USING GIN (philosophy);
CREATE INDEX IF NOT EXISTS idx_profile_context_content_style_gin ON profile_context USING GIN (content_style);
CREATE INDEX IF NOT EXISTS idx_profile_context_content_pillars_gin ON profile_context USING GIN (content_pillars);
CREATE INDEX IF NOT EXISTS idx_profile_context_business_gin ON profile_context USING GIN (business);
CREATE INDEX IF NOT EXISTS idx_profile_context_dna_gin ON profile_context USING GIN (dna);

-- ============================================
-- COMENTÁRIOS (Documentação dos campos)
-- ============================================

COMMENT ON COLUMN profile_context.identity IS 'Identidade: fullName, displayName, positioning, niche[], avatar, toneOfVoice';
COMMENT ON COLUMN profile_context.credibility IS 'Credibilidade: experience, achievements[], expertise[]';
COMMENT ON COLUMN profile_context.philosophy IS 'Filosofia: values[], beliefs, defends, rejects';
COMMENT ON COLUMN profile_context.content_style IS 'Estilo: preferredFormats[], structure, language{formality, emojis, storytelling}';
COMMENT ON COLUMN profile_context.content_pillars IS 'Pilares: Array de {name, subtopics[]}';
COMMENT ON COLUMN profile_context.business IS 'Negócio: products[{name, price, target, cta}]';
COMMENT ON COLUMN profile_context.dna IS 'DNA: energy, uniqueVoice, transformation';

-- ============================================
-- EXEMPLOS DE ESTRUTURA (para referência)
-- ============================================

/*
  identity: {
    fullName: "Gary Vaynerchuk",
    displayName: "GaryVee",
    positioning: "Empreendedor serial e especialista em marketing digital",
    niche: ["marketing", "empreendedorismo", "redes sociais"],
    avatar: "https://...",
    toneOfVoice: "Direto, enérgico, motivacional"
  }

  credibility: {
    experience: "30+ anos em marketing e empreendedorismo",
    achievements: [
      "Fundador da VaynerMedia",
      "5x NYT Best Selling Author",
      "Investidor em Uber, Twitter, Tumblr"
    ],
    expertise: ["marketing digital", "personal branding", "NFTs"]
  }

  philosophy: {
    values: ["autenticidade", "trabalho duro", "paciência"],
    beliefs: "Marketing é sobre contar histórias e agregar valor",
    defends: "Produção massiva de conteúdo e documentação da jornada",
    rejects: "Atalhos, fórmulas mágicas, falta de autenticidade"
  }

  content_style: {
    preferredFormats: ["vídeo curto", "carrossel educacional", "storytime"],
    structure: "Hook forte → Contexto → 3-5 pontos práticos → CTA claro",
    language: {
      formality: "casual",
      emojis: true,
      storytelling: "pessoal e vulnerável",
      termsToAvoid: ["ROI", "CTR", "CPA", "funil", "engagement", "lead magnet"]
    }
  }

  content_pillars: [
    {
      name: "Marketing Digital",
      subtopics: ["social media", "paid ads", "organic reach"]
    },
    {
      name: "Mindset Empreendedor",
      subtopics: ["paciência", "consistência", "autenticidade"]
    }
  ]

  business: {
    products: [
      {
        name: "12 Week Year Course",
        price: "R$ 497",
        target: "Empreendedores iniciantes",
        cta: "Link na bio"
      }
    ]
  }

  dna: {
    energy: "Alta energia, movimento constante, senso de urgência",
    uniqueVoice: "Xinga, fala rápido, usa muitas metáforas de esportes",
    transformation: "De 'travado sem saber o que postar' para 'máquina de conteúdo'"
  }
*/

-- ============================================
-- FUNCTION: Migrar dados legados para nova estrutura
-- ============================================

CREATE OR REPLACE FUNCTION migrate_legacy_context_to_new_structure()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  context_record RECORD;
BEGIN
  FOR context_record IN
    SELECT id, nicho, objetivos, publico_alvo, produtos_servicos, tom_voz, contexto_adicional
    FROM profile_context
    WHERE identity = '{}'::jsonb -- Apenas registros que ainda não migraram
  LOOP
    UPDATE profile_context
    SET
      identity = jsonb_build_object(
        'niche', CASE WHEN context_record.nicho IS NOT NULL
                      THEN string_to_array(context_record.nicho, ',')
                      ELSE '[]'::text[] END,
        'toneOfVoice', COALESCE(context_record.tom_voz, '')
      ),
      philosophy = jsonb_build_object(
        'beliefs', COALESCE(context_record.objetivos, '')
      ),
      business = jsonb_build_object(
        'products', CASE
          WHEN context_record.produtos_servicos IS NOT NULL THEN
            jsonb_build_array(
              jsonb_build_object(
                'name', context_record.produtos_servicos,
                'price', '',
                'target', COALESCE(context_record.publico_alvo, ''),
                'cta', ''
              )
            )
          ELSE '[]'::jsonb
        END
      )
    WHERE id = context_record.id;

    migrated_count := migrated_count + 1;
  END LOOP;

  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Rodar migração automática (comentado para segurança - rodar manualmente se necessário)
-- SELECT migrate_legacy_context_to_new_structure();

COMMENT ON FUNCTION migrate_legacy_context_to_new_structure() IS 'Migra dados dos campos legados (nicho, objetivos, etc) para a nova estrutura JSON';
