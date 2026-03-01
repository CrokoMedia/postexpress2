# ✅ Deploy Render.com - Checklist Rápido

> Checklist de validação para deploy completo do Post Express

---

## 📋 Pré-Deploy

- [ ] **Repositório preparado**
  - [ ] Commit de todas as mudanças
  - [ ] Push para branch `main`
  - [ ] `render.yaml` na raiz do projeto
  - [ ] `Dockerfile` configurado
  - [ ] Health check endpoint em `/app/api/health/route.ts`

---

## 🔧 Configuração Render.com

- [ ] **Conta criada** em [Render.com](https://render.com)
- [ ] **Repositório conectado** ao Render
- [ ] **Web Service criado**:
  - [ ] Name: `postexpress-app`
  - [ ] Runtime: Docker
  - [ ] Dockerfile Path: `./Dockerfile`
  - [ ] Region: Oregon (ou sua preferência)
  - [ ] Branch: `main`

---

## 🔑 Variáveis de Ambiente (CRÍTICO)

### Supabase (5 variáveis - OBRIGATÓRIO)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Cloudinary (3 variáveis - OBRIGATÓRIO)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### UAZapi - WhatsApp (3 variáveis - OBRIGATÓRIO)
- [ ] `UAZAPI_INSTANCE_ID`
- [ ] `UAZAPI_TOKEN`
- [ ] `UAZAPI_WEBHOOK_URL` (configurar DEPOIS do deploy)

### IA APIs (3 variáveis - OBRIGATÓRIO)
- [ ] `ANTHROPIC_API_KEY`
- [ ] `GOOGLE_AI_API_KEY`
- [ ] `MISTRAL_API_KEY`

### Apify (1 variável - OBRIGATÓRIO)
- [ ] `APIFY_API_TOKEN`

### Google Drive Export (3 variáveis - OPCIONAL)
- [ ] `GOOGLE_DRIVE_CLIENT_EMAIL`
- [ ] `GOOGLE_DRIVE_PRIVATE_KEY`
- [ ] `GOOGLE_DRIVE_FOLDER_ID`

### Node.js & Puppeteer (auto-configuradas)
- [x] `NODE_ENV=production`
- [x] `PORT=3000`
- [x] `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`

---

## 🚀 Deploy

- [ ] **Iniciar deploy** no Render.com
- [ ] **Aguardar build** (10-15 min na primeira vez)
- [ ] **Verificar logs** durante o build
- [ ] **Aguardar status "Live"**

---

## ✅ Validação Pós-Deploy

### 1. Health Check
```bash
curl https://postexpress-app.onrender.com/api/health
```
- [ ] Status: `200 OK`
- [ ] `status: "ok"`
- [ ] `checks.supabase: "ok"`
- [ ] `checks.cloudinary: "ok"`
- [ ] `checks.puppeteer: "ok"`

### 2. Supabase Connection
```bash
curl https://postexpress-app.onrender.com/api/profiles
```
- [ ] Retorna lista de perfis ou `[]`
- [ ] Sem erro de conexão

### 3. WhatsApp Webhook
- [ ] Atualizar `UAZAPI_WEBHOOK_URL` no Render com URL final
- [ ] Configurar webhook no UAZapi Dashboard
- [ ] Enviar mensagem de teste
- [ ] Verificar recebimento no Render Logs

### 4. Renderização de Slides
```bash
curl -X POST https://postexpress-app.onrender.com/api/content/1/preview-carousel \
  -H "Content-Type: application/json" \
  -d '{"slideIndex": 0}'
```
- [ ] Retorna imagem PNG (base64)
- [ ] Sem erro de Chromium

### 5. Cloudinary Upload
- [ ] Testar upload de imagem
- [ ] Verificar se imagem aparece no Cloudinary Dashboard

---

## 🔍 Monitoramento

- [ ] **Metrics habilitado** no Render Dashboard
- [ ] **Logs em tempo real** funcionando
- [ ] **Alertas configurados**:
  - [ ] Health check failures
  - [ ] High memory usage (> 80%)
  - [ ] High CPU usage (> 80%)

---

## 🔒 Segurança

- [ ] **HTTPS ativo** (Render fornece automaticamente)
- [ ] **Service role key** NUNCA exposta no client
- [ ] **`.env` local** NÃO commitado no git
- [ ] **Secrets** configuradas apenas no Render Dashboard

---

## 📊 Performance

- [ ] **Plano adequado** (recomendado: Standard 2GB RAM)
- [ ] **Response time** < 2s no health check
- [ ] **Build time** < 15 min
- [ ] **Memory usage** < 70% em operação normal

---

## 🎯 Funcionalidades Testadas

- [ ] **Dashboard** carrega corretamente
- [ ] **Auditoria de perfil** funciona
- [ ] **Geração de conteúdo** via WhatsApp funciona
- [ ] **Aprovação de conteúdo** via WhatsApp funciona
- [ ] **Geração de slides** (Puppeteer) funciona
- [ ] **Upload Cloudinary** funciona
- [ ] **Export ZIP** funciona
- [ ] **Export Google Drive** funciona (se configurado)

---

## 📝 Documentação

- [ ] **URL de produção** documentada
- [ ] **Credenciais** salvas em local seguro (1Password, etc.)
- [ ] **Webhook URLs** atualizadas em todos os serviços
- [ ] **Team notificado** sobre novo deploy

---

## ⚠️ Troubleshooting Comum

Se algo falhar, consulte `DEPLOY-RENDER.md` seção "Troubleshooting".

**Problemas mais comuns:**
1. ❌ Chromium not found → Verificar env vars do Puppeteer
2. ❌ Supabase connection failed → Verificar 5 variáveis do Supabase
3. ❌ Build out of memory → Atualizar plano para 2GB RAM
4. ❌ Webhook não recebe → Verificar configuração no UAZapi

---

## 🎉 Deploy Concluído!

- [ ] **Todas as validações** passaram
- [ ] **Sistema operacional** em produção
- [ ] **Monitoramento** ativo
- [ ] **Equipe notificada**

---

**Data de deploy:** __________

**URL de produção:** https://postexpress-app.onrender.com

**Responsável:** __________

**Status:** 🟢 Operacional | 🟡 Parcial | 🔴 Falha

---

*Croko Labs - Motor de Conteúdo Autônomo™*
