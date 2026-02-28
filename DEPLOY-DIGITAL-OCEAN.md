# 🚀 Deploy Digital Ocean - Post Express (Croko Lab)

> Guia completo para deploy na Digital Ocean App Platform

---

## 📋 Pré-requisitos

### 1. Conta Digital Ocean
- [ ] Conta criada em https://cloud.digitalocean.com/
- [ ] Billing configurado (cartão de crédito)
- [ ] API Token gerado (Settings → API → Generate New Token)

### 2. Repositório Git
- [ ] Código commitado no GitHub/GitLab/Bitbucket
- [ ] Branch `main` ou `master` atualizada
- [ ] Dockerfile presente no repositório

### 3. Variáveis de Ambiente Necessárias
Você precisará configurar as seguintes variáveis de ambiente na Digital Ocean:

```bash
# Supabase (obrigatórias)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Cloudinary (obrigatórias)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Anthropic Claude (obrigatória)
ANTHROPIC_API_KEY=

# Google AI Gemini (obrigatória)
GOOGLE_AI_API_KEY=

# Apify (obrigatória)
APIFY_API_TOKEN=

# WhatsApp UAZapi (obrigatórias)
UAZAPI_INSTANCE_ID=
UAZAPI_TOKEN=
UAZAPI_WEBHOOK_URL=

# Google Drive (opcional - para export)
GOOGLE_DRIVE_CLIENT_EMAIL=
GOOGLE_DRIVE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=

# Mistral (opcional - OCR alternativo)
MISTRAL_API_KEY=

# Node Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 🏗️ Arquitetura do Deploy

### Digital Ocean App Platform
- **Tipo de App:** Docker Container
- **Runtime:** Node.js 18 (via Debian base)
- **Build:** Multi-stage Dockerfile otimizado
- **Recursos mínimos recomendados:**
  - **CPU:** 1 vCPU
  - **RAM:** 1 GB (mínimo) / 2 GB (recomendado)
  - **Disco:** 10 GB

### Stack Técnica
- Next.js 15 App Router
- Puppeteer (screenshots e slides)
- Remotion (renderização de vídeos)
- Supabase (PostgreSQL)
- Cloudinary (upload de imagens)
- UAZapi (WhatsApp)

---

## 📦 Passo a Passo - Deploy

### **Método 1: Via Interface Web (Recomendado)**

#### 1. Conectar Repositório

1. Acesse [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Clique em **"Create App"**
3. Selecione **GitHub/GitLab/Bitbucket**
4. Autorize acesso ao repositório
5. Selecione o repositório `postexpress2`
6. Escolha branch: `main`

#### 2. Configurar App

**Tipo de Recurso:**
- Selecione: **"Detect from Dockerfile"** (automático)
- Confirme que detectou o `Dockerfile`

**Nome do App:**
- Digite: `croko-lab` ou `postexpress`

**Região:**
- Recomendado: **New York** (latência menor para Brasil)
- Alternativa: **San Francisco**

#### 3. Configurar Variáveis de Ambiente

1. Na seção **"Environment Variables"**, clique em **"Edit"**
2. Adicione TODAS as variáveis listadas acima
3. **IMPORTANTE:** Marque como **"Encrypted"** as chaves secretas:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_AI_API_KEY`
   - `APIFY_API_TOKEN`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `UAZAPI_TOKEN`
   - `GOOGLE_DRIVE_PRIVATE_KEY`

#### 4. Configurar Build Arguments (ARGs)

Na seção **"Build Phase"**, adicione Build Arguments:

```
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
```

**Por que?** Next.js precisa das variáveis `NEXT_PUBLIC_*` no build time para embedá-las no bundle.

#### 5. Configurar Resources (Plano)

**Basic (Recomendado para começar):**
- 1 vCPU
- 1 GB RAM
- ~$12/mês

**Professional (Recomendado para produção):**
- 1 vCPU
- 2 GB RAM
- ~$24/mês

#### 6. Deploy!

1. Revise todas as configurações
2. Clique em **"Create Resources"**
3. Aguarde o build (~5-10 minutos)
4. App estará disponível em: `https://croko-lab-xxxxx.ondigitalocean.app`

---

### **Método 2: Via CLI (doctl)**

#### 1. Instalar doctl

```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz
tar xf ~/doctl-1.94.0-linux-amd64.tar.gz
sudo mv ~/doctl /usr/local/bin
```

#### 2. Autenticar

```bash
doctl auth init
# Cole seu API token quando solicitado
```

#### 3. Criar arquivo de spec

Crie `digital-ocean-app.yaml`:

```yaml
name: croko-lab
region: nyc

services:
  - name: web
    dockerfile_path: Dockerfile
    github:
      repo: seu-usuario/postexpress2
      branch: main
      deploy_on_push: true

    http_port: 3000

    instance_count: 1
    instance_size_slug: basic-xxs  # 1 vCPU, 1 GB RAM

    envs:
      - key: NODE_ENV
        value: production
      - key: NEXT_TELEMETRY_DISABLED
        value: "1"
      - key: SUPABASE_URL
        scope: RUN_TIME
        type: SECRET
      - key: SUPABASE_ANON_KEY
        scope: RUN_TIME
        type: SECRET
      # ... adicione todas as outras variáveis

    health_check:
      http_path: /api/health
```

#### 4. Deploy via CLI

