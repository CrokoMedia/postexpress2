/**
 * Instagram Graph API Helper
 *
 * Funções para interagir com a Instagram Graph API:
 * - OAuth flow
 * - Publicar carrosséis
 * - Agendar posts
 * - Gerenciar tokens
 */

const GRAPH_API_VERSION = 'v18.0'
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

export interface InstagramAuthTokens {
  access_token: string
  token_type: string
  expires_in?: number
}

export interface InstagramAccountInfo {
  instagram_business_account: {
    id: string
  }
  id: string // Facebook Page ID
  name: string
}

export interface CarouselPublishOptions {
  instagramAccountId: string
  accessToken: string
  slideUrls: string[] // URLs públicas das imagens (Cloudinary)
  caption: string
  scheduleTime?: Date // Opcional: agendar para depois
}

export interface PublishResult {
  status: 'published' | 'scheduled'
  mediaId: string
  permalink?: string
}

/**
 * Trocar authorization code por access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<InstagramAuthTokens> {
  const appId = process.env.FACEBOOK_APP_ID!
  const appSecret = process.env.FACEBOOK_APP_SECRET!
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
  url.searchParams.set('client_id', appId)
  url.searchParams.set('client_secret', appSecret)
  url.searchParams.set('code', code)
  url.searchParams.set('redirect_uri', redirectUri)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to exchange code: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data
}

/**
 * Obter informações da conta Instagram vinculada
 */
export async function getInstagramAccountInfo(
  accessToken: string
): Promise<InstagramAccountInfo> {
  // 1. Obter Facebook Pages do usuário
  const pagesUrl = `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`
  const pagesResponse = await fetch(pagesUrl)

  if (!pagesResponse.ok) {
    throw new Error('Failed to fetch Facebook Pages')
  }

  const pagesData = await pagesResponse.json()
  const pages = pagesData.data || []

  if (pages.length === 0) {
    throw new Error('No Facebook Pages found. You need a Facebook Page connected to your Instagram Business account.')
  }

  // 2. Para cada página, verificar se tem Instagram Business Account
  for (const page of pages) {
    const igUrl = `${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
    const igResponse = await fetch(igUrl)

    if (igResponse.ok) {
      const igData = await igResponse.json()

      if (igData.instagram_business_account) {
        return {
          instagram_business_account: igData.instagram_business_account,
          id: page.id,
          name: page.name
        }
      }
    }
  }

  throw new Error('No Instagram Business Account found. Please connect your Instagram to a Facebook Page.')
}

/**
 * Publicar carrossel no Instagram
 */
export async function publishCarousel(
  options: CarouselPublishOptions
): Promise<PublishResult> {
  const { instagramAccountId, accessToken, slideUrls, caption, scheduleTime } = options

  // Validação
  if (slideUrls.length < 2 || slideUrls.length > 10) {
    throw new Error('Carousel must have between 2 and 10 slides')
  }

  // PASSO 1: Criar containers para cada slide
  const containerIds: string[] = []

  for (const slideUrl of slideUrls) {
    const containerUrl = `${GRAPH_API_BASE}/${instagramAccountId}/media`

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: slideUrl,
        is_carousel_item: true,
        access_token: accessToken
      })
    })

    if (!containerResponse.ok) {
      const error = await containerResponse.json()
      throw new Error(`Failed to create container: ${error.error?.message || 'Unknown error'}`)
    }

    const containerData = await containerResponse.json()
    containerIds.push(containerData.id)
  }

  // PASSO 2: Criar container pai (carrossel completo)
  const carouselUrl = `${GRAPH_API_BASE}/${instagramAccountId}/media`

  const carouselBody: any = {
    caption,
    media_type: 'CAROUSEL',
    children: containerIds,
    access_token: accessToken
  }

  const carouselResponse = await fetch(carouselUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(carouselBody)
  })

  if (!carouselResponse.ok) {
    const error = await carouselResponse.json()
    throw new Error(`Failed to create carousel: ${error.error?.message || 'Unknown error'}`)
  }

  const carouselData = await carouselResponse.json()
  const carouselContainerId = carouselData.id

  // PASSO 3: Publicar ou agendar
  const publishUrl = `${GRAPH_API_BASE}/${instagramAccountId}/media_publish`

  const publishBody: any = {
    creation_id: carouselContainerId,
    access_token: accessToken
  }

  // Se tiver scheduleTime, converter para Unix timestamp
  if (scheduleTime) {
    const unixTimestamp = Math.floor(scheduleTime.getTime() / 1000)
    const now = Math.floor(Date.now() / 1000)

    // Instagram requer mínimo 10 minutos no futuro
    if (unixTimestamp < now + 600) {
      throw new Error('Scheduled time must be at least 10 minutes in the future')
    }

    publishBody.publish_time = unixTimestamp
  }

  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(publishBody)
  })

  if (!publishResponse.ok) {
    const error = await publishResponse.json()
    throw new Error(`Failed to publish: ${error.error?.message || 'Unknown error'}`)
  }

  const publishData = await publishResponse.json()

  // Obter permalink (se publicado imediatamente)
  let permalink: string | undefined

  if (!scheduleTime && publishData.id) {
    try {
      const permalinkUrl = `${GRAPH_API_BASE}/${publishData.id}?fields=permalink&access_token=${accessToken}`
      const permalinkResponse = await fetch(permalinkUrl)

      if (permalinkResponse.ok) {
        const permalinkData = await permalinkResponse.json()
        permalink = permalinkData.permalink
      }
    } catch (err) {
      // Ignorar erro de permalink
      console.error('Failed to fetch permalink:', err)
    }
  }

  return {
    status: scheduleTime ? 'scheduled' : 'published',
    mediaId: publishData.id,
    permalink
  }
}

/**
 * Obter token de longa duração (60 dias)
 * Deve ser chamado logo após exchangeCodeForToken
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<InstagramAuthTokens> {
  const appId = process.env.FACEBOOK_APP_ID!
  const appSecret = process.env.FACEBOOK_APP_SECRET!

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('client_secret', appSecret)
  url.searchParams.set('fb_exchange_token', shortLivedToken)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to exchange for long-lived token: ${error.error?.message || 'Unknown error'}`)
  }

  return await response.json()
}

/**
 * Validar se o token ainda é válido
 */
export async function validateAccessToken(
  accessToken: string
): Promise<boolean> {
  try {
    const url = `${GRAPH_API_BASE}/me?access_token=${accessToken}`
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Calcular data de expiração do token (60 dias a partir de agora)
 */
export function calculateTokenExpiration(): Date {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + 60) // 60 dias
  return expirationDate
}
