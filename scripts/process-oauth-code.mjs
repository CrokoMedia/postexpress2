/**
 * Script para processar código OAuth manualmente
 *
 * USO:
 * node scripts/process-oauth-code.mjs <CODE> <PROFILE_ID>
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar .env
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APP_ID = process.env.FACEBOOK_APP_ID
const APP_SECRET = process.env.FACEBOOK_APP_SECRET
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI

async function processOAuthCode(code, profileId) {
  console.log('🔄 Processando código OAuth...')
  console.log('📋 Code:', code.substring(0, 20) + '...')
  console.log('📋 Profile ID:', profileId)

  try {
    // 1. Trocar code por access token
    console.log('\n1️⃣ Trocando code por access token...')

    const tokenUrl = 'https://api.instagram.com/oauth/access_token'

    const formData = new URLSearchParams()
    formData.append('client_id', APP_ID)
    formData.append('client_secret', APP_SECRET)
    formData.append('grant_type', 'authorization_code')
    formData.append('redirect_uri', REDIRECT_URI)
    formData.append('code', code)

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Erro ao trocar code: ${error}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Token obtido!')
    console.log('📋 User ID:', tokenData.user_id)

    const accessToken = tokenData.access_token
    const instagramUserId = tokenData.user_id

    // 2. Trocar por long-lived token (60 dias)
    console.log('\n2️⃣ Trocando por long-lived token...')

    const longLivedUrl = new URL('https://graph.instagram.com/access_token')
    longLivedUrl.searchParams.set('grant_type', 'ig_exchange_token')
    longLivedUrl.searchParams.set('client_secret', APP_SECRET)
    longLivedUrl.searchParams.set('access_token', accessToken)

    const longLivedResponse = await fetch(longLivedUrl)

    if (!longLivedResponse.ok) {
      const error = await longLivedResponse.text()
      console.warn('⚠️ Não conseguiu trocar por long-lived token:', error)
      console.log('ℹ️ Continuando com short-lived token...')
    } else {
      const longLivedData = await longLivedResponse.json()
      console.log('✅ Long-lived token obtido!')
      console.log('📋 Expira em:', longLivedData.expires_in, 'segundos')
    }

    // 3. Salvar no Supabase
    console.log('\n3️⃣ Salvando no Supabase...')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60) // 60 dias

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_account_id: instagramUserId,
        instagram_access_token: accessToken,
        instagram_token_expires_at: expiresAt.toISOString(),
        instagram_connected: true,
        instagram_connected_at: new Date().toISOString()
      })
      .eq('id', profileId)

    if (updateError) {
      throw new Error(`Erro ao salvar no Supabase: ${updateError.message}`)
    }

    console.log('✅ Salvo no Supabase!')
    console.log('\n🎉 SUCESSO! Instagram conectado!')
    console.log('📋 Profile ID:', profileId)
    console.log('📋 Instagram User ID:', instagramUserId)
    console.log('📋 Token expira em:', expiresAt.toLocaleDateString('pt-BR'))

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    process.exit(1)
  }
}

// Executar
const code = process.argv[2]
const profileId = process.argv[3]

if (!code || !profileId) {
  console.error('❌ Uso: node scripts/process-oauth-code.mjs <CODE> <PROFILE_ID>')
  process.exit(1)
}

processOAuthCode(code, profileId)
