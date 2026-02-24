-- ============================================
-- Adicionar contexto completo do OnePercent
-- Profile ID: 76752b65-8878-47fa-ab91-d3021982ffe7
-- ============================================

-- Inserir ou atualizar profile_context para o OnePercent
INSERT INTO profile_context (
  profile_id,
  identity,
  credibility,
  philosophy,
  content_style,
  content_pillars,
  business,
  dna,
  contexto_adicional
)
VALUES (
  '76752b65-8878-47fa-ab91-d3021982ffe7'::uuid,

  -- IDENTITY
  '{
    "fullName": "OnePercent - The Elite Transformation Ecosystem",
    "displayName": "OnePercent",
    "positioning": "Movimento exclusivo para quem quer fazer parte do 1% de elite. Transformamos mentalidade, ensinamos marketing e IA, e criamos resultados reais. Não é sobre ser melhor que outros - é sobre ser 1% melhor todo dia.",
    "niche": [
      "Comunidade de Transformação Elite",
      "Desenvolvimento de Mentalidade + IA + Marketing",
      "Movimento de Alto Desempenho"
    ],
    "avatar": "O 1%er: Empreendedor ou creator ambicioso (25-45 anos) que rejeita mediocridade, busca transformação real (não teoria vazia), quer resultados financeiros mas com alinhamento à zona de genialidade. Não aceita desculpas. Age rápido. Valoriza exclusividade com propósito.",
    "toneOfVoice": "Direto, inspirador, transformacional e confiante. Energia The Catalyst: alta intensidade mas autêntico, vulnerável mas poderoso. Sem enrolação, sem promessas vazias. Transparência radical."
  }'::jsonb,

  -- CREDIBILITY
  '{
    "experience": "Comunidade fundada por empreendedora serial com histórico de criar operações de milhões. Base em 7 frameworks comportamentais elite (Hendricks, Clifton, Hamilton, Hormozi, Kolbe, Sullivan, Hogshead). Foco em resultados reais, não teoria acadêmica.",
    "achievements": [
      "Marca registrada OnePercent (exclusividade legal)",
      "Framework proprietário: Zona de Genialidade Assessment",
      "Comunidade baseada em seleção (não entra qualquer um)",
      "Movimento building in public (transparência total)",
      "Ferramentas de IA proprietárias (OnePercent Labs)"
    ],
    "expertise": [
      "Descoberta de Zona de Genialidade (framework 4 zonas)",
      "Automação e produtividade com IA",
      "Marketing orgânico de alto impacto",
      "Criação de comunidades exclusivas de alto nível",
      "Transformação comportamental baseada em frameworks científicos"
    ]
  }'::jsonb,

  -- PHILOSOPHY
  '{
    "values": [
      "Zona de Genialidade > Corrigir fraquezas",
      "Ação (1% por dia) > Planejamento eterno",
      "Resultados reais > Teoria sem prática",
      "Exclusividade com propósito > Acesso irrestrito",
      "Autenticidade radical > Perfeição fabricada",
      "Mentalidade + Skills > Só motivação vazia",
      "Comunidade de elite > Grupo sem filtro"
    ],
    "beliefs": "O 1% não nasce pronto - é construído 1% por dia. A maioria falha por DISPERSÃO (não incapacidade). Mentalidade vem primeiro, mas dinheiro importa (e é resultado natural de alinhamento). Comunidades exclusivas protegem energia e elevam padrão. IA amplifica genialidade, não substitui. Transparência radical é o novo marketing.",
    "defends": "Descoberta da zona de genialidade antes de táticas. Foco radical em UMA coisa por 90 dias. Comunidades com seleção (não qualquer um entra). Building in public (mostrar processo, não só resultado). Uso de IA para amplificar (não copiar). Exclusividade como proteção de energia, não elitismo tóxico.",
    "rejects": "Dispersão crônica (fazer 10 coisas mal feitas). Gurus que só ensinam mas não executam. Comunidades sem filtro (energia baixa contamina). Teoria sem implementação. Promessas irreais (fique rico rápido). Foco em fraquezas em vez de genialidade. Perfeccionismo paralisante. Motivação sem ferramentas práticas."
  }'::jsonb,

  -- CONTENT_STYLE
  '{
    "preferredFormats": [
      "Reels 30-60s (comparações 1% vs 99%, frameworks visuais, tutorials de IA)",
      "Carrosséis educacionais (jornadas, breakdowns, sistemas)",
      "Stories diários (behind the scenes do movimento, polls, community highlights)",
      "Manifestos (filosofia OnePercent, identidade do 1%)"
    ],
    "structure": "Hook forte (3s) → Problema/Dor (10s) → Framework/Solução OnePercent (20s) → CTA claro (5s). Carrosséis: Slide 1 hook visual | 2-5 conteúdo estruturado | Final CTA.",
    "language": {
      "formality": "Informal profissional - como mentor próximo, não professor distante",
      "person": "Segunda pessoa (você) para falar com audiência. Primeira pessoa plural (nós, o 1%) para criar identidade de grupo.",
      "emojis": "Moderação - só para ênfase ou estrutura visual (✅❌🔥💎⚡◇)",
      "caps": "Ênfase em palavras-chave estratégicas (FOCO, UMA coisa, GENIALIDADE, 1%)",
      "storytelling": "Stories curtas como prova social (2-3 frases). Building in public (mostra processo). Vulnerabilidade estratégica (erros + lições). Metáforas visuais simples.",
      "regionalismo": "Brasil - referências locais, valores em R$",
      "wordsMarca": [
        "O 1%",
        "1%er",
        "Zona de Genialidade",
        "1% melhor por dia",
        "Upper Limit Problem",
        "Foco em UMA coisa",
        "0→1",
        "Building in public",
        "Elite de mentalidade (não dinheiro)",
        "OnePercent Core/Labs/Accelerator"
      ]
    },
    "comprimentoIdeal": {
      "carrossel": "5-7 slides (máximo 8)",
      "postLinkedIn": "N/A - foco Instagram/TikTok primeiros 90 dias",
      "threadX": "N/A - foco Instagram/TikTok primeiros 90 dias",
      "reelScript": "30-45 segundos (máximo 60s)",
      "caption": "80-150 caracteres - direto, complementa visual sem repetir"
    },
    "evitar": [
      "Jargão corporativo vazio (sinergia, disruptivo sem contexto)",
      "Promessas irreais (fique rico em 7 dias, fórmula secreta)",
      "Tom de superioridade tóxica (só nós sabemos, vocês são burros)",
      "Vitimização (sistema é injusto, tudo é difícil)",
      "Listicles rasos (5 dicas genéricas)",
      "Motivação sem prática (você consegue! sem ensinar como)"
    ]
  }'::jsonb,

  -- CONTENT_PILLARS
  '[
    {
      "name": "MINDSET (Mentalidade Elite)",
      "weight": "30%",
      "objetivo": "Transformar mentalidade de scarcity para abundance. Identificar zona de genialidade. Eliminar autossabotagem (Upper Limit Problems). Criar identidade de 1%er.",
      "subtopics": [
        "Zona de Genialidade vs Competência/Excelência",
        "Upper Limit Problems (autossabotagem inconsciente)",
        "1% vs 99% mindset (decisões, foco, energia)",
        "Perfis comportamentais (Creator/Star/Mechanic/Lord)",
        "Como dispersão mata resultados",
        "Builder mindset (criar, não só consumir)",
        "Reprogramação de crenças limitantes"
      ],
      "mensagensChave": [
        "99% tentam ser bons em tudo. O 1% domina sua zona de genialidade.",
        "Você não está preso. Você está disperso.",
        "Sua genialidade não é onde você é bom. É onde você entra em FLOW.",
        "O 1% foca em UMA coisa por 90 dias. Os 99% fazem 10 coisas mal feitas.",
        "OnePercent não é sobre ser melhor que outros. É sobre ser 1% melhor que ontem."
      ]
    },
    {
      "name": "SKILLSET (Ferramentas Práticas)",
      "weight": "40%",
      "objetivo": "Ensinar habilidades concretas que geram resultados: IA para automação, marketing estratégico, personal branding, criação de ofertas.",
      "subtopics": [
        "Automação com IA (prompts, workflows, ferramentas)",
        "Criação de ofertas irresistíveis (Value Equation)",
        "Marketing orgânico (crescimento 0→10k)",
        "Personal branding (posicionamento The Catalyst)",
        "Criação de produtos digitais (0→1)",
        "Sistemas de vendas sem ser salesy",
        "Produtividade com IA (economizar 10h+/semana)",
        "Criação de conteúdo em batch"
      ],
      "mensagensChave": [
        "IA não substitui você. Amplifica sua genialidade.",
        "O 1% usa IA para criar, não para copiar.",
        "Marketing não é vender. É inspirar transformação.",
        "Sua oferta deve ser tão boa que você se sente mal cobrando por ela.",
        "O 1% cria sistemas que funcionam sem eles."
      ]
    },
    {
      "name": "RESULTS (Prova Social)",
      "weight": "20%",
      "objetivo": "Mostrar resultados reais, building in public, transparência radical para gerar credibilidade e senso de movimento real.",
      "subtopics": [
        "Building in public (criação do OnePercent)",
        "Números reais (crescimento, receita, métricas)",
        "Behind the scenes (processo, não só resultado)",
        "Cases de transformação (membros 1%ers)",
        "Erros e aprendizados (vulnerabilidade estratégica)",
        "Progress updates (evolução do movimento)"
      ],
      "mensagensChave": [
        "O 1% mostra o processo, não só o resultado.",
        "Transparência radical é o novo marketing.",
        "OnePercent não vende teoria. Executa e ensina o que funciona.",
        "Se não tem resultado, não tem conteúdo.",
        "No OnePercent, você vê os números reais. Sempre."
      ]
    },
    {
      "name": "IDENTITY (Movimento OnePercent)",
      "weight": "10%",
      "objetivo": "Criar senso de pertencimento, identidade de grupo, filosofia do movimento. Transformar audiência em comunidade de 1%ers.",
      "subtopics": [
        "O que significa ser OnePercent (mentalidade, não dinheiro)",
        "Rituais do movimento (Daily 1% Commitment)",
        "Filosofia: 1% melhor por dia",
        "Community highlights (destaque de 1%ers)",
        "Valores do movimento vs o que rejeitamos",
        "Símbolos e linguagem (1%er, ◇ logo)"
      ],
      "mensagensChave": [
        "Se você está aqui, você já pensa diferente dos 99%.",
        "1%ers não esperam permissão. Criam e executam.",
        "Nós somos builders, não sonhadores.",
        "OnePercent não é um curso. É um movimento.",
        "O 1% protege sua energia. Por isso somos seletivos."
      ]
    }
  ]'::jsonb,

  -- BUSINESS
  '{
    "products": [
      {
        "name": "OnePercent Assessment",
        "description": "Assessment gratuito de 15 minutos para descobrir zona de genialidade, perfil comportamental (Creator/Star/Mechanic/Lord) e bloqueios. Gateway para o movimento.",
        "price": "Gratuito",
        "target": "Qualquer pessoa curiosa - porta de entrada para qualificar quem é 1%er",
        "cta": "Link na bio | Descubra se você é 1%",
        "includes": [
          "Resultado personalizado (perfil comportamental)",
          "Mapa de zona de genialidade",
          "Diagnóstico de Upper Limit Problem",
          "Recomendação de próximos passos"
        ]
      },
      {
        "name": "OnePercent Core",
        "description": "Membership exclusivo: comunidade + sistema de transformação em 12 semanas (Mindset → Skillset → Wealthset) + ferramentas de IA + masterclasses.",
        "price": "R$ 997/mês (Fundadores: R$ 697/mês vitalício - primeiros 100)",
        "target": "1%ers comprometidos: empreendedores e creators que querem implementar + monetizar zona de genialidade",
        "cta": "Entrar na waitlist | Seja um dos 100 Fundadores",
        "includes": [
          "Acesso vitalício às ferramentas OnePercent Labs (IA)",
          "Masterclasses quinzenais ao vivo",
          "Comunidade exclusiva Discord (apenas membros)",
          "Framework 12 semanas: Mindset → Skillset → Wealthset",
          "Daily 1% Tracker (app accountability com IA)",
          "Status Founder (primeiros 100 = vitalício)"
        ]
      },
      {
        "name": "OnePercent Accelerator",
        "description": "Programa intensivo 90 dias para escalar de R$ 10-30k/mês → R$ 50-100k/mês. Turmas fechadas de 30 pessoas. APLICAÇÃO OBRIGATÓRIA (seleção rigorosa).",
        "price": "R$ 12.000 (ou 3x R$ 4.500)",
        "target": "1%ers avançados: já têm negócio mas travados, querem escalar com suporte direto",
        "cta": "Aplicar para Accelerator (disponível só para membros Core)",
        "includes": [
          "Call semanal ao vivo com fundadora",
          "Sócio accountability (duplas complementares Kolbe)",
          "Hot seats individuais (análise de negócio)",
          "Acesso vitalício ao Core",
          "Grupo privado de Alumni Accelerator"
        ]
      }
    ],
    "leadMagnets": [
      "OnePercent Assessment (descobrir se é 1%er)",
      "1% Challenge (30 dias transformação gratuito - futuro)",
      "Guia: 10 Prompts IA que economizam 10h/semana (futuro)"
    ],
    "funilPrincipal": "Assessment gratuito (captura + qualifica 1%ers) → Conteúdo orgânico 21x/semana (educa + cria demanda + senso de exclusividade) → Waitlist OnePercent Core (gera FOMO) → Lançamento Fundadores (100 vagas limitadas, R$ 697 vitalício) → Membership recorrente (R$ 997/mês) → Accelerator (upsell high-ticket para escalar)"
  }'::jsonb,

  -- DNA
  '{
    "energy": "Alta intensidade transformacional. Movimento de builders, não sonhadores. Energia catalisadora: inspira ação imediata. Transparência radical (mostra processo real, números reais, erros reais). Exclusividade com propósito (não aceita qualquer um - protege energia do grupo).",
    "uniqueVoice": "Direto sem ser agressivo. Vulnerável sem ser fraco. Confiante sem ser arrogante. Usa frameworks visuais + stories pessoais. Building in public total. CAPS para ênfase estratégica. Fala a verdade dura com empatia. Não promete fácil, promete real.",
    "comoPessoasDescrevem": "Movimento de elite mas acessível (se você for comprometido). Comunidade que realmente se importa. Transparência que não vê em outros lugares. Conteúdo profundo, não raso. Exclusivo mas não elitista. Resultados reais, não teoria vazia.",
    "transformation": "OnePercent transforma pessoas de: Dispersas → Focadas | Teóricas → Executoras | Sozinhas → Comunidade de elite | Bloqueadas por crenças → Alinhadas com genialidade | Buscando validação → Confiantes no próprio caminho",
    "experienciasMarcantes": "Fundado por quem já faturou milhões mas descobriu que dispersão (não capacidade) é o maior bloqueio. Movimento criado para resolver isso: foco radical + comunidade + ferramentas práticas. Building in public desde dia 1.",
    "frameworks": [
      "Gay Hendricks - Zone of Genius (4 zonas, Upper Limit)",
      "Alex Hormozi - Value Equation + Grand Slam Offer",
      "Roger Hamilton - Wealth Dynamics (perfis Creator/Star/Mechanic/Lord)",
      "Sally Hogshead - Fascination Advantage",
      "Kathy Kolbe - Action Modes (sócios complementares)",
      "Don Clifton - CliftonStrengths (talentos dominantes)",
      "Dan Sullivan - Unique Ability + Who Not How"
    ],
    "perfilCompleto": {
      "essenciaMovimento": "OnePercent é para quem rejeita mediocridade mas não aceita promessas vazias. É para quem quer transformação REAL: mentalidade primeiro, ferramentas práticas depois, resultados financeiros como consequência natural. É exclusivo porque protegemos energia - não porque somos elitistas.",
      "rituais": "Daily 1% Commitment (check-in diário no app). Weekly Wins (compartilhar vitórias na comunidade). Quarterly Review (evolução 90 dias). OnePercent Summit (anual presencial).",
      "linguagemPropria": "1%er (membro), Are you 1% committed? (desafio), Building in public (filosofia), ◇ símbolo (logo), Zona de Genialidade (framework core)",
      "statusLevels": "Initiate (0-90 dias) → Active (91-365 dias) → Leader (365+ dias, mentora outros) → Founder (primeiros 100, status vitalício)"
    }
  }'::jsonb,

  -- STRATEGY NOTES (em contexto_adicional)
  'ESTRATÉGIA:

