/**
 * Gerador de Prompts Contextuais para Gemini Image Generation
 * Analisa o conteúdo do slide e cria prompts ULTRA-ESPECÍFICOS usando
 * Advanced Prompt Engineering Techniques para imagens precisas e contextuais
 *
 * TÉCNICAS APLICADAS:
 * 1. Entity-Specific Templates (logos, dashboards, pessoas, conceitos)
 * 2. Negative Prompts (evitar elementos indesejados)
 * 3. Semantic Layering (priorizar elementos visuais)
 * 4. Style Anchoring (ancorar em estilos reconhecíveis)
 * 5. Context Injection (adicionar contexto real de uso)
 */

import {
  getTemplateForEntity,
  createBrandLogoPrompt,
  createDashboardInterfacePrompt,
  createPersonPortraitPrompt,
  createMarketingConceptPrompt,
  buildSemanticPrompt,
  injectRealWorldContext,
  STYLE_ANCHORS,
  type SemanticLayers,
} from './advanced-prompt-templates'

// Marcas conhecidas que devem mostrar logos/identidade visual
const KNOWN_BRANDS = [
  // Tech Giants
  'Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Facebook', 'Instagram', 'WhatsApp',
  'TikTok', 'YouTube', 'Twitter', 'X', 'LinkedIn', 'Netflix', 'Spotify',

  // Design & Marketing Tools
  'Canva', 'Figma', 'Adobe', 'Photoshop', 'Illustrator', 'Premiere', 'After Effects',
  'MailChimp', 'HubSpot', 'Salesforce', 'Notion', 'Slack', 'Trello', 'Asana',

  // Analytics & SEO
  'Google Analytics', 'Google Search Console', 'SEMrush', 'Ahrefs', 'Moz',
  'Hotjar', 'Mixpanel', 'Amplitude',

  // E-commerce & Payment
  'Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Mercado Pago', 'PagBank',

  // Empresas Brasileiras
  'Nubank', 'Magazine Luiza', 'Magalu', 'Natura', 'O Boticário', 'Havaianas',
  'Ambev', 'Petrobras', 'Vale', 'Itaú', 'Bradesco', 'Banco do Brasil',

  // Fashion & Lifestyle
  'Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Shein', 'Louis Vuitton', 'Gucci',
  'Chanel', 'Rolex', 'Coca-Cola', 'Pepsi', "McDonald's", 'Starbucks',
]

// Ferramentas que devem mostrar interface/painel/dashboard
const TOOL_INTERFACES = [
  'dashboard', 'painel', 'interface', 'tela', 'app', 'aplicativo',
  'plataforma', 'sistema', 'software', 'ferramenta', 'analytics',
  'métricas', 'relatório', 'gráfico', 'chart', 'stats', 'estatísticas',
]

// Pessoas famosas / Experts (buscar fotos profissionais)
const FAMOUS_PEOPLE = [
  // Marketing & Business
  'Gary Vaynerchuk', 'Gary Vee', 'Seth Godin', 'Simon Sinek', 'Tony Robbins',
  'Grant Cardone', 'Alex Hormozi', 'Russell Brunson', 'Neil Patel',

  // Tech & Innovation
  'Elon Musk', 'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos',
  'Tim Cook', 'Sundar Pichai', 'Satya Nadella',

  // Brasil - Empreendedores
  'Flávio Augusto', 'Carlos Wizard', 'Tallis Gomes', 'Cristina Junqueira',
  'Thiago Nigro', 'Primo Rico', 'Nathalia Arcuri', 'Me Poupe',
  'Paulo Vieira', 'Geronimo Theml', 'Camila Farani',

  // Brasil - Marketing/Copy
  'Thiago Finch', 'Ícaro de Carvalho', 'Érico Rocha', 'Bruno Pinheiro',
  'Vinicius Possebon', 'Caio Carneiro', 'Adriano de Marqui',
]

