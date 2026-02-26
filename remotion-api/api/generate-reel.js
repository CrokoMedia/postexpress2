/**
 * POST /api/content/:id/generate-reel
 * Gera vídeo Reel via renderMedia() do Remotion
 */

import express from 'express'
import { getSupabase } from '../lib/supabase-client.js'
import { getRemotionBundle } from '../lib/remotion-bundle.js'
import { getCloudinary } from '../lib/cloudinary-config.js'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'

const router = express.Router({ mergeParams: true })

router.post('/', async (req, res) => {
  console.log('🚂 [Railway/Reel] POST /api/content/:id/generate-reel')

  try {
    const { id } = req.params
    const { carousel, profile, config } = req.body

    if (!carousel) {
      return res.status(400).json({ error: 'Carousel data required' })
    }

    console.log(`🎬 [Railway/Reel] Gerando vídeo para carrossel (${carousel.slides?.length || 0} slides)`)

    // Carregar bundle
    const bundleLocation = await getRemotionBundle()

    // InputProps para o vídeo
    const inputProps = {
      slides: carousel.slides || [],
      titulo: carousel.titulo || '',
      config: config || {},
      profile: profile || {},
    }

    // Renderizar vídeo
    const tempDir = path.join('/tmp', 'reels', id)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const outputPath = path.join(tempDir, `reel-${Date.now()}.mp4`)

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CarouselReel',
      inputProps,
    })

    console.log(`🔧 [Railway/Reel] Composição: ${composition.id}, Duração: ${composition.durationInFrames} frames`)

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
    })

    console.log(`✅ [Railway/Reel] Vídeo renderizado: ${outputPath}`)

    // Upload para Cloudinary
    const cloudinary = getCloudinary()

    const uploadResult = await cloudinary.uploader.upload(outputPath, {
      folder: `croko-labs/reels/${id}`,
      resource_type: 'video',
    })

    console.log(`✅ [Railway/Reel] Upload concluído: ${uploadResult.secure_url}`)

    // Limpar arquivo temporário
    fs.unlinkSync(outputPath)

    return res.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      duration: uploadResult.duration,
    })

  } catch (error) {
    console.error('❌ [Railway/Reel] Erro:', error)
    return res.status(500).json({
      error: 'Failed to generate reel',
      message: error.message,
    })
  }
})

export default router
