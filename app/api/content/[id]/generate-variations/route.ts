import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

const VARIATIONS_PROMPT = `Você é o líder do Content Creation Squad com 5 mentes especializadas:

1. **Eugene Schwartz** - Copywriting científico (líder)
2. **Seth Godin** - Branding e narrativas
3. **Alex Hormozi** - Ofertas irresistíveis
4. **Thiago Finch** - Marketing BR
5. **Adriano De Marqui** - Design visual

# MISSÃO: CONTENT REPURPOSING

Um criador de conteúdo aprovou um conteúdo. Isso significa que o **tema e o insight foram validados**.

Sua missão é **multiplicar esse conteúdo** explorando o mesmo tema em novos ângulos e formatos — sem repetir o que já foi feito.

# REGRAS DOS ÂNGULOS

Cada variação DEVE ter um ângulo completamente diferente do original e entre si:

1. **Perspectiva diferente** — emocional, técnica, controversa, ou do outro lado
2. **Hook alternativo** — mesma mensagem, mas com um gancho radicalmente diferente (provocação, dado, pergunta, lista)
3. **Formato tendência** — storytelling pessoal, "X erros que...", "A verdade sobre...", "O que ninguém fala sobre..."
4. **Insight derivado** — um subtópico ou consequência do tema principal que merece conteúdo próprio

# OUTPUT ESPERADO

Retorne exatamente este JSON — 2 carrosséis + 2 reels:

\`\`\`json
{
  "carousels": [
    {
      "titulo": "string",
      "tipo": "educacional|vendas|autoridade|viral",
      "objetivo": "string",
      "baseado_em": "string (qual ângulo explorado)",
      "slides": [
        {
          "numero": 1,
          "tipo": "hook|conteudo|cta",
          "titulo": "string",
          "corpo": "string",
          "notas_design": "string"
        }
      ],
      "caption": "string",
      "hashtags": ["string"],
      "cta": "string"
    }
  ],
  "reels": [
    {
      "titulo": "string",
      "duracao_sugerida": "string (ex: 30-60s)",
      "hook_verbal": "string (primeira frase falada, máx 15 palavras)",
      "topicos": [
        "string (tópico 1 — o que falar)",
        "string (tópico 2 — o que falar)",
        "string (tópico 3 — o que falar)"
      ],
      "cta_final": "string",
      "dica_gravacao": "string",
      "caption": "string",
      "hashtags": ["string"]
    }
  ]
}
\`\`\`

# REGRAS ABSOLUTAS

1. **NÃO repita** o tema com o mesmo ângulo do original
2. **Carrosséis**: 5-7 slides, estrutura completa com hook e CTA
3. **Reels**: tópicos curtos (máx 15 palavras cada) — NUNCA roteiro completo
4. **Mantenha** o tom e a voz do perfil original
5. **Retorne APENAS o JSON** — sem texto adicional

Analise o conteúdo aprovado abaixo e crie as variações:`

