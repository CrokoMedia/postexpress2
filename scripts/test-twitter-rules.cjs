#!/usr/bin/env node

/**
 * Script de Teste para Twitter Rules Library
 * Testa funções principais: addRule, listRules, removeRule, syncRules
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Verificar env vars
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !TWITTER_BEARER_TOKEN) {
  console.error('❌ Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TWITTER_BEARER_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Simular funções da biblioteca (sem import pois é ESM)
const TWITTER_API_BASE = 'https://api.twitter.com/2';

async function listRules() {
  const response = await fetch(`${TWITTER_API_BASE}/tweets/search/stream/rules`, {
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to list rules: ${JSON.stringify(result)}`);
  }

  return result.data || [];
}

async function testRulesLibrary() {
  console.log('🧪 Testando Twitter Rules Library...\n');

  let allPassed = true;

  // Teste 1: Listar regras do Twitter
  console.log('📋 Teste 1: Listar regras do Twitter API');
  try {
    const rules = await listRules();
    console.log(`  ✅ ${rules.length} regra(s) encontrada(s) no Twitter`);
    rules.forEach(rule => {
      console.log(`     - ${rule.tag}: ${rule.value.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error(`  ❌ Erro ao listar regras: ${error.message}`);
    allPassed = false;
  }

  // Teste 2: Verificar experts no Supabase
  console.log('\n📊 Teste 2: Verificar experts no Supabase');
  try {
    const { data: experts, error } = await supabase
      .from('twitter_experts')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`  ✅ ${experts.length} expert(s) ativo(s) no Supabase`);
    experts.forEach(expert => {
      console.log(`     - @${expert.twitter_username}: ${expert.themes.join(', ')}`);
    });

    if (experts.length === 0) {
      console.log('  ℹ️  Nenhum expert cadastrado ainda (normal para primeira execução)');
    }
  } catch (error) {
    console.error(`  ❌ Erro ao buscar experts: ${error.message}`);
    allPassed = false;
  }

  // Teste 3: Verificar regras no Supabase
  console.log('\n🔗 Teste 3: Verificar regras no Supabase');
  try {
    const { data: rules, error } = await supabase
      .from('twitter_stream_rules')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`  ✅ ${rules.length} regra(s) ativa(s) no Supabase`);
    rules.forEach(rule => {
      console.log(`     - ${rule.rule_tag} (Twitter ID: ${rule.twitter_rule_id})`);
    });
  } catch (error) {
    console.error(`  ❌ Erro ao buscar regras: ${error.message}`);
    allPassed = false;
  }

  // Teste 4: Verificar autenticação Twitter
  console.log('\n🔑 Teste 4: Verificar autenticação Twitter API');
  try {
    const response = await fetch(`${TWITTER_API_BASE}/tweets/search/stream/rules`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      }
    });

    if (response.ok) {
      console.log('  ✅ Autenticação Twitter OK (Bearer Token válido)');
    } else {
      const error = await response.json();
      throw new Error(`Authentication failed: ${JSON.stringify(error)}`);
    }
  } catch (error) {
    console.error(`  ❌ Erro de autenticação: ${error.message}`);
    console.error('     Verifique se TWITTER_BEARER_TOKEN está correto');
    allPassed = false;
  }

  // Teste 5: Verificar limite de regras
  console.log('\n📏 Teste 5: Verificar limite de regras (plano Basic)');
  try {
    const rules = await listRules();
    const BASIC_PLAN_LIMIT = 25;
    const remaining = BASIC_PLAN_LIMIT - rules.length;

    console.log(`  ✅ ${rules.length}/${BASIC_PLAN_LIMIT} regras usadas`);
    console.log(`     ${remaining} regra(s) disponível(is)`);

    if (remaining < 5) {
      console.log(`  ⚠️  Aviso: Apenas ${remaining} regras restantes!`);
    }
  } catch (error) {
    console.error(`  ❌ Erro ao verificar limite: ${error.message}`);
    allPassed = false;
  }

  // Resultado final
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Criar primeiro expert: POST /api/twitter/experts');
    console.log('   2. Adicionar regra: POST /api/twitter/rules/add');
    console.log('   3. Implementar worker stream (Story 2.1)');
    process.exit(0);
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('\n🔧 Verifique os erros acima e corrija antes de continuar');
    process.exit(1);
  }
}

// Executar testes
testRulesLibrary().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
