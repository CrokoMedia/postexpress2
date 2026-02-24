#!/usr/bin/env node

/**
 * Verifica triggers e functions relacionadas à tabela audits
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
  console.log('🔍 Investigando triggers e functions da tabela audits...\n')

  console.log('Execute estas queries no SQL Editor do Supabase:\n')
  console.log('═══════════════════════════════════════════════════════\n')

  console.log('1️⃣  Ver todos os triggers da tabela audits:\n')
  console.log('```sql')
  console.log(`SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'audits';`)
  console.log('```\n')

  console.log('─────────────────────────────────────────────────────\n')

  console.log('2️⃣  Ver código da função increment_profile_audits:\n')
  console.log('```sql')
  console.log(`SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%profile%'
  AND routine_type = 'FUNCTION';`)
  console.log('```\n')

  console.log('─────────────────────────────────────────────────────\n')

  console.log('3️⃣  Ver código completo da função increment_profile_audits:\n')
  console.log('```sql')
  console.log(`SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'increment_profile_audits';`)
  console.log('```\n')

  console.log('═══════════════════════════════════════════════════════\n')
  console.log('📋 POSSÍVEL CAUSA DO ERRO:\n')
  console.log('O trigger increment_profile_audits() pode estar tentando')
  console.log('atualizar a tabela "profiles" (antiga) em vez de')
  console.log('"instagram_profiles" (nova).\n')
  console.log('Se for esse o caso, a solução está em:')
  console.log('database/migration-fix-triggers.sql\n')
}

main().catch(console.error)