/**
 * POST /api/content/[id]/generate-variations
 * Body: { sourceType: "carousel"|"reel", sourceIndex: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sourceType, sourceIndex } = body

    if (!['carousel', 'reel'].includes(sourceType) || typeof sourceIndex !== 'number') {
      return NextResponse.json(
        { error: 'sourceType ("carousel"|"reel") e sourceIndex (number) são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestion + auditoria
    const { data: cs, error: csError } = await supabase
      .from('content_suggestions')
      .select('id, content_json, reels_json, audit_id, profile_id')
      .eq('audit_id', id)
      .single()

    if (csError || !cs) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const { data: audit } = await supabase
      .from('audits')
      .select('profile:profiles(username, biography), score_overall, score_copy')
      .eq('id', id)
      .single()

    // Pegar o conteúdo aprovado como fonte
    let sourceContent: any = null
    let sourceTitle = ''

    if (sourceType === 'carousel') {
      const carousels = (cs.content_json as any)?.carousels || []
      sourceContent = carousels[sourceIndex]
      sourceTitle = sourceContent?.titulo || 'Carrossel'
      if (!sourceContent) {
        return NextResponse.json({ error: 'Carrossel não encontrado' }, { status: 404 })
      }
      if (sourceContent.approved !== true) {
        return NextResponse.json({ error: 'Carrossel não está aprovado' }, { status: 400 })
      }
    } else {
      const reels = (cs.reels_json as any)?.reels || []
      sourceContent = reels[sourceIndex]
      sourceTitle = sourceContent?.titulo || 'Reel'
      if (!sourceContent) {
        return NextResponse.json({ error: 'Reel não encontrado' }, { status: 404 })
      }
      if (sourceContent.approved !== true) {
        return NextResponse.json({ error: 'Reel não está aprovado' }, { status: 400 })
      }
    }

    // Montar contexto para o prompt
    const profileContext = {
      username: (audit?.profile as any)?.username || '',
      biography: (audit?.profile as any)?.biography || '',
      score_overall: audit?.score_overall,
      score_copy: audit?.score_copy
    }

    const promptContext = `## PERFIL
@${profileContext.username}
Bio: ${profileContext.biography}
Score geral: ${profileContext.score_overall} | Score de copy: ${profileContext.score_copy}

## CONTEÚDO APROVADO (${sourceType === 'carousel' ? 'CARROSSEL' : 'REEL'})
${JSON.stringify(sanitizeDeep(sourceContent), null, 2)}

## INSTRUÇÕES ESPECÍFICAS
- O TEMA central é: "${sourceTitle}"
- Crie variações que exploram DIFERENTES ÂNGULOS deste tema
- Não repita a mesma abordagem do conteúdo aprovado acima
- Priorize ângulos: ${sourceType === 'carousel'
  ? 'provocação/controvérsia, storytelling pessoal, dados/estatísticas, insight derivado'
  : 'hook emocional, provocação técnica, perspectiva oposta, insight inesperado'
}`

    console.log(`🔄 Gerando variações a partir de ${sourceType} "${sourceTitle}"...`)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: VARIATIONS_PROMPT + '\n\n' + promptContext
        }
      ]
    })

    const firstContent = message.content[0]
    if (firstContent.type !== 'text') throw new Error('Resposta inesperada da Claude API')

    const responseText = firstContent.text
    let variationsResult: { carousels: any[]; reels: any[] }

    try {
      let jsonText = responseText.trim()
      const patterns = [
        /```json\n([\s\S]*?)\n```/,
        /```json([\s\S]*?)```/,
        /```\n([\s\S]*?)\n```/,
        /```([\s\S]*?)```/
      ]
      for (const pattern of patterns) {
        const match = jsonText.match(pattern)
        if (match) { jsonText = match[1].trim(); break }
      }
      jsonText = jsonText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '')
      variationsResult = JSON.parse(jsonText)
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Erro ao processar resposta do Content Squad', details: e.message },
        { status: 500 }
      )
    }

    // Marcar variações com metadados de origem
    const variationMeta = { is_variation: true, variation_source: { type: sourceType, title: sourceTitle } }

    const newCarousels = (variationsResult.carousels || []).map((c: any) => ({
      ...c,
      ...variationMeta,
      approved: null
    }))
    const newReels = (variationsResult.reels || []).map((r: any) => ({
      ...r,
      ...variationMeta,
      approved: null
    }))

    // Fazer append nos arrays existentes
    const currentContentJson = (cs.content_json as any) || { carousels: [], estrategia_geral: '', proximos_passos: [] }
    const currentReelsJson = (cs.reels_json as any) || { reels: [] }

    currentContentJson.carousels = [...(currentContentJson.carousels || []), ...newCarousels]
    currentReelsJson.reels = [...(currentReelsJson.reels || []), ...newReels]

    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: currentContentJson,
        reels_json: currentReelsJson
      })
      .eq('id', cs.id)

    if (updateError) {
      console.error('Erro ao salvar variações:', updateError)
      return NextResponse.json({ error: 'Erro ao salvar variações' }, { status: 500 })
    }

    console.log(`✅ ${newCarousels.length} carrosséis + ${newReels.length} reels gerados como variações`)

    return NextResponse.json({
      success: true,
      source: { type: sourceType, title: sourceTitle },
      new_carousels: newCarousels,
      new_reels: newReels,
      new_carousels_count: newCarousels.length,
      new_reels_count: newReels.length
    })

  } catch (error: any) {
    console.error('Erro ao gerar variações:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar variações', details: error.message },
      { status: 500 }
    )
  }
}
