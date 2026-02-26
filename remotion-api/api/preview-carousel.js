/**
 * POST /api/content/:id/preview-carousel
 * Gera preview PNG de um slide via Remotion
 */

import express from 'express'
import { getRemotionBundle } from '../lib/remotion-bundle.js'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'

const router = express.Router({ mergeParams: true })

router.post('/', async (req, res) => {
  console.log('🚂 [Railway/Preview] POST /api/content/:id/preview-carousel')

  try {
    const { id } = req.params
    const { slide, templateId = 'minimalist', format = 'feed', theme = 'light', profile } = req.body

    if (!slide) {
      return res.status(400).json({ error: 'Slide data required' })
    }

    // Mapear formato
    const FORMAT_TO_STILL = {
      feed:   { compositionId: 'CarouselStill', width: 1080, height: 1350 },
      story:  { compositionId: 'StoryStill',    width: 1080, height: 1920 },
      square: { compositionId: 'SquareStill',   width: 1080, height: 1080 },
    }
    const formatConfig = FORMAT_TO_STILL[format] || FORMAT_TO_STILL.feed

    console.log(`🎨 [Railway/Preview] Formato: ${format}, Template: ${templateId}`)

    // Carregar bundle
    const bundleLocation = await getRemotionBundle()

    // InputProps
    const inputProps = {
      titulo: slide.titulo || '',
      corpo: slide.corpo || slide.text || '',
      slideNumber: slide.slideNumber || 1,
      totalSlides: slide.totalSlides || 10,
      templateId,
      theme,
      format,
      profileImage: profile?.profile_pic_url || '',
      username: profile?.username || '',
      contentImageUrl: slide.contentImageUrl || '',
    }

    // Renderizar preview
    const tempDir = path.join('/tmp', 'preview', id)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const outputPath = path.join(tempDir, `preview-${Date.now()}.png`)

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: formatConfig.compositionId,
      inputProps,
    })

    await renderStill({
      composition,
      output: outputPath,
      serveUrl: bundleLocation,
      inputProps,
    })

    console.log(`✅ [Railway/Preview] Preview renderizado: ${outputPath}`)

    // Retornar imagem como buffer
    const imageBuffer = fs.readFileSync(outputPath)
    fs.unlinkSync(outputPath)

    res.set('Content-Type', 'image/png')
    res.send(imageBuffer)

  } catch (error) {
    console.error('❌ [Railway/Preview] Erro:', error)
    return res.status(500).json({
      error: 'Failed to generate preview',
      message: error.message,
    })
  }
})

export default router
