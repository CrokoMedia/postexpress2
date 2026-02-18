import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import JSZip from 'jszip'

/**
 * POST /api/content/[id]/export-zip
 * Gera um ZIP com todos os slides visuais dos carrosséis aprovados.
 * O [id] é o audit_id.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Buscar slides salvos para esta auditoria (ambos os templates)
    const { data, error } = await supabase
      .from('content_suggestions')
      .select('slides_json, slides_v2_json')
      .eq('audit_id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere os slides visuais primeiro.' },
        { status: 404 }
      )
    }

    const slidesV1 = data.slides_json as any
    const slidesV2 = data.slides_v2_json as any

    if (
      (!slidesV1?.carousels || slidesV1.carousels.length === 0) &&
      (!slidesV2?.carousels || slidesV2.carousels.length === 0)
    ) {
      return NextResponse.json(
        { error: 'Nenhum slide gerado. Gere os slides visuais primeiro.' },
        { status: 400 }
      )
    }

    const zip = new JSZip()

    // Adicionar slides V1 (template padrão)
    if (slidesV1?.carousels?.length > 0) {
      const approvedV1 = slidesV1.carousels.filter((c: any) => c.approved === true)
      if (approvedV1.length > 0) {
        const v1Folder = zip.folder('Template-Padrao')!
        console.log(`📦 V1: ${approvedV1.length} carrosséis aprovados...`)
        for (const carousel of approvedV1) {
          const folderName = `Carrossel-${carousel.carouselIndex + 1}-${slugify(carousel.title)}`
          const carouselFolder = v1Folder.folder(folderName)
          if (!carouselFolder) continue
          for (const slide of carousel.slides) {
            const slideResponse = await fetch(slide.cloudinaryUrl)
            if (!slideResponse.ok) {
              console.warn(`⚠️ Falha ao baixar slide V1 ${slide.slideNumber}`)
              continue
            }
            const buffer = Buffer.from(await slideResponse.arrayBuffer())
            carouselFolder.file(`slide-${slide.slideNumber}.png`, buffer)
          }
        }
      }
    }

    // Adicionar slides V2 (template com IA)
    if (slidesV2?.carousels?.length > 0) {
      const approvedV2 = slidesV2.carousels.filter((c: any) => c.approved === true)
      if (approvedV2.length > 0) {
        const v2Folder = zip.folder('Template-Com-IA')!
        console.log(`📦 V2: ${approvedV2.length} carrosséis aprovados...`)
        for (const carousel of approvedV2) {
          const folderName = `Carrossel-${carousel.carouselIndex + 1}-${slugify(carousel.title)}`
          const carouselFolder = v2Folder.folder(folderName)
          if (!carouselFolder) continue
          for (const slide of carousel.slides) {
            const slideResponse = await fetch(slide.cloudinaryUrl)
            if (!slideResponse.ok) {
              console.warn(`⚠️ Falha ao baixar slide V2 ${slide.slideNumber}`)
              continue
            }
            const buffer = Buffer.from(await slideResponse.arrayBuffer())
            carouselFolder.file(`slide-${slide.slideNumber}.png`, buffer)
          }
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="carrosseis-slides.zip"`,
        'Content-Length': String(zipBuffer.length),
      },
    })
  } catch (error: any) {
    console.error('Erro ao gerar ZIP:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar ZIP', details: error.message },
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
