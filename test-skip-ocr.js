/**
 * Teste rápido - Análise SEM OCR
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const username = 'rodrigogunter_'

console.log(`🚀 Criando análise RÁPIDA (sem OCR) para @${username}...`)
console.log('')

const { data, error } = await supabase
  .from('analysis_queue')
  .insert({
    username,
    post_limit: 5,  // Apenas 5 posts para ser mais rápido
    skip_ocr: true,  // PULAR OCR
    audit_type: 'express',
    status: 'pending',
    progress: 0,
    priority: 10  // Alta prioridade
  })
  .select()
  .single()

if (error) {
  console.error('❌ Erro:', error)
  process.exit(1)
}

console.log('✅ Análise criada!')
console.log('')
console.log(`Queue ID: ${data.id}`)
console.log(`Posts: 5 (reduzido para teste)`)
console.log(`Skip OCR: SIM ✅`)
console.log('')
console.log('⏱️  Tempo estimado: 2-3 minutos')
console.log('')
console.log('Inicie o worker:')
console.log('  npm run worker')
