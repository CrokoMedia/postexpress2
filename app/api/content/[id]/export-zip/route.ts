import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
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
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Buscar slides salvos para esta auditoria
    const { data, error } = await supabase
      .from('content_suggestions')
      .select('slides_json')
      .eq('audit_id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere os slides visuais primeiro.' },
        { status: 404 }
      )
    }

    const slidesData = data.slides_json as any

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

    console.log(`📦 Gerando ZIP com ${approvedCarousels.length} carrosséis aprovados...`)

    const zip = new JSZip()

    for (const carousel of approvedCarousels) {
      // Nome da pasta: "Carrossel-1-Titulo-Do-Carrossel"
      const folderName = `Carrossel-${carousel.carouselIndex + 1}-${slugify(carousel.title)}`
      const carouselFolder = zip.folder(folderName)

      if (!carouselFolder) continue

      for (const slide of carousel.slides) {
        const slideResponse = await fetch(slide.cloudinaryUrl)
        if (!slideResponse.ok) {
          console.warn(`⚠️ Falha ao baixar slide ${slide.slideNumber}: ${slide.cloudinaryUrl}`)
          continue
        }

        const buffer = Buffer.from(await slideResponse.arrayBuffer())
        carouselFolder.file(`slide-${slide.slideNumber}.png`, buffer)
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
