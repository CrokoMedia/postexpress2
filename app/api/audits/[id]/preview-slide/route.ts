import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

// ============================================
// TYPES
// ============================================

type TemplateId = 'minimalist' | 'bold-gradient' | 'professional' | 'modern' | 'clean' | 'gradient'
type LayoutFormat = 'feed' | 'story' | 'square'
type ThemeMode = 'light' | 'dark'

interface SlidePreviewParams {
  carouselIndex: number
  slideIndex: number
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
}

// ============================================
// TEMPLATE CONFIGURATIONS
// ============================================

const TEMPLATE_CONFIGS: Record<
  TemplateId,
  {
    fontFamily: string
    titleSize: number
    bodySize: number
    padding: number
    backgroundColor: { light: string; dark: string }
    textColor: { light: string; dark: string }
    accentColor: string
  }
> = {
  minimalist: {
    fontFamily: 'Inter, sans-serif',
    titleSize: 48,
    bodySize: 24,
    padding: 60,
    backgroundColor: { light: '#FFFFFF', dark: '#1A1A1A' },
    textColor: { light: '#1A1A1A', dark: '#FFFFFF' },
    accentColor: '#6366F1',
  },
  'bold-gradient': {
    fontFamily: 'Inter, sans-serif',
    titleSize: 56,
    bodySize: 26,
    padding: 50,
    backgroundColor: { light: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' },
    textColor: { light: '#FFFFFF', dark: '#FFFFFF' },
    accentColor: '#F59E0B',
  },
  professional: {
    fontFamily: 'Inter, sans-serif',
    titleSize: 44,
    bodySize: 22,
    padding: 70,
    backgroundColor: { light: '#F9FAFB', dark: '#111827' },
    textColor: { light: '#111827', dark: '#F9FAFB' },
    accentColor: '#3B82F6',
  },
  modern: {
    fontFamily: 'Inter, sans-serif',
    titleSize: 50,
    bodySize: 24,
    padding: 55,
    backgroundColor: { light: '#FAFAFA', dark: '#0F172A' },
    textColor: { light: '#0F172A', dark: '#F1F5F9' },
    accentColor: '#8B5CF6',
  },
  clean: {
    fontFamily: 'Inter, sans-serif',
    titleSize: 46,
    bodySize: 23,
    padding: 65,
    backgroundColor: { light: '#FFFFFF', dark: '#18181B' },
    textColor: { light: '#18181B', dark: '#FAFAFA' },
    accentColor: '#10B981',
  },
  gradient: {
    fontFamily: 'Inter, sans-serif',
    titleSize: 52,
    bodySize: 25,
    padding: 50,
    backgroundColor: { light: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', dark: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)' },
    textColor: { light: '#FFFFFF', dark: '#FFFFFF' },
    accentColor: '#FBBF24',
  },
}

const FORMAT_DIMENSIONS: Record<LayoutFormat, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 }, // 4:5
  story: { width: 1080, height: 1920 }, // 9:16
  square: { width: 1080, height: 1080 }, // 1:1
}

// ============================================
// SVG GENERATION
// ============================================

/**
 * Gera SVG de preview de um slide
 * Rápido (<50ms) e não requer renderização de imagem final
 */
