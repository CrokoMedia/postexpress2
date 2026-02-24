/**
 * Upload Profile Pictures to Cloudinary
 *
 * Faz download das fotos de perfil do Instagram e upload para Cloudinary
 * para evitar problemas de CORS e URLs expiradas
 */

import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'
import https from 'https'
import http from 'http'
import 'dotenv/config'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configurar Supabase
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

/**
 * Faz upload de imagem para Cloudinary a partir de URL
 */
async function uploadToCloudinary(imageUrl, username) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'profile-pics',
      public_id: username,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    })

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    }
  } catch (error) {
    console.error(`   ❌ Erro no upload: ${error.message}`)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Processa todos os perfis
 */
async function uploadAllProfilePics() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📤 UPLOAD DE FOTOS PARA CLOUDINARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Buscar perfis que têm foto mas não têm Cloudinary URL
    const { data: profiles, error } = await supabase
      .from('instagram_profiles')
      .select('id, username, profile_pic_url_hd, profile_pic_cloudinary_url')
      .not('profile_pic_url_hd', 'is', null)
      .is('profile_pic_cloudinary_url', null)
      .is('deleted_at', null)

    if (error) throw error

    if (!profiles || profiles.length === 0) {
      console.log('✅ Todos os perfis já têm foto no Cloudinary!\n')
      return
    }

    console.log(`📋 ${profiles.length} perfis para processar:\n`)

    let uploaded = 0
    let failed = 0

    for (const profile of profiles) {
      console.log(`📸 Processando @${profile.username}...`)
      console.log(`   URL: ${profile.profile_pic_url_hd.substring(0, 60)}...`)

      // Upload para Cloudinary
      const result = await uploadToCloudinary(
        profile.profile_pic_url_hd,
        profile.username
      )

      if (result.success) {
        // Atualizar banco com URL do Cloudinary
        const { error: updateError } = await supabase
          .from('instagram_profiles')
          .update({ profile_pic_cloudinary_url: result.url })
          .eq('id', profile.id)

        if (updateError) {
          console.log(`   ❌ Erro ao atualizar banco: ${updateError.message}`)
          failed++
        } else {
          console.log(`   ✅ Upload concluído!`)
          console.log(`   🔗 ${result.url}\n`)
          uploaded++
        }
      } else {
        failed++
        console.log('')
      }

      // Delay para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Resumo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RESUMO DO UPLOAD')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`   ✅ Uploaded: ${uploaded}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📊 Total: ${profiles.length}`)
    console.log('')

    if (uploaded > 0) {
      console.log('🎉 Fotos enviadas para o Cloudinary com sucesso!')
      console.log('   As imagens agora carregarão mais rápido e não expirarão.\n')
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    process.exit(1)
  }
}

// Verificar configuração do Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary não está configurado no .env')
  console.error('   Configure: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET\n')
  process.exit(1)
}

uploadAllProfilePics()
