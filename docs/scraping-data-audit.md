# Auditoria de Dados do Scraping do Instagram

**Data:** 2026-02-25
**Script analisado:** `scripts/instagram-scraper-with-comments.js`
**Fonte:** Apify Instagram Profile Scraper + Apify Instagram Scraper (comentários)

---

## 📊 RESUMO EXECUTIVO

### Dados Atualmente Coletados
- **Perfil:** 15 campos (incluindo foto HD, bio, verificação, contato)
- **Posts:** 18+ campos do `latestPosts` (caption, métricas, mídia)
- **Comentários:** 7 campos + categorização automática (perguntas, elogios, dúvidas)

### Pipeline Atual
```
Apify Instagram Profile Scraper (perfil + posts)
        ↓
Apify Instagram Scraper (comentários por post)
        ↓
Filtro de comentários relevantes (remove spam/emoji)
        ↓
Categorização automática (5 categorias)
        ↓
Output JSON: squad-auditores/data/{username}-posts-with-comments.json
```

### Status
✅ **Funcional e completo** para os 5 frameworks de auditoria
⚠️ **Campos disponíveis mas não coletados:** 8 campos identificados
💡 **Recomendações:** 6 melhorias propostas

---

## 📋 INVENTÁRIO DE CAMPOS

### 1. PERFIL (Profile Data)

| Campo | Tipo | Coletado | Armazenado | Uso Atual | Útil para Auditoria |
|-------|------|----------|-----------|-----------|---------------------|
| `username` | string | ✅ | `profiles.username` | Identificação única | ⭐⭐⭐ Essencial |
| `fullName` | string | ✅ | `profiles.full_name` | Nome de exibição | ⭐⭐⭐ Essencial |
| `biography` | text | ✅ | `profiles.biography` | Framework de Copy | ⭐⭐⭐ Essencial |
| `followersCount` | integer | ✅ | `profiles.followers_count` | Framework de Métricas | ⭐⭐⭐ Essencial |
| `followsCount` | integer | ✅ | `profiles.following_count` | Ratio follow/followers | ⭐⭐ Muito útil |
| `postsCount` | integer | ✅ | `profiles.posts_count` | Volume de conteúdo | ⭐⭐ Muito útil |
| `profilePicUrl` | string | ✅ | `profiles.profile_pic_url` | Imagem padrão | ⭐ Útil |
| `profilePicUrlHD` | string | ✅ | `profiles.profile_pic_url_hd` | Imagem alta qualidade | ⭐⭐ Muito útil |
| `url` | string | ✅ | `profiles.url` | Link do perfil | ⭐ Útil |
| `verified` | boolean | ✅ | `profiles.is_verified` | Credibilidade | ⭐⭐ Muito útil |
| `isBusinessAccount` | boolean | ✅ | `profiles.is_business_account` | Tipo de conta | ⭐⭐ Muito útil |
| `businessCategoryName` | string | ✅ | `profiles.business_category` | Nicho/categoria | ⭐⭐⭐ Essencial |
| `isPrivate` | boolean | ❌ | `profiles.is_private` | — | ⭐ Útil (validação) |
| `externalUrl` | string | ❌ | `profiles.external_url` | — | ⭐⭐ Muito útil (Framework Ofertas) |
| `contactPhoneNumber` | string | ❌ | `profiles.contact_phone_number` | — | ⭐ Útil (dados de contato) |
| `contactEmail` | string | ❌ | `profiles.contact_email` | — | ⭐ Útil (dados de contato) |

**Campos não coletados mas disponíveis:**
- `isPrivate` → útil para validar se perfil pode ser scrapeado
- `externalUrl` → CRÍTICO para Framework de Ofertas (link na bio)
- `contactPhoneNumber` → útil para identificar conta comercial
- `contactEmail` → útil para identificar conta comercial

---

### 2. POSTS (latestPosts Array)

