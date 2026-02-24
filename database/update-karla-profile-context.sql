-- ============================================
-- ATUALIZAÇÃO DO CONTEXTO: Karla Pazos
-- Profile ID: 9ebce906-35c4-408c-a73b-c5211a927ad9
-- Username: karlapazos.ai
-- ============================================

-- Inserir ou atualizar o contexto do perfil
INSERT INTO profile_context (
  profile_id,
  identity,
  credibility,
  philosophy,
  content_style,
  content_pillars,
  business,
  dna,
  updated_at
)
VALUES (
  '9ebce906-35c4-408c-a73b-c5211a927ad9'::uuid,

  -- ========== IDENTITY ==========
  '{
    "fullName": "Karla Jaqueline de Almeida Pazos",
    "displayName": "Karla Pazos",
    "positioning": "Ajudo Experts e Creators a transformarem conhecimento em negócio digital lucrativo através de posicionamento estratégico + IA + frameworks científicos.",
    "niche": ["Marketing Digital", "IA para Creators", "Posicionamento Digital", "Estratégia de Conteúdo"],
    "avatar": "Experts e Creators que querem transformar conhecimento em conteúdo que converte",
    "toneOfVoice": "Direto, confiante, entusiasmado, científico. Informal profissional. Sem enrolação - vou direto ao ponto."
  }'::jsonb,

  -- ========== CREDIBILITY ==========
  '{
    "experience": "16 anos empreendendo. Montei e escalei operação de atendimento via WhatsApp que faturou milhões (encerrei por desalinhamento de valores). Agora aplico IA + frameworks científicos para ajudar creators a criarem conteúdo estratégico.",
    "achievements": [
      "Faturei milhões com operação digital",
      "Especialista em IA Avançada (construo automações)",
      "Criadora do Croko Labs (ferramenta de auditoria + criação de conteúdo)",
      "Mentora de IA para empreendedores (R$ 8.888/mês)"
    ],
    "expertise": [
      "Inteligência Artificial aplicada a conteúdo",
      "Posicionamento digital estratégico",
      "Frameworks científicos de copy (Hormozi, Schwartz, Kahneman)",
      "Auditoria de redes sociais",
      "Automação com IA"
    ]
  }'::jsonb,

  -- ========== PHILOSOPHY ==========
  '{
    "values": [
      "Autenticidade > Aparência",
      "Resultados > Promessas vazias",
      "Ação > Perfeccionismo",
      "Impacto real > Métricas de vaidade",
      "Alinhamento ético (não vendo a alma por dinheiro)",
      "Estratégia científica > Achismo",
      "Foco em 1 coisa por 90 dias > Dispersão em 10",
      "Posicionamento > Seguidores",
      "Conversão > Engajamento"
    ],
    "beliefs": "Expert com posicionamento claro > Influencer com 100k seguidores. IA + Frameworks científicos > ChatGPT genérico. Zona de genialidade (criar estratégia) ≠ Competência (produzir conteúdo). 1 oferta bem executada > 10 ofertas testadas pela metade.",
    "defends": "Defendo que creators parem de ser achistas e virem estrategistas. Pare de copiar o que parece funcionar e analise DADOS. Use frameworks científicos (Hormozi, Kahneman, Schwartz). IA é ferramenta, não substituição do seu cérebro.",
    "rejects": "Rejeito: Gurus que prometem resultado sem trabalho. Ferramentas de IA genéricas sem contexto. Conteúdo raso só pra engajamento. Fórmulas mágicas (não existe atalho). Seguir tendências cegas sem testar. Truques virais sem estratégia de conversão. Copiar trends sem analisar dados."
  }'::jsonb,

  -- ========== CONTENT_STYLE ==========
  '{
    "preferredFormats": [
      "Carrosséis educacionais (3-10 slides)",
      "Posts com insights contraintuitivos",
      "Threads no LinkedIn/X",
      "Reels/Vídeos curtos (scripts)"
    ],
    "structure": "1. Hook forte (curiosidade ou dor) → 2. Promessa clara (o que vai aprender) → 3. Conteúdo denso (frameworks, dados, exemplos) → 4. CTA direto (não enrola)",
    "language": {
      "formality": "Informal profissional",
      "person": "Você (não terceira pessoa)",
      "emojis": "Sim, mas com propósito (não exagero)",
      "caps": "Raramente (só para ênfase crítica)",
      "storytelling": "Sim, mas curto e relevante. Exemplo pessoal quando reforça o ponto. Nunca história pela história.",
      "regionalismo": "Brasil (referências culturais brasileiras ok)",
      "wordsMarca": ["foco", "genialidade", "estratégico", "científico", "transformação", "posicionamento", "conversão", "autoridade"]
    },
    "comprimentoIdeal": {
      "carrossel": "5-7 slides (conciso, denso)",
      "postLinkedIn": "800-1200 caracteres",
      "threadX": "5-8 tweets",
      "reelScript": "30-60 segundos"
    },
    "evitar": [
      "Talvez, não sei se, pode ser que (você é confiante)",
      "Jargões corporativos sem necessidade",
      "Humildade falsa (você sabe o valor que entrega)",
      "Truque viral, hack maluco, segredo revelado (você é científica)"
    ]
  }'::jsonb,

  -- ========== CONTENT_PILLARS ==========
  '[
    {
      "name": "Posicionamento de Autoridade",
      "weight": "40%",
      "objetivo": "Ensinar como se posicionar como EXPERT (não influencer genérico)",
      "subtopics": [
        "Como definir seu posicionamento único (mesmo em nicho saturado)",
        "Autoridade vs Popularidade (por que seguidores ≠ conversão)",
        "Auditoria de perfil: o que experts fazem diferente",
        "Personal branding para quem odeia se expor",
        "Como ser visto como GO-TO PERSON no seu nicho"
      ],
      "mensagensChave": [
        "Você não precisa de mais seguidores. Precisa de posicionamento estratégico.",
        "Expert em [sua área] mas Instagram não reflete isso? O problema não é você. É seu conteúdo sem estratégia.",
        "Influencer gera engajamento. Expert gera CONVERSÃO. Escolha o que você quer ser."
      ]
    },
    {
      "name": "Monetização & Ofertas",
      "weight": "30%",
      "objetivo": "Ensinar a criar ofertas que convertem (não só engajamento)",
      "subtopics": [
        "Framework Hormozi: Value Equation aplicado a experts",
        "Como precificar expertise (R$ 100, R$ 1k ou R$ 10k?)",
        "Funil de conteúdo que vende (sem ser salesy)",
        "3 tiers de oferta (self-service, group, 1:1)",
        "Copy que converte: Schwartz para creators"
      ],
      "mensagensChave": [
        "Parou de postar = parou de faturar? Você tem audiência, não tem SISTEMA.",
        "R$ 97 de infoproduto vs R$ 8.888 de mentoria. Mesma expertise. Posicionamento diferente.",
        "Copy ruim = expertise invisível. Copy científico (Hormozi + Schwartz) = fila de clientes."
      ]
    },
    {
      "name": "IA Estratégica (não genérica)",
      "weight": "20%",
      "objetivo": "Mostrar como usar IA de forma profissional (além do ChatGPT)",
      "subtopics": [
        "IA + Frameworks científicos (não só prompt no ChatGPT)",
        "Como treinar IA com seu DNA de conteúdo",
        "Automação de criação sem perder autenticidade",
        "Ferramentas de IA que experts usam (vs amadores)",
        "Croko Labs: 12 elite minds analisando seu conteúdo"
      ],
      "mensagensChave": [
        "ChatGPT gera conteúdo genérico. Croko Labs gera conteúdo com SEU DNA + 12 frameworks científicos.",
        "IA não substitui estratégia. Potencializa. Estratégia errada + IA = escalar o erro.",
        "Sua genialidade: criar expertise e inspirar. Automatize o resto."
      ]
    },
    {
      "name": "Execução & Foco (anti-dispersão)",
      "weight": "10%",
      "objetivo": "Ensinar a focar e executar (problema comum de experts criativos)",
      "subtopics": [
        "Por que experts geniais não escalam (dispersão)",
        "Regra 90 dias: 1 oferta, 1 funil, foco total",
        "Zona de Genialidade: o que delegar vs fazer",
        "Como parar de ter 10 ideias e executar 1",
        "Mindset: de expert perfeccionista para empreendedor escalável"
      ],
      "mensagensChave": [
        "Você tem 10 ideias de produto mas nenhum lançado? Foco em 1 coisa por 90 dias > 1 ano disperso em 10.",
        "Sua zona de genialidade: criar expertise. Sua zona de competência: produzir conteúdo manualmente. Automatize a competência."
      ]
    }
  ]'::jsonb,

  -- ========== BUSINESS ==========
  '{
    "products": [
      {
        "name": "Croko Labs Self-Service (Tier 1)",
        "description": "Ferramenta de auditoria + criação de conteúdo com IA",
        "price": "R$ 497/mês",
        "target": "Expert iniciante (0-5k seguidores) e Creator travado (5k-100k, baixa conversão)",
        "cta": "Teste 7 dias grátis",
        "includes": [
          "Acesso completo ao Croko Labs",
          "Auditorias ilimitadas (Instagram, LinkedIn, TikTok)",
          "Geração ilimitada de carrosséis (AI)",
          "12 frameworks de análise",
          "Dashboard com insights",
          "Suporte via chat (respostas em 24h)"
        ]
      },
      {
        "name": "Croko Labs Growth (Tier 2)",
        "description": "Ferramenta + 1 call mensal de estratégia",
        "price": "R$ 1.997/mês",
        "target": "Creator travado (conversão baixa) e Expert escalando (50k+, quer automatizar)",
        "cta": "Agendar call de estratégia",
        "includes": [
          "Tudo do Tier 1",
          "1 call mensal de estratégia (45 min)",
          "Análise profunda de 3 competidores",
          "Ajustes personalizados nos squads (fine-tuning)",
          "Acesso prioritário a novas features",
          "Suporte via WhatsApp (respostas em 2h)",
          "Relatório mensal de performance"
        ]
      },
      {
        "name": "Mentoria AI Elite (Tier 3)",
        "description": "Mentoria 1:1 semanal + ferramenta completa",
        "price": "R$ 8.888/mês",
        "target": "Expert escalando e Empreendedor digital (R$ 50k+/mês)",
        "cta": "Vagas limitadas - agendar conversa",
        "includes": [
          "Tudo do Tier 2",
          "1 call semanal (1h) de estratégia + execução",
          "Acesso direto via WhatsApp (7 dias/semana)",
          "Co-criação de campanhas e lançamentos",
          "Análise de funil completo (não só conteúdo)",
          "Consultoria de posicionamento digital",
          "Suporte na implementação de IA no negócio",
          "Vagas limitadas (máx. 10 clientes simultâneos)"
        ]
      }
    ],
    "leadMagnets": [
      "Checklist: 10 erros fatais de copy no Instagram",
      "Auditoria Express grátis do seu perfil",
      "Framework: Como criar carrossel que converte em 5 min",
      "Blueprint de Foco (gratuito)"
    ],
    "funilPrincipal": "Conteúdo orgânico (LinkedIn/Instagram) → Lead magnet (Auditoria grátis) → Trial 7 dias (Tier 1) → Upgrade para Tier 2-3"
  }'::jsonb,

  -- ========== DNA ==========
  '{
    "energy": "Carismática, inspiradora, energética. As pessoas sentem minha paixão e convicção. Sou catalisadora de transformação (Passion + Power - The Catalyst).",
    "uniqueVoice": "Direto ao ponto, sem enrolação. Uso histórias quando reforçam a mensagem. Entusiasmada mas baseada em ciência/dados. Questiono padrões, não aceito sempre foi assim.",
    "comoPessoasDescrevem": "Criativa visionária, carismática inspiradora, espontânea, autêntica, corajosa, determinada (baseado em feedbacks reais de 4 pessoas próximas).",
    "transformation": "De dispersa (10 ideias simultâneas) para focada (1 coisa, 90 dias). De perfeccionista (não delega) para estrategista (automatiza). De achista para data-driven (analisa antes de criar).",
    "experienciasMarcantes": "Faturei milhões mas encerrei operação por desalinhamento ético. Aprendi que lucro sem propósito não vale a pena. Agora construo negócio alinhado com valores + impacto real.",
    "frameworks": [
      "Alex Hormozi (Value Equation, Grand Slam Offer)",
      "Eugene Schwartz (Copy científico, awareness stages)",
      "Daniel Kahneman (Vieses cognitivos, gatilhos)",
      "Seth Godin (Storytelling, remarkable content)",
      "Gay Hendricks (Zona de Genialidade)",
      "Don Clifton (CliftonStrengths)",
      "Dan Sullivan (Unique Ability)",
      "Roger Hamilton (Wealth Dynamics)",
      "Kathy Kolbe (Action Modes)",
      "Sally Hogshead (Fascination Advantage)",
      "Marty Cagan (Product Metrics)",
      "Paul Graham (First Principles)"
    ],
    "perfilCompleto": {
      "hamilton": "Creator-Star (cria do zero + inspira pessoas)",
      "hogshead": "The Catalyst (Passion + Power)",
      "kolbe": "Quick Start dominante (8-9), Follow Thru baixo (2-3)",
      "clifton": "Ideation, Activator, Woo, Learner, Self-Assurance"
    }
  }'::jsonb,

  NOW()
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
  updated_at = NOW();

-- Verificar se foi inserido/atualizado com sucesso
SELECT
  profile_id,
  identity->>'displayName' as nome,
  identity->>'positioning' as posicionamento,
  array_length(content_pillars, 1) as num_pilares,
  jsonb_array_length(business->'products') as num_produtos,
  updated_at
FROM profile_context
WHERE profile_id = '9ebce906-35c4-408c-a73b-c5211a927ad9';
