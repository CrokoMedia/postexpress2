# 🚀 Guia Rápido de Implementação

## ✅ Checklist de Deploy

### 1️⃣ Preparar Repositório GitHub

- [x] Arquivos criados em `apify-actors/instagram-scraper-profile/`
- [ ] Fazer commit das alterações
- [ ] Fazer push para o GitHub

```bash
cd /Users/macbook-karla/postexpress2
git add apify-actors/
git commit -m "feat: adicionar Actor customizado de Instagram com foto de perfil"
git push origin main
```

---

### 2️⃣ Configurar no Apify Console

#### Passo a Passo Detalhado:

1. **Acesse o Apify Console**:
   - URL: https://console.apify.com/actors

2. **Clique em "Create new Actor"**

3. **Configure o Source**:
   - **Source Type**: `Git repository`
   - **Git URL**: `https://github.com/CrokoMedia/postexpress2.git`
   - **Branch**: `main`
   - **Directory**: `apify-actors/instagram-scraper-profile`

4. **Configurações Adicionais**:
   - **Name**: `instagram-scraper-profile`
   - **Title**: `Instagram Scraper - Post Express (Com Foto de Perfil)`
   - **Description**: `Extrai dados completos de perfis do Instagram, incluindo foto de perfil do dono`

5. **Build Settings**:
   - **Base Docker image**: `apify/actor-node:18`
   - **Build tag**: `latest`

6. **Clique em "Save" e depois em "Build"**

7. **Aguarde o Build Completar** (2-5 minutos)

8. **Teste o Actor**:
   - Clique em "Console" (aba superior)
   - Configure o Input:
     ```json
     {
       "username": "frankcosta",
       "maxPosts": 10,
       "includeComments": true,
       "commentsLimit": 5
     }
     ```
   - Clique em "Start"
   - Aguarde a execução terminar
   - Verifique os resultados em "Dataset"

---

### 3️⃣ Usar o Actor

#### Opção A: Via Apify Console (Manual)

1. Acesse seu Actor criado
2. Clique em "Console"
3. Preencha o Input
4. Clique em "Start"
5. Baixe os resultados em JSON ou CSV

#### Opção B: Via API (Automatizado)

Crie o arquivo `test-instagram-scraper.js`:

```javascript
import { ApifyClient } from 'apify-client';
import fs from 'fs';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function scrapearInstagram(username) {
  console.log(`🚀 Iniciando scraping de @${username}...`);

  // Executar o Actor
  const run = await client.actor('SEU_USERNAME/instagram-scraper-profile').call({
    username,
    maxPosts: 50,
    includeComments: true,
    commentsLimit: 10,
  });

  console.log(`⏳ Actor executando... ID: ${run.id}`);

  // Aguardar conclusão
  const finishedRun = await client.run(run.id).waitForFinish();

  console.log(`✅ Status: ${finishedRun.status}`);

  // Obter resultados
  const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();

  console.log(`📊 Extraídos ${items.length} posts!`);

  // Verificar foto de perfil
  if (items.length > 0 && items[0].ownerProfilePicUrl) {
    console.log(`📸 Foto de perfil encontrada: ${items[0].ownerProfilePicUrl}`);
  } else {
    console.log(`❌ Foto de perfil NÃO encontrada`);
  }

  // Salvar em arquivo
  const outputFile = `squad-auditores/data/${username}-instagram-data.json`;
  fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));

  console.log(`💾 Dados salvos em: ${outputFile}`);

  return items;
}

// Executar
scrapearInstagram('frankcosta');
```

Execute:

```bash
npm install apify-client
node test-instagram-scraper.js
```

---

### 4️⃣ Integrar ao Post Express

Crie `scripts/scrape-instagram.js`:

