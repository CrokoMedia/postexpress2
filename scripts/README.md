# 📸 Instagram Scraper Scripts - Post Express

Scripts para extrair dados de perfis do Instagram usando Apify.

---

## ✅ Script Recomendado: `test-instagram-scraper.js`

Extrai **foto de perfil HD** + dados completos do perfil usando `apify/instagram-profile-scraper`.

### 🚀 Como Usar:

```bash
node scripts/test-instagram-scraper.js [username]
```

**Exemplo:**
```bash
node scripts/test-instagram-scraper.js frankcosta
```

### 📊 O que extrai:

- ✅ **Foto de perfil HD** (URL completa)
- ✅ Nome completo
- ✅ Username
- ✅ Biografia
- ✅ Número de seguidores
- ✅ Número de pessoas seguindo
- ✅ Total de posts
- ✅ 12 posts mais recentes com métricas (likes, comentários)

### 💾 Resultado:

Salvo em: `squad-auditores/data/{username}-teste-scraper.json`

---

## 📋 Pré-requisitos:

### 1. Instalar Dependências

```bash
npm install apify-client dotenv
```

### 2. Configurar Token do Apify

Crie um arquivo `.env` na raiz do projeto:

```env
APIFY_API_TOKEN=seu_token_aqui
```

Para obter seu token:
1. Acesse: https://console.apify.com/account/integrations
2. Copie o "Personal API token"

---

## 🎯 Exemplo de Saída:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 TESTE DO INSTAGRAM SCRAPER - POST EXPRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Perfil alvo: @frankcosta

✅ Total de posts extraídos: 1

👤 DADOS DO PERFIL:
   Nome completo: Frank Costa | INTELIGÊNCIA ARTIFICIAL...
   Username: frankcosta
   Biografia: 🤖 Te ajudo a usar IA pra vender MAIS...
   Seguidores: 129300
   Seguindo: 1070
   Posts totais: 849
   📸 Foto de perfil: ✅ ENCONTRADA!

🔗 URL da foto de perfil (HD):
   https://scontent-msp1-1.cdninstagram.com/v/t51.2885-19/...

📝 POSTS RECENTES:
   Total de posts extraídos: 12
   Média de likes/post: 259
   Média de comentários/post: 29

