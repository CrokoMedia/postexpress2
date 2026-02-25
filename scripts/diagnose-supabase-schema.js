#!/usr/bin/env node

/**
 * Script de Diagnóstico do Supabase Schema
 * Analisa todas as tabelas, colunas, foreign keys e relationships
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente não encontradas!')
  console.error('Certifique-se que .env tem:')
  console.error('  - SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 DIAGNÓSTICO DO SUPABASE SCHEMA')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

async function runQuery(sql, description) {
  console.log(`\n📊 ${description}`)
  console.log('─────────────────────────────────────────────────')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Se não tiver a função exec_sql, usar query direta
      const { data: directData, error: directError } = await supabase
        .from('_sql')
        .select('*')
        .sql(sql)

      if (directError) {
        console.error('❌ Erro:', directError.message)
        return null
      }

      console.table(directData)
      return directData
    }

    if (data && data.length > 0) {
      console.table(data)
      return data
    } else {
      console.log('(Nenhum resultado)')
      return []
    }
  } catch (err) {
    console.error('❌ Erro ao executar query:', err.message)
    return null
  }
}

async function diagnose() {

  // 1. LISTAR TODAS AS TABELAS
  await runQuery(`
    SELECT
      table_schema,
      table_name,
      (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as num_columns
    FROM information_schema.tables t
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `, '1. TODAS AS TABELAS DO SCHEMA PUBLIC')

  // 2. ESTRUTURA DA TABELA PROFILES
  await runQuery(`
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
    ORDER BY ordinal_position;
  `, '2. ESTRUTURA DA TABELA PROFILES')

  // 3. PRIMARY KEY DA TABELA PROFILES
  await runQuery(`
    SELECT
      kcu.column_name,
      c.data_type
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.columns c
      ON kcu.table_name = c.table_name
      AND kcu.column_name = c.column_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'profiles'
      AND tc.constraint_type = 'PRIMARY KEY';
  `, '3. PRIMARY KEY DA TABELA PROFILES')

  // 4. ESTRUTURA DA TABELA CONTENT_SUGGESTIONS
  await runQuery(`
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'content_suggestions'
    ORDER BY ordinal_position;
  `, '4. ESTRUTURA DA TABELA CONTENT_SUGGESTIONS')

  // 5. TODAS AS FOREIGN KEYS DA TABELA CONTENT_SUGGESTIONS
  await runQuery(`
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_schema || '.' || ccu.table_name AS references_table,
      ccu.column_name AS references_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'content_suggestions'
      AND tc.constraint_type = 'FOREIGN KEY'
    ORDER BY kcu.column_name;
  `, '5. FOREIGN KEYS DA TABELA CONTENT_SUGGESTIONS')

  // 6. VERIFICAR SE PROFILE_ID EM CONTENT_SUGGESTIONS BATE COM PK DE PROFILES
  await runQuery(`
    SELECT
      'content_suggestions.profile_id' as coluna_origem,
      cs_col.data_type as tipo_origem,
      'profiles.???' as coluna_destino,
      (
        SELECT column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'profiles'
          AND tc.constraint_type = 'PRIMARY KEY'
        LIMIT 1
      ) as pk_profiles,
      (
        SELECT c.data_type
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name
        JOIN information_schema.columns c
          ON kcu.column_name = c.column_name
          AND kcu.table_name = c.table_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'profiles'
          AND tc.constraint_type = 'PRIMARY KEY'
        LIMIT 1
      ) as tipo_pk_profiles
    FROM information_schema.columns cs_col
    WHERE cs_col.table_schema = 'public'
      AND cs_col.table_name = 'content_suggestions'
      AND cs_col.column_name = 'profile_id';
  `, '6. COMPATIBILIDADE profile_id → profiles.PK')

  // 7. DADOS DE EXEMPLO (primeiras 3 linhas)
  await runQuery(`
    SELECT
      id,
      profile_id,
      audit_id,
      created_at
    FROM content_suggestions
    LIMIT 3;
  `, '7. DADOS DE EXEMPLO (content_suggestions)')

  // 8. VERIFICAR SE EXISTEM profile_ids ÓRFÃOS
  const profilePkColumn = await getProfilesPrimaryKey()

  if (profilePkColumn) {
    await runQuery(`
      SELECT
        cs.profile_id,
        CASE
          WHEN p.${profilePkColumn} IS NULL THEN '❌ ÓRFÃO'
          ELSE '✅ OK'
        END as status
      FROM content_suggestions cs
      LEFT JOIN profiles p ON cs.profile_id = p.${profilePkColumn}
      LIMIT 10;
    `, '8. VERIFICAR profile_ids ÓRFÃOS')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ DIAGNÓSTICO COMPLETO!\n')
}

async function getProfilesPrimaryKey() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'profiles'
          AND tc.constraint_type = 'PRIMARY KEY'
        LIMIT 1;
      `
    })

    if (data && data.length > 0) {
      return data[0].column_name
    }
  } catch (err) {
    // Ignorar erro
  }

  return null
}

// Executar diagnóstico
diagnose()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Erro fatal:', err)
    process.exit(1)
  })
