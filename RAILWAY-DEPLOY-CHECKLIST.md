# ✅ Railway Deploy Checklist - Post Express

## 🎯 Objetivo
Fazer deploy do Post Express (Next.js 15 + Remotion + Chromium + Supabase) no Railway.

---

## 📋 Pré-requisitos

- [ ] Conta no Railway (https://railway.app)
- [ ] Conta no Supabase com projeto criado
- [ ] Repositório Git com código mais recente
- [ ] Railway CLI instalado (opcional): `npm i -g @railway/cli`

---

## 🚀 Etapa 1: Criar Projeto no Railway

### 1.1 Conectar Repositório

1. Acesse: https://railway.app/new
2. Clique em **"Deploy from GitHub repo"**
3. Selecione o repositório: **postexpress2**
4. Clique em **"Deploy Now"**

### 1.2 Configurar Build

Railway vai detectar automaticamente o `railway.toml` e usar o `Dockerfile`.

**Verifique:**
- ✅ Build Type: **Dockerfile**
- ✅ Dockerfile Path: `Dockerfile` (raiz)
- ✅ Deploy Branch: `main`

---

## 🔐 Etapa 2: Configurar Variáveis de Ambiente

### 2.1 Obter Credenciais do Supabase

**Acesse:** https://supabase.com/dashboard → Seu Projeto → **Settings** → **API**

| Dado | Localização |
|------|-------------|
| **Project URL** | `Configuration` → URL → `https://xxxxx.supabase.co` |
| **anon/public key** | `Project API keys` → `anon` `public` → Copie |
| **service_role key** | `Project API keys` → `service_role` → Clique **"Reveal"** → Copie |

### 2.2 Adicionar Variáveis no Railway

**Acesse:** Railway Dashboard → Seu Projeto → **Variables**

Clique em **"+ New Variable"** e adicione **cada uma destas**:

#### ⚡ Variáveis Obrigatórias (Supabase)

```bash
# 1. URL do Supabase (pública)
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co

# 2. Anon Key do Supabase (pública)
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1Ni...

# 3. URL do Supabase (servidor)
SUPABASE_URL = https://xxxxx.supabase.co

# 4. Anon Key do Supabase (servidor)
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1Ni...

# 5. Service Role Key do Supabase (SECRETA!)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1Ni...
```

⚠️ **IMPORTANTE:**
- Variáveis 1 e 3 são **IGUAIS** (mesma URL)
- Variáveis 2 e 4 são **IGUAIS** (mesma anon key)
- Variável 5 é **DIFERENTE** (service_role key - NUNCA expor!)

#### 🔧 Variáveis do Sistema

```bash
NODE_ENV = production
PORT = 3000
HOSTNAME = 0.0.0.0
```

#### 🎨 Variáveis Opcionais (Services Externos)

Se você usa estes serviços, adicione também:

```bash
# Cloudinary (upload de imagens)
CLOUDINARY_CLOUD_NAME = seu-cloud-name
CLOUDINARY_API_KEY = 123456789012345
CLOUDINARY_API_SECRET = abc123xyz...

# Anthropic Claude (geração de conteúdo)
ANTHROPIC_API_KEY = sk-ant-api03-...

# Google AI (OCR com Gemini)
GOOGLE_AI_API_KEY = AIzaSy...

# Apify (scraping Instagram)
APIFY_API_TOKEN = apify_api_...

# UAZapi (WhatsApp)
UAZAPI_INSTANCE_ID = instance_...
UAZAPI_TOKEN = token_...
UAZAPI_WEBHOOK_URL = https://seu-app.up.railway.app/api/whatsapp/webhook

# Google Drive (export de slides)
GOOGLE_DRIVE_CLIENT_EMAIL = service-account@....iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID = 1abc...
```

---

## 🏗️ Etapa 3: Deploy e Verificação

### 3.1 Iniciar Deploy

Depois de adicionar TODAS as variáveis:

**Opção A - Via Dashboard:**
1. Railway vai fazer deploy automático
2. Aguarde 5-10 minutos (build é pesado: Next.js + Remotion + Chromium)

**Opção B - Via CLI:**
```bash
railway up --detach
```

**Opção C - Via Git Push:**
```bash
git push origin main
```

### 3.2 Monitorar Build

```bash
# Via CLI
railway logs

# Ou via Dashboard
# Deployments > View Logs
```

**Procure por:**
- ✅ `Building Remotion bundle...` → Remotion OK
- ✅ `Building Next.js...` → Next.js OK
- ✅ `Creating optimized production build` → Build OK
- ✅ `Compiled successfully` → Deploy OK
- ❌ `Missing SUPABASE_URL` → Volte ao passo 2.2

### 3.3 Verificar Health Endpoint

Quando o deploy finalizar, teste o health endpoint:

```bash
# Substitua pela sua URL do Railway
curl https://seu-projeto.up.railway.app/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "supabase": "connected",
  "timestamp": "2026-02-27T..."
}
```

**Se retornar erro:**
```json
{
  "status": "error",
  "error": "Invalid Supabase URL: https://placeholder.supabase.co/"
}
```
→ Variáveis não configuradas corretamente. Volte ao passo 2.2.

### 3.4 Verificar Aplicação

Acesse a URL do Railway no browser:

```
https://seu-projeto.up.railway.app
```

**Teste:**
- [ ] Página carrega sem erro 500
- [ ] Dashboard exibe corretamente
- [ ] Console do browser sem erros críticos
- [ ] Supabase conectando (verifique no Network tab)

---

## 🐛 Troubleshooting

### ❌ Erro: "https://placeholder.supabase.co/"

**Solução:** Variáveis não foram aplicadas. Siga `docs/RAILWAY-QUICK-FIX.md`

### ❌ Build demora muito (> 15 min)

**Causa:** Railway tem limite de recursos no plano Free.

**Solução:**
1. Upgrade para plano Hobby ($5/mês)
2. Ou aguarde - build pesado é normal (Chromium + Remotion)

### ❌ "Error: Cannot find module 'server.js'"

**Causa:** Build do Next.js não gerou standalone corretamente.

**Solução:**
1. Verifique `next.config.js` tem `output: 'standalone'` ✅ (já tem!)
2. Force rebuild: `railway up --detach`

### ❌ Remotion não funciona em produção

**Causa:** `.remotion-bundle/` não foi copiado para o container.

**Solução:**
1. Verifique se `.remotion-bundle/` existe localmente:
   ```bash
   ls -la .remotion-bundle/
   ```
2. Se não existir, rode: `npm run build:remotion`
3. Commit e push: `git add .remotion-bundle/ && git commit -m "fix: add remotion bundle" && git push`

### ❌ Timeout em geração de slides/vídeos

**Causa:** Railway Free tem timeout de 5 min. Remotion pode demorar mais.

**Solução:**
1. Upgrade para plano Hobby (sem timeout)
2. Ou otimize os componentes Remotion (menos frames, menor resolução)

---

## 📊 Métricas de Deploy Bem-Sucedido

- ✅ Build completa em: **5-10 minutos**
- ✅ Health endpoint retorna: `{ "status": "ok", "supabase": "connected" }`
- ✅ Aplicação carrega em: **< 3 segundos**
- ✅ Logs sem erros de: `Missing`, `ECONNREFUSED`, `CORS`
- ✅ Geração de slides funciona (teste criar um carrossel)

---

## 🎯 Próximos Passos (Pós-Deploy)

### 1. Configurar Domínio Customizado (Opcional)

Railway → Settings → Domains → Add Custom Domain

### 2. Configurar CI/CD (Opcional)

Railway já faz deploy automático em cada push no `main`.

**Para controlar melhor:**
1. Settings → Deployment → Branch → Escolha `production`
2. Só faça push na branch `production` quando quiser deploy

### 3. Monitoramento

```bash
# Logs em tempo real
railway logs --follow

# Métricas de uso
railway status
```

### 4. Backup do Banco

Configure backup automático no Supabase:

Supabase Dashboard → Settings → Database → Point-in-Time Recovery (PITR)

---

## 📞 Suporte

**Documentação completa:**
- `docs/RAILWAY-ENV-SETUP.md` - Setup detalhado
- `docs/RAILWAY-QUICK-FIX.md` - Solução rápida
- `docs/RAILWAY-TROUBLESHOOTING.md` - Troubleshooting avançado

**Verificar variáveis localmente:**
```bash
./scripts/check-railway-env.sh
```

**Railway Docs:**
- https://docs.railway.app/deploy/deployments
- https://docs.railway.app/deploy/dockerfiles

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Variáveis do Supabase configuradas (5 variáveis)
- [ ] Railway detectou `railway.toml` e `Dockerfile`
- [ ] Build completou sem erros (5-10 min)
- [ ] Health endpoint retorna `"status": "ok"`
- [ ] Dashboard carrega corretamente
- [ ] Geração de carrossel funciona (teste real)
- [ ] Logs sem erros críticos
- [ ] Domínio configurado (opcional)

---

**🎉 Deploy Completo!**

Seu Post Express está rodando em produção no Railway, pronto para:
- ✅ Auditar perfis do Instagram
- ✅ Gerar carrosséis de conteúdo
- ✅ Criar slides visuais com Remotion
- ✅ Processar vídeos e análises
- ✅ Integrar com WhatsApp (UAZapi)

---

*Última atualização: 2026-02-27*
*Versão: 1.0 - Deploy Inicial*
