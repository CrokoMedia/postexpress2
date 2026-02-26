# 🚂 Railway Deploy - Post Express 2

## 📊 Informações do Deploy

- **Projeto:** postexpress2-app
- **Dashboard:** https://railway.com/project/2189b595-490b-4e9d-8247-892f073b22a8
- **Status:** Deploy em andamento

---

## ✅ Próximos Passos

### 1. Acessar Dashboard

Abra: https://railway.com/project/2189b595-490b-4e9d-8247-892f073b22a8

### 2. Verificar Build Logs

- Clique no service que foi criado
- Vá na aba **"Deployments"**
- Veja os logs do build em tempo real
- **Aguarde o build completar** (pode levar 5-10 minutos)

### 3. Configurar Variáveis de Ambiente

Após o build completar, vá em **Settings → Variables** e adicione:

#### 🔑 CRÍTICAS (obrigatórias):

```bash
# Supabase (Database)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Cloudinary (Imagens)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...

# IA (Geração de Conteúdo)
ANTHROPIC_API_KEY=sk-ant-...
NANO_BANANA_API_KEY=nb_...
FAL_KEY=fal_...

# Scraping
APIFY_API_TOKEN=apify_api_...

# Environment
NODE_ENV=production
```

#### 📱 OPCIONAIS (WhatsApp):

```bash
UAZAPI_INSTANCE_ID=seu-instance-id
UAZAPI_TOKEN=seu-token
UAZAPI_WEBHOOK_URL=https://seu-domain.railway.app/api/whatsapp/webhook
```

### 4. Obter URL de Produção

Após deploy completar:
- Vá em **Settings → Domains**
- Clique em **"Generate Domain"**
- Copie a URL (será algo como: `postexpress2-app-production.up.railway.app`)

### 5. Redeploy (se necessário)

Se mudou env vars:
```bash
railway redeploy --yes
```

---

## 🔍 Verificar Funcionamento

Após deploy:

1. **Health Check:** `https://sua-url.railway.app/api/health`
   - Deve retornar: `{"status":"ok","service":"postexpress2"}`

2. **Dashboard:** `https://sua-url.railway.app/dashboard`
   - Deve carregar a interface

3. **Gerar Slides:**
   - Vá em um perfil auditado
   - Tente gerar slides
   - **NÃO haverá timeout!** ✅

---

## 🎯 Vantagens Railway vs Vercel

| Feature | Railway | Vercel |
|---------|---------|--------|
| **Timeout** | Sem limite ✅ | 10s (Hobby) ⚠️ |
| **Chromium** | Suportado ✅ | Limitado ⚠️ |
| **Renderização** | Sem limites ✅ | Timeout em 60s ⚠️ |
| **Custo** | $5/mês (Hobby) | $20/mês (Pro) |

---

## 🆘 Troubleshooting

### Build falhou?

1. Veja os logs no dashboard
2. Verifique se `Dockerfile` está correto
3. Verifique se `.remotion-bundle/` foi incluído

### App não inicia?

1. Verifique env vars (todas configuradas?)
2. Veja logs de runtime: **Deployments → View Logs**
3. Verifique health check: `/api/health`

### Erro ao gerar slides?

1. Verifique env vars de IA (ANTHROPIC_API_KEY, FAL_KEY)
2. Verifique Cloudinary (API keys corretas?)
3. Veja logs no Railway Dashboard

---

## 📞 Suporte

Se precisar de ajuda, me avise e eu analiso os logs!

— Orion 🎯
