/**
 * Pexels Stock Video API Integration
 * Busca clipes de video curtos (3-5s) para uso como B-Roll background nos slides.
 *
 * Documentacao: https://www.pexels.com/api/documentation/#videos-search
 */

interface PexelsVideoFile {
  id: number
  quality: string
  file_type: string
  width: number
  height: number
  fps: number
  link: string
}

interface PexelsVideo {
  id: number
  width: number
  height: number
  duration: number
  video_files: PexelsVideoFile[]
}

interface PexelsSearchResponse {
  page: number
  per_page: number
  total_results: number
  videos: PexelsVideo[]
}

/**
 * Busca um video stock HD no Pexels para usar como B-Roll background.
 * Seleciona automaticamente o arquivo MP4 em HD (min 1920x1080).
 *
 * @param keyword Palavra-chave de busca (ex: titulo do slide, imagePrompt)
 * @param retries Numero de tentativas em caso de falha (default: 2)
 * @returns URL do arquivo MP4 ou null se nao encontrado
 */
export async function searchStockVideo(
  keyword: string,
  retries = 2
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.warn('[stock-video] PEXELS_API_KEY nao configurada. Pulando busca de video.')
    return null
  }

  // Limpar keyword para melhor resultado de busca
  const cleanKeyword = keyword
    .replace(/[^\w\s]/g, ' ') // Remover caracteres especiais
    .replace(/\s+/g, ' ')     // Colapsar espacos multiplos
    .trim()
    .substring(0, 100)        // Limitar tamanho da query

  if (!cleanKeyword) {
    return null
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = new URL('https://api.pexels.com/videos/search')
      url.searchParams.set('query', cleanKeyword)
      url.searchParams.set('per_page', '5') // Buscar 5 para ter opcoes de fallback
      url.searchParams.set('orientation', 'portrait') // Videos verticais para Reels
      url.searchParams.set('size', 'medium') // Balancear qualidade e velocidade

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: apiKey,
        },
      })

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited — esperar e tentar novamente
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10)
          console.warn(`[stock-video] Rate limited. Aguardando ${retryAfter}s antes de retry...`)
          await sleep(retryAfter * 1000)
          continue
        }
        throw new Error(`Pexels API retornou status ${response.status}: ${response.statusText}`)
      }

      const data: PexelsSearchResponse = await response.json()

      if (!data.videos || data.videos.length === 0) {
        console.warn(`[stock-video] Nenhum video encontrado para: "${cleanKeyword}"`)
        return null
      }

      // Selecionar o melhor video (preferir duracao curta 3-10s)
      const video = selectBestVideo(data.videos)
      if (!video) {
        return null
      }

      // Extrair URL do MP4 em qualidade HD
      const videoFileUrl = extractHDVideoUrl(video)
      if (!videoFileUrl) {
        console.warn(`[stock-video] Video encontrado mas sem arquivo HD disponivel (id: ${video.id})`)
        return null
      }

      console.log(`[stock-video] Video encontrado: id=${video.id}, ${video.width}x${video.height}, ${video.duration}s`)
      return videoFileUrl

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (attempt < retries) {
        console.warn(`[stock-video] Tentativa ${attempt + 1} falhou: ${errorMessage}. Retentando...`)
        await sleep(1000 * (attempt + 1)) // Backoff progressivo
      } else {
        console.error(`[stock-video] Todas as tentativas falharam para "${cleanKeyword}": ${errorMessage}`)
        return null
      }
    }
  }

  return null
}

/**
 * Busca videos para multiplos slides com controle de concorrencia.
 * Evita sobrecarregar a API do Pexels com muitas requests simultaneas.
 *
 * @param keywords Array de keywords (uma por slide)
 * @param concurrency Numero maximo de buscas simultaneas (default: 2)
 * @returns Array de URLs (null para slides sem video encontrado)
 */
export async function searchStockVideosForSlides(
  keywords: string[],
  concurrency = 2
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(keywords.length).fill(null)

  // Processar em batches para controle de concorrencia
  for (let i = 0; i < keywords.length; i += concurrency) {
    const batch = keywords.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((keyword) => searchStockVideo(keyword))
    )
    for (let j = 0; j < batchResults.length; j++) {
      results[i + j] = batchResults[j]
    }

    // Pequeno delay entre batches para respeitar rate limits
    if (i + concurrency < keywords.length) {
      await sleep(500)
    }
  }

  return results
}

/**
 * Seleciona o melhor video da lista de resultados.
 * Prioriza videos curtos (3-10s) que sao ideais para B-Roll.
 */
function selectBestVideo(videos: PexelsVideo[]): PexelsVideo | null {
  if (videos.length === 0) return null

  // Ordenar por preferencia: duracao ideal (3-10s) primeiro
  const scored = videos.map((video) => {
    let score = 0

    // Preferir duracao ideal para B-Roll (3-10 segundos)
    if (video.duration >= 3 && video.duration <= 10) {
      score += 10
    } else if (video.duration >= 2 && video.duration <= 15) {
      score += 5
    }

    // Preferir resolucao HD+
    if (video.width >= 1920 || video.height >= 1920) {
      score += 5
    } else if (video.width >= 1280 || video.height >= 1280) {
      score += 3
    }

    return { video, score }
  })

  // Ordenar por score decrescente
  scored.sort((a, b) => b.score - a.score)

  return scored[0].video
}

/**
 * Extrai a URL do arquivo MP4 em qualidade HD de um video Pexels.
 * Prioriza: HD (1920+) > SD (1280+) > qualquer MP4 disponivel.
 */
function extractHDVideoUrl(video: PexelsVideo): string | null {
  const mp4Files = video.video_files.filter(
    (f) => f.file_type === 'video/mp4'
  )

  if (mp4Files.length === 0) return null

  // Ordenar por resolucao (largura * altura) decrescente
  mp4Files.sort((a, b) => (b.width * b.height) - (a.width * a.height))

  // Preferir HD (1920+) mas aceitar qualquer resolucao razoavel
  const hdFile = mp4Files.find(
    (f) => f.width >= 1920 || f.height >= 1920
  )

  if (hdFile) return hdFile.link

  // Fallback: maior resolucao disponivel
  const bestFile = mp4Files[0]
  if (bestFile && (bestFile.width >= 720 || bestFile.height >= 720)) {
    return bestFile.link
  }

  // Ultimo fallback: qualquer MP4
  return bestFile?.link || null
}

/** Helper para sleep com Promise */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
