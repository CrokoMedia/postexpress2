# 🚀 Deploy Post Express no Render.com

> Guia completo de deploy da infraestrutura Croko Labs no Render.com

---

## 📋 Pré-requisitos

Antes de fazer deploy, certifique-se de ter:

- [x] Conta no [Render.com](https://render.com)
- [x] Repositório GitHub conectado
- [x] Projeto Supabase configurado
- [x] Cloudinary configurado
- [x] UAZapi (WhatsApp) configurado
- [x] API keys das IAs (Anthropic, Google AI, Mistral)
- [x] Apify API token
- [x] Google Drive Service Account (para export)

---

## 🎯 Passo a Passo

### 1. Preparar o Repositório

```bash
# Fazer commit das mudanças locais
git add .
git commit -m "chore: preparar deploy Render.com"
git push origin main
```

### 2. Criar Web Service no Render.com

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione o repositório `postexpress2`
5. Configure:
   - **Name:** `postexpress-app`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** (deixe vazio)
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Docker Context:** `.`

### 3. Configurar Variáveis de Ambiente

No Render Dashboard → **Environment** → Adicione as seguintes variáveis:

#### Node.js (já configuradas no render.yaml)
```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

#### Supabase (OBRIGATÓRIO)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 🔍 **Onde encontrar:**
> - Supabase Dashboard → Settings → API
> - URL está em "Project URL"
> - Anon key está em "anon public"
> - Service role key está em "service_role" (⚠️ NUNCA exponha essa key!)

#### Cloudinary (OBRIGATÓRIO)
```bash
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123xyz456
```

> 🔍 **Onde encontrar:**
> - Cloudinary Dashboard → Settings → Access Keys

#### UAZapi - WhatsApp (OBRIGATÓRIO)
```bash
UAZAPI_INSTANCE_ID=sua-instancia
UAZAPI_TOKEN=seu-token
UAZAPI_WEBHOOK_URL=https://postexpress-app.onrender.com/api/whatsapp/webhook
```

> 🔍 **Onde encontrar:**
> - UAZapi Dashboard → Instâncias
> - Webhook URL será gerado DEPOIS do deploy (atualize depois)

#### IA APIs (OBRIGATÓRIO)
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_AI_API_KEY=AIzaSy...
MISTRAL_API_KEY=...
```

> 🔍 **Onde encontrar:**
> - Anthropic: https://console.anthropic.com/settings/keys
> - Google AI: https://aistudio.google.com/app/apikey
> - Mistral: https://console.mistral.ai/api-keys/

#### Apify (OBRIGATÓRIO)
```bash
APIFY_API_TOKEN=apify_api_...
```

> 🔍 **Onde encontrar:**
> - Apify Console → Settings → Integrations

#### Google Drive Export (OPCIONAL)
```bash
GOOGLE_DRIVE_CLIENT_EMAIL=seu-service-account@projeto.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMII...
GOOGLE_DRIVE_FOLDER_ID=1abc...xyz
```

> 🔍 **Onde encontrar:**
> - Google Cloud Console → IAM → Service Accounts
> - Criar Service Account → Keys → Create JSON key
> - Extrair `client_email` e `private_key` do JSON

#### Puppeteer/Chromium (já configuradas no render.yaml)
```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CHROME_BIN=/usr/bin/chromium
REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium
```

### 4. Configurar Health Check (IMPORTANTE)

1. Criar endpoint de health check (se não existir):

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Post Express',
    version: '1.0.0'
  });
}
```

2. No Render Dashboard → Settings:
   - **Health Check Path:** `/api/health`
   - **Health Check Timeout:** 30 seconds

### 5. Deploy!

1. Clique em **"Create Web Service"**
2. Aguarde o build (primeira vez pode levar 10-15 minutos)
3. Acompanhe os logs em **"Logs"** tab

---

## 🔍 Validação Pós-Deploy

### 1. Verificar saúde da aplicação

```bash
curl https://postexpress-app.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T...",
  "service": "Post Express",
  "version": "1.0.0"
}
```

### 2. Verificar conexão Supabase

```bash
curl https://postexpress-app.onrender.com/api/profiles
```

**Resposta esperada:** Lista de perfis ou `[]`

### 3. Testar webhook WhatsApp

1. Copie a URL do serviço: `https://postexpress-app.onrender.com`
2. Atualize UAZapi Webhook URL:
   ```
   https://postexpress-app.onrender.com/api/whatsapp/webhook
   ```
