#!/usr/bin/env node

/**
 * Script para verificar estado das tabelas no Supabase e executar migrações
 *
 * Verifica:
 * 1. Se tabela instagram_profiles existe
 * 2. Se foreign key de audits.profile_id aponta para tabela correta
 * 3. Executa migrações necessárias
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kxhtoxxprobdjzzxtywb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'bright');
  console.log('='.repeat(70) + '\n');
}

async function checkTables() {
  logSection('1. Verificando Tabelas Existentes');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'instagram_profiles', 'audits')
      ORDER BY table_name;
    `
  });

  if (error) {
    // Se a função RPC não existir, usar query direta
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['profiles', 'instagram_profiles', 'audits'])
      .eq('table_schema', 'public');

    if (tablesError) {
      log(`❌ Erro ao verificar tabelas: ${tablesError.message}`, 'red');
      return null;
    }

    return tables;
  }

  return data;
}

async function executeSql(sql, description) {
  log(`\n▶ Executando: ${description}`, 'cyan');

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    log(`❌ Erro: ${error.message}`, 'red');
    return false;
  }

  log(`✅ Sucesso!`, 'green');
  return true;
}

async function checkForeignKeys() {
  logSection('2. Verificando Foreign Keys');

  const sql = `
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
      AND kcu.column_name = 'profile_id';
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    log(`⚠️  Não foi possível verificar foreign keys automaticamente`, 'yellow');
    log(`   Execute manualmente no SQL Editor:`, 'yellow');
    console.log(sql);
    return null;
  }

  return data;
}

async function createInstagramProfilesTable() {
  logSection('3. Criando Tabela instagram_profiles');

  const migrationPath = join(__dirname, '../database/migration-create-instagram-profiles.sql');
  const migrationSql = readFileSync(migrationPath, 'utf-8');

  return await executeSql(migrationSql, 'Criar tabela instagram_profiles');
}

async function fixAuditsForeignKey() {
  logSection('4. Corrigindo Foreign Key de audits.profile_id');

  const migrationPath = join(__dirname, '../database/migration-fix-audits-foreign-key.sql');
  const migrationSql = readFileSync(migrationPath, 'utf-8');

  return await executeSql(migrationSql, 'Atualizar foreign key para instagram_profiles');
}

async function generateReport(tables, foreignKeys) {
  logSection('📊 RELATÓRIO FINAL');

  log('Tabelas encontradas:', 'bright');
  if (tables && tables.length > 0) {
    tables.forEach(t => {
      const icon = t.table_name === 'instagram_profiles' ? '✅' : '📋';
      log(`  ${icon} ${t.table_name}`, 'cyan');
    });
  } else {
    log('  ❌ Nenhuma tabela encontrada ou erro na consulta', 'red');
  }

  console.log('');
  log('Foreign Keys de audits.profile_id:', 'bright');
  if (foreignKeys && foreignKeys.length > 0) {
    foreignKeys.forEach(fk => {
      const isCorrect = fk.foreign_table_name === 'instagram_profiles';
      const icon = isCorrect ? '✅' : '⚠️ ';
      const color = isCorrect ? 'green' : 'yellow';
      log(`  ${icon} ${fk.constraint_name} → ${fk.foreign_table_name}`, color);
    });
  } else {
    log('  ❌ Nenhuma foreign key encontrada', 'red');
  }

  console.log('\n' + '='.repeat(70));
}

async function main() {
  log(`
  ╔═══════════════════════════════════════════════════════════════════╗
  ║                                                                   ║
  ║   🔍 VERIFICAÇÃO E MIGRAÇÃO DE DATABASE - CROKO LAB              ║
  ║                                                                   ║
  ╚═══════════════════════════════════════════════════════════════════╝
  `, 'bright');

  try {
    // 1. Verificar tabelas existentes
    const tables = await checkTables();

    const hasInstagramProfiles = tables && tables.some(t => t.table_name === 'instagram_profiles');
    const hasProfiles = tables && tables.some(t => t.table_name === 'profiles');
    const hasAudits = tables && tables.some(t => t.table_name === 'audits');

    // 2. Verificar foreign keys
    let foreignKeys = null;
    if (hasAudits) {
      foreignKeys = await checkForeignKeys();
    }

    // 3. Executar migrações se necessário
    if (!hasInstagramProfiles) {
      log('\n⚠️  Tabela instagram_profiles NÃO existe', 'yellow');
      log('   Executando migração...', 'yellow');
      await createInstagramProfilesTable();
    } else {
      log('\n✅ Tabela instagram_profiles já existe', 'green');
    }

    // 4. Corrigir foreign key se necessário
    if (foreignKeys && foreignKeys.length > 0) {
      const pointsToProfiles = foreignKeys.some(fk => fk.foreign_table_name === 'profiles');

      if (pointsToProfiles) {
        log('\n⚠️  Foreign key de audits aponta para "profiles" (ERRADO)', 'yellow');
        log('   Executando correção...', 'yellow');
        await fixAuditsForeignKey();
      } else {
        log('\n✅ Foreign key de audits já aponta para instagram_profiles', 'green');
      }
    }

    // 5. Re-verificar tudo após migrações
    const finalTables = await checkTables();
    const finalForeignKeys = await checkForeignKeys();

    // 6. Gerar relatório final
    await generateReport(finalTables, finalForeignKeys);

    log('\n✅ Verificação concluída!', 'green');
    log('\n📝 Próximos passos:', 'bright');
    log('   1. Reinicie o servidor Next.js (npm run dev)', 'cyan');
    log('   2. Teste a API de perfis (/api/profiles)', 'cyan');
    log('   3. Teste criação de nova auditoria', 'cyan');

  } catch (error) {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
