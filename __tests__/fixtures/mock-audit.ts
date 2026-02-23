/**
 * Mock data para testes E2E
 * Simula auditoria completa com dados realistas
 */

export const mockAudit = {
  id: 'test-audit-123',
  profile_id: 'test-profile-456',
  username: 'test_creator',
  overall_score: 75,
  behavior_score: 80,
  copy_score: 70,
  offers_score: 75,
  metrics_score: 72,
  anomalies_score: 78,
  top_formats: ['Reels', 'Carrossel'],
  brand_colors: ['#FF6B6B', '#4ECDC4', '#1A1A1A'],
  created_at: new Date().toISOString(),
};

export const mockProfile = {
  id: 'test-profile-456',
  username: 'test_creator',
  full_name: 'Test Creator',
  biography: 'Creator de teste para E2E tests',
  followers_count: 15000,
  following_count: 500,
  posts_count: 320,
  profile_pic_url: 'https://via.placeholder.com/150',
  is_verified: false,
  is_business: true,
};

export const mockGeneratedContent = {
  carousels: [
    {
      titulo: 'Carrossel 1: 7 erros de copy que matam conversão',
      tema: 'Copy e Persuasão',
      slides: [
        {
          numero: 1,
          tipo: 'Hook',
          titulo: '7 ERROS de copy que matam sua conversão',
          corpo: 'Você pode ter o melhor produto do mundo...',
        },
        {
          numero: 2,
          tipo: 'Contexto',
          titulo: 'O problema não é o seu produto',
          corpo: 'É como você comunica o valor dele.',
        },
        {
          numero: 3,
          tipo: 'Erro #1',
          titulo: 'Falar de features em vez de benefícios',
          corpo: 'Ninguém compra "software com IA". Compram "economizar 10h/semana".',
        },
        {
          numero: 4,
          tipo: 'Erro #2',
          titulo: 'Não entender o awareness stage',
          corpo: 'Você não pode vender diretamente para quem nem sabe que tem um problema.',
        },
        {
          numero: 5,
          tipo: 'Erro #3',
          titulo: 'Copy genérico demais',
          corpo: '"Aumente suas vendas" vs "Feche 3 clientes a mais este mês sem gastar mais".',
        },
        {
          numero: 6,
          tipo: 'Solução',
          titulo: 'O que fazer?',
          corpo: 'Use os frameworks científicos: Schwartz, Cialdini, Jobs-to-be-Done.',
        },
        {
          numero: 7,
          tipo: 'Resultado',
          titulo: 'Quando você acerta o copy...',
          corpo: 'Conversão pode subir 200-300% com o MESMO produto.',
        },
        {
          numero: 8,
          tipo: 'CTA',
          titulo: 'Quer aprender mais?',
          corpo: 'Link na bio para auditoria gratuita do seu perfil.',
        },
      ],
      caption: 'Copy não é arte, é ciência. 🧪 Salva esse post!',
      hashtags: '#copy #vendas #marketing #persuasao #conversion',
    },
    {
      titulo: 'Carrossel 2: Como aumentar engajamento em 3x',
      tema: 'Engajamento',
      slides: [
        {
          numero: 1,
          tipo: 'Hook',
          titulo: 'TRIPLICAR engajamento sem gastar nada',
          corpo: 'Você não precisa de mais seguidores. Precisa de mais conexão.',
        },
        {
          numero: 2,
          tipo: 'Contexto',
          titulo: 'O Instagram mudou',
          corpo: 'Alcance orgânico caiu 50% desde 2020.',
        },
        {
          numero: 3,
          tipo: 'Hack #1',
          titulo: 'Perguntas nos comentários',
          corpo: 'Descubra exatamente o que seu público quer saber.',
        },
        {
          numero: 4,
          tipo: 'Hack #2',
          titulo: 'Carrosséis salvos',
          corpo: 'Instagram favorece conteúdo que as pessoas salvam.',
        },
        {
          numero: 5,
          tipo: 'Hack #3',
          titulo: 'Tempo de visualização',
          corpo: 'Cada slide deve prender atenção por 3+ segundos.',
        },
        {
          numero: 6,
          tipo: 'Resultado',
          titulo: 'O que muda?',
          corpo: 'Engajamento sobe, alcance sobe, vendas sobem.',
        },
        {
          numero: 7,
          tipo: 'Prova',
          titulo: 'Testamos isso com 50+ perfis',
          corpo: 'Média de crescimento: 287% em 60 dias.',
        },
        {
          numero: 8,
          tipo: 'CTA',
          titulo: 'Quer aplicar isso?',
          corpo: 'Link na bio → Auditoria gratuita.',
        },
      ],
      caption: 'Engajamento é a nova moeda do Instagram. 💰',
      hashtags: '#instagram #engajamento #conteudo #reels #marketing',
    },
    {
      titulo: 'Carrossel 3: 5 frameworks de produto aplicados a conteúdo',
      tema: 'Product Management',
      slides: [
        {
          numero: 1,
          tipo: 'Hook',
          titulo: '5 frameworks de PRODUTO que funcionam em CONTEÚDO',
          corpo: 'Conteúdo é produto. E produto tem ciência.',
        },
        {
          numero: 2,
          tipo: 'Framework #1',
          titulo: 'Jobs-to-be-Done',
          corpo: 'Quando [situação], eu quero [outcome], para [benefício].',
        },
        {
          numero: 3,
          tipo: 'Framework #2',
          titulo: 'North Star Metric',
          corpo: 'Qual é a ÚNICA métrica que importa no seu conteúdo?',
        },
        {
          numero: 4,
          tipo: 'Framework #3',
          titulo: 'Product-Market Fit',
          corpo: 'Seu conteúdo resolve uma dor real ou é só "mais do mesmo"?',
        },
        {
          numero: 5,
          tipo: 'Framework #4',
          titulo: 'Retention Loops',
          corpo: 'Como fazer o público voltar toda semana?',
        },
        {
          numero: 6,
          tipo: 'Framework #5',
          titulo: 'A/B Testing',
          corpo: 'Poste 2 variações do mesmo tema. Veja o que funciona.',
        },
        {
          numero: 7,
          tipo: 'Resultado',
          titulo: 'Quando você trata conteúdo como produto...',
          corpo: 'Você para de adivinhar e começa a SABER o que funciona.',
        },
        {
          numero: 8,
          tipo: 'CTA',
          titulo: 'Quer aplicar isso?',
          corpo: 'Croko Lab faz isso por você. Link na bio.',
        },
      ],
      caption: 'De achista para estrategista. 🎯',
      hashtags: '#product #conteudo #estrategia #marketing #datadriven',
    },
  ],
  estrategia_geral: 'Foco em copywriting científico e frameworks comprovados.',
};

export const mockSmartConfig = {
  template: 'minimalist',
  format: 'feed',
  theme: 'light',
  imageStrategy: {
    0: { // Carrossel 1
      0: { mode: 'no_image' }, // Hook
      1: { mode: 'auto' },
      2: { mode: 'auto' },
      3: { mode: 'auto' },
      4: { mode: 'auto' },
      5: { mode: 'no_image' },
      6: { mode: 'no_image' },
      7: { mode: 'no_image' }, // CTA
    },
    1: { // Carrossel 2
      0: { mode: 'auto' },
      1: { mode: 'auto' },
      2: { mode: 'auto' },
      3: { mode: 'auto' },
      4: { mode: 'auto' },
      5: { mode: 'no_image' },
      6: { mode: 'no_image' },
      7: { mode: 'no_image' },
    },
    2: { // Carrossel 3
      0: { mode: 'auto' },
      1: { mode: 'auto' },
      2: { mode: 'auto' },
      3: { mode: 'auto' },
      4: { mode: 'auto' },
      5: { mode: 'auto' },
      6: { mode: 'no_image' },
      7: { mode: 'no_image' },
    },
  },
};
