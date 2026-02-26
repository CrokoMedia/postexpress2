/**
 * Remotion Bundle Utility
 *
 * Gerencia o bundle pré-compilado do Remotion para uso em APIs.
 * O bundle é gerado durante o build via scripts/build-remotion-bundle.js
 */

import { bundle } from '@remotion/bundler'
import path from 'path'
import fs from 'fs'

/**
 * Retorna o caminho para o bundle pré-compilado do Remotion.
 *
 * - Em produção: usa bundle pré-compilado em .next/remotion-bundle/
 * - Em desenvolvimento: cria bundle sob demanda e cacheia
 *
 * @throws Error se bundle não existir em produção
 */
export async function getRemotionBundle(): Promise<string> {
  const bundlePath = path.resolve(process.cwd(), '.next', 'remotion-bundle')

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
  const entryPoint = path.resolve(process.cwd(), 'remotion/index.tsx')

  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Remotion entry point not found: ${entryPoint}`)
  }

  const tempBundle = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })

  // Copiar para .next/remotion-bundle para cache
  fs.mkdirSync(bundlePath, { recursive: true })
  fs.cpSync(tempBundle, bundlePath, { recursive: true })

  console.log(`✅ [Remotion] Bundle criado em ${Date.now() - startTime}ms`)
  return bundlePath
}
