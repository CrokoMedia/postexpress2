#!/usr/bin/env node

/**
 * Script automatizado para corrigir FK de audits
 *
 * Verifica se a tabela audits tem FK apontando para profiles (errado)
 * e corrige para apontar para instagram_profiles (correto)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Tentar carregar .env.local primeiro, depois .env
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  console.error('❌ Nenhum arquivo .env encontrado')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas')
  console.error('   Necessário: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('🔍 Verificando existência das tabelas...\n')

  // Verificar se instagram_profiles existe
  const { data: igProfiles, error: igError } = await supabase
    .from('instagram_profiles')
    .select('id')
    .limit(1)

  const instagramProfilesExists = !igError

  // Verificar se profiles existe
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  const profilesExists = !profilesError

  // Verificar se audits existe
  const { data: audits, error: auditsError } = await supabase
    .from('audits')
    .select('id')
    .limit(1)

  const auditsExists = !auditsError

  return {
    instagram_profiles: instagramProfilesExists,
    profiles: profilesExists,
    audits: auditsExists
  }
}

async function testInsertAudit() {
  console.log('🧪 Testando inserção de auditoria...\n')

  // Buscar um profile_id de instagram_profiles
  const { data: profile, error: profileError } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .limit(1)
    .single()

  if (profileError || !profile) {
    console.log('⚠️  Nenhum perfil em instagram_profiles para testar')
    return { success: false, reason: 'no_profile' }
  }

  console.log(`   Usando perfil: @${profile.username} (${profile.id})`)

  // Tentar inserir auditoria de teste
  const { data: audit, error: auditError } = await supabase
    .from('audits')
    .insert({
      profile_id: profile.id,
      audit_date: new Date().toISOString(),
      posts_analyzed: 0,
      score_overall: 0
    })
    .select()
    .single()

  if (auditError) {
    console.log(`\n❌ Erro ao inserir auditoria:\n   ${auditError.message}`)
    return { success: false, error: auditError, profile_id: profile.id }
  }

  // Deletar auditoria de teste
  await supabase
    .from('audits')
    .delete()
    .eq('id', audit.id)

  console.log('\n✅ Teste bem-sucedido! FK está funcionando corretamente.')

  return { success: true }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  🔧 DIAGNÓSTICO DE FK - audits.profile_id')
  console.log('═══════════════════════════════════════════════════════\n')

  // 1. Verificar tabelas
  const tables = await checkTables()

  console.log('📊 Status das tabelas:\n')
  console.log(`   instagram_profiles: ${tables.instagram_profiles ? '✅ Existe' : '❌ Não existe'}`)
  console.log(`   profiles:           ${tables.profiles ? '✅ Existe' : '❌ Não existe'}`)
  console.log(`   audits:             ${tables.audits ? '✅ Existe' : '❌ Não existe'}`)

  if (!tables.instagram_profiles) {
    console.log('\n❌ ERRO: Tabela instagram_profiles não existe!')
    console.log('   Execute a migração: database/migration-create-instagram-profiles.sql\n')
    process.exit(1)
  }

  if (!tables.audits) {
    console.log('\n❌ ERRO: Tabela audits não existe!')
    console.log('   Execute o schema: database/optimized-schema.sql\n')
    process.exit(1)
  }

  // 2. Testar inserção
  console.log('\n─────────────────────────────────────────────────────\n')
  const testResult = await testInsertAudit()

  if (testResult.success) {
    console.log('\n✅ TUDO FUNCIONANDO CORRETAMENTE!\n')
    console.log('A FK está configurada corretamente.')
    console.log('O erro pode ser causado por outra coisa.\n')
    process.exit(0)
  }

  // 3. Analisar erro
  if (testResult.error) {
    const errorMsg = testResult.error.message || testResult.error.toString()

    if (errorMsg.includes('foreign key') || errorMsg.includes('violates')) {
      console.log('\n❌ PROBLEMA CONFIRMADO: FK incorreta!\n')
      console.log('═══════════════════════════════════════════════════════')
      console.log('  SOLUÇÃO: Execute no SQL Editor do Supabase')
      console.log('═══════════════════════════════════════════════════════\n')
      console.log('1. Acesse: https://supabase.com/dashboard')
      console.log('2. Vá em SQL Editor')
      console.log('3. Cole e execute este SQL:\n')

      const fixSQL = `-- Remover constraints antigas
ALTER TABLE audits
DROP CONSTRAINT IF EXISTS audits_profile_id_fkey;

ALTER TABLE audits
DROP CONSTRAINT IF EXISTS fk_audits_profile;

ALTER TABLE audits
DROP CONSTRAINT IF EXISTS audits_profile_id_profiles_id_fk;

-- Adicionar nova constraint apontando para instagram_profiles
ALTER TABLE audits
ADD CONSTRAINT audits_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES instagram_profiles(id)
ON DELETE CASCADE;`

      console.log('```sql')
      console.log(fixSQL)
      console.log('```\n')
      console.log('4. Após executar, rode este script novamente para verificar\n')
      console.log('Ou veja: CORRIGIR-ERRO-AUDITORIA.md para mais detalhes\n')
      process.exit(1)
    } else {
      console.log('\n❌ Erro inesperado:\n')
      console.log(errorMsg)
      console.log('\n')
      process.exit(1)
    }
  }

  console.log('\n⚠️  Situação inesperada.')
  console.log('   Execute verificação manual.\n')
  process.exit(1)
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error.message)
  process.exit(1)
})
