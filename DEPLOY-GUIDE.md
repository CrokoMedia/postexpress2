# 🚀 Guia de Deploy - Vercel (Passo a Passo)

**Data:** 2026-02-26
**Status do Projeto:** ✅ Pronto para Deploy
**Tempo estimado:** 30-45 minutos

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- [x] Conta no [Vercel](https://vercel.com) (grátis)
- [x] Conta no [Supabase](https://supabase.com) configurada
- [x] Conta no [Cloudinary](https://cloudinary.com) configurada
- [x] Chave da API [Anthropic](https://console.anthropic.com/) (Claude)
- [x] Git instalado
- [x] Node.js >= 18 instalado

---

## 🎯 PASSO 1: EXECUTAR AUDITORIA PRÉ-DEPLOY

Primeiro, vamos verificar se está tudo ok:

```bash
# Rodar script de auditoria
./scripts/pre-deploy-check.sh
```

**Se o script não rodar:**
```bash
chmod +x scripts/pre-deploy-check.sh
./scripts/pre-deploy-check.sh
```

**Resultado esperado:**
```
✅ SISTEMA PRONTO PARA DEPLOY!
   Todos os checks críticos passaram.
```

**Se houver erros críticos (❌):**
- Corrija os erros antes de continuar
- Rode o script novamente até passar

---

## 🔐 PASSO 2: PREPARAR VARIÁVEIS DE AMBIENTE

### 2.1 - Gerar Secrets Seguros

```bash
# Gerar CRON_SECRET
openssl rand -base64 32

# Copie o resultado (exemplo):
# KjH8F2nPxQ9mZvL4rWtY7uE1sD3gC6bN5aX0kM2lI8j=
```

Salve esses valores em um arquivo **FORA DO GIT** (ex: `secrets.txt`).

### 2.2 - Listar Todas as Variáveis Necessárias

Crie um arquivo `env-production.txt` com:

```env
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OBRIGATÓRIAS (mínimo para funcionar)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# Anthropic (Claude API)
ANTHROPIC_API_KEY=sk-ant-...

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefgh...

# Cron Security (TROCAR!)
CRON_SECRET=<valor-gerado-no-passo-2.1>
NEXT_PUBLIC_CRON_SECRET=<valor-gerado-no-passo-2.1>

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OPCIONAIS (features específicas)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Apify (análise Instagram)
APIFY_API_TOKEN=apify_api_...

# Google AI (OCR Gemini)
GOOGLE_AI_API_KEY=AIza...

# OpenAI (alternativa para IA)
OPENAI_API_KEY=sk-...

# ElevenLabs (voz para Reels)
ELEVENLABS_API_KEY=...

# Twitter API (monitoramento)
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_BEARER_TOKEN=...

# Google Drive (export de slides)
GOOGLE_DRIVE_CLIENT_EMAIL=...@....iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=...

# Pexels (B-Roll de vídeos)
PEXELS_API_KEY=...

# Instagram Graph API (publicação automática)
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
INSTAGRAM_REDIRECT_URI=https://seu-dominio.vercel.app/api/auth/instagram/callback
```

**IMPORTANTE:**
- NÃO commite este arquivo no git!
- Mantenha em local seguro (gerenciador de senhas, 1Password, etc.)

---

## 🌐 PASSO 3: CONFIGURAR VERCEL

### 3.1 - Criar Conta no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. **Recomendado:** Login com GitHub (mais fácil para deploy)
4. Complete o cadastro

### 3.2 - Conectar Repositório GitHub

**Opção A: Importar Projeto Existente**

1. No Vercel, clique em **"Add New Project"**
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório `postexpress2` (ou nome atual)
4. Clique em **"Import"**

**Opção B: Via CLI (alternativa)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 3.3 - Configurar Projeto no Vercel

**Na tela de configuração do projeto:**

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` (raiz) |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install --legacy-peer-deps` |

**⚠️ IMPORTANTE:** Se não adicionar `--legacy-peer-deps`, o build pode falhar!

**Clique em "Deploy" ainda NÃO!** Antes, configure as env vars ↓

---

## 🔑 PASSO 4: ADICIONAR VARIÁVEIS DE AMBIENTE NO VERCEL

### 4.1 - Acessar Settings

1. No seu projeto no Vercel, vá em **Settings**
2. Clique em **Environment Variables** (menu lateral)

### 4.2 - Adicionar Variáveis

**Para cada variável do arquivo `env-production.txt`:**

1. Cole o **nome** no campo "Key" (ex: `SUPABASE_URL`)
2. Cole o **valor** no campo "Value"
3. Selecione os ambientes:
   - ✅ **Production** (obrigatório)
   - ✅ **Preview** (recomendado)
   - ⬜ **Development** (opcional - só se usar `vercel dev`)
4. Clique em **"Add"**

**Repita para TODAS as variáveis obrigatórias!**

### 4.3 - Variáveis Críticas (NÃO esquecer!)

Certifique-se de adicionar especialmente:

```
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ ANTHROPIC_API_KEY
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ CRON_SECRET (COM VALOR NOVO!)
✅ NEXT_PUBLIC_CRON_SECRET (COM VALOR NOVO!)
```

### 4.4 - Dica: Copiar do .env Local

```bash
# Ver suas variáveis locais (cuidado ao compartilhar tela!)
cat .env
```

**Copie e cole no Vercel manualmente** (não há como fazer upload do arquivo).

---

## 🚀 PASSO 5: FAZER O DEPLOY

### 5.1 - Limpar e Preparar Código

```bash
# 1. Limpar arquivos temporários
find . -name ".DS_Store" -delete
rm -f worker-output.log

# 2. Atualizar .gitignore (se necessário)
cat >> .gitignore << 'EOF'
.DS_Store
*.log
coverage/
.nyc_output/
EOF

# 3. Verificar status git
git status

# 4. Commit das mudanças (se houver)
git add .
git commit -m "chore: preparar para deploy no Vercel"

# 5. Push para o GitHub
git push origin main
```

### 5.2 - Deploy Automático via GitHub

Se você conectou o Vercel ao GitHub:

1. Ao fazer `git push`, o Vercel detecta automaticamente
2. Inicia o build automaticamente
3. Aguarde 2-5 minutos

**Acompanhe o build:**
- Acesse o dashboard do Vercel
- Clique no seu projeto
- Vá em **"Deployments"**
- Clique no deployment em andamento
- Veja os logs em tempo real

### 5.3 - Deploy Manual via CLI (alternativa)

```bash
# Deploy de produção
npx vercel --prod

# Seguir prompts:
# ? Set up and deploy "~/postexpress2"? [Y/n] Y
# ? Which scope do you want to deploy to? (selecione seu usuário)
# ? Link to existing project? [Y/n] Y (se já criou no passo 3)
# ? What's your project's name? croko-lab (ou seu nome)
```

---

## ✅ PASSO 6: VERIFICAR SE FUNCIONOU

### 6.1 - Build Passou?

**No Vercel Dashboard:**
- Status deve estar **"Ready"** (verde)
- Se estiver **"Failed"** (vermelho), veja os logs de erro

**Logs de build:**
```
Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (51/51)
✓ Finalizing page optimization
```

### 6.2 - Acessar o Site

Vercel fornece uma URL automática:
```
https://seu-projeto.vercel.app
```

**Teste:**
1. Abra a URL no navegador
2. Acesse `/dashboard`
3. Tente fazer login (se tiver autenticação)
4. Teste criar um perfil

### 6.3 - Checklist de Validação

- [ ] Site está no ar (não dá erro 404)
- [ ] Dashboard carrega sem erros
- [ ] Console do navegador sem erros críticos (F12)
- [ ] Imagens carregam (Cloudinary funciona)
- [ ] Pode criar um perfil de teste
- [ ] Pode fazer análise de um perfil
- [ ] Geração de conteúdo funciona
- [ ] APIs respondem (testar endpoints)

### 6.4 - Testar APIs Manualmente

```bash
# Substituir SEU_DOMINIO pela URL do Vercel
DOMAIN="https://seu-projeto.vercel.app"

# Teste 1: Health check
curl -I $DOMAIN

# Teste 2: API de autenticação
curl $DOMAIN/api/auth/me

# Teste 3: Listar perfis (pode precisar autenticação)
curl $DOMAIN/api/profiles
```

---

## 🐛 PASSO 7: TROUBLESHOOTING (se houver erros)

### Erro 1: "Module not found: Can't resolve..."

**Causa:** Dependência faltando

**Solução:**
```bash
# Localmente, instalar a dependência
npm install <pacote> --legacy-peer-deps

# Commit e push
git add package.json package-lock.json
git commit -m "fix: adicionar dependência faltante"
git push
```

### Erro 2: "Build exceeded maximum duration"

**Causa:** Build demora mais de 45 min (limite do plano Free)

**Soluções:**
1. Verificar se há operações pesadas no build
2. Remover logs `console.log` desnecessários
3. Otimizar imports (tree shaking)
4. Considerar upgrade para Pro ($20/mês)

### Erro 3: "Function execution timeout"

**Causa:** API Route demora mais de 10s (Serverless Functions)

**Soluções:**
1. Otimizar queries do Supabase
2. Adicionar índices no banco de dados
3. Cachear resultados pesados
4. Considerar Edge Functions (mais rápidas)

### Erro 4: "Environment variable not found"

**Causa:** Variável não configurada no Vercel

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicionar a variável faltante
3. Fazer redeploy:
   - Settings → Deployments → ⋯ (3 pontos) → Redeploy

### Erro 5: Supabase RLS bloqueando requisições

**Causa:** Row Level Security (RLS) bloqueando acesso

**Solução:**
1. Verificar se está usando `SUPABASE_SERVICE_ROLE_KEY` em APIs server-side
2. Verificar políticas RLS no Supabase Dashboard
3. Testar localmente primeiro

### Erro 6: Cloudinary upload falha

**Causa:** Credenciais inválidas ou limite excedido

**Solução:**
1. Verificar env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. Checar cota no Cloudinary Dashboard
3. Testar com imagem pequena primeiro

### Erro 7: Puppeteer não funciona

**Causa:** Chromium não disponível no Vercel Serverless

**Solução:**
```bash
# Já está configurado no projeto:
# - @sparticuz/chromium no package.json ✅
# - serverExternalPackages no next.config.js ✅

# Se ainda falhar, verificar se está importando corretamente:
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
})
```

---

## 📊 PASSO 8: MONITORAMENTO PÓS-DEPLOY

### 8.1 - Vercel Analytics

**Ativar analytics:**
1. Vercel Dashboard → seu projeto
2. Clique em **"Analytics"** (menu lateral)
3. Enable Analytics (grátis até 100k page views/mês)

**Métricas importantes:**
- **Requests** - Tráfego total
- **Bandwidth** - Dados transferidos
- **Function Duration** - Tempo de execução das APIs
- **Errors** - Erros de runtime

### 8.2 - Logs em Tempo Real

```bash
# Via CLI
npx vercel logs <deployment-url> --follow

# Ou no Dashboard:
# Deployments → [seu deploy] → Logs
```

### 8.3 - Configurar Alertas (Recomendado)

**Opções:**

1. **Vercel Notifications**
   - Settings → Notifications
   - Ativar: "Deployment Errors", "Build Failures"

2. **Sentry (erro tracking - recomendado)**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Uptime monitoring (ex: UptimeRobot, grátis)**
   - Monitora se o site está no ar 24/7
   - Alerta por email/SMS se cair

### 8.4 - Performance Check

**PageSpeed Insights:**
```
https://pagespeed.web.dev/
```

**Metas:**
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

Se não atingir, considerar otimizações (próximo passo).

---

## 🚀 PASSO 9: OTIMIZAÇÕES PÓS-DEPLOY (Opcional)

### 9.1 - Domínio Personalizado

**Adicionar domínio próprio:**

1. Vercel Dashboard → Settings → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `crokolabs.com`)
4. Siga instruções para configurar DNS

**DNS Records necessários:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 9.2 - SSL/HTTPS

**Automático!** Vercel provisiona SSL gratuito (Let's Encrypt).

Verifique:
- https://seu-dominio.vercel.app deve ter cadeado verde

### 9.3 - Cache e CDN

**Já ativo por padrão!** Vercel usa CDN global automaticamente.

**Otimizações adicionais:**
```javascript
// next.config.js
const nextConfig = {
  // ... config existente

  // Adicionar headers de cache
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 9.4 - Image Optimization

**Converter <img> para <Image />:**

```typescript
// Antes:
<img src="/avatar.jpg" alt="Avatar" />

// Depois:
import Image from 'next/image'
<Image src="/avatar.jpg" alt="Avatar" width={100} height={100} />
```

**Benefícios:**
- Lazy loading automático
- Formato WebP/AVIF automático
- Responsive images
- Placeholder blur

---

## 📝 PASSO 10: DOCUMENTAÇÃO INTERNA

### 10.1 - Criar Runbook

Documente:
- URLs de produção
- Credenciais (onde estão guardadas)
- Processo de deploy
- Contatos de suporte (Vercel, Supabase, etc.)

### 10.2 - Ambiente de Staging (Recomendado)

**Criar branch `staging`:**

```bash
git checkout -b staging
git push origin staging
```

**No Vercel:**
- Deployments de `staging` vão para URL de preview
- Deployments de `main` vão para produção

**Workflow:**
```
feature-branch → PR → staging → test → main → production
```

---

## 🎉 CONCLUSÃO

### Checklist Final

- [x] Build passou no Vercel
- [x] Site está no ar
- [x] Variáveis de ambiente configuradas
- [x] APIs funcionando
- [x] Supabase conectado
- [x] Cloudinary funcionando
- [x] Cron jobs rodando
- [x] Sem erros críticos nos logs
- [x] Performance ok (LCP < 2.5s)
- [x] Mobile responsivo

### Próximos Passos

1. **Curto prazo (1-2 semanas):**
   - Monitorar logs diariamente
   - Corrigir bugs que surgirem
   - Adicionar Sentry para error tracking
   - Configurar alertas de uptime

2. **Médio prazo (1-2 meses):**
   - Analisar performance (Analytics)
   - Otimizar queries lentas
   - Adicionar testes E2E (Playwright)
   - Configurar CI/CD (GitHub Actions)

3. **Longo prazo (3-6 meses):**
   - Considerar upgrade Vercel Pro (se necessário)
   - Implementar cache strategies avançadas
   - Separar em monorepo (se crescer muito)
   - Adicionar monitoring avançado (Datadog, NewRelic)

---

## 📞 SUPORTE

### Documentação Oficial

- **Vercel:** https://vercel.com/docs
- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Cloudinary:** https://cloudinary.com/documentation

### Comunidades

- **Vercel Discord:** https://vercel.com/discord
- **Next.js Discussions:** https://github.com/vercel/next.js/discussions
- **Supabase Discord:** https://discord.supabase.com

### Troubleshooting Avançado

Se nada funcionar:

1. **Verificar Vercel Status:** https://vercel-status.com
2. **Ver logs detalhados:** `npx vercel logs --follow`
3. **Criar issue no GitHub:** (seu repo)
4. **Suporte Vercel:** https://vercel.com/support
5. **Revert deploy:** Vercel Dashboard → Deployments → ⋯ → Promote to Production (deploy anterior)

---

**Criado por:** Orion (AIOS Master)
**Data:** 2026-02-26
**Versão:** 1.0

**Boa sorte com o deploy! 🚀**
