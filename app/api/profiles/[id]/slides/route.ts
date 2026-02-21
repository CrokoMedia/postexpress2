import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

/**
 * GET - Buscar todos os slides gerados para um perfil (across all audits)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Buscar todas as content_suggestions desse perfil que possam ter slides
    const { data, error } = await supabase
      .from('content_suggestions')
      .select(`
        audit_id,
        slides_json,
        slides_v2_json,
        generated_at,
        audits (
          id,
          created_at,
          overall_score,
          posts_analyzed
        )
      `)
      .eq('profile_id', id)
      .order('generated_at', { ascending: false })

    if (error) throw error

    // Filtrar apenas entradas que realmente têm slides gerados
    const withSlides = (data || []).filter((item: any) => {
      const hasV1 = item.slides_json?.carousels?.length > 0
      const hasV2 = item.slides_v2_json?.carousels?.length > 0
      return hasV1 || hasV2
    })

    // Calcular totais
    let totalSlidesV1 = 0
    let totalSlidesV2 = 0
    for (const item of withSlides) {
      totalSlidesV1 += item.slides_json?.summary?.totalSlides || 0
      totalSlidesV2 += item.slides_v2_json?.summary?.totalSlides || 0
    }

    return NextResponse.json({
      audits: withSlides.map((item: any) => {
        // Supabase join pode retornar array ou objeto
        const audit = Array.isArray(item.audits) ? item.audits[0] : item.audits
        return {
          audit_id: item.audit_id,
          audit_date: audit?.created_at,
          overall_score: audit?.overall_score,
          posts_analyzed: audit?.posts_analyzed,
          slides_json: item.slides_json,
          slides_v2_json: item.slides_v2_json,
          generated_at: item.generated_at,
        }
      }),
      total_audits: withSlides.length,
      total_slides: totalSlidesV1 + totalSlidesV2,
      total_slides_v1: totalSlidesV1,
      total_slides_v2: totalSlidesV2,
    })
  } catch (error: any) {
    console.error('Erro ao buscar slides do perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar slides', details: error.message },
      { status: 500 }
    )
  }
}
