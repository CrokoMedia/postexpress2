#!/usr/bin/env node

/**
 * Testa INSERT + SELECT na tabela posts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Carregar .env
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('🔍 Testando INSERT na tabela posts...\n')

  // Criar auditoria de teste primeiro
  const { data: profile } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .limit(1)
    .single()

  if (!profile) {
    console.log('❌ Nenhum perfil encontrado')
    return
  }

  console.log(`📋 Perfil: @${profile.username}`)

  const { data: audit, error: auditError } = await supabase
    .from('audits')
    .insert({
      profile_id: profile.id,
      posts_analyzed: 3,
      score_overall: 75
    })
    .select()
    .single()

  if (auditError) {
    console.log('❌ Erro ao criar auditoria:', auditError.message)
    return
  }

  console.log(`✅ Auditoria criada: ${audit.id}\n`)

  // Agora tentar inserir posts
  console.log('🧪 Testando INSERT de múltiplos posts...\n')

  const postsToInsert = [
    {
      audit_id: audit.id,
      post_url: 'https://instagram.com/p/test1',
      post_type: 'Image',
      likes_count: 100,
      comments_count: 10,
      caption: 'Teste 1'
    },
    {
      audit_id: audit.id,
      post_url: 'https://instagram.com/p/test2',
      post_type: 'Sidecar',
      likes_count: 200,
      comments_count: 20,
      caption: 'Teste 2'
    },
    {
      audit_id: audit.id,
      post_url: 'https://instagram.com/p/test3',
      post_type: 'Video',
      likes_count: 300,
      comments_count: 30,
      caption: 'Teste 3'
    }
  ]

  console.log(`Inserindo ${postsToInsert.length} posts...`)

  const { data: insertedPosts, error: insertError } = await supabase
    .from('posts')
    .insert(postsToInsert)
    .select('*')

  if (insertError) {
    console.log('❌ Erro ao inserir posts:', insertError.message)
    console.log('\nDetalhes:', JSON.stringify(insertError, null, 2))

    // Limpar auditoria
    await supabase.from('audits').delete().eq('id', audit.id)
    return
  }

  console.log('\n📊 Resultado do INSERT:\n')
  console.log(`   Retornou: ${insertedPosts ? insertedPosts.length : 0} posts`)

  if (!insertedPosts || insertedPosts.length === 0) {
    console.log('\n❌ PROBLEMA: INSERT não retornou dados!')
    console.log('\nPossíveis causas:')
    console.log('1. Row Level Security (RLS) está bloqueando o SELECT')
    console.log('2. Trigger está falhando silenciosamente')
    console.log('3. Problema com .select() após .insert()\n')

    console.log('Execute no SQL Editor:\n')
    console.log('```sql')
    console.log('-- Ver RLS policies da tabela posts')
    console.log('SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual')
    console.log('FROM pg_policies')
    console.log("WHERE tablename = 'posts';")
    console.log('')
    console.log('-- Ver se os posts foram inseridos (mesmo sem retornar)')
    console.log('SELECT COUNT(*) FROM posts')
    console.log(`WHERE audit_id = '${audit.id}';`)
    console.log('```\n')
  } else {
    console.log('✅ Posts retornados com sucesso!\n')
    console.log('Estrutura do primeiro post:')
    console.log(JSON.stringify(insertedPosts[0], null, 2))
  }

  // Limpar dados de teste
  console.log('\n🧹 Limpando dados de teste...')
  if (insertedPosts && insertedPosts.length > 0) {
    for (const post of insertedPosts) {
      await supabase.from('posts').delete().eq('id', post.id)
    }
  }
  await supabase.from('audits').delete().eq('id', audit.id)
  console.log('✅ Limpeza concluída\n')
}

main().catch(console.error)
