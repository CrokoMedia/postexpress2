import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * Aprovar ou rejeitar uma ideia de Reel
 * PUT /api/content/[id]/approve-reel
 * Body: { reelIndex: number, approved: boolean }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reelIndex, approved } = body

    if (typeof reelIndex !== 'number' || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'reelIndex (number) e approved (boolean) são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, reels_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const reelsJson = contentSuggestion.reels_json as any

    if (!reelsJson?.reels || !reelsJson.reels[reelIndex]) {
      return NextResponse.json({ error: 'Reel não encontrado no índice especificado' }, { status: 404 })
    }

    reelsJson.reels[reelIndex].approved = approved

    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({ reels_json: reelsJson })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('Erro ao atualizar aprovação do reel:', updateError)
      return NextResponse.json({ error: 'Erro ao salvar aprovação' }, { status: 500 })
    }

    console.log(`✅ Reel ${reelIndex} ${approved ? 'aprovado' : 'rejeitado'}`)

    return NextResponse.json({ success: true, reelIndex, approved })

  } catch (error: any) {
    console.error('Erro ao aprovar reel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao aprovar reel' },
      { status: 500 }
    )
  }
}