FASE DE CRESCIMENTO DE AUDIÊNCIA (Dias 1-90): Crescer 0→10k seguidores. NÃO vender ainda. Criar demanda, posicionar marca, gerar senso de exclusividade e movimento. Instagram/TikTok foco primário (21 posts/semana).

ANTI-PATTERNS: Não dispersar em múltiplos canais. Não lançar antes de métricas (5k seguidores, 8% engagement, 300 assessments, 10+ DMs/semana como entro?). Não aceitar qualquer um (exclusividade protege energia).

MÉTRICAS DE SUCESSO: Semana 4: 1k seguidores | Semana 8: 3k | Semana 12: 10k. Engagement >7%. Conversão post→assessment >5%. Track semanal toda segunda.

DIFERENCIAL CHAVE: Transparência radical (mostra números, processo, erros) + Exclusividade com propósito (não qualquer um entra) + Frameworks científicos (não motivação vazia) + Building in public (constrói movimento ao vivo).'

)
ON CONFLICT (profile_id)
DO UPDATE SET
  identity = EXCLUDED.identity,
  credibility = EXCLUDED.credibility,
  philosophy = EXCLUDED.philosophy,
  content_style = EXCLUDED.content_style,
  content_pillars = EXCLUDED.content_pillars,
  business = EXCLUDED.business,
  dna = EXCLUDED.dna,
  contexto_adicional = EXCLUDED.contexto_adicional,
  updated_at = NOW();

-- Verificar resultado
SELECT
  p.id,
  p.username,
  p.full_name,
  pc.identity->>'displayName' as display_name,
  pc.identity->>'positioning' as positioning,
  jsonb_array_length(pc.content_pillars) as num_pillars,
  jsonb_array_length(pc.business->'products') as num_products,
  pc.updated_at
FROM profiles p
JOIN profile_context pc ON p.id = pc.profile_id
WHERE p.id = '76752b65-8878-47fa-ab91-d3021982ffe7';
