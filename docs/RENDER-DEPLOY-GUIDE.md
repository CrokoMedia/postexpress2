# Render.com Deploy - Guia Completo

## 🚨 Problema: Build Args não são passados automaticamente

O Render **não expõe** forma de passar env vars como `--build-arg` quando usando `runtime: docker`.

**Impacto:**
- `NEXT_PUBLIC_*` vars precisam estar disponíveis durante `npm run build`
- Sem elas, Next.js embute `undefined` no bundle JavaScript
- App quebra em produção

---

## ✅ Solução Definitiva: Environment Variables via Dashboard

Mesmo que você não veja a aba "Environment" em Settings, as variáveis DEVEM ser configuradas no Dashboard do Render.

### Onde encontrar:

1. **Opção A: Menu lateral esquerdo**
   ```
   ← Menu
   │
   ├─ Dashboard
   ├─ Services
   ├─ Environment Groups  ← AQUI
   └─ Settings
   ```

2. **Opção B: No serviço, busque "Environment"**
   - Acesse seu serviço `crokolab`
   - Procure por tabs/abas no topo da página
   - Deve haver: `Logs | Shell | Environment | Settings`

3. **Opção C: Via Render Blueprint (render.yaml)**
   - Defina as variáveis diretamente no render.yaml
   - Render injeta automaticamente

---

## 🎯 Configuração Correta no render.yaml

Atualize o `render.yaml` para garantir que variáveis estejam disponíveis:

```yaml
services:
  - type: web
    name: crokolab
    runtime: docker
    dockerfilePath: ./Dockerfile

    # CRITICAL: Adicionar buildCommand para passar args
    # ⚠️ LIMITAÇÃO: Render não suporta isto com runtime: docker
    # Solução: usar envVars e modificar Dockerfile

    envVars:
      # === Build Time Variables (CRÍTICAS) ===
      - key: NEXT_PUBLIC_SUPABASE_URL
        value: https://seu-projeto.supabase.co

      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

      # === Runtime Variables ===
      - key: SUPABASE_SERVICE_ROLE_KEY
        value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **PROBLEMA:** Isto define variáveis para RUNTIME, não BUILD TIME!

---

## ✅ Solução Alternativa: Hardcode Temporário

### Opção 1: Hardcode no Dockerfile (TEMPORÁRIO para testar)

Modificar `Dockerfile` linha 79-80:

```dockerfile
# TEMPORÁRIO: Hardcode para testar deploy
ENV NEXT_PUBLIC_SUPABASE_URL=https://cddbkqaqgbvjjyxkgzfi.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZGJrcWFxZ2J2amp5eGtnemZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxOTgzMjQsImV4cCI6MjA1Mzc3NDMyNH0.abc123...

# Build Next.js
RUN npm run build
```

⚠️ **ATENÇÃO:**
- ❌ NÃO commitar chaves reais no repositório público
- ✅ Usar apenas para TESTE inicial
- ✅ Depois configurar via Environment Variables do Render

### Opção 2: Criar arquivo .env.production no repositório

```bash
# .env.production (commitar este)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

Next.js carrega automaticamente `.env.production` durante o build.

⚠️ **CUIDADO:** Não commitar chaves secretas! Só chaves públicas (ANON_KEY está OK).

---

## ✅ Solução Profissional: Environment Groups

1. No Render Dashboard → **Environment Groups**
2. Create New Group: `postexpress-prod`
3. Adicionar variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Todas as outras variáveis
4. No serviço `crokolab`:
   - Settings → Environment
   - Link Environment Group: `postexpress-prod`

---

## 🔍 Como Verificar se Funcionou

### 1. Durante o Build (Logs do Render)

```bash
# ✅ CORRETO:
npm run build
Attention: Next.js now collects completely anonymous telemetry
info  - Creating an optimized production build...
✓ Compiled successfully

# ❌ ERRADO:
npm run build
⚠ The environment variable NEXT_PUBLIC_SUPABASE_URL is not defined
```

### 2. Após Deploy (Console do Browser)

Abra console no navegador e execute:

```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
// ✅ CORRETO: "https://seu-projeto.supabase.co"
// ❌ ERRADO: undefined
```

### 3. Teste de API

```bash
curl https://crokolab.onrender.com/api/health

# ✅ CORRETO: {"status":"ok","supabase":"connected"}
# ❌ ERRADO: {"status":"error","supabase":"not configured"}
```

---

## 📋 Checklist de Deploy

- [ ] Variáveis configuradas no Render Dashboard ou render.yaml
- [ ] Dockerfile tem ARGs definidos (linhas 69-73)
- [ ] Dockerfile tem ENVs mapeados (linhas 76-80)
- [ ] Deploy manual com "Clear build cache"
- [ ] Verificar logs: `NEXT_PUBLIC_*` aparece durante build?
- [ ] Testar no browser: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
- [ ] Testar API: `/api/health` retorna success?

---

## 🆘 Se Nada Funcionar: Contato Render Support

Se após tentar todas as soluções o problema persistir:

1. Abrir ticket no Render Support
2. Mencionar: "Need to pass environment variables as Docker build args"
3. Referência: https://render.com/docs/docker#environment-variables-at-build-time
4. Perguntar: "How to make env vars available during docker build for Next.js?"

---

**Última atualização:** 2026-03-02
**Responsável:** Dev Team + DevOps
