// Slide Preview Renderer using Canvas HTML5
// Objetivo: Renderizar preview em tempo real (<100ms) sem gerar PNG final
// Baseado em: docs/architecture/content-flow-architecture.md

import type { CarouselSlide } from '@/types/database'
import type { TemplateId, LayoutFormat, ThemeMode } from '@/types/content-creation'

// ============================================
// DIMENSÕES POR FORMATO
// ============================================

export const FORMAT_DIMENSIONS = {
  feed: { width: 1080, height: 1350 }, // 4:5
  story: { width: 1080, height: 1920 }, // 9:16
  square: { width: 1080, height: 1080 } // 1:1
} as const

export function getFormatDimensions(format: LayoutFormat) {
  return FORMAT_DIMENSIONS[format]
}

// ============================================
// TEMPLATE CONFIGS
// ============================================

export interface TemplateConfig {
  colors: {
    background: { light: string; dark: string }
    text: { light: string; dark: string }
    accent: string
  }
  fonts: {
    title: { family: string; size: number; lineHeight: number; weight: string }
    body: { family: string; size: number; lineHeight: number; weight: string }
  }
  layout: {
    padding: number
    imageHeightRatio: number // Porcentagem da altura do canvas para imagem
    titleTopOffset: number
    bodyTopOffset: number
  }
}

export const TEMPLATE_CONFIGS: Record<TemplateId, TemplateConfig> = {
  minimalist: {
    colors: {
      background: { light: '#ffffff', dark: '#1a1a1a' },
      text: { light: '#1a1a1a', dark: '#ffffff' },
      accent: '#667eea'
    },
    fonts: {
      title: { family: 'Inter', size: 72, lineHeight: 90, weight: 'bold' },
      body: { family: 'Inter', size: 48, lineHeight: 70, weight: 'normal' }
    },
    layout: {
      padding: 60,
      imageHeightRatio: 0.4,
      titleTopOffset: 40,
      bodyTopOffset: 200
    }
  },
  'bold-gradient': {
    colors: {
      background: { light: '#667eea', dark: '#4c1d95' }, // Será gradiente
      text: { light: '#ffffff', dark: '#ffffff' },
      accent: '#fbbf24'
    },
    fonts: {
      title: { family: 'Inter', size: 80, lineHeight: 100, weight: 'bold' },
      body: { family: 'Inter', size: 52, lineHeight: 75, weight: 'normal' }
    },
    layout: {
      padding: 70,
      imageHeightRatio: 0.35,
      titleTopOffset: 50,
      bodyTopOffset: 220
    }
  },
  professional: {
    colors: {
      background: { light: '#f9fafb', dark: '#111827' },
      text: { light: '#111827', dark: '#f9fafb' },
      accent: '#3b82f6'
    },
    fonts: {
      title: { family: 'Inter', size: 68, lineHeight: 85, weight: 'bold' },
      body: { family: 'Inter', size: 46, lineHeight: 68, weight: 'normal' }
    },
    layout: {
      padding: 65,
      imageHeightRatio: 0.38,
      titleTopOffset: 45,
      bodyTopOffset: 190
    }
  },
  modern: {
    colors: {
      background: { light: '#ffffff', dark: '#0f172a' },
      text: { light: '#0f172a', dark: '#ffffff' },
      accent: '#06b6d4'
    },
    fonts: {
      title: { family: 'Inter', size: 76, lineHeight: 95, weight: 'bold' },
      body: { family: 'Inter', size: 50, lineHeight: 72, weight: 'normal' }
    },
    layout: {
      padding: 60,
      imageHeightRatio: 0.42,
      titleTopOffset: 40,
      bodyTopOffset: 210
    }
  },
  clean: {
    colors: {
      background: { light: '#fafafa', dark: '#171717' },
      text: { light: '#171717', dark: '#fafafa' },
      accent: '#10b981'
    },
    fonts: {
      title: { family: 'Inter', size: 70, lineHeight: 88, weight: 'bold' },
      body: { family: 'Inter', size: 48, lineHeight: 70, weight: 'normal' }
    },
    layout: {
      padding: 62,
      imageHeightRatio: 0.4,
      titleTopOffset: 42,
      bodyTopOffset: 195
    }
  },
  gradient: {
    colors: {
      background: { light: '#f59e0b', dark: '#b45309' }, // Será gradiente
      text: { light: '#ffffff', dark: '#ffffff' },
      accent: '#fef3c7'
    },
    fonts: {
      title: { family: 'Inter', size: 78, lineHeight: 98, weight: 'bold' },
      body: { family: 'Inter', size: 52, lineHeight: 74, weight: 'normal' }
    },
    layout: {
      padding: 68,
      imageHeightRatio: 0.36,
      titleTopOffset: 48,
      bodyTopOffset: 215
    }
  }
}

