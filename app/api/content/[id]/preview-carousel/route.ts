import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { getServerlessRenderOptions } from '@/lib/remotion-chromium'
import { createRequire } from 'module'
import path from 'path'
import fs from 'fs'

// CRITICAL: Force Node.js runtime (prevents client-side bundling)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// CRITICAL: Force traditional require() to bypass Next.js bundler
// Next.js breaks dynamic import() even with serverExternalPackages
const require = createRequire(import.meta.url)

/**
 * GET /api/content/[id]/preview-carousel?carouselIndex=0&slideIndex=0&templateId=minimalist&format=feed&theme=light
 * Retorna preview PNG renderizado via Remotion (mesma qualidade dos slides finais)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const carouselIndexParam = searchParams.get('carouselIndex')
    const slideIndexParam = searchParams.get('slideIndex')
    const templateId = searchParams.get('templateId') || 'minimalist'
    const format = searchParams.get('format') || 'feed'
    const theme = searchParams.get('theme') || 'light'

    console.log('🎨 [Preview] Request:', {
      auditId: id,
      carouselIndex: carouselIndexParam,
      slideIndex: slideIndexParam,
      templateId,
      format,
      theme,
    })

    if (carouselIndexParam === null || slideIndexParam === null) {
      console.error('❌ [Preview] Missing parameters')
      return new NextResponse('Missing carouselIndex or slideIndex', { status: 400 })
    }

    const carouselIndex = parseInt(carouselIndexParam)
    const slideIndex = parseInt(slideIndexParam)

    // Buscar conteúdo
    const supabase = getServerSupabase()
    const { data: contentSuggestion, error } = await supabase
      .from('content_suggestions')
      .select('content_json, profile_id')
      .eq('audit_id', id)
      .single()

    if (error || !contentSuggestion) {
      console.error('❌ [Preview] Content not found:', error)
      return new NextResponse('Content not found', { status: 404 })
    }

    const content = contentSuggestion.content_json as any
    console.log('📦 [Preview] Content loaded, carousels:', content?.carousels?.length || 0)

    const carousel = content?.carousels?.[carouselIndex]
    const slide = carousel?.slides?.[slideIndex]

    if (!carousel || !slide) {
      console.error('❌ [Preview] Carousel or slide not found:', {
        carouselIndex,
        slideIndex,
        hasCarousel: !!carousel,
        hasSlide: !!slide,
      })
      return new NextResponse('Carousel or slide not found', { status: 404 })
    }

    console.log('✅ [Preview] Slide found:', { titulo: slide.titulo || 'N/A' })

    // Buscar perfil do Instagram para foto e username
    const { data: profile } = await supabase
      .from('instagram_profiles')
      .select('username, full_name, profile_pic_cloudinary_url, profile_pic_url_hd')
      .eq('id', contentSuggestion.profile_id)
      .single()

    // Extrair título e corpo
    const titulo = slide.titulo || slide.text?.split('\n')[0] || ''
    const corpo = slide.corpo || slide.text?.split('\n').slice(1).join('\n') || slide.content || ''

    // Dimensões por formato
    const dimensions: Record<string, { width: number; height: number }> = {
      feed: { width: 1080, height: 1350 },
      story: { width: 1080, height: 1920 },
      square: { width: 1080, height: 1080 },
    }
    const { width, height } = dimensions[format] || dimensions.feed

    // Cores por tema
    const isLight = theme === 'light'
    const bgColor = isLight ? '#FFFFFF' : '#0A0A0A'
    const textColor = isLight ? '#1A1A1A' : '#F5F5F5'
    const subtextColor = isLight ? '#525252' : '#A3A3A3'
    const accentColor = '#8B5CF6' // purple-500

    // Foto de perfil
    const profilePic = profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd || ''
    const username = profile?.username || ''
    const fullName = profile?.full_name || ''

    console.log('🎨 [Preview] Rendering with Remotion...')

    // Mapear formato para composição Still
    const FORMAT_TO_STILL: Record<string, string> = {
      feed: 'CarouselStill',
      story: 'StoryStill',
      square: 'SquareStill',
    }
    const compositionId = FORMAT_TO_STILL[format] || 'CarouselStill'

    // 1. Obter bundle Remotion (pré-compilado ou cacheado)
    const bundleLocation = await getRemotionBundle()

    // 2. Force traditional require() instead of import() (bypasses Next.js bundler)
    const { renderStill, selectComposition } = require('@remotion/renderer')

    // 4. Renderizar slide via Remotion
    const tempDir = path.join('/tmp', 'preview-carousel', id)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const outputPath = path.join(tempDir, `preview-${carouselIndex}-${slideIndex}.png`)

    const inputProps = {
      titulo,
      corpo,
      contentImageUrl: '', // Preview sem imagem (mais rápido)
      profilePicUrl: profilePic, // Remotion espera profilePicUrl
      username,
      fullName,
      templateId,
      format,
      theme,
      slideNumber: slideIndex + 1,
      totalSlides: carousel.slides.length, // Remotion precisa do total
    }

    // Obter opções de renderização para serverless
    const renderOptions = await getServerlessRenderOptions()

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps,
      ...renderOptions,
    })

    await renderStill({
      composition,
      output: outputPath,
      serveUrl: bundleLocation,
      inputProps,
      ...renderOptions,
    })

    console.log(`✅ [Preview] Rendered: ${outputPath}`)

    // 5. Ler PNG e retornar
    const imageBuffer = fs.readFileSync(outputPath)

    // 6. Deletar arquivo temporário (cleanup)
    fs.unlinkSync(outputPath)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
      },
    })
  } catch (error: unknown) {
    console.error('❌ [Preview] Error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return new NextResponse(msg, { status: 500 })
  }
}