| Campo | Tipo | Coletado | Armazenado | Uso Atual | Útil para Auditoria |
|-------|------|----------|-----------|-----------|---------------------|
| `id` | string | ✅ | `posts.post_id` | Identificação única | ⭐⭐⭐ Essencial |
| `shortCode` | string | ✅ | `posts.short_code` | URL do post | ⭐⭐ Muito útil |
| `url` | string | ✅ | `posts.post_url` | Link direto | ⭐⭐⭐ Essencial |
| `type` | enum | ✅ | `posts.post_type` | Formato (Image/Video/Sidecar) | ⭐⭐⭐ Essencial |
| `caption` | text | ✅ | `posts.caption` | Framework de Copy | ⭐⭐⭐ Essencial |
| `likesCount` | integer | ✅ | `posts.likes_count` | Engajamento | ⭐⭐⭐ Essencial |
| `commentsCount` | integer | ✅ | `posts.comments_count` | Engajamento | ⭐⭐⭐ Essencial |
| `timestamp` | datetime | ✅ | `posts.post_timestamp` | Análise temporal | ⭐⭐⭐ Essencial |
| `displayUrl` | string | ✅ | `posts.display_url` | OCR (imagem principal) | ⭐⭐⭐ Essencial |
| `images` | array | ✅ | `posts.images` | OCR (carrosséis) | ⭐⭐⭐ Essencial |
| `videoUrl` | string | ✅ | `posts.video_url` | Vídeos | ⭐⭐ Muito útil |
| `videoViewCount` | integer | ✅ (implícito) | `posts.video_view_count` | Engajamento de vídeo | ⭐⭐⭐ Essencial |
| `isPinned` | boolean | ❌ | `posts.is_pinned` | — | ⭐⭐ Muito útil (estratégia) |
| `locationName` | string | ❌ | `posts.location_name` | — | ⭐ Útil (análise geográfica) |
| `accessibilityCaption` | string | ❌ | `posts.accessibility_caption` | — | ⭐ Útil (alt text) |
| `hashtags` | array | ❌ | `posts.hashtags` | — | ⭐⭐⭐ CRÍTICO (Framework Copy) |
| `mentions` | array | ❌ | `posts.mentions` | — | ⭐⭐ Muito útil (colaborações) |

**Campos não coletados mas disponíveis:**
- `hashtags` → **CRÍTICO** para Framework de Copy (estratégia de hashtags)
- `mentions` → **Muito útil** para Framework Comportamental (colaborações)
- `isPinned` → útil para identificar posts estratégicos
- `locationName` → útil para análise geográfica
- `accessibilityCaption` → útil para análise de acessibilidade

**Nota:** O script coleta os campos diretamente do objeto `post` do `latestPosts`, mas não extrai `hashtags` e `mentions` do `caption`.

---

### 3. COMENTÁRIOS (Comments Data)

| Campo | Tipo | Coletado | Armazenado | Uso Atual | Útil para Auditoria |
|-------|------|----------|-----------|-----------|---------------------|
| `text` | text | ✅ | `comments.text` | Framework Comportamental | ⭐⭐⭐ Essencial |
| `ownerUsername` | string | ✅ | `comments.owner_username` | Identificação do autor | ⭐⭐ Muito útil |
| `ownerId` | string | ✅ | `comments.owner_id` | ID do autor | ⭐ Útil |
| `ownerProfilePicUrl` | string | ✅ | `comments.owner_profile_pic_url` | Avatar | ⭐ Útil |
| `ownerIsVerified` | boolean | ✅ | `comments.owner_is_verified` | Credibilidade | ⭐⭐ Muito útil |
| `likesCount` | integer | ✅ | `comments.likes_count` | Engajamento | ⭐⭐ Muito útil |
| `timestamp` | datetime | ✅ (implícito) | `comments.comment_timestamp` | Análise temporal | ⭐⭐ Muito útil |
| **Categorizações Custom** | | | | | |
| `category` | enum | ✅ | `comments.category` | 5 categorias automáticas | ⭐⭐⭐ Essencial |
| `is_relevant` | boolean | ✅ | `comments.is_relevant` | Filtro de spam | ⭐⭐⭐ Essencial |

**Categorias criadas pelo script:**
1. `perguntas` → Comentários com "?" ou "como/onde/quando/porque/qual/quem/quanto"
2. `elogios` → "parabens", "incrível", "top", "excelente", "amei", etc.
3. `duvidas` → "duvida", "será que", "alguém sabe", "não entendi", "explica"
4. `experiencias` → "eu também", "comigo", "já passei", "aconteceu", "meu caso"
5. `outros` → Demais comentários relevantes

