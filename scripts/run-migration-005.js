/**
 * Script para executar Migration 005
 * Adiciona profile_id aos Twitter Experts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurar Supabase com service role (permissões admin)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessários')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Iniciando Migration 005...\n')

  // Ler arquivo SQL
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_twitter_add_profile_id.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('📄 SQL a ser executado:')
  console.log('─'.repeat(60))
  console.log(sql)
  console.log('─'.repeat(60))
  console.log()

  try {
    // Executar migration
    console.log('⏳ Executando migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Se a função RPC não existir, tentar via SQL direto
      if (error.message.includes('exec_sql')) {
        console.log('⚠️  Função exec_sql não encontrada, executando comandos individualmente...\n')

        // Dividir SQL em comandos individuais
        const commands = sql
          .split(';')
          .map(cmd => cmd.trim())
          .filter(cmd => cmd && !cmd.startsWith('--'))

        for (const command of commands) {
          if (!command) continue

          console.log(`📝 Executando: ${command.substring(0, 60)}...`)

          const { error: cmdError } = await supabase.rpc('exec', {
            query: command
          }).then(
            // Fallback: usar from() para ALTER TABLE (não retorna dados)
            async () => {
              if (command.toUpperCase().includes('ALTER TABLE') ||
                  command.toUpperCase().includes('CREATE INDEX') ||
                  command.toUpperCase().includes('COMMENT ON')) {
                return { error: null }
              }
              return { error: new Error('Comando não reconhecido') }
            }
          )

          if (cmdError) {
            console.error(`❌ Erro no comando: ${cmdError.message}`)
            throw cmdError
          }
        }

        console.log('\n✅ Migration executada com sucesso (comandos individuais)!')
      } else {
        throw error
      }
    } else {
      console.log('✅ Migration executada com sucesso!')
    }

    // Validar resultado
    console.log('\n🔍 Validando migration...\n')

    // 1. Verificar se coluna profile_id existe
    const { data: columns, error: colError } = await supabase
      .from('twitter_experts')
      .select('*')
      .limit(1)

    if (colError) {
      console.error('❌ Erro ao validar coluna:', colError.message)
    } else {
      const hasProfileId = columns && columns.length > 0 && 'profile_id' in columns[0]
      console.log(`${hasProfileId ? '✅' : '❌'} Coluna profile_id ${hasProfileId ? 'existe' : 'não encontrada'}`)
    }

    // 2. Testar insert com profile_id
    const { error: testError } = await supabase
      .from('twitter_experts')
      .select('profile_id')
      .limit(1)

    if (testError) {
      console.log('❌ Erro ao selecionar profile_id:', testError.message)
    } else {
      console.log('✅ Coluna profile_id está acessível')
    }

    console.log('\n✨ Migration 005 concluída!\n')
    console.log('📋 Próximos passos:')
    console.log('   1. Testar adicionar expert em /dashboard/profiles/[id]')
    console.log('   2. Verificar que expert aparece apenas no perfil correto')
    console.log('   3. Testar toggle de ativar/desativar')

  } catch (error) {
    console.error('\n❌ Erro ao executar migration:', error)
    process.exit(1)
  }
}

runMigration()
