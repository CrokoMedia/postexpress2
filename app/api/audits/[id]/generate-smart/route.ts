import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ============================================
// TYPES
// ============================================

type TemplateId = 'minimalist' | 'bold-gradient' | 'professional' | 'modern' | 'clean' | 'gradient'
type LayoutFormat = 'feed' | 'story' | 'square'
type ThemeMode = 'light' | 'dark'
type ImageMode = 'auto' | 'no_image' | 'custom_prompt' | 'upload'
type ProfileType = 'educacional' | 'vendas' | 'autoridade' | 'viral'

interface SmartConfig {
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  imageStrategy: Record<number, Record<number, { mode: ImageMode; customPrompt?: string }>>
}

interface SmartReasoning {
  profileAnalysis: string
  profileType: ProfileType
  templateChoice: string
  formatChoice: string
  themeChoice: string
  imageStrategyReasoning: string[]
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Remove surrogates Unicode inválidos (causa erro 400 na Anthropic API)
function sanitizeString(str: string): string {
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
}

function sanitizeDeep(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value)
  if (Array.isArray(value)) return value.map(sanitizeDeep)
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value as object)) {
      result[key] = sanitizeDeep((value as Record<string, unknown>)[key])
    }
    return result
  }
  return value
}

/**
 * Analisa o perfil e determina o tipo predominante
 */
function analyzeProfileType(audit: any): { type: ProfileType; reasoning: string } {
  const raw = audit.raw_json || {}
  const scores = {
    behavior: audit.score_behavior || 0,
    copy: audit.score_copy || 0,
    offers: audit.score_offers || 0,
    metrics: audit.score_metrics || 0,
    anomalies: audit.score_anomalies || 0,
  }

  // Análise de biografia e posts
  const biography = audit.profile?.biography?.toLowerCase() || ''
  const hasSalesKeywords = /comprar|vend|produto|serviço|consultor|mentor|coach/i.test(biography)
  const hasEducationalKeywords = /ensin|aprend|educ|dica|estratégia|método|framework/i.test(biography)
  const hasAuthorityKeywords = /expert|specialist|CEO|founder|director|PhD|Dr\./i.test(biography)

  // Análise de engajamento
  const highEngagement = (audit.engagement_rate || 0) > 3.0

  // Decisão baseada em múltiplos fatores
  let type: ProfileType
  let reasoning: string

  if (hasSalesKeywords && scores.offers > 60) {
    type = 'vendas'
    reasoning = 'Perfil focado em vendas: biografia menciona produtos/serviços e score de ofertas alto'
  } else if (hasEducationalKeywords && scores.copy > 65) {
    type = 'educacional'
    reasoning = 'Perfil educacional: biografia menciona ensino/aprendizado e bom score de copy'
  } else if (hasAuthorityKeywords || (scores.behavior > 70 && scores.metrics > 65)) {
    type = 'autoridade'
    reasoning = 'Perfil de autoridade: credenciais na bio ou scores consistentemente altos'
  } else if (highEngagement && scores.anomalies > 60) {
    type = 'viral'
    reasoning = 'Perfil viral: alto engajamento e presença de padrões contraintuitivos'
  } else {
    // Default: educacional (mais versátil)
    type = 'educacional'
    reasoning = 'Perfil genérico: escolhido template educacional como padrão versátil'
  }

  return { type, reasoning }
}

/**
 * Escolhe o template visual baseado no tipo de perfil
 */
function chooseTemplate(profileType: ProfileType): { template: TemplateId; reasoning: string } {
  const templates: Record<ProfileType, { id: TemplateId; reason: string }> = {
    educacional: {
      id: 'minimalist',
      reason: 'Template minimalista: foco no conteúdo, texto legível, sem distrações visuais',
    },
    vendas: {
      id: 'bold-gradient',
      reason: 'Template bold com gradientes: visual impactante para capturar atenção e gerar desejo',
    },
    autoridade: {
      id: 'professional',
      reason: 'Template profissional: clean, sério, transmite credibilidade e expertise',
    },
    viral: {
      id: 'gradient',
      reason: 'Template com gradientes vibrantes: cores chamativas para maximizar paradas de scroll',
    },
  }

  const choice = templates[profileType]
  return { template: choice.id, reasoning: choice.reason }
}

