# 🎯 Sistema Completo de Análise do Instagram

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

Sistema completo para extração de dados do Instagram com:
- 💬 Comentários categorizados
- 🔍 OCR de imagens (texto dos slides)
- 📊 Pipeline integrado
- 📄 Relatórios automáticos

---

## 🚀 3 Novos Scripts Implementados

### 1. `instagram-scraper-with-comments.js`
**Função:** Extrai posts + comentários categorizados

**Uso:**
```bash
node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=20
```

**O que faz:**
- ✅ Extrai posts do perfil
- ✅ Extrai comentários de cada post
- ✅ Filtra spam automaticamente
- ✅ Categoriza em: perguntas, elogios, dúvidas, experiências

**Saída:** `squad-auditores/data/{username}-posts-with-comments.json`

**Use para:**
- Criar caixinhas de perguntas
- Identificar dúvidas do público
- Gerar ideias de conteúdo

---

### 2. `ocr-image-analyzer.js`
**Função:** Extrai texto das imagens usando Claude Vision

**Uso:**
```bash
node scripts/ocr-image-analyzer.js rodrigogunter_
```

**O que faz:**
- ✅ Analisa todas as imagens dos posts
- ✅ Extrai texto completo (títulos, bullets, CTAs)
- ✅ Identifica estrutura do conteúdo
- ✅ Classifica tipo (educacional, vendas, viral)

**Saída:** `squad-auditores/data/{username}-ocr-analysis.json`

**Use para:**
- Auditar textos dos slides
- Comparar com concorrentes
- Analisar estruturas de carrosséis
- Identificar padrões de sucesso

---

### 3. `complete-post-analyzer.js` ⭐ RECOMENDADO
**Função:** Pipeline completo - tudo em 1 comando

**Uso:**
```bash
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=10
```

**O que faz:**
1. ✅ Scraping de posts
2. ✅ Extração de comentários
3. ✅ OCR das imagens
4. ✅ Geração de relatório markdown

**Saídas:**
- `squad-auditores/data/{username}-complete-analysis.json` - Dados completos
- `squad-auditores/output/auditoria-{username}.md` - Relatório formatado

**Use para:**
- Auditoria completa de perfil
- Análise de concorrentes
- Pesquisa de mercado

---

## 📊 Dados Extraídos

### Por Post:
```
┌─────────────────────────────────────────┐
│ POST                                    │
├─────────────────────────────────────────┤
│ • Legenda                               │
│ • Likes, comentários                    │
│ • Data de publicação                    │
│ • URL                                   │
├─────────────────────────────────────────┤
│ COMENTÁRIOS                             │
├─────────────────────────────────────────┤
│ • ❓ Perguntas (filtradas)              │
│ • 💚 Elogios                             │
│ • 🤔 Dúvidas                             │
│ • 💬 Experiências pessoais               │
├─────────────────────────────────────────┤
│ OCR (TEXTO DAS IMAGENS)                 │
├─────────────────────────────────────────┤
│ • Texto completo                        │
│ • Títulos e subtítulos                  │
│ • Bullets                               │
│ • CTAs                                  │
│ • Tipo de conteúdo                      │
│ • Estrutura visual                      │
└─────────────────────────────────────────┘
```

---

## ⚡ Casos de Uso

### 1. Criar Conteúdo a partir de Comentários
```bash
# Extrair perguntas do público
node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=20
```

**Resultado:** Lista de perguntas categorizadas para criar:
- Caixinhas de perguntas
- Posts de FAQ
- Stories com enquetes

---

### 2. Auditar Carrosséis de Concorrentes
```bash
# Extrair texto dos slides
node scripts/ocr-image-analyzer.js concorrente
```

**Resultado:** Análise de:
- Estrutura dos slides (título → bullets → CTA)
- CTAs utilizados
- Padrões de conteúdo educacional vs vendas
- Elementos visuais

---

### 3. Análise Completa de Perfil
```bash
# Pipeline completo
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=15
```

**Resultado:** Relatório markdown com:
- Métricas de engajamento
- Top perguntas do público
- Texto dos slides
- Análise post por post

---

## 🎯 Workflow Recomendado

### Para Criar Caixinhas de Perguntas

1. **Extrair dados:**
   ```bash
   node scripts/complete-post-analyzer.js rodrigogunter_ --limit=20
   ```

2. **Abrir relatório:**
   ```
   squad-auditores/output/auditoria-rodrigogunter_.md
   ```

3. **Seção "Top Perguntas dos Comentários":**
   - Pegar as 10 primeiras perguntas
   - Criar caixinhas de perguntas no Canva
   - Responder nos Stories

---

### Para Auditar Concorrente

1. **Análise completa:**
   ```bash
   node scripts/complete-post-analyzer.js concorrente --limit=15
   ```

2. **Analisar:**
   - Posts com mais engajamento
   - Estrutura dos carrosséis (OCR)
   - Perguntas do público
   - CTAs que funcionam

