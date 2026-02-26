/**
 * Build Remotion Bundle
 *
 * Pré-compila o bundle do Remotion durante o build para uso em ambiente serverless.
 * O bundle é salvo em .next/remotion-bundle/ e reutilizado em runtime.
 *
 * Documentação: https://www.remotion.dev/docs/ssr#pre-bundling
 */

import { bundle } from '@remotion/bundler'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function buildRemotionBundle() {
  console.log('🎬 Building Remotion bundle...')

  try {
    const entryPoint = path.resolve(__dirname, '..', 'remotion', 'index.tsx')

    if (!fs.existsSync(entryPoint)) {
      throw new Error(`Entry point not found: ${entryPoint}`)
    }

    console.log('📍 Entry point:', entryPoint)

    // Criar bundle
    const bundleLocation = await bundle({
      entryPoint,
      webpackOverride: (config) => {
        // Garantir que todos os arquivos .tsx sejam incluídos
        return config
      },
    })

    console.log('✅ Bundle created at:', bundleLocation)

    // Copiar bundle para .remotion-bundle/ (fora de .next/ para evitar limpeza do Next.js)
    const targetDir = path.resolve(__dirname, '..', '.remotion-bundle')

    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true })
    }

    fs.mkdirSync(targetDir, { recursive: true })

    // Copiar todos os arquivos do bundle
    const files = fs.readdirSync(bundleLocation)
    for (const file of files) {
      const srcPath = path.join(bundleLocation, file)
      const destPath = path.join(targetDir, file)

      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true })
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    }

    console.log('📦 Bundle copied to:', targetDir)
    console.log('✅ Remotion bundle build complete!')

  } catch (error) {
    console.error('❌ Failed to build Remotion bundle:', error)
    process.exit(1)
  }
}

buildRemotionBundle()
