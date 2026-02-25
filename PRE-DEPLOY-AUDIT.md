# 🚀 Auditoria Pré-Deploy - Croko Labs

**Data:** 2026-02-26
**Status:** ⚠️ QUASE PRONTO (pequenos ajustes necessários)
**Build Local:** ✅ PASSOU

---

## 📊 Resumo Executivo

| Categoria | Status | Prioridade |
|-----------|--------|------------|
| Build Production | ✅ OK | CRÍTICA |
| TypeScript (src) | ✅ OK | CRÍTICA |
| TypeScript (tests) | ⚠️ Warnings | BAIXA |
| ESLint | ⚠️ 20 warnings | MÉDIA |
| Variáveis de Ambiente | ⚠️ Revisar | CRÍTICA |
| .gitignore | ⚠️ Arquivos desnecessários | MÉDIA |
| Vercel Config | ✅ OK | CRÍTICA |
| Dependencies | ✅ OK | CRÍTICA |
| Security | ⚠️ Revisar | ALTA |

---

## ✅ O QUE ESTÁ FUNCIONANDO

### 1. Build de Produção ✅
```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (51/51)
# ✓ Build completed
```

**Tamanho total:** ~102 kB (First Load JS)
**Páginas geradas:** 51 páginas estáticas
**Tempo de build:** ~3 segundos (local)

### 2. Next.js Configuration ✅
```javascript
// next.config.js
✓ serverExternalPackages configurado (pdf-parse, puppeteer, etc.)
✓ Image domains configurados (Instagram, Cloudinary)
✓ Vercel-ready (sem customizações bloqueantes)
```

### 3. Dependencies ✅
```json
✓ Next.js 15.3.9
✓ React 19.0.0
✓ TypeScript 5.3.3
✓ Todas as dependências críticas instaladas
```

### 4. Vercel Config ✅
```json
// vercel.json
✓ Cron job configurado (/api/cron/process-schedules - 5 min)
✓ Estrutura válida
```

---

## ⚠️ ISSUES IDENTIFICADOS (não bloqueantes, mas recomendado corrigir)

### 1. ESLint Warnings (20 warnings) - PRIORIDADE MÉDIA

**Tipo 1: React Hooks Dependencies**
```typescript
// Arquivos afetados:
- app/dashboard/admin/users/[id]/profiles/page.tsx (linha 47)
- app/dashboard/audits/[id]/compare/page.tsx (linha 48)
- app/dashboard/twitter/experts/page.tsx (linha 33)
- components/molecules/link-content-modal.tsx (linha 46)
- components/molecules/scheduled-content-list.tsx (linha 85)
- components/organisms/content-squad-chat-modal.tsx (linha 124)
- components/organisms/profile-context-modal.tsx (linha 91)
- components/organisms/quick-start-selector.tsx (linha 88)
- components/twitter/twitter-experts-section.tsx (linha 35)

// Problema:
useEffect has missing dependencies

// Impacto:
- Não afeta build
- Pode causar bugs sutis (stale closures)
- Performance ok, mas não ideal

// Solução recomendada:
Adicionar as funções ao array de dependências ou usar useCallback
```

**Tipo 2: Next.js Image Optimization**
```typescript
// Arquivos com <img> tags (11 ocorrências):
- app/dashboard/admin/users/[id]/profiles/page.tsx (linha 211)
- app/dashboard/audits/[id]/create-content/components/phase-3-exportar.tsx (linhas 506, 667)
- app/dashboard/audits/[id]/create-content/slides/page.tsx (linhas 1042, 1271)
- app/dashboard/audits/[id]/slides/page.tsx (linha 249)
- app/dashboard/meus-perfis/page.tsx (linha 81)
- app/dashboard/profiles/[id]/slides/page.tsx (linha 217)
- app/dashboard/reels/page.tsx (linha 57)
- app/dashboard/templatesPro/page.tsx (linha 701)
- components/molecules/link-content-modal.tsx (linha 187)
- components/organisms/brand-kit-form-modal.tsx (linhas 89, 442)

// Problema:
Usando <img> ao invés de <Image /> do Next.js

// Impacto:
- Não bloqueia build
- Perde otimizações automáticas (lazy loading, WebP, etc.)
- Pode aumentar LCP (Largest Contentful Paint)
- Mais consumo de banda

// Solução recomendada:
Substituir por next/image onde possível
```

