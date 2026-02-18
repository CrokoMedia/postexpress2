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

    // Buscar slides de ambos os templates e profile_id
    const { data: contentData, error: contentError } = await supabase
      .from('content_suggestions')
      .select('slides_json, slides_v2_json, profile_id')
      .eq('audit_id', id)
      .single()

    if (contentError || !contentData) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere os slides visuais primeiro.' },
        { status: 404 }
      )
    }

    const slidesV1 = contentData.slides_json as any
    const slidesV2 = contentData.slides_v2_json as any

    const approvedV1 = slidesV1?.carousels?.filter((c: any) => c.approved === true) || []
    const approvedV2 = slidesV2?.carousels?.filter((c: any) => c.approved === true) || []

    if (approvedV1.length === 0 && approvedV2.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum slide gerado. Gere os slides visuais primeiro.' },
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

    console.log(`☁️ Enviando carrosséis para o Google Drive (@${username})...`)

    const drive = getGoogleDriveClient()

    // Criar/encontrar pasta do usuário dentro da pasta raiz "Post Express"
    const userFolderId = await findOrCreateFolder(drive, `@${username}`, rootFolderId)

    const uploadedCarousels: Array<{
      title: string
      folderId: string
      slidesUploaded: number
    }> = []

    let totalSlidesUploaded = 0

    // Função auxiliar para enviar carrosséis de um template para uma pasta
    const uploadCarousels = async (carousels: any[], parentFolderId: string) => {
      for (const carousel of carousels) {
        const carouselFolderName = `Carrossel-${carousel.carouselIndex + 1}-${slugify(carousel.title)}`
        const carouselFolderId = await findOrCreateFolder(drive, carouselFolderName, parentFolderId)

        let slidesUploaded = 0

        for (const slide of carousel.slides) {
          const slideResponse = await fetch(slide.cloudinaryUrl)
          if (!slideResponse.ok) {
            console.warn(`⚠️ Falha ao baixar slide ${slide.slideNumber}`)
            continue
          }

          const buffer = Buffer.from(await slideResponse.arrayBuffer())
          await uploadFile(drive, `slide-${slide.slideNumber}.png`, buffer, 'image/png', carouselFolderId)
          slidesUploaded++
        }

        uploadedCarousels.push({ title: carousel.title, folderId: carouselFolderId, slidesUploaded })
        totalSlidesUploaded += slidesUploaded
        console.log(`  ✅ ${carouselFolderName}: ${slidesUploaded} slides enviados`)
      }
    }

    // Enviar slides V1 (template padrão)
    if (approvedV1.length > 0) {
      const v1FolderId = await findOrCreateFolder(drive, 'Template-Padrao', userFolderId)
      console.log(`☁️ Enviando ${approvedV1.length} carrosséis V1...`)
      await uploadCarousels(approvedV1, v1FolderId)
    }

    // Enviar slides V2 (template com IA)
    if (approvedV2.length > 0) {
      const v2FolderId = await findOrCreateFolder(drive, 'Template-Com-IA', userFolderId)
      console.log(`☁️ Enviando ${approvedV2.length} carrosséis V2...`)
      await uploadCarousels(approvedV2, v2FolderId)
    }

    return NextResponse.json({
      success: true,
      username,
      userFolderId,
      carousels: uploadedCarousels,
      totalSlidesUploaded,
      message: `${totalSlidesUploaded} slides enviados para o Google Drive em ${uploadedCarousels.length} pasta(s).`,
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
