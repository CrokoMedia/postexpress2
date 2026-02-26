# 🚀 Railway Deploy - Resumo Executivo

## 📊 Status do Sistema

### ✅ **100% PRONTO** para Deploy

Todos os componentes críticos estão configurados e testados:

| Componente | Status | Detalhes |
|------------|--------|----------|
| **Dockerfile** | ✅ Pronto | Multi-stage com Chromium + Remotion + Next.js standalone |
| **railway.toml** | ✅ Pronto | Build args + healthcheck configurados |
| **next.config.js** | ✅ Pronto | Standalone mode habilitado |
| **Remotion Bundle** | ✅ Pronto | `.remotion-bundle/` pré-compilado (6MB) |
| **Health Endpoint** | ✅ Pronto | `/api/health` implementado |
| **Scripts de Build** | ✅ Pronto | `build:remotion` + `next build` |
| **Documentação** | ✅ Pronto | 4 guias completos + checklist |

---

## 🎯 O Que Você Precisa Fazer

### **Apenas 2 coisas:**

### 1️⃣ **Push do Código** (30 segundos)

```bash
# O código está commitado localmente, só precisa fazer push
git push origin main
```

### 2️⃣ **Configurar Variáveis no Railway** (5 minutos)

Acesse: **Railway Dashboard → Seu Projeto → Variables**

**Copie do Supabase e cole no Railway:**

```bash
NEXT_PUBLIC_SUPABASE_URL        # (do Supabase Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY   # (do Supabase Settings > API)
SUPABASE_URL                    # (igual à primeira)
SUPABASE_ANON_KEY               # (igual à segunda)
SUPABASE_SERVICE_ROLE_KEY       # (Supabase Settings > API > Reveal)
```

**Guia visual completo:** `docs/RAILWAY-ENV-SETUP.md`

**Solução rápida (5 min):** `docs/RAILWAY-QUICK-FIX.md`

---

## ⏱️ Timeline de Deploy

| Etapa | Tempo | Responsável |
|-------|-------|-------------|
| Push do código | 30s | Você |
| Configurar variáveis | 5 min | Você |
| Railway build | 5-10 min | Automático |
| Deploy + healthcheck | 1-2 min | Automático |
| **TOTAL** | **~15 minutos** | — |

---

## 🏗️ O Que o Railway Vai Fazer Automaticamente

1. **Detectar `railway.toml`** → Usar Dockerfile
2. **Instalar dependências** → `npm install`
3. **Build Remotion** → `npm run build:remotion`
4. **Build Next.js** → `npm run build`
5. **Criar container** → Alpine Linux + Node 20 + Chromium
6. **Iniciar servidor** → `node server.js`
7. **Healthcheck** → Testar `/api/health` a cada 30s

---

## 📋 Arquitetura do Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Container                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Alpine Linux + Node 20 + Chromium                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Next.js 15 App (Standalone)                         │   │
│  │ - App Router                                        │   │
│  │ - TypeScript strict                                 │   │
│  │ - Tailwind CSS                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Remotion (Pre-bundled)                              │   │
│  │ - .remotion-bundle/ (6MB)                           │   │
│  │ - Geração de slides PNG                             │   │
│  │ - Geração de vídeos MP4                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Chromium (System Binary)                            │   │
│  │ - Puppeteer screenshots                             │   │
│  │ - Remotion rendering                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)        → Banco de dados             │
│  Cloudinary                   → Upload de imagens/vídeos    │
│  Anthropic Claude             → Geração de conteúdo         │
│  Google Gemini                → OCR de slides               │
│  Apify                        → Scraping Instagram          │
│  UAZapi                       → Integração WhatsApp         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Variáveis de Ambiente (Resumo)

### **Obrigatórias** (5 variáveis)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### **Sistema** (3 variáveis - automáticas)
- `NODE_ENV=production`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

### **Opcionais** (9 variáveis - para features específicas)
- `CLOUDINARY_*` (3 vars) → Upload de imagens
- `ANTHROPIC_API_KEY` → Geração de conteúdo com Claude
- `GOOGLE_AI_API_KEY` → OCR com Gemini
- `APIFY_API_TOKEN` → Scraping Instagram
- `UAZAPI_*` (3 vars) → Integração WhatsApp
- `GOOGLE_DRIVE_*` (3 vars) → Export para Drive

**Total:** 5 obrigatórias + até 16 opcionais = **até 21 variáveis**

---

## ✅ Verificação Pós-Deploy

Quando o deploy finalizar, verifique:

### 1. **Health Endpoint**
```bash
curl https://seu-projeto.up.railway.app/api/health
```

**Esperado:**
```json
{
  "status": "ok",
  "supabase": "connected",
  "timestamp": "2026-02-27T..."
}
```

### 2. **Dashboard**
Acesse: `https://seu-projeto.up.railway.app`

- [ ] Página carrega sem erro 500
- [ ] Sidebar e navegação funcionam
- [ ] Console sem erros críticos

### 3. **Teste Real**
Crie um carrossel de teste:
- [ ] Gera ideias de conteúdo
- [ ] Aprova conteúdo
- [ ] Gera slides visuais
- [ ] Download ZIP funciona

---

## 🐛 Se Algo Der Errado

### ❌ Erro: "Invalid Supabase URL: https://placeholder.supabase.co/"

**Causa:** Variáveis não configuradas no Railway

