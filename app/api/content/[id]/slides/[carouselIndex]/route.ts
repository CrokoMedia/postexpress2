import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    // Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, slides_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const slidesJson = existing.slides_json as any

    if (!slidesJson?.carousels) {
      return NextResponse.json(
        { error: 'Nenhum slide gerado ainda' },
        { status: 404 }
      )
    }

    // Encontrar carrossel
    const carouselToDelete = slidesJson.carousels.find(
      (c: any) => c.carouselIndex === index
    )

    if (!carouselToDelete) {
      return NextResponse.json(
        { error: 'Slides deste carrossel não encontrados' },
        { status: 404 }
      )
    }

    // Extrair public_ids do Cloudinary
    const publicIds = carouselToDelete.slides.map(
      (s: any) => s.cloudinaryPublicId
    )

    console.log(`🗑️ Deletando ${publicIds.length} slides do Cloudinary...`)

    // Deletar do Cloudinary em batch
    const deletePromises = publicIds.map((publicId: string) =>
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
        .catch(err => {
          console.warn(`⚠️ Erro ao deletar ${publicId}:`, err.message)
          return { result: 'error', error: err.message }
        })
    )

    const cloudinaryResults = await Promise.allSettled(deletePromises)
    const deletedCount = cloudinaryResults.filter(
      r => r.status === 'fulfilled' && (r.value as any).result === 'ok'
    ).length

    console.log(`✅ Deletados ${deletedCount}/${publicIds.length} slides do Cloudinary`)

    // Remover do slides_json
    slidesJson.carousels = slidesJson.carousels.filter(
      (c: any) => c.carouselIndex !== index
    )

    // Atualizar summary
    slidesJson.summary = {
      totalCarousels: slidesJson.carousels.length,
      totalSlides: slidesJson.carousels.reduce(
        (acc: number, c: any) => acc + c.slides.length,
        0
      )
    }

    // Atualizar no Supabase (null se vazio)
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        slides_json: slidesJson.carousels.length > 0 ? slidesJson : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      throw new Error('Erro ao atualizar banco de dados')
    }

    return NextResponse.json({
      success: true,
      message: `Slides do carrossel ${index} deletados`,
      deletedImages: publicIds.length,
      cloudinaryDeleted: deletedCount,
      cloudinaryFailed: publicIds.length - deletedCount
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar slides:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar slides' },
      { status: 500 }
    )
  }
}
