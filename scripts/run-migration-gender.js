#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 Executando migration: adicionar colunas de gênero...\n');

const sql = readFileSync('database/add-gender-columns.sql', 'utf8');

// Executar cada statement separadamente
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

for (const statement of statements) {
  if (!statement) continue;

  console.log(`Executando: ${statement.substring(0, 80)}...`);

  const { error } = await supabase.rpc('exec_sql', {
    sql_query: statement
  });

  if (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

console.log('\n✅ Migration executada com sucesso!');

// Verificar colunas adicionadas
const { data, error } = await supabase
  .from('instagram_profiles')
  .select('gender, gender_auto_detected, gender_confidence')
  .limit(1);

if (!error) {
  console.log('\n✅ Colunas verificadas:');
  console.log('   - gender');
  console.log('   - gender_auto_detected');
  console.log('   - gender_confidence');
}
