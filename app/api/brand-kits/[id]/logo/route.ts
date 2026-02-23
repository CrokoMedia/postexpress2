import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import cloudinary from 'cloudinary'

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * DELETE /api/brand-kits/[id]/logo
 * Remove o logo de um Brand Kit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandKitId } = await params
    const supabase = getServerSupabase()

    // Buscar brand kit para obter logo atual
    const { data: brandKit, error: brandKitError } = await supabase
      .from('brand_kits')
      .select('id, logo_url, logo_cloudinary_public_id')
      .eq('id', brandKitId)
      .is('deleted_at', null)
      .single()

    if (brandKitError || !brandKit) {
      return NextResponse.json(
        { error: 'Brand Kit not found' },
        { status: 404 }
      )
    }

    // Se existe logo no Cloudinary, deletar
    if (brandKit.logo_cloudinary_public_id) {
      try {
        await cloudinary.v2.uploader.destroy(brandKit.logo_cloudinary_public_id)
        console.log(`[Brand Kit ${brandKitId}] Logo deletado do Cloudinary: ${brandKit.logo_cloudinary_public_id}`)
      } catch (deleteError) {
        console.error('[Brand Kit] Erro ao deletar logo do Cloudinary:', deleteError)
        // Continuar mesmo se falhar ao deletar do Cloudinary
        // (pode já ter sido deletado manualmente, ou publicId pode estar incorreto)
      }
    }

    // Atualizar brand kit removendo referências ao logo
    const { error: updateError } = await supabase
      .from('brand_kits')
      .update({
        logo_url: null,
        logo_cloudinary_public_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', brandKitId)

    if (updateError) {
      console.error('[Brand Kit] Erro ao remover logo do banco:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove logo from brand kit' },
        { status: 500 }
      )
    }

    console.log(`[Brand Kit ${brandKitId}] Logo removido com sucesso`)

    return NextResponse.json({
      success: true,
    })

  } catch (error: any) {
    console.error('[Brand Kit] Erro ao deletar logo:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete logo' },
      { status: 500 }
    )
  }
}
