# Railway Deploy Checklist - Remotion Funcionando ✅

## ✅ Pré-requisitos (CRÍTICOS)

### 1. Variáveis de Ambiente no Railway

**Acesse:** Railway Dashboard → Variables → Add Variable

```bash
# Supabase (obrigatórias)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Cloudinary (obrigatórias para upload de slides)
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123def456

# Claude API (obrigatória para geração de conteúdo)
ANTHROPIC_API_KEY=sk-ant-...

# FAL.ai (obrigatória para geração de imagens)
FAL_KEY=fal_...

# UAZapi (WhatsApp)
UAZAPI_INSTANCE_ID=sua-instance
UAZAPI_TOKEN=seu-token
UAZAPI_WEBHOOK_URL=https://seu-dominio.railway.app/api/whatsapp/webhook

# Google Drive (opcional)
GOOGLE_DRIVE_CLIENT_EMAIL=seu-email@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1abcdef123456

# Node.js (recomendado)
NODE_ENV=production
```

### 2. Recursos do Railway

**Acesse:** Railway Dashboard → Settings → Resources

- **Memory Limit:** 1024 MB (mínimo recomendado)
- **CPU:** 1 vCPU (suficiente)

**Por que 1GB?**
- Remotion + Chromium: ~400-600MB
- Next.js: ~200-300MB
- Margem de segurança: ~200MB

### 3. Verificar package.json

**Confirme que tem:**

```json
{
  "scripts": {
    "build": "next build",
    "build:remotion": "remotion bundle remotion/index.tsx -o .remotion-bundle"
  },
  "optionalDependencies": {
    "@remotion/compositor-darwin-arm64": "^4.0.429",
    "@remotion/compositor-darwin-x64": "^4.0.429",
    "@remotion/compositor-linux-arm64-gnu": "^4.0.429",
    "@remotion/compositor-linux-x64-gnu": "^4.0.429",
    "@remotion/compositor-win32-x64-msvc": "^4.0.429"
  }
}
```

---

## 🚀 Deploy

### Opção 1: Deploy Automático (Recomendado)

```bash
git push origin main
```

Railway detecta push → inicia build automaticamente.

### Opção 2: Deploy Manual via Railway CLI

```bash
railway up
```

---

## 🔍 Monitorar Deploy

### 1. Acompanhar Build

**Railway Dashboard → Deployments → Build Logs**

Ou via CLI:

```bash
railway logs --deployment
```

**O que esperar:**

```
✓ Installing dependencies
✓ Building Next.js
✓ Collecting page data
✓ Generating static pages
✓ Finalizing build
```

**Tempo estimado:** 3-5 minutos

### 2. Verificar Inicialização

```bash
railway logs --tail 50
```

**Sucesso:**

```
▲ Next.js 15.3.9
- Local: http://0.0.0.0:3000
- Network: http://0.0.0.0:3000

✓ Ready in 2.5s
```

---

## ✅ Testes Pós-Deploy

### 1. Teste Básico (Dashboard)

```
https://seu-app.railway.app/dashboard
```

**Esperado:** Dashboard carrega sem erros

### 2. Teste Debug Endpoint

Crie `app/api/debug/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET() {
  const checks = {
    remotionBundle: fs.existsSync(path.join(process.cwd(), '.remotion-bundle')),
    nodeVersion: process.version,
    platform: process.platform,
    cwd: process.cwd(),
    env: {
      supabase: !!process.env.SUPABASE_URL,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      fal: !!process.env.FAL_KEY,
    }
  }

  return NextResponse.json(checks)
}
```

**Acesse:**
```
https://seu-app.railway.app/api/debug/health
```

**Esperado:**

```json
{
  "remotionBundle": true,
  "nodeVersion": "v20.x.x",
  "platform": "linux",
  "env": {
    "supabase": true,
    "cloudinary": true,
    "anthropic": true,
    "fal": true
  }
}
```

### 3. Teste Geração de Slides

