# Advanced Prompt Engineering para Gemini Image Generation

> **Problema resolvido:** Imagens genéricas e fora de contexto
> **Solução:** Prompts ultra-específicos com 5 técnicas avançadas

---

## 🎯 O Problema Original

**ANTES (prompts simples):**
```typescript
// Prompt genérico
"Google Analytics, professional photography, high quality, modern aesthetic"

// Resultado: foto genérica de pessoa olhando para computador ❌
```

**DEPOIS (advanced prompt engineering):**
```typescript
// Prompt ultra-específico com template
createDashboardInterfacePrompt("Google Analytics")

// Resultado: imagem com elementos visuais reconhecíveis do GA ✅
// - Gráficos e métricas visíveis
// - Layout do dashboard reconhecível
// - Cores e branding do Google
```

---

## 🧠 5 Técnicas Implementadas

### 1. **Entity-Specific Templates**
Templates especializados por tipo de entidade detectada.

| Tipo de Entidade | Template | Resultado Esperado |
|------------------|----------|-------------------|
| **Marca (logo)** | `createBrandLogoPrompt()` | Logo oficial + cores da marca + fundo limpo |
| **Dashboard/Interface** | `createDashboardInterfacePrompt()` | Screenshot realista da interface + UI reconhecível |
| **Pessoa Famosa** | `createPersonPortraitPrompt()` | Foto profissional estilo keynote/headshot |
| **Conceito Marketing** | `createMarketingConceptPrompt()` | Fotografia comercial do conceito |
| **Produto** | `createProductPrompt()` | Fotografia de produto profissional |

**Exemplo:**
```typescript
// Detectou "Nike" → usa createBrandLogoPrompt("Nike")
// Prompt gerado:
"Ultra-realistic photograph of Nike official logo and brand identity.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. Nike logo prominent and centered (exact official design)
2. Brand colors (use EXACT official color palette)
3. Clean white or subtle gradient background
4. Professional product photography lighting
5. Sharp focus on logo details
..."
```

---

### 2. **Negative Prompts**
Especifica o que **EVITAR** na imagem.

```typescript
NEGATIVE_PROMPTS = {
  generic: ['generic stock photo', 'random people', 'unrelated objects'],
  technical: ['blurry', 'low quality', 'pixelated', 'watermarks'],
  style: ['cartoon', 'illustration', 'drawing', '3D render'],
}
```

**Impacto:**
- **ANTES:** Gemini podia gerar cartoon, ilustração, imagem borrada
- **DEPOIS:** Prompts incluem "AVOID: cartoon, illustration, blurry..."

---

### 3. **Semantic Layering**
Organiza prompt em camadas de prioridade (essencial → desejável).

```typescript
const layers: SemanticLayers = {
  essential: ['Google Analytics dashboard', 'metrics visible', 'charts and graphs'],
  important: ['modern UI design', 'recognizable layout', 'Google branding'],
  desirable: ['professional screenshot', 'natural lighting', 'laptop display'],
  avoid: ['generic dashboard', 'wrong brand', 'blurry', 'low quality'],
}

// Prompt final:
"ESSENTIAL ELEMENTS: Google Analytics dashboard, metrics visible, charts and graphs.
IMPORTANT DETAILS: modern UI design, recognizable layout, Google branding.
ADDITIONAL QUALITY: professional screenshot, natural lighting, laptop display.
AVOID: generic dashboard, wrong brand, blurry, low quality"
```

**Benefício:** Gemini prioriza elementos essenciais primeiro.

---

### 4. **Style Anchoring**
Ancora em estilos visuais reconhecíveis (ex: "estilo Apple", "estilo TED Talks").

```typescript
STYLE_ANCHORS = {
  brandCommercial: 'commercial brand photography in the style of Apple product launches',
  softwareUI: 'application interface screenshot in the style of SaaS product demos',
  keynotePortrait: 'conference photography in the style of TED Talks',
  marketingEditorial: 'editorial photography in the style of HubSpot blog headers',
}
```

**Exemplo:**
```typescript
// Carrossel tipo "vendas" → usa STYLE_ANCHORS.brandCommercial
// Carrossel tipo "educacional" → usa STYLE_ANCHORS.softwareUI
```

---

### 5. **Context Injection**
Injeta contexto real de uso (indústria, caso de uso, público-alvo).

```typescript
injectRealWorldContext(basePrompt, {
  industry: 'Marketing Digital',
  useCase: 'educacional',
  target: 'empreendedores iniciantes',
})

// Prompt final:
"[prompt base]... REAL-WORLD CONTEXT: Industry context: Marketing Digital,
Use case: educacional, Target audience: empreendedores iniciantes"
```

**Benefício:** Imagens mais alinhadas com o nicho do expert.

---

## 📁 Arquivos Modificados

### 1. `lib/advanced-prompt-templates.ts` (NOVO)
Contém todos os templates especializados e funções de prompt engineering.

