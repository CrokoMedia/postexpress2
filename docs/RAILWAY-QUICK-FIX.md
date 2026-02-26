# 🚨 SOLUÇÃO RÁPIDA - Erro Supabase Placeholder no Railway

## ❌ Problema
```
Error: Invalid Supabase URL: https://placeholder.supabase.co/
```

## ✅ Solução em 5 Minutos

### 1️⃣ Obter Credenciais do Supabase

Acesse: https://supabase.com/dashboard → Seu Projeto → Settings → API

**Copie 2 valores:**

| Valor | Onde está |
|-------|-----------|
| **Project URL** | `https://xxxxx.supabase.co` |
| **anon public key** | `eyJhbGciOiJIUzI1Ni...` (muito longo) |
| **service_role key** | Clique "Reveal" → `eyJhbGciOiJIUzI1Ni...` |

---

### 2️⃣ Adicionar no Railway

Acesse: https://railway.app/dashboard → Seu Projeto → **Variables**

Clique **"+ New Variable"** e adicione cada uma:

```bash
# Variável 1
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co

# Variável 2
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1Ni... (anon key)

# Variável 3
SUPABASE_URL = https://xxxxx.supabase.co

# Variável 4
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1Ni... (anon key)

# Variável 5
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1Ni... (service_role key)
```

⚠️ **IMPORTANTE:**
- Variáveis 1 e 3 são **iguais** (mesma URL)
- Variáveis 2 e 4 são **iguais** (mesma anon key)
- Variável 5 é **diferente** (service_role key - secreta!)

---

### 3️⃣ Forçar Redeploy

**No Railway Dashboard:**
1. Vá em **Deployments** (menu lateral)
2. Clique nos **3 pontos (⋮)** do último deploy
3. Clique em **"Redeploy"**

**Ou via Git:**
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

---

### 4️⃣ Verificar se Funcionou

Aguarde **5-10 minutos** para o build completar.

Depois acesse: `https://seu-projeto.up.railway.app/api/health`

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "✅ Todas as variáveis críticas estão configuradas",
  "checks": {
    "publicVarsConfigured": true,
    "privateVarsConfigured": true,
    "allCriticalVarsOk": true
  }
}
```

**Se ainda der erro:**
```json
{
  "status": "error",
  "issues": [
    "❌ NEXT_PUBLIC_SUPABASE_URL não configurada"
  ]
}
```

→ Volte ao passo 2 e verifique as variáveis.

---

## 🔍 Verificar Localmente (Opcional)

Para testar se suas credenciais estão corretas:

```bash
# Execute o script de verificação
./scripts/check-railway-env.sh
```

Se aparecer:
- ✅ `Todas as variáveis estão configuradas!` → Credenciais OK
- ❌ `X variável(is) faltando` → Configure no Railway

---

## 📚 Mais Ajuda

- **Setup completo:** `docs/RAILWAY-ENV-SETUP.md`
- **Troubleshooting detalhado:** `docs/RAILWAY-TROUBLESHOOTING.md`

---

**Tempo total:** 5 minutos de configuração + 5-10 min de build = **~15 minutos**

*Última atualização: 2026-02-27*
