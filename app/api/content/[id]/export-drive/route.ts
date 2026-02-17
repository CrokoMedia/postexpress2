import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getGoogleDriveClient, findOrCreateFolder, uploadFile } from '@/lib/google-drive'

/**
 * POST /api/content/[id]/export-drive
 * Envia os slides dos carrosséis aprovados para o Google Drive do cliente.
 *
 * Estrutura criada:
 *   Post Express (pasta raiz via GOOGLE_DRIVE_FOLDER_ID)
 *     └── @username
 *           └── Carrossel-1-Titulo
 *                 ├── slide-1.png
 *                 └── slide-2.png
 *
 * O [id] é o audit_id.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!rootFolderId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FOLDER_ID não configurado.' },
        { status: 500 }
      )
    }

    // Buscar slides e profile_id
    const { data: contentData, error: contentError } = await supabase
      .from('content_suggestions')
      .select('slides_json, profile_id')
      .eq('audit_id', id)
      .single()

    if (contentError || !contentData) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere os slides visuais primeiro.' },
        { status: 404 }
      )
    }

    const slidesData = contentData.slides_json as any

    if (!slidesData?.carousels || slidesData.carousels.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum slide gerado. Gere os slides visuais primeiro.' },
        { status: 400 }
      )
    }

    // Filtrar apenas carrosséis aprovados
    const approvedCarousels = slidesData.carousels.filter(
      (c: any) => c.approved === true
    )

    if (approvedCarousels.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum carrossel aprovado encontrado.' },
        { status: 400 }
      )
    }

    // Buscar username do perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', contentData.profile_id)
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'Perfil não encontrado.' },
        { status: 404 }
      )
    }

    const username = profileData.username

    console.log(`☁️ Enviando ${approvedCarousels.length} carrosséis para o Google Drive (@${username})...`)

    const drive = getGoogleDriveClient()

    // Criar/encontrar pasta do usuário dentro da pasta raiz "Post Express"
    const userFolderId = await findOrCreateFolder(drive, `@${username}`, rootFolderId)

    const uploadedCarousels: Array<{
      title: string
      folderId: string
      slidesUploaded: number
    }> = []

    let totalSlidesUploaded = 0

    for (const carousel of approvedCarousels) {
      const carouselFolderName = `Carrossel-${carousel.carouselIndex + 1}-${slugify(carousel.title)}`
      const carouselFolderId = await findOrCreateFolder(drive, carouselFolderName, userFolderId)

      let slidesUploaded = 0

      for (const slide of carousel.slides) {
        const slideResponse = await fetch(slide.cloudinaryUrl)
        if (!slideResponse.ok) {
          console.warn(`⚠️ Falha ao baixar slide ${slide.slideNumber}: ${slide.cloudinaryUrl}`)
          continue
        }

        const buffer = Buffer.from(await slideResponse.arrayBuffer())
        await uploadFile(drive, `slide-${slide.slideNumber}.png`, buffer, 'image/png', carouselFolderId)
        slidesUploaded++
      }

      uploadedCarousels.push({
        title: carousel.title,
        folderId: carouselFolderId,
        slidesUploaded,
      })

      totalSlidesUploaded += slidesUploaded
      console.log(`  ✅ ${carouselFolderName}: ${slidesUploaded} slides enviados`)
    }

    return NextResponse.json({
      success: true,
      username,
      userFolderId,
      carousels: uploadedCarousels,
      totalSlidesUploaded,
      message: `${totalSlidesUploaded} slides enviados para o Google Drive em ${approvedCarousels.length} pasta(s).`,
    })
  } catch (error: any) {
    console.error('Erro ao enviar para o Google Drive:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar para o Google Drive', details: error.message },
      { status: 500 }
    )
  }
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50)
}
