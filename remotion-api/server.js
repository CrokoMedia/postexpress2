/**
 * Remotion Rendering Server
 *
 * Servidor Express dedicado para renderização Remotion
 * Deploy no Railway para evitar limitações da Vercel
 */

import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Carregar variáveis de ambiente
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// CORS - permitir requisições do frontend Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'remotion-api',
    timestamp: new Date().toISOString(),
    env: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage()
    }
  })
})

// Importar rotas das APIs
import previewCarouselRouter from './api/preview-carousel.js'
import generateSlidesV3Router from './api/generate-slides-v3.js'
import generateReelRouter from './api/generate-reel.js'
import generateReelsBatchRouter from './api/generate-reels-batch.js'
import generateAuditVideoRouter from './api/generate-audit-video.js'

// Registrar rotas
app.use('/api/content/:id/preview-carousel', previewCarouselRouter)
app.use('/api/content/:id/generate-slides-v3', generateSlidesV3Router)
app.use('/api/content/:id/generate-reel', generateReelRouter)
app.use('/api/content/:id/generate-reels-batch', generateReelsBatchRouter)
app.use('/api/audits/:id/generate-audit-video', generateAuditVideoRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ [Server] Erro não tratado:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚂 [Railway] Remotion API rodando na porta ${PORT}`)
  console.log(`🌍 [Railway] Environment: ${process.env.NODE_ENV}`)
  console.log(`🎬 [Railway] Remotion rendering service ready`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 [Railway] SIGTERM recebido, encerrando servidor...')
  process.exit(0)
})
