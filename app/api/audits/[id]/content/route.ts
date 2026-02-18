import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * GET - Buscar conteúdo salvo para uma auditoria
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Buscar conteúdo salvo (incluindo slides de ambos os templates)
    const { data, error } = await supabase
      .from('content_suggestions')
      .select('content_json, slides_json, slides_v2_json, reels_json, generated_at')
      .eq('audit_id', id)
      .single()

    if (error) {
      // Se não encontrar, retorna vazio sem erro
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          content: null,
          slides: null,
          reels: null,
          message: 'Nenhum conteúdo gerado ainda'
        })
      }

      throw error
    }

    return NextResponse.json({
      content: data.content_json,
      slides: data.slides_json,
      slides_v2: data.slides_v2_json,
      reels: data.reels_json,
      generated_at: data.generated_at
    })

  } catch (error: any) {
    console.error('Erro ao buscar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar conteúdo', details: error.message },
      { status: 500 }
    )
  }
}
