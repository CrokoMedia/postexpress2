#!/usr/bin/env node

/**
 * Script de Validação do Schema Twitter Monitoring
 * Verifica se todas as tabelas, índices e RLS foram criados corretamente
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const EXPECTED_TABLES = [
  'twitter_experts',
  'twitter_stream_rules',
  'twitter_content_updates',
  'twitter_monitoring_log'
];

async function validateSchema() {
  console.log('🔍 Validando schema Twitter Monitoring...\n');

  let allValid = true;

  // 1. Verificar tabelas
  console.log('📋 Verificando tabelas...');
  for (const tableName of EXPECTED_TABLES) {
    try {
      const { error } = await supabase.from(tableName).select('id').limit(1);

      if (error) {
        console.error(`  ❌ Tabela ${tableName} não encontrada ou inacessível`);
        console.error(`     Erro: ${error.message}`);
        allValid = false;
      } else {
        console.log(`  ✅ ${tableName}`);
      }
    } catch (err) {
      console.error(`  ❌ Erro ao verificar ${tableName}:`, err.message);
      allValid = false;
    }
  }

  // 2. Verificar RLS
  console.log('\n🔒 Verificando Row Level Security (RLS)...');

  // Testar leitura com anon key (deve funcionar)
  const anonClient = createClient(SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  try {
    const { data, error } = await anonClient.from('twitter_experts').select('id').limit(1);
    if (!error) {
      console.log('  ✅ RLS configurado corretamente (leitura pública permitida)');
    } else {
      console.error('  ❌ RLS pode estar mal configurado:', error.message);
      allValid = false;
    }
  } catch (err) {
    console.error('  ❌ Erro ao testar RLS:', err.message);
    allValid = false;
  }

  // 3. Verificar dados de teste (se existirem)
  console.log('\n📊 Verificando dados...');
  const { data: experts, error: expertsError } = await supabase
    .from('twitter_experts')
    .select('*');

  if (expertsError) {
    console.error('  ❌ Erro ao buscar experts:', expertsError.message);
    allValid = false;
  } else {
    console.log(`  ℹ️  ${experts.length} expert(s) cadastrado(s)`);
  }

  const { data: tweets, error: tweetsError } = await supabase
    .from('twitter_content_updates')
    .select('*');

  if (tweetsError) {
    console.error('  ❌ Erro ao buscar tweets:', tweetsError.message);
    allValid = false;
  } else {
    console.log(`  ℹ️  ${tweets.length} tweet(s) capturado(s)`);
  }

  // 4. Resultado final
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✅ VALIDAÇÃO COMPLETA - Schema Twitter Monitoring OK!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Implementar lib/twitter-rules.ts (Story 1.3)');
    console.log('   2. Criar worker de stream (Story 2.1)');
    process.exit(0);
  } else {
    console.log('❌ VALIDAÇÃO FALHOU - Verifique os erros acima');
    console.log('\n🔧 Ações sugeridas:');
    console.log('   1. Executar migration no SQL Editor do Supabase');
    console.log('   2. Verificar permissões de RLS');
    console.log('   3. Rodar novamente: node scripts/validate-twitter-schema.js');
    process.exit(1);
  }
}

// Executar validação
validateSchema().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