function generateSlideSVG(
  slide: any,
  template: TemplateId,
  format: LayoutFormat,
  theme: ThemeMode
): string {
  const config = TEMPLATE_CONFIGS[template]
  const dimensions = FORMAT_DIMENSIONS[format]

  const bgColor = config.backgroundColor[theme]
  const textColor = config.textColor[theme]
  const { accentColor, padding, titleSize, bodySize, fontFamily } = config

  // Processar título (converter MAIÚSCULAS em negrito)
  const titulo = slide.titulo || ''
  const tituloProcessado = titulo.replace(/\b([A-Z]{2,})\b/g, '<tspan font-weight="700">$1</tspan>')

  // Processar corpo (limitar a 200 caracteres para preview)
  const corpo = slide.corpo || ''
  const corpoTruncado = corpo.length > 200 ? corpo.substring(0, 200) + '...' : corpo

  // Calcular posição vertical do texto
  const titleY = dimensions.height * 0.3
  const bodyY = titleY + titleSize + 40

  // Gerar background (gradiente ou sólido)
  let backgroundDef = ''
  let backgroundFill = bgColor

  if (bgColor.startsWith('linear-gradient')) {
    // Extrair cores do gradiente
    const match = bgColor.match(/#[0-9A-Fa-f]{6}/g)
    if (match && match.length >= 2) {
      const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`
      backgroundDef = `
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${match[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${match[1]};stop-opacity:1" />
          </linearGradient>
        </defs>
      `
      backgroundFill = `url(#${gradientId})`
    }
  }

  // Gerar SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
  ${backgroundDef}

  <!-- Background -->
  <rect width="${dimensions.width}" height="${dimensions.height}" fill="${backgroundFill}"/>

  <!-- Accent Line (decorativo) -->
  <rect x="${padding}" y="${padding}" width="100" height="6" fill="${accentColor}" rx="3"/>

  <!-- Título -->
  <text
    x="${padding}"
    y="${titleY}"
    font-family="${fontFamily}"
    font-size="${titleSize}"
    font-weight="700"
    fill="${textColor}"
    style="dominant-baseline: hanging;">
    ${escapeXml(titulo)}
  </text>

  <!-- Corpo (com line wrapping básico) -->
  <text
    x="${padding}"
    y="${bodyY}"
    font-family="${fontFamily}"
    font-size="${bodySize}"
    font-weight="400"
    fill="${textColor}"
    style="dominant-baseline: hanging;">
    ${wrapText(corpoTruncado, dimensions.width - padding * 2, bodySize)}
  </text>

  <!-- Número do slide (canto inferior direito) -->
  <text
    x="${dimensions.width - padding}"
    y="${dimensions.height - padding}"
    font-family="${fontFamily}"
    font-size="20"
    font-weight="600"
    fill="${accentColor}"
    text-anchor="end"
    style="dominant-baseline: auto;">
    ${slide.numero || '1'}
  </text>

  <!-- Watermark "PREVIEW" -->
  <text
    x="${dimensions.width / 2}"
    y="${dimensions.height - 30}"
    font-family="${fontFamily}"
    font-size="16"
    font-weight="500"
    fill="${textColor}"
    opacity="0.3"
    text-anchor="middle">
    PREVIEW
  </text>
</svg>`

  return svg
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Word wrap simples para SVG text
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  const approxCharWidth = fontSize * 0.6 // Estimativa grosseira
  const maxCharsPerLine = Math.floor(maxWidth / approxCharWidth)

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  // Limitar a 10 linhas para preview
  const limitedLines = lines.slice(0, 10)

  return limitedLines
    .map((line, i) => `<tspan x="${60}" dy="${i === 0 ? 0 : fontSize + 8}">${escapeXml(line)}</tspan>`)
    .join('')
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()

  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    // 1. Validar e extrair query params
    const carouselIndexParam = searchParams.get('carouselIndex')
    const slideIndexParam = searchParams.get('slideIndex')
    const template = searchParams.get('template') as TemplateId | null
    const format = searchParams.get('format') as LayoutFormat | null
    const theme = searchParams.get('theme') as ThemeMode | null

    // Validação de parâmetros obrigatórios
    if (!carouselIndexParam || !slideIndexParam) {
      return NextResponse.json(
        { error: 'carouselIndex e slideIndex são obrigatórios' },
        { status: 400 }
      )
    }

    const carouselIndex = parseInt(carouselIndexParam, 10)
    const slideIndex = parseInt(slideIndexParam, 10)

    if (isNaN(carouselIndex) || carouselIndex < 0) {
      return NextResponse.json({ error: 'carouselIndex inválido' }, { status: 400 })
    }

    if (isNaN(slideIndex) || slideIndex < 0) {
      return NextResponse.json({ error: 'slideIndex inválido' }, { status: 400 })
    }

    // Defaults
    const templateId: TemplateId = template || 'minimalist'
    const layoutFormat: LayoutFormat = format || 'feed'
    const themeMode: ThemeMode = theme || 'light'

    // Validar valores de template, format, theme
    if (!TEMPLATE_CONFIGS[templateId]) {
      return NextResponse.json({ error: `Template inválido: ${templateId}` }, { status: 400 })
    }

    if (!FORMAT_DIMENSIONS[layoutFormat]) {
      return NextResponse.json({ error: `Formato inválido: ${layoutFormat}` }, { status: 400 })
    }

    if (!['light', 'dark'].includes(themeMode)) {
      return NextResponse.json({ error: `Tema inválido: ${themeMode}` }, { status: 400 })
    }

    console.log('👁️  [preview-slide] Gerando preview:', {
      audit_id: id,
      carouselIndex,
      slideIndex,
      template: templateId,
      format: layoutFormat,
      theme: themeMode,
    })

    // 2. Buscar conteúdo
    const supabase = getServerSupabase()

    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('content_json')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const contentJson = contentSuggestion.content_json as any
    const carousel = contentJson?.carousels?.[carouselIndex]

    if (!carousel) {
      return NextResponse.json(
        { error: `Carrossel no índice ${carouselIndex} não encontrado` },
        { status: 404 }
      )
    }

    const slide = carousel.slides[slideIndex]

    if (!slide) {
      return NextResponse.json(
        { error: `Slide no índice ${slideIndex} não encontrado` },
        { status: 404 }
      )
    }

    // 3. Gerar SVG
    const svgData = generateSlideSVG(slide, templateId, layoutFormat, themeMode)

    const elapsedTime = Date.now() - startTime
    console.log(`✅ [preview-slide] Preview gerado em ${elapsedTime}ms`)

    // 4. Retornar SVG inline
    return new NextResponse(svgData, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache de 5 minutos
        'X-Generation-Time': `${elapsedTime}ms`,
      },
    })
  } catch (error: any) {
    const elapsedTime = Date.now() - startTime
    console.error(`❌ [preview-slide] Erro após ${elapsedTime}ms:`, error)
    return NextResponse.json(
      { error: 'Erro ao gerar preview', details: error.message },
      { status: 500 }
    )
  }
}