/**
 * Escolhe o formato baseado em métricas de posts
 */
function chooseFormat(audit: any): { format: LayoutFormat; reasoning: string } {
  const raw = audit.raw_json || {}
  const topFormats = raw.top_formats || []

  // Se tem Reels nos top formats, priorizar story (9:16)
  if (topFormats.some((f: string) => /reel|story/i.test(f))) {
    return {
      format: 'story',
      reasoning: 'Formato story (9:16): perfil tem bom desempenho em Reels/Stories',
    }
  }

  // Se tem muitos carrosséis, priorizar feed (4:5)
  if (topFormats.some((f: string) => /sidecar|carousel/i.test(f))) {
    return {
      format: 'feed',
      reasoning: 'Formato feed (4:5): perfil tem bom desempenho em carrosséis tradicionais',
    }
  }

  // Default: feed (mais comum)
  return {
    format: 'feed',
    reasoning: 'Formato feed (4:5): padrão mais versátil para carrosséis no Instagram',
  }
}

/**
 * Escolhe o tema (light/dark) baseado em análise do perfil
 */
function chooseTheme(audit: any): { theme: ThemeMode; reasoning: string } {
  const raw = audit.raw_json || {}
  const profileContext = raw.profile_context || {}

  // Analisar paleta de cores do profile_context
  const brandColors = profileContext.content_style?.brandColors || []
  const hasDarkColors = brandColors.some((color: string) =>
    /preto|black|escuro|dark|cinza|gray|azul escuro|navy/i.test(color)
  )

  // Analisar biografia
  const biography = audit.profile?.biography?.toLowerCase() || ''
  const hasNightKeywords = /noite|night|dark|black|midnight/i.test(biography)

  if (hasDarkColors || hasNightKeywords) {
    return {
      theme: 'dark',
      reasoning: 'Tema escuro: paleta de cores do perfil ou palavras-chave indicam preferência por dark mode',
    }
  }

  // Default: light (mais legível)
  return {
    theme: 'light',
    reasoning: 'Tema claro: padrão mais legível e versátil para a maioria dos perfis',
  }
}

/**
 * Estratégia inteligente de imagens para cada slide
 */
