#!/usr/bin/env node
/**
 * Analysis Worker
 *
 * Worker que monitora a tabela analysis_queue e processa análises pendentes
 *
 * Uso:
 *   npm run worker
 *   node --loader ts-node/esm worker/analysis-worker.ts
 */

import { createClient } from '@supabase/supabase-js'
import {
  runInstagramScraper,
  runOCRAnalysis,
  runCompleteAnalysis,
  runAuditWithSquad,
  readAnalysisResult,
  calculateProgress
} from '../lib/worker-utils'
import { saveCompleteAnalysis } from '../lib/supabase-saver'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

const POLL_INTERVAL = 5000 // 5 segundos
const MAX_RETRIES = 3

interface QueueItem {
  id: string
  username: string
  post_limit: number
  skip_ocr: boolean
  audit_type: string
  priority: number
  retry_count: number
}

/**
 * Atualiza status da análise na queue
 */
async function updateQueueStatus(
  queueId: string,
  updates: {
    status?: string
    progress?: number
    current_phase?: string
    error_message?: string
    profile_id?: string
    audit_id?: string
    started_at?: string
    completed_at?: string
  }
) {
  const { error } = await supabase
    .from('analysis_queue')
    .update(updates)
    .eq('id', queueId)

  if (error) {
    console.error(`[Worker] Erro ao atualizar queue ${queueId}:`, error)
  }
}

/**
 * Incrementa contador de retry
 */
async function incrementRetry(queueId: string) {
  const { data } = await supabase
    .from('analysis_queue')
    .select('retry_count')
    .eq('id', queueId)
    .single()

  const retryCount = (data?.retry_count || 0) + 1

  await supabase
    .from('analysis_queue')
    .update({ retry_count: retryCount })
    .eq('id', queueId)

  return retryCount
}

/**
 * Processa uma análise individual
 */