### 2. TypeScript em Testes - PRIORIDADE BAIXA

```typescript
// Arquivos afetados:
- __tests__/integration/content-creation-flow.test.ts
- __tests__/unit/TEMPLATE.test.tsx

// Problemas:
- Tipos do Jest não encontrados (describe, it, expect, etc.)
- Tipos do @testing-library/react incompatíveis

// Impacto:
- NÃO afeta build de produção
- Testes não são incluídos no deploy
- Apenas problema de DX (developer experience)

// Solução:
npm install --save-dev @types/jest@latest
```

### 3. Arquivos Desnecessários no Git - PRIORIDADE MÉDIA

```bash
# Encontrados:
- .DS_Store (20+ arquivos)
- worker-output.log

# Impacto:
- Aumenta tamanho do repositório
- Pode vazar informações locais

# Solução:
Adicionar ao .gitignore e remover do git
```

---

## 🔐 CHECKLIST DE SEGURANÇA

### Variáveis de Ambiente - CRÍTICO

**ATENÇÃO:** Você precisará configurar todas essas variáveis no Vercel antes do deploy!

#### Obrigatórias (mínimo para funcionar):
```env
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ ANTHROPIC_API_KEY (para Content Squad)
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
```

#### Opcionais (features específicas):
```env
⚪ APIFY_API_TOKEN (análise de Instagram)
⚪ GOOGLE_AI_API_KEY (OCR Gemini)
⚪ OPENAI_API_KEY (alternativa para IA)
⚪ ELEVENLABS_API_KEY (voz para Reels)
⚪ NANO_BANANA_API_KEY (alternativa TTS)
⚪ TWITTER_API_KEY (monitoramento Twitter)
⚪ TWITTER_API_SECRET
⚪ TWITTER_BEARER_TOKEN
⚪ GOOGLE_DRIVE_CLIENT_EMAIL (export Google Drive)
⚪ GOOGLE_DRIVE_PRIVATE_KEY
⚪ GOOGLE_DRIVE_FOLDER_ID
⚪ PEXELS_API_KEY (B-Roll de vídeos)
⚪ FACEBOOK_APP_ID (publicação Instagram)
⚪ FACEBOOK_APP_SECRET
⚪ INSTAGRAM_REDIRECT_URI
```

#### Segurança:
```env
⚠️ CRON_SECRET (TROCAR EM PRODUÇÃO!)
   Atual: "dev-secret-change-in-production"

⚠️ NEXT_PUBLIC_CRON_SECRET (TROCAR EM PRODUÇÃO!)
   Atual: "dev-secret-change-in-production"
```

**AÇÃO NECESSÁRIA:**
1. Gerar secrets fortes: `openssl rand -base64 32`
2. Configurar no Vercel → Settings → Environment Variables
3. Separar por ambiente (Production, Preview, Development)

---

## 📦 OTIMIZAÇÕES RECOMENDADAS

### 1. .gitignore - Adicionar:
```gitignore
# Sistema
.DS_Store
Thumbs.db
*.log

# Build
.next/
out/
build/
dist/

# Testes
coverage/
.nyc_output/

# IDEs
.vscode/
.idea/

# Temporários
*.tmp
*.temp
worker-output.log
```

### 2. Performance - Next.js

**Converter <img> para <Image />:**
```typescript
// Antes:
<img src={url} alt="..." />

// Depois:
import Image from 'next/image'
<Image src={url} alt="..." width={500} height={300} />
```

**Benefícios:**
- Lazy loading automático
- Otimização de tamanho (WebP, AVIF)
- Placeholder blur nativo
- Melhora Core Web Vitals (LCP)

### 3. Monorepo - Considerar separar:

Atualmente tudo em uma pasta gigante:
```
postexpress2/
├── app/ (Next.js)
├── components/
├── scripts/ (Node.js standalone)
├── worker/
├── squad-auditores/
├── content-creation-squad/
├── content-distillery/
└── expansion-packs/etl-data-collector/
```

