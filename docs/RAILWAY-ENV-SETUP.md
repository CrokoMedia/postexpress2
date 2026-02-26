# Como Configurar Variáveis de Ambiente no Railway

## 📋 Passo a Passo Completo

### 1. Acessar o Railway Dashboard

1. Acesse: https://railway.app/dashboard
2. Faça login
3. Selecione o projeto **postexpress2** (ou como você nomeou)

---

### 2. Abrir Configuração de Variáveis

**Caminho:** `Projeto > Settings > Variables`

Ou clique diretamente em **"Variables"** no menu lateral esquerdo.

---

### 3. Obter as Credenciais do Supabase

#### 3.1 Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** (⚙️) > **API**

#### 3.2 Copiar as Variáveis

Você verá 3 seções importantes:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
👆 Esta é sua `SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_URL`

**Project API keys:**

- **anon / public** (chave pública):
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
  ```
  👆 Esta é sua `SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **service_role** (chave secreta - clique em "Reveal" para ver):
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
  ```
  👆 Esta é sua `SUPABASE_SERVICE_ROLE_KEY`

  ⚠️ **NUNCA compartilhe esta chave ou commite no Git!**

---

### 4. Adicionar Variáveis no Railway

De volta ao Railway, clique em **"+ New Variable"** e adicione **CADA UMA** das seguintes:

#### Variável 1:
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://xxxxxxxxxxxxx.supabase.co` (sua Project URL)

#### Variável 2:
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1Ni...` (sua anon/public key)

#### Variável 3:
- **Key:** `SUPABASE_URL`
- **Value:** `https://xxxxxxxxxxxxx.supabase.co` (mesma URL da variável 1)

#### Variável 4:
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1Ni...` (mesma key da variável 2)

#### Variável 5:
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1Ni...` (service_role key - a secreta)

---

### 5. Adicionar Outras Variáveis Importantes

Enquanto está configurando, adicione também:

#### Variável 6:
- **Key:** `NODE_ENV`
- **Value:** `production`

#### Variável 7 (se usar Cloudinary):
- **Key:** `CLOUDINARY_CLOUD_NAME`
- **Value:** (seu cloud name do Cloudinary)

#### Variável 8:
- **Key:** `CLOUDINARY_API_KEY`
- **Value:** (sua API key do Cloudinary)

#### Variável 9:
- **Key:** `CLOUDINARY_API_SECRET`
- **Value:** (seu API secret do Cloudinary)

#### Variável 10 (se usar Anthropic):
- **Key:** `ANTHROPIC_API_KEY`
- **Value:** (sua chave da Anthropic)

#### Variável 11 (se usar UAZapi - WhatsApp):
- **Key:** `UAZAPI_INSTANCE_ID`
- **Value:** (seu instance ID)

#### Variável 12:
- **Key:** `UAZAPI_TOKEN`
- **Value:** (seu token UAZapi)

---

### 6. Salvar e Fazer Redeploy

Depois de adicionar TODAS as variáveis:

1. **Não precisa clicar em "Save"** - Railway salva automaticamente
2. Vá em **Deployments** (menu lateral)
3. Clique nos **3 pontos (⋮)** do último deployment
4. Clique em **"Redeploy"**

Ou force um novo deploy via Git:

```bash
git commit --allow-empty -m "chore: trigger redeploy with env vars"
git push
```

---

### 7. Verificar se Funcionou

Aguarde o build completar (5-10 minutos) e então:

#### Opção 1 - Via Browser:
Acesse: `https://seu-projeto.up.railway.app/api/health`

Você deve ver:
```json
{
  "status": "ok",
  "supabase": "connected"
}
```

#### Opção 2 - Via Logs:
```bash
railway logs
```

**Procure por:**
- ✅ Nenhum erro de "Missing SUPABASE_URL"
- ✅ Aplicação iniciou normalmente
- ❌ Se ver `https://placeholder.supabase.co/` → variáveis não foram aplicadas

---

## 📸 Referência Visual

### Como deve ficar no Railway:

```
Variables (5 configuradas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_SUPABASE_URL        https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   eyJhbGciOiJI... (hidden)
SUPABASE_URL                    https://abc123.supabase.co
SUPABASE_ANON_KEY               eyJhbGciOiJI... (hidden)
SUPABASE_SERVICE_ROLE_KEY       eyJhbGciOiJI... (hidden)
NODE_ENV                        production
```

---

## ⚠️ Problemas Comuns

### "Não encontro a seção Variables"
- Certifique-se de estar no projeto correto
- Tente: `Projeto > Settings (⚙️) > Variables`

### "Adicionei mas ainda dá erro"
- Certifique-se de fazer **Redeploy** (não apenas Restart)
- Verifique se não há espaços em branco no começo/fim dos valores

### "Service Role Key não aparece"
- Clique em **"Reveal"** ao lado de "service_role" no Supabase
- Copie o valor completo

### "Railway não está fazendo deploy"
- Verifique se o repositório está conectado
- Vá em: Settings > Deployment > Connect Repository

---

## 🔒 Segurança

✅ **PODE expor (são públicas):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **NUNCA expor (são secretas):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_API_SECRET`
- `ANTHROPIC_API_KEY`
- `UAZAPI_TOKEN`

**Regra:** Qualquer variável com `NEXT_PUBLIC_` vai pro código do browser (JavaScript).
Variáveis **sem** `NEXT_PUBLIC_` ficam apenas no servidor.

---

## ✅ Checklist Final

Antes de considerar pronto:

- [ ] Todas as 5 variáveis do Supabase configuradas
- [ ] Valores copiados **SEM espaços em branco**
- [ ] Redeploy feito (não apenas restart)
- [ ] Aguardado build completo (5-10 min)
- [ ] Testado endpoint: `/api/health`
- [ ] Logs sem erros de "Missing"

---

*Última atualização: 2026-02-27*
*Dúvidas? Consulte: `docs/RAILWAY-TROUBLESHOOTING.md`*
