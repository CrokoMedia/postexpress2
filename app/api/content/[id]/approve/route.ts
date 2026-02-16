import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * API para aprovar/desaprovar carrosséis
 * PUT /api/content/[id]/approve
 * Body: { carouselIndex: number, approved: boolean }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { carouselIndex, approved } = body

    if (typeof carouselIndex !== 'number' || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'carouselIndex (number) e approved (boolean) são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestion existente
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar aprovação no JSON
    const contentJson = contentSuggestion.content_json as any

    if (!contentJson.carousels || !contentJson.carousels[carouselIndex]) {
      return NextResponse.json(
        { error: 'Carrossel não encontrado no índice especificado' },
        { status: 404 }
      )
    }

    // Adicionar campo approved
    contentJson.carousels[carouselIndex].approved = approved

    // Salvar de volta no banco
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({ content_json: contentJson })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('Erro ao atualizar aprovação:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar aprovação' },
        { status: 500 }
      )
    }

    console.log(`✅ Carrossel ${carouselIndex} ${approved ? 'aprovado' : 'desaprovado'}`)

    return NextResponse.json({
      success: true,
      carouselIndex,
      approved
    })

  } catch (error: any) {
    console.error('Error approving carousel:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve carousel' },
      { status: 500 }
    )
  }
}

/**
 * Aprovar múltiplos carrosséis de uma vez
 * POST /api/content/[id]/approve
 * Body: { approvals: [{ carouselIndex: number, approved: boolean }] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { approvals } = body

    if (!Array.isArray(approvals)) {
      return NextResponse.json(
        { error: 'approvals deve ser um array' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestion existente
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar aprovações no JSON
    const contentJson = contentSuggestion.content_json as any

    for (const approval of approvals) {
      const { carouselIndex, approved } = approval

      if (contentJson.carousels && contentJson.carousels[carouselIndex]) {
        contentJson.carousels[carouselIndex].approved = approved
      }
    }

    // Salvar de volta no banco
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({ content_json: contentJson })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('Erro ao atualizar aprovações:', updateError)
      return NextResponse.json(
        { error: 'Erro ao salvar aprovações' },
        { status: 500 }
      )
    }

    const approvedCount = approvals.filter(a => a.approved).length
    console.log(`✅ ${approvedCount}/${approvals.length} carrosséis aprovados`)

    return NextResponse.json({
      success: true,
      processed: approvals.length,
      approved: approvedCount
    })

  } catch (error: any) {
    console.error('Error approving carousels:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve carousels' },
      { status: 500 }
    )
  }
}