export function getTemplateConfig(template: TemplateId): TemplateConfig {
  return TEMPLATE_CONFIGS[template] || TEMPLATE_CONFIGS.minimalist
}

// ============================================
// CANVAS RENDERING
// ============================================

export interface RenderOptions {
  canvas: HTMLCanvasElement
  slide: CarouselSlide
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  imageUrl?: string
}

export function renderSlidePreview({
  canvas,
  slide,
  template,
  format,
  theme,
  imageUrl
}: RenderOptions): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Dimensões do canvas
  const dimensions = getFormatDimensions(format)
  canvas.width = dimensions.width
  canvas.height = dimensions.height

  // Template config
  const config = getTemplateConfig(template)

  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Renderizar background
  renderBackground(ctx, canvas, config, theme, template)

  // Renderizar imagem (se houver)
  if (imageUrl) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    img.onload = () => {
      const imageHeight = canvas.height * config.layout.imageHeightRatio
      ctx.drawImage(img, 0, 0, canvas.width, imageHeight)

      // Re-renderizar texto por cima
      renderText(ctx, canvas, slide, config, theme, imageHeight)
    }
    img.onerror = () => {
      // Se falhar, renderizar sem imagem
      renderText(ctx, canvas, slide, config, theme, 0)
    }
  } else {
    renderText(ctx, canvas, slide, config, theme, 0)
  }
}

// ============================================
// BACKGROUND RENDERING
// ============================================

function renderBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  config: TemplateConfig,
  theme: ThemeMode,
  template: TemplateId
): void {
  // Templates com gradiente
  if (template === 'bold-gradient') {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, theme === 'light' ? '#667eea' : '#4c1d95')
    gradient.addColorStop(1, theme === 'light' ? '#764ba2' : '#5b21b6')
    ctx.fillStyle = gradient
  } else if (template === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, theme === 'light' ? '#f59e0b' : '#b45309')
    gradient.addColorStop(1, theme === 'light' ? '#ef4444' : '#991b1b')
    ctx.fillStyle = gradient
  } else {
    // Background sólido
    ctx.fillStyle = theme === 'dark'
      ? config.colors.background.dark
      : config.colors.background.light
  }

  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// ============================================
// TEXT RENDERING
// ============================================

function renderText(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  slide: CarouselSlide,
  config: TemplateConfig,
  theme: ThemeMode,
  yOffset: number
): void {
  const { padding, titleTopOffset, bodyTopOffset } = config.layout
  const textStartY = yOffset + padding + titleTopOffset

  const textColor = theme === 'dark'
    ? config.colors.text.dark
    : config.colors.text.light

  // Renderizar título
  ctx.font = `${config.fonts.title.weight} ${config.fonts.title.size}px ${config.fonts.title.family}, sans-serif`
  ctx.fillStyle = textColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  wrapText(
    ctx,
    slide.titulo,
    padding,
    textStartY,
    canvas.width - padding * 2,
    config.fonts.title.lineHeight
  )

  // Renderizar corpo (se houver)
  if (slide.corpo) {
    ctx.font = `${config.fonts.body.weight} ${config.fonts.body.size}px ${config.fonts.body.family}, sans-serif`
    ctx.fillStyle = textColor

    wrapText(
      ctx,
      slide.corpo,
      padding,
      textStartY + bodyTopOffset,
      canvas.width - padding * 2,
      config.fonts.body.lineHeight
    )
  }
}

// ============================================
// TEXT WRAPPING HELPER
// ============================================

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }

  // Renderizar última linha
  ctx.fillText(line, x, currentY)
}

// ============================================
// DEBOUNCED RENDER (Performance)
// ============================================

let renderTimeout: NodeJS.Timeout | null = null

export function renderSlidePreviewDebounced(
  options: RenderOptions,
  delay: number = 150
): void {
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }

  renderTimeout = setTimeout(() => {
    renderSlidePreview(options)
    renderTimeout = null
  }, delay)
}

// ============================================
// CANVAS TO DATA URL (Para download)
// ============================================

export function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number = 0.95): string {
  return canvas.toDataURL('image/png', quality)
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality: number = 0.95): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', quality)
  })
}
