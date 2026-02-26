/**
 * Remotion Bundle Utility (Railway version)
 *
 * Gerencia o bundle pré-compilado do Remotion para uso em APIs.
 * Versão simplificada sem dependências do Next.js.
 */

import { bundle } from '@remotion/bundler'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Retorna o caminho para o bundle pré-compilado do Remotion.
 *
 * - Em produção: usa bundle pré-compilado em .remotion-bundle/
 * - Em desenvolvimento: cria bundle sob demanda e cacheia
 *
 * @throws Error se bundle não existir em produção
 */
export async function getRemotionBundle() {
  // Bundle está em .remotion-bundle/ na raiz do projeto Railway
  const bundlePath = path.resolve(process.cwd(), '.remotion-bundle')

  // Em produção, usar bundle pré-compilado
  if (process.env.NODE_ENV === 'production') {
    if (!fs.existsSync(bundlePath)) {
      throw new Error(
        'Remotion bundle not found. Ensure "npm run build:remotion" runs during build.'
      )
    }
    console.log('📦 [Remotion] Usando bundle pré-compilado')
    return bundlePath
  }

  // Em desenvolvimento, criar bundle sob demanda (uma vez)
  if (fs.existsSync(bundlePath)) {
    console.log('📦 [Remotion] Usando bundle cacheado')
    return bundlePath
  }

  console.log('🎬 [Remotion] Criando bundle para desenvolvimento...')
  const startTime = Date.now()

  // O entry point está na raiz do projeto principal
  const entryPoint = path.resolve(process.cwd(), '../remotion/index.tsx')

  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Remotion entry point not found: ${entryPoint}`)
  }

  const tempBundle = await bundle({
    entryPoint,
    webpackOverride: (config) => {
      config.devtool = false
      return config
    },
  })

  // Copiar para .remotion-bundle/ para cache
  fs.mkdirSync(bundlePath, { recursive: true })
  fs.cpSync(tempBundle, bundlePath, { recursive: true })

  console.log(`✅ [Remotion] Bundle criado em ${Date.now() - startTime}ms`)
  return bundlePath
}
