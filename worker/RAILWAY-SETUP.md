# 🚂 Railway Setup - Passo a Passo

## ✅ **Você precisa fazer 3 coisas:**

---

## 1️⃣ **Fazer Login no Railway CLI**

```bash
# No terminal (vai abrir o browser)
railway login
```

✅ **Autorize no browser quando abrir**

---

## 2️⃣ **Adicionar Variáveis de Ambiente**

Você tem **2 opções** (escolha a mais fácil):

### **Opção A: Via Dashboard (Recomendado)**

1. Acesse: https://railway.app/dashboard
2. Clique em **New Project** → **Empty Project**
3. Nome: `postexpress-analysis-worker`
4. Clique no projeto
5. Vá em **Variables**
6. Adicione as variáveis abaixo

### **Opção B: Via CLI**

```bash
cd worker

# Variáveis obrigatórias
railway variables set SUPABASE_URL="https://seu-projeto.supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."
railway variables set APIFY_API_TOKEN="apify_api_..."
railway variables set ANTHROPIC_API_KEY="sk-ant-..."

# Opcional (OCR)
railway variables set GOOGLE_AI_API_KEY="AIza..."

# Opcional (fotos de perfil)
railway variables set CLOUDINARY_CLOUD_NAME="..."
railway variables set CLOUDINARY_API_KEY="..."
railway variables set CLOUDINARY_API_SECRET="..."
```

---

## 📋 **Lista de Variáveis Necessárias**

Copie as suas credenciais do projeto:

```env
# OBRIGATÓRIO
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APIFY_API_TOKEN=apify_api_...
ANTHROPIC_API_KEY=sk-ant-api03-...

# OPCIONAL (para OCR)
GOOGLE_AI_API_KEY=AIzaSy...
MISTRAL_API_KEY=...

# OPCIONAL (para fotos de perfil)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 🔍 **Onde encontrar cada credencial:**

| Variável | Onde pegar |
|----------|------------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Service Role Key (⚠️ secret) |
| `APIFY_API_TOKEN` | Apify Console → Settings → Integrations → API Token |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |
| `GOOGLE_AI_API_KEY` | Google AI Studio → Get API Key |
| `CLOUDINARY_*` | Cloudinary Dashboard → Settings → Access Keys |

---

## 3️⃣ **Fazer Deploy**

### **Opção A: Script Automático (Recomendado)**

```bash
cd worker
./railway-deploy.sh
```

O script vai:
- ✅ Verificar autenticação
- ✅ Criar projeto (se não existir)
- ✅ Lembrá-lo de configurar variáveis
- ✅ Fazer deploy
- ✅ Mostrar comandos úteis

### **Opção B: Manual**

```bash
cd worker

# Criar projeto (se não existir)
railway init --name postexpress-analysis-worker

# Deploy
railway up
```

---

## 📊 **Após o Deploy**

### Ver logs em tempo real:
```bash
railway logs --follow
```

**Console esperado:**
```
🤖 Analysis Worker iniciado
📊 Monitorando fila a cada 5s...
🔄 Máximo de 3 tentativas por análise
```

### Ver status:
```bash
railway status
```

### Abrir dashboard:
```bash
railway open
```

### Verificar métricas:
- Dashboard → Seu projeto → Metrics
- Veja: CPU, RAM, Network

---

## 🧪 **Testar se Está Funcionando**

1. **No frontend:** Criar nova análise de perfil
2. **Verificar fila no Supabase:**
   ```sql
   SELECT * FROM analysis_queue ORDER BY created_at DESC LIMIT 1;
   ```
3. **Ver logs do worker:**
   ```bash
   railway logs --follow
   ```
4. **Aguardar ~3 minutos**
5. **Verificar análise completa:**
   ```sql
   SELECT * FROM audits ORDER BY created_at DESC LIMIT 1;
   ```

---

## 🐛 **Troubleshooting**

### Worker não inicia

**Erro:** `Missing Supabase environment variables`

✅ **Solução:**
```bash
# Verificar variáveis
railway variables

# Se estiver faltando, adicionar
railway variables set SUPABASE_URL="..."
```

### Deploy falha

**Erro:** `Failed to build Dockerfile`

✅ **Solução:** Verificar se está no diretório correto
```bash
cd worker
railway up
```

### Worker inicia mas não processa

✅ **Verificar:**
1. Logs do worker: `railway logs --follow`
2. Fila no Supabase: `SELECT * FROM analysis_queue WHERE status = 'pending'`
3. Credenciais Apify/Claude estão corretas

---

## 💰 **Monitorar Custos**

Railway Dashboard → Billing → Usage

**Esperado:**
- Worker 24/7: ~$2-3/mês
- Total (plano + uso): ~$7-10/mês

---

## 🆘 **Suporte**

- **Railway Discord:** https://discord.gg/railway
- **Railway Docs:** https://docs.railway.app
- **Railway Status:** https://status.railway.app

---

## ✅ **Checklist Final**

- [ ] Login feito (`railway login`)
- [ ] Variáveis configuradas (via dashboard ou CLI)
- [ ] Deploy realizado (`./railway-deploy.sh` ou `railway up`)
- [ ] Logs mostram worker rodando
- [ ] Teste criando análise no frontend
- [ ] Análise completa em ~3 minutos
- [ ] Dados salvos no Supabase

**Pronto! Worker rodando 24/7 em produção! 🚀**

---

*Deploy configurado por Croko Labs - Motor de Conteúdo Autônomo™*
