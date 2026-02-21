/**
 * Run Migration 006: Profile Context
 *
 * Adiciona sistema de contexto personalizado por perfil
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function runMigration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📦 MIGRATION 006: PROFILE CONTEXT')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const sqlPath = path.join(__dirname, '../database/migrations/006_profile_context.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📄 Lendo migration SQL...')
    console.log(`   Arquivo: ${sqlPath}`)
    console.log(`   Tamanho: ${sql.length} bytes\n`)

    console.log('⚠️  ATENÇÃO: Execute esta migration via SQL Editor do Supabase')
    console.log('   URL: https://supabase.com/dashboard\n')
    console.log('📋 Copie o SQL de: database/migrations/006_profile_context.sql\n')

    console.log('Aguardando confirmação...')
    console.log('Pressione CTRL+C para cancelar ou aguarde 5s para verificar...\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    // Tentar verificar se a tabela já existe
    const { data, error } = await supabase
      .from('profile_context')
      .select('count')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Tabela profile_context ainda não existe')
        console.log('   Execute a migration manualmente via SQL Editor\n')
        process.exit(1)
      }
      throw error
    }

    console.log('✅ Tabela profile_context detectada!\n')

    // Verificar view
    const { data: viewData, error: viewError } = await supabase
      .from('profiles_with_context')
      .select('username, has_context')
      .limit(5)

    if (viewError) {
      console.log('⚠️  View profiles_with_context pode não ter sido criada')
    } else {
      console.log(`✅ View profiles_with_context ativa (${viewData.length} perfis)`)
      viewData.forEach(p => {
        console.log(`   • @${p.username} - Contexto: ${p.has_context ? '✅' : '❌'}`)
      })
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ MIGRATION 006 VERIFICADA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('📋 Próximos passos:')
    console.log('   1. Criar API /api/profiles/[id]/context')
    console.log('   2. Criar modal de adicionar contexto')
    console.log('   3. Integrar com audit-with-squad.js')
    console.log('   4. Integrar com content-creation-squad\n')

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.error('\n📋 Execute manualmente via SQL Editor do Supabase')
    console.error('   Consulte: database/RUN-MIGRATION-006.md\n')
    process.exit(1)
  }
}

runMigration()
