import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import JSZip from 'jszip'

/**
 * POST /api/content/[id]/carousels/[carouselIndex]/export-zip
 * Gera um ZIP com os slides de UM carrossel específico.
 * O [id] é o audit_id, [carouselIndex] é o índice do carrossel.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; carouselIndex: string }> }
) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { id, carouselIndex } = await params
    const index = parseInt(carouselIndex, 10)

    if (isNaN(index) || index < 0) {
      return NextResponse.json(
        { error: 'Índice de carrossel inválido' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Buscar slides salvos para esta auditoria
    const { data, error } = await supabase
      .from('content_suggestions')
      .select('slides_json, slides_v2_json, content_json')
      .eq('audit_id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere os slides visuais primeiro.' },
        { status: 404 }
      )
    }

    const contentJson = data.content_json as any
    const slidesV1 = data.slides_json as any
    const slidesV2 = data.slides_v2_json as any

    // Validar que o carrossel existe
    if (!contentJson?.carousels?.[index]) {
      return NextResponse.json(
        { error: 'Carrossel não encontrado' },
        { status: 404 }
      )
    }

    const carouselTitle = contentJson.carousels[index].titulo || `Carrossel-${index + 1}`

    const zip = new JSZip()
    let slidesAdded = 0

    // Buscar slides V1 (template padrão) deste carrossel
    if (slidesV1?.carousels?.[index]) {
      const carousel = slidesV1.carousels[index]
      console.log(`📦 Adicionando slides V1 do carrossel ${index}...`)

      const v1Folder = zip.folder('Template-Padrao')!

      for (const slide of carousel.slides || []) {
        try {
          const slideResponse = await fetch(slide.cloudinaryUrl)
          if (!slideResponse.ok) {
            console.warn(`⚠️ Falha ao baixar slide V1 ${slide.slideNumber}`)
            continue
          }
          const buffer = Buffer.from(await slideResponse.arrayBuffer())
          v1Folder.file(`slide-${slide.slideNumber}.png`, buffer)
          slidesAdded++
        } catch (err) {
          console.error(`Erro ao baixar slide V1 ${slide.slideNumber}:`, err)
        }
      }
    }

    // Buscar slides V2 (template com IA) deste carrossel
    if (slidesV2?.carousels?.[index]) {
      const carousel = slidesV2.carousels[index]
      console.log(`📦 Adicionando slides V2 do carrossel ${index}...`)

      const v2Folder = zip.folder('Template-Com-IA')!

      for (const slide of carousel.slides || []) {
        try {
          const slideResponse = await fetch(slide.cloudinaryUrl)
          if (!slideResponse.ok) {
            console.warn(`⚠️ Falha ao baixar slide V2 ${slide.slideNumber}`)
            continue
          }
          const buffer = Buffer.from(await slideResponse.arrayBuffer())
          v2Folder.file(`slide-${slide.slideNumber}.png`, buffer)
          slidesAdded++
        } catch (err) {
          console.error(`Erro ao baixar slide V2 ${slide.slideNumber}:`, err)
        }
      }
    }

    if (slidesAdded === 0) {
      return NextResponse.json(
        { error: 'Nenhum slide encontrado para este carrossel. Gere os slides visuais primeiro.' },
        { status: 400 }
      )
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

    const filename = `${slugify(carouselTitle)}.zip`

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    })
  } catch (error: any) {
    console.error('Erro ao gerar ZIP do carrossel:', error)
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
