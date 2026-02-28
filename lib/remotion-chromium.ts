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
  console.log('🔧 [Remotion] getServerlessRenderOptions chamado (Dockerfile Debian build)')
  console.log('   NODE_ENV:', process.env.NODE_ENV)
  console.log('   Platform:', process.platform)
  console.log('   RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT)
  console.log('   RAILWAY_PROJECT_ID:', process.env.RAILWAY_PROJECT_ID ? 'SET' : 'NOT SET')
  console.log('   PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH || 'NOT SET')

  // Detectar produção: NODE_ENV=production OU ambiente Railway
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.RAILWAY_ENVIRONMENT === 'production' ||
    !!process.env.RAILWAY_PROJECT_ID

  console.log('🎯 [Remotion] isProduction:', isProduction)

  if (!isProduction) {
    console.log('💻 [Remotion] Usando Chromium local (desenvolvimento)')
    return {}
  }

  console.log('🚀 [Remotion] Modo PRODUÇÃO detectado!')

  // Prioridade de detecção do executável Chromium:
  // 1. PUPPETEER_EXECUTABLE_PATH (env var explícita)
  // 2. @sparticuz/chromium (Lambda-optimized bundled)
  // 3. /usr/bin/chromium (nixpacks no Railway)

  let executablePath: string | undefined

  // 1. Tentar PUPPETEER_EXECUTABLE_PATH primeiro
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    console.log('✅ [Remotion] Usando PUPPETEER_EXECUTABLE_PATH:', executablePath)
  } else {
    // 2. Tentar @sparticuz/chromium
    try {
      console.log('📦 [Remotion] Tentando importar @sparticuz/chromium...')
      const chromium = await import('@sparticuz/chromium')
      console.log('✅ [Remotion] @sparticuz/chromium importado com sucesso')

      console.log('🔍 [Remotion] Obtendo executablePath...')
      executablePath = await chromium.default.executablePath()
      console.log('✅ [Remotion] executablePath obtido:', executablePath)
    } catch (error) {
      console.error('❌ [Remotion] ERRO ao carregar @sparticuz/chromium:')
      console.error('   Erro:', error)

      // 3. Fallback: /usr/bin/chromium (nixpacks instala aqui)
      executablePath = '/usr/bin/chromium'
      console.warn('⚠️ [Remotion] Fallback: usando /usr/bin/chromium (nixpacks)')
    }
  }

  // CRITICAL: Forçar PUPPETEER_EXECUTABLE_PATH como env var
  // Remotion 5.x ignora browserExecutable em algumas situações e lê PUPPETEER_EXECUTABLE_PATH
  if (!process.env.PUPPETEER_EXECUTABLE_PATH && executablePath) {
    console.log('🔧 [Remotion] Definindo PUPPETEER_EXECUTABLE_PATH:', executablePath)
    process.env.PUPPETEER_EXECUTABLE_PATH = executablePath
  }

  // CRITICAL: Também setar REMOTION_BROWSER_EXECUTABLE (env var específica do Remotion 5.x)
  if (!process.env.REMOTION_BROWSER_EXECUTABLE && executablePath) {
    console.log('🔧 [Remotion] Definindo REMOTION_BROWSER_EXECUTABLE:', executablePath)
    process.env.REMOTION_BROWSER_EXECUTABLE = executablePath
  }

  // Retornar configuração do browser para Remotion
  const config = {
    browserExecutable: executablePath,
    // CRITICAL: Callback para prevenir download automático de Chrome
    onBrowserDownload: () => {
      console.log('🚫 [Remotion] Download de Chrome BLOQUEADO - usando Chromium configurado')
      // Retornar false cancela o download
      return false
    },
  }

  console.log('📋 [Remotion] Configuração final:', config)
  console.log('🌍 [Remotion] PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH)
  console.log('🌍 [Remotion] REMOTION_BROWSER_EXECUTABLE:', process.env.REMOTION_BROWSER_EXECUTABLE)
  return config
}

