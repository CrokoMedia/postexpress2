# Story 2.1: Worker de Stream 24/7 (Railway/Render)

**Epic:** EPIC-001 - Twitter Stream API Integration
**Status:** 📋 To Do
**Priority:** P0 (Critical)
**Estimate:** 5h
**Owner:** Backend Dev / DevOps
**Sprint:** Sprint 1 - Semana 2

---

## 📋 Descrição

Criar worker Node.js que mantém conexão persistente com Twitter Filtered Stream API 24/7, processa tweets em tempo real e salva no Supabase. Deploy em Railway ou Render (não pode ser Vercel - tem timeout de 10s).

---

## 🎯 Acceptance Criteria

- [ ] Worker Node.js conecta ao Twitter Stream e mantém conexão aberta
- [ ] Processa tweets em tempo real (< 10s de latência)
- [ ] Salva tweets no Supabase (`twitter_content_updates`)
- [ ] Auto-reconnect em caso de desconexão
- [ ] Health check endpoint (`GET /health`)
- [ ] Logs estruturados (timestamp, event, metadata)
- [ ] Deploy em Railway ou Render
- [ ] Uptime > 99% (monitorado)
- [ ] Graceful shutdown (SIGTERM)

---

## 🏗️ Arquitetura

```
Railway/Render (Container 24/7)
└── worker/twitter-stream-worker.ts
    ├── connectToStream() → Abre conexão persistente
    ├── processChunk() → Processa linha JSON do stream
    ├── saveTweet() → Salva no Supabase
    ├── handleDisconnect() → Auto-reconnect com backoff
    └── healthCheck() → Express endpoint para monitoramento
```

---

## 🔧 Implementação

### 1. Estrutura de Pastas

```
📁 postexpress2/
└── worker/
    ├── package.json              # Dependências isoladas
    ├── tsconfig.json             # Config TypeScript
    ├── Dockerfile                # Para Railway/Render
    ├── railway.json              # Config Railway (ou render.yaml)
    ├── twitter-stream-worker.ts  # Worker principal
    └── .env.example              # Template de env vars
```

---

### 2. Worker Principal

