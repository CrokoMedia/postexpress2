/**
 * Instagram OAuth - Início do fluxo
 * GET /api/auth/instagram?profile_id=xxx
 *
 * Redireciona para a tela de login do Facebook
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profile_id')

  if (!profileId) {
    return NextResponse.json(
      { error: 'Missing profile_id parameter' },
      { status: 400 }
    )
  }

  const appId = process.env.FACEBOOK_APP_ID
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Instagram OAuth not configured. Please set FACEBOOK_APP_ID and INSTAGRAM_REDIRECT_URI.' },
      { status: 500 }
    )
  }

  // Construir URL de autorização do Instagram Business Login
  const authUrl = new URL('https://www.instagram.com/oauth/authorize')
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish')
  authUrl.searchParams.set('state', profileId) // Passar profile_id como state
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('force_reauth', 'true')

  // Redirecionar para Facebook
  return NextResponse.redirect(authUrl.toString())
}
