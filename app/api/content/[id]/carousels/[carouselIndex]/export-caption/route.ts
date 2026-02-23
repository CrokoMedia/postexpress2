import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

/**
 * GET /api/content/[id]/carousels/[carouselIndex]/export-caption
 * Retorna a caption de um carrossel como arquivo TXT
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; carouselIndex: string } }
) {
  try {
    const { id: auditId, carouselIndex: carouselIndexStr } = params
    const carouselIndex = parseInt(carouselIndexStr, 10)

    if (isNaN(carouselIndex)) {
      return NextResponse.json(
        { error: 'Índice do carrossel inválido' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // 1. Buscar content_suggestions pelo audit_id
    const { data: contentSuggestion, error: contentError } = await supabase
      .from('content_suggestions')
      .select('content_json')
      .eq('audit_id', auditId)
      .single()

    if (contentError || !contentSuggestion) {
      console.error('Erro ao buscar content_suggestions:', contentError)
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const contentJson = contentSuggestion.content_json as any

    if (!contentJson?.carousels || !Array.isArray(contentJson.carousels)) {
      return NextResponse.json(
        { error: 'Nenhum carrossel encontrado' },
        { status: 404 }
      )
    }

    // 2. Buscar o carrossel pelo índice
    const carousel = contentJson.carousels[carouselIndex]

    if (!carousel) {
      return NextResponse.json(
        { error: `Carrossel ${carouselIndex} não encontrado` },
        { status: 404 }
      )
    }

    // 3. Montar o texto da legenda
    const captionText = `
═══════════════════════════════════════════════
${carousel.titulo.toUpperCase()}
═══════════════════════════════════════════════

📝 CAPTION:

${carousel.caption}

${carousel.hashtags && carousel.hashtags.length > 0 ? `
🏷️ HASHTAGS:

${carousel.hashtags.map((tag: string) => `#${tag}`).join(' ')}
` : ''}

${carousel.cta ? `
🎯 CALL TO ACTION:

${carousel.cta}
` : ''}

═══════════════════════════════════════════════
Gerado por Post Express | ${new Date().toLocaleDateString('pt-BR')}
═══════════════════════════════════════════════
`.trim()

    // 4. Retornar como arquivo TXT
    const filename = `legenda-${carousel.titulo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .substring(0, 50)}.txt`

    return new NextResponse(captionText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('Erro ao exportar caption:', err)
    return NextResponse.json(
      { error: 'Erro interno ao gerar arquivo TXT', details: err.message },
      { status: 500 }
    )
  }
}
