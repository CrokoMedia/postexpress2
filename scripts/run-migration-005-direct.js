/**
 * Script para executar Migration 005 via postgres direto
 * Adiciona profile_id aos Twitter Experts
 */

import pg from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar .env
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const { Client } = pg

async function runMigration() {
  console.log('🚀 Executando Migration 005...\n')

  // Construir connection string do Supabase
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    console.error('❌ Erro: SUPABASE_URL não encontrada nas variáveis de ambiente')
    console.log('\n📋 Execute manualmente no SQL Editor do Supabase:')
    console.log('   https://supabase.com/dashboard/project/[PROJECT_ID]/sql\n')

    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_twitter_add_profile_id.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    process.exit(1)
  }

  // Extrair project ref da URL do Supabase
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
  const password = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD

  if (!password) {
    console.error('❌ Erro: Senha do banco não encontrada (SUPABASE_DB_PASSWORD ou DB_PASSWORD)')
    console.log('\n📋 Execute manualmente no SQL Editor do Supabase:')
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`)

    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_twitter_add_profile_id.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    process.exit(1)
  }

  // Connection string do Supabase
  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('✅ Conectado ao Supabase\n')

    // Ler arquivo SQL
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_twitter_add_profile_id.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 SQL a ser executado:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    console.log()

    // Executar migration
    console.log('⏳ Executando migration...')
    await client.query(sql)
    console.log('✅ Migration executada com sucesso!\n')

    // Validação
    console.log('🔍 Validando...\n')

    // Verificar coluna
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'twitter_experts'
        AND column_name = 'profile_id'
    `)

    if (result.rows.length > 0) {
      console.log('✅ Coluna profile_id criada com sucesso')
      console.log(`   Tipo: ${result.rows[0].data_type}`)
      console.log(`   Nullable: ${result.rows[0].is_nullable}`)
    } else {
      console.log('❌ Coluna profile_id não encontrada')
    }

    // Verificar constraint UNIQUE
    const constraintResult = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'twitter_experts'
        AND constraint_name = 'twitter_experts_username_profile_unique'
    `)

    if (constraintResult.rows.length > 0) {
      console.log('✅ Constraint UNIQUE composto criado')
    } else {
      console.log('❌ Constraint UNIQUE não encontrado')
    }

    // Verificar índice
    const indexResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'twitter_experts'
        AND indexname = 'idx_twitter_experts_profile_id'
    `)

    if (indexResult.rows.length > 0) {
      console.log('✅ Índice criado para performance')
    } else {
      console.log('❌ Índice não encontrado')
    }

    console.log('\n✨ Migration 005 concluída!\n')

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error.message)
    console.log('\n📋 Execute manualmente no SQL Editor do Supabase:')
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql\n`)

    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_twitter_add_profile_id.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