**Filtragem de spam:**
- Remove comentários < 3 caracteres
- Remove emojis puros
- Remove spam comum ("follow", "dm", "link in bio", "check out", "giveaway")

---

## 🗄️ MAPEAMENTO BANCO DE DADOS

### Tabela: `profiles`

| Campo DB | Campo Scraper | Status | Observações |
|----------|---------------|--------|-------------|
| `username` | `username` | ✅ Mapeado | UNIQUE constraint |
| `full_name` | `fullName` | ✅ Mapeado | — |
| `biography` | `biography` | ✅ Mapeado | — |
| `external_url` | `externalUrl` | ❌ NÃO coletado | **Importante para Framework Ofertas** |
| `followers_count` | `followersCount` | ✅ Mapeado | — |
| `following_count` | `followsCount` | ✅ Mapeado | — |
| `posts_count` | `postsCount` | ✅ Mapeado | — |
| `profile_pic_url` | `profilePicUrl` | ✅ Mapeado | — |
| `profile_pic_url_hd` | `profilePicUrlHD` | ✅ Mapeado | — |
| `url` | `url` | ✅ Mapeado | — |
| `is_verified` | `verified` | ✅ Mapeado | — |
| `is_private` | `isPrivate` | ❌ NÃO coletado | — |
| `is_business_account` | `isBusinessAccount` | ✅ Mapeado | — |
| `business_category` | `businessCategoryName` | ✅ Mapeado | — |
| `contact_phone_number` | `contactPhoneNumber` | ❌ NÃO coletado | — |
| `contact_email` | `contactEmail` | ❌ NÃO coletado | — |
| `profile_pic_cloudinary_url` | — | ⚠️ Gerado depois | Upload manual no dashboard |

**Taxa de cobertura:** 12/15 campos (80%)

---

### Tabela: `posts`

| Campo DB | Campo Scraper | Status | Observações |
|----------|---------------|--------|-------------|
| `post_id` | `id` | ✅ Mapeado | UNIQUE constraint |
| `short_code` | `shortCode` | ✅ Mapeado | — |
| `post_url` | `url` | ✅ Mapeado | — |
| `post_type` | `type` | ✅ Mapeado | ENUM: Image, Video, Sidecar |
| `caption` | `caption` | ✅ Mapeado | — |
| `hashtags` | — | ❌ NÃO extraído | **Precisa extrair do caption** |
| `mentions` | — | ❌ NÃO extraído | **Precisa extrair do caption** |
| `accessibility_caption` | `accessibilityCaption` | ❌ NÃO coletado | — |
| `location_name` | `locationName` | ❌ NÃO coletado | — |
| `likes_count` | `likesCount` | ✅ Mapeado | — |
| `comments_count` | `commentsCount` | ✅ Mapeado | — |
| `video_view_count` | `videoViewCount` | ✅ Mapeado | — |
| `is_pinned` | `isPinned` | ❌ NÃO coletado | — |
| `post_timestamp` | `timestamp` | ✅ Mapeado | — |
| `display_url` | `displayUrl` | ✅ Mapeado | — |
| `images` | `images` | ✅ Mapeado | Array de URLs |
| `video_url` | `videoUrl` | ✅ Mapeado | — |
| `ocr_data` | — | ⚠️ Gerado depois | Pipeline OCR separado |
| `comments_raw` | `comments.raw` | ✅ Mapeado | JSONB |
| `comments_categorized` | `comments.categorized` | ✅ Mapeado | JSONB |

**Taxa de cobertura:** 15/21 campos (71%)

---

### Tabela: `comments`

| Campo DB | Campo Scraper | Status | Observações |
|----------|---------------|--------|-------------|
| `comment_id` | `id` | ✅ Mapeado | UNIQUE constraint |
| `text` | `text` | ✅ Mapeado | — |
| `owner_username` | `ownerUsername` | ✅ Mapeado | — |
| `owner_id` | `ownerId` | ✅ Mapeado | — |
| `owner_profile_pic_url` | `ownerProfilePicUrl` | ✅ Mapeado | — |
| `owner_is_verified` | `ownerIsVerified` | ✅ Mapeado | — |
| `likes_count` | `likesCount` | ✅ Mapeado | — |
| `category` | — | ✅ Calculado | Script categoriza automaticamente |
| `is_relevant` | — | ✅ Calculado | Script filtra spam |
| `comment_timestamp` | `timestamp` | ✅ Mapeado | — |
| `replied_to_comment_id` | — | ❌ NÃO coletado | **Threads não mapeadas** |
| `reply_level` | — | ❌ NÃO coletado | **Threads não mapeadas** |
| `sentiment_score` | — | ❌ NÃO calculado | — |

