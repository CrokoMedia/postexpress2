# Twitter Rules Library - Exemplos de Uso

Guia completo de uso da biblioteca `lib/twitter-rules.ts`

---

## 📚 Importação

```typescript
import {
  addRule,
  removeRule,
  listRules,
  syncRules,
  updateExpertThemes,
  getRuleCount,
  canAddRule,
  deleteAllRules
} from '@/lib/twitter-rules';
```

---

## 🎯 Casos de Uso

### 1. Adicionar Expert e Criar Regra

```typescript
// Passo 1: Criar expert no Supabase
const { data: expert } = await supabase
  .from('twitter_experts')
  .insert({
    twitter_username: 'garyvee',
    display_name: 'Gary Vaynerchuk',
    themes: ['marketing', 'social media', 'entrepreneurship'],
    is_active: true
  })
  .select()
  .single();

// Passo 2: Criar regra no Twitter
const ruleId = await addRule(expert.id, expert.themes);
console.log('Rule created:', ruleId);

// Resultado: Regra "from:garyvee (marketing OR social media OR entrepreneurship) -is:retweet -is:reply"
```

---

### 2. Listar Todas as Regras

```typescript
const rules = await listRules();

rules.forEach(rule => {
  console.log(`Tag: ${rule.tag}`);
  console.log(`Value: ${rule.value}`);
  console.log(`ID: ${rule.id}`);
});

// Output:
// Tag: garyvee-marketing
// Value: from:garyvee (marketing OR social media OR entrepreneurship) -is:retweet -is:reply
// ID: 1234567890
```

---

### 3. Remover Regra

```typescript
// Opção 1: Por ruleId (UUID do Supabase)
await removeRule('a1b2c3d4-...');

// Opção 2: Via API (por expertId)
await fetch('/api/twitter/rules/remove', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ expertId: 'expert-uuid' })
});
```

---

### 4. Atualizar Temas de um Expert

```typescript
// Atualiza temas e recria regra automaticamente
await updateExpertThemes('expert-uuid', ['marketing', 'AI', 'frameworks']);

// Processo:
// 1. Remove regra antiga do Twitter
// 2. Marca regra antiga como inativa no Supabase
// 3. Cria nova regra com novos temas
```

---

### 5. Sincronizar Regras (Limpeza)

```typescript
// Remove regras órfãs (existem no Twitter mas não no Supabase)
await syncRules();

// Útil para:
// - Limpar regras criadas manualmente no Twitter
// - Resolver inconsistências
// - Manutenção periódica
```

---

### 6. Verificar Limite de Regras

```typescript
const count = await getRuleCount();
const canAdd = await canAddRule();

console.log(`Regras ativas: ${count}/25`);
console.log(`Pode adicionar mais: ${canAdd ? 'Sim' : 'Não'}`);

// Plano Basic: max 25 regras
```

---

### 7. Reset Completo (Dev/Teste)

```typescript
// ⚠️ CUIDADO: Deleta TODAS as regras do Twitter
await deleteAllRules();

// Usar apenas em desenvolvimento/teste!
```

---

## 🌐 Uso via API Routes

### Adicionar Regra

```bash
curl -X POST http://localhost:3000/api/twitter/rules/add \
  -H "Content-Type: application/json" \
  -d '{
    "expertId": "uuid-do-expert",
    "themes": ["marketing", "sales"]
  }'
```

**Response:**
```json
{
  "success": true,
  "ruleId": "1234567890",
  "message": "Rule added successfully"
}
```

---

### Remover Regra

```bash
curl -X POST http://localhost:3000/api/twitter/rules/remove \
  -H "Content-Type: application/json" \
  -d '{ "expertId": "uuid-do-expert" }'
```

---

### Listar Regras

```bash
curl http://localhost:3000/api/twitter/rules/list
```

**Response:**
```json
{
  "success": true,
  "rules": [
    {
      "id": "1234567890",
      "value": "from:garyvee (marketing OR sales)",
      "tag": "garyvee-marketing",
      "supabaseId": "uuid",
      "expertId": "uuid",
      "expert": {
        "twitter_username": "garyvee",
        "display_name": "Gary Vaynerchuk"
      }
    }
  ],
  "count": 1,
  "limit": 25,
  "remaining": 24
}
```

---

### Sincronizar Regras

```bash
curl -X POST http://localhost:3000/api/twitter/rules/sync
```

---

### Atualizar Temas

```bash
curl -X POST http://localhost:3000/api/twitter/rules/update \
  -H "Content-Type: application/json" \
  -d '{
    "expertId": "uuid-do-expert",
    "themes": ["marketing", "AI", "frameworks"]
  }'
```

---

## 🧪 Testando Localmente

```bash
# 1. Validar schema
node scripts/validate-twitter-schema.cjs

# 2. Testar biblioteca
node scripts/test-twitter-rules.cjs

# 3. Criar expert de teste (via Supabase SQL Editor)
INSERT INTO twitter_experts (twitter_username, display_name, themes, is_active)
VALUES ('test_user', 'Test User', ARRAY['test', 'demo'], TRUE);

# 4. Adicionar regra via API
curl -X POST http://localhost:3000/api/twitter/rules/add \
  -H "Content-Type: application/json" \
  -d '{
    "expertId": "uuid-do-test-user",
    "themes": ["test", "demo"]
  }'

# 5. Verificar no Twitter Developer Portal
# https://developer.twitter.com/en/portal/dashboard
# Ver regra criada em: Products > Twitter API > Stream Rules
```

---

## ⚠️ Limites e Boas Práticas

### Limites do Twitter API Basic

| Recurso | Limite |
|---------|--------|
| Regras máximas | 25 |
| Caracteres por regra | 512 |
| Operadores OR por regra | 30 |
| Requests por 15 min | 450 |

### Boas Práticas

1. **Sempre validar antes de adicionar:**
   ```typescript
   if (await canAddRule()) {
     await addRule(expertId, themes);
   } else {
     console.warn('Rule limit reached!');
   }
   ```

2. **Sincronizar periodicamente:**
   ```typescript
   // Rodar a cada 24h via cron
   await syncRules();
   ```

3. **Não exceder limites:**
   - Max 25 regras (plano Basic)
   - Max 30 temas por expert (OR limit)
   - Max 512 caracteres na regra

4. **Tratar erros:**
   ```typescript
   try {
     await addRule(expertId, themes);
   } catch (error) {
     if (error.message.includes('Rule too long')) {
       // Reduzir número de temas
     } else if (error.message.includes('limit reached')) {
       // Remover regras antigas
     }
   }
   ```

---

## 🔗 Próximos Passos

1. ✅ Biblioteca implementada (Story 1.3)
2. 📋 Implementar Worker Stream 24/7 (Story 2.1)
3. 📋 Dashboard de Experts (Story 3.1)

---

**Documentação completa:** Ver `/lib/twitter-rules.ts` para detalhes de implementação.
