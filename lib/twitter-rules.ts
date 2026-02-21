/**
 * Twitter Rules Management Library
 * Gerencia regras do Twitter Filtered Stream API
 *
 * @module lib/twitter-rules
 * @epic EPIC-001 - Twitter Stream API Integration
 * @story Story 1.3 - Biblioteca de Gerenciamento de Regras
 */

import { createClient } from '@supabase/supabase-js';
import type {
  TwitterExpert,
  TwitterStreamRule,
  TwitterStreamRuleInsert,
  TwitterStreamRuleUpdate
} from '@/types/supabase-twitter';

// ============================================
// CONFIGURATION
// ============================================

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
const TWITTER_API_BASE = 'https://api.twitter.com/2';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa service_role para escrita
);

// ============================================
// TYPES
// ============================================

interface TwitterRule {
  id: string;
  value: string;
  tag: string;
}

interface TwitterRuleResponse {
  data?: TwitterRule[];
  meta: {
    sent: string;
    summary?: {
      created: number;
      not_created: number;
      deleted: number;
      not_deleted: number;
    };
  };
  errors?: Array<{
    message: string;
    parameters?: Record<string, unknown>;
  }>;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Adiciona uma regra ao Twitter Filtered Stream e salva no Supabase
 * @param expertId - UUID do expert no Supabase
 * @param themes - Array de temas para filtrar (ex: ['marketing', 'sales'])
 * @returns Twitter rule ID
 * @throws Error se falhar na criação da regra
 */
export async function addRule(
  expertId: string,
  themes: string[]
): Promise<string> {
  // 1. Buscar dados do expert
  const { data: expert, error: expertError } = await supabase
    .from('twitter_experts')
    .select('*')
    .eq('id', expertId)
    .single();

  if (expertError || !expert) {
    throw new Error(`Expert not found: ${expertId}`);
  }

  // 2. Construir regra
  const ruleValue = buildRuleFromExpert(expert, themes);
  const ruleTag = `${expert.twitter_username}-${themes[0]}`;

  // 3. Validar regra
  validateRule(ruleValue);

  // 4. Adicionar ao Twitter API
  const response = await fetch(`${TWITTER_API_BASE}/tweets/search/stream/rules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      add: [{ value: ruleValue, tag: ruleTag }]
    })
  });

  const result: TwitterRuleResponse = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(`Twitter API error: ${JSON.stringify(result.errors || result)}`);
  }

  if (!result.data || result.data.length === 0) {
    throw new Error('No rule data returned from Twitter API');
  }

  const twitterRuleId = result.data[0].id;

  // 5. Salvar no Supabase
  const ruleInsert: TwitterStreamRuleInsert = {
    twitter_rule_id: twitterRuleId,
    rule_value: ruleValue,
    rule_tag: ruleTag,
    expert_id: expertId,
    is_active: true,
    last_synced_at: new Date().toISOString()
  };

  const { error: insertError } = await supabase
    .from('twitter_stream_rules')
    .insert(ruleInsert);

  if (insertError) {
    // Rollback: remover do Twitter se falhou no Supabase
    await removeRuleFromTwitter(twitterRuleId);
    throw new Error(`Failed to save rule to Supabase: ${insertError.message}`);
  }

  // 6. Log de sucesso
  await logEvent('rule_added', true, {
    expert_id: expertId,
    twitter_rule_id: twitterRuleId,
    rule_value: ruleValue
  });

  console.log(`✅ Rule added: ${ruleTag} (${twitterRuleId})`);
  return twitterRuleId;
}

/**
 * Remove uma regra do Twitter e marca como inativa no Supabase
 * @param ruleId - UUID da regra no Supabase (não confundir com twitter_rule_id)
 */
export async function removeRule(ruleId: string): Promise<void> {
  // 1. Buscar regra no Supabase
  const { data: rule, error } = await supabase
    .from('twitter_stream_rules')
    .select('*')
    .eq('id', ruleId)
    .single();

  if (error || !rule) {
    throw new Error(`Rule not found: ${ruleId}`);
  }

  if (!rule.twitter_rule_id) {
    throw new Error(`Rule ${ruleId} has no twitter_rule_id`);
  }

  // 2. Remover do Twitter API
  await removeRuleFromTwitter(rule.twitter_rule_id);

  // 3. Marcar como inativa no Supabase (soft delete)
  const ruleUpdate: TwitterStreamRuleUpdate = {
    is_active: false,
    updated_at: new Date().toISOString()
  };

  const { error: updateError } = await supabase
    .from('twitter_stream_rules')
    .update(ruleUpdate)
    .eq('id', ruleId);

  if (updateError) {
    throw new Error(`Failed to update rule in Supabase: ${updateError.message}`);
  }

  // 4. Log
  await logEvent('rule_removed', true, {
    rule_id: ruleId,
    twitter_rule_id: rule.twitter_rule_id
  });

  console.log(`✅ Rule removed: ${rule.rule_tag}`);
}

/**
 * Lista todas as regras ativas no Twitter API
 */
export async function listRules(): Promise<TwitterRule[]> {
  const response = await fetch(`${TWITTER_API_BASE}/tweets/search/stream/rules`, {
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
    }
  });

  const result: TwitterRuleResponse = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to list rules: ${JSON.stringify(result)}`);
  }

  return result.data || [];
}

/**
 * Sincroniza regras entre Twitter API e Supabase
 * Remove regras órfãs (existem no Twitter mas não no Supabase)
 */