3. **Aplicar no seu conteúdo:**
   - Copiar estruturas de sucesso
   - Responder perguntas similares
   - Adaptar CTAs efetivos

---

## 📦 Dependências

### Instaladas:
- ✅ `apify-client` - Scraping do Instagram
- ✅ `@anthropic-ai/sdk` - Claude Vision (OCR)
- ✅ `dotenv` - Variáveis de ambiente

### Configuração (.env):
```env
APIFY_API_TOKEN=apify_api_DQldil0xAhBSMVz46VSAVk3cinxQjo4DTOMv
ANTHROPIC_API_KEY=sk-ant-api03-1h4z6eP_3RWQHmESjzdwpBoiJb6x1n7k_...
```

✅ Ambas as chaves já estão configuradas!

---

## 📁 Arquivos Criados

### Scripts:
```
scripts/
├── instagram-scraper-with-comments.js   (NOVO)
├── ocr-image-analyzer.js                (NOVO)
└── complete-post-analyzer.js            (NOVO)
```

### Documentação:
```
├── GUIA-RAPIDO-ANALISE-COMPLETA.md      (NOVO)
├── SISTEMA-ANALISE-INSTAGRAM.md         (NOVO - este arquivo)
├── GUIA-SCRAPER-INSTAGRAM.md            (ATUALIZADO)
└── scripts/README.md                     (ATUALIZADO)
```

---

## ⏱️ Tempo de Execução

| Operação | Posts | Tempo Estimado |
|----------|-------|----------------|
| Scraping básico | 10 | ~2 min |
| Comentários | 10 | ~5-8 min |
| OCR (30 imagens) | 10 | ~2-4 min |
| **Pipeline completo** | **10** | **~7-12 min** |

---

## 🎨 Exemplo de Relatório Gerado

```markdown
# 📊 Auditoria Completa - @rodrigogunter_

**Data:** 16/02/2026

---

## 📈 Métricas Gerais

- **Posts analisados:** 10
- **Total de likes:** 45,328
- **Total de comentários:** 234
- **Perguntas identificadas:** 47
- **Média de likes/post:** 4,532

---

## 💬 Top Perguntas dos Comentários

1. **"Como faço para começar no marketing digital?"** - @usuario123
2. **"Qual ferramenta você usa para criar os slides?"** - @maria_silva
3. **"Onde posso aprender mais sobre vendas?"** - @joao_empresario
...

---

## 📝 Análise dos Posts

### Post 1: Sidecar

- **URL:** https://instagram.com/p/DNiTwMrOQDs/
- **Likes:** 4,658
- **Comentários:** 86

**Texto extraído (OCR):**

Slide 1:
> 5 PASSOS PARA VENDER MAIS
> 1. Conheça seu público
> 2. Crie oferta irresistível
> ...

**Perguntas neste post:**
- "Como identificar meu público-alvo?" - @empreendedor99
- "Qual é o melhor horário para postar?" - @marketing_pro
...
```

---

## 🚀 Próximos Passos

### 1. Testar o Sistema
```bash
# Teste rápido (5 posts, sem OCR)
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=5 --skip-ocr
```

### 2. Análise Completa
```bash
# Análise completa (10 posts)
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=10
```

### 3. Usar os Dados

**Para criar conteúdo:**
- Abrir `squad-auditores/output/auditoria-rodrigogunter_.md`
- Pegar top 10 perguntas
- Criar caixinhas de perguntas

**Para auditar concorrente:**
- Rodar análise completa
- Analisar estrutura dos slides (OCR)
- Identificar padrões de engajamento
- Adaptar estratégias

---

## 💡 Dicas

### Performance
- ⚡ Use `--skip-ocr` para análises rápidas
- ⚡ Limite a 10-15 posts inicialmente
- ⚡ OCR consome créditos da API Claude

### Qualidade
- 🎯 Perfis públicos funcionam melhor
- 🎯 Posts com mais comentários levam mais tempo
- 🎯 OCR funciona melhor com imagens de alta qualidade

### Automação
- 🤖 Crie scripts bash para múltiplos perfis
- 🤖 Use cron jobs para auditorias periódicas
- 🤖 Integre com banco de dados

---

## 📞 Suporte

### Documentação Completa:
- `GUIA-RAPIDO-ANALISE-COMPLETA.md` - Guia de uso
- `GUIA-SCRAPER-INSTAGRAM.md` - Detalhes técnicos
- `scripts/README.md` - Referência de scripts

### Troubleshooting:
Consulte a seção "Troubleshooting" no `GUIA-RAPIDO-ANALISE-COMPLETA.md`

---

## ✅ Status: PRONTO PARA USO!

Todos os scripts foram:
- ✅ Implementados
- ✅ Testados (sintaxe)
- ✅ Documentados

**Próximo comando:**
```bash
node scripts/complete-post-analyzer.js rodrigogunter_ --limit=10
```

🎉 **Sistema completo pronto para gerar conteúdo a partir de comentários e auditar concorrentes!**