3. Envie mensagem de teste via WhatsApp

### 4. Verificar renderização de slides

```bash
curl -X POST https://postexpress-app.onrender.com/api/content/1/preview-carousel \
  -H "Content-Type: application/json" \
  -d '{"slideIndex": 0}'
```

**Resposta esperada:** Imagem PNG em base64

---

## 🐛 Troubleshooting

### Erro: "Chromium not found"

**Solução:** Verificar se as env vars do Puppeteer estão corretas:
```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CHROME_BIN=/usr/bin/chromium
```

### Erro: "Supabase connection failed"

**Solução:** Verificar se as 5 variáveis do Supabase estão configuradas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "Build failed - out of memory"

**Solução:** Atualizar plano no Render.com (Starter tem 512MB RAM, recomendado: 2GB)

### Erro: "Webhook não recebe mensagens"

**Solução:**
1. Verificar se webhook está configurado no UAZapi
2. Testar manualmente: `curl -X POST https://postexpress-app.onrender.com/api/whatsapp/webhook`

### Erro: "Cloudinary upload failed"

**Solução:** Verificar credenciais do Cloudinary (cloud_name, api_key, api_secret)

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Via Render Dashboard
Dashboard → Logs → Enable Auto-scroll
```

### Métricas

Render.com fornece:
- CPU usage
- Memory usage
- Request count
- Response time

**Acesso:** Dashboard → Metrics

### Alertas

Configure alertas no Render Dashboard:
- Health check failures
- High memory usage
- High CPU usage
- Error rate threshold

---

## 🔄 Deploy Contínuo

### Configuração Automática

O `render.yaml` já está configurado para:
- ✅ Deploy automático a cada push na branch `main`
- ✅ Build via Docker
- ✅ Health check em `/api/health`

### Deploy Manual

Se precisar fazer deploy manual:

```bash
# Render Dashboard
→ Manual Deploy → Deploy latest commit
```

### Rollback

Se algo der errado:

```bash
# Render Dashboard
→ Events → Select previous deploy → Redeploy
```

---

## 💰 Custo Estimado

| Plano | RAM | CPU | Custo/mês |
|-------|-----|-----|-----------|
| **Starter** | 512MB | 0.5 | $7 |
| **Standard** | 2GB | 1 | $25 |
| **Pro** | 4GB | 2 | $85 |

**Recomendado:** Standard (2GB) devido ao Puppeteer + Remotion

---

## 🔐 Segurança

### Secrets Management

- ✅ Nunca commitar `.env` com valores reais
- ✅ Usar Environment Variables do Render.com
- ✅ Service role key do Supabase NUNCA deve ser exposta no client
- ✅ Usar `NEXT_PUBLIC_*` apenas para variáveis públicas

### HTTPS

- ✅ Render.com fornece SSL/TLS automático
- ✅ Certificado gerenciado automaticamente
- ✅ Força HTTPS por padrão

### Rate Limiting

Implementar rate limiting nas APIs críticas:
- `/api/whatsapp/webhook`
- `/api/content/*/generate-slides-v3`

---

## 📚 Recursos Adicionais

- [Render.com Docs](https://render.com/docs)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment)
- [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/architecture#environment-variables)

---

## ✅ Checklist Final

Antes de marcar o deploy como completo:

- [ ] Web service rodando sem erros
- [ ] Health check retornando 200 OK
- [ ] Conexão Supabase funcionando
- [ ] Upload Cloudinary funcionando
- [ ] Webhook WhatsApp recebendo mensagens
- [ ] Renderização de slides (Puppeteer) funcionando
- [ ] Export Google Drive funcionando (se configurado)
- [ ] SSL/HTTPS ativo
- [ ] Monitoramento configurado
- [ ] Alertas configurados
- [ ] Documentação atualizada

---

**Deploy realizado em:** [DATA]

**URL de produção:** https://postexpress-app.onrender.com

**Status:** 🟢 Operacional

---

*Croko Labs - Motor de Conteúdo Autônomo™*
*Versão 1.0 - Deploy Render.com*
