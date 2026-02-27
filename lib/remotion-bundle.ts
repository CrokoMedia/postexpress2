/**
 * Remotion Bundle Utility
 *
 * Gerencia o bundle pré-compilado do Remotion para uso em APIs.
 * O bundle é gerado durante o build via scripts/build-remotion-bundle.js
 */

import path from 'path'
import fs from 'fs'

/**
 * Retorna o caminho para o bundle pré-compilado do Remotion.
 *
 * - Em produção: usa bundle pré-compilado em .remotion-bundle/
 * - Em desenvolvimento: cria bundle sob demanda e cacheia
 *
 * @throws Error se bundle não existir em produção
 */
export async function getRemotionBundle(): Promise<string> {
  // IMPORTANTE: Bundle está em .remotion-bundle/ (não em .next/) para evitar limpeza do Next.js build
  const bundlePath = path.resolve(process.cwd(), '.remotion-bundle')

  console.log('🔍 [Remotion] Checking bundle...')
  console.log('   - Path:', bundlePath)
  console.log('   - CWD:', process.cwd())
  console.log('   - NODE_ENV:', process.env.NODE_ENV)

  // Em produção, usar bundle pré-compilado
  if (process.env.NODE_ENV === 'production') {
    const exists = fs.existsSync(bundlePath)
    console.log('   - Bundle exists:', exists)

    if (!exists) {
      // Log do conteúdo do diretório para debug
      try {
        const cwdContents = fs.readdirSync(process.cwd())
        console.error('❌ [Remotion] Bundle not found!')
        console.error('   - Expected:', bundlePath)
        console.error('   - CWD contents:', cwdContents.slice(0, 20).join(', '))
      } catch (e) {
        console.error('❌ [Remotion] Could not read directory:', e)
      }

      throw new Error(
        `Remotion bundle not found at ${bundlePath}. Ensure "npm run build:remotion" runs during build.`
      )
    }

    // Log do conteúdo do bundle para confirmar
    try {
      const bundleContents = fs.readdirSync(bundlePath)
      console.log('✅ [Remotion] Bundle found with', bundleContents.length, 'items')
    } catch (e) {
      console.warn('⚠️ [Remotion] Could not read bundle directory:', e)
    }

    console.log('📦 [Remotion] Usando bundle pré-compilado')
    return bundlePath
  }

  // Em desenvolvimento, usar bundle pré-compilado (mesmo que em produção)
  // IMPORTANTE: Sempre rodar "npm run build:remotion" antes de iniciar dev server
  const exists = fs.existsSync(bundlePath)
  console.log('   - Bundle exists:', exists)

  if (!exists) {
    throw new Error(
      `Remotion bundle not found at ${bundlePath}.\n` +
      `Run "npm run build:remotion" to create the bundle before starting the dev server.`
    )
  }

  const bundleContents = fs.readdirSync(bundlePath)
  console.log('✅ [Remotion] Bundle found with', bundleContents.length, 'items')
  console.log('📦 [Remotion] Usando bundle pré-compilado')

  return bundlePath
}