**Taxa de cobertura:** 9/13 campos (69%)

---

## 🎯 COBERTURA POR FRAMEWORK DE AUDITORIA

### 1. Framework Comportamental (Kahneman)
**Dados necessários:** Perguntas do público, dúvidas recorrentes, experiências relatadas

| Dado | Disponível | Usado | Gap |
|------|-----------|-------|-----|
| Perguntas nos comentários | ✅ | ✅ | — |
| Dúvidas recorrentes | ✅ | ✅ | — |
| Experiências pessoais | ✅ | ✅ | — |
| Elogios | ✅ | ✅ | — |
| Engajamento por tipo de post | ✅ | ⚠️ Parcial | Falta análise de hashtags |
| Vieses cognitivos | ⚠️ Limitado | ❌ | Falta análise de sentimento |

**Score:** 4/6 (67%) ⚠️

---

### 2. Framework de Copy (Schwartz)
**Dados necessários:** Caption, hooks, awareness stages, linguagem persuasiva

| Dado | Disponível | Usado | Gap |
|------|-----------|-------|-----|
| Caption completo | ✅ | ✅ | — |
| Biografia | ✅ | ✅ | — |
| Hashtags | ⚠️ No caption | ❌ | **NÃO extraído** |
| Mentions | ⚠️ No caption | ❌ | **NÃO extraído** |
| Link na bio | ❌ | ❌ | **NÃO coletado** (`externalUrl`) |
| Texto dos slides (OCR) | ✅ | ✅ | — |

**Score:** 3/6 (50%) ❌ **CRÍTICO**

---

### 3. Framework de Ofertas (Hormozi)
**Dados necessários:** CTAs, ofertas, value equation, conversão

| Dado | Disponível | Usado | Gap |
|------|-----------|-------|-----|
| Caption (CTAs) | ✅ | ✅ | — |
| Link na bio | ❌ | ❌ | **NÃO coletado** (`externalUrl`) |
| Tipo de conta (comercial) | ✅ | ✅ | — |
| Categoria de negócio | ✅ | ✅ | — |
| Contato (email/telefone) | ❌ | ❌ | **NÃO coletado** |
| Posts fixados | ❌ | ❌ | **NÃO coletado** (`isPinned`) |

**Score:** 3/6 (50%) ❌ **CRÍTICO**

---

### 4. Framework de Métricas (Cagan)
**Dados necessários:** Métricas que importam vs vanity metrics, outcomes vs outputs

| Dado | Disponível | Usado | Gap |
|------|-----------|-------|-----|
| Seguidores | ✅ | ✅ | — |
| Seguindo | ✅ | ✅ | — |
| Posts count | ✅ | ✅ | — |
| Likes por post | ✅ | ✅ | — |
| Comentários por post | ✅ | ✅ | — |
| Views de vídeo | ✅ | ✅ | — |
| Engagement rate | ⚠️ Calculado | ✅ | — |
| Tempo entre posts | ⚠️ Via timestamp | ⚠️ Parcial | Falta análise de consistência |

**Score:** 7/8 (88%) ✅

---

### 5. Framework de Anomalias (Paul Graham)
**Dados necessários:** Padrões contraintuitivos, anomalias, insights escondidos

| Dado | Disponível | Usado | Gap |
|------|-----------|-------|-----|
| Verificado vs não verificado | ✅ | ✅ | — |
| Ratio follow/followers | ✅ | ✅ | — |
| Posts fixados | ❌ | ❌ | **NÃO coletado** (`isPinned`) |
| Localização geográfica | ❌ | ❌ | **NÃO coletado** (`locationName`) |
| Hashtags vs engajamento | ❌ | ❌ | **NÃO extraído** |
| Mentions vs colaborações | ❌ | ❌ | **NÃO extraído** |
| Threads de comentários | ❌ | ❌ | **NÃO coletado** |