```typescript
// worker/twitter-stream-worker.ts

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
const TWITTER_STREAM_URL = 'https://api.twitter.com/2/tweets/search/stream';
const PORT = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// STATE
// ============================================

let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BACKOFF_BASE = 5000; // 5 segundos

// ============================================
// STREAM CONNECTION
// ============================================

async function connectToStream() {
  console.log('[STREAM] Connecting to Twitter Filtered Stream...');

  try {
    const response = await fetch(
      `${TWITTER_STREAM_URL}?tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=username,name`,
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body from Twitter API');
    }

    isConnected = true;
    reconnectAttempts = 0;
    console.log('[STREAM] ✅ Connected successfully');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Stream loop (roda infinitamente até desconexão)
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log('[STREAM] Connection closed by Twitter');
        isConnected = false;
        handleDisconnect();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      await processChunk(chunk);
    }

  } catch (error) {
    console.error('[STREAM] ❌ Connection error:', error);
    isConnected = false;
    handleDisconnect();
  }
}

// ============================================
// CHUNK PROCESSING
// ============================================

async function processChunk(chunk: string) {
  const lines = chunk.split('\r\n').filter(line => line.trim());

  for (const line of lines) {
    try {
      const data = JSON.parse(line);

      // Ignorar heartbeats (linhas vazias)
      if (!data.data) continue;

      const tweet = data.data;
      const author = data.includes?.users?.[0];

      if (!tweet || !author) {
        console.warn('[STREAM] Invalid tweet format:', line);
        continue;
      }

      // Processar tweet
      await processTweet(tweet, author);

    } catch (error) {
      // Linha não é JSON válido (provavelmente heartbeat)
      if (line.trim() !== '') {
        console.warn('[STREAM] Non-JSON line:', line);
      }
    }
  }
}

// ============================================
// TWEET PROCESSING
// ============================================

async function processTweet(tweet: any, author: any) {
  console.log(`[TWEET] New tweet from @${author.username}: ${tweet.text.substring(0, 50)}...`);

  try {
    // 1. Buscar expert_id pelo username
    const { data: expert, error: expertError } = await supabase
      .from('twitter_experts')
      .select('id')
      .eq('twitter_username', author.username)
      .single();

    if (expertError) {
      console.warn(`[TWEET] Expert not found: @${author.username}`);
      // Continuar mesmo assim - pode ser expert novo
    }

    // 2. Salvar tweet no Supabase
    const { error: insertError } = await supabase
      .from('twitter_content_updates')
      .insert({
        tweet_id: tweet.id,
        tweet_text: tweet.text,
        tweet_url: `https://twitter.com/${author.username}/status/${tweet.id}`,
        expert_id: expert?.id || null,
        author_username: author.username,
        author_display_name: author.name,
        likes_count: tweet.public_metrics?.like_count || 0,
        retweets_count: tweet.public_metrics?.retweet_count || 0,
        replies_count: tweet.public_metrics?.reply_count || 0,
        published_at: tweet.created_at,
        detected_at: new Date().toISOString(),
        notified: false,
        raw_data: { tweet, author }
      });

    if (insertError) {
      // Ignorar duplicatas (constraint violation)
      if (insertError.code === '23505') {
        console.log(`[TWEET] Duplicate tweet, skipping: ${tweet.id}`);
        return;
      }
      throw insertError;
    }

    console.log(`[TWEET] ✅ Saved to Supabase: ${tweet.id}`);

    // 3. Log de sucesso
    await logEvent('tweet_detected', {
      tweet_id: tweet.id,
      author: author.username,
      expert_id: expert?.id
    });

  } catch (error) {
    console.error('[TWEET] ❌ Error processing tweet:', error);
    await logEvent('tweet_processing_error', {
      tweet_id: tweet.id,
      error: (error as Error).message
    });
  }
}

// ============================================
// RECONNECTION LOGIC
// ============================================

function handleDisconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[STREAM] ❌ Max reconnect attempts reached. Exiting.');
    process.exit(1);
  }

  reconnectAttempts++;
  const backoffTime = BACKOFF_BASE * Math.pow(2, reconnectAttempts - 1);

  console.log(`[STREAM] Reconnecting in ${backoffTime}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  setTimeout(() => {
    connectToStream();
  }, backoffTime);
}

// ============================================
// HEALTH CHECK (Express)
// ============================================

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: isConnected ? 'healthy' : 'disconnected',
    uptime: process.uptime(),
    reconnectAttempts,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[HEALTH] Health check running on port ${PORT}`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, shutting down gracefully...');
  isConnected = false;
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] SIGINT received, shutting down gracefully...');
  isConnected = false;
  process.exit(0);
});

// ============================================
// HELPERS
// ============================================

async function logEvent(eventType: string, metadata: any) {
  await supabase.from('twitter_monitoring_log').insert({
    event_type: eventType,
    success: true,
    metadata
  });
}

// ============================================
// START
// ============================================

console.log('[WORKER] Starting Twitter Stream Worker...');
console.log(`[WORKER] Environment: ${process.env.NODE_ENV || 'development'}`);

// Validar env vars
if (!TWITTER_BEARER_TOKEN) {
  console.error('❌ TWITTER_BEARER_TOKEN not set');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials not set');
  process.exit(1);
}

