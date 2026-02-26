/**
 * POST /api/content/:id/generate-reels-batch
 * Gera múltiplos vídeos Reels em batch
 */

import express from 'express'
import { getRemotionBundle } from '../lib/remotion-bundle.js'
import { getCloudinary } from '../lib/cloudinary-config.js'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'

const router = express.Router({ mergeParams: true })

router.post('/', async (req, res) => {
  console.log('🚂 [Railway/Batch] POST /api/content/:id/generate-reels-batch')

  try {
    const { id } = req.params
    const { carousels, profile, config } = req.body

    if (!carousels || carousels.length === 0) {
      return res.status(400).json({ error: 'No carousels provided' })
    }

    console.log(`🎬 [Railway/Batch] Gerando ${carousels.length} vídeos`)

    // Carregar bundle
    const bundleLocation = await getRemotionBundle()

    const results = []
    const tempDir = path.join('/tmp', 'reels-batch', id)

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Processar cada carrossel
    for (let i = 0; i < carousels.length; i++) {
      const carousel = carousels[i]
      const reelName = `reel-${i + 1}`

      console.log(`📹 [Railway/Batch] Processando ${reelName}...`)

      const inputProps = {
        slides: carousel.slides || [],
        titulo: carousel.titulo || '',
        config: config || {},
        profile: profile || {},
      }

      const outputPath = path.join(tempDir, `${reelName}.mp4`)

      try {
        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: 'CarouselReel',
          inputProps,
        })

        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: 'h264',
          outputLocation: outputPath,
          inputProps,
        })

        console.log(`✅ [Railway/Batch] ${reelName} renderizado`)

        // Upload para Cloudinary
        const cloudinary = getCloudinary()

        const uploadResult = await cloudinary.uploader.upload(outputPath, {
          folder: `croko-labs/reels/${id}`,
          public_id: reelName,
          resource_type: 'video',
        })

        console.log(`✅ [Railway/Batch] ${reelName} uploaded`)

        results.push({
          reel: i + 1,
          name: reelName,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          duration: uploadResult.duration,
        })

        // Limpar arquivo temporário
        fs.unlinkSync(outputPath)

      } catch (reelError) {
        console.error(`❌ [Railway/Batch] Erro em ${reelName}:`, reelError)
        results.push({
          reel: i + 1,
          name: reelName,
          error: reelError.message,
        })
      }
    }

    // Limpar diretório temporário
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true })
    }

    console.log(`🎉 [Railway/Batch] Batch concluído! ${results.filter(r => !r.error).length}/${results.length} sucesso`)

    return res.json({
      success: true,
      reels: results,
      message: `${results.filter(r => !r.error).length} vídeos gerados com sucesso`,
    })

  } catch (error) {
    console.error('❌ [Railway/Batch] Erro:', error)
    return res.status(500).json({
      error: 'Failed to generate reels batch',
      message: error.message,
    })
  }
})

export default router
