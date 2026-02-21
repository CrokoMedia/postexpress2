# Story 2.3: Sistema de Notificações (Slack)

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** 📋 To Do
**Priority:** P1 (High)
**Estimate:** 2h
**Owner:** Backend Dev
**Sprint:** Sprint 1 - Semana 2
**Depends On:** Story 2.2 (Tweet Processing)

---

## 📋 Descrição

Implementar sistema de notificações via Slack Webhook para alertar a equipe quando tweets relevantes são detectados em tempo real. Incluir rate limiting para evitar spam.

---

## 🎯 Acceptance Criteria

- [ ] Slack Webhook configurado e funcionando
- [ ] Notificação enviada quando tweet novo é detectado
- [ ] Formato de mensagem rico (author, tweet, link, métricas)
- [ ] Rate limiting (max 10 notificações/hora por expert)
- [ ] Filtro de relevância (só notificar tweets importantes)
- [ ] Fallback gracioso (não quebrar se Slack falhar)
- [ ] Campo `notified` atualizado no Supabase
- [ ] Logs de notificações enviadas

---

## 🔧 Implementação

### 1. Configuração Slack Webhook

```bash
# .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_NOTIFICATIONS_ENABLED=true
NOTIFICATION_RATE_LIMIT_PER_HOUR=10
```

---

### 2. Biblioteca de Notificações

```typescript
// lib/notifications.ts

interface NotificationPayload {
  tweetId: string;
  author: {
    username: string;
    displayName: string;
    verified?: boolean;
  };
  text: string;
  url: string;
  metrics: {
    likes: number;
    retweets: number;
  };
  themes?: string[];
  publishedAt: string;
}

// Rate limiting em memória (por expert)
const notificationCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

/**
 * Verifica se pode notificar (rate limit)
 */
function canNotify(expertUsername: string): boolean {
  const limit = parseInt(process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '10');
  const now = Date.now();

  const record = notificationCounts.get(expertUsername);

  if (!record || now > record.resetAt) {
    // Novo período ou expirou
    notificationCounts.set(expertUsername, {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (record.count >= limit) {
    console.log(`[NOTIFY] Rate limit reached for @${expertUsername} (${record.count}/${limit})`);
    return false;
  }

  return true;
}

/**
 * Incrementa contador de notificações
 */
function incrementNotificationCount(expertUsername: string): void {
  const record = notificationCounts.get(expertUsername);
  if (record) {
    record.count++;
  }
}

/**
 * Envia notificação para Slack
 */
export async function notifySlack(payload: NotificationPayload): Promise<boolean> {
  // 1. Verificar se notificações estão habilitadas
  if (process.env.SLACK_NOTIFICATIONS_ENABLED !== 'true') {
    console.log('[NOTIFY] Slack notifications disabled');
    return false;
  }

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn('[NOTIFY] SLACK_WEBHOOK_URL not configured');
    return false;
  }

  // 2. Rate limiting
  if (!canNotify(payload.author.username)) {
    return false;
  }

  // 3. Construir mensagem Slack
  const message = buildSlackMessage(payload);

  // 4. Enviar webhook
  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    // 5. Incrementar contador
    incrementNotificationCount(payload.author.username);

    console.log(`[NOTIFY] ✅ Slack notification sent for tweet ${payload.tweetId}`);
    return true;

  } catch (error) {
    console.error('[NOTIFY] ❌ Failed to send Slack notification:', error);
    return false;
  }
}

/**
 * Constrói mensagem formatada para Slack
 */
function buildSlackMessage(payload: NotificationPayload) {
  const verifiedBadge = payload.author.verified ? ' ✓' : '';
  const themesText = payload.themes && payload.themes.length > 0
    ? `\n🏷️ *Temas:* ${payload.themes.join(', ')}`
    : '';

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🐦 Novo Tweet Detectado',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*@${payload.author.username}*${verifiedBadge} (${payload.author.displayName})\n\n"${payload.text}"`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*❤️ Likes:*\n${payload.metrics.likes}`
          },
          {
            type: 'mrkdwn',
            text: `*🔁 Retweets:*\n${payload.metrics.retweets}`
          },
          {
            type: 'mrkdwn',
            text: `*🕒 Publicado:*\n${formatDate(payload.publishedAt)}`
          },
          {
            type: 'mrkdwn',
            text: `*🔗 Link:*\n<${payload.url}|Ver no Twitter>`
          }
        ]
      }
    ],
    // Fallback text para notificações mobile
    text: `Novo tweet de @${payload.author.username}: "${payload.text.substring(0, 100)}..."`
  };
}

/**
 * Formata data para exibição
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Verifica se tweet é relevante o suficiente para notificar
 * (filtro de qualidade)
 */
export function isRelevantForNotification(tweet: any): boolean {
  // Critérios de relevância:
  // 1. Mínimo de caracteres (evitar tweets muito curtos)
  if (tweet.text.length < 50) return false;

  // 2. Não é reply (opcional - configurável)
  if (tweet.in_reply_to_user_id) return false;

  // 3. Tem tema classificado (se IA ativada)
  if (tweet.themes && tweet.themes.length === 0) return false;

  // 4. Mínimo de engajamento para experts grandes (opcional)
  // Se expert tem > 100k followers, só notificar se > 10 likes
  // (implementar depois quando tivermos dados do expert)

  return true;
}
```

