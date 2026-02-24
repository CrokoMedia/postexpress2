/**
 * Advanced Prompt Templates para Gemini Image Generation
 * Usa técnicas de prompt engineering para imagens mais precisas e contextuais
 */

/**
 * TÉCNICA 1: Negative Prompts
 * O que EVITAR nas imagens geradas
 */
export const NEGATIVE_PROMPTS = {
  // Evitar elementos genéricos
  generic: [
    'generic stock photo',
    'random people',
    'unrelated objects',
    'abstract shapes without meaning',
  ],

  // Evitar problemas técnicos
  technical: [
    'blurry',
    'low quality',
    'pixelated',
    'distorted',
    'watermarks',
    'text overlay',
    'logos overlay',
  ],

  // Evitar estilo errado
  style: [
    'cartoon',
    'illustration',
    'drawing',
    'painting',
    '3D render',
    'anime',
  ],
}

/**
 * TÉCNICA 2: Entity-Specific Templates
 * Templates especializados por tipo de entidade
 */

// Template para LOGOS de marcas
export function createBrandLogoPrompt(brandName: string): string {
  return `Ultra-realistic photograph of ${brandName} official logo and brand identity.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. ${brandName} logo prominent and centered (exact official design)
2. Brand colors (use EXACT official color palette)
3. Clean white or subtle gradient background
4. Professional product photography lighting
5. Sharp focus on logo details

STYLE SPECIFICATIONS:
- Photography style: Commercial brand photography
- Lighting: Studio lighting, soft shadows
- Composition: Logo fills 60-80% of frame
- Color accuracy: Match official brand guidelines exactly
- Focus: Razor-sharp on logo edges

NEGATIVE (AVOID):
${NEGATIVE_PROMPTS.generic.join(', ')}, ${NEGATIVE_PROMPTS.technical.join(', ')}, people in frame, random objects, text besides logo, modified logo, fake logo, similar logo`
}

// Template para DASHBOARDS/INTERFACES
export function createDashboardInterfacePrompt(toolName: string): string {
  return `Ultra-realistic screenshot photograph of ${toolName} application dashboard interface.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. ${toolName} dashboard UI with recognizable layout and design patterns
2. Data visualizations: charts, graphs, metrics, KPIs visible
3. ${toolName} branding: logo, colors, typography consistent with real app
4. Clean modern UI design with proper spacing and hierarchy
5. Realistic data displays (not just placeholder)

STYLE SPECIFICATIONS:
- Photography style: High-quality screen capture
- Display: Modern laptop or desktop monitor showing the interface
- Lighting: Natural office lighting on screen
- Resolution: Sharp, crisp UI elements
- Perspective: Straight-on view or slight angle (15-30 degrees)

INTERFACE DETAILS:
- Navigation menu visible (sidebar or top bar)
- Multiple data widgets/cards showing metrics
- Color scheme matching ${toolName} official design
- Professional dashboard aesthetic (not cluttered)

NEGATIVE (AVOID):
${NEGATIVE_PROMPTS.generic.join(', ')}, ${NEGATIVE_PROMPTS.technical.join(', ')}, empty dashboard, placeholder data only, wrong brand colors, generic analytics dashboard, unrelated software interface`
}

// Template para PESSOAS FAMOSAS
export function createPersonPortraitPrompt(personName: string): string {
  return `Ultra-realistic professional portrait photograph of ${personName}.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. ${personName} face clearly recognizable
2. Professional business attire or signature style
3. Clean background (solid color, gradient, or subtle office)
4. Confident, approachable expression
5. Professional headshot or keynote speaking pose

STYLE SPECIFICATIONS:
- Photography style: Corporate headshot or conference photography
- Lighting: Professional studio lighting or keynote stage lighting
- Composition: Head and shoulders prominent (fills 70% of frame)
- Focus: Sharp focus on eyes and face
- Background: Blurred or plain (subject isolation)

CONTEXT CLUES:
- Setting: Business conference, keynote stage, or professional studio
- Posture: Confident, engaged, speaking or presenting
- Expression: Authentic ${personName} signature expression

NEGATIVE (AVOID):
${NEGATIVE_PROMPTS.generic.join(', ')}, ${NEGATIVE_PROMPTS.technical.join(', ')}, wrong person, generic businessman, random person, celebrity lookalike, paparazzi photo, casual snapshot`
}

// Template para CONCEITOS DE MARKETING
export function createMarketingConceptPrompt(concept: string, visualDescription: string): string {
  return `Ultra-realistic professional photograph representing: ${concept}.
VISUAL CONCEPT:
${visualDescription}

VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. Primary subject: ${concept} clearly represented visually
2. Professional business context (modern office, digital tools, or workspace)
3. Clean, modern aesthetic matching marketing industry standards
4. Authentic props and environment (not staged or artificial)
5. Natural lighting with professional photography quality

STYLE SPECIFICATIONS:
- Photography style: Commercial business photography
- Lighting: Natural office lighting or professional studio setup
- Composition: Rule of thirds, balanced visual weight
- Color palette: Modern, professional (blues, whites, grays with accent colors)
- Depth: Shallow depth of field (subject sharp, background slightly blurred)

CONTEXT:
- Industry: Marketing, Digital Business, Professional Services
- Mood: Productive, modern, strategic, results-oriented
- Authenticity: Real workspace, real tools, genuine business environment

NEGATIVE (AVOID):
${NEGATIVE_PROMPTS.generic.join(', ')}, ${NEGATIVE_PROMPTS.technical.join(', ')}, ${NEGATIVE_PROMPTS.style.join(', ')}, overly staged, fake props, stock photo clichés (handshakes, pointing at screens), outdated technology`
}

