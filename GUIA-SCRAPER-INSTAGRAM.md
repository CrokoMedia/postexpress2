# 📸 Guia Completo - Scraper Instagram + Gerador de Slides

## 🎯 Visão Geral

Sistema completo para extrair dados de perfis do Instagram e gerar slides HTML automaticamente.

---

## 🔧 Ferramentas Utilizadas

- **Actor:** `apify/instagram-profile-scraper` (oficial do Apify)
- **Linguagem:** JavaScript/Node.js
- **Formato de saída:** JSON
- **Template:** `templateagoravai.html` (1080x1350px)

---

## 📊 DADOS EXTRAÍDOS DO INSTAGRAM

### ✅ Informações do Perfil

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `id` | ID único do perfil | `"964889308"` |
| `username` | Nome de usuário | `"umantoniodasilva"` |
| `fullName` | Nome completo | `"Antônio da Silva \| Grupo Silva"` |
| `biography` | Biografia/Bio | `"Meu trabalho é fazer sua empresa..."` |
| `url` | URL do perfil | `"https://www.instagram.com/..."` |
| `verified` | Conta verificada (✓) | `true` / `false` |

### 📸 Fotos de Perfil

| Campo | Resolução | Uso |
|-------|-----------|-----|
| `profilePicUrl` | 150x150px | Miniatura |
| `profilePicUrlHD` | 320x320px | ⭐ Usado nos slides |

### 📊 Métricas do Perfil

| Campo | Descrição |
|-------|-----------|
| `followersCount` | Número de seguidores |
| `followsCount` | Número de pessoas seguindo |
| `postsCount` | Total de posts publicados |
| `igtvVideoCount` | Número de vídeos IGTV |
| `highlightReelCount` | Stories em destaque |

### 🔗 Links e Configurações

| Campo | Descrição |
|-------|-----------|
| `externalUrl` | Link na bio (limpo) |
| `externalUrlShimmed` | Link com tracking do Instagram |
| `isBusinessAccount` | Se é conta comercial |
| `businessCategoryName` | Categoria do negócio |
| `private` | Se o perfil é privado |
| `hasChannel` | Se tem canal de broadcast |

### 👥 Perfis Relacionados

O scraper também extrai **15 perfis similares**, cada um com:
- `id`, `full_name`, `username`
- `is_verified`, `is_private`
- `profile_pic_url`

---

## 📝 DADOS DOS POSTS

Array `latestPosts` contém até **12 posts mais recentes**, cada um com:

### Informações Básicas
- `id` - ID único do post
- `shortCode` - Código curto (ex: "DUlTQrMDl-M")
- `url` - URL completa do post
- `type` - Tipo: "Image", "Video", "Sidecar" (carrossel)
- `caption` - Legenda completa do post
- `timestamp` - Data e hora de publicação

### Métricas de Engajamento
- `likesCount` - Número de likes
- `commentsCount` - Número de comentários
- `isPinned` - Se está fixado no perfil
- `isCommentsDisabled` - Se comentários estão desabilitados

### Mídia
- `displayUrl` - URL da imagem principal
- `dimensionsWidth` - Largura da imagem
- `dimensionsHeight` - Altura da imagem
- `images` - Array com todas as imagens
- `childPosts` - Posts filhos (para carrosséis)

### Tags e Menções
- `hashtags` - Array de hashtags usadas
- `mentions` - Array de usuários mencionados (@)

### Autor
- `ownerId` - ID do autor
- `ownerUsername` - Username do autor

---

## 💬 EXTRAÇÃO DE COMENTÁRIOS (NOVO!)

Usando `resultsType: 'comments'`, você pode extrair comentários de posts:

### Campos dos Comentários
- `id` - ID do comentário
- `text` - Texto completo
- `timestamp` - Data e hora
- `ownerUsername` - Username de quem comentou
- `ownerProfilePicUrl` - Foto de perfil
- `likesCount` - Curtidas no comentário

### Script Recomendado
```bash
node scripts/instagram-scraper-with-comments.js rodrigogunter_
```

### Categorização Automática
Os comentários são categorizados em:
- ❓ **Perguntas** - Comentários com "?" ou começam com "como", "onde", etc
- 💚 **Elogios** - "parabéns", "top", "amei", etc
- 🤔 **Dúvidas** - "dúvida", "não entendi", etc
- 💬 **Experiências** - "comigo", "já passei", "aconteceu", etc
- 📌 **Outros** - Demais comentários

