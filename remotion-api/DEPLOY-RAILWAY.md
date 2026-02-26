# 🚂 Deploy Railway - Passo a Passo

Guia completo para fazer deploy da API Remotion no Railway.

## ✅ Pré-requisitos

- Conta no Railway: https://railway.app
- Railway CLI instalado: `npm install -g @railway/cli`
- Credenciais Supabase e Cloudinary

## 📋 Passo 1: Preparar o projeto

### 1.1 Instalar dependências

Na pasta `remotion-api/`:

```bash
npm install
```

### 1.2 Testar localmente (opcional)

```bash
# Copiar .env.example para .env e preencher
cp .env.example .env

# Gerar bundle Remotion
npm run build:remotion

# Iniciar servidor
npm start

# Testar health check
curl http://localhost:3001/health
```

## 📋 Passo 2: Deploy no Railway

### 2.1 Login no Railway

```bash
railway login
```

Vai abrir o navegador para autenticar.

### 2.2 Criar projeto

```bash
railway init
```

Escolher:
- [x] Create a new project
- Nome: `remotion-api` (ou qualquer nome)

### 2.3 Adicionar variáveis de ambiente

Opção 1: Via CLI

```bash
railway variables set SUPABASE_URL="seu_supabase_url"
railway variables set SUPABASE_SERVICE_ROLE_KEY="seu_service_role_key"
railway variables set CLOUDINARY_CLOUD_NAME="seu_cloud_name"
railway variables set CLOUDINARY_API_KEY="seu_api_key"
railway variables set CLOUDINARY_API_SECRET="seu_api_secret"
railway variables set NODE_ENV="production"
railway variables set PORT="3001"
```

Opção 2: Via Dashboard

1. Abrir: https://railway.app
2. Ir no projeto criado
3. Aba "Variables"
4. Adicionar as variáveis acima

### 2.4 Fazer deploy

```bash
railway up
```

Aguardar build completar (~3-5 minutos).

### 2.5 Gerar domínio público

```bash
railway domain
```

Vai gerar uma URL como:
```
https://remotion-api-production.up.railway.app
```

**Copiar essa URL!** Vamos usar no frontend.

## 📋 Passo 3: Configurar Frontend (Vercel)

### 3.1 Adicionar variável de ambiente na Vercel

Dashboard da Vercel → Projeto → Settings → Environment Variables

Adicionar:

```
NEXT_PUBLIC_REMOTION_API_URL=https://remotion-api-production.up.railway.app
```

**Importante:** Trocar pela URL real do Railway!

### 3.2 Fazer redeploy do frontend

```bash
# No projeto Next.js (raiz)
git add .
git commit -m "feat: integrar API Remotion no Railway"
git push
```

Vercel vai fazer deploy automaticamente.

## 📋 Passo 4: Testar integração

### 4.1 Health check da API Railway

```bash
curl https://remotion-api-production.up.railway.app/health
```

Deve retornar:

```json
{
  "status": "ok",
  "service": "remotion-api",
  "timestamp": "2026-02-26T...",
  "env": {
    "nodeVersion": "v18.x.x",
    "platform": "linux",
    "memory": { ... }
  }
}
```

### 4.2 Testar geração de slides no frontend

1. Abrir dashboard: https://seu-app.vercel.app
2. Ir em "Configurar Slides"
3. Aprovar um carrossel
4. Clicar em "Gerar Slides"

Deve gerar slides via Railway!

## 📊 Monitoramento

### Ver logs em tempo real

```bash
railway logs
```

### Ver uso de recursos

Dashboard Railway → Metrics

Mostra:
- CPU usage
- Memory usage
- Network usage
- Custos

## 💰 Custos

**Plano Hobby:** $5/mês
- 500h compute time
- 100GB network egress

**Estimativa de uso:**

| Ação | Tempo | Custo |
|------|-------|-------|
| Gerar 10 slides | ~30s | ~$0.01 |
| Gerar 1 vídeo | ~2min | ~$0.02 |
| **100 carrosséis/mês** | ~50h | **~$5** |

**Conclusão:** $5/mês é suficiente para volume médio.

## 🐛 Troubleshooting

### Erro: "Bundle not found"

```bash
# Verificar se .remotion-bundle/ existe
ls -la remotion-api/.remotion-bundle/

# Gerar bundle manualmente
cd remotion-api
npm run build:remotion
railway up
```

### Erro: "Chromium not found"

Verificar `railway.toml` tem:

```toml
[build.nixpacksConfig]
packages = ["nodejs", "chromium", "nss", "freetype", "harfbuzz"]
```

### Erro: "Supabase connection failed"

Verificar variáveis de ambiente:

```bash
railway variables
```

Devem estar presentes:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

### Erro 500 em produção

Ver logs completos:

```bash
railway logs --follow
```

## 🎉 Sucesso!

Se chegou até aqui e tudo funcionou, parabéns! 🚀

Arquitetura final:

```
Vercel (Frontend Next.js)
    ↓
Railway (API Remotion)
    ↓
Cloudinary (Armazenamento)
```

**Vantagens:**
- ✅ Frontend rápido na Vercel (CDN global)
- ✅ Renderização pesada no Railway (sem limites)
- ✅ Custo otimizado: ~$5-10/mês

---

**Data:** 2026-02-26
**Versão:** 1.0