---

### 3. Integração no Worker

```typescript
// worker/twitter-stream-worker.ts (adicionar após processTweet)

import { notifySlack, isRelevantForNotification } from '../lib/notifications';

async function processTweet(tweetData: any, authorData: any) {
  // ... código existente de processamento ...

  // Após salvar no Supabase:
  if (insertError) {
    throw insertError;
  }

  // NOVO: Enviar notificação Slack
  if (isRelevantForNotification(metadata)) {
    const notified = await notifySlack({
      tweetId: metadata.tweetId,
      author: {
        username: metadata.author.username,
        displayName: metadata.author.displayName,
        verified: metadata.author.verified
      },
      text: metadata.text,
      url: metadata.url,
      metrics: {
        likes: metadata.metrics.likes,
        retweets: metadata.metrics.retweets
      },
      themes: themes.length > 0 ? themes : undefined,
      publishedAt: metadata.timestamps.published
    });

    // Atualizar campo notified no Supabase
    if (notified) {
      await supabase
        .from('twitter_content_updates')
        .update({
          notified: true,
          notified_at: new Date().toISOString()
        })
        .eq('tweet_id', metadata.tweetId);
    }
  }

  // ... resto do código ...
}
```

---

## 📁 Arquivos Afetados

```
📁 postexpress2/
├── .env                               # MODIFICADO (adicionar SLACK_WEBHOOK_URL)
├── .env.example                       # MODIFICADO (template)
├── lib/
│   └── notifications.ts               # CRIADO
└── worker/
    └── twitter-stream-worker.ts       # MODIFICADO (integrar notificações)
```

---

## 🧪 Como Testar

### Teste 1: Configurar Slack Webhook