### Filtragem Inteligente
Remove automaticamente:
- Comentários muito curtos (< 3 caracteres)
- Apenas emojis
- Spam ("follow", "dm", "link in bio", etc)

---

## 🔍 ANÁLISE OCR DAS IMAGENS (NOVO!)

Extração de texto das imagens usando **Claude Vision API**:

### O que é extraído:
- ✅ Texto completo dos slides
- ✅ Títulos e subtítulos
- ✅ Bullets e listas
- ✅ CTAs (Call-to-Action)
- ✅ Estrutura do conteúdo
- ✅ Cores predominantes
- ✅ Tipo de conteúdo (educacional, vendas, autoridade, viral)

### Script de OCR
```bash
node scripts/ocr-image-analyzer.js rodrigogunter_
```

### Formato de Saída (JSON)
```json
{
  "texto_completo": "Todo o texto extraído",
  "titulo_principal": "Título do slide",
  "subtitulos": ["Subtítulo 1", "Subtítulo 2"],
  "bullets": ["Item 1", "Item 2"],
  "cta": "Call-to-action identificado",
  "estrutura": "Descrição da estrutura",
  "cores_predominantes": ["azul", "branco"],
  "tipo_conteudo": "educacional|vendas|autoridade|viral",
  "elementos_especiais": ["ícones", "emojis"]
}
```

---

## 🚀 PIPELINE COMPLETO (RECOMENDADO!)

Use `complete-post-analyzer.js` para executar tudo de uma vez:

```bash
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=10
```

### O que faz:
1. ✅ Extrai posts do perfil
2. ✅ Extrai e categoriza comentários
3. ✅ Analisa imagens com OCR
4. ✅ Gera relatório markdown

### Saídas:
- `squad-auditores/data/{username}-complete-analysis.json` - Dados completos
- `squad-auditores/output/auditoria-{username}.md` - Relatório formatado

### Opções:
- `--limit=N` - Número de posts (padrão: 10)
- `--skip-ocr` - Pular OCR (mais rápido)

---

## 🚀 COMO USAR

### 1️⃣ Extrair Dados do Instagram

```bash
node scripts/test-instagram-scraper.js [username] [num_posts]
```

**Exemplos:**
```bash
# Extrair perfil com padrão (5 posts)
node scripts/test-instagram-scraper.js frankcosta

# Extrair perfil com 10 posts
node scripts/test-instagram-scraper.js umantoniodasilva 10
```

**Resultado:**
- Arquivo salvo em: `squad-auditores/data/{username}-teste-scraper.json`
- Contém: Dados do perfil + posts recentes

---

### 2️⃣ Gerar Slide Automaticamente

```bash
node scripts/gerar-slide-perfil.js [username]
```

**Exemplos:**
```bash
node scripts/gerar-slide-perfil.js umantoniodasilva
node scripts/gerar-slide-perfil.js frankcosta
```

**O que acontece:**
1. ✅ Lê dados do JSON gerado no passo 1
2. ✅ **Baixa foto de perfil HD localmente**
3. ✅ Salva em `assets/fotos-perfil/{username}.jpg`
4. ✅ Gera HTML com template
5. ✅ Substitui placeholders automaticamente

**Resultado:**
- Slide HTML: `slide-{username}.html`
- Foto local: `assets/fotos-perfil/{username}.jpg`

---

### 3️⃣ Visualizar Slide

```bash
open slide-{username}.html
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
postexpress2/
├── assets/
│   └── fotos-perfil/              # Fotos baixadas localmente
│       ├── frankcosta.jpg
│       └── umantoniodasilva.jpg
│
├── squad-auditores/
│   └── data/                      # Dados extraídos do Instagram
│       ├── frankcosta-teste-scraper.json
│       └── umantoniodasilva-teste-scraper.json
│
├── scripts/
│   ├── test-instagram-scraper.js  # Script de extração
│   └── gerar-slide-perfil.js      # Gerador de slides
│
├── slide-frankcosta.html          # Slides gerados
├── slide-umantoniodasilva.html
│
└── templateagoravai.html          # Template base
```

---

## 🎨 TEMPLATE DO SLIDE

