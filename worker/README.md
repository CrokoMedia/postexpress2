# Analysis Worker

Sistema de processamento em background de análises de perfis do Instagram.

## 📋 O que faz o Worker?

O **Analysis Worker** monitora a tabela `analysis_queue` no Supabase e processa análises pendentes automaticamente:

1. **Scraping** - Extrai posts e comentários do Instagram via Apify
2. **OCR** - Analisa texto em imagens usando Gemini Vision API
3. **Auditoria** - Executa análise com os 5 auditores especializados
4. **Persistência** - Salva todos os dados no Supabase

## 🚀 Como usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Certifique-se de que o arquivo `.env` contém:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Apify (para scraping)
APIFY_API_TOKEN=seu-token-apify

# Google AI (para OCR)
GOOGLE_API_KEY=sua-google-api-key

# Anthropic (para auditores)
ANTHROPIC_API_KEY=sua-anthropic-api-key
```

### 3. Iniciar o Worker

#### Modo produção
```bash
npm run worker
```

#### Modo desenvolvimento (auto-reload)
```bash
npm run worker:dev
```

## 📊 Fluxo de processamento

```
┌─────────────────────────────────────────┐
│  1. Monitor (a cada 5s)                 │
│  ├─ Busca próximo item na fila          │
│  ├─ Prioriza por: priority, created_at  │
│  └─ Status: pending                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Scraping (10min timeout)            │
│  ├─ Extrai posts do Instagram           │
│  ├─ Extrai até 50 comentários/post      │
│  └─ Salva: {username}-posts-with-       │
│            comments.json                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. OCR (10min timeout)                 │
│  ├─ Analisa imagens com Gemini Vision   │
│  ├─ Extrai texto, CTAs, estrutura       │
│  └─ Salva: {username}-ocr-gemini-       │
│            analysis.json                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Auditoria (15min timeout)           │
│  ├─ Executa 5 auditores (Claude)        │
│  ├─ Kahneman, Schwartz, Hormozi,        │
│  │   Cagan, Graham                       │
│  └─ Salva: {username}-complete-         │
│            analysis.json                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. Persistência no Supabase            │
│  ├─ Salva/atualiza Profile              │
│  ├─ Cria Audit                          │
│  ├─ Insere Posts                        │
│  ├─ Insere Comments                     │
│  └─ Atualiza queue: completed           │
└─────────────────────────────────────────┘
```

## 🔄 Sistema de Retry

- **Máximo de tentativas:** 3 (configurável em `MAX_RETRIES`)
- **Comportamento:**
  - Erro na 1ª tentativa → volta para fila (`status: pending`)
  - Erro na 2ª tentativa → volta para fila
  - Erro na 3ª tentativa → marca como `failed`

## 📈 Status e Progresso

O worker atualiza a tabela `analysis_queue` em tempo real:

| Campo | Valores | Descrição |
|-------|---------|-----------|
| `status` | `pending`, `processing`, `completed`, `failed` | Estado atual |
| `progress` | 0-100 | Percentual de conclusão |
| `current_phase` | `scraping`, `ocr`, `audit`, `saving` | Fase atual |
| `error_message` | String | Mensagem de erro (se houver) |
| `started_at` | Timestamp | Quando iniciou |
| `completed_at` | Timestamp | Quando finalizou |

### Mapeamento de progresso

| Fase | Progresso |
|------|-----------|
| scraping | 10% |
| comments | 30% |
| ocr | 50% |
| audit | 70% |
| saving | 90% |
| completed | 100% |

## 🔧 Configurações

Edite `worker/analysis-worker.ts`:

```typescript
const POLL_INTERVAL = 5000  // 5 segundos (tempo entre verificações)
const MAX_RETRIES = 3       // Máximo de tentativas por análise
```

## 📝 Logs

O worker exibe logs detalhados:

```
🤖 Analysis Worker iniciado
📊 Monitorando fila a cada 5s...
🔄 Máximo de 3 tentativas por análise

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 PROCESSANDO ANÁLISE: @username
   Queue ID: abc-123-def
   Posts: 10 | Skip OCR: false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 FASE 1/3: Scraping de posts e comentários...
✅ Scraping concluído!

🔍 FASE 2/3: Análise OCR com Gemini Vision...
✅ OCR concluído!

🎯 FASE 3/3: Auditoria com 5 auditores...
✅ Auditoria concluída!

💾 FASE 4/4: Salvando dados no Supabase...
[Supabase] 1/4 Salvando perfil...
[Supabase] ✅ Perfil salvo: abc-123
[Supabase] 2/4 Salvando auditoria...
[Supabase] ✅ Auditoria salva: def-456
[Supabase] 3/4 Salvando posts...
[Supabase] ✅ 10 posts salvos
[Supabase] 4/4 Salvando comentários...
[Supabase] ✅ 234 comentários salvos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ANÁLISE CONCLUÍDA: @username
   Audit ID: def-456
   Posts: 10
   Comentários: 234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🛑 Parar o Worker

- **Ctrl+C** - Graceful shutdown (aguarda análise atual finalizar)
- **SIGTERM** - Termina o processo

## 🧪 Testando

### 1. Criar análise via API

```bash
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "username": "rodrigogunter_",
    "post_limit": 10,
    "skip_ocr": false
  }'
```

### 2. Verificar se entrou na fila

```sql
SELECT * FROM analysis_queue WHERE status = 'pending';
```

### 3. Iniciar worker

```bash
npm run worker
```

### 4. Acompanhar progresso

O worker atualiza `analysis_queue` em tempo real. Use a interface web para acompanhar.

## 🐛 Troubleshooting

### Worker não encontra análises pendentes

- Verificar se há registros com `status = 'pending'` na tabela
- Verificar conexão com Supabase
- Checar permissões do `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "Missing Supabase environment variables"

Certifique-se de que `.env` está no root do projeto e contém:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Scraping falhando

- Verificar `APIFY_API_TOKEN` no `.env`
- Verificar se username existe no Instagram
- Checar créditos Apify

### OCR falhando

- Verificar `GOOGLE_API_KEY` no `.env`
- Checar quota da Gemini Vision API
- Se não for crítico, use `skip_ocr: true`

### Auditoria falhando

- Verificar `ANTHROPIC_API_KEY` no `.env`
- Checar créditos Claude API
- Verificar se arquivos JSON anteriores foram criados

## 📚 Arquivos criados

Durante o processamento, são criados arquivos em `squad-auditores/data/`:

```
squad-auditores/data/
├── {username}-posts-with-comments.json     (Fase 1)
├── {username}-ocr-gemini-analysis.json     (Fase 2)
└── {username}-complete-analysis.json       (Fase 3)
```

Esses arquivos são mantidos como backup/debug e também são salvos no Supabase.

## 🚀 Produção

### Deploy com PM2

```bash
npm install -g pm2

pm2 start npm --name "postexpress-worker" -- run worker
pm2 save
pm2 startup
```

### Deploy com Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

CMD ["npm", "run", "worker"]
```

### Deploy com systemd

Crie `/etc/systemd/system/postexpress-worker.service`:

```ini
[Unit]
Description=Post Express Analysis Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/postexpress2
ExecStart=/usr/bin/npm run worker
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Ative:
```bash
sudo systemctl enable postexpress-worker
sudo systemctl start postexpress-worker
sudo systemctl status postexpress-worker
```

## 📖 Referências

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Apify Actors](https://docs.apify.com/actors)
- [Gemini Vision API](https://ai.google.dev/tutorials/rest_quickstart)
- [Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
