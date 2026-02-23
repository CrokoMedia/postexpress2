/**
 * Prompt Enhancer - Melhora prompts para gerar imagens de alta qualidade
 * Adiciona style modifiers, quality enhancers e negative prompts
 */

// Negative prompts universais (o que NUNCA queremos nas imagens)
const UNIVERSAL_NEGATIVE_PROMPTS = [
  'text overlay',
  'watermark',
  'logo overlay',
  'typography',
  'letters',
  'words',
  'captions',
  'subtitles',
  'username',
  'timestamp',
  'blurry',
  'low quality',
  'pixelated',
  'distorted',
  'deformed',
  'ugly',
  'bad anatomy',
  'amateur',
  'poorly lit',
  'grainy',
  'noise',
  'artifacts',
]

// Quality enhancers universais
const QUALITY_ENHANCERS = [
  'professional photography',
  'high resolution',
  '8k uhd',
  'sharp focus',
  'crystal clear',
  'highly detailed',
  'photorealistic',
  'studio lighting',
  'color graded',
  'professional color correction',
]

// Style modifiers por tipo de carrossel
const STYLE_BY_TYPE: Record<string, string[]> = {
  educacional: [
    'clean professional aesthetic',
    'bright natural lighting',
    'modern minimalist',
    'educational content style',
    'trustworthy and approachable',
    'clean background',
    'well-organized composition',
  ],
  vendas: [
    'aspirational lifestyle',
    'luxury aesthetic',
    'premium quality feel',
    'success and achievement',
    'cinematic lighting',
    'dynamic composition',
    'sophisticated color palette',
    'high-end commercial photography',
  ],
  autoridade: [
    'executive portrait style',
    'professional business setting',
    'confident and powerful',
    'editorial magazine quality',
    'dramatic lighting',
    'bold composition',
    'thought leadership aesthetic',
    'modern corporate elegance',
  ],
  viral: [
    'eye-catching and bold',
    'vibrant colors',
    'dynamic energy',
    'scroll-stopping composition',
    'trendy aesthetic',
    'social media optimized',
    'attention-grabbing',
    'contemporary and fresh',
  ],
}

// Context enhancers (melhoram contexto específico)
const CONTEXT_ENHANCERS = {
  person: [
    'professional portrait',
    'natural facial expression',
    'authentic emotion',
    'proper skin tones',
    'realistic proportions',
  ],
  tech: [
    'modern technology',
    'sleek interfaces',
    'contemporary design',
    'realistic screen displays',
    'professional tech setup',
  ],
  workspace: [
    'organized workspace',
    'professional environment',
    'natural ambient lighting',
    'contemporary furniture',
    'productive atmosphere',
  ],
  dubai: [
    'Dubai luxury aesthetic',
    'modern Middle Eastern architecture',
    'golden hour warmth',
    'premium lifestyle setting',
    'sophisticated urban environment',
  ],
}

/**
 * Detecta contexto do prompt para adicionar enhancers específicos
 */
function detectContext(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase()
  const enhancers: string[] = []

  if (lowerPrompt.includes('person') || lowerPrompt.includes('entrepreneur') || lowerPrompt.includes('woman') || lowerPrompt.includes('man')) {
    enhancers.push(...CONTEXT_ENHANCERS.person)
  }

  if (lowerPrompt.includes('laptop') || lowerPrompt.includes('screen') || lowerPrompt.includes('interface') || lowerPrompt.includes('dashboard')) {
    enhancers.push(...CONTEXT_ENHANCERS.tech)
  }

  if (lowerPrompt.includes('workspace') || lowerPrompt.includes('office') || lowerPrompt.includes('desk')) {
    enhancers.push(...CONTEXT_ENHANCERS.workspace)
  }

  if (lowerPrompt.includes('dubai') || lowerPrompt.includes('apartment') || lowerPrompt.includes('luxury')) {
    enhancers.push(...CONTEXT_ENHANCERS.dubai)
  }

  return enhancers
}

/**
 * Enhances a prompt with quality modifiers, style, and negative prompts
 */
export function enhancePrompt(
  basePrompt: string,
  options: {
    carouselType?: 'educacional' | 'vendas' | 'autoridade' | 'viral'
    additionalEnhancers?: string[]
    skipQualityEnhancers?: boolean
  } = {}
): {
  enhancedPrompt: string
  negativePrompt: string
} {
  const { carouselType, additionalEnhancers = [], skipQualityEnhancers = false } = options

  // 1. Base prompt (já vem detalhado do Content Squad)
  const parts: string[] = [basePrompt]

  // 2. Context-specific enhancers
  const contextEnhancers = detectContext(basePrompt)
  if (contextEnhancers.length > 0) {
    parts.push(...contextEnhancers)
  }

  // 3. Style modifiers por tipo de carrossel
  if (carouselType && STYLE_BY_TYPE[carouselType]) {
    parts.push(...STYLE_BY_TYPE[carouselType])
  }

  // 4. Quality enhancers (se não skipado)
  if (!skipQualityEnhancers) {
    parts.push(...QUALITY_ENHANCERS)
  }

  // 5. Additional enhancers customizados
  if (additionalEnhancers.length > 0) {
    parts.push(...additionalEnhancers)
  }

  // Juntar tudo removendo duplicatas
  const uniqueParts = [...new Set(parts)]
  const enhancedPrompt = uniqueParts
    .filter(part => part && part.trim().length > 0)
    .join(', ')

  // Negative prompt (universal)
  const negativePrompt = UNIVERSAL_NEGATIVE_PROMPTS.join(', ')

  return {
    enhancedPrompt,
    negativePrompt,
  }
}

/**
 * Otimiza prompt especificamente para fal.ai Flux
 */
export function optimizeForFlux(prompt: string, carouselType?: string): string {
  // Flux funciona melhor com prompts mais naturais e descritivos
  // Adicionar peso a elementos importantes usando ()
  let optimized = prompt

  // Aumentar peso de qualidade
  if (optimized.includes('professional')) {
    optimized = optimized.replace('professional', '(professional:1.2)')
  }

  if (optimized.includes('photorealistic')) {
    optimized = optimized.replace('photorealistic', '(photorealistic:1.3)')
  }

  // Adicionar estilo cinematográfico para vendas/autoridade
  if (carouselType === 'vendas' || carouselType === 'autoridade') {
    optimized += ', cinematic style, film grain, dramatic depth of field'
  }

  return optimized
}

/**
 * Otimiza prompt especificamente para Gemini (Nano Banana)
 */
export function optimizeForGemini(prompt: string): string {
  // Gemini funciona melhor com prompts estruturados e claros
  // Adicionar markers de qualidade explícitos
  return `${prompt}, photographic quality, realistic rendering, detailed textures, natural colors, professional grade`
}

/**
 * Remove redundâncias e otimiza comprimento do prompt
 */
export function cleanPrompt(prompt: string): string {
  // Remover vírgulas duplicadas
  let cleaned = prompt.replace(/,\s*,/g, ',')

  // Remover espaços extras
  cleaned = cleaned.replace(/\s+/g, ' ')

  // Remover vírgulas no início/fim
  cleaned = cleaned.replace(/^,\s*/, '').replace(/,\s*$/, '')

  // Remover palavras duplicadas consecutivas
  const words = cleaned.split(/,\s*/)
  const uniqueWords = words.filter((word, index) => {
    return index === 0 || word.toLowerCase().trim() !== words[index - 1]?.toLowerCase().trim()
  })

  return uniqueWords.join(', ')
}