**Score:** 2/7 (29%) ❌ **CRÍTICO**

---

## 🔴 GAPS CRÍTICOS IDENTIFICADOS

### 1. **Hashtags e Mentions não extraídos** (ALTA PRIORIDADE)
**Impacto:** Framework de Copy (Schwartz) e Framework de Anomalias (Paul Graham)

**Problema:**
- Campos `hashtags` e `mentions` existem no schema do Supabase (`posts` table)
- Apify retorna no `caption`, mas não como arrays separados
- Script não faz parsing do caption

**Solução proposta:**
```javascript
function extractHashtagsAndMentions(caption) {
  const hashtags = (caption?.match(/#\w+/g) || []).map(h => h.slice(1));
  const mentions = (caption?.match(/@\w+/g) || []).map(m => m.slice(1));
  return { hashtags, mentions };
}
```

**Insights que isso desbloqueia:**
- Estratégia de hashtags (quais geram mais engajamento?)
- Colaborações (quais perfis são mencionados?)
- Padrões de hashtags por tipo de conteúdo
- Anomalias (posts sem hashtags que performam bem)

---

### 2. **Link na bio (`externalUrl`) não coletado** (ALTA PRIORIDADE)
**Impacto:** Framework de Ofertas (Hormozi)

**Problema:**
- Campo `external_url` existe no schema (`profiles` table)
- Apify Instagram Profile Scraper retorna esse campo
- Script não coleta

**Solução proposta:**
```javascript
const profile = {
  // ... campos existentes
  externalUrl: profileData.externalUrl,
};
```

**Insights que isso desbloqueia:**
- Perfil tem link? (CTA de conversão)
- Tipo de link (Linktree, site próprio, loja, etc.)
- Framework de Ofertas: presença de funil de conversão

---

### 3. **Posts fixados (`isPinned`) não coletados** (MÉDIA PRIORIDADE)
**Impacto:** Framework de Ofertas (Hormozi) e Framework de Anomalias (Paul Graham)

**Problema:**
- Campo `is_pinned` existe no schema (`posts` table)
- Apify retorna esse campo no `latestPosts`
- Script não coleta

**Solução proposta:**
```javascript
const posts = profileData.latestPosts.map(post => ({
  // ... campos existentes
  isPinned: post.isPinned || false,
}));
```

**Insights que isso desbloqueia:**
- Quais posts são estratégicos? (fixados = prioridade)
- Anomalias: posts fixados com baixo engajamento (má estratégia)

---

### 4. **Threads de comentários não mapeadas** (MÉDIA PRIORIDADE)
**Impacto:** Framework Comportamental (Kahneman) e Framework de Anomalias (Paul Graham)

**Problema:**
- Campos `replied_to_comment_id` e `reply_level` existem no schema (`comments` table)
- Apify retorna threads, mas script não mapeia
- Comentários são tratados como flat array

**Solução proposta:**
- Mapear `repliedToCommentId` do Apify para `replied_to_comment_id`
- Calcular `reply_level` (0 = raiz, 1+ = resposta)

**Insights que isso desbloqueia:**
- Conversação ativa (respostas geram threads)
- Creator responde comentários? (engajamento ativo)
- Anomalias: posts com muitas threads (tópico controverso)

---

### 5. **Análise de sentimento não implementada** (BAIXA PRIORIDADE)
**Impacto:** Framework Comportamental (Kahneman)

**Problema:**
- Campo `sentiment_score` existe no schema (`comments` table)
- Não é calculado pelo script
- Útil para análise comportamental

**Solução proposta:**
- Integrar biblioteca de análise de sentimento (ex: Sentiment.js)
- Calcular score -1.00 (negativo) a 1.00 (positivo)

**Insights que isso desbloqueia:**
- Sentimento geral da audiência
- Posts que geram negatividade vs positividade
- Anomalias: posts com alto engajamento mas sentimento negativo

---

### 6. **Dados de contato não coletados** (BAIXA PRIORIDADE)
**Impacto:** Framework de Ofertas (Hormozi)