function chooseImageStrategy(carousels: any[]): {
  strategy: Record<number, Record<number, { mode: ImageMode; customPrompt?: string }>>
  reasoning: string[]
} {
  const strategy: Record<number, Record<number, { mode: ImageMode; customPrompt?: string }>> = {}
  const reasoning: string[] = []

  carousels.forEach((carousel, carouselIndex) => {
    strategy[carouselIndex] = {}

    carousel.slides.forEach((slide: any, slideIndex: number) => {
      const text = `${slide.titulo || ''} ${slide.corpo || ''}`.toLowerCase()

      // Regra 1: Slides com muitos números/dados não precisam de imagem
      if (/\d+%|\d+x|R\$\s*\d+|\d+\s*(mil|k|milhão|m)/i.test(text)) {
        strategy[carouselIndex][slideIndex] = { mode: 'no_image' }
        reasoning.push(
          `Carrossel ${carouselIndex + 1}, Slide ${slideIndex + 1}: sem imagem (foco em dados/números)`
        )
        return
      }

      // Regra 2: Slides que mencionam ferramentas/marcas → usar imagem auto (logo)
      const brandKeywords = [
        'instagram',
        'tiktok',
        'youtube',
        'facebook',
        'linkedin',
        'twitter',
        'canva',
        'chatgpt',
        'notion',
        'figma',
        'google',
        'meta',
      ]
      const mentionsBrand = brandKeywords.some((brand) => text.includes(brand))

      if (mentionsBrand) {
        strategy[carouselIndex][slideIndex] = { mode: 'auto' }
        reasoning.push(
          `Carrossel ${carouselIndex + 1}, Slide ${slideIndex + 1}: auto (menciona marca/ferramenta)`
        )
        return
      }

      // Regra 3: Primeiro slide (hook) sempre tem imagem impactante
      if (slideIndex === 0) {
        strategy[carouselIndex][slideIndex] = { mode: 'auto' }
        reasoning.push(
          `Carrossel ${carouselIndex + 1}, Slide ${slideIndex + 1}: auto (hook precisa de visual impactante)`
        )
        return
      }

      // Regra 4: CTA final geralmente não precisa de imagem (foco no texto)
      if (slide.tipo === 'cta' || slideIndex === carousel.slides.length - 1) {
        strategy[carouselIndex][slideIndex] = { mode: 'no_image' }
        reasoning.push(
          `Carrossel ${carouselIndex + 1}, Slide ${slideIndex + 1}: sem imagem (CTA final, foco no texto)`
        )
        return
      }

      // Default: auto (IA decide)
      strategy[carouselIndex][slideIndex] = { mode: 'auto' }
      reasoning.push(
        `Carrossel ${carouselIndex + 1}, Slide ${slideIndex + 1}: auto (IA vai gerar imagem contextual)`
      )
    })
  })

  return { strategy, reasoning }
}

// ============================================
// CONTENT CREATION PROMPT (reutilizado)
// ============================================

