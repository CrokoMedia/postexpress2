import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Usar service_role key para ter acesso total (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const PROFILE_ID = '76752b65-8878-47fa-ab91-d3021982ffe7';

async function updateContext() {
  console.log('🚀 Atualizando contexto do perfil OnePercent...\n');

  // Dados do contexto atualizado
  const contextData = {
    profile_id: PROFILE_ID,
    identity: {
      fullName: "OnePercent - The Elite Transformation Ecosystem",
      displayName: "OnePercent",
      positioning: "OnePercent é para quem está em 0 e quer dar o primeiro passo. Ajudamos empreendedores e creators a saírem da paralisia para a ação através de mentalidade transformada, hábitos diários e comunidade de apoio. Depois, você constrói o que quiser.",
      niche: [
        "Desenvolvimento Pessoal & Mentalidade (0→1)",
        "Construção de Hábitos & Transformação",
        "Comunidade de Alto Desempenho"
      ],
      avatar: "O 1%er: Empreendedor ou creator ambicioso (25-45 anos) que está preso no piloto automático, cansado de planejar sem executar, sabe que pode mais mas não sabe como começar. Busca transformação real (não teoria vazia), quer resultados mas com alinhamento pessoal. Não aceita mediocridade. Valoriza exclusividade com propósito.",
      toneOfVoice: "Energético, transformacional, direto e confiante. The Catalyst: alta intensidade mas autêntico, vulnerável mas poderoso. Sem enrolação, sem promessas vazias. Transparência radical. Fala verdades duras com empatia."
    },
    credibility: {
      experience: "Movimento fundado por empreendedora serial com histórico de criar operações de milhões. Base em frameworks comportamentais elite (Hendricks, Clifton, Hamilton, Hormozi, Kolbe). Foco em resultados reais através de mentalidade + ação, não teoria acadêmica. Building in public desde o dia 1.",
      achievements: [
        "Marca OnePercent registrada (exclusividade legal + identidade visual profissional)",
        "Framework proprietário: 0→1 Foundation Program (90 dias de transformação)",
        "Manual de marca completo (identidade visual premium: preto, roxo, Sofia Pro)",
        "Comunidade baseada em seleção e resultados (não entra qualquer um)",
        "Estratégia de progressão: Foundation → Builders → Wealth → Elite Performance"
      ],
      expertise: [
        "Transformação 0→1 (sair da paralisia para primeira ação)",
        "Construção de hábitos diários (Sistema 1% - melhoria incremental)",
        "Mentalidade de alto desempenho (despertar, clareza, foco)",
        "Criação de comunidades exclusivas e engajadas",
        "Building in public e transparência radical"
      ]
    },
    philosophy: {
      values: [
        "Ação (1% por dia) > Planejamento eterno",
        "Primeiro passo imperfeito > Plano perfeito que nunca sai",
        "Foco em UMA coisa > Dispersão em múltiplas",
        "Progresso > Perfeição",
        "Clareza > Motivação vazia",
        "Comunidade de elite > Grupo sem filtro",
        "Mentalidade primeiro > Táticas sem fundamento"
      ],
      beliefs: "O 1% não nasce pronto - é construído 1% por dia. A maioria falha por DISPERSÃO (não incapacidade). Você não precisa de motivação, precisa de CLAREZA sobre o que importa. Mentalidade vem primeiro, mas resultados ($) importam (e são consequência natural de alinhamento). Primeiro passo imperfeito > plano perfeito. 0→1 é o mais difícil, mas é exatamente por isso que vale a pena.",
      defends: "Dar o primeiro passo ANTES de estar pronto. Foco radical em UMA coisa por 90 dias (não dispersão). Micro-melhorias diárias (1%) em vez de mudanças radicais insustentáveis. Comunidades com seleção (proteger energia do grupo). Building in public (mostrar processo, não só resultado). Sonhar SEM culpa (permissão para querer mais). Clareza > motivação.",
      rejects: "Dispersão crônica (10 ideias, 0 execuções). Planejamento eterno sem ação. Teoria sem implementação. Promessas vazias ('fique rico rápido', 'fórmula secreta'). Motivação sem sistema. Perfeccionismo paralisante. Comunidades sem filtro (energia baixa contamina). Gurus que só ensinam mas não executam. Realismo tóxico (matar sonhos em nome da 'sensatez')."
    },
    content_style: {
      preferredFormats: [
        "Reels 30-60s (comparações 1% vs 99%, verdades duras, frameworks visuais)",
        "Carrosséis educacionais 5-7 slides (jornadas, sistemas, manifestos)",
        "Stories diários (behind the scenes, polls, accountability, community highlights)",
        "Posts manifesto (filosofia OnePercent, compromisso do 1%, identidade)"
      ],
      structure: "Hook forte nos primeiros 3s (pergunta provocativa ou verdade dura) → Problema/Dor (10s, gera identificação) → Framework/Solução OnePercent (20s, entrega valor) → CTA claro (5s, link na bio ou tag). Para carrosséis: Slide 1 = Hook visual impactante | Slides 2-5 = Conteúdo estruturado (contraste, bullets, números) | Slide final = CTA + branding",
      language: {
        formality: "Informal profissional - conversa como mentor próximo que diz verdades duras",
        person: "Segunda pessoa (você) - fala DIRETO com o leitor. Primeira pessoa plural (nós, o 1%) para criar identidade de grupo.",
        emojis: "Usa com moderação - apenas para ênfase ou estruturação visual (✅❌🔥💎⚡% - isotipo como emoji)",
        caps: "Só para ênfase em palavras-chave estratégicas (FOCO, UMA coisa, DISPERSÃO, AÇÃO, CLAREZA, 0→1)",
        storytelling: "Verdades duras + perguntas provocativas. Comparações 1% vs 99%. Usa 'você' para gerar identificação ('Quando você parou de sonhar?'). Building in public (mostra processo). Vulnerabilidade estratégica (erros + lições aprendidas). Metáforas visuais simples (círculos = rotina, caminhos = escolhas).",
        regionalismo: "Brasil - referências brasileiras, valores em R$, contexto local",
        wordsMarca: [
          "1% / OnePercent / 1%er",
          "0→1",
          "Dispersão",
          "Clareza",
          "Primeiro passo imperfeito",
          "Sistema 1% (melhoria diária)",
          "Você não está preso, está disperso",
          "Quando você parou de sonhar?",
          "O 1% não espera estar pronto",
          "Building in public"
        ]
      },
      comprimentoIdeal: {
        carrossel: "5-7 slides (máximo 8). Slide 1 sempre impactante.",
        postLinkedIn: "N/A - foco Instagram/TikTok nos primeiros 90 dias",
        threadX: "N/A - foco Instagram/TikTok nos primeiros 90 dias",
        reelScript: "30-45 segundos (máximo 60s). Hook: 0-3s | Corpo: 3-25s | CTA: 25-30s"
      },
      evitar: [
        "Motivação vazia sem sistema ('você consegue!' sem ensinar como)",
        "Promessas irreais ('fique rico em 7 dias', 'fórmula secreta', 'hack mágico')",
        "Tom de superioridade tóxica ('só nós sabemos', 'vocês não entendem')",
        "Vitimização ('é difícil pra todo mundo', 'sistema é injusto', 'não tenho culpa')",
        "Jargões corporativos vazios ('disruptivo', 'sinergia', 'inovação' sem contexto)",
        "Listicles rasos ('5 dicas genéricas' sem profundidade)",
        "Comparação tóxica com pessoas específicas (foca em mentalidade 1% vs 99%, não pessoas)"
      ]
    },
    content_pillars: [
      {
        name: "MINDSET AWAKENING (Despertar Mental)",
        weight: "40%",
        objetivo: "Fazer as pessoas pararem e pensarem: 'Quando eu parei de sonhar? Eu mereço mais.' Abrir a mente, reativar sonhos, expandir possibilidades, dar permissão para querer mais.",
        subtopics: [
          "Quando você parou de sonhar? (reativar ambição)",
          "Realismo tóxico vs otimismo fundamentado",
          "Permissão para começar (você não precisa de validação externa)",
          "1% vs 99% mindset (decisões, foco, energia)",
          "Você não está preso, está disperso",
          "O custo de não tentar",
          "Clareza > Motivação"
        ],
        mensagensChave: [
          "Quando você parou de sonhar?",
          "O 1% não é quem nasceu especial. É quem decidiu começar.",
          "Você não está PRESO. Você está DISPERSO.",
          "99% tentam ser bons em tudo. 1% domina UMA coisa.",
          "Não é sobre ter mais tempo. É sobre ter CLAREZA.",
          "O 1% não espera permissão. Decide e age."
        ]
      },
      {
        name: "HABIT ARCHITECTURE (Construção de Hábitos)",
        weight: "30%",
        objetivo: "Ensinar o Sistema 1% (melhorar 1% todo dia). Criar momentum através de micro-melhorias diárias, não mudanças radicais insustentáveis.",
        subtopics: [
          "Sistema 1%: 1% melhor por dia = 37x melhor em 1 ano",
          "Como NÃO quebrar o streak (consistência > intensidade)",
          "Hábitos atômicos aplicados (micro-ações diárias)",
          "Rotina do 1% (o que fazem diferente todo dia)",
          "Accountability com IA (Daily 1% Tracker)",
          "Progresso > Perfeição",
          "Pequenas ações, grandes resultados (efeito composto)"
        ],
        mensagensChave: [
          "1% melhor por dia = 37x melhor em 1 ano.",
          "Você não precisa de motivação. Precisa de SISTEMA.",
          "O 1% não faz coisas gigantes. Faz pequenas coisas todos os dias.",
          "Hábitos > Metas. Sistemas > Força de vontade.",
          "Consistência vence intensidade. Sempre."
        ]
      },
      {
        name: "FIRST STEPS (Primeiros Passos)",
        weight: "20%",
        objetivo: "Ajudar a superar paralisia e dar o primeiro passo. Coragem de começar imperfeito. 0→1 é o mais difícil, mas é exatamente por isso que vale a pena.",
        subtopics: [
          "Primeiro passo imperfeito > Plano perfeito que nunca sai",
          "Como começar quando não sabe como",
          "Superar medo de julgamento e falha",
          "0→1 é o mais difícil (por isso 99% nunca começa)",
          "Coragem vem DEPOIS da ação (não antes)",
          "De consumidor para criador",
          "Prototipar vida (testar antes de decidir)"
        ],
        mensagensChave: [
          "Primeiro passo imperfeito > Plano perfeito.",
          "O 1% não espera estar pronto. Começa e aprende fazendo.",
          "Você não precisa saber COMO. Só precisa começar.",
          "Ação imperfeita > planejamento perfeito.",
          "0→1 é TÃO difícil. Mas é exatamente por isso que vale a pena.",
          "Coragem vem DEPOIS da ação. Não antes."
        ]
      },
      {
        name: "COMMUNITY & IDENTITY (Comunidade e Identidade)",
        weight: "10%",
        objetivo: "Criar senso de pertencimento e identidade de grupo. Transformar audiência em comunidade de 1%ers. Movimento > produto.",
        subtopics: [
          "O que significa ser OnePercent (mentalidade, não dinheiro)",
          "Compromisso do 1%er (manifesto)",
          "Por que fazer parte do 1%",
          "Comunidade > solidão (não fazer sozinho)",
          "Accountability coletivo (celebrar vitórias juntos)",
          "Energia do grupo (1%ers elevam uns aos outros)"
        ],
        mensagensChave: [
          "Se você está aqui, você já é diferente dos 99%.",
          "1%ers não esperam permissão. Criam e executam.",
          "Nós somos builders, não sonhadores.",
          "OnePercent não é um curso. É um movimento.",
          "O 1% protege sua energia. Por isso somos seletivos.",
          "Você é OnePercent."
        ]
      }
    ],
    business: {
      products: [
        {
          name: "OnePercent Assessment (GRATUITO - Lead Magnet)",
          description: "Assessment de 15 minutos para descobrir se você está preso ou disperso, identificar área de foco, e receber primeiros passos personalizados.",
          price: "Gratuito",
          target: "Qualquer pessoa que sente que pode mais mas não sabe como começar",
          cta: "Link na bio → Descubra se você é 1%",
          includes: [
            "Quiz interativo (15 minutos)",
            "Diagnóstico: Preso vs Disperso",
            "Área de foco recomendada (baseado em respostas)",
            "Primeiros passos personalizados",
            "Convite para comunidade (se qualificado)"
          ]
        },
        {
          name: "OnePercent 0→1 Foundation (Programa Base)",
          description: "Programa de 90 dias para sair de 0 (paralisia) para 1 (primeiro passo dado, hábitos instalados, mente aberta). Base do ecossistema OnePercent.",
          price: "R$ 497/mês (ou R$ 1.497 trimestral à vista)",
          target: "Empreendedores e creators em 0 que querem dar primeiro passo com suporte",
          cta: "Entrar na waitlist → Seja um Fundador",
          includes: [
            "Mês 1: DESPERTE (Mentalidade) - Identificar crenças, reativar sonhos, definir foco",
            "Mês 2: CONSTRUA (Hábitos) - Instalar 3 hábitos core, Sistema 1%, Daily Tracker",
            "Mês 3: EXECUTE (Ação) - Dar primeiro passo real, ajustar, celebrar",
            "Daily 1% Tracker (app IA de accountability)",
            "Comunidade exclusiva Discord",
            "Check-ins semanais (grupo)",
            "Biblioteca de recursos (prompts IA, templates, guias)"
          ]
        },
        {
          name: "OnePercent Builders Ecosystem (Próxima Fase)",
          description: "Para quem passou pela Foundation e quer CONSTRUIR: criar produtos, automação com IA, crescer audiência. Fase 2 do funil.",
          price: "R$ 997/mês",
          target: "Quem completou Foundation e está pronto para criar (0→1 mental já feito)",
          cta: "Upgrade para Builders",
          includes: [
            "Tudo do Foundation +",
            "Frameworks de criação 0→1",
            "Ferramentas de IA (OnePercent Labs)",
            "Marketing e growth estratégias",
            "Masterclasses quinzenais"
          ]
        },
        {
          name: "OnePercent Wealth Accelerator (High-Ticket)",
          description: "Programa intensivo de 90 dias para escalar de R$ 10-30k/mês para R$ 50-100k/mês. Fase 3 do funil. Turmas fechadas, aplicação obrigatória.",
          price: "R$ 12.000 (ou 3x R$ 4.500)",
          target: "Quem já criou algo (passou por Builders) e quer ESCALAR receita",
          cta: "Aplicar para Accelerator",
          includes: [
            "Call semanal ao vivo",
            "Análise de negócio (hot seats)",
            "Sócio accountability (duplas Kolbe complementares)",
            "Acesso vitalício a Foundation + Builders",
            "Grupo privado de Alumni"
          ]
        }
      ],
      leadMagnets: [
        "OnePercent Assessment (descobrir se está preso ou disperso)",
        "Guia: Sistema 1% - Como melhorar 1% todo dia (PDF + checklist)",
        "Desafio 7 Dias: 1% Challenge (tag @onepercent nos stories)"
      ],
      funilPrincipal: "Assessment gratuito (captura lead + qualifica 1%ers) → Conteúdo orgânico 21x/semana (nutre + educa + cria demanda através de Mindset, Habits, First Steps) → Waitlist OnePercent Foundation (gera FOMO + exclusividade) → Lançamento Fundadores (primeiros 100, R$ 497/mês) → Membership recorrente Foundation (R$ 497/mês, base sólida) → Upsell para Builders Ecosystem (R$ 997/mês, criar) → Upsell para Wealth Accelerator (R$ 12k, escalar)"
    },
    dna: {
      energy: "Alta intensidade transformacional. Movimento de builders, não sonhadores. Energia catalisadora: inspira ação imediata. Transparência radical (mostra processo real, números reais, erros reais). Exclusividade com propósito (não aceita qualquer um - protege energia do grupo). Direto mas empático - verdades duras ditas com cuidado.",
      uniqueVoice: "Perguntas provocativas que fazem pensar ('Quando você parou de sonhar?'). Comparações 1% vs 99% (não pessoas específicas, mas mentalidades). Usa CAPS para ênfase estratégica. Vulnerabilidade + ação (mostra erros MAS sempre com lição). Building in public total (números, processo, falhas). Não promete fácil, promete real. Fala a verdade que outros têm medo de falar.",
      comoPessoasDescrevem: "Movimento de elite mas acessível (se você for comprometido). Comunidade que realmente se importa. Transparência que não vê em outros lugares. Conteúdo profundo, não raso. Exclusivo mas não elitista. Resultados reais, não teoria vazia. Energia que inspira ação. Verdades duras ditas com empatia.",
      transformation: "OnePercent transforma pessoas de: Dispersas → Focadas | Teóricas → Executoras | Sozinhas → Comunidade de elite | Paralisadas → Em ação (0→1) | Planejando eternamente → Executando imperfeito | Esperando permissão → Decidindo e agindo | Buscando motivação → Construindo sistemas",
      experienciasMarcantes: "Fundado por quem já faturou milhões mas descobriu que dispersão (não capacidade) é o maior bloqueio da maioria. Movimento criado para resolver isso: foco radical + comunidade + sistemas práticos. Building in public desde dia 1 - transparência sobre processo, erros, aprendizados. Manual de marca profissional reflete seriedade do movimento.",
      frameworks: [
        "Sistema 1% - Melhoria incremental diária (1.01^365 = 37.78)",
        "0→1 Framework - Primeiro passo imperfeito > plano perfeito",
        "Mindset Awakening - Reativar sonhos sem culpa",
        "Habit Architecture - James Clear (Hábitos Atômicos) aplicado",
        "Alex Hormozi - Value Equation (Dream Outcome, Perceived Likelihood, Time Delay, Effort)",
        "Building in Public - Transparência radical como estratégia"
      ],
      perfilCompleto: {
        essenciaMovimento: "OnePercent é para quem rejeita mediocridade mas não aceita promessas vazias. É para quem quer transformação REAL: mentalidade primeiro (Awakening), sistemas depois (Habits), ação imperfeita sempre (First Steps), comunidade de suporte (Identity). Resultados financeiros como consequência natural de alinhamento, não como promessa inicial. É exclusivo porque protegemos energia - não porque somos elitistas.",
        rituais: [
          "Daily 1% Commitment (check-in diário no app)",
          "Weekly Wins (compartilhar vitórias na comunidade)",
          "Monthly Reviews (evolução de 30 dias)",
          "Quarterly Milestones (celebrar 90 dias de progresso)"
        ],
        linguagemPropria: [
          "1%er (membro da comunidade)",
          "'Are you 1% committed?' (desafio/pergunta identidade)",
          "'Link na bio' (CTA padrão)",
          "% (isotipo como símbolo de identidade)",
          "Building in public (filosofia de transparência)",
          "'Você não está preso, está disperso' (diagnóstico chave)",
          "'Quando você parou de sonhar?' (pergunta provocativa marca)"
        ],
        statusLevels: [
          "Visitor (fez assessment, está conhecendo)",
          "Founder (primeiros 100 membros, status vitalício, R$ 497/mês)",
          "Core Member (membro Foundation, em transformação)",
          "Builder (passou para fase 2, criando)",
          "Accelerator (fase 3, escalando)"
        ]
      }
    },
    contexto_adicional: `IDENTIDADE VISUAL:

Manual de Marca OnePercent:
- Logo: Isotipo % (símbolo de porcentagem) + Logotipo "OnePercent" (Sofia Pro)
- Conceito: Dois círculos = rotina exaustiva comum. Centro destaca quem rompe com o ciclo. Dois caminhos (A e B) = alternativas para prosperidade.
- Cores Primárias: Preto #000000 (Grafite Black, Pantone Black 6C), Cinzas (Grafite Mid/Light, Dusty #DCDCDC), Branco #FFFFFF (Snow White)
- Cores Secundárias: Roxo Gradiente #727AFF (Purple Mind) → #684CFF (Purple Smart), Pantone 272C/2735C
- Tipografia: Sofia Pro (8 estilos) - elegante, versátil, tipo display, moderna, acessível mas premium
- Regras: Logotipo só em Preto ou Branco. Isotipo % em Preto, Branco ou Roxo (gradiente). Fundo preto com texto branco ou vice-versa.
- Proibições: Alterar proporções, cores diferentes (além de preto/branco no logo), degradês no logotipo, 3D/sombreamento, adicionar efeitos.
- Estética: Minimalista, premium, exclusivo, clean. Visual sofisticado que comunica seriedade e alto padrão.

ESTRATÉGIA DE CONTEÚDO:

Frequência:
- Instagram: 3 feed posts/semana (Seg/Qua/Sex), 5-6 reels/semana (Seg-Sáb), Stories diários (3-5 mínimo)
- TikTok: 5-7 vídeos/semana (repost de reels IG + conteúdo exclusivo)
- Batching: 1 dia/semana (Quarta) cria 21 conteúdos para 3 semanas. Segunda: planning. Quinta: automação/agendamento. Resto: engagement (30min/dia).

CTAs:
- Link na bio → Assessment
- Descubra se você é 1%
- Tag @onepercent
- Compartilha nos stories: "Hoje fui 1% melhor em ___"

Hashtags: #OnePercent #Mentalidade #Transformacao #Habitos #Foco #Disciplina #Crescimento #DesenvolvimentoPessoal

FASE DE CRESCIMENTO (Dias 1-90):
- Objetivo: Crescer 0→10k seguidores. NÃO vender ainda. Criar demanda, posicionar marca, gerar senso de exclusividade e movimento.
- Anti-patterns: Não dispersar em múltiplos canais. Não lançar antes de métricas (5k seguidores, 8% engagement, 300 assessments, 10+ DMs/semana "como entro?").
- Métricas: Semana 4: 1k seguidores | Semana 8: 3k | Semana 12: 10k. Engagement >7%. Conversão post→assessment >5%.

FASE LANÇAMENTO (Fase 2):
- Objetivo: Lançar OnePercent 0→1 Foundation com 50-100 Fundadores (R$ 497/mês vitalício)
- MRR: R$ 25-50k/mês (base inicial)
- Taxa Conversão: 10-20% da waitlist
- NPS: 9+ (fundadores amam)

DIFERENCIAL CHAVE: Transparência radical (mostra números, processo, erros) + Exclusividade com propósito (não qualquer um entra) + Frameworks científicos (não motivação vazia) + Building in public (constrói movimento ao vivo) + Foco 0→1 (ajuda quem está em zero dar o primeiro passo).`
  };

  // Upsert no profile_context
  const { data, error } = await supabase
    .from('profile_context')
    .upsert(contextData, {
      onConflict: 'profile_id',
      returning: 'representation'
    })
    .select();

  if (error) {
    console.error('❌ Erro ao atualizar contexto:', error);
    return;
  }

  console.log('✅ Contexto atualizado com sucesso!');
  console.log('\nVerificando resultado...\n');

  // Buscar e exibir o resultado
  const { data: result, error: fetchError } = await supabase
    .from('profile_context')
    .select('profile_id, identity, content_pillars, business, updated_at')
    .eq('profile_id', PROFILE_ID)
    .single();

  if (fetchError) {
    console.error('Erro ao buscar resultado:', fetchError);
  } else {
    console.log('📊 Dados atualizados:');
    console.log(`   - Display Name: ${result.identity?.displayName}`);
    console.log(`   - Positioning: ${result.identity?.positioning?.substring(0, 100)}...`);
    console.log(`   - Pilares de Conteúdo: ${result.content_pillars?.length}`);
    result.content_pillars?.forEach((pilar, i) => {
      console.log(`     ${i + 1}. ${pilar.name} (${pilar.weight})`);
    });
    console.log(`   - Produtos: ${result.business?.products?.length}`);
    result.business?.products?.forEach((produto, i) => {
      console.log(`     ${i + 1}. ${produto.name} - ${produto.price}`);
    });
    console.log(`   - Última atualização: ${result.updated_at}`);
  }

  console.log('\n✨ Processo concluído!');
}

updateContext().catch(console.error);
