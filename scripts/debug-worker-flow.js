#!/usr/bin/env node

/**
 * Debug do fluxo completo do worker
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
  console.log('═══════════════════════════════════════════════════════')
  console.log('  🔍 DEBUG: Fluxo completo do worker')
  console.log('═══════════════════════════════════════════════════════\n')

  // Verificar se há análises na fila
  const { data: queueItems, error: queueError } = await supabase
    .from('analysis_queue')
    .select('*')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(5)

  if (queueError) {
    console.log('❌ Erro ao buscar fila:', queueError.message)
    return
  }

  if (!queueItems || queueItems.length === 0) {
    console.log('ℹ️  Nenhuma análise com status "failed" encontrada\n')
    console.log('Verificando todas as análises recentes...\n')

    const { data: allQueue } = await supabase
      .from('analysis_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (allQueue && allQueue.length > 0) {
      console.log('📋 Últimas 5 análises:\n')
      allQueue.forEach((item, i) => {
        console.log(`${i + 1}. @${item.username}`)
        console.log(`   Status: ${item.status}`)
        console.log(`   Erro: ${item.error_message || 'nenhum'}`)
        console.log(`   Progress: ${item.progress}%`)
        console.log(`   Fase: ${item.current_phase || 'n/a'}`)
        console.log(`   Created: ${new Date(item.created_at).toLocaleString('pt-BR')}`)
        console.log('')
      })
    } else {
      console.log('⚠️  Nenhuma análise encontrada na fila\n')
    }
    return
  }

  console.log(`📋 Encontradas ${queueItems.length} análises com erro:\n`)

  queueItems.forEach((item, i) => {
    console.log(`${i + 1}. @${item.username}`)
    console.log(`   Queue ID: ${item.id}`)
    console.log(`   Status: ${item.status}`)
    console.log(`   Fase: ${item.current_phase || 'n/a'}`)
    console.log(`   Erro: ${item.error_message || 'nenhum'}`)
    console.log(`   Tentativas: ${item.retry_count}`)
    console.log(`   Created: ${new Date(item.created_at).toLocaleString('pt-BR')}`)
    console.log('')
  })

  // Analisar o erro mais recente
  const latestFailed = queueItems[0]
  console.log('─────────────────────────────────────────────────────\n')
  console.log('🔍 Análise detalhada da falha mais recente:\n')
  console.log(`Username: @${latestFailed.username}`)
  console.log(`Erro: ${latestFailed.error_message}`)
  console.log(`Fase onde falhou: ${latestFailed.current_phase}`)
  console.log(`Progress: ${latestFailed.progress}%\n`)

  if (latestFailed.error_message?.includes('No posts were saved')) {
    console.log('⚠️  ERRO IDENTIFICADO: "No posts were saved"\n')
    console.log('Possíveis causas:\n')
    console.log('1. Scraping retornou array vazio de posts')
    console.log('2. Posts estão em formato inválido')
    console.log('3. INSERT na tabela posts falhou silenciosamente\n')

    console.log('Verificando dados de análise...\n')

    // Verificar se há arquivos de análise salvos
    const analysisDir = path.join(process.cwd(), 'squad-auditores', 'data')
    const analysisFile = path.join(analysisDir, `${latestFailed.username}-complete-analysis.json`)

    if (fs.existsSync(analysisFile)) {
      console.log(`✅ Arquivo de análise encontrado: ${analysisFile}\n`)

      try {
        const analysisData = JSON.parse(fs.readFileSync(analysisFile, 'utf-8'))

        console.log('📊 Conteúdo da análise:')
        console.log(`   Username: ${analysisData.username || 'n/a'}`)
        console.log(`   Profile: ${analysisData.profile ? 'existe' : 'não existe'}`)
        console.log(`   Posts: ${analysisData.posts ? analysisData.posts.length : 0} posts`)
        console.log(`   Metrics: ${analysisData.metrics ? 'existe' : 'não existe'}`)
        console.log(`   Audit: ${analysisData.audit ? 'existe' : 'não existe'}\n`)

        if (analysisData.posts && analysisData.posts.length > 0) {
          console.log('📝 Estrutura do primeiro post:')
          console.log(JSON.stringify(analysisData.posts[0], null, 2).substring(0, 500))
          console.log('...\n')
        } else {
          console.log('❌ Array de posts está VAZIO ou não existe!\n')
          console.log('Isso explica o erro "No posts were saved".')
          console.log('O scraping pode ter falhado ou retornado dados em formato inesperado.\n')
        }

      } catch (error) {
        console.log('❌ Erro ao ler arquivo de análise:', error.message)
      }
    } else {
      console.log(`⚠️  Arquivo de análise não encontrado em: ${analysisFile}\n`)
    }
  }

  console.log('─────────────────────────────────────────────────────\n')
  console.log('💡 PRÓXIMOS PASSOS:\n')
  console.log('1. Verificar logs completos do worker (se estiver rodando)')
  console.log('2. Checar arquivo de análise em squad-auditores/data/')
  console.log('3. Verificar se o scraping está retornando posts')
  console.log('4. Testar criar análise novamente no dashboard\n')
}

main().catch(console.error)