1. Acesse: https://api.slack.com/messaging/webhooks
2. Crie Incoming Webhook
3. Escolha canal (ex: #twitter-alerts)
4. Copie URL e adicione ao `.env`

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
SLACK_NOTIFICATIONS_ENABLED=true
```

### Teste 2: Enviar Notificação Manual

```typescript
// scripts/test-slack-notification.ts
import { notifySlack } from '../lib/notifications';

async function test() {
  const result = await notifySlack({
    tweetId: '123456789',
    author: {
      username: 'garyvee',
      displayName: 'Gary Vaynerchuk',
      verified: true
    },
    text: 'Just launched a new marketing framework for real estate agents! 🚀',
    url: 'https://twitter.com/garyvee/status/123456789',
    metrics: {
      likes: 150,
      retweets: 45
    },
    themes: ['marketing', 'frameworks', 'real estate'],
    publishedAt: new Date().toISOString()
  });

  console.log('Notification sent:', result);
}

test();
```

```bash
npx tsx scripts/test-slack-notification.ts
# Verificar mensagem no Slack
```

### Teste 3: Rate Limiting

```typescript
// Enviar 15 notificações seguidas (limite = 10)
for (let i = 0; i < 15; i++) {
  await notifySlack({
    tweetId: `test-${i}`,
    author: { username: 'test_user', displayName: 'Test' },
    text: `Test notification ${i}`,
    url: 'https://twitter.com/test',
    metrics: { likes: 0, retweets: 0 },
    publishedAt: new Date().toISOString()
  });
}

// Deve enviar apenas 10, bloquear as outras 5
```

### Teste 4: Filtro de Relevância

```typescript
// Tweet curto (< 50 chars) - não deve notificar
const shortTweet = { text: 'Hi!', in_reply_to_user_id: null, themes: ['test'] };
console.log('Short tweet relevant?', isRelevantForNotification(shortTweet)); // false

// Tweet reply - não deve notificar
const replyTweet = { text: 'Long reply text...', in_reply_to_user_id: '123', themes: ['test'] };
console.log('Reply relevant?', isRelevantForNotification(replyTweet)); // false

// Tweet normal - deve notificar
const normalTweet = { text: 'This is a normal tweet with enough content to be relevant', in_reply_to_user_id: null, themes: ['marketing'] };
console.log('Normal tweet relevant?', isRelevantForNotification(normalTweet)); // true
```

---

## 🔐 Segurança

- ✅ Webhook URL protegida no `.env`
- ✅ Rate limiting previne spam
- ✅ Fallback gracioso (não quebra se Slack falhar)
- ⚠️ **TODO:** Rotação de webhook URL a cada 6 meses

---

## 📊 Métricas

### KPIs
- **Taxa de notificações:** < 10/hora por expert
- **Taxa de sucesso:** > 95% (notificações entregues)
- **Latência:** < 2s (detecção → notificação Slack)

### Monitoramento
```sql
-- Notificações enviadas nas últimas 24h
SELECT COUNT(*)
FROM twitter_content_updates
WHERE notified = TRUE
  AND notified_at > NOW() - INTERVAL '24 hours';

-- Taxa de sucesso
SELECT
  COUNT(*) FILTER (WHERE notified = TRUE) * 100.0 / COUNT(*) AS success_rate
FROM twitter_content_updates
WHERE detected_at > NOW() - INTERVAL '24 hours';
```

---

## 🎨 Exemplo de Mensagem Slack

```
┌─────────────────────────────────────────────────┐
│ 🐦 Novo Tweet Detectado                         │
├─────────────────────────────────────────────────┤
│ @garyvee ✓ (Gary Vaynerchuk)                    │
│                                                 │
│ "Just launched a new marketing framework for    │
│  real estate agents! Link in bio 🚀"            │
│                                                 │
│ ❤️ Likes: 150      🔁 Retweets: 45              │
│ 🕒 Publicado: 5 min atrás                       │
│ 🔗 Link: Ver no Twitter                         │
│                                                 │
│ 🏷️ Temas: marketing, frameworks, real estate   │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Melhorias Futuras (Backlog)

- [ ] Suporte a múltiplos canais Slack (por tema)
- [ ] Email notifications (para clientes)
- [ ] Push notifications (app mobile)
- [ ] Discord webhook (alternativa)
- [ ] Webhooks customizados (clientes configurarem próprios)
- [ ] Notificações agregadas (digest diário)

---

## 📚 Referências

- Slack Incoming Webhooks: https://api.slack.com/messaging/webhooks
- Slack Block Kit Builder: https://app.slack.com/block-kit-builder
- Slack Message Formatting: https://api.slack.com/reference/surfaces/formatting

---

## ✅ Definition of Done

- [ ] `lib/notifications.ts` criado e funcionando
- [ ] Slack webhook configurado
- [ ] Notificações sendo enviadas em tempo real
- [ ] Formato de mensagem rico implementado
- [ ] Rate limiting funcionando (10/hora)
- [ ] Filtro de relevância aplicado
- [ ] Campo `notified` atualizado no Supabase
- [ ] Testes manuais passando (4 testes acima)
- [ ] Logs de notificações salvos
- [ ] Documentação inline (JSDoc)

---

**Próxima Story:** Story 3.1 - Dashboard de Gerenciamento de Experts