// Conceitos visuais específicos de marketing/negócios
const VISUAL_CONCEPTS = [
  // Marketing
  { keywords: ['anúncio', 'ad', 'campanha'], visual: 'professional advertising campaign mockup' },
  { keywords: ['landing page', 'página de vendas'], visual: 'modern landing page design on laptop screen' },
  { keywords: ['funil', 'funnel'], visual: 'sales funnel diagram infographic' },
  { keywords: ['stories', 'reels'], visual: 'Instagram Stories interface on smartphone' },
  { keywords: ['carrossel'], visual: 'Instagram carousel post mockup' },
  { keywords: ['feed'], visual: 'Instagram feed grid layout' },

  // Business
  { keywords: ['reunião', 'meeting'], visual: 'professional business meeting in modern office' },
  { keywords: ['equipe', 'team'], visual: 'diverse professional team collaboration' },
  { keywords: ['escritório', 'office'], visual: 'modern startup office workspace' },
  { keywords: ['home office'], visual: 'clean home office setup with laptop' },

  // Data & Analytics
  { keywords: ['dados', 'data'], visual: 'data analytics dashboard with charts and graphs' },
  { keywords: ['roi', 'retorno'], visual: 'ROI growth chart financial report' },
  { keywords: ['conversão'], visual: 'conversion rate optimization dashboard' },
  { keywords: ['engajamento', 'engagement'], visual: 'social media engagement metrics dashboard' },

  // E-commerce
  { keywords: ['loja', 'e-commerce'], visual: 'modern e-commerce online store interface' },
  { keywords: ['produto', 'product'], visual: 'professional product photography studio setup' },
  { keywords: ['carrinho', 'checkout'], visual: 'e-commerce checkout page interface' },

  // Content Creation
  { keywords: ['criador', 'creator', 'influencer'], visual: 'content creator recording video with professional setup' },
  { keywords: ['câmera', 'filmagem'], visual: 'professional camera setup for content creation' },
  { keywords: ['edição', 'editing'], visual: 'video editing software interface timeline' },
  { keywords: ['podcast'], visual: 'professional podcast recording studio with microphones' },
]

/**
 * Detecta se o texto menciona marcas conhecidas (busca palavra inteira)
 */
