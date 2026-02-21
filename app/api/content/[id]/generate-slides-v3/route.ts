import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { generateContentImage, generateEditorialBackground } from '@/lib/fal-image'
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import cloudinary from 'cloudinary'
import path from 'path'
import fs from 'fs'

// Permitir até 5 minutos para renderizar todos os slides
export const maxDuration = 300

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Cache do bundle entre requests (evita re-bundlar para cada slide)
let cachedBundlePath: string | null = null

async function getBundle(): Promise<string> {
  if (cachedBundlePath && fs.existsSync(cachedBundlePath)) {
    console.log('📦 Usando bundle cacheado')
    return cachedBundlePath
  }

  console.log('📦 Criando bundle Remotion...')
  const startTime = Date.now()

  const entryPoint = path.resolve(process.cwd(), 'remotion/index.tsx')
  cachedBundlePath = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  console.log(`📦 Bundle criado em ${Date.now() - startTime}ms`)
  return cachedBundlePath
}

async function getStillComposition(bundleLocation: string, compositionId: string, inputProps: Record<string, unknown>) {
  return selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  })
}

/**
 * Extrai o título e corpo do slide a partir da estrutura do Content Squad
 */
function getSlideFields(slide: any): { titulo: string; corpo: string } {
  if (slide.titulo && slide.corpo) {
    return { titulo: slide.titulo, corpo: slide.corpo }
  }
  if (slide.titulo) {
    return { titulo: slide.titulo, corpo: '' }
  }
  if (slide.text) {
    const lines = slide.text.split('\n').filter((l: string) => l.trim())
    return {
      titulo: lines[0] || '',
      corpo: lines.slice(1).join('\n'),
    }
  }
  return { titulo: '', corpo: slide.content || '' }
}