```bash
# Criar app
doctl apps create --spec digital-ocean-app.yaml

# Ver status
doctl apps list

# Ver logs
doctl apps logs <app-id> --follow
```

---

## 🔧 Configurações Importantes

### 1. Webhook UAZapi

Após deploy, você precisa atualizar o webhook do UAZapi com a URL final:

```bash
# URL do webhook será:
https://seu-app.ondigitalocean.app/api/whatsapp/webhook

# Configurar no painel UAZapi:
# Settings → Webhook → URL
```

### 2. Google Drive Callback (se usar)

Se usar export para Google Drive, configure redirect URI:

```
https://seu-app.ondigitalocean.app/api/auth/callback/google
```

### 3. CORS Cloudinary

Adicione domínio Digital Ocean nas configurações Cloudinary:

```
https://seu-app.ondigitalocean.app
```

---

## 📊 Monitoramento

### Logs

```bash
# Via doctl
doctl apps logs <app-id> --follow --type build
doctl apps logs <app-id> --follow --type run

# Via Web
Apps → Seu App → Runtime Logs
```

### Métricas

Digital Ocean fornece automaticamente:
- CPU usage
- Memory usage
- Network bandwidth
- Request count
- Response time

### Alertas

Configure alertas em:
```
Apps → Seu App → Settings → Alerts
```

Recomendado:
- [ ] CPU > 80% por 5 minutos
- [ ] Memory > 90% por 5 minutos
- [ ] App Down por 2 minutos

---

## 💰 Custos Estimados

### App Platform

| Plano | vCPU | RAM | Preço/mês |
|-------|------|-----|-----------|
| Basic XXS | 1 | 512 MB | $5 |
| Basic XS | 1 | 1 GB | $12 |
| Basic S | 1 | 2 GB | $24 |
| Professional XS | 2 | 2 GB | $48 |

### APIs Externas (custos variáveis)

| Serviço | Custo estimado/mês |
|---------|-------------------|
| Supabase Free | $0 |
| Cloudinary Free | $0 (até 25 GB) |
| Anthropic Claude | ~$10-50 (depende uso) |
| Google Gemini | ~$5-20 (depende uso) |
| Apify | ~$10-30 (depende uso) |
| UAZapi | ~$0.01/mensagem |

**Total estimado:** $37-182/mês (dependendo do uso)

---

## 🐛 Troubleshooting

### Build Falha

**Erro:** `Chromium not found`

**Solução:** Verificar se Dockerfile instala dependências corretas:
```dockerfile
RUN apt-get update && apt-get install -y chromium
```

**Erro:** `npm ci` falha

**Solução:** Verificar se `package-lock.json` está commitado

### Runtime Falha

**Erro:** `Cannot connect to Supabase`

**Solução:** Verificar variáveis de ambiente:
```bash
doctl apps env list <app-id>
```

**Erro:** `Out of memory`

**Solução:** Aumentar plano para 2 GB RAM

### Webhooks não funcionam

**Erro:** UAZapi não recebe eventos

**Solução:**
1. Verificar URL do webhook no painel UAZapi
2. Testar endpoint: `curl https://seu-app.ondigitalocean.app/api/whatsapp/webhook`
3. Verificar logs para erros

---

## 🚀 Deploy Automatizado (CI/CD)

### GitHub Actions

Crie `.github/workflows/deploy-digitalocean.yml`:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}

      - name: Trigger deployment
        run: doctl apps create-deployment ${{ secrets.APP_ID }}
```

**Secrets necessários:**
- `DIGITALOCEAN_ACCESS_TOKEN`
- `APP_ID` (ID do app na Digital Ocean)

---

## 📝 Checklist Final

### Antes do Deploy
- [ ] Código commitado e pushed
- [ ] `.dockerignore` criado
- [ ] Variáveis de ambiente preparadas
- [ ] Testes passando (`npm test`)
- [ ] Build local funciona (`npm run build`)

### Durante Deploy
- [ ] Repositório conectado
- [ ] Dockerfile detectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build arguments configurados
- [ ] Plano selecionado

### Após Deploy
- [ ] App rodando (verificar URL)
- [ ] Webhook UAZapi atualizado
- [ ] Logs sem erros críticos
- [ ] Testar fluxo completo (WhatsApp → Conteúdo → Slides)
- [ ] Configurar alertas
- [ ] Configurar domínio customizado (opcional)

---

## 🌐 Domínio Customizado (Opcional)

### 1. Adicionar Domínio

```bash
doctl apps update <app-id> --spec digital-ocean-app.yaml
```

Em `digital-ocean-app.yaml`:
```yaml
domains:
  - domain: croko.lab
    type: PRIMARY
  - domain: www.croko.lab
    type: ALIAS
```

### 2. Configurar DNS

No seu provedor DNS (Cloudflare, Namecheap, etc.):

```
Tipo: CNAME
Nome: @
Valor: <app-url>.ondigitalocean.app
TTL: 300
```

### 3. Certificado SSL

Digital Ocean provisiona automaticamente certificado Let's Encrypt.

---

## 📞 Suporte

- **Digital Ocean Docs:** https://docs.digitalocean.com/products/app-platform/
- **Community:** https://www.digitalocean.com/community/
- **Tickets:** https://cloud.digitalocean.com/support/tickets

---

*Guia criado em 2026-02-28 - Post Express v1.0*
*Deploy otimizado para Digital Ocean App Platform*
