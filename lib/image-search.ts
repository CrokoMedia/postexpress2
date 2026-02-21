/**
 * Busca imagens na internet via Serper API (Google Images)
 * https://serper.dev — free tier: 2.500 queries/mes
 *
 * Env: SERPER_API_KEY
 */

interface ImageResult {
  title: string
  imageUrl: string
  thumbnailUrl: string
  source: string
  width?: number
  height?: number
}

/**
 * Busca imagens editoriais no Google Images via Serper API.
 * Retorna a melhor URL encontrada, ou null se nenhuma for encontrada.
 */
export async function searchEditorialImage(
  query: string,
  options?: { preferPortrait?: boolean; num?: number }
): Promise<string | null> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    console.warn('⚠️ SERPER_API_KEY nao configurada. Busca de imagens desabilitada.')
    return null
  }

  try {
    // Adicionar termos para buscar fotos editoriais de qualidade
    const searchQuery = `${query} editorial photography high quality`

    console.log(`🔍 Buscando imagem: "${searchQuery}"`)

    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: searchQuery,
        num: options?.num || 5,
      }),
    })

    if (!res.ok) {
      console.error(`❌ Serper API erro: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    const images: ImageResult[] = data.images || []

    if (images.length === 0) {
      console.warn('⚠️ Nenhuma imagem encontrada para:', query)
      return null
    }

    // Preferir imagens verticais/portrait para o formato 1080x1350
    if (options?.preferPortrait) {
      const portraitImage = images.find(
        (img) => img.width && img.height && img.height > img.width
      )
      if (portraitImage) {
        console.log(`✅ Imagem portrait encontrada: ${portraitImage.imageUrl}`)
        return portraitImage.imageUrl
      }
    }

    // Retornar a primeira imagem (melhor resultado do Google)
    const bestImage = images[0]
    console.log(`✅ Imagem encontrada: ${bestImage.imageUrl}`)
    return bestImage.imageUrl
  } catch (error: any) {
    console.error('❌ Erro na busca de imagens:', error.message)
    return null
  }
}
