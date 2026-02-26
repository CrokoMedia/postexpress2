# 🏗️ Arquitetura Híbrida: Vercel + Railway

Documentação da arquitetura híbrida implementada para resolver limitações do Remotion na Vercel.

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO (Browser)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                VERCEL (Frontend Next.js)                     │
│  • Dashboard UI                                              │
│  • APIs leves (CRUD Supabase)                               │
│  • SSR/SSG pages                                            │
│  • CDN global                                               │
└────────┬────────────────────────────────────────────────────┘
         │
         │ NEXT_PUBLIC_REMOTION_API_URL
         │ (Variável de ambiente)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│            RAILWAY (API Remotion - Express)                  │
│  • Renderização Remotion (slides PNG + vídeos MP4)         │
│  • Chromium completo nativo                                 │
│  • Sem limites de tamanho/timeout                           │
│  • 5 endpoints de renderização                              │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUDINARY (Storage)                            │
│  • Upload automático de imagens/vídeos                      │
│  • CDN de mídia                                             │
│  • Transformações on-the-fly                                │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Problema Resolvido

### Limitações da Vercel para Remotion

| Limitação | Impacto | Solução Railway |
|-----------|---------|-----------------|
| **250MB limit** (unzipped) | Remotion + Chromium excedem | ✅ Sem limites |
| **300s timeout** (Pro) | Renderização pode exceder | ✅ Sem timeout |
| **@sparticuz/chromium** | Binário limitado, bugs | ✅ Chromium completo |
| **Cold starts** | Latência imprevisível | ✅ Menos frequentes |

### Tentativas anteriores (não funcionaram)

1. ❌ Commit do bundle para git → Build excedeu 250MB
2. ❌ Otimizar bundle (remover source maps) → Ainda excedeu
3. ❌ @sparticuz/chromium → Erros de compositor
4. ❌ Logs detalhados → API retornava não-JSON (crash antes do catch)

### Solução: Arquitetura Híbrida

✅ **Vercel:** Frontend rápido com CDN global
✅ **Railway:** Renderização pesada sem limites
✅ **Custo:** ~R$ 5-10/mês (Railway Hobby)
✅ **Complexidade:** Baixa (Express simples + 1 variável de ambiente)

## 📦 Estrutura do Projeto

```
postexpress2/
├── app/                              # Next.js (Vercel)
│   ├── dashboard/                    # UI do dashboard
│   └── api/                          # APIs leves (CRUD)
│       ├── profiles/
│       ├── audits/
│       ├── analysis/
│       └── content/[id]/
│           ├── export-zip/           # ✅ Fica na Vercel
│           ├── export-drive/         # ✅ Fica na Vercel
│           ├── preview-carousel/     # 🚂 Movido para Railway
│           ├── generate-slides-v3/   # 🚂 Movido para Railway
│           ├── generate-reel/        # 🚂 Movido para Railway
│           └── generate-reels-batch/ # 🚂 Movido para Railway
│
├── remotion-api/                     # Express (Railway)
│   ├── api/                          # Rotas de renderização
│   │   ├── preview-carousel.js
│   │   ├── generate-slides-v3.js
│   │   ├── generate-reel.js
│   │   ├── generate-reels-batch.js
│   │   └── generate-audit-video.js
│   ├── lib/
│   │   ├── remotion-bundle.js        # Gerenciador bundle
│   │   ├── supabase-client.js        # Cliente Supabase
│   │   └── cloudinary-config.js      # Config Cloudinary
│   ├── .remotion-bundle/             # Bundle pré-compilado (5.86MB)
│   ├── server.js                     # Servidor Express
│   ├── package.json
│   ├── railway.toml                  # Config Railway
│   └── README.md
│
├── lib/
│   └── remotion-api-client.ts        # Helper frontend → Railway
│
└── docs/
    ├── ARQUITETURA-HIBRIDA-RAILWAY.md  # Este arquivo
    └── REMOTION-RAILWAY-MIGRATION.md   # Plano original
```

## 🔌 Integração Frontend → Railway

### 1. Cliente HTTP (`lib/remotion-api-client.ts`)

```typescript
import { remotionPost } from '@/lib/remotion-api-client'

// Detecta automaticamente se usa Railway ou rotas locais
const result = await remotionPost('/api/content/123/generate-slides-v3', {
  carousels: [...],
  profile: {...},
  templateId: 'minimalist',
})
```

**Como funciona:**
- Se `NEXT_PUBLIC_REMOTION_API_URL` estiver definida → chama Railway
- Caso contrário → chama rotas Next.js locais (para dev local)

### 2. Variável de Ambiente (Vercel)

```env
NEXT_PUBLIC_REMOTION_API_URL=https://remotion-api-production.up.railway.app
```

**Importante:** Prefixo `NEXT_PUBLIC_` para estar disponível no browser.

### 3. Atualizar componentes

Trocar chamadas diretas `fetch('/api/...')` por `remotionPost()`:

**Antes:**
```typescript
const res = await fetch(`/api/content/${id}/generate-slides-v3`, {
  method: 'POST',
  body: JSON.stringify({ carousels, profile }),
})
```