### Especificações:
- **Dimensões:** 1080x1350px (formato Instagram)
- **Background:** Branco (#ffffff)
- **Fonte:** Chirp (Twitter)
- **Avatar:** 80x80px (circular)
- **Badge verificado:** Azul oficial do Instagram

### Placeholders substituídos:
- `{{FOTO_URL}}` → Caminho local da foto
- `{{NOME}}` → Nome completo do perfil
- `{{USERNAME}}` → @username
- `{{TEXTO}}` → Biografia (com formatação)

---

## 🔄 FLUXO COMPLETO

```
┌─────────────────────────────────────────────┐
│ 1. SCRAPER                                   │
│    node scripts/test-instagram-scraper.js    │
│    ↓                                         │
│    Extrai dados do Instagram                │
│    ↓                                         │
│    Salva JSON em squad-auditores/data/      │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 2. GERADOR DE SLIDES                         │
│    node scripts/gerar-slide-perfil.js        │
│    ↓                                         │
│    Lê dados do JSON                          │
│    ↓                                         │
│    Baixa foto de perfil (HD)                │
│    ↓                                         │
│    Salva em assets/fotos-perfil/            │
│    ↓                                         │
│    Gera HTML com template                    │
│    ↓                                         │
│    Substitui placeholders                    │
│    ↓                                         │
│    Salva slide-{username}.html              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 3. VISUALIZAÇÃO                              │
│    open slide-{username}.html                │
│    ↓                                         │
│    Slide pronto para uso! ✅                 │
└─────────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### 1. Variáveis de Ambiente (`.env`)

```env
APIFY_API_TOKEN=seu_token_aqui
```

**Como obter:**
1. Acesse: https://console.apify.com/account/integrations
2. Copie o "Personal API token"
3. Cole no arquivo `.env`

### 2. Dependências

```bash
npm install apify-client dotenv
```

---

## 🎯 CAMPOS USADOS NO SLIDE

| Campo JSON | Onde aparece no slide |
|------------|----------------------|
| `fullName` | Header (nome em negrito) |
| `username` | Header (@username) |
| `profilePicUrlHD` | Avatar circular (80x80px) |
| `biography` | Texto principal do slide |
| `verified` | Badge azul (✓) ao lado do nome |

---

## 💡 RECURSOS ESPECIAIS

### ✅ Download Local de Fotos
- URLs do Instagram expiram rapidamente
- Script baixa foto automaticamente
- Salva permanentemente em `assets/fotos-perfil/`
- Slide usa caminho local (nunca expira)

### ✅ Formatação Automática
- Palavras em CAPS ganham negrito: `<strong>`
- Quebras de linha preservadas: `<p>`
- Biografia dividida em parágrafos

### ✅ Fallback Inteligente
- Se download da foto falhar → usa URL original
- Se campo não existir → usa valor padrão

---

## 🧪 PERFIS TESTADOS

| Perfil | Seguidores | Foto | Status |
|--------|-----------|------|--------|
| @frankcosta | 129,300 | ✅ 9.4 KB | ✅ Funcionando |
| @umantoniodasilva | 969,597 | ✅ 8.3 KB | ✅ Funcionando |

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **README dos Scripts:** `scripts/README.md`
- **Repositório:** https://github.com/CrokoMedia/postexpress2
- **Actor Oficial:** https://apify.com/apify/instagram-profile-scraper

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find package 'apify-client'"
```bash
npm install apify-client dotenv
```

### Erro: "APIFY_API_TOKEN is not defined"
Verifique se o arquivo `.env` existe e contém o token.

### Foto não carrega no slide
- ✅ Verifique se a foto foi baixada: `ls assets/fotos-perfil/`
- ✅ Execute o gerador novamente: `node scripts/gerar-slide-perfil.js [username]`

### Actor falhou ou retornou dados vazios
- ❌ Perfil privado (não pode scrappear)
- ❌ Username errado
- ❌ Instagram bloqueou temporariamente

---

## 🎉 PRÓXIMOS PASSOS

1. **Integrar com Content Creation Squad**
   - Usar dados extraídos para criar carrosséis
   - Automação completa de conteúdo

2. **Análise de Concorrentes**
   - Scrappear múltiplos perfis
   - Comparar métricas
   - Identificar padrões

3. **Geração em Massa**
   - Script para processar lista de perfis
   - Gerar múltiplos slides automaticamente

4. **Exportar para Imagem**
   - Converter HTML para PNG/JPG
   - Pronto para publicação

---

**Última atualização:** 16/02/2026
**Versão:** 1.0
**Status:** ✅ Funcionando perfeitamente

---

**💡 Dúvidas?** Consulte a documentação ou execute `node scripts/test-instagram-scraper.js --help`
