require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUDIT_ID = '5f9abde1-b974-4759-9f28-bb787dc59ab7';

const garyCarousels = [
  {
    titulo: '7 erros que custaram R$ 300k (e como evitá-los)',
    tipo: 'educacional',
    objetivo: 'Posicionamento de Autoridade',
    baseado_em: 'Gary Vaynerchuk - Document Don\'t Create',
    approved: null,
    slides: [
      {numero: 1, tipo: 'hook', titulo: '7 erros que custaram R$ 300k', corpo: 'Montei e encerrei operação de milhões. Aprendi na dor. Você não precisa.', subtitulo: '(e como evitá-los agora)'},
      {numero: 2, tipo: 'conteudo', titulo: 'ERRO 1: Seguir tendências cegas', corpo: 'Copiei trends virais sem analisar dados.\n\nResultado: 100k visualizações, ZERO conversão.\n\nO certo: Document, don\'t create. Capture o que funciona NO SEU nicho.'},
      {numero: 3, tipo: 'conteudo', titulo: 'ERRO 2: Vender a alma por dinheiro', corpo: 'Escala de milhões? Sim.\nAlinhamento de valores? Zero.\n\nEncerrei a operação.\n\nO certo: Impacto real > Métricas de vaidade.'},
      {numero: 4, tipo: 'conteudo', titulo: 'ERRO 3: Dispersão em 10 coisas', corpo: 'Tentei fazer tudo ao mesmo tempo.\n\nResultado: 10 projetos pela metade.\n\nO certo: FOCO em 1 coisa por 90 dias. Macro patience, micro speed.'},
      {numero: 5, tipo: 'conteudo', titulo: 'ERRO 4: Confundir engajamento com conversão', corpo: 'Post viral = ego inflado.\nConta bancária = mesma.\n\nO certo: Expert gera CONVERSÃO. Influencer gera engajamento.'},
      {numero: 6, tipo: 'conteudo', titulo: 'ERRO 5: IA genérica sem estratégia', corpo: 'Usei ChatGPT pra tudo.\n\nResultado: Conteúdo sem alma.\n\nO certo: IA + Frameworks científicos + seu DNA = autenticidade escalável.'},
      {numero: 7, tipo: 'conteudo', titulo: 'ERRO 6: Perfeccionismo que paralisa', corpo: 'Fiquei 3 meses ajustando a oferta.\n\nResultado: R$ 0 de faturamento.\n\nO certo: Ação > Perfeição. Lançar e ajustar.'},
      {numero: 8, tipo: 'conteudo', titulo: 'ERRO 7: Copiar sem entender', corpo: 'Copiei funis de guru americano.\n\nResultado: Não funcionou no Brasil.\n\nO certo: Adaptar estratégia pro SEU contexto.'},
      {numero: 9, tipo: 'conteudo', titulo: 'O que mudei (e você pode aplicar HOJE)', corpo: '✅ Foco: 1 oferta, 90 dias\n✅ Estratégia científica (Hormozi + Schwartz)\n✅ IA com contexto (não genérica)\n✅ Posicionamento > Seguidores'},
      {numero: 10, tipo: 'cta', titulo: 'Qual desses erros você comete?', corpo: 'Salva esse post pra revisar toda semana.\n\nSeguir @karlapazos.ai pra mais estratégias sem enrolação.', subtitulo: 'Seja honesto nos comentários 👇'}
    ],
    caption: '16 anos empreendendo me ensinaram: errar é caro, aprender com os erros dos outros é grátis.\n\nEsses 7 erros custaram R$ 300k+ (operação encerrada por desalinhamento de valores).\n\nAgora aplico IA + frameworks científicos pra ajudar experts a NÃO cometerem os mesmos erros.\n\n👉 Qual desses erros você mais se identifica? Comenta o número (1 a 7).',
    hashtags: ['posicionamentodigital', 'marketingdigital', 'empreendedorismo', 'expertdigital'],
    cta: 'Comenta o número do erro que mais te identifica'
  },
  {
    titulo: 'ChatGPT gera conteúdo genérico. Eu gero com DNA.',
    tipo: 'autoridade',
    objetivo: 'IA Estratégica',
    baseado_em: 'Gary Vaynerchuk - Autenticidade vs Fabricação',
    approved: null,
    slides: [
      {numero: 1, tipo: 'hook', titulo: 'ChatGPT gera conteúdo genérico.', corpo: 'A diferença? Frameworks científicos + contexto profundo.', subtitulo: 'Eu gero conteúdo com DNA.'},
      {numero: 2, tipo: 'conteudo', titulo: 'O problema do ChatGPT:', corpo: 'Resultado:\n• Copy sem personalidade\n• Hooks fracos\n• Zero autenticidade\n\nSeu conteúdo vira commodity.', subtitulo: 'Todo mundo usa o mesmo prompt'},
      {numero: 3, tipo: 'conteudo', titulo: 'Minha abordagem:', corpo: '• Hormozi (Value Equation)\n• Schwartz (Awareness Stages)\n• Kahneman (Gatilhos Mentais)\n• +9 mentes milionárias\n\n= Conteúdo estratégico, não genérico.', subtitulo: 'IA + 12 Frameworks Científicos'},
      {numero: 4, tipo: 'conteudo', titulo: 'Exemplo prático:', corpo: 'ChatGPT:\n\"5 dicas de marketing\"\n\nPost Express:\n\"5 erros de copy que custaram R$ 127k (dados reais da auditoria)\"\n\nVê a diferença?', subtitulo: 'Hook de carrossel'},
      {numero: 5, tipo: 'conteudo', titulo: 'Como funciona o Post Express:', corpo: '1. Analisa SEU perfil (não template)\n2. 12 mentes avaliam SEU conteúdo\n3. Gera copy com SEU DNA\n4. Frameworks científicos aplicados\n\nAutenticidade + Estratégia.'},
      {numero: 6, tipo: 'conteudo', titulo: 'Resultado:', corpo: 'Não como todo mundo.\n\nIA potencializa sua voz.\nNão substitui.\n\nDocument, don\'t create.', subtitulo: 'Conteúdo que soa como VOCÊ'},
      {numero: 7, tipo: 'conteudo', titulo: 'A fórmula completa:', corpo: 'Seu DNA de conteúdo\n+\n12 Frameworks científicos\n+\nIA contextual\n=\nPosicionamento de autoridade'},
      {numero: 8, tipo: 'cta', titulo: 'Quer testar?', corpo: 'Auditoria gratuita do seu perfil.\n\n12 mentes analisam seu conteúdo.\n\nDescubra o que está funcionando (e o que não está).', subtitulo: 'Link na bio → Post Express'}
    ],
    caption: 'IA sem estratégia = escalar o erro.\n\nIA + Frameworks científicos + SEU DNA = autenticidade escalável.\n\n12 mentes milionárias analisam SEU conteúdo e geram copy com SEU DNA.\n\nAutenticidade > Cópia.\nEstratégia científica > Achismo.',
    hashtags: ['ia', 'chatgpt', 'marketingdigital', 'conteudoestratégico'],
    cta: 'Link na bio para auditoria gratuita'
  },
  {
    titulo: 'Expert mas Instagram não reflete isso?',
    tipo: 'vendas',
    objetivo: 'Posicionamento de Autoridade',
    baseado_em: 'Gary Vaynerchuk - Jab Jab Jab Right Hook',
    approved: null,
    slides: [
      {numero: 1, tipo: 'hook', titulo: 'Expert em [sua área]', corpo: 'O problema não é você.\nÉ seu conteúdo sem estratégia.', subtitulo: 'mas Instagram não reflete isso?'},
      {numero: 2, tipo: 'conteudo', titulo: 'A DOR:', corpo: 'Mas seu perfil parece amador.\n\nResultados reais na vida.\nPerfil genérico no Instagram.\n\nAudiência não vê seu valor.', subtitulo: 'Você sabe que é foda'},
      {numero: 3, tipo: 'conteudo', titulo: 'Por que acontece:', corpo: '1. Conteúdo achista (não data-driven)\n2. Sem posicionamento claro\n3. Copy fraco (não usa frameworks)\n\nExpertise invisível.', subtitulo: '3 motivos'},
      {numero: 4, tipo: 'conteudo', titulo: 'O custo de NÃO resolver:', corpo: '• Clientes vão pra concorrentes menos qualificados\n• Cobrar menos que vale\n• Esforço sem conversão\n\nQuanto você perde por mês?'},
      {numero: 5, tipo: 'conteudo', titulo: 'A solução:', corpo: 'Post Express:\n\n✅ Analisa seu perfil em 3 min\n✅ 5 frameworks científicos\n✅ Identifica o que falta\n✅ Gera copy estratégico', subtitulo: 'Auditoria profissional + Estratégia'},
      {numero: 6, tipo: 'conteudo', titulo: 'Como funciona:', corpo: '1. Cole @ do seu perfil\n2. IA analisa 10 últimos posts\n3. 12 mentes avaliam (Hormozi, Schwartz...)\n4. Recebe auditoria + plano de ação\n\n3 minutos. Dados reais.'},
      {numero: 7, tipo: 'conteudo', titulo: 'Transformação entregue:', corpo: 'ANTES:\n\"Não sei o que postar\"\n\nDEPOIS:\n\"20 ideias acionáveis baseadas no que meu público QUER\"\n\nDe achista pra estrategista.'},
      {numero: 8, tipo: 'conteudo', titulo: 'Oferta:', corpo: '3 auditorias grátis pra testar.\n\nSem cartão. Sem enrolação.\n\nLink na bio → Post Express', subtitulo: 'Auditoria GRATUITA'},
      {numero: 9, tipo: 'conteudo', titulo: 'Por que confiar em mim?', corpo: '16 anos empreendendo.\nFaturei milhões (e encerrei operação por valores).\n\nAgora aplico IA + ciência pra ajudar experts.\n\nSem promessa vazia.'},
      {numero: 10, tipo: 'cta', titulo: 'Qual você escolhe?', corpo: 'Opção A: Continuar postando no achismo\n\nOpção B: Virar estrategista data-driven em 3 minutos\n\nComenta A ou B 👇'}
    ],
    caption: 'Você É expert. Seu Instagram que não mostra isso.\n\nQuanto isso custa por mês?\n\nConstruí o Post Express pra resolver EXATAMENTE isso.\n\n5 frameworks científicos analisam seu perfil em 3 minutos.\n\nDe achista pra estrategista.\n\n👉 3 auditorias GRÁTIS. Link na bio.',
    hashtags: ['posicionamento', 'expertdigital', 'marketingdigital', 'auditoria'],
    cta: 'Comenta A ou B'
  },
  {
    titulo: 'R$ 97 vs R$ 8.888: mesma expertise, preço diferente',
    tipo: 'autoridade',
    objetivo: 'Monetização & Ofertas',
    baseado_em: 'Gary Vaynerchuk + Alex Hormozi Value Equation',
    approved: null,
    slides: [
      {numero: 1, tipo: 'hook', titulo: 'R$ 97 de infoproduto vs R$ 8.888 de mentoria', corpo: 'Mesma expertise.\nPosicionamento diferente.'},
      {numero: 2, tipo: 'conteudo', titulo: 'Framework: Value Equation (Hormozi)', corpo: 'Valor Percebido =\n\n(Sonho Resultado × Probabilidade de Sucesso)\n÷\n(Tempo × Esforço)\n\nMesmo produto. Percepção diferente.'},
      {numero: 3, tipo: 'conteudo', titulo: 'R$ 97 = Self-service', corpo: '• Vídeo-aula gravada\n• \"Faça você mesmo\"\n• Alta incerteza\n• Baixa exclusividade\n\nValor percebido: BAIXO'},
      {numero: 4, tipo: 'conteudo', titulo: 'R$ 8.888 = Transformação garantida', corpo: '• Mentoria 1:1\n• Acelera resultado\n• Baixo risco\n• Exclusivo\n\nValor percebido: ALTO'},
      {numero: 5, tipo: 'conteudo', titulo: 'O segredo:', corpo: 'Infoproduto: Conhecimento bruto\n\nMentoria: Conhecimento + Implementação + Accountability\n\nQual tem mais valor?', subtitulo: 'Não é o conteúdo. É o DELIVERY.'},
      {numero: 6, tipo: 'conteudo', titulo: 'Como aplicar na SUA oferta:', corpo: 'Pergunta:\n\nSeu produto aumenta o SONHO RESULTADO?\n\nOu só entrega informação?'},
      {numero: 7, tipo: 'conteudo', titulo: 'Os 3 tiers que uso:', corpo: 'Tier 1: Auditoria gratuita (lead magnet)\n\nTier 2: Framework completo R$ 997 (self-service)\n\nTier 3: Mentoria IA R$ 8.888/mês (feito com você)\n\nCada tier resolve uma dor diferente.'},
      {numero: 8, tipo: 'conteudo', titulo: 'Resultado:', corpo: 'Mesma expertise.\n3 ofertas.\n3 faixas de preço.\n\nCliente escolhe o nível de suporte que quer.\n\nVocê monetiza em escala.'},
      {numero: 9, tipo: 'cta', titulo: 'Quer estruturar SUA oferta assim?', corpo: 'Comenta \"OFERTA\" que mando o framework completo.\n\nOu me segue pra mais estratégias de monetização científica.\n\n@karlapazos.ai'}
    ],
    caption: 'Mesma expertise. Preços diferentes. Por quê?\n\nPorque VALOR PERCEBIDO ≠ Conhecimento entregue.\n\nVocê pode (e deve) ter os 3 tiers:\n1. Self-service (R$ 97-497)\n2. Group (R$ 997-2.997)\n3. Done-with-you (R$ 5k-15k/mês)\n\nCada tier resolve uma dor. Cada tier monetiza diferente.\n\n👉 Quer estruturar SUA oferta assim? Comenta \"OFERTA\".',
    hashtags: ['monetizacao', 'infoproduto', 'mentoria', 'hormozi', 'estrategia'],
    cta: 'Comenta OFERTA'
  },
  {
    titulo: '1 livestream = 30 peças de conteúdo',
    tipo: 'educacional',
    objetivo: 'IA Estratégica',
    baseado_em: 'Gary Vaynerchuk - Pirâmide Invertida',
    approved: null,
    slides: [
      {numero: 1, tipo: 'hook', titulo: '1 livestream = 30 peças de conteúdo', corpo: 'Pirâmide Invertida do Gary Vee.\nDocument, don\'t create.'},
      {numero: 2, tipo: 'conteudo', titulo: 'O problema:', corpo: '• \"Não sei o que postar\"\n• 4 horas travado sem ideia\n• Burnout criativo\n\nExiste jeito melhor.', subtitulo: 'Você cria do zero toda hora'},
      {numero: 3, tipo: 'conteudo', titulo: 'A solução: Pirâmide Invertida', corpo: '1 conteúdo PILAR (live, podcast, keynote)\n↓\n30+ peças derivadas\n\nCria 1 vez. Distribui 30.'},
      {numero: 4, tipo: 'conteudo', titulo: 'Exemplo prático:', corpo: '• 10 clips curtos (Reels/TikTok)\n• 10 posts de texto (LinkedIn/X)\n• 5 carrosséis educacionais\n• 5 quotes visuais\n\nTotal: 30 peças', subtitulo: '1 live de 60 min vira:'},
      {numero: 5, tipo: 'conteudo', titulo: 'Como fazer:', corpo: '1. Cria conteúdo pilar (live, webinar)\n2. Transcreve (IA)\n3. Extrai insights principais\n4. Adapta pra cada plataforma\n5. Distribui ao longo do mês', subtitulo: 'Passo a passo'},
      {numero: 6, tipo: 'conteudo', titulo: 'Document, don\'t create', corpo: 'Não \"cria\" conteúdo do zero.\n\nCAPTURA o que você JÁ FAZ.\n\nReunião → 5 insights\nConversa → 3 posts\nLive → 30 peças', subtitulo: 'Framework do Gary Vee'},
      {numero: 7, tipo: 'conteudo', titulo: 'Vantagem #1: Autenticidade', corpo: 'Conteúdo pilar = você sendo você.\n\nNão \"fabricando\" post pra Instagram.\n\nAutêntico > Fabricado'},
      {numero: 8, tipo: 'conteudo', titulo: 'Vantagem #2: Escala sem burnout', corpo: '1 hora criando pilar\n+\n2 horas derivando\n=\n30 peças pro mês\n\nVs 30 horas criando do zero.'},
      {numero: 9, tipo: 'conteudo', titulo: 'Como eu uso:', corpo: 'Mentoria de IA (60 min)\n↓\nGravo insights principais\n↓\nIA transcreve + extrai frameworks\n↓\n5 carrosséis + 10 posts + 10 Reels\n\n1 sessão = 30 dias de conteúdo'},
      {numero: 10, tipo: 'cta', titulo: 'Quer aplicar?', corpo: 'Comece com 1 conteúdo pilar essa semana.\n\nGrave, transcreva, derive.\n\nSalva esse post pra revisar.\n\nSegue @karlapazos.ai pra mais estratégias Gary Vee style.'}
    ],
    caption: 'Burnout criativo?\n\nPara de criar do zero toda hora.\n\nComeça a DOCUMENTAR o que você já faz.\n\nFramework Pirâmide Invertida (Gary Vee):\n\n1 conteúdo PILAR → 30+ peças\n\nCria 1 vez. Distribui 30.\n\nDocument, don\'t create.\n\n👉 Salva pra aplicar essa semana.',
    hashtags: ['garyvee', 'conteudo', 'piramideinvertida', 'estrategia', 'marketingdigital'],
    cta: 'Salva pra aplicar'
  }
];

