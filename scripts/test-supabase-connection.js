#!/usr/bin/env node
/**
 * Script de Teste - Conexão Supabase e Schema
 *
 * Verifica:
 * 1. Conexão com Supabase
 * 2. Se coluna deleted_at existe nas tabelas
 * 3. Status da fila de análises
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.error('   Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('\n🔍 TESTE DE CONEXÃO SUPABASE\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Testar conexão básica
  console.log('1️⃣  Testando conexão...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      return false
    }

    console.log('✅ Conexão OK!\n')
  } catch (error) {
    console.error('❌ Falha na conexão:', error.message)
    return false
  }

  // 2. Verificar schema - coluna deleted_at
  console.log('2️⃣  Verificando schema (coluna deleted_at)...')
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE column_name = 'deleted_at'
          AND table_schema = 'public'
        ORDER BY table_name;
      `
    }).catch(async () => {
      // Fallback: tentar query direta (pode não funcionar com RLS)
      const tables = ['profiles', 'audits', 'posts', 'comments', 'comparisons', 'analysis_queue']
      const results = []

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('deleted_at')
          .limit(1)

        results.push({
          table_name: table,
          has_deleted_at: !error || !error.message.includes('column')
        })
      }

      return { data: results }
    })

    if (data && data.length > 0) {
      console.log('✅ Colunas deleted_at encontradas:\n')
      data.forEach(row => {
        console.log(`   📋 ${row.table_name}`)
      })
      console.log('')
    } else {
      console.log('⚠️  Nenhuma coluna deleted_at encontrada!')
      console.log('   👉 Aplique a migration 006_add_soft_delete_all_tables.sql\n')
    }
  } catch (error) {
    console.log('⚠️  Não foi possível verificar schema automaticamente')
    console.log('   Teste manual: tente criar uma análise pelo dashboard\n')
  }

  // 3. Verificar fila de análises
  console.log('3️⃣  Verificando fila de análises...')
  try {
    const { data: queue, error } = await supabase
      .from('analysis_queue')
      .select('id, username, status, progress, current_phase, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ Erro ao buscar fila:', error.message)
      console.log('   👉 Verifique se a tabela analysis_queue existe\n')
    } else if (queue.length === 0) {
      console.log('✅ Fila vazia (nenhuma análise encontrada)\n')
    } else {
      console.log(`✅ ${queue.length} análise(s) recente(s):\n`)
      queue.forEach(item => {
        const statusEmoji = {
          pending: '⏳',
          processing: '🔄',
          completed: '✅',
          failed: '❌'
        }[item.status] || '❓'

        console.log(`   ${statusEmoji} @${item.username} - ${item.status} (${item.progress || 0}%)`)
        if (item.current_phase) {
          console.log(`      Fase: ${item.current_phase}`)
        }
        console.log(`      Criado: ${new Date(item.created_at).toLocaleString('pt-BR')}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Erro ao verificar fila:', error.message)
  }

  // 4. Verificar worker
  console.log('4️⃣  Verificando worker...')
  const { execSync } = await import('child_process')
  try {
    const workerProcess = execSync('ps aux | grep "analysis-worker" | grep -v grep', { encoding: 'utf-8' })
    if (workerProcess.trim()) {
      console.log('✅ Worker ESTÁ RODANDO\n')
      console.log('   Processo:')
      console.log(`   ${workerProcess.split('\n')[0].substring(0, 100)}...\n`)
    } else {
      console.log('⚠️  Worker NÃO está rodando')
      console.log('   👉 Inicie com: npm run worker\n')
    }
  } catch (error) {
    console.log('⚠️  Worker NÃO está rodando')
    console.log('   👉 Inicie com: npm run worker\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ TESTE CONCLUÍDO\n')

  return true
}

// Executar teste
testConnection()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro crítico:', error)
    process.exit(1)
  })
