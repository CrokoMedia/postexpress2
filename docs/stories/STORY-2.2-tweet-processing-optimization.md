# Story 2.2: Processamento e Salvamento de Tweets (Otimizado)

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** 📋 To Do
**Priority:** P1 (High)
**Estimate:** 3h
**Owner:** Backend Dev
**Sprint:** Sprint 1 - Semana 2
**Depends On:** Story 2.1 (Worker Stream)

---

## 📋 Descrição

Otimizar o processamento de tweets capturados pelo worker: deduplicação, extração de metadados, associação com experts, classificação automática de temas (opcional com IA) e enriquecimento de dados.

---

## 🎯 Acceptance Criteria

- [ ] Deduplicação eficiente (evitar tweets duplicados)
- [ ] Extração completa de metadados (likes, RTs, replies)
- [ ] Associação correta com expert no Supabase
- [ ] Classificação automática de temas (IA - opcional)
- [ ] Enriquecimento com dados do autor (followers, bio)
- [ ] Performance otimizada (< 100ms por tweet)
- [ ] Error handling robusto (tweets malformados)
- [ ] Logs detalhados para debugging

---

## 🔧 Tarefas Técnicas

### 1. Deduplicação Inteligente

```typescript
// worker/tweet-processor.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verifica se tweet já foi processado
 * Usa cache em memória + fallback Supabase
 */
const processedTweetsCache = new Set<string>();
const CACHE_MAX_SIZE = 10000;

async function isDuplicate(tweetId: string): Promise<boolean> {
  // 1. Check cache (rápido)
  if (processedTweetsCache.has(tweetId)) {
    return true;
  }

  // 2. Check Supabase (fallback)
  const { data } = await supabase
    .from('twitter_content_updates')
    .select('id')
    .eq('tweet_id', tweetId)
    .single();

  if (data) {
    // Adicionar ao cache
    if (processedTweetsCache.size < CACHE_MAX_SIZE) {
      processedTweetsCache.add(tweetId);
    }
    return true;
  }

  return false;
}
```

---

### 2. Extração de Metadados Completos

```typescript
interface TweetMetadata {
  tweetId: string;
  text: string;
  url: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    followersCount?: number;
    verified?: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    quotes?: number;
    impressions?: number;
  };
  timestamps: {
    published: string;
    detected: string;
  };
  media?: Array<{
    type: 'photo' | 'video' | 'gif';
    url: string;
  }>;
  entities?: {
    hashtags: string[];
    mentions: string[];
    urls: string[];
  };
}

function extractMetadata(tweetData: any, authorData: any): TweetMetadata {
  const tweet = tweetData;
  const author = authorData;

  return {
    tweetId: tweet.id,
    text: tweet.text,
    url: `https://twitter.com/${author.username}/status/${tweet.id}`,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.name,
      followersCount: author.public_metrics?.followers_count,
      verified: author.verified
    },
    metrics: {
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      replies: tweet.public_metrics?.reply_count || 0,
      quotes: tweet.public_metrics?.quote_count || 0,
      impressions: tweet.public_metrics?.impression_count || 0
    },
    timestamps: {
      published: tweet.created_at,
      detected: new Date().toISOString()
    },
    media: tweet.attachments?.media_keys?.map((key: string) => {
      // Mapear media_key para URL (requer expansão na API)
      return { type: 'photo', url: '' }; // TODO: implementar
    }),
    entities: {
      hashtags: tweet.entities?.hashtags?.map((h: any) => h.tag) || [],
      mentions: tweet.entities?.mentions?.map((m: any) => m.username) || [],
      urls: tweet.entities?.urls?.map((u: any) => u.expanded_url) || []
    }
  };
}
```

---

### 3. Associação com Expert

```typescript
/**
 * Busca expert por username com cache
 */
const expertCache = new Map<string, string>(); // username -> expert_id

async function getExpertIdByUsername(username: string): Promise<string | null> {
  // 1. Check cache
  if (expertCache.has(username)) {
    return expertCache.get(username)!;
  }

  // 2. Query Supabase
  const { data, error } = await supabase
    .from('twitter_experts')
    .select('id')
    .eq('twitter_username', username)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.warn(`[EXPERT] Not found: @${username}`);
    return null;
  }

  // 3. Cache result
  expertCache.set(username, data.id);
  return data.id;
}
```

---

### 4. Classificação Automática de Temas (IA - Opcional)

```typescript
/**
 * Classifica tweet em temas usando Claude API (opcional)
 * Só roda se ANTHROPIC_API_KEY estiver configurado
 */
async function classifyThemes(tweetText: string): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return []; // Skip se não tiver API key
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Mais barato
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Classifique este tweet em até 3 temas (marketing, sales, frameworks, real estate, AI, entrepreneurship, etc). Retorne apenas os temas separados por vírgula.

Tweet: "${tweetText}"

Temas:`
        }]
      })
    });

    const result = await response.json();
    const themesText = result.content[0].text.trim();
    return themesText.split(',').map((t: string) => t.trim().toLowerCase());

  } catch (error) {
    console.error('[CLASSIFY] Error:', error);
    return [];
  }
}
```

---

### 5. Função de Processamento Completa

