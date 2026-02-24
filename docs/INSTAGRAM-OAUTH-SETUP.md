# 🔐 Setup Instagram OAuth - Publicação Automática

Este guia mostra como configurar o Facebook App para permitir publicação automática no Instagram via Graph API.

---

## 📋 Pré-requisitos

1. **Instagram Business ou Creator Account**
   - Não funciona com conta pessoal
   - A conta deve estar vinculada a uma Facebook Page

2. **Facebook Page**
   - Criar em: https://www.facebook.com/pages/create

3. **Vincular Instagram à Page**
   - Page Settings → Instagram → Connect Account

---

## 🚀 Passo 1: Criar Facebook App

1. Acesse: https://developers.facebook.com/apps/

2. Clique em **"Create App"**

3. Selecione **"Business"** como tipo de app

4. Preencha:
   - **App Name:** Croko Labs (ou o nome que preferir)
   - **App Contact Email:** seu@email.com
   - **Business Account:** Criar novo ou selecionar existente

5. Clique em **"Create App"**

---

## 🔧 Passo 2: Configurar Produtos

### 2.1 Adicionar Instagram Basic Display

1. No dashboard do app, vá em **"Add Product"**

2. Encontre **"Instagram Basic Display"** e clique em **"Set Up"**

3. Clique em **"Create New App"** (vai criar automaticamente)

### 2.2 Adicionar Facebook Login

1. Volte para **"Add Product"**

2. Encontre **"Facebook Login"** e clique em **"Set Up"**

3. Em **Settings → Basic**, anote:
   - **App ID** (vai usar no `.env`)
   - **App Secret** (vai usar no `.env`)

---

## 🌐 Passo 3: Configurar OAuth Redirect URIs

1. Vá em **Facebook Login → Settings**

2. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```

   **Produção (depois):**
   ```
   https://seudominio.com/api/auth/instagram/callback
   ```

3. Clique em **"Save Changes"**

---

## 🔑 Passo 4: Configurar Permissões

1. Vá em **App Review → Permissions and Features**

2. Solicite as seguintes permissões (clique em **"Request Advanced Access"**):
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`
   - ✅ `pages_read_engagement`
   - ✅ `pages_show_list`

3. **Importante:** Para desenvolvimento, você já pode usar essas permissões com sua própria conta. Para publicar o app e permitir outros usuários, você precisará enviar para Review do Facebook.

---

## ⚙️ Passo 5: Configurar Variáveis de Ambiente

1. Copie o `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis:
   ```env
   # Instagram Graph API (publicação automática)
   FACEBOOK_APP_ID=123456789012345
   FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
   INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
   ```

3. **Produção:** Altere `INSTAGRAM_REDIRECT_URI` para o domínio real:
   ```env
   INSTAGRAM_REDIRECT_URI=https://seudominio.com/api/auth/instagram/callback
   ```

---

## 💾 Passo 6: Rodar a Migration SQL

Execute a migration no **SQL Editor do Supabase**:

```bash
# Abra o arquivo:
database/migrations/001-add-instagram-oauth.sql

# Cole no SQL Editor do Supabase e execute
```

Isso vai:
- Adicionar campos de OAuth na tabela `profiles`
- Criar tabela `instagram_publications` para rastrear posts publicados

---

## 🧪 Passo 7: Testar OAuth Flow

1. Inicie o servidor Next.js:
   ```bash
   npm run dev
   ```

2. Acesse um perfil no dashboard:
   ```
   http://localhost:3000/dashboard/profiles/{profile-id}
   ```

3. Clique no botão **"Conectar Instagram"**

4. Você será redirecionado para o Facebook

5. Faça login e autorize as permissões

6. Você voltará para a página do perfil com a mensagem:
   ```
   ✅ Instagram conectado com sucesso!
   ```

7. Agora você pode publicar carrosséis diretamente!

---

## 📱 Passo 8: Publicar um Carrossel

1. Vá para **"Criar Conteúdo"** de uma auditoria

2. Aprove um carrossel

3. Gere os slides visuais (V1 ou V2)

4. Clique em **"Publicar Agora"** ou **"Agendar"**

5. O carrossel será publicado automaticamente no Instagram!

---

## 🔒 Segurança

### Token de Acesso

- **Validade:** 60 dias
- **Renovação:** O sistema avisa quando o token está próximo de expirar (7 dias)
- **Armazenamento:** Salvo no Supabase (campo `instagram_access_token`)

### RLS (Row Level Security)

Os campos de OAuth são protegidos por RLS:
- ✅ Leitura: permitida para o usuário autenticado
- ✅ Escrita: apenas via `service_role` (APIs do backend)

---

## ⚠️ Limitações da API

| Limitação | Valor |
|-----------|-------|
| **Posts por dia** | 25 (1 carrossel = 1 post) |
| **Slides por carrossel** | Mín 2, Máx 10 |
| **Formato de imagem** | JPG/PNG, máx 8MB |
| **Agendamento mínimo** | 10 minutos no futuro |
| **Tipo de conta** | Business ou Creator (não funciona com conta pessoal) |

---

## 🐛 Troubleshooting

### "Instagram not connected"
- ✅ Verifique se a conta é Business/Creator
- ✅ Verifique se está vinculada a uma Facebook Page
- ✅ Refaça o OAuth flow

### "Instagram token expired"
- ✅ Clique em "Reconectar Instagram" na página do perfil
- ✅ O token tem validade de 60 dias

### "Carousel must have between 2 and 10 slides"
- ✅ Gere os slides visuais antes de publicar
- ✅ Certifique-se de que o carrossel tem 2-10 slides

### "Scheduled time must be at least 10 minutes in the future"
- ✅ Agende para pelo menos 10 minutos no futuro
- ✅ Ou use "Publicar Agora" para postar imediatamente

### "No Facebook Pages found"
- ✅ Crie uma Facebook Page em: https://www.facebook.com/pages/create
- ✅ Vincule sua conta Instagram à Page

---

## 📚 Referências

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Carousel Posts](https://developers.facebook.com/docs/instagram-api/reference/ig-user/media#creating-carousel-posts)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)

---

## 🎯 Próximos Passos (Fase 2 e 3)

### Fase 2: Agendamento Avançado
- [ ] Listar posts agendados
- [ ] Cancelar agendamentos
- [ ] Editar caption de posts agendados

### Fase 3: Analytics
- [ ] Rastrear performance de posts publicados
- [ ] Comparar carrosséis gerados vs publicados
- [ ] Dashboard de publicações (quantos posts, engajamento, etc.)

---

**Pronto!** 🎉 Agora você pode publicar carrosséis direto do Croko Labs para o Instagram!
