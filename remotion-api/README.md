# Remotion API - Railway Deployment

API dedicada para renderização Remotion (slides e vídeos) rodando no Railway.

## 🎯 Por que Railway?

Vercel tem limitações para Remotion:
- Limite de 250MB (functions unzipped)
- Timeout de 300s (mesmo no Pro)
- Chromium serverless problemático

Railway oferece:
- ✅ Sem limites de tamanho
- ✅ Sem limites de timeout
- ✅ Chromium completo nativo
- ✅ Melhor custo: R$ 5-10/mês

## 📦 Estrutura

```
remotion-api/
├── api/                          # Rotas Express
│   ├── preview-carousel.js       # Preview de slides
│   ├── generate-slides-v3.js     # Geração de slides PNG
│   ├── generate-reel.js          # Vídeo individual
│   ├── generate-reels-batch.js   # Vídeos em batch
│   └── generate-audit-video.js   # Vídeo de auditoria
├── lib/                          # Utilitários
│   ├── remotion-bundle.js        # Gerenciador de bundle
│   ├── supabase-client.js        # Cliente Supabase
│   └── cloudinary-config.js      # Config Cloudinary
├── scripts/
│   └── build-remotion-bundle.js  # Build do bundle
├── .remotion-bundle/             # Bundle pré-compilado
├── server.js                     # Servidor Express
├── package.json
└── railway.toml                  # Config Railway
```

## 🚀 Deploy no Railway

### 1. Criar conta no Railway

Acesse: https://railway.app

### 2. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 3. Login

```bash
railway login
```

### 4. Criar projeto

Na pasta `remotion-api/`:

```bash
railway init
```

### 5. Configurar variáveis de ambiente

No dashboard do Railway, adicionar:

```env
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3001
```

### 6. Deploy

```bash
railway up
```

### 7. Obter URL do deploy

```bash
railway domain
```

Exemplo de URL: `https://remotion-api-production.up.railway.app`

## 🔗 Integração com Frontend (Vercel)

No projeto principal (Next.js na Vercel), adicionar variável de ambiente:

```env
NEXT_PUBLIC_REMOTION_API_URL=https://remotion-api-production.up.railway.app
```

As páginas do frontend vão chamar a API Railway em vez das rotas Next.js locais.

## 🧪 Testar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar .env

Copiar `.env.example` para `.env` e preencher valores.

### 3. Gerar bundle Remotion

```bash
npm run build:remotion
```

### 4. Iniciar servidor

```bash
npm start
```

Servidor rodando em: `http://localhost:3001`

### 5. Testar health check

```bash
curl http://localhost:3001/health
```

## 📊 Custos Railway

| Plano | Preço | Recursos |
|-------|-------|----------|
| Trial | $0 | $5 em créditos |
| Hobby | $5/mês | 500h compute + 100GB transfer |
| Pro | $20/mês | Ilimitado |

**Estimativa:** ~R$ 5-10/mês para volume médio de renderizações

## 🎬 Endpoints disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/api/content/:id/preview-carousel` | Preview de slide |
| POST | `/api/content/:id/generate-slides-v3` | Gerar slides PNG |
| POST | `/api/content/:id/generate-reel` | Gerar vídeo Reel |
| POST | `/api/content/:id/generate-reels-batch` | Gerar vídeos em batch |
| POST | `/api/audits/:id/generate-audit-video` | Gerar vídeo de auditoria |

## 🐛 Debugging

Ver logs em tempo real:

```bash
railway logs
```

## 📝 Notas

- Bundle Remotion é pré-compilado durante build (5.86MB)
- Chromium é instalado automaticamente no Railway (nixpacks)
- Upload para Cloudinary é automático após renderização
- Arquivos temporários em `/tmp` são limpos automaticamente