const CONTENT_CREATION_PROMPT = `Você é o líder do Content Creation Squad com 5 mentes especializadas:

1. **Eugene Schwartz** - Copywriting científico (líder)
2. **Seth Godin** - Branding e narrativas
3. **Alex Hormozi** - Ofertas irresistíveis
4. **Thiago Finch** - Marketing BR
5. **Adriano De Marqui** - Design visual

# TAREFA

Você recebeu uma **auditoria completa** de um perfil do Instagram com análise dos 5 auditores + **CONTEXTO RICO DO PERFIL**.

Baseado nos insights da auditoria E no contexto do perfil, crie **3 sugestões de carrosséis** que:

1. **Resolvam os problemas identificados** (critical_problems)
2. **Aproveitem os pontos fortes** (top_strengths)
3. **Respondam às perguntas do público** (comentários)
4. **SIGAM OS PILARES DE CONTEÚDO** definidos no profile_context
5. **USEM O TOM DE VOZ ESPECÍFICO** da pessoa
6. **MENCIONEM PRODUTOS/OFERTAS REAIS** quando relevante

**IMPORTANTE:** Seja CONCISO - máximo 6-8 slides por carrossel.

---

## 🎯 COMO USAR O PROFILE_CONTEXT (CRÍTICO)

Se profile_context estiver presente no JSON, você DEVE:

### 1. **RESPEITAR content_pillars**
- Cada pilar tem um weight (ex: 40%, 30%, 20%, 10%)
- Distribua os 3 carrosséis seguindo essa proporção
- Use os subtopics de cada pilar como fonte de ideias
- Incorpore as mensagensChave no copy dos slides

**Exemplo:** Se o pilar "Transformação Serviço → Produto" tem 40%, pelo menos 1 carrossel DEVE ser sobre esse tema.

### 2. **USAR content_style**
- **Tom de voz**: Use o toneOfVoice exato descrito (ex: "Direto, analítico, sem bullshit motivacional")
- **Linguagem**: Respeite formality, person, emojis, caps, storytelling
- **Palavras-marca**: Inclua as wordsMarca quando fizer sentido
- **Evitar**: NUNCA use palavras/frases da lista evitar
- **Comprimento**: Respeite comprimentoIdeal para carrosséis
- **TERMOS A EVITAR** (language.termsToAvoid): Se houver lista de termos técnicos/jargões a evitar, NUNCA use essas palavras. Substitua por sinônimos simples que o público entende.

### 3. **INCLUIR business (produtos/ofertas)**
- Se o carrossel mencionar solução, cite o produto REAL da pessoa
- Use o cta específico de cada produto
- Mencione price quando for carrossel de vendas
- Referencie leadMagnets quando relevante

### 4. **INCORPORAR dna**
- **uniqueVoice**: Siga o padrão de voz descrito (ex: "problema → história → framework → case → CTA")
- **Energy**: Reflita a energia da pessoa (ex: "calmo e analítico" vs "alta energia motivacional")
- **Frameworks**: Mencione frameworks que a pessoa usa (ex: "Hormozi Value Equation", "Dan Sullivan Who Not How")

### 5. **USAR identity para personalização**
- **Positioning**: Valide que os carrosséis reforçam o posicionamento
- **Avatar**: Escreva pensando no público-alvo específico
- **Niche**: Mantenha relevância para o nicho declarado

---

## ⚠️ REGRAS CRÍTICAS QUANDO HÁ profile_context

1. **SE NÃO HOUVER profile_context**: gere conteúdo genérico baseado só na auditoria (comportamento antigo)

2. **SE HOUVER profile_context**: o conteúdo DEVE ser 100% personalizado:
   - Copy no tom de voz exato
   - Carrosséis distribuídos pelos pilares (seguindo os pesos)
   - Mensagens-chave incorporadas
   - Produtos reais mencionados
   - Frameworks da pessoa citados
   - Palavras proibidas NUNCA usadas

3. **PRIORIDADE**: profile_context > auditoria. Se houver conflito entre o que a auditoria sugere e o que o contexto define, SIGA O CONTEXTO.

4. **🚫 TERMOS A EVITAR - REGRA CRÍTICA**:
   - Se profile_context.content_style.language.termsToAvoid existir, você NUNCA DEVE usar essas palavras no conteúdo
   - Esses são jargões técnicos, termos em inglês ou palavras complexas que o público-alvo NÃO entende
   - Sempre substitua por sinônimos simples em português
   - **CRÍTICO**: Verifique TODOS os slides antes de retornar. Se encontrar algum termo da lista termsToAvoid, REESCREVA o slide.

---

# OUTPUT ESPERADO

Retorne um JSON com esta estrutura EXATA:

\`\`\`json
{
  "carousels": [
    {
      "titulo": "string (título do carrossel)",
      "tipo": "educacional|vendas|autoridade|viral",
      "objetivo": "string (o que resolve da auditoria)",
      "baseado_em": "string (qual insight da auditoria inspirou)",
      "slides": [
        {
          "numero": 1,
          "tipo": "hook|conteudo|cta",
          "titulo": "string (título do slide)",
          "corpo": "string (texto do slide)",
          "notas_design": "string (sugestões visuais)",
          "imagem_prompt": "string (descrição em inglês da fotografia/ilustração ideal para acompanhar este slide — específica ao contexto do conteúdo, sem texto na imagem)"
        }
      ],
      "caption": "string (legenda do Instagram)",
      "hashtags": ["string"],
      "cta": "string (call to action específico)"
    }
  ],
  "estrategia_geral": "string (explicação da estratégia)",
  "proximos_passos": ["string (recomendações)"]
}
\`\`\`

# REGRAS IMPORTANTES

1. **Seja específico** - Use dados reais da auditoria
2. **Resolva gaps** - Foque nos pontos fracos detectados
3. **Mantenha autenticidade** - Respeite o tom do perfil auditado
4. **Ação imediata** - Quick wins que pode publicar hoje
5. **Retorne APENAS o JSON** - Sem texto adicional
6. **Formatação de texto** - Use MAIÚSCULAS apenas para palavras ou frases curtas que devem ter ÊNFASE FORTE (serão convertidas automaticamente para negrito nos slides). Evite frases inteiras em CAPS.
7. **LINGUAGEM DE GÊNERO** - CRÍTICO: Use a linguagem correta baseada no gênero do perfil
8. **imagem_prompt obrigatório** - Para cada slide, crie uma descrição DETALHADA em inglês da imagem que ilustra o conteúdo

Agora analise a auditoria abaixo e crie as 3 sugestões de carrosséis:`

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    console.log('🧠 [generate-smart] Iniciando geração automática para audit:', id)

    // 1. Buscar auditoria completa
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (auditError || !audit) {
      console.error('❌ [generate-smart] Auditoria não encontrada:', id)
      return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 })
    }

    // 2. Buscar contexto rico do perfil
    const { data: profileContext } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', audit.profile_id)
      .is('deleted_at', null)
      .single()

    console.log('📋 [generate-smart] Contexto do perfil:', profileContext ? 'Encontrado' : 'Não encontrado')

    // 3. Analisar perfil e tomar decisões automáticas
    console.log('🔍 [generate-smart] Analisando perfil para decisões automáticas...')

    const profileAnalysis = analyzeProfileType(audit)
    const templateChoice = chooseTemplate(profileAnalysis.type)
    const formatChoice = chooseFormat(audit)
    const themeChoice = chooseTheme(audit)

    console.log('✅ [generate-smart] Decisões tomadas:')
    console.log('   - Tipo de perfil:', profileAnalysis.type)
    console.log('   - Template:', templateChoice.template)
    console.log('   - Formato:', formatChoice.format)
    console.log('   - Tema:', themeChoice.theme)

    // 4. Preparar dados para o Content Squad
    const auditData = {
      profile: {
        username: audit.profile.username,
        full_name: audit.profile.full_name,
        biography: audit.profile.biography,
        followers: audit.snapshot_followers,
        gender: audit.profile.gender || 'neutro',
      },
      profile_context: profileContext
        ? {
            identity: profileContext.identity || {},
            credibility: profileContext.credibility || {},
            philosophy: profileContext.philosophy || {},
            content_style: profileContext.content_style || {},
            content_pillars: profileContext.content_pillars || [],
            business: profileContext.business || {},
            dna: profileContext.dna || {},
          }
        : null,
      scores: {
        overall: audit.score_overall,
        behavior: audit.score_behavior,
        copy: audit.score_copy,
        offers: audit.score_offers,
        metrics: audit.score_metrics,
        anomalies: audit.score_anomalies,
      },
      classification: audit.classification,
      engagement: {
        rate: audit.engagement_rate,
        total_likes: audit.total_likes,
        total_comments: audit.total_comments,
        posts_analyzed: audit.posts_analyzed,
      },
      insights: audit.raw_json?.auditors_analysis || {},
      strengths: audit.raw_json?.top_strengths || [],
      problems: audit.raw_json?.critical_problems || [],
      quick_wins: audit.raw_json?.quick_wins || [],
      strategic_moves: audit.raw_json?.strategic_moves || [],
    }

    // Sanitizar dados
    const sanitizedAuditData = sanitizeDeep(auditData)

    // 5. Gerar conteúdo com Claude API
    console.log('🎨 [generate-smart] Gerando conteúdo com Claude API...')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content:
            CONTENT_CREATION_PROMPT +
            '\n\n```json\n' +
            JSON.stringify(sanitizedAuditData, null, 2) +
            '\n```',
        },
      ],
    })

    // 6. Extrair JSON da resposta
    const firstContent = message.content[0]
    if (firstContent.type !== 'text') {
      throw new Error('Resposta inesperada da Claude API')
    }
    const responseText = firstContent.text

    let contentResult
    try {
      let jsonText = responseText.trim()

      const patterns = [
        /```json\n([\s\S]*?)\n```/,
        /```json([\s\S]*?)```/,
        /```\n([\s\S]*?)\n```/,
        /```([\s\S]*?)```/,
      ]

      for (const pattern of patterns) {
        const match = jsonText.match(pattern)
        if (match) {
          jsonText = match[1].trim()
          break
        }
      }

      jsonText = jsonText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '')

      contentResult = JSON.parse(jsonText)
      console.log('✅ [generate-smart] Conteúdo gerado com sucesso')
    } catch (e: any) {
      console.error('❌ [generate-smart] Erro ao fazer parse do JSON:', e.message)
      return NextResponse.json(
        { error: 'Erro ao processar resposta do Content Squad', details: e.message },
        { status: 500 }
      )
    }

    // 7. Aplicar estratégia de imagens inteligente
    const imageStrategyResult = chooseImageStrategy(contentResult.carousels)

    const config: SmartConfig = {
      template: templateChoice.template,
      format: formatChoice.format,
      theme: themeChoice.theme,
      imageStrategy: imageStrategyResult.strategy,
    }

    const reasoning: SmartReasoning = {
      profileAnalysis: profileAnalysis.reasoning,
      profileType: profileAnalysis.type,
      templateChoice: templateChoice.reasoning,
      formatChoice: formatChoice.reasoning,
      themeChoice: themeChoice.reasoning,
      imageStrategyReasoning: imageStrategyResult.reasoning,
    }

    console.log('📊 [generate-smart] Estratégia de imagens aplicada')
    console.log(`   - ${imageStrategyResult.reasoning.length} decisões de imagem tomadas`)

    // 8. Salvar no banco de dados
    console.log('💾 [generate-smart] Salvando conteúdo no banco...')

    const { data: existing } = await supabase
      .from('content_suggestions')
      .select('id')
      .eq('audit_id', id)
      .single()

    let contentSuggestionId: string

    if (existing) {
      const { error: updateError } = await supabase
        .from('content_suggestions')
        .update({
          content_json: contentResult,
          generated_at: new Date().toISOString(),
        })
        .eq('audit_id', id)

      if (updateError) {
        console.error('❌ [generate-smart] Erro ao atualizar banco:', updateError)
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo no banco', details: updateError.message },
          { status: 500 }
        )
      }

      contentSuggestionId = existing.id
    } else {
      const { data: newRecord, error: insertError } = await supabase
        .from('content_suggestions')
        .insert({
          audit_id: id,
          profile_id: audit.profile_id,
          content_json: contentResult,
          generated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError || !newRecord) {
        console.error('❌ [generate-smart] Erro ao criar no banco:', insertError)
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo no banco', details: insertError?.message },
          { status: 500 }
        )
      }

      contentSuggestionId = newRecord.id
    }

    // Garantir link em content_profile_links
    await supabase
      .from('content_profile_links')
      .upsert(
        {
          content_id: contentSuggestionId,
          profile_id: audit.profile_id,
          link_type: 'original',
          linked_at: new Date().toISOString(),
          deleted_at: null,
        },
        { onConflict: 'content_id,profile_id', ignoreDuplicates: false }
      )

    console.log('✅ [generate-smart] Conteúdo salvo no banco')

    // 9. Retornar resposta completa
    const response = {
      success: true,
      audit_id: id,
      profile: audit.profile.username,
      content: contentResult,
      config,
      reasoning,
      generated_at: new Date().toISOString(),
    }

    console.log('🎉 [generate-smart] Geração automática concluída com sucesso')
    console.log(`   - ${contentResult.carousels.length} carrosséis gerados`)
    console.log(`   - Template: ${config.template}`)
    console.log(`   - Formato: ${config.format}`)
    console.log(`   - Tema: ${config.theme}`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ [generate-smart] Erro fatal:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo automaticamente', details: error.message },
      { status: 500 }
    )
  }
}
