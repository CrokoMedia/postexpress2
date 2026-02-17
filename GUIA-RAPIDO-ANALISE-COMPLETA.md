# 🚀 Guia Rápido - Análise Completa de Instagram

Sistema completo para extrair posts, comentários e texto das imagens do Instagram.

---

## ⚡ Uso Rápido (1 comando)

### Pipeline Completo (Recomendado)

```bash
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=10
```

**Resultado:**
- ✅ Posts extraídos
- ✅ Comentários categorizados (perguntas, elogios, dúvidas)
- ✅ Texto das imagens (OCR)
- ✅ Relatório markdown completo

**Arquivos gerados:**
- `squad-auditores/data/{username}-complete-analysis.json`
- `squad-auditores/output/auditoria-{username}.md`

---

## 🎯 Casos de Uso

### 1. Gerar Caixinhas de Perguntas

**Objetivo:** Extrair perguntas dos comentários para criar conteúdo

```bash
node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=20
```

**O que você recebe:**
- Comentários categorizados por tipo (perguntas, elogios, dúvidas)
- Filtro automático de spam
- Top perguntas para criar posts

**Onde usar:**
- Criar caixinhas de perguntas
- Identificar dúvidas recorrentes
- Gerar ideias de conteúdo

---

### 2. Auditar Carrosséis (OCR)

**Objetivo:** Extrair texto dos slides para análise

```bash
node scripts/ocr-image-analyzer.js rodrigogunter_
```

**O que você recebe:**
- Texto completo de cada slide
- Estrutura do conteúdo (título → bullets → CTA)
- Tipo de conteúdo (educacional, vendas, etc)
- CTAs identificados

**Onde usar:**
- Auditar qualidade dos textos
- Analisar estrutura de carrosséis
- Comparar com concorrentes
- Identificar padrões de posts virais

---

### 3. Análise Completa de Concorrente

**Objetivo:** Auditoria 360° de um perfil

```bash
node scripts/complete-post-analyzer.js concorrente --limit=15
```

**O que você recebe:**
- Posts + legendas
- Comentários + perguntas do público
- Texto dos slides (OCR)
- Relatório markdown completo
- Métricas de engajamento

**Onde usar:**
- Análise de concorrentes
- Pesquisa de mercado
- Identificar padrões de sucesso
- Copiar estruturas que funcionam

---

## 📊 Estrutura dos Dados

### Posts com Comentários
```json
{
  "caption": "Legenda do post...",
  "likesCount": 4658,
  "commentsCount": 86,
  "url": "https://instagram.com/p/...",
  "comments": {
    "total": 86,
    "relevant": 45,
    "categorized": {
      "perguntas": [
        { "text": "Como faço isso?", "ownerUsername": "usuario123" }
      ],
      "elogios": [...],
      "duvidas": [...],
      "experiencias": [...]
    }
  }
}
```

### OCR das Imagens
```json
{
  "ocr": {
    "totalImages": 3,
    "images": [
      {
        "analysis": {
          "texto_completo": "Todo o texto do slide",
          "titulo": "Título Principal",
          "bullets": ["Item 1", "Item 2"],
          "cta": "Siga para mais dicas!",
          "tipo": "educacional"
        }
      }
    ]
  }
}
```

---

## ⚙️ Opções de Linha de Comando

### Scraper de Comentários
```bash
node scripts/instagram-scraper-with-comments.js <username> [opções]
```

**Opções:**
- `--limit=N` - Número de posts (padrão: 20)
- `--comments-per-post=N` - Comentários por post (padrão: 50)

**Exemplos:**
```bash
# 10 posts, 30 comentários por post
node scripts/instagram-scraper-with-comments.js frankcosta --limit=10 --comments-per-post=30
```

---

### Analisador OCR
```bash
node scripts/ocr-image-analyzer.js <username> [opções]
```

**Opções:**
- `--source=<arquivo>` - Arquivo JSON fonte

**Exemplos:**
```bash
# Analisar a partir de arquivo específico
node scripts/ocr-image-analyzer.js rodrigogunter_ --source=posts-with-comments
```

---

### Pipeline Completo
```bash
node scripts/complete-post-analyzer.js <username> [opções]
```

