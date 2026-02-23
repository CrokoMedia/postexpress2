/**
 * Script para salvar token manual do Instagram
 *
 * USO:
 * node scripts/save-manual-token.mjs <ACCESS_TOKEN> <INSTAGRAM_USER_ID> <PROFILE_ID>
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar .env
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function saveManualToken(accessToken, instagramUserId, profileId) {
  console.log('🔄 Salvando token manual...')
  console.log('📋 Instagram User ID:', instagramUserId)
  console.log('📋 Profile ID:', profileId)

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Token manual do Facebook geralmente expira em 60 dias
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60)

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

    console.log('\n✅ Token salvo no Supabase!')
    console.log('🎉 Instagram conectado com sucesso!')
    console.log('📋 Token expira em:', expiresAt.toLocaleDateString('pt-BR'))
    console.log('\n💡 Agora você pode publicar carrosséis no Instagram!')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    process.exit(1)
  }
}

// Executar
const accessToken = process.argv[2]
const instagramUserId = process.argv[3]
const profileId = process.argv[4]

if (!accessToken || !instagramUserId || !profileId) {
  console.error('❌ Uso: node scripts/save-manual-token.mjs <ACCESS_TOKEN> <INSTAGRAM_USER_ID> <PROFILE_ID>')
  console.error('Exemplo: node scripts/save-manual-token.mjs IGAAM6hig... 17841464000347350 uuid-do-perfil')
  process.exit(1)
}

saveManualToken(accessToken, instagramUserId, profileId)
