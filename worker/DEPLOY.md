# 🚀 Deploy do Analysis Worker

Worker 24/7 que processa análises de perfis do Instagram automaticamente.

---

## 📋 Pré-requisitos

- ✅ Conta no [Railway.app](https://railway.app) (recomendado)
- ✅ Repositório GitHub conectado
- ✅ Variáveis de ambiente configuradas

---

## 🎯 Opção 1: Deploy no Railway (Recomendado)

### Passo 1: Criar Projeto

```bash
# Login no Railway CLI
npm install -g @railway/cli
railway login

# Criar novo projeto
railway init
```

### Passo 2: Configurar Deploy

No Railway Dashboard:
1. **New Project** → Deploy from GitHub
2. Selecionar repositório `postexpress2`
3. **Settings** → Build & Deploy:
   - **Root Directory:** `worker/`
   - **Dockerfile Path:** `worker/Dockerfile.analysis`
4. **Deploy**

### Passo 3: Adicionar Variáveis de Ambiente

No Railway Dashboard → **Variables**:

```env
# SUPABASE (obrigatório)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# APIFY (obrigatório)
APIFY_API_TOKEN=apify_api_...

# ANTHROPIC CLAUDE (obrigatório)
ANTHROPIC_API_KEY=sk-ant-...

# GOOGLE GEMINI (para OCR, opcional)
GOOGLE_AI_API_KEY=AIza...

# MISTRAL (OCR alternativo, opcional)
MISTRAL_API_KEY=...

# CLOUDINARY (para fotos de perfil, opcional)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Passo 4: Deploy Automático

✅ A cada push no branch `main`, o worker faz redeploy automático

---

## 🎯 Opção 2: Deploy no Render

### Passo 1: Criar Web Service

1. Acessar [Render Dashboard](https://dashboard.render.com)
2. **New** → **Background Worker**
3. Conectar repositório GitHub
4. Configurar:
   - **Name:** `postexpress-analysis-worker`
   - **Root Directory:** `worker`
   - **Docker Command:** `docker build -f Dockerfile.analysis -t analysis-worker .`
   - **Start Command:** `npx tsx analysis-worker.ts`

### Passo 2: Adicionar Env Vars

Igual ao Railway (ver acima).

---

## 🎯 Opção 3: Deploy no Fly.io

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Criar app
fly launch --dockerfile worker/Dockerfile.analysis

# Adicionar secrets
fly secrets set SUPABASE_URL=...
fly secrets set SUPABASE_SERVICE_ROLE_KEY=...
fly secrets set APIFY_API_TOKEN=...
fly secrets set ANTHROPIC_API_KEY=...

# Deploy
fly deploy
```

---

## 🧪 Testar Localmente

### Método 1: Node.js direto

```bash
cd worker

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env
# Editar .env com suas credenciais

# Rodar worker
npm run dev
```

### Método 2: Docker local

```bash
# Build
docker build -f worker/Dockerfile.analysis -t analysis-worker .

# Run
docker run --env-file worker/.env analysis-worker
```

---

## 📊 Monitoramento

### Logs em Tempo Real

**Railway:**
```bash
railway logs --follow
```

**Render:**
```bash
# Via dashboard: Logs → Tail Logs
```

**Fly.io:**
```bash
fly logs
```

### Verificar Status

Worker deve mostrar no console:
```
🤖 Analysis Worker iniciado
📊 Monitorando fila a cada 5s...
🔄 Máximo de 3 tentativas por análise
```

### Métricas Importantes

- ✅ **Pending items:** Quantas análises aguardando
- ✅ **Processing:** Análise em andamento
- ✅ **Completed:** Análises concluídas com sucesso
- ❌ **Failed:** Análises que falharam (após 3 tentativas)

---

## 🐛 Troubleshooting

### Worker não inicia

**Erro:** `Missing Supabase environment variables`

✅ **Solução:** Verificar se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configuradas.

---

### Worker não processa fila

**Sintoma:** Análises ficam em `pending` indefinidamente

✅ **Verificar:**
```sql
-- No SQL Editor do Supabase
SELECT * FROM analysis_queue WHERE status = 'pending';
```

✅ **Solução:** Verificar logs do worker para erros de conexão.

---

### Análise falha com erro de scraping

**Erro:** `Scraping falhou: Apify Actor not found`

✅ **Solução:** Verificar se `APIFY_API_TOKEN` está correta e tem créditos disponíveis.

---

### OCR falha

**Erro:** `OCR falhou: GEMINI_API_KEY not found`

✅ **Solução:** OCR é opcional. Se quiser desabilitar, análises continuam sem OCR. Para habilitar, adicionar `GOOGLE_AI_API_KEY`.

---

## 📈 Custos Estimados

| Plataforma | Custo Mensal | Free Tier |
|------------|--------------|-----------|
| **Railway** | $5-10 | $5 grátis |
| **Render** | $7 | 750h grátis |
| **Fly.io** | $3-5 | 3 VMs grátis |

**Recomendação:** Railway (mais simples) ou Fly.io (mais barato).

---

## 🔄 Deploy Contínuo

### GitHub Actions (opcional)

Criar `.github/workflows/deploy-worker.yml`:

```yaml
name: Deploy Analysis Worker

on:
  push:
    branches: [main]
    paths:
      - 'worker/**'
      - 'lib/**'
      - 'scripts/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service analysis-worker
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Worker iniciado com sucesso
- [ ] Logs mostrando monitoramento ativo
- [ ] Testar análise: criar perfil no frontend
- [ ] Verificar fila processando em ~3 min
- [ ] Análise completa salva no Supabase
- [ ] Frontend redireciona para resultado

---

## 🆘 Suporte

- **Logs:** Sempre verificar logs primeiro
- **Supabase:** Ver tabela `analysis_queue` para debug
- **Custo:** Monitorar uso de APIs (Apify, Claude, Gemini)

**Contato:** suporte@crokolabs.com

---

*Deploy configurado por Croko Labs - Motor de Conteúdo Autônomo™*
