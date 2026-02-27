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
  console.log('🔧 [Remotion] getServerlessRenderOptions chamado')
  console.log('   NODE_ENV:', process.env.NODE_ENV)
  console.log('   Platform:', process.platform)
  console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT)

  // Detectar produção: NODE_ENV=production OU ambiente Railway
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.RAILWAY_ENVIRONMENT === 'production' ||
    !!process.env.RAILWAY_PROJECT_ID

  if (!isProduction) {
    console.log('💻 [Remotion] Usando Chromium local (desenvolvimento)')
    return {}
  }

  // Em produção: passar executável do Chromium serverless
  try {
    console.log('📦 [Remotion] Importando @sparticuz/chromium...')
    const chromium = await import('@sparticuz/chromium')
    console.log('✅ [Remotion] @sparticuz/chromium importado com sucesso')

    console.log('🔍 [Remotion] Obtendo executablePath...')
    const executablePath = await chromium.default.executablePath()
    console.log('✅ [Remotion] executablePath obtido:', executablePath)

    return {
      browserExecutable: executablePath,
    }
  } catch (error) {
    console.error('❌ [Remotion] ERRO ao carregar Chromium serverless:')
    console.error('   Erro:', error)
    console.error('   Stack:', error instanceof Error ? error.stack : 'N/A')

    // Fallback: retornar vazio (Remotion tentará usar Chromium padrão)
    console.warn('⚠️ [Remotion] Fallback: usando configuração vazia')
    return {}
  }
}