// Conectar ao stream
connectToStream();
```

---

### 3. package.json (worker)

```json
{
  "name": "twitter-stream-worker",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch twitter-stream-worker.ts",
    "build": "tsc",
    "start": "node dist/twitter-stream-worker.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

### 4. Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar apenas package files primeiro (cache layer)
COPY package*.json ./
RUN npm ci --production

# Copiar código
COPY . .

# Build TypeScript
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:${PORT:-3001}/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Expor porta
EXPOSE 3001

# Start worker
CMD ["node", "dist/twitter-stream-worker.js"]
```

---

### 5. railway.json (Railway config)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "worker/Dockerfile"
  },
  "deploy": {
    "startCommand": "node dist/twitter-stream-worker.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### 6. render.yaml (alternativa - Render config)

```yaml
services:
  - type: worker
    name: twitter-stream-worker
    env: docker
    dockerfilePath: ./worker/Dockerfile
    envVars:
      - key: TWITTER_BEARER_TOKEN
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
    autoDeploy: true
```

---

## 📁 Arquivos Criados/Modificados

```
📁 postexpress2/
└── worker/
    ├── package.json                    # CRIADO
    ├── tsconfig.json                   # CRIADO
    ├── Dockerfile                      # CRIADO
    ├── railway.json                    # CRIADO
    ├── render.yaml                     # CRIADO (alternativa)
    ├── twitter-stream-worker.ts        # CRIADO
    └── .env.example                    # CRIADO
```

---

## 🧪 Como Testar

### Teste Local (antes de deploy)

```bash
cd worker
npm install
cp .env.example .env
# Preencher .env com credenciais reais

# Rodar localmente
npm run dev

# Em outro terminal - testar health check
curl http://localhost:3001/health
```

### Deploy Railway

```bash
# 1. Criar conta Railway: https://railway.app
# 2. Instalar CLI
npm i -g @railway/cli

# 3. Login
railway login

# 4. Criar projeto
railway init

# 5. Adicionar env vars
railway variables set TWITTER_BEARER_TOKEN=xxx
railway variables set SUPABASE_URL=xxx
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx

# 6. Deploy
railway up

# 7. Ver logs
railway logs
```

### Deploy Render

```bash
# 1. Criar conta Render: https://render.com
# 2. Dashboard → New → Worker
# 3. Conectar repo GitHub
# 4. Selecionar pasta /worker
# 5. Adicionar env vars no dashboard
# 6. Deploy automático
```

---

## 🔐 Segurança

- ✅ Env vars protegidas (Railway/Render dashboard)
- ✅ Health check não expõe dados sensíveis
- ✅ Logs não incluem tokens
- ⚠️ **TODO:** Rate limiting no health check (evitar DDoS)

---

## 📊 Monitoramento

### Métricas a Coletar
- Uptime (Railway/Render dashboard)
- Latência de detecção (timestamp tweet vs. timestamp salvo)
- Tweets processados/hora
- Reconnects/dia
- Erros/hora

### Alertas
- Slack webhook quando desconectar
- Email se reconnect > 5x em 1h
- Alerta se latência > 30s

---

## 💰 Custo Estimado

| Provider | Plano | Custo/mês |
|----------|-------|-----------|
| **Railway** | Hobby | $5 (500h grátis + $0.01/h extra) |
| **Render** | Free | $0 (750h/mês) ✅ Recomendado para MVP |
| **Fly.io** | Free | $0 (3 VMs grátis) |

**Recomendação:** Começar com **Render Free** (750h = 31 dias rodando 24/7).

---

## 📚 Referências

- Twitter Stream API: https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/api-reference/get-tweets-search-stream
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs/docker

---

## ✅ Definition of Done

- [ ] Worker conecta ao stream e mantém conexão
- [ ] Processa tweets em < 10s
- [ ] Salva no Supabase sem duplicatas
- [ ] Auto-reconnect funcionando
- [ ] Health check endpoint ativo
- [ ] Logs estruturados no console
- [ ] Deploy em Railway ou Render
- [ ] Teste de 24h rodando (uptime > 99%)
- [ ] Documentação de deploy

---

**Próxima Story:** Story 2.2 - Processamento e Salvamento de Tweets (refinamento)
