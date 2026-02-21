import { NextRequest, NextResponse } from 'next/server'
import { generateEditorialBackground, generateEditorialBackgroundWithReference } from '@/lib/fal-image'
import { searchEditorialImage } from '@/lib/image-search'
import { generateEditorialCoverHTML } from '@/lib/slide-templates/editorial-cover'
import { parseComposePrompt, resolveComposeElements, generateComposeHTML } from '@/lib/slide-templates/editorial-compose'
import { generateEditorialContentTitleHTML } from '@/lib/slide-templates/editorial-content-title'
import { generateEditorialContentImageHTML } from '@/lib/slide-templates/editorial-content-image'
import { generateEditorialCtaHTML } from '@/lib/slide-templates/editorial-cta'
import { getBrowser } from '@/lib/browser'
import cloudinary from 'cloudinary'
import fs from 'fs'
import path from 'path'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

type TemplateType = 'editorial-cover' | 'editorial-content-title' | 'editorial-content-image' | 'editorial-cta'

interface GenerateRequest {
  template: TemplateType
  titulo?: string
  subtitulo?: string
  metaLeft?: string
  metaCenter?: string
  metaRight?: string
  metaBgColor?: string
  metaShape?: 'square' | 'rounded'
  metaFontSize?: number
  badgeText?: string
  imageMode: 'auto' | 'search' | 'compose' | 'custom_prompt' | 'upload'
  imagePrompt?: string
  referenceImageUrls?: string[]
  searchQuery?: string
  uploadUrl?: string
  // Campos para content-title
  paragraph1?: string
  paragraph2?: string
  accentColor?: string
  imagePosition?: 'middle' | 'bottom'
  // Campos para cta
  creditsText?: string
  // Font sizes customizaveis
  titleFontSizeOverride?: number
  subtitleFontSize?: number
  badgeFontSize?: number
}

/**
 * Resolve a URL da imagem de fundo baseada no imageMode
 */
