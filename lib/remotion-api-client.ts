/**
 * Remotion API Client
 *
 * Cliente para chamadas à API de renderização Remotion.
 * Detecta automaticamente se deve usar Railway (produção) ou rotas Next.js locais (dev).
 */

/**
 * Retorna a URL base da API Remotion
 *
 * - Se NEXT_PUBLIC_REMOTION_API_URL estiver definida → usa Railway
 * - Caso contrário → usa rotas Next.js locais
 */
export function getRemotionApiUrl(): string {
  const railwayUrl = process.env.NEXT_PUBLIC_REMOTION_API_URL

  if (railwayUrl) {
    console.log('🚂 [Remotion] Usando Railway API:', railwayUrl)
    return railwayUrl
  }

  console.log('💻 [Remotion] Usando rotas Next.js locais')
  return '' // Empty string = rotas relativas do Next.js
}

/**
 * Monta URL completa para endpoint de renderização
 */
export function buildRemotionApiUrl(path: string): string {
  const baseUrl = getRemotionApiUrl()

  // Se baseUrl vazio, retornar path relativo
  if (!baseUrl) {
    return path
  }

  // Remover trailing slash do baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')

  // Garantir leading slash no path
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanBaseUrl}${cleanPath}`
}

/**
 * Cliente HTTP para API Remotion com configuração automática
 */
export async function remotionFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = buildRemotionApiUrl(path)

  console.log(`📡 [Remotion] ${options.method || 'GET'} ${url}`)

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`❌ [Remotion] Erro ${response.status}:`, errorText)
    throw new Error(`Remotion API error: ${response.status} ${errorText}`)
  }

  return response
}

/**
 * Helper: POST JSON para API Remotion
 */
export async function remotionPost<T = any>(
  path: string,
  body: any
): Promise<T> {
  const response = await remotionFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return response.json()
}
