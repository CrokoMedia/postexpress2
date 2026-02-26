/**
 * POST /api/content/:id/generate-slides-v3
 * Gera slides PNG via renderStill() do Remotion
 * Versão Express para Railway
 */

import express from 'express'
import { getSupabase } from '../lib/supabase-client.js'
import { getRemotionBundle } from '../lib/remotion-bundle.js'
import { getCloudinary } from '../lib/cloudinary-config.js'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'

const router = express.Router({ mergeParams: true })

/**
 * Extrai título e corpo do slide
 */
function getSlideFields(slide) {
  if (slide.titulo && slide.corpo) {
    return { titulo: slide.titulo, corpo: slide.corpo }
  }
  if (slide.titulo) {
    return { titulo: slide.titulo, corpo: '' }
  }
  if (slide.text) {
    const lines = slide.text.split('\n').filter(l => l.trim())
    return {
      titulo: lines[0] || '',
      corpo: lines.slice(1).join('\n'),
    }
  }
  return { titulo: '', corpo: slide.content || '' }
}

router.post('/', async (req, res) => {
  console.log('🚂 [Railway/V3] POST /api/content/:id/generate-slides-v3')

  try {
    const { id } = req.params
    const { carousels, profile, templateId = 'minimalist', format = 'feed', theme = 'light' } = req.body

    console.log(`📝 [Railway/V3] Audit ID: ${id}, Carousels: ${carousels?.length || 0}`)

    // Validações
    if (!carousels || carousels.length === 0) {
      return res.status(400).json({ error: 'No carousels provided' })
    }

    const approvedCarousels = carousels.filter(c => c.approved === true)

    if (approvedCarousels.length === 0) {
      return res.status(400).json({
        error: 'Nenhum carrossel aprovado. Aprove pelo menos um carrossel antes de gerar slides.'
      })
    }

    // Mapear formato para composição
    const FORMAT_TO_STILL = {
      feed:   { compositionId: 'CarouselStill', width: 1080, height: 1350 },
      story:  { compositionId: 'StoryStill',    width: 1080, height: 1920 },
      square: { compositionId: 'SquareStill',   width: 1080, height: 1080 },
    }
    const formatConfig = FORMAT_TO_STILL[format] || FORMAT_TO_STILL.feed

    console.log(`🎨 [Railway/V3] Formato: ${format} (${formatConfig.width}x${formatConfig.height})`)

    // Carregar bundle Remotion
    console.log('📦 [Railway/V3] Carregando bundle Remotion...')
    const bundleLocation = await getRemotionBundle()
    console.log('✅ [Railway/V3] Bundle carregado:', bundleLocation)

    // Railway: Chromium nativo disponível, não precisa de @sparticuz
    const renderOptions = {
      // Usar Chromium do sistema Railway
    }

    const results = []
    const tempDir = path.join('/tmp', 'slides-v3', id)

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Processar cada carrossel aprovado
    for (let i = 0; i < approvedCarousels.length; i++) {
      const carousel = approvedCarousels[i]
      const carouselName = `carrossel-${i + 1}`

      console.log(`📝 [Railway/V3] Processando ${carouselName} (${carousel.slides.length} slides)...`)

      const slideImages = []

      for (let j = 0; j < carousel.slides.length; j++) {
        const slide = carousel.slides[j]
        const slideName = `slide-${j + 1}`
        const { titulo, corpo } = getSlideFields(slide)

        console.log(`   🎬 Renderizando ${slideName}: "${titulo.substring(0, 50)}..."`)

        // Montar inputProps para o Remotion
        const stillInputProps = {
          titulo,
          corpo,
          slideNumber: j + 1,
          totalSlides: carousel.slides.length,
          templateId,
          theme,
          format,
          profileImage: profile?.profile_pic_url || '',
          username: profile?.username || '',
          // Imagem de conteúdo (se houver)
          contentImageUrl: slide.contentImageUrl || '',
        }

        // Renderizar slide com Remotion
        const outputPath = path.join(tempDir, `${carouselName}-${slideName}.png`)

        try {
          const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: formatConfig.compositionId,
            inputProps: stillInputProps,
          })

          console.log(`   🔧 Composição selecionada: ${composition.id} (${composition.width}x${composition.height})`)

          await renderStill({
            composition,
            output: outputPath,
            serveUrl: bundleLocation,
            inputProps: stillInputProps,
            ...renderOptions,
          })

          console.log(`   ✅ Slide renderizado: ${outputPath}`)

        } catch (renderError) {
          console.error(`   ❌ Erro ao renderizar ${slideName}:`, renderError)
          throw new Error(`Falha ao renderizar ${slideName}: ${renderError.message}`)
        }

        // Upload para Cloudinary
        console.log(`   ☁️  Uploading para Cloudinary...`)
        const cloudinary = getCloudinary()

        try {
          const uploadResult = await cloudinary.uploader.upload(outputPath, {
            folder: `croko-labs/slides/${id}`,
            public_id: `${carouselName}-${slideName}`,
            resource_type: 'image',
          })

          console.log(`   ✅ Upload concluído: ${uploadResult.secure_url}`)

          slideImages.push({
            slide: j + 1,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          })

          // Limpar arquivo temporário
          fs.unlinkSync(outputPath)

        } catch (uploadError) {
          console.error(`   ❌ Erro ao fazer upload ${slideName}:`, uploadError)
          throw new Error(`Falha no upload ${slideName}: ${uploadError.message}`)
        }
      }

      results.push({
        carousel: i + 1,
        name: carouselName,
        slides: slideImages,
      })
    }

    // Limpar diretório temporário
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }

    console.log(`🎉 [Railway/V3] Geração concluída! ${results.length} carrosséis, ${results.reduce((sum, r) => sum + r.slides.length, 0)} slides`)

    return res.json({
      success: true,
      carousels: results,
      message: `${results.length} carrosséis gerados com sucesso`,
    })

  } catch (error) {
    console.error('❌ [Railway/V3] Erro:', error)
    return res.status(500).json({
      error: 'Failed to generate slides',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

export default router
