# 🚂 Railway Deploy Manual - Via Dashboard

O Railway CLI apresentou timeout. Vamos fazer deploy via Dashboard (mais confiável).

---

## 📋 PASSO A PASSO

### 1. **Fazer Push para GitHub**

Os arquivos já estão commitados localmente. Agora faça push:

```bash
git push origin main
```

### 2. **Acessar Railway Dashboard**

Abra: https://railway.com/project/2189b595-490b-4e9d-8247-892f073b22a8

### 3. **Conectar ao GitHub**

1. Clique no service existente **OU** clique em **"+ New Service"**
2. Escolha **"GitHub Repo"**
3. Conecte sua conta GitHub (se ainda não conectou)
4. Selecione o repositório: **postexpress2**
5. Selecione a branch: **main**

### 4. **Configurar Build Settings**

O Railway vai detectar automaticamente o `railway.toml` e usar o `Dockerfile`.

**Confirme as configurações:**
- **Build Command:** (vazio - usa Dockerfile)
- **Start Command:** `node server.js`
- **Dockerfile Path:** `Dockerfile`

### 5. **Adicionar Variáveis de Ambiente**

Vá em **Settings → Variables** e adicione:

#### ✅ Copiar da Vercel (RECOMENDADO):

Se você tem acesso à Vercel, copie todas as env vars de lá:

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto **postexpress2**
3. Settings → Environment Variables
4. Copie cada variável para o Railway

#### ✅ Adicionar Manualmente:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...

# IA
ANTHROPIC_API_KEY=sk-ant-...
NANO_BANANA_API_KEY=nb_...
FAL_KEY=fal_...

# Scraping
APIFY_API_TOKEN=apify_api_...

# Environment
NODE_ENV=production
```

### 6. **Deploy!**

Após adicionar as env vars:
1. Clique em **"Deploy"** ou **"Redeploy"**
2. Aguarde o build (5-10 minutos)
3. Veja os logs em tempo real

### 7. **Obter URL**

Após deploy completar:
1. Vá em **Settings → Networking**
2. Clique em **"Generate Domain"**
3. Copie a URL (ex: `postexpress2-app-production.up.railway.app`)

### 8. **Testar**

```bash
curl https://sua-url.railway.app/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2026-02-26T...","service":"postexpress2"}
```

---

## 🎯 VERIFICAR LOGS DO BUILD

Se o build falhar:

1. **Dashboard → Deployments**
2. Clique no deployment ativo
3. Veja a aba **"Build Logs"**
4. Se houver erro, me envie os logs

**Erros comuns:**

| Erro | Solução |
|------|---------|
| `Dockerfile not found` | Certifique-se que fez `git push` |
| `npm install failed` | Verifique package.json |
| `Chromium not found` | Dockerfile já instala - ignore warnings |
| `Out of memory` | Aumente recursos no Railway |

---

## 🔧 APÓS DEPLOY FUNCIONAR

### Atualizar UAZapi Webhook (WhatsApp)

Se usa integração WhatsApp:

1. Adicione env var:
   ```
   UAZAPI_WEBHOOK_URL=https://sua-url.railway.app/api/whatsapp/webhook
   ```

2. Configure no UAZapi Dashboard:
   - Webhook URL: `https://sua-url.railway.app/api/whatsapp/webhook`
   - Events: `message.text`, `message.image`

### Testar Geração de Slides

1. Acesse: `https://sua-url.railway.app/dashboard`
2. Vá em um perfil auditado
3. Clique em "Configurar Slides"
4. **Gere múltiplos carrosséis** (sem timeout!)

---

## 📊 COMPARAÇÃO FINAL

| Antes (Vercel) | Depois (Railway) |
|----------------|------------------|
| ❌ Timeout 10s | ✅ Ilimitado |
| ❌ Erro não-JSON | ✅ Funciona perfeitamente |
| 💰 $20/mês (Pro) | 💰 $5/mês (Hobby) |

---

## 🆘 AINDA COM PROBLEMAS?

Me envie:
1. **Logs do build** (copie do Dashboard)
2. **Erro específico** (screenshot ou texto)
3. **URL do deployment** (se conseguiu gerar)

Vou debugar e resolver!

— Orion 🎯