async function processAnalysis(item: QueueItem): Promise<void> {
  const { id, username, post_limit, skip_ocr } = item

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔄 PROCESSANDO ANÁLISE: @${username}`)
  console.log(`   Queue ID: ${id}`)
  console.log(`   Posts: ${post_limit} | Skip OCR: ${skip_ocr}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    // Marcar como em processamento
    await updateQueueStatus(id, {
      status: 'processing',
      progress: 0,
      current_phase: 'scraping',
      started_at: new Date().toISOString()
    })

    // FASE 1: Scraping de posts + comentários
    console.log('📸 FASE 1/3: Scraping de posts e comentários...\n')
    await updateQueueStatus(id, {
      current_phase: 'scraping',
      progress: calculateProgress('scraping')
    })

    const scrapingResult = await runInstagramScraper(username, post_limit, 50)

    if (!scrapingResult.success) {
      throw new Error(`Scraping falhou: ${scrapingResult.error}`)
    }

    console.log('\n✅ Scraping concluído!')

    // FASE 2: OCR com Gemini Vision
    console.log('\n🔍 FASE 2/3: Análise OCR com Gemini Vision...\n')
    await updateQueueStatus(id, {
      current_phase: 'ocr',
      progress: calculateProgress('ocr')
    })

    const ocrResult = await runOCRAnalysis(username, skip_ocr)

    if (!ocrResult.success && !skip_ocr) {
      console.warn('⚠️  OCR falhou, mas continuando com análise...')
    } else {
      console.log('\n✅ OCR concluído!')
    }

    // FASE 3: Extração completa (posts + comentários + perfil)
    console.log('\n📊 FASE 3/4: Gerando análise completa...\n')
    await updateQueueStatus(id, {
      current_phase: 'analysis',
      progress: 60
    })

    const analysisResult = await runCompleteAnalysis(username, skip_ocr, post_limit)

    if (!analysisResult.success) {
      throw new Error(`Análise completa falhou: ${analysisResult.error}`)
    }

    console.log('\n✅ Análise completa gerada!')

    // FASE 4: Auditoria com 5 auditores (Claude API)
    console.log('\n🔬 FASE 4/4: Auditoria com 5 auditores...\n')
    await updateQueueStatus(id, {
      current_phase: 'audit',
      progress: calculateProgress('audit')
    })

    // Buscar profile_id para carregar contexto
    const { data: profileData } = await supabase
      .from('instagram_profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    const profileId = profileData?.id

    if (profileId) {
      console.log('📚 Profile ID encontrado, contexto será carregado pelo audit script')
    }

    const auditResult = await runAuditWithSquad(username, profileId)

    if (!auditResult.success) {
      throw new Error(`Auditoria com squad falhou: ${auditResult.error}`)
    }

    console.log('\n✅ Auditoria concluída!')

    // FASE 5: Salvar no Supabase
    console.log('\n💾 FASE 5/5: Salvando dados no Supabase...\n')
    await updateQueueStatus(id, {
      current_phase: 'saving',
      progress: calculateProgress('saving')
    })

    const analysisData = await readAnalysisResult(username)

    const saveResult = await saveCompleteAnalysis(analysisData)

    console.log('\n✅ Dados salvos no Supabase!')

    // CONCLUSÃO: Marcar como completo
    await updateQueueStatus(id, {
      status: 'completed',
      progress: 100,
      current_phase: 'completed',
      profile_id: saveResult.profile_id,
      audit_id: saveResult.audit_id,
      completed_at: new Date().toISOString()
    })

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ ANÁLISE CONCLUÍDA: @${username}`)
    console.log(`   Audit ID: ${saveResult.audit_id}`)
    console.log(`   Posts: ${saveResult.posts_count}`)
    console.log(`   Comentários: ${saveResult.comments_count}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error: any) {
    console.error(`\n❌ ERRO na análise de @${username}:`, error.message)

    // Verificar se deve retry
    const retryCount = await incrementRetry(id)

    if (retryCount < MAX_RETRIES) {
      console.log(`⚠️  Tentativa ${retryCount}/${MAX_RETRIES}, retornando para fila...`)

      await updateQueueStatus(id, {
        status: 'pending',
        error_message: error.message,
        current_phase: 'error',
        progress: 0
      })
    } else {
      console.log(`❌ Máximo de tentativas atingido (${MAX_RETRIES}), marcando como failed`)

      await updateQueueStatus(id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
    }
  }
}

/**
 * Busca próximo item da fila (por prioridade)
 */
async function getNextQueueItem(): Promise<QueueItem | null> {
  // Primeiro, tentar pegar item pending
  let { data, error } = await supabase
    .from('analysis_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', MAX_RETRIES)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  // Se não achou pending, buscar análises travadas em processing há mais de 10 minutos
  if (!data && !error) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const result = await supabase
      .from('analysis_queue')
      .select('*')
      .eq('status', 'processing')
      .lt('retry_count', MAX_RETRIES)
      .lt('started_at', tenMinutesAgo)
      .order('started_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    data = result.data
    error = result.error

    if (data) {
      console.log(`⚠️  Reprocessando análise travada: @${data.username}`)
    }
  }

  if (error) {
    console.error('[Worker] Erro ao buscar fila:', error)
    return null
  }

  return data as QueueItem | null
}

/**
 * Loop principal do worker
 */
async function workerLoop() {
  console.log('🤖 Analysis Worker iniciado')
  console.log(`📊 Monitorando fila a cada ${POLL_INTERVAL / 1000}s...`)
  console.log(`🔄 Máximo de ${MAX_RETRIES} tentativas por análise\n`)

  while (true) {
    try {
      const nextItem = await getNextQueueItem()

      if (nextItem) {
        await processAnalysis(nextItem)
      } else {
        // Aguardar próximo poll
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
      }
    } catch (error: any) {
      console.error('[Worker] Erro no loop principal:', error)
      // Aguardar antes de retry
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL * 2))
    }
  }
}

// Iniciar worker
workerLoop().catch((error) => {
  console.error('❌ Worker crashed:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Worker interrompido pelo usuário')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Worker terminado')
  process.exit(0)
})