function detectBrands(text: string): string[] {
  const lowerText = text.toLowerCase()
  return KNOWN_BRANDS.filter(brand => {
    const brandLower = brand.toLowerCase()
    // Buscar palavra inteira usando word boundary
    const regex = new RegExp(`\\b${brandLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(lowerText)
  })
}

/**
 * Detecta se o texto menciona interfaces/dashboards/painéis
 */
function detectToolInterface(text: string): boolean {
  const lowerText = text.toLowerCase()
  return TOOL_INTERFACES.some(keyword => lowerText.includes(keyword))
}

/**
 * Detecta se o texto menciona pessoas famosas
 */
function detectFamousPeople(text: string): string[] {
  const lowerText = text.toLowerCase()
  return FAMOUS_PEOPLE.filter(person => {
    const personLower = person.toLowerCase()
    // Buscar nome completo ou apelido
    const regex = new RegExp(`\\b${personLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(lowerText)
  })
}

/**
 * Detecta conceitos visuais específicos baseado em keywords
 */
function detectVisualConcept(text: string): string | null {
  const lowerText = text.toLowerCase()

  for (const concept of VISUAL_CONCEPTS) {
    const hasKeyword = concept.keywords.some(kw => lowerText.includes(kw.toLowerCase()))
    if (hasKeyword) {
      return concept.visual
    }
  }

  return null
}

/**
 * Cria um prompt contextual ULTRA-ESPECÍFICO para Gemini usando Advanced Prompt Engineering
 * baseado no conteúdo do slide + contexto do carrossel
 *
 * FLUXO DE DECISÃO:
 * 1. Detectar pessoas famosas → createPersonPortraitPrompt()
 * 2. Detectar marcas + interface → createDashboardInterfacePrompt()
 * 3. Detectar marcas (só logo) → createBrandLogoPrompt()
 * 4. Detectar conceito visual específico → createMarketingConceptPrompt()
 * 5. Fallback → buildSemanticPrompt() com context injection
 */
export function createContextualImagePrompt(
  slideContent: {
    titulo: string
    corpo: string
    imagemPrompt?: string
  },
  carouselContext: {
    titulo?: string
    objetivo?: string
    tipo?: string
  },
  expertContext?: {
    nicho?: string
    biografia?: string
  }
): string {
  const fullText = [
    slideContent.titulo,
    slideContent.corpo,
    slideContent.imagemPrompt,
    carouselContext.titulo,
    carouselContext.objetivo,
  ]
    .filter(Boolean)
    .join(' ')

  // 1. PESSOAS FAMOSAS → Template de Portrait Profissional
  const people = detectFamousPeople(fullText)
  if (people.length > 0) {
    const mainPerson = people[0]
    console.log(`   🎯 DETECTED: Person → ${mainPerson}`)
    console.log(`   📸 Using: PersonPortraitPrompt template`)
    return createPersonPortraitPrompt(mainPerson)
  }

  // 2. MARCAS → Logo ou Dashboard
  const brands = detectBrands(fullText)
  if (brands.length > 0) {
    const mainBrand = brands[0]
    const hasInterface = detectToolInterface(fullText)

    if (hasInterface) {
      // Marca + Interface → Dashboard Template
      console.log(`   🎯 DETECTED: Brand + Interface → ${mainBrand}`)
      console.log(`   📸 Using: DashboardInterfacePrompt template`)
      return createDashboardInterfacePrompt(mainBrand)
    } else {
      // Marca sozinha → Logo Template
      console.log(`   🎯 DETECTED: Brand Logo → ${mainBrand}`)
      console.log(`   📸 Using: BrandLogoPrompt template`)
      return createBrandLogoPrompt(mainBrand)
    }
  }

  // 3. INTERFACE GENÉRICA (sem marca específica)
  const hasToolInterface = detectToolInterface(fullText)
  if (hasToolInterface && brands.length === 0) {
    console.log(`   🎯 DETECTED: Generic Dashboard Interface`)
    console.log(`   📸 Using: Generic Dashboard template`)

    // Template genérico de dashboard com semantic layering
    const dashboardLayers: SemanticLayers = {
      essential: [
        'professional analytics dashboard interface',
        'modern data visualization',
        'metrics and charts visible',
      ],
      important: [
        'clean UI design',
        'business intelligence dashboard',
        'realistic software interface',
        'high quality screenshot',
      ],
      desirable: [
        'modern laptop display',
        'natural office lighting',
        'professional photography',
      ],
      avoid: [
        'generic stock photo',
        'blurry',
        'low quality',
        'cartoon',
        'illustration',
        'text overlay',
        'watermarks',
      ],
    }

    return buildSemanticPrompt(dashboardLayers)
  }

  // 4. CONCEITOS VISUAIS ESPECÍFICOS (marketing, e-commerce, etc.)
  const visualConcept = detectVisualConcept(fullText)
  if (visualConcept) {
    console.log(`   🎯 DETECTED: Visual Concept → ${visualConcept}`)
    console.log(`   📸 Using: MarketingConceptPrompt template`)

    // Usar template de conceito de marketing com style anchoring
    const conceptPrompt = createMarketingConceptPrompt(
      slideContent.titulo || slideContent.corpo.substring(0, 50),
      visualConcept
    )

    // Adicionar style anchor baseado no tipo de carrossel
    const styleAnchor = getStyleAnchorForCarouselType(carouselContext.tipo)

    return `${conceptPrompt}. ${styleAnchor}`
  }

  // 5. FALLBACK: Semantic Layering + Context Injection
  console.log(`   🎯 DETECTED: Generic Content`)
  console.log(`   📸 Using: SemanticPrompt with Context Injection`)

  const basePrompt = slideContent.imagemPrompt || slideContent.titulo || slideContent.corpo
  const contentDescription = basePrompt || carouselContext.titulo || 'business concept'

  // Construir prompt com semantic layers
  const semanticLayers: SemanticLayers = {
    essential: [
      contentDescription,
      'professional photography',
      'photorealistic',
    ],
    important: [
      'high quality',
      'sharp focus',
      'modern aesthetic',
      'clean composition',
    ],
    desirable: [
      'natural lighting',
      'business context',
      'professional setup',
    ],
    avoid: [
      'generic stock photo',
      'blurry',
      'low quality',
      'text visible',
      'letters',
      'words',
      'typography in the image',
      'watermarks',
      'cartoon',
      'illustration',
    ],
  }

  let finalPrompt = buildSemanticPrompt(semanticLayers)

  // Adicionar contexto real de uso (context injection)
  finalPrompt = injectRealWorldContext(finalPrompt, {
    industry: expertContext?.nicho,
    useCase: carouselContext.tipo,
    target: carouselContext.objetivo,
  })

  return finalPrompt
}

/**
 * Helper: Retorna style anchor apropriado baseado no tipo de carrossel
 */
function getStyleAnchorForCarouselType(tipo?: string): string {
  if (!tipo) return STYLE_ANCHORS.marketingEditorial

  const tipoMap: Record<string, string> = {
    'educacional': STYLE_ANCHORS.softwareUI,
    'vendas': STYLE_ANCHORS.brandCommercial,
    'autoridade': STYLE_ANCHORS.keynotePortrait,
    'viral': STYLE_ANCHORS.marketingEditorial,
  }

  return tipoMap[tipo] || STYLE_ANCHORS.marketingEditorial
}

/**
 * Wrapper simplificado para uso direto (compatibilidade retroativa)
 */
export function getSmartImagePrompt(
  titulo: string,
  corpo: string,
  imagemPrompt: string | undefined,
  carouselTitle: string | undefined,
  carouselObjective: string | undefined,
  nicho?: string
): string {
  console.log(`\n🧠 === SMART IMAGE PROMPT GENERATION ===`)
  console.log(`   Input - Título: "${titulo.substring(0, 50)}..."`)
  console.log(`   Input - Corpo: "${corpo.substring(0, 50)}..."`)
  if (imagemPrompt) console.log(`   Input - ImagemPrompt: "${imagemPrompt.substring(0, 50)}..."`)

  const prompt = createContextualImagePrompt(
    { titulo, corpo, imagemPrompt },
    { titulo: carouselTitle, objetivo: carouselObjective },
    { nicho }
  )

  console.log(`   ✅ Generated Prompt (${prompt.length} chars)`)
  console.log(`   Preview: "${prompt.substring(0, 200)}..."`)
  console.log(`🧠 === END ===\n`)

  return prompt
}
