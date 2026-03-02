# Render.com Build Args - Solução Completa

## 🚨 Problema Identificado

O Render.com **não passa automaticamente** as env vars como `--build-arg` para o Docker build quando usando `runtime: docker`.

**Consequência:**
- Variáveis `NEXT_PUBLIC_*` são necessárias durante `npm run build` (build time)
- Render só disponibiliza env vars no runtime (após o build)
- Next.js embute `undefined` no bundle JavaScript
- ❌ App quebra em produção

---

## ✅ Solução 1: Dashboard do Render (RECOMENDADO)

### Passos:

1. Acesse o Dashboard do Render: https://dashboard.render.com/
2. Selecione o serviço `postexpress-app`
3. Settings → Environment
4. Para cada variável `NEXT_PUBLIC_*`, configure:

| Variable | Value | Build Time? |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` | ✅ **SIM** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | ✅ **SIM** |

5. Marque a checkbox: **"Available at Build Time"**
6. Save Changes
7. Trigger novo deploy: Deploy → Manual Deploy → Clear build cache & deploy

### Verificação:

Após o deploy, verifique os logs de build:

```bash
# Durante o build, você deve ver:
npm run build
# ✅ Next.js detectou as variáveis corretamente
# ✅ Bundle gerado com URLs corretas
```

---

## ✅ Solução 2: Script de Build Customizado

### 1. Criar script de build

Arquivo: `scripts/render-docker-build.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Render Docker Build com Build Args"

# Verificar variáveis obrigatórias
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL não definida"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não definida"
  exit 1
fi

# Build Docker com argumentos
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg SUPABASE_URL="$SUPABASE_URL" \
  --build-arg SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  -t postexpress:latest \
  .

echo "✅ Build concluído com sucesso"
```

### 2. Atualizar render.yaml

⚠️ **PROBLEMA:** Render não suporta `buildCommand` customizado quando `runtime: docker`.

**Alternativa:** Mudar para `runtime: native` e controlar o build manualmente:

```yaml
services:
  - type: web
    name: postexpress-app
    runtime: native  # ❌ MUDA DE docker para native
    buildCommand: ./scripts/render-docker-build.sh
    startCommand: docker run -p $PORT:3000 postexpress:latest
    # ... resto da config
```

⚠️ **Limitação:** Render Native não suporta rodar containers Docker diretamente.

---

## ✅ Solução 3: Build Args via Dockerfile ENV Defaults

### Modificar Dockerfile para usar valores default

```dockerfile
# STAGE 2: Build
FROM base AS builder

WORKDIR /app

# ARGs com defaults (só para desenvolvimento local)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

# ENVs (produção usa build args, dev usa defaults)
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://placeholder.supabase.co}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-placeholder-key}
ENV SUPABASE_URL=${SUPABASE_URL:-https://placeholder.supabase.co}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-placeholder-key}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-placeholder-key}

# Build Next.js
RUN npm run build
```

⚠️ **Problema:** Isso gera builds com placeholders se os args não forem passados.

---

## 🎯 Recomendação Final

### Para Render.com: **Solução 1 (Dashboard)**

1. Configure "Available at Build Time" no Dashboard
2. Mantenha Dockerfile e render.yaml como estão
3. Trigger manual deploy com cache limpo

### Para Railway/DigitalOcean: **Solução está OK**

- Railway passa env vars automaticamente como build args
- DigitalOcean App Platform também suporta build args nativamente

---

## 📋 Checklist de Deploy

- [ ] Variáveis `NEXT_PUBLIC_*` marcadas como "Build Time" no Dashboard
- [ ] Deploy manual com "Clear build cache"
- [ ] Verificar logs de build: variáveis foram detectadas?
- [ ] Testar app em produção: `fetch` do Supabase funciona?
- [ ] Inspecionar bundle: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`

---

## 🔍 Debug: Como Verificar se Build Args Foram Passados

### Adicionar log temporário no Dockerfile:

```dockerfile
# Depois dos ARGs, adicione:
RUN echo "🔍 DEBUG: NEXT_PUBLIC_SUPABASE_URL = $NEXT_PUBLIC_SUPABASE_URL"
RUN echo "🔍 DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY = ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."

# Build Next.js
RUN npm run build
```

### Verificar nos logs do Render:

```bash
# ✅ Se correto:
🔍 DEBUG: NEXT_PUBLIC_SUPABASE_URL = https://xxxx.supabase.co
🔍 DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...

# ❌ Se incorreto:
🔍 DEBUG: NEXT_PUBLIC_SUPABASE_URL =
🔍 DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY =
```

---

**Última atualização:** 2026-03-02
**Status:** Solução 1 (Dashboard) recomendada para Render.com
