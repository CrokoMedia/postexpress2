#!/usr/bin/env node

/**
 * Verifica estrutura da tabela posts
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
  console.log('🔍 Verificando tabela posts...\n')

  // Verificar se a tabela existe
  const { data: existingPosts, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .limit(1)

  if (fetchError) {
    if (fetchError.message.includes('does not exist')) {
      console.log('❌ Tabela "posts" NÃO EXISTE!')
      console.log('\nExecute no SQL Editor:\n')
      console.log('Ver schema completo em: database/optimized-schema.sql')
      console.log('Procure por "CREATE TABLE posts" e execute a criação.\n')
      return
    }

    console.log('❌ Erro ao buscar posts:', fetchError.message)
    console.log(fetchError)
    return
  }

  console.log(`✅ Tabela "posts" existe`)

  if (existingPosts && existingPosts.length > 0) {
    console.log('\n📋 Colunas encontradas:')
    console.log(Object.keys(existingPosts[0]).join(', '))

    if (!existingPosts[0].id) {
      console.log('\n❌ PROBLEMA: Coluna "id" não existe na tabela posts!')
    } else {
      console.log('\n✅ Coluna "id" existe')
    }
  } else {
    console.log('\n⚠️  Tabela "posts" existe mas está vazia')
    console.log('Tentando inserir registro de teste...\n')

    // Primeiro precisa de uma auditoria
    const { data: profile } = await supabase
      .from('instagram_profiles')
      .select('id')
      .limit(1)
      .single()

    if (!profile) {
      console.log('⚠️  Nenhum perfil encontrado para teste')
      return
    }

    // Criar auditoria de teste
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        profile_id: profile.id,
        posts_analyzed: 0,
        score_overall: 0
      })
      .select()
      .single()

    if (auditError) {
      console.log('❌ Erro ao criar auditoria de teste:', auditError.message)
      return
    }

    console.log(`✅ Auditoria de teste criada: ${audit.id}`)

    // Tentar inserir post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        audit_id: audit.id,
        post_url: 'https://instagram.com/p/test',
        post_type: 'Image',
        likes_count: 0,
        comments_count: 0
      })
      .select()
      .single()

    if (postError) {
      console.log('❌ Erro ao inserir post:', postError.message)
      console.log('\nDetalhes:', postError)

      // Limpar auditoria de teste
      await supabase.from('audits').delete().eq('id', audit.id)
      return
    }

    console.log('✅ Post criado com sucesso!')
    console.log(`   ID: ${post.id}`)

    // Limpar dados de teste
    await supabase.from('posts').delete().eq('id', post.id)
    await supabase.from('audits').delete().eq('id', audit.id)
    console.log('\n✅ Dados de teste removidos')
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('Execute no SQL Editor para ver estrutura completa:')
  console.log('═══════════════════════════════════════════════════════\n')
  console.log('```sql')
  console.log('SELECT column_name, data_type, is_nullable, column_default')
  console.log('FROM information_schema.columns')
  console.log("WHERE table_name = 'posts'")
  console.log('ORDER BY ordinal_position;')
  console.log('```\n')
}

main().catch(console.error)