```typescript
/**
 * Processa tweet completo: dedup, metadata, expert, temas, save
 */
export async function processTweet(tweetData: any, authorData: any): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Deduplicação
    if (await isDuplicate(tweetData.id)) {
      console.log(`[TWEET] Duplicate, skipping: ${tweetData.id}`);
      return;
    }

    // 2. Extração de metadados
    const metadata = extractMetadata(tweetData, authorData);

    // 3. Associação com expert
    const expertId = await getExpertIdByUsername(authorData.username);

    // 4. Classificação de temas (opcional)
    const themes = await classifyThemes(metadata.text);

    // 5. Salvar no Supabase
    const { error: insertError } = await supabase
      .from('twitter_content_updates')
      .insert({
        tweet_id: metadata.tweetId,
        tweet_text: metadata.text,
        tweet_url: metadata.url,
        expert_id: expertId,
        author_username: metadata.author.username,
        author_display_name: metadata.author.displayName,
        likes_count: metadata.metrics.likes,
        retweets_count: metadata.metrics.retweets,
        replies_count: metadata.metrics.replies,
        published_at: metadata.timestamps.published,
        detected_at: metadata.timestamps.detected,
        themes: themes.length > 0 ? themes : null,
        notified: false,
        raw_data: { tweet: tweetData, author: authorData }
      });

    if (insertError) {
      throw insertError;
    }

    // 6. Adicionar ao cache
    if (processedTweetsCache.size < CACHE_MAX_SIZE) {
      processedTweetsCache.add(metadata.tweetId);
    }

    const processingTime = Date.now() - startTime;
    console.log(`[TWEET] ✅ Processed in ${processingTime}ms: @${metadata.author.username} - "${metadata.text.substring(0, 50)}..."`);

    // 7. Log de sucesso
    await logEvent('tweet_processed', {
      tweet_id: metadata.tweetId,
      expert_id: expertId,
      processing_time_ms: processingTime,
      themes
    });

  } catch (error) {
    console.error('[TWEET] ❌ Processing error:', error);
    await logEvent('tweet_processing_error', {
      tweet_id: tweetData.id,
      error: (error as Error).message
    });
  }
}

async function logEvent(eventType: string, metadata: any) {
  await supabase.from('twitter_monitoring_log').insert({
    event_type: eventType,
    success: eventType !== 'tweet_processing_error',
    metadata
  });
}
```

---

## 📁 Arquivos Afetados

```
📁 postexpress2/
└── worker/
    ├── twitter-stream-worker.ts       # MODIFICADO (usar novo processTweet)
    └── tweet-processor.ts             # CRIADO (lógica de processamento)
```

---

## 🧪 Como Testar

### Teste 1: Deduplicação
```typescript
// Enviar mesmo tweet 2x (simular)
const tweetData = { id: '123456', text: 'Test tweet', created_at: new Date().toISOString() };
const authorData = { username: 'test_user', name: 'Test User' };

await processTweet(tweetData, authorData); // Deve salvar
await processTweet(tweetData, authorData); // Deve pular (duplicate)
```

### Teste 2: Performance
```typescript
// Processar 100 tweets e medir tempo médio
const startTime = Date.now();
for (let i = 0; i < 100; i++) {
  await processTweet(mockTweet(i), mockAuthor());
}
const avgTime = (Date.now() - startTime) / 100;
console.log(`Average processing time: ${avgTime}ms`);
// Deve ser < 100ms
```

### Teste 3: Classificação de Temas
```typescript
const tweetText = "Just launched a new marketing framework for real estate agents!";
const themes = await classifyThemes(tweetText);
console.log('Classified themes:', themes);
// Esperado: ['marketing', 'frameworks', 'real estate']
```

### Teste 4: Expert Não Encontrado
```typescript
const unknownAuthor = { username: 'unknown_user_12345', name: 'Unknown' };
const expertId = await getExpertIdByUsername(unknownAuthor.username);
console.log('Expert ID:', expertId);
// Deve retornar null (sem erro)
```

---

## 🔐 Segurança

- ✅ Cache em memória (não persiste dados sensíveis)
- ✅ Validação de dados antes de inserir no banco
- ✅ API key da Anthropic protegida (só se configurado)
- ✅ Rate limiting (não fazer muitas chamadas à IA)

---

## 📊 Performance

### Métricas Alvo
- **Tempo de processamento:** < 100ms por tweet
- **Cache hit rate:** > 80% (após algumas horas)
- **Duplicatas evitadas:** > 95%

### Otimizações
1. **Cache em memória** para experts e tweets processados
2. **Batch insert** (futuro - se volume alto)
3. **Lazy loading** da classificação de temas (só se necessário)

---

## 📚 Referências

- Twitter API Tweet Fields: https://developer.twitter.com/en/docs/twitter-api/data-dictionary/object-model/tweet
- Anthropic Claude Haiku: https://docs.anthropic.com/claude/docs/models-overview#claude-3-haiku

---

## ✅ Definition of Done

- [ ] `tweet-processor.ts` criado com todas as funções
- [ ] Deduplicação funcionando (cache + Supabase)
- [ ] Metadados completos extraídos
- [ ] Associação com expert funcionando
- [ ] Classificação de temas (opcional) implementada
- [ ] Performance < 100ms por tweet
- [ ] Testes manuais passando (4 testes acima)
- [ ] Logs detalhados para debugging
- [ ] Integrado no worker principal

---

**Próxima Story:** Story 2.3 - Sistema de Notificações (Slack)
