# Story 1.3: Biblioteca de Gerenciamento de Regras Twitter

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** 📋 To Do
**Priority:** P0 (Blocker)
**Estimate:** 3h
**Owner:** Backend Dev
**Sprint:** Sprint 1 - Semana 1

---

## 📋 Descrição

Criar biblioteca TypeScript para gerenciar regras do Twitter Filtered Stream API: adicionar, remover, listar e sincronizar regras entre o Twitter API e o banco Supabase.

---

## 🎯 Acceptance Criteria

- [ ] Módulo `/lib/twitter-rules.ts` criado
- [ ] Funções CRUD completas (create, read, update, delete)
- [ ] Sincronização bidirecional (API ↔ Supabase)
- [ ] Validação de regras (sintaxe, limites do plano)
- [ ] Error handling robusto (retry, backoff)
- [ ] Tipos TypeScript completos
- [ ] Testes unitários (opcional mas recomendado)
- [ ] Documentação inline (JSDoc)

---

## 🏗️ Arquitetura

```typescript
/lib/twitter-rules.ts
├── addRule(expertId, themes)          → Cria regra no Twitter + salva Supabase
├── removeRule(ruleId)                 → Remove do Twitter + marca inativo Supabase
├── listRules()                        → Lista regras ativas no Twitter
├── syncRules()                        → Sincroniza Twitter ↔ Supabase
├── validateRule(ruleValue)            → Valida sintaxe antes de enviar
└── buildRuleFromExpert(expert, themes) → Gera rule_value a partir de expert + temas
```

---

## 🔧 Implementação

### 1. Estrutura do Arquivo

```typescript
// /lib/twitter-rules.ts

import { createClient } from '@supabase/supabase-js';

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
    parameters?: Record<string, any>;
  }>;
}

interface Expert {
  id: string;
  twitter_username: string;
  themes: string[];
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Adiciona uma regra ao Twitter Filtered Stream e salva no Supabase
 * @param expertId - UUID do expert no Supabase
 * @param themes - Array de temas para filtrar (ex: ['marketing', 'sales'])
 * @returns Twitter rule ID
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
    throw new Error(`Twitter API error: ${JSON.stringify(result.errors)}`);
  }

  const twitterRuleId = result.data![0].id;

  // 5. Salvar no Supabase
  const { error: insertError } = await supabase
    .from('twitter_stream_rules')
    .insert({
      twitter_rule_id: twitterRuleId,
      rule_value: ruleValue,
      rule_tag: ruleTag,
      expert_id: expertId,
      is_active: true,
      last_synced_at: new Date().toISOString()
    });

  if (insertError) {
    // Rollback: remover do Twitter se falhou no Supabase
    await removeRuleFromTwitter(twitterRuleId);
    throw new Error(`Failed to save rule to Supabase: ${insertError.message}`);
  }

  // 6. Log de sucesso
  await logEvent('rule_added', {
    expert_id: expertId,
    twitter_rule_id: twitterRuleId,
    rule_value: ruleValue
  });

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

  // 2. Remover do Twitter API
  await removeRuleFromTwitter(rule.twitter_rule_id);

  // 3. Marcar como inativa no Supabase (soft delete)
  const { error: updateError } = await supabase
    .from('twitter_stream_rules')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', ruleId);

  if (updateError) {
    throw new Error(`Failed to update rule in Supabase: ${updateError.message}`);
  }

  // 4. Log
  await logEvent('rule_removed', {
    rule_id: ruleId,
    twitter_rule_id: rule.twitter_rule_id
  });
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
    supabaseRules?.map(r => r.twitter_rule_id) || []
  );

  // 3. Encontrar regras órfãs (no Twitter mas não no Supabase)
  const orphanRules = twitterRules.filter(
    tr => !supabaseRuleIds.has(tr.id)
  );

  // 4. Remover regras órfãs do Twitter
  for (const orphan of orphanRules) {
    console.warn(`Removing orphan rule from Twitter: ${orphan.id} (${orphan.tag})`);
    await removeRuleFromTwitter(orphan.id);
  }

  // 5. Atualizar last_synced_at no Supabase
  if (supabaseRules && supabaseRules.length > 0) {
    await supabase
      .from('twitter_stream_rules')
      .update({ last_synced_at: new Date().toISOString() })
      .in('id', supabaseRules.map(r => r.id));
  }

  await logEvent('rules_synced', {
    twitter_count: twitterRules.length,
    supabase_count: supabaseRules?.length || 0,
    orphans_removed: orphanRules.length
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Constrói rule_value a partir de expert e temas
 * Ex: "from:garyvee (marketing OR sales OR frameworks) -is:retweet"
 */
function buildRuleFromExpert(expert: Expert, themes: string[]): string {
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

  // Mais validações podem ser adicionadas aqui
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
    throw new Error(`Failed to delete rule from Twitter: ${JSON.stringify(result.errors)}`);
  }
}

/**
 * Log de eventos no Supabase
 */
async function logEvent(eventType: string, metadata: any): Promise<void> {
  await supabase.from('twitter_monitoring_log').insert({
    event_type: eventType,
    success: true,
    metadata
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

  console.log(`Deleted ${ids.length} rules from Twitter API`);
}
```

