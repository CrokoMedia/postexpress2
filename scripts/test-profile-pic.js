/**
 * Test Profile Picture in Database
 *
 * Verifica se as fotos de perfil estão sendo salvas corretamente no Supabase
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function testProfilePics() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 VERIFICANDO FOTOS DE PERFIL NO BANCO')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Buscar todos os perfis
    const { data: profiles, error } = await supabase
      .from('instagram_profiles')
      .select('username, profile_pic_url, profile_pic_url_hd, profile_pic_cloudinary_url')
      .is('deleted_at', null)
      .order('last_scraped_at', { ascending: false })
      .limit(10)

    if (error) throw error

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  Nenhum perfil encontrado no banco\n')
      return
    }

    console.log(`📊 ${profiles.length} perfis encontrados:\n`)

    profiles.forEach((profile, idx) => {
      console.log(`[${idx + 1}] @${profile.username}`)
      console.log(`    profile_pic_url: ${profile.profile_pic_url ? '✅ SIM' : '❌ NÃO'}`)
      console.log(`    profile_pic_url_hd: ${profile.profile_pic_url_hd ? '✅ SIM' : '❌ NÃO'}`)
      console.log(`    profile_pic_cloudinary_url: ${profile.profile_pic_cloudinary_url ? '✅ SIM' : '❌ NÃO'}`)

      if (profile.profile_pic_url_hd) {
        console.log(`    URL: ${profile.profile_pic_url_hd.substring(0, 80)}...`)
      }
      console.log('')
    })

    // Estatísticas
    const withPicUrl = profiles.filter(p => p.profile_pic_url).length
    const withPicUrlHD = profiles.filter(p => p.profile_pic_url_hd).length
    const withCloudinary = profiles.filter(p => p.profile_pic_cloudinary_url).length

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📈 ESTATÍSTICAS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`   profile_pic_url: ${withPicUrl}/${profiles.length} (${Math.round(withPicUrl/profiles.length*100)}%)`)
    console.log(`   profile_pic_url_hd: ${withPicUrlHD}/${profiles.length} (${Math.round(withPicUrlHD/profiles.length*100)}%)`)
    console.log(`   profile_pic_cloudinary_url: ${withCloudinary}/${profiles.length} (${Math.round(withCloudinary/profiles.length*100)}%)`)
    console.log('')

    if (withPicUrlHD === 0) {
      console.log('❌ PROBLEMA: Nenhum perfil tem profile_pic_url_hd salvo!')
      console.log('   Possíveis causas:')
      console.log('   1. Campo não está sendo salvo pelo supabase-saver.ts')
      console.log('   2. Dados do scraper não estão sendo passados corretamente')
      console.log('   3. Migration do banco pode não ter sido aplicada')
    } else if (withPicUrlHD < profiles.length) {
      console.log('⚠️  ATENÇÃO: Alguns perfis não têm foto salva')
      console.log('   Pode ser perfis antigos ou erro no scraping')
    } else {
      console.log('✅ TUDO OK: Todas as fotos estão sendo salvas corretamente!')
    }

    console.log('')

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
  }
}

testProfilePics()
