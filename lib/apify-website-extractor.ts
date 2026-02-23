/**
 * Apify Website Data Extractor
 * Extrai imagens, logos, cores e conteúdo de sites usando Apify
 */

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN

interface ApifyWebsiteData {
  images: string[]           // URLs das imagens principais
  logoUrl: string | null     // URL do logo (se encontrado)
  heroImageUrl: string | null // Imagem hero/principal
  colors: string[]           // Cores extraídas do CSS
  title: string              // Título do site
  description: string        // Descrição/meta description
}

/**
 * Extrai dados de um site usando Apify Website Content Crawler
 */
export async function extractWebsiteDataWithApify(url: string): Promise<ApifyWebsiteData> {
  if (!APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN não configurada')
  }

  console.log(`   🕷️ Apify: Extraindo dados de ${url}...`)

  try {
    // 1. Iniciar Apify Actor (Website Content Crawler)
    const actorRunResponse = await fetch('https://api.apify.com/v2/acts/apify~website-content-crawler/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        startUrls: [{ url }],
        maxCrawlDepth: 0, // Só a homepage
        maxCrawlPages: 1,
        crawlerType: 'playwright:chrome',
        proxyConfiguration: { useApifyProxy: true },
        // Extrair imagens e CSS
        initialCookies: [],
        maxSessionRotations: 3,
      }),
    })

    if (!actorRunResponse.ok) {
      const errorText = await actorRunResponse.text()
      throw new Error(`Apify Actor start failed: ${actorRunResponse.status} - ${errorText}`)
    }

    const runData = await actorRunResponse.json()
    const runId = runData.data.id

    console.log(`   ⏳ Apify Run ID: ${runId} - Aguardando conclusão...`)

    // 2. Aguardar conclusão (polling)
    let runStatus = 'RUNNING'
    let attempts = 0
    const maxAttempts = 60 // 60 x 2s = 2 minutos

    while (runStatus === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Aguardar 2s

      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` },
      })

      if (!statusResponse.ok) {
        throw new Error(`Failed to check run status: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      runStatus = statusData.data.status

      attempts++
      console.log(`   ⏳ Status: ${runStatus} (${attempts}/${maxAttempts})`)
    }

    if (runStatus !== 'SUCCEEDED') {
      throw new Error(`Apify run failed or timed out: ${runStatus}`)
    }

    // 3. Obter resultados
    const resultsResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
      headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` },
    })

    if (!resultsResponse.ok) {
      throw new Error(`Failed to fetch results: ${resultsResponse.status}`)
    }

    const results = await resultsResponse.json()

    if (!results || results.length === 0) {
      throw new Error('No data extracted from website')
    }

    const pageData = results[0]

    console.log(`   ✅ Apify: Dados extraídos com sucesso`)

    // 4. Processar resultados
    const images = extractImagesFromPage(pageData)
    const logoUrl = findLogoInImages(images)
    const heroImageUrl = findHeroImage(images)
    const colors = extractColorsFromCSS(pageData.text || '')

    return {
      images: images.slice(0, 10), // Top 10 imagens
      logoUrl,
      heroImageUrl,
      colors,
      title: pageData.metadata?.title || pageData.title || '',
      description: pageData.metadata?.description || pageData.description || '',
    }

  } catch (error: any) {
    console.error(`   ❌ Apify error:`, error.message)
    throw new Error(`Apify extraction failed: ${error.message}`)
  }
}

/**
 * Extrai URLs de imagens do resultado do Apify
 */
function extractImagesFromPage(pageData: any): string[] {
  const images: string[] = []

  // Extrair de diferentes campos possíveis
  if (pageData.images && Array.isArray(pageData.images)) {
    images.push(...pageData.images.map((img: any) => img.src || img.url || img).filter(Boolean))
  }

  if (pageData.screenshots && Array.isArray(pageData.screenshots)) {
    images.push(...pageData.screenshots.map((s: any) => s.url || s).filter(Boolean))
  }

  // Remover duplicatas
  return [...new Set(images)].filter(url => {
    // Filtrar SVGs muito pequenos e data URIs
    return url.startsWith('http') && !url.includes('logo.svg') && !url.includes('icon.svg')
  })
}

/**
 * Tenta encontrar o logo entre as imagens
 */
function findLogoInImages(images: string[]): string | null {
  // Procurar por imagens com "logo" no nome
  const logoImage = images.find(url =>
    url.toLowerCase().includes('logo') &&
    !url.toLowerCase().includes('icon') &&
    (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg'))
  )

  return logoImage || null
}

/**
 * Encontra a imagem hero/principal (maior imagem, geralmente)
 */
function findHeroImage(images: string[]): string | null {
  // Priorizar imagens com "hero", "banner", "cover" no nome
  const heroImage = images.find(url =>
    url.toLowerCase().includes('hero') ||
    url.toLowerCase().includes('banner') ||
    url.toLowerCase().includes('cover')
  )

  // Se não encontrar, pegar a primeira imagem grande
  return heroImage || images[0] || null
}

/**
 * Extrai cores do CSS/texto da página
 */
function extractColorsFromCSS(text: string): string[] {
  const colors: string[] = []

  // Regex para encontrar cores HEX
  const hexRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g
  const matches = text.match(hexRegex)

  if (matches) {
    // Normalizar para 6 dígitos e remover duplicatas
    const normalized = matches.map(hex => {
      if (hex.length === 4) {
        // #abc -> #aabbcc
        return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
      }
      return hex.toLowerCase()
    })

    // Remover duplicatas e cores muito claras/escuras
    const unique = [...new Set(normalized)].filter(color => {
      // Remover #fff, #000, etc.
      return color !== '#ffffff' && color !== '#000000' && color !== '#fff' && color !== '#000'
    })

    colors.push(...unique.slice(0, 5)) // Top 5 cores
  }

  return colors
}