**Opções:**
- `--limit=N` - Número de posts (padrão: 10)
- `--skip-ocr` - Pular OCR (mais rápido)

**Exemplos:**
```bash
# Análise completa de 5 posts (sem OCR, mais rápido)
node scripts/complete-post-analyzer.js frankcosta --limit=5 --skip-ocr

# Análise completa de 15 posts (com OCR)
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=15
```

---

## ⏱️ Tempo de Execução

| Script | Posts | Tempo Estimado |
|--------|-------|----------------|
| Scraper com Comentários | 10 | ~5-8 minutos |
| OCR (Claude Vision) | 10 posts (30 imagens) | ~2-4 minutos |
| Pipeline Completo | 10 | ~7-12 minutos |

**Nota:** Tempo varia com limite de API e velocidade da internet.

---

## 🎯 Workflow Recomendado

### Para Criar Conteúdo a partir de Comentários

1. **Extrair comentários:**
   ```bash
   node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=20
   ```

2. **Abrir arquivo gerado:**
   ```
   squad-auditores/data/rodrigogunter_-posts-with-comments.json
   ```

3. **Filtrar perguntas:**
   - Procurar por `comments.categorized.perguntas`
   - Pegar as 10 perguntas mais curtidas
   - Criar caixinhas de perguntas com essas dúvidas

---

### Para Auditar Concorrente

1. **Pipeline completo:**
   ```bash
   node scripts/complete-post-analyzer.js concorrente --limit=15
   ```

2. **Analisar relatório:**
   ```
   squad-auditores/output/auditoria-concorrente.md
   ```

3. **Identificar padrões:**
   - Posts com mais engajamento
   - Estrutura dos slides (OCR)
   - Perguntas do público
   - CTAs que funcionam

---

## 🔑 Pré-requisitos

### 1. Dependências
```bash
npm install apify-client @anthropic-ai/sdk dotenv
```

### 2. Variáveis de Ambiente (.env)
```env
APIFY_API_TOKEN=apify_api_...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Obter Tokens
- **Apify:** https://console.apify.com/account/integrations
- **Anthropic:** https://console.anthropic.com/settings/keys

---

## 📁 Estrutura de Arquivos

```
postexpress2/
├── scripts/
│   ├── instagram-scraper-with-comments.js  # Scraper + comentários
│   ├── ocr-image-analyzer.js                # OCR com Claude
│   └── complete-post-analyzer.js            # Pipeline completo
│
├── squad-auditores/
│   ├── data/                                 # JSONs gerados
│   │   ├── {username}-posts-with-comments.json
│   │   ├── {username}-ocr-analysis.json
│   │   └── {username}-complete-analysis.json
│   │
│   └── output/                               # Relatórios
│       └── auditoria-{username}.md
```

---

## 💡 Dicas

### Performance
- Use `--skip-ocr` se não precisar de texto das imagens
- Limite de 10-15 posts para análises rápidas
- OCR consome créditos da API Claude

### Qualidade
- Perfis públicos funcionam melhor
- Posts com muitos comentários levam mais tempo
- OCR funciona melhor com imagens de alta qualidade

### Automação
- Crie scripts bash para rodar múltiplos perfis
- Use cron jobs para auditorias periódicas
- Salve resultados em banco de dados

---

## 🐛 Troubleshooting

### Erro: "ANTHROPIC_API_KEY is not defined"
```bash
# Verifique o .env
cat .env | grep ANTHROPIC
```

### Erro: "Actor failed"
- Instagram pode estar bloqueando temporariamente
- Tente novamente em alguns minutos
- Verifique se o perfil é público

### Comentários vazios
- Alguns posts desabilitam comentários
- Posts muito antigos podem não ter comentários extraíveis
- Perfis com poucos seguidores têm menos comentários

---

## 🎉 Pronto!

Agora você tem um sistema completo para:
- ✅ Extrair comentários e identificar perguntas
- ✅ Fazer OCR de imagens de posts
- ✅ Auditar concorrentes completos
- ✅ Gerar relatórios automáticos

**Próximos passos:**
1. Teste com um perfil pequeno primeiro
2. Ajuste os limites conforme necessário
3. Integre com seu workflow de criação de conteúdo