**Funções principais:**
- `createBrandLogoPrompt(brandName)` - Template para logos
- `createDashboardInterfacePrompt(toolName)` - Template para dashboards
- `createPersonPortraitPrompt(personName)` - Template para pessoas
- `createMarketingConceptPrompt(concept, visual)` - Template para conceitos
- `buildSemanticPrompt(layers)` - Construtor de semantic layers
- `injectRealWorldContext(prompt, context)` - Injeta contexto real

---

### 2. `lib/contextual-image-prompt.ts` (REFATORADO)
Função principal `createContextualImagePrompt()` agora usa os templates avançados.

**Fluxo de decisão:**
```
fullText (título + corpo + prompt)
  ↓
Detectar Pessoas? → createPersonPortraitPrompt()
  ↓
Detectar Marca + Interface? → createDashboardInterfacePrompt()
  ↓
Detectar Marca (só logo)? → createBrandLogoPrompt()
  ↓
Detectar Conceito Visual? → createMarketingConceptPrompt() + Style Anchor
  ↓
Fallback → buildSemanticPrompt() + Context Injection
```

**Logs adicionados:**
```
🎯 DETECTED: Brand Logo → Nike
📸 Using: BrandLogoPrompt template
```

---

## 🧪 Como Testar

### Teste 1: Logo de Marca
```json
{
  "titulo": "Nike: Branding Icônico",
  "corpo": "Como a Nike construiu uma marca bilionária"
}
```

**Esperado:**
- ✅ Logo Nike (swoosh) proeminente e centralizado
- ✅ Cores oficiais da Nike (preto, branco, ou laranja)
- ✅ Fundo limpo (branco ou gradiente sutil)
- ❌ NÃO: foto genérica de tênis, pessoa correndo

---

### Teste 2: Dashboard de Ferramenta
```json
{
  "titulo": "Como usar o Google Analytics",
  "corpo": "Análise de métricas e KPIs no dashboard"
}
```

**Esperado:**
- ✅ Interface do Google Analytics reconhecível
- ✅ Gráficos, métricas, charts visíveis
- ✅ Layout do GA (sidebar, top bar)
- ✅ Cores do Google (azul, branco)
- ❌ NÃO: dashboard genérico, interface de outra ferramenta

---

### Teste 3: Pessoa Famosa
```json
{
  "titulo": "Lições de Gary Vaynerchuk",
  "corpo": "Estratégias de marketing digital do Gary Vee"
}
```

**Esperado:**
- ✅ Foto profissional de Gary Vaynerchuk reconhecível
- ✅ Estilo keynote/conference (terno, palco, ou headshot)
- ✅ Expressão confiante e engajada
- ❌ NÃO: pessoa genérica, random businessman

---

### Teste 4: Conceito de Marketing
```json
{
  "titulo": "Funil de Vendas",
  "corpo": "Otimizando cada etapa do funil"
}
```

**Esperado:**
- ✅ Representação visual de funil (diagrama, infográfico)
- ✅ Contexto de marketing/negócios
- ✅ Fotografia profissional e moderna
- ❌ NÃO: foto genérica de escritório

---

## 📊 Comparação: Antes vs Depois

### Exemplo: "Google Analytics"

**ANTES (prompt simples):**
```
Prompt: "Google Analytics, professional photography, high quality, modern aesthetic"

Resultado:
- Foto genérica de pessoa olhando para computador
- Gráficos abstratos ao fundo
- Sem identidade visual do Google
- SCORE: 3/10 ❌
```

**DEPOIS (advanced prompt engineering):**
```
Prompt: "Ultra-realistic screenshot photograph of Google Analytics application dashboard...
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. Google Analytics dashboard UI with recognizable layout
2. Data visualizations: charts, graphs, metrics, KPIs visible
3. Google Analytics branding: logo, colors, typography
..."

Resultado esperado:
- Interface do GA reconhecível
- Métricas e gráficos visíveis
- Cores e branding do Google
- Layout profissional
- SCORE: 8/10 ✅
```

---

## 🎨 Exemplos de Prompts Gerados

### 1. Brand Logo (Nike)
```
Ultra-realistic photograph of Nike official logo and brand identity.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. Nike logo prominent and centered (exact official design)
2. Brand colors (use EXACT official color palette)
3. Clean white or subtle gradient background
4. Professional product photography lighting
5. Sharp focus on logo details

STYLE SPECIFICATIONS:
- Photography style: Commercial brand photography
- Lighting: Studio lighting, soft shadows
- Composition: Logo fills 60-80% of frame
- Color accuracy: Match official brand guidelines exactly
- Focus: Razor-sharp on logo edges

NEGATIVE (AVOID):
generic stock photo, random people, unrelated objects, blurry, low quality, pixelated,
cartoon, illustration, people in frame, fake logo, modified logo
```

---

