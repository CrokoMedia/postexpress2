#!/usr/bin/env node

/**
 * Script para verificar estado das tabelas no Supabase
 * (Versão simplificada que apenas consulta, sem executar migrações)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar .env
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

async function verifyTables() {
  logSection('1️⃣  VERIFICANDO TABELAS EXISTENTES');

  try {
    // Tentar consultar cada tabela
    const tables = ['profiles', 'instagram_profiles', 'audits'];
    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (error && error.code === 'PGRST204') {
          // Tabela existe mas está vazia
          results[table] = { exists: true, count: 0 };
        } else if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          // Contar registros
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          results[table] = { exists: true, count: count || 0 };
        }
      } catch (err) {
        results[table] = { exists: false, error: err.message };
      }
    }

    // Mostrar resultados
    for (const [table, result] of Object.entries(results)) {
      if (result.exists) {
        log(`✅ ${table.padEnd(20)} → Existe (${result.count} registros)`, 'green');
      } else {
        log(`❌ ${table.padEnd(20)} → NÃO EXISTE`, 'red');
        if (result.error) {
          log(`   Erro: ${result.error}`, 'yellow');
        }
      }
    }

    return results;
  } catch (error) {
    log(`❌ Erro ao verificar tabelas: ${error.message}`, 'red');
    return null;
  }
}

async function checkAuditsStructure() {
  logSection('2️⃣  VERIFICANDO ESTRUTURA DA TABELA AUDITS');

  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .limit(1);

    if (error) {
      log(`❌ Erro ao consultar audits: ${error.message}`, 'red');
      return null;
    }

    if (!data || data.length === 0) {
      log(`⚠️  Tabela audits está vazia`, 'yellow');
      return { empty: true };
    }

    const sampleAudit = data[0];
    const columns = Object.keys(sampleAudit);

    log(`Colunas encontradas (${columns.length} total):`, 'cyan');
    columns.forEach(col => {
      const value = sampleAudit[col];
      const type = typeof value;
      log(`  • ${col.padEnd(30)} : ${type}`, 'cyan');
    });

    return { empty: false, columns, sample: sampleAudit };
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
    return null;
  }
}

async function testProfileRelationship() {
  logSection('3️⃣  TESTANDO RELACIONAMENTO AUDITS ↔ PROFILE');

  try {
    // Buscar uma auditoria com profile_id
    const { data: audits, error: auditsError } = await supabase
      .from('audits')
      .select('id, profile_id')
      .not('profile_id', 'is', null)
      .limit(1);

    if (auditsError) {
      log(`❌ Erro ao buscar audits: ${auditsError.message}`, 'red');
      return;
    }

    if (!audits || audits.length === 0) {
      log(`⚠️  Nenhuma auditoria com profile_id encontrada`, 'yellow');
      return;
    }

    const audit = audits[0];
    log(`Testando audit.id: ${audit.id}`, 'cyan');
    log(`  profile_id: ${audit.profile_id}`, 'cyan');

    // Tentar buscar em profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', audit.profile_id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      log(`\n❌ Erro ao buscar em profiles: ${profileError.message}`, 'red');
    } else if (profile) {
      log(`\n✅ Encontrado em profiles:`, 'green');
      log(`   username: ${profile.username || 'N/A'}`, 'green');
    } else {
      log(`\n❌ NÃO encontrado em profiles`, 'red');
    }

    // Tentar buscar em instagram_profiles
    const { data: instagramProfile, error: instagramError } = await supabase
      .from('instagram_profiles')
      .select('*')
      .eq('id', audit.profile_id)
      .single();

    if (instagramError && instagramError.code !== 'PGRST116') {
      log(`❌ Erro ao buscar em instagram_profiles: ${instagramError.message}`, 'red');
    } else if (instagramProfile) {
      log(`\n✅ Encontrado em instagram_profiles:`, 'green');
      log(`   username: ${instagramProfile.username || 'N/A'}`, 'green');
    } else {
      log(`\n❌ NÃO encontrado em instagram_profiles`, 'red');
    }

  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function generateSQLCommands(tables) {
  logSection('4️⃣  SQL COMMANDS PARA EXECUTAR MANUALMENTE');

  const needsInstagramProfiles = !tables?.instagram_profiles?.exists;
  const needsFKFix = tables?.audits?.exists; // Se audits existe, pode precisar fix

  if (needsInstagramProfiles) {
    log('⚠️  Tabela instagram_profiles NÃO existe', 'yellow');
    log('\n📋 Execute este SQL no Supabase SQL Editor:', 'bright');
    log('\nSQL #1: Criar tabela instagram_profiles', 'cyan');
    log('─'.repeat(80), 'cyan');
    console.log(`
-- Abra: https://supabase.com/dashboard/project/${SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1]}/sql/new
-- Cole o conteúdo do arquivo: database/migration-create-instagram-profiles.sql
    `.trim());
    log('─'.repeat(80), 'cyan');
  }

  if (needsFKFix && tables?.audits?.exists) {
    log('\n⚠️  Tabela audits existe - pode precisar de fix na FK', 'yellow');
    log('\n📋 Execute este SQL no Supabase SQL Editor:', 'bright');
    log('\nSQL #2: Corrigir foreign key de audits.profile_id', 'cyan');
    log('─'.repeat(80), 'cyan');
    console.log(`
-- Abra: https://supabase.com/dashboard/project/${SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1]}/sql/new
-- Cole o conteúdo do arquivo: database/migration-fix-audits-foreign-key.sql
    `.trim());
    log('─'.repeat(80), 'cyan');
  }

  if (!needsInstagramProfiles && !needsFKFix) {
    log('✅ Nenhuma migração necessária!', 'green');
  }
}

async function main() {
  log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🔍 VERIFICAÇÃO DE DATABASE - CROKO LAB                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `, 'bright');

  log(`Conectando a: ${SUPABASE_URL}`, 'cyan');

  // 1. Verificar tabelas
  const tables = await verifyTables();

  // 2. Verificar estrutura de audits
  if (tables?.audits?.exists) {
    await checkAuditsStructure();
  }

  // 3. Testar relacionamento
  if (tables?.audits?.exists && tables?.audits?.count > 0) {
    await testProfileRelationship();
  }

  // 4. Gerar comandos SQL para migrações
  await generateSQLCommands(tables);

  logSection('✅ VERIFICAÇÃO CONCLUÍDA');

  log('\n📝 Próximos passos:', 'bright');
  log('   1. Se viu SQL commands acima, execute-os no Supabase SQL Editor', 'cyan');
  log('   2. Após executar, rode este script novamente para verificar', 'cyan');
  log('   3. Reinicie o servidor Next.js: npm run dev', 'cyan');
  log('   4. Teste a API: http://localhost:3001/api/profiles', 'cyan');
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
