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
 * POST /api/brand-kits/[id]/upload-logo
 * Upload de logo para um Brand Kit
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandKitId } = await params
    const supabase = getServerSupabase()

    // Buscar brand kit para obter profile_id e logo atual
    const { data: brandKit, error: brandKitError } = await supabase
      .from('brand_kits')
      .select('id, profile_id, logo_url, logo_public_id')
      .eq('id', brandKitId)
      .is('deleted_at', null)
      .single()

    if (brandKitError || !brandKit) {
      return NextResponse.json(
        { error: 'Brand Kit not found' },
        { status: 404 }
      )
    }

    // Obter arquivo do FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo (apenas imagens)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image (PNG, JPG, SVG, etc.)' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Max size: 5MB' },
        { status: 400 }
      )
    }

    // Se já existe logo no Cloudinary, deletar o antigo
    if (brandKit.logo_public_id) {
      try {
        await cloudinary.v2.uploader.destroy(brandKit.logo_public_id)
        console.log(`[Brand Kit ${brandKitId}] Logo antigo deletado do Cloudinary: ${brandKit.logo_public_id}`)
      } catch (deleteError) {
        console.error('[Brand Kit] Erro ao deletar logo antigo do Cloudinary:', deleteError)
        // Não bloquear o upload se falhar ao deletar o antigo
      }
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: `post-express/brand-kits/${brandKit.profile_id}`,
            public_id: `logo-${brandKitId}`,
            overwrite: true,
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    const logoUrl = uploadResult.secure_url
    const logoPublicId = uploadResult.public_id

    // Atualizar brand kit com nova logo
    const { error: updateError } = await supabase
      .from('brand_kits')
      .update({
        logo_url: logoUrl,
        logo_public_id: logoPublicId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', brandKitId)

    if (updateError) {
      console.error('[Brand Kit] Erro ao atualizar logo no banco:', updateError)
      // Tentar deletar do Cloudinary se falhou ao salvar no banco
      try {
        await cloudinary.v2.uploader.destroy(logoPublicId)
      } catch (cleanupError) {
        console.error('[Brand Kit] Erro ao limpar logo do Cloudinary após falha no banco:', cleanupError)
      }
      return NextResponse.json(
        { error: 'Failed to update brand kit with new logo' },
        { status: 500 }
      )
    }

    console.log(`[Brand Kit ${brandKitId}] Logo atualizado com sucesso: ${logoUrl}`)

    return NextResponse.json({
      success: true,
      logo_url: logoUrl,
      logo_cloudinary_public_id: logoPublicId,
    })

  } catch (error: any) {
    console.error('[Brand Kit] Erro ao fazer upload de logo:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload logo' },
      { status: 500 }
    )
  }
}
