# 🔗 Integração Apify + GitHub

## 📖 Visão Geral

O Apify suporta integração com GitHub para versionamento e deploy automático de Actors.

## 🚀 Como Configurar

### 1. Conectar GitHub ao Apify

1. Acesse: https://console.apify.com/account/integrations
2. Clique em **"Connect GitHub"**
3. Autorize o Apify a acessar seus repositórios
4. Selecione o repositório: `CrokoMedia/postexpress2`

### 2. Estrutura de Actors no Repositório

Crie diretórios para cada Actor:

```
apify-actors/
├── instagram-scraper/
│   ├── main.js
│   ├── INPUT_SCHEMA.json
│   └── .actor/
│       └── actor.json
├── tiktok-scraper/
│   ├── main.js
│   ├── INPUT_SCHEMA.json
│   └── .actor/
│       └── actor.json
└── youtube-scraper/
    ├── main.js
    ├── INPUT_SCHEMA.json
    └── .actor/
        └── actor.json
```

### 3. Arquivo actor.json

Exemplo para cada Actor:

```json
{
  "actorSpecification": 1,
  "name": "instagram-scraper",
  "title": "Instagram Scraper - Post Express",
  "description": "Scraper de Instagram para o Post Express",
  "version": "1.0",
  "storages": {
    "dataset": {
      "actorSpecification": 1,
      "views": {
        "overview": {
          "title": "Overview",
          "transformation": {
            "fields": ["username", "followers", "posts"]
          }
        }
      }
    }
  }
}
```

### 4. Deploy Automático

**Opção A: Via Apify Console**
1. No Apify Console, vá em **Actor → Settings → Source**
2. Selecione **"GitHub"**
3. Escolha o repositório e branch
4. Configure o path do Actor (ex: `apify-actors/instagram-scraper`)

**Opção B: Via GitHub Actions**

```yaml
name: Deploy to Apify

on:
  push:
    branches: [main]
    paths:
      - 'apify-actors/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Apify
        uses: apify/actions-deploy@v1
        with:
          apify-token: ${{ secrets.APIFY_API_TOKEN }}
          actor-path: ./apify-actors/instagram-scraper
```

### 5. Usar Actors Públicos do Apify Store

Para usar Actors já existentes no Apify Store:

```javascript
// No código do Post Express
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Executar Actor do Store
const run = await client.actor('apify/instagram-scraper').call({
  username: 'cliente_exemplo',
  resultsLimit: 100,
});

// Obter resultados
const { items } = await client.dataset(run.defaultDatasetId).listItems();
```

## 📊 Actors Recomendados do Apify Store

### Instagram
- `apify/instagram-scraper` - Scraper completo de perfis
- `apify/instagram-post-scraper` - Posts específicos
- `apify/instagram-hashtag-scraper` - Posts por hashtag

### TikTok
- `apify/tiktok-scraper` - Perfis e vídeos
- `apify/tiktok-hashtag-scraper` - Busca por hashtag

### YouTube
- `apify/youtube-scraper` - Vídeos e canais
- `apify/youtube-channel-scraper` - Análise de canais

## 🔐 Secrets no GitHub

Configure em: **Settings → Secrets and variables → Actions**

```
APIFY_API_TOKEN = apify_api_DQldil0xAhBSMVz46VSAVk3cinxQjo4DTOMv
```

## 🎯 Próximos Passos

1. ✅ Criar diretório `apify-actors/`
2. ✅ Desenvolver custom Actors (se necessário)
3. ✅ Configurar deploy automático
4. ✅ Testar integração localmente
5. ✅ Monitorar execuções no Apify Console

## 📚 Documentação Oficial

- [Apify GitHub Integration](https://docs.apify.com/platform/integrations/github)
- [Actor Development](https://docs.apify.com/platform/actors)
- [Apify Client JS](https://docs.apify.com/api/client/js)

---

**Status**: ✅ API configurada | ⏳ Integração GitHub pendente