```javascript
import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function scrapeInstagramProfile(username, options = {}) {
  const {
    maxPosts = 50,
    includeComments = true,
    commentsLimit = 10,
    saveToFile = true,
  } = options;

  try {
    console.log(`🚀 Scraping Instagram: @${username}`);

    // Executar Actor customizado
    const run = await client
      .actor('SEU_USERNAME/instagram-scraper-profile')
      .call({
        username,
        maxPosts,
        includeComments,
        commentsLimit,
      });

    // Aguardar conclusão
    const finishedRun = await client.run(run.id).waitForFinish();

    if (finishedRun.status !== 'SUCCEEDED') {
      throw new Error(`Actor falhou com status: ${finishedRun.status}`);
    }

    // Obter resultados
    const { items } = await client
      .dataset(finishedRun.defaultDatasetId)
      .listItems();

    console.log(`✅ Extraídos ${items.length} posts`);

    // Validar foto de perfil
    const hasProfilePic = items.length > 0 && items[0].ownerProfilePicUrl;
    console.log(`📸 Foto de perfil: ${hasProfilePic ? '✅ Encontrada' : '❌ Ausente'}`);

    // Salvar em arquivo
    if (saveToFile) {
      const outputDir = 'squad-auditores/data';
      const outputFile = path.join(outputDir, `${username}-instagram-data.json`);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));
      console.log(`💾 Dados salvos em: ${outputFile}`);
    }

    return {
      success: true,
      posts: items,
      profilePicUrl: items[0]?.ownerProfilePicUrl,
      username: items[0]?.ownerUsername,
      fullName: items[0]?.ownerFullName,
    };

  } catch (error) {
    console.error(`❌ Erro ao scrapear @${username}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Exportar função
export { scrapeInstagramProfile };

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const username = process.argv[2] || 'frankcosta';
  scrapeInstagramProfile(username);
}
```

Uso:

```bash
# Via comando
node scripts/scrape-instagram.js frankcosta

# Via código
import { scrapeInstagramProfile } from './scripts/scrape-instagram.js';

const result = await scrapeInstagramProfile('frankcosta', {
  maxPosts: 100,
  includeComments: true,
});

console.log('Foto de perfil:', result.profilePicUrl);
```

---

## 🔐 Configurar Secrets no Apify

Se o Actor precisar de autenticação adicional (cookies, tokens):

1. Acesse: https://console.apify.com/account/integrations
2. Vá em "Secrets"
3. Adicione secrets necessários:
   - `INSTAGRAM_SESSION_ID` (se precisar de login)
   - `PROXY_URL` (se usar proxies)

---

## 🧪 Testar Localmente (Antes do Deploy)

```bash
cd apify-actors/instagram-scraper-profile

# Instalar dependências
npm install

# Executar localmente
APIFY_TOKEN=seu_token npm start
```

---

## 📊 Verificar Resultados

### No Apify Console:

1. Acesse: https://console.apify.com/actors/runs
2. Clique no run mais recente
3. Vá na aba "Dataset"
4. Verifique se `ownerProfilePicUrl` está presente

### Via CLI:

```bash
apify call SEU_USERNAME/instagram-scraper-profile \
  --input '{"username": "frankcosta", "maxPosts": 10}' \
  --output-dataset dataset.json

cat dataset.json | jq '.[0].ownerProfilePicUrl'
```

---

## 🎯 Próximos Passos

- [ ] Fazer commit dos arquivos
- [ ] Push para GitHub
- [ ] Configurar Actor no Apify Console
- [ ] Testar com 1 perfil
- [ ] Integrar ao Post Express
- [ ] Automatizar scraping recorrente

---

## 🐛 Problemas Comuns

### "Actor not found"

**Causa**: Nome do Actor errado ou não publicado

**Solução**:
```javascript
// Usar o nome completo com username
client.actor('SEU_USERNAME/instagram-scraper-profile')

// OU usar o ID do Actor
client.actor('ACTOR_ID')
```

### "Foto de perfil não encontrada"

**Causa**: Instagram bloqueou ou mudou o layout

**Soluções**:
1. Usar proxies: `client.actor().call({ ..., proxyConfiguration: {...} })`
2. Adicionar delays: `maxConcurrency: 1`
3. Tentar via Instagram Graph API (contas Business)

### "Build failed"

**Causa**: Erro no Dockerfile ou dependências

**Solução**: Verificar logs de build no Apify Console

---

**🎉 Pronto! Seu scraper customizado com foto de perfil está configurado!**
