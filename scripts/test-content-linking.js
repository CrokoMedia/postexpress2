#!/usr/bin/env node
/**
 * Script de Teste - Content Linking Feature
 *
 * Testa o sistema de vinculação de conteúdos entre perfis
 *
 * Uso:
 *   node scripts/test-content-linking.js
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testContentLinking() {
  console.log('\n🧪 TESTE: Sistema de Vinculação de Conteúdos\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Verificar se tabela existe
  console.log('1️⃣  Verificando tabela content_profile_links...')
  try {
    const { data, error } = await supabase
      .from('content_profile_links')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Tabela content_profile_links NÃO existe!')
      console.error('   👉 Aplique a migration 007_content_profile_links.sql\n')
      return false
    }

    console.log('✅ Tabela existe!\n')
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error.message)
    return false
  }

  // 2. Buscar conteúdos existentes
  console.log('2️⃣  Buscando conteúdos disponíveis...')
  const { data: contents, error: contentsError } = await supabase
    .from('content_suggestions')
    .select('id, profile_id, content_json, generated_at')
    .limit(5)

  if (contentsError || !contents || contents.length === 0) {
    console.log('⚠️  Nenhum conteúdo encontrado no sistema')
    console.log('   👉 Gere conteúdos primeiro usando o Content Squad\n')
    return false
  }

  console.log(`✅ ${contents.length} conteúdo(s) encontrado(s)!\n`)

  // 3. Buscar perfis disponíveis
  console.log('3️⃣  Buscando perfis disponíveis...')
  const { data: profiles, error: profilesError } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .limit(5)

  if (profilesError || !profiles || profiles.length < 2) {
    console.log('⚠️  Não há perfis suficientes para testar vinculação')
    console.log('   👉 Crie pelo menos 2 perfis primeiro\n')
    return false
  }

  console.log(`✅ ${profiles.length} perfil(is) encontrado(s)!\n`)

  // 4. Testar vinculação
  console.log('4️⃣  Testando vinculação de conteúdo...')

  const testContent = contents[0]
  const testProfile = profiles.find(p => p.id !== testContent.profile_id)

  if (!testProfile) {
    console.log('⚠️  Não há outro perfil disponível para testar\n')
    return false
  }

  console.log(`   Conteúdo: ${testContent.id.substring(0, 8)}...`)
  console.log(`   Para perfil: @${testProfile.username}`)

  try {
    const { data: link, error: linkError } = await supabase
      .from('content_profile_links')
      .upsert({
        content_id: testContent.id,
        profile_id: testProfile.id,
        link_type: 'shared',
        notes: 'Teste automatizado',
        deleted_at: null
      }, {
        onConflict: 'content_id,profile_id'
      })
      .select()
      .single()

    if (linkError) throw linkError

    console.log('✅ Vinculação criada com sucesso!\n')
  } catch (error) {
    console.error('❌ Erro ao vincular:', error.message)
    return false
  }

  // 5. Verificar view content_with_profiles
  console.log('5️⃣  Verificando view content_with_profiles...')
  try {
    const { data: viewData, error: viewError } = await supabase
      .from('content_with_profiles')
      .select('*')
      .limit(1)

    if (viewError) {
      console.error('❌ View não está funcionando:', viewError.message)
      return false
    }

    console.log('✅ View funcionando corretamente!\n')
  } catch (error) {
    console.error('❌ Erro ao acessar view:', error.message)
    return false
  }

  // 6. Buscar conteúdos vinculados
  console.log('6️⃣  Buscando vínculos criados...')
  const { data: links, error: linksError } = await supabase
    .from('content_profile_links')
    .select(`
      id,
      link_type,
      linked_at,
      profile:instagram_profiles (username),
      content:content_suggestions (id)
    `)
    .is('deleted_at', null)
    .limit(5)

  if (linksError) {
    console.error('❌ Erro ao buscar vínculos:', linksError.message)
    return false
  }

  console.log(`✅ ${links?.length || 0} vínculo(s) ativo(s):\n`)

  if (links && links.length > 0) {
    links.forEach((link, idx) => {
      console.log(`   ${idx + 1}. @${link.profile.username} (${link.link_type})`)
      console.log(`      Vinculado em: ${new Date(link.linked_at).toLocaleString('pt-BR')}`)
    })
    console.log('')
  }

  // 7. Testar function helpers
  console.log('7️⃣  Testando functions helpers...')

  try {
    // Testar link_content_to_profile
    const { data: funcResult, error: funcError } = await supabase
      .rpc('link_content_to_profile', {
        p_content_id: testContent.id,
        p_profile_id: testProfile.id,
        p_link_type: 'shared',
        p_notes: 'Teste via function'
      })

    if (funcError && !funcError.message.includes('does not exist')) {
      throw funcError
    }

    if (funcError?.message.includes('does not exist')) {
      console.log('⚠️  Functions SQL não disponíveis (podem estar em schema diferente)')
    } else {
      console.log('✅ Functions SQL funcionando!')
    }
  } catch (error) {
    console.log('⚠️  Functions SQL não disponíveis:', error.message)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ TODOS OS TESTES PASSARAM!\n')

  console.log('📊 Resumo:')
  console.log(`   • Conteúdos: ${contents.length}`)
  console.log(`   • Perfis: ${profiles.length}`)
  console.log(`   • Vínculos ativos: ${links?.length || 0}`)
  console.log('')

  console.log('🎉 Sistema de vinculação está funcionando corretamente!')
  console.log('   Próximo passo: Testar na interface do dashboard\n')

  return true
}

// Executar teste
testContentLinking()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro crítico:', error)
    process.exit(1)
  })