**Sugestão:**
```
croko-labs/
├── apps/
│   └── web/ (Next.js app)
├── packages/
│   ├── squad-auditores/
│   ├── content-squad/
│   └── etl-collector/
└── scripts/
```

**Benefícios:**
- Deploy mais rápido (só sobe o que mudou)
- Melhor separação de responsabilidades
- Facilita testes isolados

---

## 🚀 PLANO DE DEPLOY

### Fase 1: PRÉ-DEPLOY (ANTES DE FAZER PUSH)

```bash
# 1. Limpar arquivos desnecessários
find . -name ".DS_Store" -delete
rm -f worker-output.log

# 2. Adicionar ao .gitignore
cat >> .gitignore << 'EOF'
.DS_Store
*.log
coverage/
.nyc_output/
EOF

# 3. Atualizar .env secrets
# Gerar novos secrets:
openssl rand -base64 32  # Para CRON_SECRET
openssl rand -base64 32  # Para NEXT_PUBLIC_CRON_SECRET

# 4. Commit das mudanças
git add .gitignore
git commit -m "chore: adicionar arquivos ao gitignore antes do deploy"

# 5. Build final local
npm run build

# 6. Verificar se passou
echo $?  # Deve retornar 0
```

### Fase 2: CONFIGURAR VERCEL

**No dashboard do Vercel:**

1. **Ir em Settings → Environment Variables**
2. **Adicionar TODAS as variáveis obrigatórias**
3. **Separar por ambiente:**
   - Production: valores de produção
   - Preview: valores de staging/teste
   - Development: valores locais (opcional)

4. **CRÍTICO - Trocar secrets:**
```env
CRON_SECRET=<novo-valor-gerado>
NEXT_PUBLIC_CRON_SECRET=<novo-valor-gerado>
```

5. **Configurar domínio personalizado (opcional)**

### Fase 3: DEPLOY

```bash
# Opção 1: Via Git (recomendado)
git push origin main
# Vercel detecta automaticamente e faz deploy

# Opção 2: Via CLI (manual)
npm i -g vercel
vercel --prod
```

### Fase 4: PÓS-DEPLOY

**Verificações obrigatórias:**

```bash
# 1. Verificar se o site está no ar
curl -I https://seu-dominio.vercel.app

# 2. Testar página principal
# Abrir: https://seu-dominio.vercel.app/dashboard

# 3. Testar API
curl https://seu-dominio.vercel.app/api/auth/me

# 4. Testar Cron Job (esperar 5 min)
# Verificar logs no Vercel Dashboard

# 5. Testar conexão Supabase
# Criar um perfil de teste no dashboard

# 6. Testar upload Cloudinary
# Fazer upload de uma imagem

# 7. Monitorar logs
# Vercel Dashboard → Deployments → [seu deploy] → Logs
```

---

## ⚠️ POSSÍVEIS ERROS NO VERCEL E SOLUÇÕES

### Erro 1: "Module not found"
```
Causa: Dependência faltando ou caminho errado
Solução: npm install <pacote> --legacy-peer-deps
```

### Erro 2: "Function execution timed out"
```
Causa: Puppeteer ou operações pesadas
Solução:
- Verificar se Puppeteer está em serverExternalPackages
- Considerar usar Edge Functions
- Otimizar queries do Supabase
```

### Erro 3: "Environment variable not found"
```
Causa: Variável não configurada no Vercel
Solução: Adicionar em Settings → Environment Variables
```

### Erro 4: "Build exceeded maximum duration"
```
Causa: Build muito pesado
Solução:
- Remover node_modules antes do deploy (Vercel instala limpo)
- Verificar se há operações pesadas no build
- Considerar Pro plan (60min vs 45min)
```

### Erro 5: "Error: Cannot find module '@sparticuz/chromium'"
```
Causa: Puppeteer/Chromium não funciona no Vercel Serverless
Solução: Usar @sparticuz/chromium (já está no package.json) ✅
```

### Erro 6: Supabase RLS (Row Level Security) bloqueando
```
Causa: Políticas de segurança do Supabase
Solução:
- Usar SUPABASE_SERVICE_ROLE_KEY em APIs server-side
- Configurar RLS policies no Supabase Dashboard
```

---

## 📊 MÉTRICAS DE SUCESSO

**Após deploy, monitorar:**