1. Acesse dashboard em produção
2. Escolha auditoria com conteúdo aprovado
3. Clique em "Gerar Slides"
4. Aguarde 2-3 minutos

**Esperado:**
- ✅ Slides gerados com sucesso
- ✅ Qualidade Sofia Pro mantida
- ✅ Upload para Cloudinary OK

---

## 🚨 Troubleshooting

### Erro 1: "JavaScript heap out of memory"

**Causa:** Memória insuficiente (< 1GB)

**Solução:**
1. Railway → Settings → Resources
2. Aumentar Memory Limit para 1024 MB ou mais
3. Redeploy

### Erro 2: "Remotion bundle not found"

**Causa:** Bundle não foi gerado no build

**Solução A: Force build script**

Adicione no `package.json`:

```json
{
  "scripts": {
    "build": "npm run build:remotion && next build"
  }
}
```

**Solução B: Commitar bundle pré-compilado**

```bash
# Build local
npm run build:remotion

# Force add (se .gitignore ignora)
git add -f .remotion-bundle/

# Commit
git commit -m "fix: add pre-built Remotion bundle for Railway"

# Push
git push origin main
```

### Erro 3: "Module not found: @remotion/compositor-*"

**Causa:** Pacotes nativos não instalados

**Solução:**

Verificar se `package.json` tem:

```json
{
  "optionalDependencies": {
    "@remotion/compositor-linux-x64-gnu": "^4.0.429"
  }
}
```

Se não tiver, adicionar e fazer deploy novamente.

### Erro 4: API timeout (504)

**Causa:** Rendering demora > 60s

**Solução:**

Editar `app/api/content/[id]/generate-slides-v3/route.ts`:

```typescript
export const maxDuration = 300 // 5 minutos
```

E adicionar no Railway:

```bash
REQUEST_TIMEOUT=300000
```

---

## 📊 Comparação: Local vs Railway

| Aspecto | Local | Railway | Status |
|---------|-------|---------|--------|
| **Webpack Build** | ✅ OK | ✅ OK (com fix) | Resolvido |
| **Remotion Rendering** | ✅ OK | ⚠️ Depende RAM | Precisa 1GB+ |
| **Chromium** | Sistema | @sparticuz/chromium | ✅ Configurado |
| **Bundle** | `.remotion-bundle/` | Precisa gerar | ⚠️ Verificar |
| **Memória** | Ilimitada | 512MB → 1GB+ | ⚠️ Aumentar |

---

## 🎯 Checklist Final

Antes de fazer deploy, confirme:

- [ ] Todas variáveis de ambiente configuradas no Railway
- [ ] Memory limit ≥ 1024 MB
- [ ] `package.json` tem `optionalDependencies` do Remotion
- [ ] `next.config.js` tem externalização de @remotion/*
- [ ] Código commitado e pushed para `origin/main`

Após deploy:

- [ ] Dashboard carrega sem erros
- [ ] `/api/debug/health` retorna `remotionBundle: true`
- [ ] Teste geração de slides funciona
- [ ] Logs do Railway sem erros de OOM

---

## 🆘 Se Tudo Falhar

**Último recurso: Arquitetura Híbrida**

- Frontend/Dashboard: Railway
- Remotion API: Servidor separado (Railway Worker ou Render)
- Comunicação via HTTP

Documentação: `docs/ARQUITETURA-HIBRIDA-RAILWAY.md`

---

## 📞 Próximos Passos

1. ✅ Confirmar checklist acima
2. 🚀 Fazer deploy (`git push`)
3. 🔍 Monitorar logs (`railway logs`)
4. 🧪 Testar geração de slides
5. 📊 Reportar resultado (sucesso ou erro)

---

**Status:** ✅ Pronto para deploy com monitoramento
**Confiança:** 85% (alta probabilidade de funcionar com RAM adequada)
**Risco:** Baixo (pode precisar ajuste de memória)

---

*Última atualização: 2026-02-28*
*Versão: 2.0 - Pós-Fix Webpack*