async function resolveBackgroundImage(
  imageMode: string,
  opts: { uploadUrl?: string; searchQuery?: string; titulo?: string; imagePrompt?: string; referenceImageUrls?: string[] }
): Promise<{ url: string; source: string }> {
  if (imageMode === 'upload' && opts.uploadUrl) {
    console.log(`   📤 Usando imagem enviada: ${opts.uploadUrl}`)
    return { url: opts.uploadUrl, source: 'upload' }
  }

  if (imageMode === 'search' || imageMode === 'auto') {
    const query = opts.searchQuery || opts.titulo || ''
    console.log(`   🔍 Buscando imagem na internet: "${query}"`)
    const foundUrl = await searchEditorialImage(query, { preferPortrait: true, num: 10 })

    if (foundUrl) {
      console.log(`   ✅ Imagem encontrada: ${foundUrl}`)
      return { url: foundUrl, source: 'search' }
    }

    if (imageMode === 'auto') {
      console.log(`   ⚠️ Busca sem resultados. Gerando com IA...`)
      const autoPrompt = `${opts.titulo || 'professional scene'}, professional scene related to the topic`
      const url = await generateEditorialBackground(autoPrompt)
      return { url, source: 'fal-ai-fallback' }
    }

    throw new Error('Nenhuma imagem encontrada. Verifique se SERPER_API_KEY esta configurada.')
  }

  if (imageMode === 'custom_prompt' && opts.imagePrompt) {
    console.log(`   ✍️ Gerando fundo com prompt: "${opts.imagePrompt.substring(0, 100)}..."`)
    const url = await generateEditorialBackground(opts.imagePrompt)
    return { url, source: 'fal-ai' }
  }

  // Modo compose com imagens de referência → multi-reference (FLUX.2 edit)
  if (imageMode === 'compose' && opts.referenceImageUrls?.length && opts.imagePrompt) {
    console.log(`   🖼️ Gerando com ${opts.referenceImageUrls.length} referencia(s) + prompt: "${opts.imagePrompt.substring(0, 80)}..."`)
    opts.referenceImageUrls.forEach((u, i) => console.log(`   📎 Ref ${i + 1}: ${u}`))
    const url = await generateEditorialBackgroundWithReference(opts.imagePrompt, opts.referenceImageUrls)
    return { url, source: 'fal-ai-reference' }
  }

  // Modo compose sem referência → text-to-image normal
  if (imageMode === 'compose' && opts.imagePrompt) {
    console.log(`   ✍️ Gerando fundo com prompt: "${opts.imagePrompt.substring(0, 100)}..."`)
    const url = await generateEditorialBackground(opts.imagePrompt)
    return { url, source: 'fal-ai' }
  }

  // Fallback: gerar com IA
  const autoPrompt = `${opts.titulo || 'editorial'}, professional scene related to the topic`
  const url = await generateEditorialBackground(autoPrompt)
  return { url, source: 'fal-ai' }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { template, imageMode } = body

    const validTemplates: TemplateType[] = ['editorial-cover', 'editorial-content-title', 'editorial-content-image', 'editorial-cta']
    if (!validTemplates.includes(template)) {
      return NextResponse.json({ error: `Template "${template}" nao suportado` }, { status: 400 })
    }

    console.log(`🎨 [Templates Pro] Gerando slide: ${template} (modo: ${imageMode})`)

    let html = ''
    let imageSource = ''

    // === EDITORIAL COVER ===
    if (template === 'editorial-cover') {
      if (!body.titulo) {
        return NextResponse.json({ error: 'Titulo e obrigatorio' }, { status: 400 })
      }

      // Modo compose (cover only) — se tem referências, vai pelo resolveBackgroundImage (multi-reference)
      if (imageMode === 'compose' && body.imagePrompt && !body.referenceImageUrls?.length) {
        console.log(`   🧩 Modo Compose: parseando prompt...`)
        const { background, logoQueries, style, photoQuery } = parseComposePrompt(body.imagePrompt)
        console.log(`   📐 Background: ${background}`)
        console.log(`   🏷️  Logos: ${logoQueries.length > 0 ? logoQueries.join(', ') : 'nenhum'}`)
        console.log(`   📷 Foto: ${photoQuery || 'nenhuma'}`)

        const elements = await resolveComposeElements(logoQueries)

        let backgroundImageUrl: string | undefined
        if (photoQuery) {
          const foundUrl = await searchEditorialImage(photoQuery, { preferPortrait: true, num: 10 })
          if (foundUrl) backgroundImageUrl = foundUrl
        }

        html = generateComposeHTML({
          titulo: body.titulo,
          subtitulo: body.subtitulo || '',
          metaLeft: body.metaLeft || '',
          metaCenter: body.metaCenter || '',
          metaRight: body.metaRight || '',
          badgeText: body.badgeText || '',
          background,
          backgroundImageUrl,
          elements,
          style,
        })
        imageSource = backgroundImageUrl ? 'compose+photo' : 'compose'
      } else {
        const { url, source } = await resolveBackgroundImage(imageMode, body)
        imageSource = source

        html = generateEditorialCoverHTML({
          titulo: body.titulo,
          subtitulo: body.subtitulo || '',
          metaLeft: body.metaLeft || '',
          metaCenter: body.metaCenter || '',
          metaRight: body.metaRight || '',
          badgeText: body.badgeText || '',
          backgroundImageUrl: url,
          metaBgColor: body.metaBgColor,
          metaShape: body.metaShape,
          metaFontSize: body.metaFontSize,
          titleFontSizeOverride: body.titleFontSizeOverride,
          subtitleFontSize: body.subtitleFontSize,
          badgeFontSize: body.badgeFontSize,
        })
      }
    }

    // === EDITORIAL CONTENT TITLE ===
    if (template === 'editorial-content-title') {
      if (!body.titulo) {
        return NextResponse.json({ error: 'Titulo e obrigatorio' }, { status: 400 })
      }
      if (!body.paragraph1) {
        return NextResponse.json({ error: 'Paragrafo 1 e obrigatorio' }, { status: 400 })
      }

      const { url, source } = await resolveBackgroundImage(imageMode, body)
      imageSource = source

      html = generateEditorialContentTitleHTML({
        titulo: body.titulo,
        paragraph1: body.paragraph1,
        paragraph2: body.paragraph2,
        backgroundImageUrl: url,
        metaLeft: body.metaLeft || '',
        metaCenter: body.metaCenter || '',
        metaRight: body.metaRight || '',
        accentColor: body.accentColor,
        imagePosition: body.imagePosition,
        metaBgColor: body.metaBgColor,
        metaShape: body.metaShape,
        titleFontSizeOverride: body.titleFontSizeOverride,
      })
    }

    // === EDITORIAL CONTENT IMAGE ===
    if (template === 'editorial-content-image') {
      if (!body.paragraph1) {
        return NextResponse.json({ error: 'Paragrafo 1 e obrigatorio' }, { status: 400 })
      }
      if (!body.paragraph2) {
        return NextResponse.json({ error: 'Paragrafo 2 e obrigatorio' }, { status: 400 })
      }

      const { url, source } = await resolveBackgroundImage(imageMode, body)
      imageSource = source

      html = generateEditorialContentImageHTML({
        paragraph1: body.paragraph1,
        paragraph2: body.paragraph2,
        backgroundImageUrl: url,
        metaLeft: body.metaLeft || '',
        metaCenter: body.metaCenter || '',
        metaRight: body.metaRight || '',
        accentColor: body.accentColor,
        metaBgColor: body.metaBgColor,
        metaShape: body.metaShape,
      })
    }

    // === EDITORIAL CTA ===
    if (template === 'editorial-cta') {
      if (!body.creditsText) {
        return NextResponse.json({ error: 'Texto de creditos e obrigatorio' }, { status: 400 })
      }

      const { url, source } = await resolveBackgroundImage(imageMode, body)
      imageSource = source

      html = generateEditorialCtaHTML({
        badgeText: body.badgeText || 'POWERED BY AI',
        creditsText: body.creditsText,
        backgroundImageUrl: url,
        metaLeft: body.metaLeft,
        metaCenter: body.metaCenter,
        metaRight: body.metaRight,
        accentColor: body.accentColor,
        metaBgColor: body.metaBgColor,
        metaShape: body.metaShape,
      })
    }

    if (!html) {
      return NextResponse.json({ error: 'Falha ao gerar HTML do template' }, { status: 500 })
    }

    // Puppeteer screenshot
    const browser = await getBrowser()
    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1350 })
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const tempDir = path.join('/tmp', 'templates-pro')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const timestamp = Date.now()
    const tempFilePath = path.join(tempDir, `${template}-${timestamp}.png`)

    await page.screenshot({ path: tempFilePath, type: 'png' })
    await page.close()
    await browser.close()

    console.log(`   ✅ Screenshot salvo: ${tempFilePath}`)

    // Upload para Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(tempFilePath, {
      folder: `templates-pro/editorial`,
      public_id: `${template.replace('editorial-', '')}-${timestamp}`,
      overwrite: true,
      resource_type: 'image',
    })

    console.log(`   ☁️ Upload concluido: ${uploadResult.secure_url}`)

    fs.unlinkSync(tempFilePath)

    return NextResponse.json({
      success: true,
      template,
      slide: {
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        size: uploadResult.bytes,
        imageSource,
      },
      generated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ [Templates Pro] Erro:', error)
    return NextResponse.json(
      { error: error.message || 'Falha ao gerar slide editorial' },
      { status: 500 }
    )
  }
}