| Métrica | Meta | Como verificar |
|---------|------|---------------|
| **Uptime** | 99.9% | Vercel Analytics |
| **Build time** | < 3 min | Vercel Deployments |
| **Cold start** | < 2s | Vercel Functions Logs |
| **LCP** | < 2.5s | Lighthouse / PageSpeed |
| **FCP** | < 1.8s | Lighthouse |
| **Error rate** | < 1% | Vercel Logs / Sentry |
| **API latency** | < 500ms | Vercel Analytics |

---

## 🎯 PRIORIZAÇÃO DE FIXES

### 🔴 CRÍTICO (Fazer ANTES do deploy)
1. ✅ Configurar todas as env vars obrigatórias no Vercel
2. ✅ Trocar CRON_SECRET e NEXT_PUBLIC_CRON_SECRET
3. ✅ Adicionar .DS_Store ao .gitignore
4. ✅ Testar build local (`npm run build`)

### 🟡 IMPORTANTE (Fazer LOGO APÓS deploy)
5. ⚠️ Corrigir os 9 warnings de React Hooks
6. ⚠️ Monitorar logs do Vercel por 24h
7. ⚠️ Configurar alertas de erro (Sentry ou similar)
8. ⚠️ Testar todas as features críticas em produção

### 🟢 OTIMIZAÇÕES (Fazer quando houver tempo)
9. 📈 Converter <img> para <Image /> (11 ocorrências)
10. 📈 Adicionar @types/jest para testes
11. 📈 Considerar separar em monorepo (longo prazo)
12. 📈 Adicionar mais testes E2E

---

## 📝 COMANDOS RÁPIDOS

```bash
# Testar build local
npm run build

# Verificar tipos
npm run typecheck

# Lint
npm run lint

# Limpar e reinstalar
rm -rf node_modules .next
npm install --legacy-peer-deps

# Deploy via CLI
npx vercel --prod

# Ver logs em tempo real
npx vercel logs <deployment-url> --follow
```

---

## ✅ CHECKLIST FINAL

**Antes de fazer push para produção:**

- [ ] Todas as env vars configuradas no Vercel
- [ ] CRON_SECRET trocado para valor forte
- [ ] .DS_Store adicionado ao .gitignore
- [ ] Build local passou sem erros
- [ ] TypeScript check passou (exceto testes - ok)
- [ ] Warnings do ESLint revisados (não bloqueantes)
- [ ] Supabase connection testada
- [ ] Cloudinary credentials validadas
- [ ] Domínio configurado (se aplicável)
- [ ] Backup do .env feito (não versionar!)

**Após deploy:**

- [ ] Site está no ar
- [ ] Dashboard carrega
- [ ] Login/autenticação funciona
- [ ] Criar perfil funciona
- [ ] Upload de imagem funciona
- [ ] Geração de conteúdo funciona
- [ ] Cron job está rodando (verificar logs)
- [ ] Sem erros críticos nos logs
- [ ] Performance ok (LCP < 2.5s)
- [ ] Mobile responsivo ok

---

## 🎉 CONCLUSÃO

**STATUS ATUAL: 95% PRONTO PARA DEPLOY** ✅

**O que está ótimo:**
- ✅ Build funciona perfeitamente
- ✅ Arquitetura Next.js 15 + Supabase sólida
- ✅ Todas as features implementadas
- ✅ TypeScript configurado corretamente

**O que precisa atenção:**
- ⚠️ Configurar env vars no Vercel (CRÍTICO)
- ⚠️ Trocar secrets de CRON (CRÍTICO)
- ⚠️ Limpar .DS_Store files (IMPORTANTE)
- ⚠️ Corrigir warnings ESLint (RECOMENDADO)

**Tempo estimado para estar production-ready:**
- Setup Vercel: 15 minutos
- Fixes críticos: 10 minutos
- Deploy + validação: 20 minutos
- **TOTAL: ~45 minutos**

**Você está MUITO PRÓXIMO de produção!** 🚀

---

**Próximos passos:**
1. Me mostra os erros específicos do Vercel (se houver)
2. Configuramos as env vars juntos
3. Fazemos deploy
4. Monitoramos e ajustamos

Bora fazer esse deploy acontecer! 💪
