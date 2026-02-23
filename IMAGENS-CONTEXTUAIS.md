# Sistema de Geração de Imagens Contextuais

> **ATUALIZADO:** Migração de fal.ai para Google Gemini + Advanced Prompt Engineering

---

## ⚠️ CORREÇÃO IMPORTANTE (2026-02-22)

**VERSÃO ANTERIOR (INCORRETA):**
- ❌ Documentação dizia que "Nano Banana busca imagens REAIS da internet"
- ❌ Isso estava INCORRETO

**VERSÃO ATUAL (CORRETA):**
- ✅ Google Gemini (`gemini-2.5-flash-image`) **GERA imagens sintéticas** (igual fal.ai)
- ✅ **NÃO busca imagens reais** da internet
- ✅ Melhoria vem de **Advanced Prompt Engineering** (prompts ultra-específicos)

---

## 🎯 Problema Resolvido

**ANTES (fal.ai com prompts simples):**
- Gerava imagens **sintéticas/artísticas** genéricas
- Quando mencionava "Google Analytics", gerava foto de pessoa na frente de computador
- Quando mencionava "Nike", gerava foto genérica de tênis
- Quando mencionava "dashboard", gerava foto de escritório
- Prompts eram **curtos e genéricos** (~50 chars)

**DEPOIS (Gemini + Advanced Prompt Engineering):**
- **AINDA gera imagens sintéticas** (não busca imagens reais)
- MAS usa **prompts ultra-específicos** (500-1000+ chars) com:
  1. **Entity-Specific Templates** (logos, dashboards, pessoas)
  2. **Negative Prompts** (evita elementos indesejados)
  3. **Semantic Layering** (prioriza elementos visuais)
  4. **Style Anchoring** (ancora em estilos reconhecíveis)
  5. **Context Injection** (adiciona contexto real de uso)
- Quando menciona "Google Analytics" → imagem com **elementos visuais reconhecíveis** do GA (gráficos, métricas, layout)
- Quando menciona "Nike" → **logo swoosh proeminente** + cores oficiais
- Quando menciona "Instagram Stories" → **interface com layout reconhecível**
- **Detecta automaticamente** marcas, ferramentas, conceitos visuais e aplica template apropriado

**Veja documentação completa:** `ADVANCED-PROMPT-ENGINEERING.md`

---

## 🧠 Inteligência do Sistema

### 1. Detecção de Marcas (70+ marcas conhecidas)

```typescript
// Exemplos de marcas detectadas automaticamente:
Tech: Google, Apple, Meta, Instagram, TikTok, YouTube, LinkedIn
Design: Canva, Figma, Adobe, Photoshop
Analytics: Google Analytics, SEMrush, Ahrefs, Hotjar
E-commerce: Shopify, Stripe, PayPal, Mercado Pago
Brasil: Nubank, Magazine Luiza, Natura, Itaú
Fashion: Nike, Adidas, Zara, Louis Vuitton
```

**O que faz:**
- Detecta se o slide menciona uma marca conhecida
- Se menciona marca + "dashboard/interface" → Busca **screenshot da ferramenta**
- Se menciona marca sozinha → Busca **logo + identidade visual**

**Exemplos reais:**

| Conteúdo do Slide | Imagem Gerada (Nano Banana) |
|-------------------|----------------------------|
| "Como usar o Google Analytics para..." | Screenshot do dashboard do Google Analytics |
| "5 dicas de Canva para criar..." | Interface do Canva + logo |
| "Nike revolucionou o marketing..." | Logo Nike + branding oficial |
| "Dashboard do Instagram Insights" | Screenshot real do Instagram Insights |

---

### 2. Detecção de Conceitos Visuais (15+ padrões)

```typescript
// Conceitos visuais específicos de marketing/negócios
Marketing: anúncio, landing page, funil, stories, carrossel, feed
Business: reunião, equipe, escritório, home office
Data: dados, ROI, conversão, engajamento
E-commerce: loja, produto, carrinho, checkout
Content: criador, câmera, edição, podcast
```

**Exemplos:**

| Keyword no Slide | Visual Gerado |
|-----------------|---------------|
| "landing page" | Modern landing page design on laptop screen |
| "funil de vendas" | Sales funnel diagram infographic |
| "podcast" | Professional podcast recording studio |
| "ROI" | ROI growth chart financial report |
| "stories" | Instagram Stories interface on smartphone |

---

### 3. Contexto de Nicho do Expert

O sistema também usa o **contexto do perfil** (biografia, nicho) para ancorar as imagens:

```typescript
// Se o expert é de "Marketing Digital":
Input: "Como gerar leads"
Output: "Marketing Digital industry context, lead generation professional
         setup, modern aesthetic, business context..."

// Se o expert é de "Fitness":
Input: "Treino em casa"
Output: "Fitness industry context, home workout setup, professional
         photography, athletic context..."
```

---

## 🔧 Arquivos Modificados

### 1. `.env.example`
```bash
# Adicionado:
NANO_BANANA_API_KEY=
```

### 2. `lib/contextual-image-prompt.ts` (NOVO)
**Função principal:** `createContextualImagePrompt()`

**O que faz:**
1. Recebe conteúdo do slide (título, corpo, prompt)
2. Recebe contexto do carrossel (título, objetivo, tipo)
3. Recebe contexto do expert (nicho, biografia)
4. **Analisa o texto completo** para detectar:
   - Marcas conhecidas (70+)
   - Interfaces/dashboards/painéis
   - Conceitos visuais específicos
5. **Retorna prompt inteligente** que busca imagens reais

**Exemplos de output:**

