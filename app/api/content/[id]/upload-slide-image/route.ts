import { NextRequest, NextResponse } from 'next/server'
import cloudinary from 'cloudinary'

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * POST /api/content/[id]/upload-slide-image
 * Upload de imagem customizada para um slide específico
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()

    const file = formData.get('file') as File
    const carouselIndex = formData.get('carouselIndex') as string
    const slideIndex = formData.get('slideIndex') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser uma imagem (PNG, JPG, etc.)' },
        { status: 400 }
      )
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagem muito grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload para Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: `custom-slide-images/${id}/carousel-${carouselIndex}`,
            public_id: `slide-${slideIndex}-custom`,
            overwrite: true,
            resource_type: 'image',
            // Redimensionar para as dimensões do slide se necessário
            transformation: [
              { width: 956, height: 448, crop: 'fill', gravity: 'center' },
            ],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    })
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem customizada:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
}