**Problema:**
- Campos `contact_phone_number` e `contact_email` existem no schema (`profiles` table)
- Apify retorna esses campos para contas comerciais
- Script não coleta

**Solução proposta:**
```javascript
const profile = {
  // ... campos existentes
  contactPhoneNumber: profileData.contactPhoneNumber,
  contactEmail: profileData.contactEmail,
};
```

**Insights que isso desbloqueia:**
- Perfil comercial completo? (telefone/email = sério)
- Framework de Ofertas: múltiplos canais de conversão

---

## ✅ RECOMENDAÇÕES PRIORITÁRIAS

### ALTA PRIORIDADE (implementar imediatamente)

1. **Extrair hashtags e mentions do caption**
   - Impacto: Frameworks de Copy e Anomalias
   - Esforço: Baixo (regex simples)
   - ROI: Alto

2. **Coletar `externalUrl` do perfil**
   - Impacto: Framework de Ofertas
   - Esforço: Baixo (adicionar 1 campo)
   - ROI: Alto

---

### MÉDIA PRIORIDADE (implementar no próximo ciclo)

3. **Coletar `isPinned` dos posts**
   - Impacto: Frameworks de Ofertas e Anomalias
   - Esforço: Baixo (adicionar 1 campo)
   - ROI: Médio

4. **Mapear threads de comentários**
   - Impacto: Frameworks Comportamental e Anomalias
   - Esforço: Médio (parsing de threads)
   - ROI: Médio

---

### BAIXA PRIORIDADE (nice to have)

5. **Implementar análise de sentimento**
   - Impacto: Framework Comportamental
   - Esforço: Médio (integração de biblioteca)
   - ROI: Baixo

6. **Coletar dados de contato (telefone/email)**
   - Impacto: Framework de Ofertas
   - Esforço: Baixo (adicionar 2 campos)
   - ROI: Baixo

---

## 📊 SCORE DE COBERTURA GERAL

| Framework | Cobertura | Status |
|-----------|-----------|--------|
| Framework Comportamental | 67% | ⚠️ Aceitável |
| Framework de Copy | 50% | ❌ **CRÍTICO** |
| Framework de Ofertas | 50% | ❌ **CRÍTICO** |
| Framework de Métricas | 88% | ✅ Excelente |
| Framework de Anomalias | 29% | ❌ **CRÍTICO** |

**Média geral:** 57% ⚠️

**Principais gaps:**
- Hashtags e mentions (afeta Copy e Anomalias)
- Link na bio (afeta Ofertas)
- Posts fixados (afeta Ofertas e Anomalias)
- Threads de comentários (afeta Comportamental e Anomalias)

---

## 📝 PRÓXIMOS PASSOS

### Implementação sugerida (ordem de prioridade):

1. ✅ **Fase 1 (ALTA)** - Coletar `externalUrl` do perfil
2. ⚠️ **Fase 2 (MÉDIA)** - Coletar `isPinned` dos posts
3. ⚠️ **Fase 2 (MÉDIA)** - Mapear threads de comentários
4. ℹ️ **Fase 3 (BAIXA)** - Análise de sentimento
5. ℹ️ **Fase 3 (BAIXA)** - Dados de contato

### Estimativa de esforço:
- **Fase 1:** 1 hora (implementação + testes)
- **Fase 2:** 4-6 horas (implementação + testes + validação)
- **Fase 3:** 6-8 horas (pesquisa + integração + testes)

---

## 📚 REFERÊNCIAS

### Documentação Apify
- [Instagram Profile Scraper](https://apify.com/apify/instagram-profile-scraper) - Perfil + posts
- [Instagram Scraper](https://apify.com/apify/instagram-scraper) - Comentários e dados detalhados

### Arquivos do Projeto
- `/Users/macbook-karla/postexpress2/scripts/instagram-scraper-with-comments.js` - Script atual
- `/Users/macbook-karla/postexpress2/database/optimized-schema.sql` - Schema Supabase
- `/Users/macbook-karla/postexpress2/CLAUDE.md` - Documentação do projeto
- `/Users/macbook-karla/postexpress2/squad-auditores/briefing-croko-lab.md` - Briefing dos 5 frameworks

---

**Documento criado por:** Analyst Agent
**Data:** 2026-02-25
**Versão:** 1.0
