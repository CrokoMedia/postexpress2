/**
 * Remotion Chromium Configuration
 *
 * Configura Chromium para ambiente serverless (Railway/Vercel/Lambda)
 * Usa @sparticuz/chromium para fornecer binário headless otimizado
 */

/**
 * Retorna opções de renderização para ambiente serverless
 *
 * Em produção: usa @sparticuz/chromium (Lambda-optimized)
 * Em desenvolvimento: retorna opções vazias (Remotion usa Chromium local)
 */
export async function getServerlessRenderOptions() {
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction) {
    console.log('💻 [Remotion] Usando Chromium local (desenvolvimento)')
    return {}
  }

  // Em produção: passar executável do Chromium serverless
  try {
    const chromium = await import('@sparticuz/chromium')
    const executablePath = await chromium.default.executablePath()

    console.log('🌐 [Remotion] Usando Chromium serverless:', executablePath)

    return {
      browserExecutable: executablePath,
    }
  } catch (error) {
    console.error('❌ [Remotion] Erro ao carregar Chromium serverless:', error)
    // Fallback: deixar Remotion usar default (pode falhar em serverless)
    return {}
  }
}