async function addGaryCarousels() {
  console.log('🚀 Adicionando 5 carrosséis Gary Vee...\n');

  const { data: existing } = await supabase
    .from('content_suggestions')
    .select('content_json')
    .eq('audit_id', AUDIT_ID)
    .single();

  if (!existing) {
    console.log('❌ Nenhum registro encontrado');
    return;
  }

  const currentCarousels = existing.content_json?.carousels || [];
  console.log(`📋 Carrosséis atuais: ${currentCarousels.length}`);

  const allCarousels = [...currentCarousels, ...garyCarousels];

  const updatedContent = {
    carousels: allCarousels,
    estrategia_geral: existing.content_json?.estrategia_geral || '',
    proximos_passos: existing.content_json?.proximos_passos || []
  };

  const { data, error } = await supabase
    .from('content_suggestions')
    .update({ content_json: updatedContent })
    .eq('audit_id', AUDIT_ID)
    .select()
    .single();

  if (error) {
    console.error(`❌ Erro: ${error.message}`);
  } else {
    console.log(`\n✅ Sucesso! Total de carrosséis: ${allCarousels.length}`);
    console.log(`   - Anteriores: ${currentCarousels.length}`);
    console.log(`   - Gary Vee: ${garyCarousels.length}`);
    console.log(`\n📍 http://localhost:3000/dashboard/audits/${AUDIT_ID}/create-content\n`);
    console.log('🎯 Frameworks Gary Vee aplicados:');
    console.log('  ✓ Document Don\'t Create (autenticidade)');
    console.log('  ✓ Pirâmide Invertida (volume)');
    console.log('  ✓ Day Trading Attention (hooks diretos)');
    console.log('  ✓ Jab Jab Jab Right Hook (proporção 3:1)');
  }
}

addGaryCarousels().catch(console.error);