export async function syncRules(): Promise<void> {
  // 1. Listar regras no Twitter
  const twitterRules = await listRules();

  // 2. Listar regras ativas no Supabase
  const { data: supabaseRules, error } = await supabase
    .from('twitter_stream_rules')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch Supabase rules: ${error.message}`);
  }

  const supabaseRuleIds = new Set(
    (supabaseRules || []).map(r => r.twitter_rule_id).filter(Boolean)
  );

  // 3. Encontrar regras órfãs (no Twitter mas não no Supabase)
  const orphanRules = twitterRules.filter(
    tr => !supabaseRuleIds.has(tr.id)
  );

  // 4. Remover regras órfãs do Twitter
  for (const orphan of orphanRules) {
    console.warn(`⚠️  Removing orphan rule from Twitter: ${orphan.id} (${orphan.tag})`);
    await removeRuleFromTwitter(orphan.id);
  }

  // 5. Atualizar last_synced_at no Supabase
  if (supabaseRules && supabaseRules.length > 0) {
    const ruleIds = supabaseRules.map(r => r.id);
    await supabase
      .from('twitter_stream_rules')
      .update({ last_synced_at: new Date().toISOString() })
      .in('id', ruleIds);
  }

  await logEvent('rules_synced', true, {
    twitter_count: twitterRules.length,
    supabase_count: supabaseRules?.length || 0,
    orphans_removed: orphanRules.length
  });

  console.log(`✅ Sync complete: ${twitterRules.length} Twitter rules, ${supabaseRules?.length || 0} Supabase rules, ${orphanRules.length} orphans removed`);
}

/**
 * Atualiza temas de um expert e recria a regra no Twitter
 * @param expertId - UUID do expert
 * @param newThemes - Novos temas para monitorar
 */
export async function updateExpertThemes(
  expertId: string,
  newThemes: string[]
): Promise<void> {
  // 1. Buscar regra ativa do expert
  const { data: existingRule } = await supabase
    .from('twitter_stream_rules')
    .select('id')
    .eq('expert_id', expertId)
    .eq('is_active', true)
    .single();

  // 2. Remover regra antiga (se existir)
  if (existingRule) {
    await removeRule(existingRule.id);
  }

  // 3. Criar nova regra com novos temas
  await addRule(expertId, newThemes);

  console.log(`✅ Expert themes updated: ${newThemes.join(', ')}`);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Constrói rule_value a partir de expert e temas
 * Ex: "from:garyvee (marketing OR sales OR frameworks) -is:retweet -is:reply"
 */
function buildRuleFromExpert(expert: TwitterExpert, themes: string[]): string {
  const themesQuery = themes.map(t => `"${t}"`).join(' OR ');
  return `from:${expert.twitter_username} (${themesQuery}) -is:retweet -is:reply`;
}

/**
 * Valida sintaxe da regra (Twitter tem limites)
 * Max 512 caracteres, max 30 operadores OR por regra
 */
function validateRule(ruleValue: string): void {
  if (ruleValue.length > 512) {
    throw new Error(`Rule too long: ${ruleValue.length} chars (max 512)`);
  }

  const orCount = (ruleValue.match(/\sOR\s/gi) || []).length;
  if (orCount > 30) {
    throw new Error(`Too many OR operators: ${orCount} (max 30)`);
  }

  // Validar formato básico
  if (!ruleValue.includes('from:')) {
    throw new Error('Rule must include "from:" operator');
  }
}

/**
 * Remove regra do Twitter API (helper interno)
 */
async function removeRuleFromTwitter(twitterRuleId: string): Promise<void> {
  const response = await fetch(`${TWITTER_API_BASE}/tweets/search/stream/rules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      delete: { ids: [twitterRuleId] }
    })
  });

  const result: TwitterRuleResponse = await response.json();

  if (!response.ok || result.errors) {
    throw new Error(`Failed to delete rule from Twitter: ${JSON.stringify(result.errors || result)}`);
  }
}

/**
 * Log de eventos no Supabase
 */
async function logEvent(eventType: string, success: boolean, metadata: unknown): Promise<void> {
  await supabase.from('twitter_monitoring_log').insert({
    event_type: eventType,
    success,
    metadata: metadata as Record<string, unknown>
  });
}

/**
 * Deletar TODAS as regras do Twitter (útil para reset)
 * ⚠️ CUIDADO: Só usar em dev/teste!
 */
export async function deleteAllRules(): Promise<void> {
  const rules = await listRules();

  if (rules.length === 0) {
    console.log('No rules to delete');
    return;
  }

  const ids = rules.map(r => r.id);

  const response = await fetch(`${TWITTER_API_BASE}/tweets/search/stream/rules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      delete: { ids }
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to delete all rules: ${JSON.stringify(result)}`);
  }

  console.log(`✅ Deleted ${ids.length} rules from Twitter API`);
}

/**
 * Get rule count para verificar limites do plano
 * Basic: 25 rules max
 */
export async function getRuleCount(): Promise<number> {
  const rules = await listRules();
  return rules.length;
}

/**
 * Verificar se pode adicionar mais regras (limite do plano)
 */
export async function canAddRule(): Promise<boolean> {
  const count = await getRuleCount();
  const BASIC_PLAN_LIMIT = 25; // Twitter Basic plan
  return count < BASIC_PLAN_LIMIT;
}