/**
 * POST /api/content/[id]/generate-slides-v3
 * Gera slides PNG via renderStill() do Remotion (substitui Puppeteer)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { carousels, profile, slideImageOptions, templateId = 'minimalist', format = 'feed' } = body

    // Mapear formato para composição Still e dimensões
    const FORMAT_TO_STILL: Record<string, { compositionId: string; width: number; height: number }> = {
      feed:   { compositionId: 'CarouselStill', width: 1080, height: 1350 },
      story:  { compositionId: 'StoryStill',    width: 1080, height: 1920 },
      square: { compositionId: 'SquareStill',   width: 1080, height: 1080 },
    }
    const formatConfig = FORMAT_TO_STILL[format] || FORMAT_TO_STILL.feed

    if (!carousels || carousels.length === 0) {
      return NextResponse.json(
        { error: 'No carousels provided' },
        { status: 400 }
      )
    }

    const approvedCarousels = carousels.filter((c: any) => c.approved === true)

    if (approvedCarousels.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum carrossel aprovado. Aprove pelo menos um carrossel antes de gerar slides.' },
        { status: 400 }
      )
    }

    // Template editorial usa imagens full-bleed (1080x1350) como background
    const isEditorial = templateId === 'editorial-magazine'

    console.log(`🎨 [V3/Remotion] Gerando slides (${format} ${formatConfig.width}x${formatConfig.height}) para ${approvedCarousels.length} carrosséis (template: ${templateId})...`)

    // 1. Criar bundle (cacheado)
    const bundleLocation = await getBundle()

    // Contexto de nicho do expert
    const nicheContext = [
      profile?.biography ? profile.biography.substring(0, 150) : null,
      profile?.full_name ? `Expert: ${profile.full_name}` : null,
      profile?.username ? `Instagram: @${profile.username}` : null,
    ]
      .filter(Boolean)
      .join('. ')

    const results = []

    // Mapear índices originais dos carrosséis aprovados
    const approvedIndices = carousels
      .map((c: any, idx: number) => ({ carousel: c, originalIndex: idx }))
      .filter(({ carousel }: { carousel: any }) => carousel.approved === true)

    // Criar diretório temporário
    const tempDir = path.join('/tmp', 'slides-v3', id)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    for (let i = 0; i < approvedIndices.length; i++) {
      const { carousel, originalIndex } = approvedIndices[i]
      const carouselName = `carrossel-${i + 1}`

      console.log(`📝 [V3] Processando ${carouselName} (${carousel.slides.length} slides)...`)

      const slideImages = []

      for (let j = 0; j < carousel.slides.length; j++) {
        const slide = carousel.slides[j]
        const slideName = `slide-${j + 1}`
        const { titulo, corpo } = getSlideFields(slide)
        const imagemPrompt = slide.imagem_prompt || titulo || corpo

        console.log(`   🖼️  [V3] Gerando ${slideName}: "${titulo}"`)

        const slideConfig = slideImageOptions?.[originalIndex]?.[j]

        // 2. Gerar/obter imagem via fal.ai
        let contentImageUrl = ''
        const falStart = Date.now()

        if (slideConfig?.mode === 'upload' && slideConfig.uploadUrl) {
          contentImageUrl = slideConfig.uploadUrl
          console.log(`   📤 Usando imagem enviada`)
        } else if (slideConfig?.mode === 'custom_prompt' && slideConfig.customPrompt) {
          try {
            const fullPrompt = [
              slideConfig.customPrompt,
              'professional photography, photorealistic, high quality, sharp focus',
              'natural lighting, modern aesthetic, clean composition',
              'no text visible, no letters, no words, no typography in the image',
            ]
              .filter(Boolean)
              .join(', ')

            contentImageUrl = await generateContentImage(fullPrompt)
            console.log(`   ✅ Imagem customizada gerada (${Date.now() - falStart}ms)`)
          } catch (falError: unknown) {
            const msg = falError instanceof Error ? falError.message : String(falError)
            console.warn(`   ⚠️ fal.ai falhou (${msg}), sem imagem`)
          }
        } else if (slideConfig?.mode !== 'no_image') {
          try {
            if (isEditorial) {
              // Template editorial: imagem full-bleed como background (1080x1350)
              contentImageUrl = await generateEditorialBackground(imagemPrompt)
            } else {
              // Templates padrão: imagem de conteúdo menor (956x448)
              const fullPrompt = [
                nicheContext ? `Context: ${nicheContext}.` : null,
                `Topic: ${imagemPrompt}`,
                'professional photography, photorealistic, high quality, sharp focus',
                'natural lighting, modern aesthetic, clean composition',
                'no text visible, no letters, no words, no typography in the image',
              ]
                .filter(Boolean)
                .join(', ')

              contentImageUrl = await generateContentImage(fullPrompt)
            }
            console.log(`   ✅ Imagem auto gerada (${Date.now() - falStart}ms)`)
          } catch (falError: unknown) {
            const msg = falError instanceof Error ? falError.message : String(falError)
            console.warn(`   ⚠️ fal.ai falhou (${msg}), sem imagem`)
          }
        }

        // 3. renderStill() → PNG
        const renderStart = Date.now()
        const outputPath = path.join(tempDir, `${carouselName}-${slideName}.png`)

        const stillInputProps = {
          titulo,
          corpo,
          contentImageUrl,
          profilePicUrl:
            profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd || '',
          username: profile?.username || '',
          fullName: profile?.full_name || '',
          templateId,
          format,
          slideNumber: j + 1,
          totalSlides: carousel.slides.length,
        }

        const composition = await getStillComposition(bundleLocation, formatConfig.compositionId, stillInputProps)

        await renderStill({
          serveUrl: bundleLocation,
          composition,
          output: outputPath,
          inputProps: stillInputProps,
        })

        console.log(`   ✅ renderStill concluído (${Date.now() - renderStart}ms)`)

        // 4. Upload para Cloudinary
        const uploadStart = Date.now()

        const uploadResult = await cloudinary.v2.uploader.upload(outputPath, {
          folder: `carousel-slides-v3/${id}/${carouselName}`,
          public_id: slideName,
          overwrite: true,
          resource_type: 'image',
        })

        console.log(`   ✅ Upload Cloudinary (${Date.now() - uploadStart}ms): ${uploadResult.secure_url}`)

        slideImages.push({
          slideNumber: j + 1,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          size: uploadResult.bytes,
          contentImageUrl,
        })

        // Remover arquivo temporário
        fs.unlinkSync(outputPath)
      }

      results.push({
        carouselIndex: originalIndex,
        carouselName,
        title: carousel.title || carousel.titulo || `Carrossel ${originalIndex + 1}`,
        slides: slideImages,
        totalSlides: slideImages.length,
        approved: true,
      })

      console.log(`✅ [V3] ${carouselName} concluído (${slideImages.length} slides)`)
    }

    console.log(`\n🎉 [V3/Remotion] Todos os slides gerados com sucesso!`)
    console.log(`   Total de carrosséis: ${results.length}`)
    console.log(`   Total de slides: ${results.reduce((acc, r) => acc + r.slides.length, 0)}`)

    // 5. Salvar no banco
    console.log('💾 Salvando slides V3 no banco...')
    const supabase = getServerSupabase()

    const slidesData = {
      carousels: results,
      summary: {
        totalCarousels: results.length,
        totalSlides: results.reduce((acc, r) => acc + r.slides.length, 0),
      },
      template: 'v3-remotion',
      format,
      generated_at: new Date().toISOString(),
    }

    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      console.error('❌ Content suggestion não encontrado para audit_id:', id, fetchError)
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere o conteúdo textual antes de gerar slides.' },
        { status: 404 }
      )
    }

    // Salva em slides_json (substitui v1/v2 como output principal)
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({ slides_json: slidesData })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('❌ Erro ao salvar slides V3 no banco:', updateError)
      return NextResponse.json(
        { error: 'Slides gerados mas não foi possível salvar. Tente novamente.' },
        { status: 500 }
      )
    }

    console.log('✅ Slides V3 salvos no banco com sucesso')

    return NextResponse.json({
      success: true,
      carousels: results,
      summary: {
        totalCarousels: results.length,
        totalSlides: results.reduce((acc, r) => acc + r.slides.length, 0),
      },
      template: 'v3-remotion',
    })
  } catch (error: unknown) {
    console.error('Error generating slides V3:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: msg || 'Failed to generate slides V3' },
      { status: 500 }
    )
  }
}
