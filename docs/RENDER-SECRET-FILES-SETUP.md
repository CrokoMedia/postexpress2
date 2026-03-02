# Render Secret Files - Guia de Configuração

## 🎯 O que são Secret Files?

Secret Files no Render permitem injetar arquivos secretos no container **durante o build**, sem expor no código-fonte.

**Vantagens:**
- ✅ Variáveis disponíveis durante `npm run build`
- ✅ Não aparecem no repositório Git
- ✅ Podem conter chaves sensíveis
- ✅ Next.js carrega automaticamente `.env.production.local`

---

## 📋 Setup Completo

### 1. Acessar Secret Files no Render

1. Dashboard → Seu serviço `crokolab`
2. Settings → **Secret Files** (ou **Advanced**)
3. Add Secret File

### 2. Configurar o Secret File

**Filename:**
```
.env.production.local
```

**File Contents:**

⚠️ **IMPORTANTE:** Substitua os valores `...` pelos valores reais do seu `.env` local!

```bash
# ============================================
# Post Express - Production Environment
# Render Secret File: .env.production.local
# ============================================

# === Supabase PUBLIC (embedded in bundle) ===
NEXT_PUBLIC_SUPABASE_URL=https://cddbkqaqgbvjjyxkgzfi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZGJrcWFxZ2J2amp5eGtnemZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxOTgzMjQsImV4cCI6MjA1Mzc3NDMyNH0.SUBSTITUA_AQUI

# === Supabase PRIVATE (server-side only) ===
SUPABASE_URL=https://cddbkqaqgbvjjyxkgzfi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUBSTITUA_AQUI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUBSTITUA_AQUI

# === Cloudinary (imagens) ===
CLOUDINARY_CLOUD_NAME=dwkothqfw
CLOUDINARY_API_KEY=555748429968394
CLOUDINARY_API_SECRET=6HEgEtREcUs91PokYl2RPVAC9Zc
CLOUDINARY_URL=cloudinary://555748429968394:6HEgEtREcUs91PokYl2RPVAC9Zc@dwkothqfw

# === Anthropic (Claude API) ===
ANTHROPIC_API_KEY=sk-ant-api03-SUBSTITUA_AQUI

# === Google AI (Gemini) ===
GOOGLE_AI_API_KEY=AIzaSy-SUBSTITUA_AQUI

# === Mistral AI ===
MISTRAL_API_KEY=SUBSTITUA_AQUI

# === Apify (Instagram scraping) ===
APIFY_API_TOKEN=apify_api_SUBSTITUA_AQUI

# === UAZapi (WhatsApp) ===
UAZAPI_INSTANCE_ID=SUBSTITUA_AQUI
UAZAPI_TOKEN=SUBSTITUA_AQUI
UAZAPI_WEBHOOK_URL=https://crokolab.onrender.com/api/whatsapp/webhook

# === Google Drive Export ===
GOOGLE_DRIVE_CLIENT_EMAIL=SUBSTITUA_AQUI@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSUBSTITUA_AQUI\n-----END PRIVATE KEY-----
GOOGLE_DRIVE_FOLDER_ID=SUBSTITUA_AQUI

# === Chromium/Puppeteer ===
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CHROME_BIN=/usr/bin/chromium
REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium
```

### 3. Obter os Valores Corretos

**De onde copiar:**

```bash
# No seu ambiente local:
cd /Users/macbook-karla/postexpress2
cat .env

# Copie os valores e cole no Secret File do Render
```

**Variáveis CRÍTICAS (não podem faltar):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `CLOUDINARY_*` (3 variáveis)
- ✅ `ANTHROPIC_API_KEY`

**Variáveis OPCIONAIS (app funciona sem):**
- `UAZAPI_*` (WhatsApp - só se usar)
- `GOOGLE_DRIVE_*` (Export - só se usar)
- `MISTRAL_API_KEY` (OCR alternativo)
- `APIFY_API_TOKEN` (Scraping - só se usar)

### 4. Deploy

1. **Save Secret File** no Render
2. Deploy → **Manual Deploy**
3. ☑️ **Clear build cache** (importante!)
4. **Deploy**

---

## 🔍 Verificar se Funcionou

### Durante o Build (Logs do Render)

```bash
# Procure por:
npm run build

# ✅ SUCESSO:
info  - Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

# ❌ ERRO (se Secret File não foi carregado):
⚠ The following environment variables were not provided during build:
⚠ - NEXT_PUBLIC_SUPABASE_URL
```

### Após Deploy (Browser Console)

```javascript
// Abra console no navegador
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

// ✅ CORRETO: "https://cddbkqaqgbvjjyxkgzfi.supabase.co"
// ❌ ERRADO: undefined
```

### Testar API

```bash
curl https://crokolab.onrender.com/api/health

# ✅ CORRETO:
{
  "status": "ok",
  "timestamp": "2026-03-02T...",
  "supabase": "connected"
}

# ❌ ERRADO:
{
  "error": "Supabase not configured"
}
```

---

## 🔧 Troubleshooting

### Problema: Secret File não carrega

**Possíveis causas:**
1. Nome do arquivo errado (deve ser exatamente `.env.production.local`)
2. Formato errado (verificar se não tem espaços extras ou quebras de linha incorretas)
3. Build cache não foi limpo (sempre limpar ao mudar Secret Files)

**Solução:**
1. Verificar nome do arquivo
2. Recriar Secret File com copy-paste cuidadoso
3. Deploy com "Clear build cache"

### Problema: GOOGLE_DRIVE_PRIVATE_KEY com \n

**Causa:**
A chave privada tem quebras de linha (`\n`) que precisam ser preservadas.

**Formato correto:**
```bash
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----
```

**Se der erro:**
Use aspas duplas:
```bash
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

### Problema: Build funciona mas runtime falha

**Causa:**
Algumas variáveis são usadas só em runtime (não precisam estar no build).

**Solução:**
Adicionar variáveis de runtime também em **Environment Variables** do Render (além do Secret File).

---

## 📋 Checklist Final

- [ ] Secret File criado: `.env.production.local`
- [ ] Todas as variáveis `NEXT_PUBLIC_*` incluídas
- [ ] Todas as chaves API incluídas
- [ ] Secret File salvo no Render
- [ ] Deploy manual com "Clear build cache"
- [ ] Logs de build: variáveis detectadas?
- [ ] Browser console: `NEXT_PUBLIC_*` retorna valor correto?
- [ ] API `/api/health` retorna success?

---

## 🎯 Resultado Esperado

Após configurar corretamente:

✅ Next.js detecta `.env.production.local` durante build
✅ Variáveis `NEXT_PUBLIC_*` embutidas no JavaScript bundle
✅ Variáveis server-side disponíveis em runtime
✅ App funciona perfeitamente em produção
✅ Zero variáveis expostas no código-fonte

---

**Última atualização:** 2026-03-02
**Status:** Solução definitiva testada e aprovada ✅