**Solução:** `docs/RAILWAY-QUICK-FIX.md` (5 minutos)

### ❌ Build falha ou demora muito

**Causa:** Build pesado (Chromium + Remotion + Next.js)

**Solução:**
1. Aguarde até 15 minutos (é normal)
2. Se falhar, verifique logs: `railway logs`
3. Considere upgrade para plano Hobby ($5/mês)

### ❌ Remotion não gera slides

**Causa:** `.remotion-bundle/` não foi copiado

**Solução:**
```bash
# Verificar se bundle existe
ls -la .remotion-bundle/

# Se não existir, recompilar
npm run build:remotion

# Commit e push
git add .remotion-bundle/
git commit -m "fix: add remotion bundle"
git push
```

---

## 📚 Documentação Completa

| Documento | Finalidade | Tempo de Leitura |
|-----------|------------|------------------|
| **RAILWAY-DEPLOY-CHECKLIST.md** | Passo a passo completo | 15 min |
| **docs/RAILWAY-ENV-SETUP.md** | Como configurar variáveis (visual) | 10 min |
| **docs/RAILWAY-QUICK-FIX.md** | Solução rápida para erro comum | 5 min |
| **docs/RAILWAY-TROUBLESHOOTING.md** | Troubleshooting avançado | 10 min |
| **RAILWAY-DEPLOY-SUMMARY.md** | Este resumo executivo | 5 min |

**Script de verificação:**
```bash
./scripts/check-railway-env.sh
```

---

## 💰 Custos Estimados

### Railway (Hospedagem)

| Plano | Custo | Limites |
|-------|-------|---------|
| **Trial** | $0 | $5 de crédito grátis |
| **Hobby** | $5/mês | Sem timeout, uso moderado |
| **Pro** | $20/mês | Alta performance |

**Recomendação:** Hobby ($5/mês) - sem timeout para Remotion

### APIs Externas (por 1000 requisições)

| Serviço | Custo | Uso no Post Express |
|---------|-------|---------------------|
| **Supabase** | $0 (free tier até 500MB) | Banco de dados |
| **Cloudinary** | $0 (free tier até 25GB) | Upload de imagens |
| **Anthropic Claude** | ~$0.50 | Geração de conteúdo |
| **Google Gemini** | ~$0.10 | OCR de slides |
| **Apify** | ~$0.05 | Scraping Instagram |
| **UAZapi** | ~$0.01/msg | WhatsApp (R$ 0,10 por 10 msgs) |

**Total mensal estimado:** $5 (Railway) + ~$5 (APIs) = **~$10/mês**

---

## 🎉 Próximos Passos (Depois do Deploy)

### 1. **Domínio Customizado** (Opcional)
Railway → Settings → Domains → Add Custom Domain

Exemplo: `postexpress.crokolab.com`

### 2. **Monitoramento**
```bash
# Logs em tempo real
railway logs --follow

# Status do serviço
railway status
```

### 3. **Configurar Webhook do WhatsApp**
Depois do deploy, atualize a variável:
```
UAZAPI_WEBHOOK_URL = https://seu-projeto.up.railway.app/api/whatsapp/webhook
```

### 4. **Testar Integração Completa**
1. Envie mensagem via WhatsApp
2. Sistema gera carrossel
3. Aprove via WhatsApp
4. Receba slides prontos

---

## 📞 Precisa de Ajuda?

### **Durante o deploy:**
- Veja logs: `railway logs`
- Verifique health: `/api/health`
- Consulte: `docs/RAILWAY-TROUBLESHOOTING.md`

### **Depois do deploy:**
- Teste endpoint: `curl https://seu-app.railway.app/api/health`
- Monitore: `railway logs --follow`
- Ajuste variáveis: Railway Dashboard → Variables

---

## ✨ Resumo dos Arquivos Criados

```
postexpress2/
├── .env.supabase.template          # Template de variáveis (referência)
├── Dockerfile                      # Multi-stage build (já existia)
├── railway.toml                    # Config Railway (já existia)
├── railway.app.toml               # Config Railway alternativa (já existia)
├── next.config.js                 # Standalone mode (já existia)
├── .remotion-bundle/              # Bundle pré-compilado (já existia)
├── RAILWAY-DEPLOY-CHECKLIST.md    # Checklist completo (NOVO ✨)
├── RAILWAY-DEPLOY-SUMMARY.md      # Este resumo (NOVO ✨)
├── docs/
│   ├── RAILWAY-ENV-SETUP.md       # Setup visual de variáveis (NOVO ✨)
│   ├── RAILWAY-QUICK-FIX.md       # Solução rápida (NOVO ✨)
│   └── RAILWAY-TROUBLESHOOTING.md # Troubleshooting (NOVO ✨)
└── scripts/
    └── check-railway-env.sh       # Verificador de env vars (NOVO ✨)
```

---

## 🚀 Comando Final

```bash
# 1. Push do código (se ainda não fez)
git push origin main

# 2. Configure as 5 variáveis do Supabase no Railway Dashboard

# 3. Aguarde o deploy (5-10 min)

# 4. Teste o health endpoint
curl https://seu-projeto.up.railway.app/api/health

# 🎉 Pronto!
```

---

**✅ Sistema 100% pronto para deploy no Railway!**

*Última atualização: 2026-02-27*
*Versão: 1.0 - Deploy Inicial*
