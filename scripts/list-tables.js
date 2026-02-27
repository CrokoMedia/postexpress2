#!/usr/bin/env node

/**
 * Script para listar todas as tabelas e views do Supabase
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

async function listTables() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Faltam variáveis de ambiente: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  console.log('📊 Listando tabelas e views do banco PostExpress...\n');

  // Listar tabelas
  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        schemaname as schema,
        tablename as table_name,
        tableowner as owner
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions', 'graphql', 'graphql_public', 'net', 'pgbouncer', 'pgsodium', 'pgsodium_masks', 'realtime', 'supabase_functions', 'supabase_migrations', 'vault')
      ORDER BY schemaname, tablename;
    `
  });

  if (tablesError) {
    // Se RPC não existe, tentar via query direta
    console.log('⚠️ RPC exec_sql não disponível, tentando abordagem alternativa...\n');

    // Listar tabelas pelo information_schema
    const { data: tablesList, error: err2 } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .in('table_schema', ['public']);

    if (err2) {
      console.error('❌ Erro ao listar tabelas:', err2.message);
      console.log('\n💡 Vou usar uma abordagem mais simples...\n');

      // Tentar listar tabelas conhecidas do schema
      const knownTables = [
        'instagram_profiles',
        'profiles',
        'audits',
        'content_suggestions',
        'posts',
        'analysis_queue',
        'comparisons',
        'whatsapp_users',
        'company_brands'
      ];

      console.log('📋 TABELAS CONHECIDAS (schema public):');
      console.log('─'.repeat(60));

      for (const table of knownTables) {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`✅ ${table.padEnd(30)} - ${count || 0} registros`);
        }
      }

      console.log('\n📊 VIEWS CONHECIDAS:');
      console.log('─'.repeat(60));
      const knownViews = ['content_suggestions_with_profile'];

      for (const view of knownViews) {
        const { data, error, count } = await supabase
          .from(view)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`✅ ${view.padEnd(30)} - ${count || 0} registros`);
        }
      }

      return;
    }

    console.log('📋 TABELAS (schema public):');
    console.log('─'.repeat(60));
    tablesList?.forEach(t => {
      console.log(`  ${t.table_name}`);
    });
    return;
  }

  if (tables) {
    console.log('📋 TABELAS:');
    console.log('─'.repeat(60));
    console.table(tables);
  }

  // Listar views
  const { data: views, error: viewsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        schemaname as schema,
        viewname as view_name,
        viewowner as owner
      FROM pg_views
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions', 'graphql', 'graphql_public', 'net', 'pgbouncer', 'pgsodium', 'pgsodium_masks', 'realtime', 'supabase_functions', 'vault')
      ORDER BY schemaname, viewname;
    `
  });

  if (views && !viewsError) {
    console.log('\n📊 VIEWS:');
    console.log('─'.repeat(60));
    console.table(views);
  }
}

listTables().catch(console.error);
