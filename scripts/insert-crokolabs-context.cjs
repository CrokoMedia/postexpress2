require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const contextData = {
  profile_id: 'e09155d0-ed1b-4325-aed5-d87893932262',
  identity: {
    fullName: 'Croko Labs',
    displayName: 'Croko Labs | Motor de Conteúdo',
    positioning: 'Implantamos infraestrutura de conteúdo autônomo para experts que já faturam, eliminando dependência criativa em até 21 dias.',
    niche: [
      'Infraestrutura Digital',
      'Autoridade Orgânica',
      'Automação com IA para Experts'
    ],
    avatar: 'Experts, mentores, consultores e SaaS founders que já faturam acima de 50k/mês e querem eliminar dependência de equipe criativa ou da própria criatividade.',
    toneOfVoice: 'Direto, estratégico, técnico, sem hype e sem romantização.'
  },
  credibility: {
    experience: 'Desenvolvimento e implementação de sistemas de conteúdo autônomo para operações digitais de experts e empresas SaaS.',
    achievements: [
      'Criação do Motor de Conteúdo Autônomo™',
      'Arquitetura de sistema implantado em até 21 dias',
      'Estrutura validada para experts 50k+/mês',
      'Modelo boutique com implantação personalizada'
    ],
    expertise: [
      'Arquitetura de sistemas de conteúdo',
      'Infraestrutura digital com IA',
      'Estratégia de autoridade orgânica'
    ]
  },
  philosophy: {
    values: [
      'Infraestrutura > Criatividade',
      'Sistema > Inspiração',
      'Escala > Esforço manual',
      'Controle > Dependência',
      'Lucro > Vaidade'
    ],
    beliefs: 'Autoridade não é talento. É infraestrutura. Criatividade humana é gargalo quando o objetivo é escala previsível.',
    defends: 'Implantação de sistemas proprietários, autonomia operacional e eliminação de dependência criativa.',
    rejects: 'Produção manual diária, dependência de equipe inchada, romantização de consistência baseada em força de vontade.'
  },
  content_style: {
    preferredFormats: [
      'Carrosséis estilo Twitter',
      'Reels estratégicos de ruptura',
      'Posts técnicos de bastidores'
    ],
    structure: 'Hook de ruptura → Diagnóstico estrutural → Verdade brutal → Direção → CTA para aplicação',
    language: {
      formality: 'Informal profissional',
      person: 'Segunda pessoa (você)',
      emojis: 'Nunca usa',
      caps: 'Só para ênfase estratégica',
      storytelling: 'Exemplos curtos e diretos, foco em lógica e estrutura, sem histórias longas emocionais.',
      regionalismo: 'Brasil',
      wordsMarca: [
        'Infraestrutura',
        'Motor',
        'Implantação',
        'Autônomo',
        'Gargalo'
      ]
    },
    comprimentoIdeal: {
      carrossel: '6-8 slides',
      postLinkedIn: '800-1200 caracteres',
      threadX: '5-8 tweets',
      reelScript: '30-60 segundos'
    },
    evitar: [
      'Ferramenta mágica',
      'Fórmula secreta',
      'Consistência é tudo'
    ]
  },
  content_pillars: [
    {
      name: 'Ruptura Estrutural',
      weight: '40%',
      objetivo: 'Instalar tensão mostrando que criatividade é gargalo.',
      subtopics: [
        'Dependência de equipe criativa',
        'Custo fixo de produção',
        'Conteúdo inconsistente'
      ],
      mensagensChave: [
        'Criatividade não escala.',
        'Se depende de inspiração, você está vulnerável.'
      ]
    },
    {
      name: 'Engenharia do Motor',
      weight: '30%',
      objetivo: 'Demonstrar como a infraestrutura funciona.',
      subtopics: [
        'Implantação em 21 dias',
        'Arquitetura do sistema',
        'Fluxo de produção autônoma'
      ],
      mensagensChave: [
        'Autoridade é infraestrutura.',
        'Sistema substitui esforço manual.'
      ]
    },
    {
      name: 'Autoridade e Escala',
      weight: '20%',
      objetivo: 'Mostrar o destino: controle, margem e previsibilidade.',
      subtopics: [
        'Redução de CAC',
        'Aumento de margem',
        'Liberdade operacional'
      ],
      mensagensChave: [
        'Controle é poder.'
      ]
    },
    {
      name: 'Bastidores Boutique',
      weight: '10%',
      objetivo: 'Mostrar que é implantação sob aplicação.',
      subtopics: [
        'Processo seletivo',
        'Implantações em andamento'
      ],
      mensagensChave: [
        'Não é para todos.'
      ]
    }
  ],
  business: {
    products: [
      {
        name: 'Motor de Conteúdo Autônomo™',
        description: 'Implantação completa de infraestrutura de conteúdo autônomo para experts.',
        price: 'R$5.000 implantação + R$997/mês',
        target: 'Experts 50k+/mês que querem eliminar dependência criativa',
        cta: 'Aplicar para implantação',
        includes: [
          'Diagnóstico estratégico',
          'Implantação personalizada',
          'Acesso ao sistema',
          'Treinamento operacional'
        ]
      }
    ],
    leadMagnets: [],
    funilPrincipal: 'Conteúdo de ruptura → Stories estratégicos → DM ou Link Bio → Formulário → Google Doc → Aplicação → Implantação'
  },
  dna: {
    energy: 'Estratégica, controlada e dominante.',
    uniqueVoice: 'Tom cirúrgico, frases diretas, foco em estrutura e lógica.',
    comoPessoasDescrevem: 'Empresa séria, técnica e diferente de agências comuns.',
    transformation: 'De dependência criativa manual para infraestrutura previsível.',
    experienciasMarcantes: 'Criação do Motor para eliminar gargalos internos de produção.',
    frameworks: [
      'Arquitetura de Sistemas',
      'Automação com IA',
      'Posicionamento por Ruptura'
    ],
    perfilCompleto: {
      hamilton: '',
      hogshead: '',
      kolbe: '',
      clifton: ''
    }
  }
};

(async () => {
  console.log('🔍 Verificando se já existe contexto para Croko Labs...');

  const { data: existing, error: errCheck } = await supabase
    .from('profile_context')
    .select('*')
    .eq('profile_id', 'e09155d0-ed1b-4325-aed5-d87893932262')
    .single();

  if (errCheck && errCheck.code !== 'PGRST116') {
    console.error('❌ Erro ao verificar:', errCheck);
    return;
  }

  let result;

  if (existing) {
    console.log('📝 Contexto existente encontrado. Atualizando...');
    result = await supabase
      .from('profile_context')
      .update(contextData)
      .eq('id', existing.id)
      .select();
  } else {
    console.log('✨ Criando novo contexto...');
    result = await supabase
      .from('profile_context')
      .insert(contextData)
      .select();
  }

  if (result.error) {
    console.error('❌ Erro ao salvar:', result.error);
  } else {
    console.log('✅ Contexto da Croko Labs salvo com sucesso!');
    console.log('\n📊 Resumo:');
    console.log('  Profile ID:', contextData.profile_id);
    console.log('  Nome:', contextData.identity.fullName);
    console.log('  Posicionamento:', contextData.identity.positioning);
    console.log('  Pilares de conteúdo:', contextData.content_pillars.length);
    console.log('  Produto principal:', contextData.business.products[0].name);
  }
})();
