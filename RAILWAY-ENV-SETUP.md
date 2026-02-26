# Configuração de Variáveis de Ambiente no Railway

## ❌ Problema
Erro "Failed to fetch" no login após deploy porque as variáveis `NEXT_PUBLIC_*` não foram configuradas.

## ✅ Solução

### 1. Acesse o painel do Railway
1. Vá para: https://railway.app/
2. Selecione seu projeto
3. Clique na aba **"Variables"**

### 2. Adicione TODAS estas variáveis:

```bash
# ===== SUPABASE (obrigatório) =====
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# ===== APIs (obrigatório para features funcionarem) =====
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
APIFY_API_TOKEN=apify_api_...

# ===== Cloudinary (obrigatório para imagens) =====
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret

# ===== WhatsApp UAZapi (opcional, mas recomendado) =====
UAZAPI_INSTANCE_ID=seu-instance-id
UAZAPI_TOKEN=seu-token
UAZAPI_WEBHOOK_URL=https://seu-app.railway.app/api/whatsapp/webhook

# ===== Google Drive (opcional) =====
GOOGLE_DRIVE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1abc...

# ===== Node.js =====
NODE_ENV=production
```

### 3. **CRÍTICO**: Obter valores do Supabase

No painel do Supabase (https://supabase.com/dashboard):

1. **Project Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_ANON_KEY`
   - **service_role key** (CUIDADO: segredo!) → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Redeployar

Após adicionar as variáveis:

```bash
# No Railway, clique em "Deploy" → "Redeploy"
# OU force um novo commit
git commit --allow-empty -m "chore: trigger redeploy com env vars"
git push
```

## ⚠️ Importante

1. **NEXT_PUBLIC_* são públicas** - Vão para o código do cliente (browser)
2. **Variáveis sem NEXT_PUBLIC_* são privadas** - Só no servidor
3. **Next.js precisa das NEXT_PUBLIC_* em build time** - Se não tiver, fica `undefined` no browser
4. **Railway substitui automaticamente** - Não precisa de `.env.production` com valores hardcoded

## 🔍 Como verificar se funcionou

Após redeploy, abra o DevTools do browser (F12):

```javascript
// Console → deve mostrar a URL do Supabase, NÃO undefined
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## 🐛 Troubleshooting

### Erro persiste após adicionar variáveis?

1. **Limpe o cache de build do Railway**:
   - Settings → "Clear Build Cache" → "Redeploy"

2. **Verifique logs do Railway**:
   - Aba "Deployments" → Clique no último deploy → "View Logs"
   - Procure por erros de build ou variáveis undefined

3. **Teste localmente primeiro**:
   ```bash
   # Crie .env.local com os valores reais
   npm run build
   npm start
   # Abra http://localhost:3000/login e teste
   ```

### CORS errors?

Se vir erros de CORS no console:

1. No Supabase: **Authentication** → **URL Configuration**
2. Adicione seu domínio do Railway: `https://seu-app.railway.app`
3. Salve e aguarde 1-2 minutos

## 📚 Referências

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/guides/variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
