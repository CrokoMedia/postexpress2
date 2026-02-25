# 🤖 Post Express Workers

Este diretório contém 2 workers 24/7 para processamento assíncrono:

1. **Analysis Worker** → Processa análises de Instagram (principal)
2. **Twitter Stream Worker** → Monitora Twitter em tempo real

---

## 🎯 Analysis Worker (Principal)

Worker que processa análises de perfis do Instagram automaticamente.

### O que faz

1. Monitora fila (`analysis_queue`) a cada 5 segundos
2. Processa análises pendentes em ordem de prioridade
3. Pipeline completo:
   - Scraping de posts + comentários (Apify)
   - OCR de slides (Gemini Vision)
   - Análise completa (extração de dados)
   - Auditoria com 5 frameworks (Claude)
   - Salvar no Supabase
4. Retry automático até 3 tentativas
5. Recuperação de análises travadas (>10 min)

### Quick Start Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar environment
cp .env.example .env
# Editar .env com suas credenciais

# 3. Rodar worker
npm run dev
```

### Deploy em Produção

Ver **[DEPLOY.md](./DEPLOY.md)** para guia completo de deploy em:
- Railway (recomendado)
- Render
- Fly.io

### Logs

```
🤖 Analysis Worker iniciado
📊 Monitorando fila a cada 5s...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 PROCESSANDO ANÁLISE: @username
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 FASE 1/3: Scraping...
✅ Scraping concluído!

🔍 FASE 2/3: OCR...
✅ OCR concluído!

📊 FASE 3/4: Análise...
✅ Análise completa gerada!

🔬 FASE 4/4: Auditoria...
✅ Auditoria concluída!

💾 FASE 5/5: Salvando...
✅ Dados salvos no Supabase!

✅ ANÁLISE CONCLUÍDA
```

---

## 🐦 Twitter Stream Worker

Worker para monitoramento em tempo real do Twitter Filtered Stream API.

### O que faz

1. Conecta ao Twitter Filtered Stream API
2. Processa tweets em tempo real
3. Salva em `twitter_content_updates`
4. Auto-reconnect com backoff exponencial

### Quick Start Local

```bash
# Rodar Twitter Worker
npm run twitter:dev
```

### Variáveis de Ambiente

```env
TWITTER_BEARER_TOKEN=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=3001
```

---

## 📁 Estrutura

```
worker/
├── analysis-worker.ts        # Analysis Worker (principal)
├── twitter-stream-worker.js  # Twitter Worker
├── package.json              # Dependências
├── Dockerfile.analysis       # Docker para Analysis
├── Dockerfile                # Docker para Twitter
├── railway-analysis.toml     # Config Railway (Analysis)
├── railway.toml              # Config Railway (Twitter)
├── .env.example              # Template de variáveis
├── DEPLOY.md                 # Guia completo de deploy
└── README.md                 # Esta documentação
```

---

## 🚀 Deploy

### Analysis Worker (Recomendado)

```bash
# Railway CLI
railway init
railway up

# Ou ver DEPLOY.md para Render/Fly.io
```

### Twitter Worker

```bash
# Railway CLI
railway init
railway up

# Configurar variáveis do Twitter
```

---

## 🔄 Fluxo Completo (Analysis)

```
Frontend → POST /api/analysis
              ↓
        analysis_queue (pending)
              ↓
        Worker detecta nova entrada
              ↓
        Processa pipeline completo (~3 min)
              ↓
        Salva em audits + posts
              ↓
        Atualiza queue (completed)
              ↓
        Frontend detecta via polling
              ↓
        Redireciona para /dashboard/audits/[id]
```

---

## 💰 Custo por Análise

- Apify: R$ 0,10 - R$ 0,30
- Gemini OCR: R$ 0,05 - R$ 0,15
- Claude Audit: R$ 0,10 - R$ 0,20
- **Total:** ~R$ 0,30 - R$ 0,65

---

## 🆘 Suporte

- **Documentação:** Ver [DEPLOY.md](./DEPLOY.md)
- **Logs:** Sempre verificar logs primeiro
- **Supabase:** Verificar `analysis_queue` e `audits`

---

*Desenvolvido por Croko Labs - Motor de Conteúdo Autônomo™*
