# 📸 Instagram Profile Scraper - Post Express

## 🎯 O Que Este Actor Faz

Este Actor extrai dados **completos** de perfis do Instagram, incluindo:

✅ **Nome completo** (`ownerFullName`)
✅ **Username** (`ownerUsername`)
✅ **ID do usuário** (`ownerId`)
✅ **🆕 FOTO DE PERFIL** (`ownerProfilePicUrl`) - **NOVIDADE!**
✅ Posts com todas as métricas
✅ Comentários com foto de perfil dos comentaristas

---

## 🚀 Como Usar

### Opção 1: Via Apify Console

1. Acesse: https://console.apify.com
2. Crie um novo Actor
3. Configure o Source Type como **GitHub**
4. Selecione o repositório: `CrokoMedia/postexpress2`
5. Defina o path: `apify-actors/instagram-scraper-profile`
6. Clique em **Build** e depois **Run**

### Opção 2: Via Código (JavaScript/Node.js)

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Executar o Actor
const run = await client.actor('SEU_USERNAME/instagram-scraper-profile').call({
  username: 'frankcosta',
  maxPosts: 50,
  includeComments: true,
  commentsLimit: 10,
});

// Obter resultados
const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Extraídos ${items.length} posts!`);
console.log(`Foto de perfil: ${items[0].ownerProfilePicUrl}`);
```

### Opção 3: Via API REST

```bash
curl -X POST https://api.apify.com/v2/acts/SEU_USERNAME~instagram-scraper-profile/runs \
  -H "Authorization: Bearer YOUR_APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "frankcosta",
    "maxPosts": 50,
    "includeComments": true,
    "commentsLimit": 10
  }'
```

---

## 📊 Formato de Saída

Cada post retornado terá a seguinte estrutura:

```json
{
  "id": "3829551766916980620",
  "type": "Sidecar",
  "shortCode": "DUlTQrMDl-M",
  "caption": "Construir uma empresa que vale 1BI ja é dificil..",
  "url": "https://www.instagram.com/p/DUlTQrMDl-M/",
  "likesCount": 389,
  "commentsCount": 12,
  "timestamp": "2026-02-14T...",
  "displayUrl": "https://...",

  "ownerFullName": "Frank Costa | INTELIGÊNCIA ARTIFICIAL PARA NEGÓCIOS",
  "ownerUsername": "frankcosta",
  "ownerId": "44870418",
  "ownerProfilePicUrl": "https://instagram.fgru1-1.fna.fbcdn.net/...",

  "latestComments": [
    {
      "id": "18095530879770739",
      "text": "Excelente visão!",
      "ownerUsername": "vdabian",
      "ownerProfilePicUrl": "https://...",
      "timestamp": "2026-02-14T...",
      "likesCount": 0,
      "owner": {
        "id": "30004408072",
        "username": "vdabian",
        "is_verified": false,
        "profile_pic_url": "https://..."
      }
    }
  ]
}
```

---

## ⚙️ Input Parameters

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `username` | string | ✅ Sim | - | Username do Instagram (sem @) |
| `maxPosts` | integer | ❌ Não | 50 | Máximo de posts a extrair |
| `includeComments` | boolean | ❌ Não | true | Se deve incluir comentários |
| `commentsLimit` | integer | ❌ Não | 10 | Quantos comentários por post |

---

## 🆚 Diferença para Outros Scrapers

### ❌ Scrapers Comuns
```json
{
  "ownerFullName": "Frank Costa",
  "ownerUsername": "frankcosta",
  "ownerId": "44870418"
  // ❌ SEM FOTO DE PERFIL
}
```

### ✅ Este Scraper (Post Express Custom)
```json
{
  "ownerFullName": "Frank Costa | INTELIGÊNCIA ARTIFICIAL...",
  "ownerUsername": "frankcosta",
  "ownerId": "44870418",
  "ownerProfilePicUrl": "https://instagram.fgru1-1.fna.fbcdn.net/..." // ✅ COM FOTO!
}
```

---

## 🔧 Deploy no Apify

### Via GitHub Integration (Recomendado)

1. **Conecte o GitHub ao Apify**:
   - Acesse: https://console.apify.com/account/integrations
   - Clique em "Connect GitHub"
   - Autorize o Apify

2. **Configure o Actor**:
   - Crie novo Actor no Apify Console
   - Source Type: **GitHub**
   - Repository: `CrokoMedia/postexpress2`
   - Path: `apify-actors/instagram-scraper-profile`
   - Branch: `main`

3. **Build e Deploy**:
   - Clique em **Build**
   - Aguarde o build completar
   - Clique em **Run** para testar

### Via CLI (Avançado)

```bash
# Instalar Apify CLI
npm install -g apify-cli

# Fazer login
apify login

# Fazer deploy
cd apify-actors/instagram-scraper-profile
apify push
```

---

## 📝 Notas Importantes

### Limitações do Instagram

⚠️ **O Instagram limita scraping**:
- Use proxies rotativos para evitar bloqueios
- Respeite rate limits (não abuse)
- Considere usar Instagram Graph API para contas Business/Creator

### Alternativas

Se o scraping falhar, considere:
1. **Instagram Graph API** (requer conta Business/Creator)
2. **Apify Actors Oficiais** do Store (mais estáveis)
3. **Playwright/Puppeteer** para scraping via browser

---

## 🐛 Troubleshooting

### "Não encontrou a foto de perfil"

**Solução**: O Instagram mudou o layout. Verifique:
1. Se o perfil é público
2. Se há bloqueio por região
3. Se precisa atualizar o código de parsing

### "429 Too Many Requests"

**Solução**:
1. Use proxies rotativos
2. Adicione delays entre requisições
3. Reduza `maxConcurrency` para 1

### "Dados vazios"

**Solução**:
1. Verifique se o username está correto
2. Teste manualmente: `https://www.instagram.com/{username}/`
3. Verifique logs do Actor no Apify Console

---

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do Actor no Apify Console
2. Documentação oficial do Apify: https://docs.apify.com
3. Issues do repositório: `CrokoMedia/postexpress2`

---

**✨ Versão**: 1.0.0
**🏢 Desenvolvido por**: Post Express Team
**📅 Última atualização**: Fevereiro 2026
