#!/usr/bin/env node

/**
 * Script para verificar foreign keys da tabela audits
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: {
    schema: 'public'
  }
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkForeignKeys() {
  log('\n🔍 Verificando Foreign Keys da tabela audits...', 'bright');
  log('─'.repeat(80), 'cyan');

  // Query para buscar foreign keys
  const query = `
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'audits'
      AND tc.table_schema = 'public'
    ORDER BY kcu.column_name;
  `;

  try {
    // Usar query RPC customizada
    const { data, error } = await supabase.rpc('exec_sql', { query });

    if (error) {
      // Fallback: tentar via API REST (não funciona para information_schema)
      log('\n⚠️  Não foi possível usar RPC, tentando método alternativo...', 'yellow');

      // Buscar metadados de outra forma
      log('\n📋 Execute este SQL manualmente no Supabase SQL Editor:', 'bright');
      log('─'.repeat(80), 'cyan');
      console.log(query);
      log('─'.repeat(80), 'cyan');

      log('\nOu acesse:', 'cyan');
      log(`https://supabase.com/dashboard/project/kxhtoxxprobdjzzxtywb/sql/new`, 'cyan');

      return;
    }

    if (!data || data.length === 0) {
      log('\n⚠️  Nenhuma foreign key encontrada na tabela audits', 'yellow');
      log('   Isso pode indicar que a FK foi removida ou nunca foi criada.', 'yellow');
      return;
    }

    log(`\n✅ Encontradas ${data.length} foreign key(s):\n`, 'green');

    data.forEach((fk, index) => {
      const isCorrect = fk.foreign_table_name === 'instagram_profiles';
      const icon = isCorrect ? '✅' : '❌';
      const color = isCorrect ? 'green' : 'red';

      log(`${icon} FK #${index + 1}:`, color);
      log(`   Constraint: ${fk.constraint_name}`, 'cyan');
      log(`   Coluna: ${fk.column_name}`, 'cyan');
      log(`   Aponta para: ${fk.foreign_table_name}.${fk.foreign_column_name}`, color);

      if (!isCorrect) {
        log(`   ⚠️  PROBLEMA: Deveria apontar para instagram_profiles!`, 'red');
      }
      console.log('');
    });

  } catch (err) {
    log(`\n❌ Erro ao verificar foreign keys: ${err.message}`, 'red');
    log('\n📋 Execute este SQL manualmente no Supabase SQL Editor:', 'bright');
    log('─'.repeat(80), 'cyan');
    console.log(query);
    log('─'.repeat(80), 'cyan');
  }
}

async function main() {
  await checkForeignKeys();

  log('\n' + '='.repeat(80), 'cyan');
  log('CONCLUSÃO:', 'bright');
  log('='.repeat(80), 'cyan');
  log(`
Se a FK aponta para "profiles" (tabela que NÃO existe):
  → Execute: database/migration-fix-audits-foreign-key.sql

Se a FK aponta para "instagram_profiles":
  → ✅ Tudo OK! Nenhuma ação necessária.

Se nenhuma FK foi encontrada:
  → Execute: database/migration-fix-audits-foreign-key.sql
  `, 'cyan');
}

main().catch(console.error);
