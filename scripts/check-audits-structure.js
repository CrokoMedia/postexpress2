#!/usr/bin/env node

/**
 * Verifica a estrutura da tabela audits
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
  console.log('🔍 Verificando estrutura da tabela audits...\n')

  // 1. Tentar buscar um registro existente
  const { data: existingAudits, error: fetchError } = await supabase
    .from('audits')
    .select('*')
    .limit(1)

  if (fetchError) {
    console.log('❌ Erro ao buscar auditorias:', fetchError.message)
    console.log('\nDetalhes:', fetchError)
  } else {
    console.log(`✅ Consegue buscar auditorias (${existingAudits?.length || 0} encontradas)`)
    if (existingAudits && existingAudits.length > 0) {
      console.log('\n📋 Colunas existentes na tabela:')
      console.log(Object.keys(existingAudits[0]).join(', '))
    }
  }

  console.log('\n─────────────────────────────────────────────────────\n')

  // 2. Tentar inserir sem especificar `id` (deve ser gerado automaticamente)
  console.log('🧪 Teste 1: Inserir auditoria SEM especificar ID...')

  const { data: profile } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .limit(1)
    .single()

  if (!profile) {
    console.log('⚠️  Nenhum perfil encontrado')
    return
  }

  const testAudit1 = {
    profile_id: profile.id,
    audit_date: new Date().toISOString(),
    posts_analyzed: 0,
    score_overall: 0
  }

  const { data: result1, error: error1 } = await supabase
    .from('audits')
    .insert(testAudit1)
    .select()

  if (error1) {
    console.log(`❌ Erro: ${error1.message}`)
    console.log('Detalhes:', error1)
  } else {
    console.log('✅ Sucesso! ID gerado:', result1[0]?.id)
    // Limpar
    await supabase.from('audits').delete().eq('id', result1[0].id)
  }

  console.log('\n─────────────────────────────────────────────────────\n')

  // 3. Verificar se há constraint de FK
  console.log('📋 Informações sobre a tabela audits:\n')
  console.log('Execute no SQL Editor do Supabase:\n')
  console.log('```sql')
  console.log('SELECT column_name, data_type, is_nullable')
  console.log('FROM information_schema.columns')
  console.log("WHERE table_name = 'audits'")
  console.log('ORDER BY ordinal_position;')
  console.log('```\n')
}

main().catch(console.error)
