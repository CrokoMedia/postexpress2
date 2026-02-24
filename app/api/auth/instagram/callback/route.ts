/**
 * Instagram OAuth - Callback
 * GET /api/auth/instagram/callback?code=xxx&state=profile_id
 *
 * Recebe o code do Facebook e salva o token no Supabase
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getInstagramAccountInfo,
  calculateTokenExpiration
} from '@/lib/instagram-graph'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // profile_id
  const error = searchParams.get('error')

  // Se usuário cancelou
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/profiles/${state}?error=oauth_cancelled`
    )
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: 'Missing code or state parameter' },
      { status: 400 }
    )
  }

  const profileId = state

  try {
    const supabase = getServerSupabase()

    // 1. Trocar code por access token (curta duração)
    const shortLivedTokens = await exchangeCodeForToken(code)

    // 2. Trocar por token de longa duração (60 dias)
    const longLivedTokens = await exchangeForLongLivedToken(shortLivedTokens.access_token)

    const accessToken = longLivedTokens.access_token

    // 3. Obter Instagram Account ID e Facebook Page ID
    const accountInfo = await getInstagramAccountInfo(accessToken)

    const instagramAccountId = accountInfo.instagram_business_account.id
    const facebookPageId = accountInfo.id

    // 4. Salvar no Supabase (tabela instagram_profiles)
    const expiresAt = calculateTokenExpiration()

    const { error: updateError } = await supabase
      .from('instagram_profiles')
      .update({
        instagram_account_id: instagramAccountId,
        instagram_access_token: accessToken,
        instagram_token_expires_at: expiresAt.toISOString(),
        facebook_page_id: facebookPageId,
        instagram_connected: true,
        instagram_connected_at: new Date().toISOString()
      })
      .eq('id', profileId)

    if (updateError) {
      console.error('Failed to save Instagram tokens:', updateError)
      throw new Error('Failed to save tokens to database')
    }

    // 5. Redirecionar de volta para a página do perfil com sucesso
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/profiles/${profileId}?instagram_connected=true`
    )
  } catch (err: any) {
    console.error('Instagram OAuth error:', err)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/profiles/${state}?error=oauth_failed&message=${encodeURIComponent(err.message)}`
    )
  }
}
