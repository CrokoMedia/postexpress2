import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * POST /api/content/[id]/refine-carousel
 * Refina um carrossel específico com base nas instruções do usuário
 * Body: { carouselIndex, carousel, instructions }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { carouselIndex, carousel, instructions } = body

    if (typeof carouselIndex !== 'number' || !carousel || !instructions?.trim()) {
      return NextResponse.json(
        { error: 'carouselIndex, carousel e instructions são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestion existente
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json, slides_json, profile_id')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    // Buscar contexto do perfil para obter termos a evitar
    const { data: profileContext } = await supabase
      .from('profile_context')
      .select('content_style')
      .eq('profile_id', contentSuggestion.profile_id)
      .is('deleted_at', null)
      .single()

    const termsToAvoid = profileContext?.content_style?.language?.termsToAvoid || []

    // Preparar instrução de termos a evitar
    const termsWarning = termsToAvoid.length > 0
      ? `\n\n## 🚫 TERMOS PROIBIDOS - NUNCA USE:\n${termsToAvoid.map((t: string) => `- ${t}`).join('\n')}\n\nSempre substitua por sinônimos simples que o público entende.`
      : ''

    // Chamar Claude para refinar o carrossel
    const carouselJson = JSON.stringify(carousel, null, 2)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Você é um especialista em criação de conteúdo para Instagram. Preciso que você refine e melhore o carrossel abaixo de acordo com as instruções do usuário.

## Carrossel Atual:
\`\`\`json
${carouselJson}
\`\`\`

## Instruções do Usuário:
${instructions}
${termsWarning}

## Regras:
1. Retorne APENAS o JSON do carrossel atualizado, sem explicações
2. Mantenha EXATAMENTE a mesma estrutura JSON do carrossel original
3. Preserve os campos: titulo, tipo, objetivo, baseado_em, slides, caption, hashtags, cta, approved
4. Cada slide deve ter: numero, tipo, titulo, corpo, notas_design
5. Aplique as instruções do usuário mantendo a qualidade e coerência do conteúdo
6. Se o usuário pedir para adicionar informações específicas, integre naturalmente ao conteúdo
7. Não invente dados que o usuário não forneceu
8. ${termsToAvoid.length > 0 ? 'NUNCA use os termos proibidos listados acima. Sempre substitua por linguagem simples.' : 'Mantenha linguagem simples e acessível.'}

Retorne apenas o JSON válido, sem markdown, sem explicações.`
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Limpar e parsear o JSON
    let refinedCarousel: any
    try {
      const cleaned = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      refinedCarousel = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'Falha ao processar resposta da IA. Tente novamente.' },
        { status: 500 }
      )
    }

    // Preservar campo approved do carrossel original
    refinedCarousel.approved = carousel.approved

    // Atualizar no banco
    const contentJson = contentSuggestion.content_json as any
    contentJson.carousels[carouselIndex] = refinedCarousel

    // IMPORTANTE: Limpar slides gerados do carrossel editado para forçar regeneração
    let slidesJson = contentSuggestion.slides_json as any
    if (slidesJson?.carousels) {
      // Remover slides do carrossel editado baseado no título
      slidesJson.carousels = slidesJson.carousels.filter((c: any) =>
        c.title !== carousel.titulo && c.title !== refinedCarousel.titulo
      )
      console.log(`🔄 Slides do carrossel "${refinedCarousel.titulo}" removidos para forçar regeneração`)
    }

    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: contentJson,
        slides_json: slidesJson
      })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao salvar carrossel refinado' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      carousel: refinedCarousel,
      carouselIndex
    })

  } catch (error: any) {
    console.error('Error refining carousel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao refinar carrossel' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/content/[id]/refine-carousel
 * Salva edições diretas no carrossel (sem IA)
 * Body: { carouselIndex, carousel }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { carouselIndex, carousel } = body

    if (typeof carouselIndex !== 'number' || !carousel) {
      return NextResponse.json(
        { error: 'carouselIndex e carousel são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json, slides_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const contentJson = contentSuggestion.content_json as any
    const originalCarousel = contentJson.carousels[carouselIndex]
    contentJson.carousels[carouselIndex] = carousel

    // IMPORTANTE: Limpar slides gerados do carrossel editado para forçar regeneração
    let slidesJson = contentSuggestion.slides_json as any
    if (slidesJson?.carousels) {
      // Remover slides do carrossel editado baseado no título
      slidesJson.carousels = slidesJson.carousels.filter((c: any) =>
        c.title !== originalCarousel?.titulo && c.title !== carousel.titulo
      )
      console.log(`🔄 Slides do carrossel "${carousel.titulo}" removidos para forçar regeneração`)
    }

    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: contentJson,
        slides_json: slidesJson
      })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao salvar edições' }, { status: 500 })
    }

    return NextResponse.json({ success: true, carousel, carouselIndex })

  } catch (error: any) {
    console.error('Error saving carousel edits:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar edições' },
      { status: 500 }
    )
  }
}
