# 🚨 FIX CRÍTICO: Erro placeholder.supabase.co

**Data:** 2026-02-26
**Status:** 🔴 CRÍTICO - Login não funciona no Railway

---

## Erro Identificado

```
https://placeholder.supabase.co/auth/v1/recover
net::ERR_NAME_NOT_RESOLVED
```

**Causa Raiz:** Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` **não estão configuradas no Railway**.

---

## ✅ SOLUÇÃO (5 minutos)

### 1. Railway Dashboard → Variables

Acesse: https://railway.app/ → Seu projeto → **Variables**

### 2. Adicione as Variáveis CRÍTICAS

```bash
# ===== SUPABASE (obrigatório para login funcionar) =====
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ===== APIs (necessárias para features) =====
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...

# ===== Cloudinary (necessário para imagens) =====
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456
CLOUDINARY_API_SECRET=abc...

# ===== WhatsApp (opcional) =====
UAZAPI_INSTANCE_ID=seu-instance-id
UAZAPI_TOKEN=seu-token
UAZAPI_WEBHOOK_URL=https://seu-app.railway.app/api/whatsapp/webhook

# ===== Node.js =====
NODE_ENV=production
```

### 3. Obter Valores Reais do Supabase

**Dashboard Supabase:** https://supabase.com/dashboard

1. Selecione seu projeto
2. **Settings** → **API**
3. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_ANON_KEY`
   - **service_role** (SEGREDO!) → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Redeploye

**Opção A: Via Railway UI**
```
Deployments → 3 dots → "Redeploy"
```

**Opção B: Via Git**
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### 5. Verificação

Após redeploy (~3 min):

1. Abra: `https://postexpress2-app-production.up.railway.app/login`
2. **F12** → Console
3. **NÃO deve mais aparecer** erro `placeholder.supabase.co`
4. Teste o login/cadastro

---

## 🔍 Por Que Isso Aconteceu?

1. Next.js precisa de `NEXT_PUBLIC_*` em **build time** (não runtime)
2. Se variáveis não existem durante build → `undefined` no código do cliente
3. Supabase client usa fallback `placeholder.supabase.co` quando variável é `undefined`
4. Railway precisa das variáveis configuradas **ANTES** do build

---

## 📋 Checklist de Verificação

- [ ] Variáveis adicionadas no Railway Dashboard
- [ ] Valores copiados corretamente do Supabase (sem espaços/quebras)
- [ ] Redeploy executado
- [ ] Build completou com sucesso (sem erros)
- [ ] App abre sem erros no console
- [ ] Login/cadastro funciona

---

## 🐛 Se Ainda Não Funcionar

### Cache de Build
```
Railway: Settings → "Clear Build Cache" → Redeploy
```

### Verificar Logs
```
Railway: Deployments → Último deploy → "View Logs"
Procurar por: "NEXT_PUBLIC_SUPABASE_URL" ou "undefined"
```

### CORS no Supabase
```
Supabase: Authentication → URL Configuration
Adicionar: https://postexpress2-app-production.up.railway.app
```

---

## 📚 Documentos Relacionados

- `RAILWAY-ENV-SETUP.md` - Guia completo de configuração
- `.env.example` - Template de variáveis
- `scripts/check-env.js` - Script de diagnóstico

---

**Autor:** @devops (Gage)
**Prioridade:** 🔴 CRÍTICA (P0)