---

## 📁 Arquivos Afetados

```
📁 postexpress2/
├── lib/
│   └── twitter-rules.ts              # CRIADO (biblioteca principal)
└── types/
    └── twitter.ts                    # CRIADO (types compartilhados)
```

---

## 🧪 Como Testar

### Teste 1: Adicionar Regra
```typescript
// scripts/test-add-rule.ts
import { addRule } from '../lib/twitter-rules';

async function test() {
  const expertId = 'uuid-do-garyvee'; // Obter do Supabase
  const themes = ['marketing', 'sales'];

  const ruleId = await addRule(expertId, themes);
  console.log('Rule added:', ruleId);
}

test();
```

```bash
npx tsx scripts/test-add-rule.ts
```

### Teste 2: Listar Regras
```typescript
import { listRules } from '../lib/twitter-rules';

async function test() {
  const rules = await listRules();
  console.log('Active rules:', rules);
}

test();
```

### Teste 3: Sincronizar
```typescript
import { syncRules } from '../lib/twitter-rules';

async function test() {
  await syncRules();
  console.log('Sync complete');
}

test();
```

### Teste 4: Remover Regra
```typescript
import { removeRule } from '../lib/twitter-rules';

async function test() {
  const ruleId = 'uuid-da-regra'; // Obter do Supabase
  await removeRule(ruleId);
  console.log('Rule removed');
}

test();
```

---

## 🔐 Segurança

- ✅ Usa `SUPABASE_SERVICE_ROLE_KEY` (não anon key - precisa escrita)
- ✅ Validação de regras antes de enviar ao Twitter
- ✅ Rollback automático se falhar (remove do Twitter se não salvou no Supabase)
- ✅ Logs de todas as operações
- ⚠️ **TODO:** Rate limiting (Twitter permite 450 requests/15min)

---

## 📊 Limites do Twitter API

| Plano | Regras Max | Requests/15min |
|-------|-----------|----------------|
| Free | 0 (sem stream) | 450 |
| Basic | **25** | 450 |
| Pro | 1.000 | 450 |

**Validação:** Adicionar check no `addRule()` para contar regras ativas e bloquear se atingir limite do plano.

---

## 📚 Referências

- Twitter Rules API: https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/api-reference/post-tweets-search-stream-rules
- Rule Syntax: https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule
- Supabase JS Client: https://supabase.com/docs/reference/javascript/introduction

---

## ✅ Definition of Done

- [ ] `/lib/twitter-rules.ts` criado e funcionando
- [ ] Todas as funções CRUD implementadas
- [ ] Validação de regras (sintaxe + limites)
- [ ] Error handling robusto
- [ ] Tipos TypeScript completos
- [ ] Testes manuais passando (4 testes acima)
- [ ] Documentação JSDoc inline
- [ ] Logs de eventos salvos no Supabase

---

**Próxima Story:** Story 2.1 - Worker de Stream 24/7 (Railway/Render)
