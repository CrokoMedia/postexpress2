#!/usr/bin/env node
/**
 * Script para inserir 5 carrosséis Gary Vee Style no banco
 * Perfil: Karla Pazos (9ebce906-35c4-408c-a73b-c5211a927ad9)
 *
 * Uso: node scripts/insert-5-carousels-gary-vee.cjs
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROFILE_ID = '9ebce906-35c4-408c-a73b-c5211a927ad9';

// Função para converter slides do formato Gary para o formato do banco
function convertToCarousel(carousel) {
  return {
    titulo: carousel.title,
    tipo: carousel.type,
    objetivo: carousel.objective,
    baseado_em: "Gary Vaynerchuk - Document Don't Create + Pirâmide Invertida",
    approved: null,
    slides: carousel.slides.map(slide => ({
      numero: slide.slideNumber,
      tipo: slide.slideNumber === 1 ? 'hook' :
            slide.slideNumber === carousel.slides.length ? 'cta' : 'conteudo',
      titulo: slide.title,
      corpo: slide.content,
      subtitulo: slide.subtitle || undefined
    })),
    caption: carousel.caption,
    hashtags: carousel.hashtags,
    cta: carousel.slides[carousel.slides.length - 1].content
  };
}

const rawCarousels = [
  {
    title: "7 erros que custaram R$ 300k (e como evitá-los)",
    type: "educacional",
    platform: "Instagram",
    objective: "Posicionamento de Autoridade",
    slides: [
      {slideNumber: 1, title: "7 erros que custaram R$ 300k", subtitle: "(e como evitá-los agora)", content: "Montei e encerrei operação de milhões. Aprendi na dor. Você não precisa."},
      {slideNumber: 2, title: "ERRO 1: Seguir tendências cegas", subtitle: null, content: "Copiei trends virais sem analisar dados.\n\nResultado: 100k visualizações, ZERO conversão.\n\nO certo: Document, don't create. Capture o que funciona NO SEU nicho."},
      {slideNumber: 3, title: "ERRO 2: Vender a alma por dinheiro", subtitle: null, content: "Escala de milhões? Sim.\nAlinhamento de valores? Zero.\n\nEncerrei a operação.\n\nO certo: Impacto real > Métricas de vaidade."},
      {slideNumber: 4, title: "ERRO 3: Dispersão em 10 coisas", subtitle: null, content: "Tentei fazer tudo ao mesmo tempo.\n\nResultado: 10 projetos pela metade.\n\nO certo: FOCO em 1 coisa por 90 dias. Macro patience, micro speed."},
      {slideNumber: 5, title: "ERRO 4: Confundir engajamento com conversão", subtitle: null, content: "Post viral = ego inflado.\nConta bancária = mesma.\n\nO certo: Expert gera CONVERSÃO. Influencer gera engajamento."},
      {slideNumber: 6, title: "ERRO 5: IA genérica sem estratégia", subtitle: null, content: "Usei ChatGPT pra tudo.\n\nResultado: Conteúdo sem alma.\n\nO certo: IA + Frameworks científicos + seu DNA = autenticidade escalável."},
      {slideNumber: 7, title: "ERRO 6: Perfeccionismo que paralisa", subtitle: null, content: "Fiquei 3 meses 'ajustando' a oferta.\n\nResultado: R$ 0 de faturamento.\n\nO certo: Ação > Perfeição. Lançar e ajustar."},
      {slideNumber: 8, title: "ERRO 7: Copiar sem entender", subtitle: null, content: "Copiei funis de guru americano.\n\nResultado: Não funcionou no Brasil.\n\nO certo: Adaptar estratégia pro SEU contexto."},
      {slideNumber: 9, title: "O que mudei (e você pode aplicar HOJE)", subtitle: null, content: "✅ Foco: 1 oferta, 90 dias\n✅ Estratégia científica (Hormozi + Schwartz)\n✅ IA com contexto (não genérica)\n✅ Posicionamento > Seguidores"},
      {slideNumber: 10, title: "Qual desses erros você comete?", subtitle: "Seja honesto nos comentários 👇", content: "Salva esse post pra revisar toda semana.\n\nSeguir @karlapazos.ai pra mais estratégias sem enrolação."}
    ],
    caption: "16 anos empreendendo me ensinaram: errar é caro, aprender com os erros dos outros é grátis.\n\nEsses 7 erros custaram R$ 300k+ (operação encerrada por desalinhamento de valores).\n\nMas cada erro virou aprendizado.\n\nAgora aplico IA + frameworks científicos pra ajudar experts a NÃO cometerem os mesmos erros.\n\n👉 Qual desses erros você mais se identifica? Comenta o número (1 a 7).\n\n#posicionamentodigital #marketingdigital #empreendedorismo #expertdigital #karlapazos",
    hashtags: ["#posicionamentodigital", "#marketingdigital", "#empreendedorismo", "#expertdigital", "#iaparanegocios"]
  },
  {
    title: "ChatGPT gera conteúdo genérico. Eu gero conteúdo com DNA.",
    type: "autoridade",
    platform: "Instagram",
    objective: "IA Estratégica",
    slides: [
      {slideNumber: 1, title: "ChatGPT gera conteúdo genérico.", subtitle: "Eu gero conteúdo com DNA.", content: "A diferença? Frameworks científicos + contexto profundo."},
      {slideNumber: 2, title: "O problema do ChatGPT:", subtitle: "Todo mundo usa o mesmo prompt", content: "Resultado:\n• Copy sem personalidade\n• Hooks fracos\n• Zero autenticidade\n\nSeu conteúdo vira commodity."},
      {slideNumber: 3, title: "Minha abordagem:", subtitle: "IA + 12 Frameworks Científicos", content: "• Hormozi (Value Equation)\n• Schwartz (Awareness Stages)\n• Kahneman (Gatilhos Mentais)\n• +9 mentes milionárias\n\n= Conteúdo estratégico, não genérico."},
      {slideNumber: 4, title: "Exemplo prático:", subtitle: "Hook de carrossel", content: "ChatGPT:\n\"5 dicas de marketing\"\n\nPost Express:\n\"5 erros de copy que custaram R$ 127k (dados reais da auditoria)\"\n\nVê a diferença?"},
      {slideNumber: 5, title: "Como funciona o Post Express:", subtitle: null, content: "1. Analisa SEU perfil (não template)\n2. 12 mentes avaliam SEU conteúdo\n3. Gera copy com SEU DNA\n4. Frameworks científicos aplicados\n\nAutenticidade + Estratégia."},
      {slideNumber: 6, title: "Resultado:", subtitle: "Conteúdo que soa como VOCÊ", content: "Não como todo mundo.\n\nIA potencializa sua voz.\nNão substitui.\n\nDocument, don't create."},
      {slideNumber: 7, title: "A fórmula completa:", subtitle: null, content: "Seu DNA de conteúdo\n+\n12 Frameworks científicos\n+\nIA contextual\n=\nPosicionamento de autoridade"},
      {slideNumber: 8, title: "Quer testar?", subtitle: "Link na bio → Post Express", content: "Auditoria gratuita do seu perfil.\n\n12 mentes analisam seu conteúdo.\n\nDescubra o que está funcionando (e o que não está)."}
    ],
    caption: "IA sem estratégia = escalar o erro.\n\nIA + Frameworks científicos + SEU DNA = autenticidade escalável.\n\nConstruí o Post Express porque cansei de ver creators usando ChatGPT genérico e reclamando que \"IA não funciona\".\n\nNão é a IA. É a FALTA de estratégia.\n\n12 mentes milionárias (Hormozi, Schwartz, Kahneman...) analisam SEU conteúdo e geram copy com SEU DNA.\n\nAutenticidade > Cópia.\nEstratégia científica > Achismo.\n\n👉 Quer testar? Link na bio pra auditoria gratuita.\n\n#ia #inteligenciaartificial #chatgpt #marketingdigital #conteudoestratégico",
    hashtags: ["#ia", "#chatgpt", "#marketingdigital", "#conteudoestratégico", "#karlapazos"]
  },
  // Carrosséis 3, 4 e 5 foram removidos por limite de tamanho - execute 2 de cada vez
];

async function insertCarousels() {
  console.log('🚀 Inserindo carrosséis Gary Vee Style (Batch 1/3)...\n');

  const { data: audits } = await supabase
    .from('audits')
    .select('id')
    .eq('profile_id', PROFILE_ID)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!audits || audits.length === 0) {
    console.error('❌ Nenhuma auditoria encontrada');
    return;
  }

  const auditId = audits[0].id;
  console.log(`✅ Audit ID: ${auditId}\n`);

  const carousels = rawCarousels.map(convertToCarousel);

  const contentJson = {
    carousels: carousels,
    estrategia_geral: "Gary Vee Style - Document Don't Create: Conteúdo baseado em experiências reais da Karla, usando frameworks de Day Trading Attention, Pirâmide Invertida e Macro Patience/Micro Speed. Proporção 3:1 educacional/vendas (Jab Jab Jab Right Hook).",
    proximos_passos: [
      "Gerar slides visuais para os carrosséis aprovados",
      "Agendar publicação conforme calendário editorial",
      "Monitorar métricas de engagement e conversão",
      "Derivar conteúdo adicional (Reels, posts curtos) a partir destes carrosséis"
    ]
  };

  const { data, error } = await supabase
    .from('content_suggestions')
    .insert({
      audit_id: auditId,
      profile_id: PROFILE_ID,
      content_json: contentJson
    })
    .select()
    .single();

  if (error) {
    console.error(`❌ Erro: ${error.message}`);
  } else {
    console.log(`✅ ${carousels.length} carrosséis inseridos! ID: ${data.id}`);
    console.log(`\n📍 Acesse: http://localhost:3000/dashboard/audits/${auditId}/create-content`);
    console.log('\n🎯 Frameworks Gary Vee aplicados:');
    console.log('  ✓ Document Don\'t Create');
    console.log('  ✓ Day Trading Attention');
    console.log('  ✓ Macro Patience, Micro Speed');
    console.log('  ✓ Jab Jab Jab Right Hook (proporção 3:1)');
  }
}

insertCarousels().catch(console.error);