💾 Dados salvos em: squad-auditores/data/frankcosta-teste-scraper.json
```

---

## 🔧 Scripts Disponíveis:

### 📸 Scraping Básico

| Script | Descrição | Actor Usado |
|--------|-----------|-------------|
| `test-instagram-scraper.js` | ⭐ **RECOMENDADO** - Extrai foto de perfil HD | `apify/instagram-profile-scraper` |
| `test-instagram-official.js` | Alternativo (mesmo resultado) | `apify/instagram-profile-scraper` |
| `instagram-scraper-apify.js` | ❌ NÃO extrai foto de perfil | `apify/instagram-scraper` |

### 💬 Análise Completa (NOVOS!)

| Script | Descrição | Tecnologias |
|--------|-----------|-------------|
| `instagram-scraper-with-comments.js` | 🔥 Extrai posts + comentários categorizados | Apify Instagram Scraper |
| `ocr-image-analyzer.js` | 🔍 OCR usando Tesseract.js (legado) | Tesseract.js |
| `ocr-gemini-analyzer.js` | ⭐ **OCR PREMIUM** - Extração superior com Gemini Vision | Google Gemini Vision |
| `complete-post-analyzer.js` | 🚀 **PIPELINE COMPLETO** - Posts + Comentários + OCR + Relatório | Apify + Vision API |

---

## 🆕 NOVOS SCRIPTS - Análise Completa

### 1️⃣ `instagram-scraper-with-comments.js`

Extrai posts E comentários, categorizando automaticamente:

```bash
node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=20 --comments-per-post=50
```

**Categorias de comentários:**
- ❓ Perguntas
- 💚 Elogios
- 🤔 Dúvidas
- 💬 Experiências pessoais
- 📌 Outros

**Saída:** `squad-auditores/data/{username}-posts-with-comments.json`

---

### 2️⃣ `ocr-image-analyzer.js` (Legado - Tesseract)

Extrai texto de imagens usando Tesseract.js:

```bash
node scripts/ocr-image-analyzer.js rodrigogunter_
```

**O que extrai:**
- Texto completo dos slides
- Títulos e subtítulos
- Bullets e listas
- CTAs (Call-to-Action)
- Tipo de conteúdo (educacional, vendas, autoridade, viral)

**Saída:** `squad-auditores/data/{username}-ocr-analysis.json`

**⚠️ Nota:** Qualidade inferior, recomendamos usar `ocr-gemini-analyzer.js` para melhores resultados.

---

### 2.1️⃣ `ocr-gemini-analyzer.js` ⭐ **RECOMENDADO**

Extrai texto de imagens usando **Google Gemini Vision API** - OCR superior com contexto semântico:

```bash
node scripts/ocr-gemini-analyzer.js rodrigogunter_
# ou use o alias npm:
npm run ocr-gemini rodrigogunter_
```

**O que extrai (com qualidade superior):**
- ✅ Texto completo preservando hierarquia visual
- ✅ Títulos principais e subtítulos identificados corretamente
- ✅ Bullets e listas estruturadas
- ✅ CTAs detectados automaticamente
- ✅ Números em destaque (estatísticas, métricas)
- ✅ Cores predominantes
- ✅ Tipo de conteúdo (educacional, vendas, autoridade, viral)
- ✅ Elementos especiais (emojis, ícones, badges)
- ✅ Estrutura visual descrita

**Vantagens sobre Tesseract:**
- 🚀 Reconhecimento muito superior de texto em imagens estilizadas
- 🎨 Entende contexto visual e hierarquia
- 🎯 Detecta tipo de conteúdo com precisão
- 📊 Identifica elementos especiais automaticamente
- 💰 Gratuito até 1.5M tokens/mês

**Saída:** `squad-auditores/data/{username}-ocr-gemini-analysis.json`

**Pré-requisito:** Configure `GOOGLE_API_KEY` no `.env` (já configurado ✅)

---

### 3️⃣ `complete-post-analyzer.js` (⭐ PIPELINE COMPLETO)

**Executa tudo automaticamente:**
1. Scraping de posts
2. Extração de comentários
3. OCR das imagens
4. Geração de relatório

```bash
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=10
```

**Opções:**
- `--limit=N` - Número de posts (padrão: 10)
- `--skip-ocr` - Pular análise OCR (mais rápido)

**Saídas:**
- `squad-auditores/data/{username}-complete-analysis.json` (dados completos)
- `squad-auditores/output/auditoria-{username}.md` (relatório markdown)

---

## 📦 Dependências Adicionais

Para usar os novos scripts, instale:

```bash
npm install @google/generative-ai @anthropic-ai/sdk tesseract.js
```

E configure as chaves da API no `.env`:

```env
# Google Gemini (OCR Premium)
GOOGLE_API_KEY=AIzaSy...

# Anthropic Claude (Análises)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 📚 Estrutura de Dados Extraídos:

```json
{
  "id": "44870418",
  "username": "frankcosta",
  "fullName": "Frank Costa | INTELIGÊNCIA ARTIFICIAL...",
  "biography": "🤖 Te ajudo a usar IA...",
  "profilePicUrl": "https://...",
  "profilePicUrlHD": "https://...",
  "followersCount": 129300,
  "followsCount": 1070,
  "postsCount": 849,
  "latestPosts": [
    {
      "id": "...",
      "caption": "...",
      "likesCount": 655,
      "commentsCount": 47,
      "timestamp": "2023-11-15T...",
      "url": "https://www.instagram.com/p/..."
    }
  ]
}
```

---

## 🐛 Troubleshooting:

### Erro: "Cannot find package 'apify-client'"

```bash
npm install apify-client dotenv
```

### Erro: "APIFY_API_TOKEN is not defined"

Verifique se o arquivo `.env` existe e contém:
```
APIFY_API_TOKEN=seu_token_aqui
```

### Actor falhou ou retornou dados vazios

- Verifique se o perfil do Instagram é **público**
- Perfis privados não podem ser scrapeados
- Instagram pode bloquear temporariamente (tente novamente depois)

---

## 💡 Dicas:

### Extrair múltiplos perfis:

```bash
node scripts/test-instagram-scraper.js frankcosta
node scripts/test-instagram-scraper.js outro_perfil
node scripts/test-instagram-scraper.js mais_um_perfil
```

### Usar em scripts automatizados:

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const run = await client.actor('apify/instagram-profile-scraper').call({
  usernames: ['frankcosta'],
  resultsLimit: 10,
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
console.log(items[0].profilePicUrlHD);
```

---

## 🎉 Sucesso!

Agora você pode extrair foto de perfil HD de qualquer perfil público do Instagram!

**Dúvidas?** Consulte a documentação do Actor:
https://apify.com/apify/instagram-profile-scraper