// Template para E-COMMERCE/PRODUTOS
export function createProductPrompt(productName: string, category: string): string {
  return `Ultra-realistic professional product photography of ${productName}.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. ${productName} product clearly visible and recognizable
2. Professional e-commerce photography setup
3. Clean white background or lifestyle context
4. Product details sharp and visible
5. Professional lighting highlighting product features

STYLE SPECIFICATIONS:
- Photography style: Commercial product photography
- Lighting: Studio lighting (key, fill, rim lights)
- Composition: Product centered, fills 60-70% of frame
- Background: Pure white (#FFFFFF) or minimal lifestyle setting
- Focus: Razor-sharp on product

PRODUCT CATEGORY: ${category}

NEGATIVE (AVOID):
${NEGATIVE_PROMPTS.generic.join(', ')}, ${NEGATIVE_PROMPTS.technical.join(', ')}, wrong product, generic item, placeholder product, cheap appearance, poorly lit, messy background`
}

/**
 * TÉCNICA 3: Semantic Layering
 * Organiza prompt em camadas de prioridade
 */
export interface SemanticLayers {
  // Camada 1: Essencial (o que DEVE estar na imagem)
  essential: string[]

  // Camada 2: Importante (o que DEVERIA estar)
  important: string[]

  // Camada 3: Desejável (bom ter)
  desirable: string[]

  // Camada 4: Evitar (negative prompts)
  avoid: string[]
}

export function buildSemanticPrompt(layers: SemanticLayers): string {
  const parts = []

  // Essential (máxima prioridade)
  if (layers.essential.length > 0) {
    parts.push(`ESSENTIAL ELEMENTS: ${layers.essential.join(', ')}`)
  }

  // Important
  if (layers.important.length > 0) {
    parts.push(`IMPORTANT DETAILS: ${layers.important.join(', ')}`)
  }

  // Desirable
  if (layers.desirable.length > 0) {
    parts.push(`ADDITIONAL QUALITY: ${layers.desirable.join(', ')}`)
  }

  // Avoid (negative prompts)
  if (layers.avoid.length > 0) {
    parts.push(`AVOID: ${layers.avoid.join(', ')}`)
  }

  return parts.join('. ')
}

/**
 * TÉCNICA 4: Style Anchoring
 * Ancorar em estilos visuais reconhecíveis
 */
export const STYLE_ANCHORS = {
  // Fotografia comercial de marcas (tipo Apple, Nike)
  brandCommercial: 'commercial brand photography in the style of Apple product launches, clean minimalist aesthetic, professional studio lighting',

  // Screenshots de software (tipo Product Hunt, Dribbble)
  softwareUI: 'high-quality application interface screenshot in the style of SaaS product demos, modern clean UI design, professional screen capture',

  // Fotografia de keynotes (tipo TED, conferences)
  keynotePortrait: 'professional conference photography in the style of TED Talks, keynote speaker portrait, stage lighting, business professional context',

  // Fotografia de marketing (tipo HubSpot, Mailchimp blogs)
  marketingEditorial: 'editorial marketing photography in the style of HubSpot blog headers, modern business aesthetic, natural office lighting',

  // Fotografia de produto (tipo Amazon, Shopify)
  productCommercial: 'e-commerce product photography in the style of Amazon product listings, white background studio setup, professional commercial lighting',
}

/**
 * TÉCNICA 5: Context Injection
 * Injetar contexto real de uso
 */
export function injectRealWorldContext(basePrompt: string, context: {
  industry?: string
  useCase?: string
  target?: string
}): string {
  const contextParts = []

  if (context.industry) {
    contextParts.push(`Industry context: ${context.industry}`)
  }

  if (context.useCase) {
    contextParts.push(`Use case: ${context.useCase}`)
  }

  if (context.target) {
    contextParts.push(`Target audience: ${context.target}`)
  }

  if (contextParts.length === 0) return basePrompt

  return `${basePrompt}. REAL-WORLD CONTEXT: ${contextParts.join(', ')}`
}

/**
 * Helper: Detectar tipo de entidade e retornar template apropriado
 */
export function getTemplateForEntity(
  entityType: 'brand_logo' | 'dashboard' | 'person' | 'marketing_concept' | 'product' | 'generic',
  entityName: string,
  additionalInfo?: { category?: string; visualDescription?: string }
): string {
  switch (entityType) {
    case 'brand_logo':
      return createBrandLogoPrompt(entityName)

    case 'dashboard':
      return createDashboardInterfacePrompt(entityName)

    case 'person':
      return createPersonPortraitPrompt(entityName)

    case 'product':
      return createProductPrompt(entityName, additionalInfo?.category || 'general')

    case 'marketing_concept':
      return createMarketingConceptPrompt(
        entityName,
        additionalInfo?.visualDescription || entityName
      )

    case 'generic':
    default:
      // Fallback genérico com semantic layering
      return buildSemanticPrompt({
        essential: [entityName, 'professional photography', 'high quality'],
        important: ['photorealistic', 'modern aesthetic', 'clean composition'],
        desirable: ['sharp focus', 'natural lighting', 'business context'],
        avoid: [...NEGATIVE_PROMPTS.generic, ...NEGATIVE_PROMPTS.technical],
      })
  }
}
