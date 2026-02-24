import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; carouselIndex: string }> }
) {
  try {
    const { id: audit_id, carouselIndex } = await params
    const index = parseInt(carouselIndex, 10)

    if (isNaN(index)) {
      return NextResponse.json(
        { error: 'Índice inválido' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar content_suggestions com conteúdo textual
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const contentJson = existing.content_json as any

    if (!contentJson?.carousels || index >= contentJson.carousels.length || index < 0) {
      return NextResponse.json(
        { error: 'Carrossel não encontrado' },
        { status: 404 }
      )
    }

    // Remover carrossel textual do array
    const deletedCarousel = contentJson.carousels.splice(index, 1)[0]

    // Atualizar content_json no Supabase
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: contentJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      throw new Error('Erro ao atualizar banco de dados')
    }

    console.log(`✅ Carrossel textual ${index} deletado: "${deletedCarousel.titulo}"`)

    return NextResponse.json({
      success: true,
      message: `Carrossel "${deletedCarousel.titulo}" deletado`,
      remainingCarousels: contentJson.carousels.length
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar carrossel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar carrossel' },
      { status: 500 }
    )
  }
}
