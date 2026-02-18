/**
 * Utilitário para lançar browser compatível com Vercel (serverless) e local
 * - Produção (Vercel): usa @sparticuz/chromium + puppeteer-core
 * - Local: usa puppeteer normal
 */
export async function getBrowser() {
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

  if (isVercel) {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = (await import('puppeteer-core')).default

    const executablePath = await chromium.executablePath()
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    })

    return browser
  } else {
    const puppeteer = (await import('puppeteer')).default

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    return browser
  }
}
