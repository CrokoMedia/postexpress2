import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { getServerlessRenderOptions } from '@/lib/remotion-chromium'
import { generateImageSmart, generateEditorialBackgroundSmart } from '@/lib/smart-image-generator'
import { createContextualImagePrompt } from '@/lib/contextual-image-prompt'
import { enhancePrompt, cleanPrompt } from '@/lib/prompt-enhancer'
import { breakdownComplexPrompt, buildFocusedPrompt } from '@/lib/prompt-weighting'
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
 *
 * CRITICAL: Wrapped in top-level try-catch to ALWAYS return JSON
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // OUTER TRY-CATCH: Garante JSON sempre, mesmo em crashes de import/compilação
  try {
    console.log('🚀 [V3/Remotion] Iniciando POST /api/content/[id]/generate-slides-v3')
    console.log('🌍 [V3/Remotion] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      platform: process.platform,
      cwd: process.cwd(),
    })

    // INNER TRY-CATCH: Lógica principal
    try {
    const { id } = await params
    console.log('📝 [V3/Remotion] ID do audit:', id)

    const body = await request.json()
    console.log('📦 [V3/Remotion] Body recebido:', {
      carouselsCount: body.carousels?.length,
      templateId: body.templateId,
      format: body.format,
    })

    const { carousels, profile, slideImageOptions, templateId = 'minimalist', format = 'feed', theme = 'light' } = body

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

    console.log(`🎨 [V3/Remotion] Gerando slides (${format} ${formatConfig.width}x${formatConfig.height}) para ${approvedCarousels.length} carrosséis (template: ${templateId}, theme: ${theme})...`)

    // 1. Obter bundle Remotion (pré-compilado ou cacheado)
    console.log('📦 [V3/Remotion] Carregando bundle Remotion...')
    const bundleLocation = await getRemotionBundle()
    console.log('✅ [V3/Remotion] Bundle carregado:', bundleLocation)

    console.log('🌐 [V3/Remotion] Configurando Chromium serverless...')
    const renderOptions = await getServerlessRenderOptions()
    console.log('✅ [V3/Remotion] Render options:', Object.keys(renderOptions))

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
    // Usar _originalIndex enviado pelo frontend para lookup correto em slideImageOptions
    const approvedIndices = carousels
      .map((c: any, idx: number) => ({
        carousel: c,
        originalIndex: c._originalIndex !== undefined ? c._originalIndex : idx, // Usar índice original do frontend
        arrayIndex: idx, // Manter índice do array recebido para referência
      }))
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

      // Contexto do carrossel completo para geração de imagens
      const carouselContext = [
        carousel.titulo ? `Carrossel: "${carousel.titulo}"` : null,
        carousel.objetivo ? `Objetivo: ${carousel.objetivo}` : null,
        carousel.tipo ? `Tipo: ${carousel.tipo}` : null,
      ]
        .filter(Boolean)
        .join('. ')

      console.log(`   📋 Contexto do carrossel: ${carouselContext}`)

      const slideImages = []

      for (let j = 0; j < carousel.slides.length; j++) {
        const slide = carousel.slides[j]
        const slideName = `slide-${j + 1}`
        const { titulo, corpo } = getSlideFields(slide)
        const imagemPrompt = slide.imagem_prompt || titulo || corpo

        console.log(`   🖼️  [V3] Gerando ${slideName}: "${titulo}"`)

        const slideConfig = slideImageOptions?.[originalIndex]?.[j]

        // 2. Gerar/obter imagem via Nano Banana
        let contentImageUrl = ''
        const falStart = Date.now()

        console.log(`   🔍 slideConfig para ${slideName}:`, JSON.stringify(slideConfig || 'undefined'))

        if (slideConfig?.mode === 'upload' && slideConfig.uploadUrl) {
          contentImageUrl = slideConfig.uploadUrl
          console.log(`   📤 Usando imagem enviada`)
        } else if (slideConfig?.mode === 'custom_prompt' && slideConfig.customPrompt) {
          try {
            let basePrompt: string
            const isDetailedCustomPrompt = slideConfig.customPrompt.length > 50

            if (isDetailedCustomPrompt) {
              // Prompt customizado já é detalhado, usar direto
              console.log(`   ✨ Usando prompt customizado detalhado (${slideConfig.customPrompt.length} chars)`)
              basePrompt = slideConfig.customPrompt
            } else {
              // Prompt customizado curto, adicionar contexto
              console.log(`   🧠 Expandindo prompt customizado com contexto...`)
              basePrompt = createContextualImagePrompt(
                { titulo, corpo, imagemPrompt: slideConfig.customPrompt },
                { titulo: carousel.titulo, objetivo: carousel.objetivo, tipo: carousel.tipo },
                { nicho: nicheContext }
              )
            }

            // 🎨 ENHANCEMENT: Adicionar quality modifiers
            const enhanced = enhancePrompt(basePrompt, {
              carouselType: carousel.tipo as 'educacional' | 'vendas' | 'autoridade' | 'viral',
            })

            const finalPrompt = cleanPrompt(enhanced.enhancedPrompt)

            console.log(`   📝 Prompt custom: "${basePrompt.substring(0, 100)}..."`)
            console.log(`   ✨ Prompt enhanced: "${finalPrompt.substring(0, 100)}..."`)

            contentImageUrl = await generateImageSmart(finalPrompt)
            console.log(`   ✅ Imagem customizada gerada (${Date.now() - falStart}ms)`)
          } catch (nanoBananaError: unknown) {
            const msg = nanoBananaError instanceof Error ? nanoBananaError.message : String(nanoBananaError)
            console.warn(`   ⚠️ Nano Banana falhou (${msg}), sem imagem`)
          }
        } else if (slideConfig?.mode !== 'no_image') {
          console.log(`   🚀 Iniciando geração de imagem (mode: ${slideConfig?.mode || 'auto'})...`)
          try {
            let basePrompt: string

            // ✅ FIX: Se imagemPrompt já está detalhado (gerado pelo Content Squad), usar DIRETO
            // Só usar createContextualImagePrompt se imagemPrompt estiver vazio/genérico
            const isDetailedPrompt = imagemPrompt && imagemPrompt.length > 50

            if (isDetailedPrompt) {
              // Usar prompt detalhado do Content Squad DIRETAMENTE
              console.log(`   ✨ Usando prompt detalhado do Content Squad (${imagemPrompt.length} chars)`)
              basePrompt = imagemPrompt
            } else {
              // Gerar prompt INTELIGENTE baseado no conteúdo (fallback)
              console.log(`   🧠 Gerando prompt contextual inteligente...`)
              basePrompt = createContextualImagePrompt(
                { titulo, corpo, imagemPrompt },
                { titulo: carousel.titulo, objetivo: carousel.objetivo, tipo: carousel.tipo },
                { nicho: nicheContext }
              )
            }

            // 🎯 SOLUÇÃO: Usar prompt contextual DIRETO sem modificadores excessivos
            // O prompt já vem detalhado e relevante, não precisa de 20+ modificadores genéricos
            console.log(`   📝 Prompt contextual: "${basePrompt.substring(0, 150)}..."`)

            // Adicionar APENAS qualidade mínima (sem poluir o prompt)
            const finalPrompt = `${basePrompt}, photorealistic, professional photography, high quality, sharp focus`
            console.log(`   ✨ Prompt final (simplificado): "${finalPrompt.substring(0, 150)}..."`)

            // 🚫 REMOVIDO: enhancePrompt (adicionava 20+ modificadores genéricos)
            // 🚫 REMOVIDO: breakdown/focused prompt (estava gerando imagens genéricas)
            // ✅ AGORA: Prompt contextual direto = imagens relevantes ao conteúdo!

            if (isEditorial) {
              // Template editorial: imagem full-bleed como background
              console.log(`   📸 Gerando imagem editorial...`)
              contentImageUrl = await generateEditorialBackgroundSmart(finalPrompt)
            } else {
              // Templates padrão: imagem de conteúdo
              console.log(`   📸 Gerando imagem de conteúdo...`)
              contentImageUrl = await generateImageSmart(finalPrompt)
            }
            console.log(`   ✅ Imagem contextual gerada (${Date.now() - falStart}ms)`)
            console.log(`   🔗 URL da imagem: ${contentImageUrl.substring(0, 100)}...`)
          } catch (imageError: unknown) {
            const msg = imageError instanceof Error ? imageError.message : String(imageError)
            console.error(`   ❌ ERRO ao gerar imagem: ${msg}`)
            console.error(`   Stack:`, imageError)
          }
        } else {
          console.log(`   ⏭️  Pulando geração de imagem (mode: ${slideConfig?.mode})`)
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
          theme,
          slideNumber: j + 1,
          totalSlides: carousel.slides.length,
        }

        console.log(`   🎬 [V3] Selecionando composition: ${formatConfig.compositionId}`)
        const composition = await getStillComposition(bundleLocation, formatConfig.compositionId, stillInputProps)
        console.log(`   ✅ [V3] Composition selecionada`)

        console.log(`   🎥 [V3] Iniciando renderStill...`)
        try {
          await renderStill({
            serveUrl: bundleLocation,
            composition,
            output: outputPath,
            inputProps: stillInputProps,
            ...renderOptions,
          })
          console.log(`   ✅ [V3] renderStill concluído (${Date.now() - renderStart}ms)`)
        } catch (renderError) {
          console.error(`   ❌ [V3] ERRO no renderStill:`, renderError)
          throw new Error(`Falha ao renderizar slide ${j + 1}: ${renderError instanceof Error ? renderError.message : String(renderError)}`)
        }

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
      // INNER CATCH: Erros da lógica principal
      console.error('❌ [V3/Remotion] ERRO CAPTURADO (inner):', error)
      console.error('❌ [V3/Remotion] Stack:', error instanceof Error ? error.stack : 'N/A')

      const msg = error instanceof Error ? error.message : String(error)

      // Garantir que SEMPRE retornamos JSON
      return NextResponse.json(
        {
          error: msg || 'Failed to generate slides V3',
          timestamp: new Date().toISOString(),
          endpoint: 'generate-slides-v3',
          layer: 'inner',
        },
        { status: 500 }
      )
    }
  } catch (outerError: unknown) {
    // OUTER CATCH: Erros de import, compilação, ou crashes antes do código executar
    console.error('❌ [V3/Remotion] CRITICAL ERROR (outer):', outerError)

    const msg = outerError instanceof Error ? outerError.message : String(outerError)

    // FALLBACK ABSOLUTO: Garantir JSON mesmo em crash total
    return new NextResponse(
      JSON.stringify({
        error: msg || 'Critical server error',
        timestamp: new Date().toISOString(),
        endpoint: 'generate-slides-v3',
        layer: 'outer',
        details: outerError instanceof Error ? {
          name: outerError.name,
          stack: outerError.stack?.split('\n').slice(0, 5),
        } : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Handler de erros não capturados (fallback)
export const runtime = 'nodejs'
