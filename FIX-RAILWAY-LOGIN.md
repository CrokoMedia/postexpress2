# 🚨 FIX: "Failed to fetch" no Railway

## ❌ Problema
Erro `Failed to fetch` ao fazer login após deploy no Railway.

## 🔍 Causa Raiz
Variáveis de ambiente `NEXT_PUBLIC_*` não configuradas no Railway. Next.js embute essas variáveis no código do cliente durante o build, e se não existirem, o valor fica `undefined` no browser.

## ✅ Solução (3 passos)

### 1️⃣ Obter credenciais do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://abcxyz.supabase.co`)
   - **anon public** key (ex: `eyJhbGc...`)
   - **service_role** key (ex: `eyJhbGc...`) ⚠️ SECRETO!

### 2️⃣ Adicionar variáveis no Railway

1. Acesse: https://railway.app/
2. Selecione seu projeto
3. Clique em **"Variables"**
4. Adicione (copie e cole os valores do Supabase):

```bash
# SUPABASE - Cliente (público)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# SUPABASE - Servidor (privado)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# NODE_ENV
NODE_ENV=production
```

### 3️⃣ Redeployar

No Railway:
1. Clique em **"Deploy"** → **"Redeploy"**
2. Aguarde o build terminar (~3-5 min)
3. Teste o login novamente

## 🧪 Verificar se funcionou

Após redeploy, abra o DevTools (F12) no browser:

```javascript
// Console do browser - deve mostrar a URL, NÃO undefined
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
// Deve aparecer: https://seu-projeto.supabase.co
```

## 📝 Variáveis adicionais (opcional, mas recomendado)

Para todas as features funcionarem, adicione também:

```bash
# APIs de IA
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...

# Scraping
APIFY_API_TOKEN=apify_api_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret

# WhatsApp (opcional)
UAZAPI_INSTANCE_ID=seu-instance-id
UAZAPI_TOKEN=seu-token
UAZAPI_WEBHOOK_URL=https://seu-app.railway.app/api/whatsapp/webhook
```

## 🐛 Ainda não funciona?

### Limpar cache de build:

1. Railway → **Settings** → **Clear Build Cache**
2. **Redeploy**

### Verificar logs:

1. Railway → **Deployments** → clique no último deploy
2. **View Logs** → procure por erros

### Testar localmente primeiro:

```bash
# 1. Criar .env.local com valores reais
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 2. Verificar variáveis
npm run check-env

# 3. Build local
npm run build
npm start

# 4. Testar login
# Abrir http://localhost:3000/login
```

### CORS errors?

Se aparecer erro de CORS no console:

1. Supabase → **Authentication** → **URL Configuration**
2. Adicionar: `https://seu-app.railway.app`
3. Salvar e aguardar 1-2 minutos

## 📚 Documentação completa

Veja `RAILWAY-ENV-SETUP.md` para lista completa de variáveis.

## ✅ Checklist de deploy

- [ ] Variáveis `NEXT_PUBLIC_*` adicionadas no Railway
- [ ] Variáveis `SUPABASE_*` adicionadas no Railway
- [ ] Redeploy realizado
- [ ] Login testado no browser
- [ ] DevTools mostra URL correta (não undefined)
- [ ] Sem erros de CORS no console
- [ ] Domínio Railway adicionado no Supabase
