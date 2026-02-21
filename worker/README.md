# Twitter Stream Worker (24/7)

Worker Node.js para monitoramento em tempo real do Twitter Filtered Stream API.

---

## 📋 Requisitos

- Node.js 18+
- Credenciais Twitter API (Bearer Token)
- Credenciais Supabase (URL + Service Role Key)
- Railway.app ou Render.com (para deploy 24/7)

---

## 🚀 Deploy Rápido

### Opção 1: Railway.app (Recomendado)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up

# 4. Adicionar variáveis de ambiente no painel
# https://railway.app/dashboard
```

### Opção 2: Render.com

```bash
# 1. Push para GitHub
git push origin main

# 2. Criar novo Worker no Render.com
# https://dashboard.render.com/select-repo

# 3. Selecionar repositório e configurar:
# - Type: Background Worker
# - Dockerfile Path: worker/Dockerfile
# - Docker Context: worker/

# 4. Adicionar variáveis de ambiente no painel
```

---

## 🔑 Variáveis de Ambiente

Adicionar no painel do Railway/Render:

```env
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAC...
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
PORT=3001
NODE_ENV=production
```

---

## 🧪 Teste Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env na raiz do projeto
cp ../.env.example ../.env
# Editar .env com credenciais reais

# 3. Rodar worker
npm run dev

# 4. Verificar health check em outro terminal
curl http://localhost:3001/health

# 5. Verificar stats
curl http://localhost:3001/stats
```

---

## 📊 Monitoramento

### Health Check
```bash
GET http://localhost:3001/health

Response:
{
  "status": "healthy",
  "connected": true,
  "uptime": 3600,
  "stats": {
    "tweetsProcessed": 42,
    "errors": 0,
    "reconnects": 0,
    "lastTweetAt": "2024-02-19T10:30:00Z"
  }
}
```

---

## 🔄 Funcionamento

1. **Conexão ao Stream:** Worker se conecta ao Twitter Filtered Stream API usando Bearer Token
2. **Processamento:** Para cada tweet recebido:
   - Busca expert no Supabase (por username)
   - Salva tweet em `twitter_content_updates`
   - Marca expert_id se encontrado
   - Loga evento em `twitter_monitoring_log`
3. **Auto-Reconnect:** Se desconectar, reconecta automaticamente com backoff exponencial (max 10 tentativas)
4. **Graceful Shutdown:** Responde a SIGTERM/SIGINT salvando estado antes de desligar

---

## 📁 Estrutura

```
worker/
├── twitter-stream-worker.js  # Worker principal
├── package.json               # Dependências
├── Dockerfile                 # Container Docker
├── railway.toml               # Config Railway
├── render.yaml                # Config Render
└── README.md                  # Esta documentação
```

---

**Desenvolvido para EPIC-001 (Story 2.1)**
Post Express | Twitter Stream Integration
