/**
 * Script de teste - Criar análise na fila
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestAnalysis() {
  const username = 'rodrigogunter_'

  console.log(`🎯 Criando análise de teste para @${username}...`)
  console.log('')

  const { data, error } = await supabase
    .from('analysis_queue')
    .insert({
      username,
      post_limit: 10,
      skip_ocr: false,
      audit_type: 'express',
      status: 'pending',
      progress: 0,
      priority: 5
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Erro ao criar análise:', error)
    process.exit(1)
  }

  console.log('✅ Análise criada com sucesso!')
  console.log('')
  console.log('📋 Detalhes:')
  console.log(`   Queue ID: ${data.id}`)
  console.log(`   Username: @${data.username}`)
  console.log(`   Posts: ${data.post_limit}`)
  console.log(`   Skip OCR: ${data.skip_ocr}`)
  console.log(`   Status: ${data.status}`)
  console.log('')
  console.log('⏳ O worker processará automaticamente...')
  console.log('')
  console.log('Para acompanhar:')
  console.log(`   tail -f /tmp/worker-output.log`)
}

createTestAnalysis()
