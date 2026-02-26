/**
 * POST /api/audits/:id/generate-audit-video
 * Gera vídeo de auditoria via Remotion
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
  console.log('🚂 [Railway/Audit] POST /api/audits/:id/generate-audit-video')

  try {
    const { id } = req.params
    const { audit, profile } = req.body

    if (!audit) {
      return res.status(400).json({ error: 'Audit data required' })
    }

    console.log(`🎬 [Railway/Audit] Gerando vídeo de auditoria para ${profile?.username || id}`)

    // Carregar bundle
    const bundleLocation = await getRemotionBundle()

    // InputProps
    const inputProps = {
      audit,
      profile: profile || {},
      scores: {
        behavior: audit.behavior_score || 0,
        copy: audit.copy_score || 0,
        offers: audit.offers_score || 0,
        metrics: audit.metrics_score || 0,
        anomalies: audit.anomalies_score || 0,
        overall: audit.overall_score || 0,
      },
    }

    // Renderizar vídeo
    const tempDir = path.join('/tmp', 'audit-videos', id)
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const outputPath = path.join(tempDir, `audit-${Date.now()}.mp4`)

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'AuditVideo',
      inputProps,
    })

    console.log(`🔧 [Railway/Audit] Composição: ${composition.id}, Duração: ${composition.durationInFrames} frames`)

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
    })

    console.log(`✅ [Railway/Audit] Vídeo renderizado: ${outputPath}`)

    // Upload para Cloudinary
    const cloudinary = getCloudinary()

    const uploadResult = await cloudinary.uploader.upload(outputPath, {
      folder: `croko-labs/audit-videos/${id}`,
      resource_type: 'video',
    })

    console.log(`✅ [Railway/Audit] Upload concluído: ${uploadResult.secure_url}`)

    // Limpar arquivo temporário
    fs.unlinkSync(outputPath)

    return res.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      duration: uploadResult.duration,
    })

  } catch (error) {
    console.error('❌ [Railway/Audit] Erro:', error)
    return res.status(500).json({
      error: 'Failed to generate audit video',
      message: error.message,
    })
  }
})

export default router
