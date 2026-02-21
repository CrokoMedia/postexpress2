import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reelIndex: string } }
) {
  try {
    const { id: audit_id, reelIndex } = params
    const index = parseInt(reelIndex, 10)

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
      .select('id, reel_videos_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const reelVideosJson = existing.reel_videos_json as any

    if (!reelVideosJson?.videos || index >= reelVideosJson.videos.length || index < 0) {
      return NextResponse.json(
        { error: 'Reel não encontrado' },
        { status: 404 }
      )
    }

    // Extrair public_id do Cloudinary
    const reelToDelete = reelVideosJson.videos[index]
    const publicId = reelToDelete.cloudinaryPublicId

    console.log(`🗑️ Deletando reel do Cloudinary: ${publicId}`)

    // Deletar do Cloudinary (tipo video)
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video'
      })
      console.log(`✅ Reel deletado do Cloudinary:`, result)
    } catch (cloudErr: any) {
      console.warn('⚠️ Erro ao deletar do Cloudinary:', cloudErr.message)
      // Continua mesmo se falhar (pode já ter sido deletado manualmente)
    }

    // Remover do array
    const deletedReel = reelVideosJson.videos.splice(index, 1)[0]

    // Atualizar no Supabase (null se vazio)
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        reel_videos_json: reelVideosJson.videos.length > 0 ? reelVideosJson : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Erro ao atualizar Supabase:', updateError)
      throw new Error('Erro ao atualizar banco de dados')
    }

    return NextResponse.json({
      success: true,
      message: 'Reel deletado',
      deletedTitle: deletedReel.title,
      cloudinaryDeleted: publicId
    })

  } catch (error: any) {
    console.error('❌ Erro ao deletar reel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar reel' },
      { status: 500 }
    )
  }
}