### 2. Dashboard Interface (Google Analytics)
```
Ultra-realistic screenshot photograph of Google Analytics application dashboard interface.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. Google Analytics dashboard UI with recognizable layout and design patterns
2. Data visualizations: charts, graphs, metrics, KPIs visible
3. Google Analytics branding: logo, colors, typography consistent with real app
4. Clean modern UI design with proper spacing and hierarchy
5. Realistic data displays (not just placeholder)

STYLE SPECIFICATIONS:
- Photography style: High-quality screen capture
- Display: Modern laptop or desktop monitor showing the interface
- Lighting: Natural office lighting on screen
- Resolution: Sharp, crisp UI elements
- Perspective: Straight-on view or slight angle (15-30 degrees)

INTERFACE DETAILS:
- Navigation menu visible (sidebar or top bar)
- Multiple data widgets/cards showing metrics
- Color scheme matching Google Analytics official design
- Professional dashboard aesthetic (not cluttered)

NEGATIVE (AVOID):
generic stock photo, blurry, low quality, empty dashboard, placeholder data only,
wrong brand colors, generic analytics dashboard, unrelated software interface
```

---

### 3. Person Portrait (Gary Vaynerchuk)
```
Ultra-realistic professional portrait photograph of Gary Vaynerchuk.
VISUAL ELEMENTS (IN ORDER OF PRIORITY):
1. Gary Vaynerchuk face clearly recognizable
2. Professional business attire or signature style
3. Clean background (solid color, gradient, or subtle office)
4. Confident, approachable expression
5. Professional headshot or keynote speaking pose

STYLE SPECIFICATIONS:
- Photography style: Corporate headshot or conference photography
- Lighting: Professional studio lighting or keynote stage lighting
- Composition: Head and shoulders prominent (fills 70% of frame)
- Focus: Sharp focus on eyes and face
- Background: Blurred or plain (subject isolation)

CONTEXT CLUES:
- Setting: Business conference, keynote stage, or professional studio
- Posture: Confident, engaged, speaking or presenting
- Expression: Authentic Gary Vaynerchuk signature expression

NEGATIVE (AVOID):
generic stock photo, blurry, low quality, wrong person, generic businessman,
random person, paparazzi photo, casual snapshot
```

---

## 🚀 Melhorias Futuras

### Fase 2: Fine-Tuning por Feedback
- Coletar imagens geradas e avaliar qualidade
- Ajustar templates baseado em resultados reais
- A/B test de diferentes variações de prompts

### Fase 3: Expandir Banco de Entidades
- Adicionar mais marcas brasileiras (100+)
- Adicionar mais pessoas famosas (influencers BR)
- Adicionar ferramentas de nicho (ex: Hotmart, Eduzz)

### Fase 4: Dynamic Prompt Optimization
- Usar Claude para analisar slide e gerar prompt customizado
- Combinar detecção de entidades + análise semântica via LLM

---

## 🐛 Troubleshooting

### Imagens ainda genéricas?

**Possíveis causas:**

1. **Marca/pessoa não está na lista** → Adicionar em `contextual-image-prompt.ts`
   ```typescript
   const KNOWN_BRANDS = [
     // Adicionar marca aqui
     'Sua Marca',
   ]
   ```

2. **Gemini não reconhece a marca** → Usar template mais específico
   - Adicionar exemplos visuais no prompt
   - Descrever logo/branding em detalhes

3. **Prompt muito longo** → Simplificar semantic layers
   - Reduzir "desirable" items
   - Focar só em "essential" e "important"

4. **Style anchor conflitante** → Ajustar style anchor por tipo
   ```typescript
   function getStyleAnchorForCarouselType(tipo?: string): string {
     // Personalizar mapeamento
   }
   ```

---

### Como debugar prompts gerados?

**Ativar logs detalhados:**

```bash
# No terminal onde roda npm run dev:
# Os logs mostrarão:
🧠 === SMART IMAGE PROMPT GENERATION ===
   Input - Título: "..."
   🎯 DETECTED: Brand Logo → Nike
   📸 Using: BrandLogoPrompt template
   ✅ Generated Prompt (1234 chars)
   Preview: "Ultra-realistic photograph of Nike..."
🧠 === END ===
```

**Verificar prompt completo:**
- Copiar o preview do log
- Avaliar se tem todos os elementos necessários
- Ajustar template se necessário

---

## 📈 Métricas de Sucesso

**KPIs para avaliar melhoria:**

| Métrica | Antes | Meta |
|---------|-------|------|
| Logos reconhecíveis | 20% | 70%+ |
| Dashboards com UI correta | 10% | 60%+ |
| Pessoas reconhecíveis | 5% | 50%+ |
| Contexto correto | 40% | 85%+ |
| Qualidade geral (1-10) | 4.5 | 7.5+ |

**Como medir:**
1. Gerar 50 slides com entidades conhecidas
2. Avaliar manualmente cada imagem (1-10)
3. Calcular % de acertos por categoria

---

*Última atualização: 2026-02-22*
*Versão: 1.0 - Advanced Prompt Engineering Implementation*