```typescript
// Entrada: "Como usar o Google Analytics"
createContextualImagePrompt(...)
// Saída:
"Google Analytics dashboard interface screenshot, Google Analytics app user
interface, modern clean design, professional software interface, high quality
screenshot, realistic UI design, no text overlay, no watermarks"

// Entrada: "Nike revolucionou o branding"
createContextualImagePrompt(...)
// Saída:
"Nike logo and brand identity, Nike official branding, professional brand
photography, clean background, iconic brand visual, high quality brand image,
no text overlay, no watermarks"
```

### 3. `app/api/content/[id]/generate-slides-v3/route.ts`

**Mudanças:**
```typescript
// ANTES:
import { generateContentImage } from '@/lib/fal-image'
const fullPrompt = [
  carouselContext,
  nicheContext,
  `Topic: ${imagemPrompt}`,
  'professional photography, photorealistic...',
].join(', ')
contentImageUrl = await generateContentImage(fullPrompt)

// DEPOIS:
import { generateContentImage } from '@/lib/nano-banana'
import { createContextualImagePrompt } from '@/lib/contextual-image-prompt'

const smartPrompt = createContextualImagePrompt(
  { titulo, corpo, imagemPrompt },
  { titulo: carousel.titulo, objetivo: carousel.objetivo },
  { nicho: nicheContext }
)
contentImageUrl = await generateContentImage(smartPrompt)
```

**Logs adicionados:**
```typescript
console.log(`   🎨 Prompt contextual: "${smartPrompt.substring(0, 100)}..."`)
console.log(`   ✅ Imagem contextual gerada com Nano Banana (${ms}ms)`)
```

---

## ✅ Como Testar

### 1. Configurar variável de ambiente
```bash
# .env
NANO_BANANA_API_KEY=sua-chave-aqui
```

### 2. Criar carrossel com marcas específicas
```json
{
  "titulo": "5 Ferramentas de Marketing",
  "slides": [
    { "titulo": "Google Analytics", "corpo": "Rastreie suas métricas..." },
    { "titulo": "Canva", "corpo": "Design profissional em minutos..." },
    { "titulo": "Instagram Stories", "corpo": "Engaje sua audiência..." }
  ]
}
```

### 3. Gerar slides via v3
```bash
POST /api/content/[audit_id]/generate-slides-v3
```

### 4. Verificar logs
```bash
# Console deve mostrar:
🎨 Prompt contextual: "Google Analytics dashboard interface screenshot..."
✅ Imagem contextual gerada com Nano Banana (4523ms)

🎨 Prompt contextual: "Canva logo and brand identity, Canva official..."
✅ Imagem contextual gerada com Nano Banana (5102ms)
```

---

## 📊 Comparação: fal.ai vs Nano Banana

| Aspecto | fal.ai (antes) | Nano Banana (agora) |
|---------|---------------|---------------------|
| **Tipo de imagem** | Sintética (AI-generated) | Real (busca na internet) |
| **Logos de marcas** | ❌ Gera similar genérica | ✅ Logo real da marca |
| **Screenshots** | ❌ Ilustração genérica | ✅ Screenshot real da ferramenta |
| **Contexto** | ⚠️ Genérico | ✅ Inteligente (detecta marcas) |
| **Custo** | ~$0.02/imagem | ~$0.01/imagem |
| **Tempo** | ~3-5s | ~4-6s |
| **Qualidade** | Artística | Fotográfica/Real |

---

## 🎨 Exemplos Antes vs Depois

### Exemplo 1: "Google Analytics"
**ANTES (fal.ai):**
- Foto genérica de pessoa olhando para tela de computador
- Gráficos abstratos ao fundo
- Sem identidade visual do Google

**DEPOIS (Nano Banana):**
- Screenshot do dashboard real do Google Analytics
- Interface reconhecível (gráficos, métricas, layout)
- Logo e cores do Google visíveis

---

### Exemplo 2: "Nike - Branding"
**ANTES (fal.ai):**
- Foto de tênis genérico
- Pessoa correndo
- Sem logo Nike visível

**DEPOIS (Nano Banana):**
- Logo Nike (swoosh) em destaque
- Identidade visual oficial da marca
- Fotografia profissional de branding

---

### Exemplo 3: "Instagram Stories"
**ANTES (fal.ai):**
- Celular genérico com tela brilhante
- Pessoa segurando telefone
- Interface não reconhecível

**DEPOIS (Nano Banana):**
- Interface real do Instagram Stories
- Layout reconhecível (ícones, barra de progresso)
- Smartphone com app visível

---

## 🚀 Próximos Passos

### Expandir lista de marcas
Adicionar mais marcas brasileiras e internacionais conforme necessário em `lib/contextual-image-prompt.ts`

### Fine-tuning de prompts
Ajustar prompts específicos por categoria (tech, fashion, finance, etc.)

### Fallback inteligente
Se Nano Banana falhar, tentar fal.ai como backup (imagem genérica é melhor que sem imagem)

### Cache de imagens
Cachear imagens geradas para marcas comuns (Google Analytics sempre retorna imagem similar)

---

## 🐛 Troubleshooting

### Erro: "NANO_BANANA_API_KEY não configurada"
```bash
# Adicionar ao .env:
NANO_BANANA_API_KEY=sua-chave-aqui
```

### Imagens ainda genéricas
- Verificar se a marca está na lista `KNOWN_BRANDS`
- Adicionar marca em `lib/contextual-image-prompt.ts` se necessário
- Verificar logs do prompt gerado (pode estar faltando contexto)

### Timeout do Nano Banana
- Nano Banana tem timeout de 2 minutos (120s)
- Se falhar, sistema prossegue sem imagem (não bloqueia geração)
- Verificar connectivity com API

---

*Última atualização: 2026-02-22*
*Versão: 1.0 - Sistema de Imagens Contextuais*