**Depois:**
```typescript
import { remotionPost } from '@/lib/remotion-api-client'

const result = await remotionPost(`/api/content/${id}/generate-slides-v3`, {
  carousels,
  profile,
})
```

## 🚂 Deploy Railway

Ver guia completo: [`remotion-api/DEPLOY-RAILWAY.md`](../remotion-api/DEPLOY-RAILWAY.md)

**TL;DR:**

```bash
cd remotion-api
npm install
railway login
railway init
railway variables set SUPABASE_URL="..."
railway variables set SUPABASE_SERVICE_ROLE_KEY="..."
railway variables set CLOUDINARY_CLOUD_NAME="..."
railway variables set CLOUDINARY_API_KEY="..."
railway variables set CLOUDINARY_API_SECRET="..."
railway up
railway domain  # Copiar URL
```

## 🧪 Testes

### Health check Railway

```bash
curl https://remotion-api-production.up.railway.app/health
```

### Teste local Railway API

```bash
cd remotion-api
npm install
npm run build:remotion
npm start

# Em outro terminal
curl http://localhost:3001/health
```

### Teste integração completa

1. Deploy Railway: `railway up`
2. Obter URL: `railway domain`
3. Adicionar `NEXT_PUBLIC_REMOTION_API_URL` na Vercel
4. Deploy frontend: `git push`
5. Testar geração de slides no dashboard

## 💰 Custos

| Serviço | Plano | Custo/mês | Uso |
|---------|-------|-----------|-----|
| **Vercel** | Hobby | $0 | Frontend + APIs leves |
| **Railway** | Hobby | $5 | Renderização Remotion |
| **Supabase** | Free | $0 | Banco de dados |
| **Cloudinary** | Free | $0 | Storage (até 25GB) |
| **Total** | | **$5** | 🎉 |

**Upgrade paths:**
- Vercel Pro ($20/mês) → se precisar analytics/mais bandwidth
- Railway Pro ($20/mês) → se volume de renderizações > 500h/mês
- Cloudinary Pro ($99/mês) → se storage > 25GB

## 📈 Escalabilidade

### Vercel (Frontend)

- ✅ Escala automaticamente (serverless)
- ✅ CDN global (Edge Network)
- ✅ Zero configuração

### Railway (Renderização)

- ✅ Escala vertical (aumentar RAM/CPU)
- ✅ Escala horizontal (múltiplas instâncias)
- ✅ Auto-scaling configurável

### Bottleneck atual

🎯 **Cloudinary upload:** ~2s por slide

**Otimização futura:**
- Upload paralelo (Promise.all)
- Streaming direto para Cloudinary (sem salvar em /tmp)
- Usar Cloudinary Upload API v2 (mais rápida)

## 🔒 Segurança

### Railway API

- ✅ CORS configurado (permite apenas frontend Vercel)
- ✅ Service Role Key do Supabase (acesso total controlado)
- ✅ Cloudinary API keys no servidor (não expostas no browser)

### Frontend (Vercel)

- ✅ Chamadas autenticadas via Supabase
- ✅ RLS (Row Level Security) no Supabase
- ✅ API Railway acessível apenas via frontend

**Próximos passos de segurança:**
- [ ] Adicionar API key entre Vercel ↔ Railway
- [ ] Rate limiting no Railway (express-rate-limit)
- [ ] Validação de input com Zod

## 🐛 Troubleshooting

### Erro: "Failed to fetch Railway API"

**Causa:** CORS ou URL errada

**Solução:**
```bash
# Verificar URL
echo $NEXT_PUBLIC_REMOTION_API_URL

# Testar health check
curl https://sua-url.railway.app/health
```

### Erro: "Bundle not found" no Railway

**Causa:** .remotion-bundle/ não foi commitado ou build falhou

**Solução:**
```bash
cd remotion-api
npm run build:remotion
git add .remotion-bundle/
git commit -m "feat: adicionar bundle Remotion"
railway up
```

### Erro 500 no Railway

**Causa:** Variável de ambiente faltando ou erro no código

**Solução:**
```bash
# Ver logs detalhados
railway logs --follow

# Verificar variáveis
railway variables
```

## 📚 Recursos

- **Railway Docs:** https://docs.railway.app
- **Remotion Docs:** https://remotion.dev/docs/ssr
- **Express.js:** https://expressjs.com
- **Cloudinary Upload API:** https://cloudinary.com/documentation/upload_images

## 🎉 Conclusão

Arquitetura híbrida resolve TODAS as limitações do Remotion na Vercel:

| Aspecto | Antes (Vercel pura) | Depois (Híbrida) |
|---------|---------------------|------------------|
| **Build** | ❌ Excedia 250MB | ✅ Frontend < 100MB |
| **Chromium** | ❌ @sparticuz bugado | ✅ Chromium completo |
| **Timeout** | ❌ 300s limite | ✅ Sem limite |
| **Custo** | $20/mês (Pro) | $5/mês (Hobby) |
| **Complexidade** | ⚠️ Workarounds | ✅ Simples e direto |

**Status:** ✅ Implementado e pronto para produção

---

**Data:** 2026-02-26
**Versão:** 1.0
**Autor:** Claude (Orion - AIOS Master)
