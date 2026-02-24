#!/usr/bin/env node

/**
 * Testa inserção de auditoria com triggers desabilitados
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
  console.log('  🧪 TESTE: Inserir auditoria SEM triggers')
  console.log('═══════════════════════════════════════════════════════\n')

  // Buscar perfil
  const { data: profile, error: profileError } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .limit(1)
    .single()

  if (profileError || !profile) {
    console.log('❌ Nenhum perfil encontrado em instagram_profiles')
    process.exit(1)
  }

  console.log(`📋 Perfil: @${profile.username} (${profile.id})\n`)

  // Teste 1: Inserir COM triggers (vai falhar)
  console.log('🧪 Teste 1: Inserir auditoria (COM triggers)...')

  const testData = {
    profile_id: profile.id,
    audit_date: new Date().toISOString(),
    posts_analyzed: 10,
    score_overall: 75,
    score_behavior: 80,
    score_copy: 70,
    score_offers: 75,
    score_metrics: 75,
    score_anomalies: 75
  }

  const { data: result1, error: error1 } = await supabase
    .from('audits')
    .insert(testData)
    .select()
    .single()

  if (error1) {
    console.log(`❌ ERRO (esperado): ${error1.message}\n`)
    console.log('Detalhes do erro:')
    console.log(JSON.stringify(error1, null, 2))
    console.log('\n')
  } else {
    console.log('✅ Sucesso! (inesperado)')
    // Limpar
    await supabase.from('audits').delete().eq('id', result1.id)
  }

  console.log('─────────────────────────────────────────────────────\n')
  console.log('📋 SOLUÇÃO:\n')
  console.log('Execute no SQL Editor do Supabase:\n')
  console.log('```sql')
  console.log('-- Ver triggers ativos')
  console.log('SELECT trigger_name, event_manipulation, action_statement')
  console.log('FROM information_schema.triggers')
  console.log("WHERE event_object_table = 'audits';")
  console.log('')
  console.log('-- Ver código da função que está falhando')
  console.log('SELECT pg_get_functiondef(p.oid)')
  console.log('FROM pg_proc p')
  console.log('JOIN pg_namespace n ON p.pronamespace = n.oid')
  console.log("WHERE p.proname = 'increment_profile_audits';")
  console.log('```\n')
  console.log('Depois execute a migração:')
  console.log('database/migration-fix-triggers.sql\n')
}

main().catch(console.error)
