/**
 * Prompt Weighting - Adiciona pesos a elementos importantes do prompt
 * para forçar o modelo a prestar atenção neles
 */

interface PromptElement {
  text: string
  weight: number
}

/**
 * Identifica elementos-chave no prompt e adiciona pesos
 */
export function addPromptWeights(prompt: string): string {
  // Elementos que devem ter ALTO peso (prioridade máxima)
  const highPriorityKeywords = [
    // Pessoas/Sujeitos
    { regex: /\b(woman|man|person|entrepreneur|people|female|male)\b/gi, weight: 1.5 },

    // Ações/Poses
    { regex: /\b(celebrating|working|presenting|speaking|sitting|standing)\b/gi, weight: 1.4 },

    // Locais específicos
    { regex: /\b(Dubai|apartment|office|workspace|studio)\b/gi, weight: 1.3 },

    // Iluminação
    { regex: /\b(golden hour|natural light|studio lighting|dramatic lighting)\b/gi, weight: 1.3 },

    // Objetos principais
    { regex: /\b(laptop|screen|monitor|interface|dashboard)\b/gi, weight: 1.2 },
  ]

  // Elementos que devem ter PESO REDUZIDO (background/detalhes)
  const lowPriorityKeywords = [
    { regex: /\b(professional|high quality|photorealistic|detailed)\b/gi, weight: 0.8 },
  ]

  let weightedPrompt = prompt

  // Aplicar high priority weights
  highPriorityKeywords.forEach(({ regex, weight }) => {
    weightedPrompt = weightedPrompt.replace(regex, (match) => `(${match}:${weight})`)
  })

  // Aplicar low priority weights
  lowPriorityKeywords.forEach(({ regex, weight }) => {
    weightedPrompt = weightedPrompt.replace(regex, (match) => `(${match}:${weight})`)
  })

  return weightedPrompt
}

/**
 * Simplifica prompt removendo detalhes excessivos
 * Mantém apenas elementos principais
 */
export function simplifyPrompt(prompt: string): string {
  // Extrair apenas os primeiros 150 caracteres (elementos principais)
  // e adicionar qualidade no final
  const mainElements = prompt.substring(0, 150)
  const quality = 'professional photography, photorealistic, high quality, sharp focus'

  return `${mainElements}, ${quality}`
}

/**
 * Reestrutura o prompt para ordem de prioridade
 */
export function restructurePrompt(prompt: string): {
  main: string
  secondary: string
  quality: string
} {
  const parts = prompt.split(',').map(p => p.trim())

  // Categorizar elementos
  const subjects: string[] = []
  const actions: string[] = []
  const environment: string[] = []
  const quality: string[] = []

  const subjectKeywords = ['woman', 'man', 'person', 'entrepreneur', 'people', 'female', 'male']
  const actionKeywords = ['celebrating', 'working', 'presenting', 'showing', 'displaying']
  const envKeywords = ['Dubai', 'apartment', 'office', 'background', 'room', 'workspace']
  const qualityKeywords = ['professional', 'high quality', 'photorealistic', '8k', 'detailed']

  parts.forEach(part => {
    const lower = part.toLowerCase()

    if (subjectKeywords.some(k => lower.includes(k))) {
      subjects.push(part)
    } else if (actionKeywords.some(k => lower.includes(k))) {
      actions.push(part)
    } else if (envKeywords.some(k => lower.includes(k))) {
      environment.push(part)
    } else if (qualityKeywords.some(k => lower.includes(k))) {
      quality.push(part)
    } else {
      environment.push(part) // Default para environment
    }
  })

  // Reconstruir na ordem certa: Subject → Action → Environment → Quality
  return {
    main: [...subjects, ...actions].join(', '),
    secondary: environment.join(', '),
    quality: quality.join(', '),
  }
}

/**
 * Cria prompt otimizado para FLUX que REALMENTE funciona
 */
export function optimizeForFluxRealistic(basePrompt: string): string {
  // FLUX funciona melhor com prompts SIMPLES e DIRETOS
  // Menos é mais!

  const restructured = restructurePrompt(basePrompt)

  // Manter só o essencial: sujeito + ação + ambiente principal
  const essentialPrompt = `${restructured.main}, ${restructured.secondary.split(',').slice(0, 3).join(',')}`

  // Adicionar só qualidade essencial
  const finalPrompt = `${essentialPrompt}, professional photography, photorealistic, 8k uhd, sharp focus`

  return finalPrompt
}

/**
 * Break-down complexo em elementos separados
 */
export function breakdownComplexPrompt(prompt: string): {
  subject: string
  action: string
  object: string
  setting: string
  lighting: string
  style: string
} {
  const lower = prompt.toLowerCase()

  // Extrair sujeito principal
  let subject = ''
  if (lower.includes('female entrepreneur') || lower.includes('woman')) {
    subject = 'professional woman entrepreneur'
  } else if (lower.includes('male') || lower.includes('man')) {
    subject = 'professional man entrepreneur'
  } else if (lower.includes('person')) {
    subject = 'professional person'
  }

  // Extrair ação
  let action = ''
  if (lower.includes('celebrating')) {
    action = 'celebrating success'
  } else if (lower.includes('working')) {
    action = 'working on laptop'
  } else if (lower.includes('presenting')) {
    action = 'presenting'
  }

  // Extrair objeto principal
  let object = ''
  if (lower.includes('laptop') || lower.includes('screen')) {
    object = 'modern laptop'
  } else if (lower.includes('dashboard')) {
    object = 'business dashboard on screen'
  }

  // Extrair setting
  let setting = ''
  if (lower.includes('dubai') && lower.includes('apartment')) {
    setting = 'luxury Dubai apartment'
  } else if (lower.includes('office')) {
    setting = 'modern office'
  } else if (lower.includes('workspace')) {
    setting = 'contemporary workspace'
  }

  // Extrair lighting
  let lighting = ''
  if (lower.includes('golden hour')) {
    lighting = 'golden hour natural light'
  } else if (lower.includes('natural light')) {
    lighting = 'natural lighting'
  } else {
    lighting = 'professional studio lighting'
  }

  // Style base
  const style = 'professional business photography, photorealistic, high quality'

  return { subject, action, object, setting, lighting, style }
}

/**
 * Constrói prompt super-focado baseado no breakdown
 */
export function buildFocusedPrompt(breakdown: ReturnType<typeof breakdownComplexPrompt>): string {
  const parts = [
    breakdown.subject,
    breakdown.action,
    breakdown.object,
    breakdown.setting,
    breakdown.lighting,
    breakdown.style,
  ].filter(p => p.length > 0)

  return parts.join(', ')
}
