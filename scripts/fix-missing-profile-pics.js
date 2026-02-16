/**
 * Fix Missing Profile Pictures
 *
 * Atualiza perfis no banco com fotos que estão nos arquivos de análise
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
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

const DATA_DIR = 'squad-auditores/data'

async function fixMissingProfilePics() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 CORRIGINDO FOTOS DE PERFIL AUSENTES')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // 1. Buscar perfis sem foto
    const { data: profilesWithoutPic, error: queryError } = await supabase
      .from('profiles')
      .select('id, username')
      .is('profile_pic_url_hd', null)
      .is('deleted_at', null)

    if (queryError) throw queryError

    if (!profilesWithoutPic || profilesWithoutPic.length === 0) {
      console.log('✅ Todos os perfis já têm foto salva!\n')
      return
    }

    console.log(`📋 ${profilesWithoutPic.length} perfis sem foto encontrados:\n`)

    let fixed = 0
    let notFound = 0
    let errors = 0

    for (const profile of profilesWithoutPic) {
      console.log(`🔍 Processando @${profile.username}...`)

      // Procurar arquivo de análise completa
      const analysisFile = path.join(DATA_DIR, `${profile.username}-complete-analysis.json`)

      if (!fs.existsSync(analysisFile)) {
        console.log(`   ⚠️  Arquivo de análise não encontrado`)
        notFound++
        continue
      }

      // Ler dados do arquivo
      const fileContent = fs.readFileSync(analysisFile, 'utf-8')
      const analysisData = JSON.parse(fileContent)

      const profileData = analysisData.profile

      if (!profileData || (!profileData.profilePicUrlHD && !profileData.profilePicUrl)) {
        console.log(`   ⚠️  Foto não encontrada no arquivo de análise`)
        notFound++
        continue
      }

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_pic_url: profileData.profilePicUrl || null,
          profile_pic_url_hd: profileData.profilePicUrlHD || null,
          // Aproveitar para atualizar outros campos também
          full_name: profileData.fullName || null,
          biography: profileData.biography || null,
          followers_count: profileData.followersCount || null,
          following_count: profileData.followsCount || null,
          posts_count: profileData.postsCount || null,
          url: profileData.url || null,
          is_verified: profileData.verified || false,
          is_business_account: profileData.isBusinessAccount || false,
          business_category: profileData.businessCategoryName || null
        })
        .eq('id', profile.id)

      if (updateError) {
        console.log(`   ❌ Erro ao atualizar: ${updateError.message}`)
        errors++
        continue
      }

      console.log(`   ✅ Foto atualizada com sucesso!`)
      if (profileData.profilePicUrlHD) {
        console.log(`      ${profileData.profilePicUrlHD.substring(0, 60)}...`)
      }
      fixed++
    }

    // Resumo
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RESUMO DA CORREÇÃO')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`   ✅ Corrigidos: ${fixed}`)
    console.log(`   ⚠️  Não encontrados: ${notFound}`)
    console.log(`   ❌ Erros: ${errors}`)
    console.log('')

    if (fixed > 0) {
      console.log('🎉 Fotos atualizadas com sucesso!')
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    process.exit(1)
  }
}

fixMissingProfilePics()
