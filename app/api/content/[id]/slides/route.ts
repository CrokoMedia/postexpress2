import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * DELETE /api/content/[id]/slides
 * Deleta todos os slides de uma auditoria e remove imagens do Cloudinary.
 *
 * DELETE /api/content/[id]/slides?carouselIndex=0
 * Deleta apenas o carrossel no índice especificado.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const carouselIndexParam = searchParams.get('carouselIndex')
    // template=v1|v2 — qual template deletar (padrão: v1)
    const template = searchParams.get('template') || 'v1'

    const supabase = getServerSupabase()

    // Buscar content_suggestion com slides de ambos os templates
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, slides_json, slides_v2_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const isV2 = template === 'v2'
    const slidesJson = (isV2 ? contentSuggestion.slides_v2_json : contentSuggestion.slides_json) as any
    const dbField = isV2 ? 'slides_v2_json' : 'slides_json'

    if (!slidesJson || !slidesJson.carousels) {
      return NextResponse.json(
        { error: 'Nenhum slide para excluir' },
        { status: 404 }
      )
    }

    const publicIdsToDelete: string[] = []
    let newSlidesJson: any = null

    if (carouselIndexParam !== null) {
      // Deletar carrossel específico
      const idx = parseInt(carouselIndexParam, 10)
      const carousel = slidesJson.carousels[idx]

      if (!carousel) {
        return NextResponse.json(
          { error: `Carrossel no índice ${idx} não encontrado` },
          { status: 404 }
        )
      }

      for (const slide of carousel.slides) {
        if (slide.cloudinaryPublicId) {
          publicIdsToDelete.push(slide.cloudinaryPublicId)
        }
      }

      const newCarousels = slidesJson.carousels.filter((_: any, i: number) => i !== idx)

      if (newCarousels.length > 0) {
        const totalSlides = newCarousels.reduce((acc: number, c: any) => acc + c.slides.length, 0)
        newSlidesJson = {
          ...slidesJson,
          carousels: newCarousels,
          summary: {
            totalCarousels: newCarousels.length,
            totalSlides,
          },
        }
      }
      // else: newSlidesJson permanece null (sem carrosséis restantes)
    } else {
      // Deletar todos os slides do template
      for (const carousel of slidesJson.carousels) {
        for (const slide of carousel.slides) {
          if (slide.cloudinaryPublicId) {
            publicIdsToDelete.push(slide.cloudinaryPublicId)
          }
        }
      }
      // newSlidesJson permanece null
    }

    // Deletar imagens do Cloudinary (sem bloquear se alguma falhar)
    if (publicIdsToDelete.length > 0) {
      console.log(`🗑️ Deletando ${publicIdsToDelete.length} imagem(ns) do Cloudinary...`)
      const results = await Promise.allSettled(
        publicIdsToDelete.map((pid) => cloudinary.v2.uploader.destroy(pid))
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      if (failed > 0) {
        console.warn(`⚠️ ${failed} imagem(ns) não puderam ser deletadas do Cloudinary`)
      } else {
        console.log(`✅ Imagens deletadas do Cloudinary com sucesso`)
      }
    }

    // Atualizar banco de dados (campo correto por template)
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({ [dbField]: newSlidesJson })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar banco após deleção:', updateError)
      return NextResponse.json(
        { error: 'Erro ao excluir slides do banco de dados' },
        { status: 500 }
      )
    }

    const message = carouselIndexParam !== null
      ? 'Carrossel excluído com sucesso'
      : 'Todos os slides excluídos com sucesso'

    console.log(`✅ ${message}`)
    return NextResponse.json({ success: true, message })

  } catch (error: any) {
    console.error('Erro ao excluir slides:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir slides' },
      { status: 500 }
    )
  }
}
