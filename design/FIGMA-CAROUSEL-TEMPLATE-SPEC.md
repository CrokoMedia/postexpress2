# 🎨 Croko Labs - Carousel Template Specification

> Template profissional de carrosséis para Instagram/LinkedIn
> Otimizado para Figma MCP + Code Connect

---

## 📐 Canvas Setup

### Artboard Principal
- **Nome:** `Croko Labs Carousel Templates`
- **Frame size:** 1080x1080px (formato Instagram padrão)
- **Background:** #FFFFFF
- **Grid:** 8px grid system
- **Safe area:** 80px margin (evita corte em feeds)

---

## 🎨 Design Tokens (Variables no Figma)

### Colors

```
// Primary Palette
--color-primary-500: #8B5CF6    (Purple principal)
--color-primary-600: #7C3AED    (Purple escuro)
--color-primary-100: #EDE9FE    (Purple claro)

// Neutral Palette
--color-neutral-900: #18181B    (Texto principal)
--color-neutral-700: #3F3F46    (Texto secundário)
--color-neutral-500: #71717A    (Texto terciário)
--color-neutral-100: #F4F4F5    (Background sutil)
--color-neutral-50:  #FAFAFA    (Background claro)

// Semantic Colors
--color-success:  #10B981       (Green - métricas positivas)
--color-warning:  #F59E0B       (Amber - alertas)
--color-error:    #EF4444       (Red - problemas)

// Gradient (para backgrounds premium)
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)
--gradient-dark: linear-gradient(180deg, #18181B 0%, #27272A 100%)
```

### Typography

```
// Font Family
--font-sans: "Inter"           (corpo do texto)
--font-display: "Inter"        (títulos, pode trocar por Satoshi/Cabinet Grotesk)

// Font Sizes
--text-xs:   12px / 16px      (captions, metadados)
--text-sm:   14px / 20px      (corpo secundário)
--text-base: 16px / 24px      (corpo principal)
--text-lg:   18px / 28px      (subtítulos)
--text-xl:   20px / 28px      (títulos pequenos)
--text-2xl:  24px / 32px      (títulos médios)
--text-3xl:  30px / 36px      (títulos grandes)
--text-4xl:  36px / 40px      (hero titles)
--text-5xl:  48px / 1         (números grandes, KPIs)

// Font Weights
--font-normal:    400
--font-medium:    500
--font-semibold:  600
--font-bold:      700
--font-extrabold: 800
```

### Spacing

```
--spacing-1:  8px
--spacing-2:  16px
--spacing-3:  24px
--spacing-4:  32px
--spacing-5:  40px
--spacing-6:  48px
--spacing-8:  64px
--spacing-10: 80px
```

### Border Radius

```
--radius-sm:  8px    (cards, badges)
--radius-md:  12px   (buttons, containers)
--radius-lg:  16px   (panels, modais)
--radius-xl:  24px   (hero sections)
--radius-full: 9999px (avatars, pills)
```

### Shadows

```
--shadow-sm:  0 1px 2px 0 rgba(0,0,0,0.05)
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1)
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1)
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1)
```

---

## 🧩 Component Structure

### 1. SlideBase (Auto Layout)
**Base para todos os slides**

```
Frame: 1080x1080px
Padding: 80px (safe area)
Fill: --color-neutral-50
Corner Radius: 0

Children (Auto Layout Vertical):
├─ Header (Auto Layout Horizontal)
│  ├─ Logo Badge (40x40px, --color-primary-500)
│  └─ Brand Text "Croko Labs" (--text-sm, --font-semibold)
│
├─ Content Area (Flex: 1, varies by type)
│
└─ Footer (Auto Layout Horizontal)
   ├─ Username "@postexpress" (--text-xs, --color-neutral-500)
   └─ Slide Number "1/10" (--text-xs, --color-neutral-500)
```

---

### 2. SlideCover (Variante de SlideBase)
**Slide de abertura do carrossel**

```
Content Area:
├─ Hero Title (Auto Layout Vertical, center aligned)
│  ├─ Kicker "AUDITORIA PROFISSIONAL" (--text-xs, --color-primary-600, uppercase)
│  ├─ Main Title (--text-4xl, --font-bold, --color-neutral-900)
│  │  "Como Transformar Seu Instagram em Máquina de Vendas"
│  └─ Subtitle (--text-lg, --color-neutral-600)
│     "Análise científica baseada em 5 frameworks"
│
└─ Visual Accent
   └─ Gradient Orb (200x200px, --gradient-primary, blur 100px, opacity 30%)
```

**Variações:**
- `Cover/Default` - Fundo branco + orb gradient
- `Cover/Dark` - Fundo escuro + texto branco
- `Cover/Bold` - Background 100% gradient + texto branco

---

### 3. SlideContent (Variante de SlideBase)
**Slide de conteúdo (lista, texto, etc.)**

```
Content Area:
├─ Section Title (--text-2xl, --font-bold, margin-bottom: 32px)
│  "3 Gatilhos que Fazem Seu Público Parar de Scrollar"
│
└─ Content List (Auto Layout Vertical, gap: 24px)
   ├─ ListItem (Auto Layout Horizontal, gap: 16px)
   │  ├─ Icon/Number (32x32px circle, --color-primary-500, --text-lg)
   │  └─ Text Block (Auto Layout Vertical)
   │     ├─ Title (--text-lg, --font-semibold)
   │     └─ Description (--text-base, --color-neutral-600)
   │
   ├─ ListItem
   └─ ListItem
```

**Variações:**
- `Content/List` - Lista numerada
- `Content/Text` - Parágrafo corrido
- `Content/Quote` - Citação destacada
- `Content/Comparison` - Antes vs Depois

---

### 4. SlideStats (Variante de SlideBase)
**Slide de métricas/números**

```
Content Area (Auto Layout Vertical, center aligned, gap: 48px):
├─ Section Title (--text-xl, --font-semibold, margin-bottom: 24px)
│  "Resultados Reais em 30 Dias"
│
└─ Stats Grid (Auto Layout Horizontal, gap: 32px)
   ├─ StatCard (Auto Layout Vertical, center aligned)
   │  ├─ Value (--text-5xl, --font-extrabold, --color-primary-600)
   │  │  "347%"
   │  ├─ Label (--text-sm, --color-neutral-600)
   │     "Aumento em Alcance"
   │  └─ Icon (24x24px, --color-success)
   │
   ├─ StatCard
   └─ StatCard
```

**Variações:**
- `Stats/3-Column` - 3 KPIs lado a lado
- `Stats/Big-Number` - 1 número gigante no centro
- `Stats/Chart` - Gráfico simples (barras/linha)

---

### 5. SlideCTA (Variante de SlideBase)
**Slide de chamada para ação (último do carrossel)**

```
Content Area (Auto Layout Vertical, center aligned):
├─ Main CTA (Auto Layout Vertical, gap: 24px)
│  ├─ Headline (--text-3xl, --font-bold, center aligned)
│  │  "Pronto para Transformar Seu Conteúdo?"
│  │
│  ├─ Button (Auto Layout, padding: 20px 40px)
│  │  ├─ Fill: --color-primary-500
│  │  ├─ Text: "Começar Agora" (--text-lg, --font-semibold, white)
│  │  └─ Shadow: --shadow-lg
│  │
│  └─ Subtext (--text-sm, --color-neutral-600)
│     "Teste grátis por 7 dias • Sem cartão de crédito"
│
└─ Social Proof (Auto Layout Horizontal, gap: 16px)
   ├─ Avatar Stack (3 avatares sobrepostos, 32x32px)
   └─ Text "Mais de 500 creators já transformaram..."
```

**Variações:**
- `CTA/Button` - Botão principal + subtext
- `CTA/Link` - Link simples "Acesse postexpress.com"
- `CTA/QR` - QR Code no centro (para stories)

---

## 🎯 Exemplos de Carrosséis Completos

### Exemplo 1: Carrossel Educacional (10 slides)

```
1. SlideCover/Default
   "5 Frameworks Científicos para Conteúdo que Converte"

2. SlideContent/List
   "Framework #1: Kahneman (Vieses Cognitivos)"
   - Ancoragem
   - Prova Social
   - Escassez

3. SlideContent/List
   "Framework #2: Schwartz (Estágios de Awareness)"
   - Unaware → Problem Aware → Solution Aware

4. SlideStats/3-Column
   Métricas de impacto de cada framework

5-9. [Repetir padrão para outros frameworks]

10. SlideCTA/Button
    "Aplique os 5 Frameworks Agora"
```

### Exemplo 2: Carrossel de Autoridade (7 slides)

```
1. SlideCover/Bold
   "Como Auditar Qualquer Perfil do Instagram em 3 Minutos"

2. SlideContent/Text
   O problema: creators gastam 4h sem saber o que postar

3. SlideContent/Comparison
   ANTES vs DEPOIS (achismo vs dados)

4. SlideStats/Big-Number
   "2.847 perfis auditados em 30 dias"

5. SlideContent/List
   O que você descobre em 3 minutos:
   - Perguntas do público
   - Texto dos concorrentes
   - Gaps de conteúdo

6. SlideContent/Quote
   "Deixei de adivinhar e comecei a saber" - Cliente

7. SlideCTA/Link
   "Teste grátis: postexpress.com/auditoria"
```

---

## 🔗 Code Connect Setup

### Arquivo: `figma.config.json`

```json
{
  "codeConnect": {
    "include": ["components/molecules/carousel-slide.tsx"],
    "parser": "react"
  }
}
```

### Exemplo de Code Connect para SlideBase

No Figma (Dev Mode → Code Connect):

```tsx
// figma.properties
figma.connect(
  SlideBase,
  "figma://file/ABC123/SlideBase",
  {
    props: {
      children: figma.children("Content Area"),
      variant: figma.enum("Type", {
        "Cover": "cover",
        "Content": "content",
        "Stats": "stats",
        "CTA": "cta"
      })
    },
    example: () => (
      <CarouselSlide variant={variant}>
        {children}
      </CarouselSlide>
    )
  }
)
```

---

## 📦 Assets para Incluir no Figma File

### Icons (Lucide React)
- CheckCircle (success)
- TrendingUp (métricas positivas)
- AlertCircle (warnings)
- ArrowRight (CTAs)
- Zap (urgência)
- Users (social proof)
- Star (avaliações)

### Illustrations (Opcionais)
- Undraw.co (gratuitas, estilo minimalista)
- Humaaans (personagens modulares)
- Patterns (texturas sutis para backgrounds)

### Logo
- Croko Labs logo (SVG)
- Badge variant (apenas símbolo, 40x40px)

---

## 🚀 Como Criar no Figma (Passo a Passo)

### 1. Setup Inicial (10 min)

```
1. Criar novo arquivo "Croko Labs - Carousel Templates"
2. Criar página "Design Tokens"
   └─ Adicionar Color Styles (todas as cores acima)
   └─ Adicionar Text Styles (todas as tipografias)
   └─ Criar Variables (spacing, radius, shadows)

3. Criar página "Components"
   └─ Criar componente SlideBase
   └─ Habilitar Variants
   └─ Adicionar propriedades: Type (Cover, Content, Stats, CTA)
```

### 2. Construir Componentes (30 min)

```
1. SlideBase (master component)
   └─ Auto Layout vertical
   └─ Fixed size: 1080x1080
   └─ Padding: 80px
   └─ Gap: 40px

2. Criar Variants (1 para cada tipo)
   └─ Duplicate SlideBase
   └─ Renomear: Type=Cover, Type=Content, etc.
   └─ Customizar Content Area de cada

3. Criar sub-components
   └─ Header (reutilizável)
   └─ Footer (reutilizável)
   └─ StatCard (para SlideStats)
   └─ ListItem (para SlideContent)
```

### 3. Exemplos de Uso (20 min)

```
1. Criar página "Examples"
2. Montar 2 carrosséis completos (educacional + autoridade)
3. Usar instances dos components
4. Testar consistency do design system
```

### 4. Preparar para MCP (10 min)

```
1. Organizar layers com nomes semânticos
   ✅ "Header/Logo Badge"
   ✅ "Content Area/Title"
   ❌ "Rectangle 47"

2. Adicionar descrições nos components
   └─ Right panel → Description
   └─ "Slide de abertura com título hero e visual accent"

3. Marcar frames para export
   └─ Examples → Mark as ready to dev
```

---

## 🎨 Dicas de Design

### Hierarquia Visual
1. **Título** sempre com maior contraste (neutral-900)
2. **Corpo** em neutral-600/700
3. **Metadados** em neutral-500 (menor destaque)

### Uso de Cor
- **Primary (purple)** apenas para acentos importantes (badges, buttons, números)
- **Neutral** como base (80% do conteúdo)
- **Gradients** com moderação (covers, backgrounds premium)

### Espaçamento
- Respeitar grid de 8px
- Gaps entre seções: 40-48px
- Gaps entre itens: 16-24px
- Safe area: mínimo 80px das bordas

### Tipografia
- Máximo 3 tamanhos por slide (evitar poluição visual)
- Line-height generoso (1.5-1.6 para corpo)
- Kerning tight em títulos grandes (-0.02em)

### Acessibilidade
- Contraste mínimo 4.5:1 (corpo de texto)
- Contraste mínimo 3:1 (texto grande)
- Evitar texto em gradients (baixo contraste)

---

## 📤 Exportação para Produção

### Via Figma MCP

```typescript
// No Claude Code
const designContext = await figma.getDesignContext({
  fileId: "ABC123",
  nodeId: "1:234", // SlideBase component
});

// Retorna:
// - JSX do componente
// - Tailwind classes aplicadas
// - Props mapeadas
```

### Via Figma REST API (para assets)

```typescript
// Export como PNG (1080x1080)
const imageUrl = await figma.getImage({
  fileId: "ABC123",
  nodeId: "1:234",
  format: "png",
  scale: 2, // 2x para retina
});
```

### Via Puppeteer (renderização final)

```typescript
// Renderizar componente React gerado pelo MCP
// Capturar screenshot
// Upload para Cloudinary
// (fluxo atual mantido)
```

---

## ✅ Checklist de Qualidade

Antes de marcar como "ready to dev":

- [ ] Todos os textos estão usando Text Styles (não override manual)
- [ ] Cores vêm de Color Styles (não hex hardcoded)
- [ ] Spacing usa múltiplos de 8px
- [ ] Auto Layout configurado corretamente (sem absolute positioning)
- [ ] Componentes nomeados semanticamente
- [ ] Variants bem organizadas (Type, Style, State)
- [ ] Descrições adicionadas nos components
- [ ] Testado em diferentes tamanhos de texto (acessibilidade)
- [ ] Contraste validado (plugin Contrast)
- [ ] Preview em mobile (Instagram feed simulation)

---

## 🔄 Workflow Croko Labs + Figma

```
Designer atualiza template no Figma
        ↓
Claude Code detecta mudança (MCP)
        ↓
Executa: get_design_context + get_variable_defs
        ↓
Gera componente React atualizado
        ↓
Dev revisa e aprova
        ↓
Commit: "feat: update carousel template from Figma"
        ↓
Próxima auditoria usa novo template
        ↓
Puppeteer renderiza
        ↓
Cloudinary armazena
        ↓
Cliente baixa carrossel
```

---

## 📚 Recursos

### Inspiração de Design
- [Instagram Best Practices 2024](https://business.instagram.com/)
- [Carousel Design on Dribbble](https://dribbble.com/tags/instagram-carousel)
- [Canva Carousel Templates](https://www.canva.com/templates/)

### Ferramentas Figma
- **Contrast** (plugin) - validar acessibilidade
- **Content Reel** (plugin) - popular com dados reais
- **Figma Tokens** (plugin) - gerenciar design tokens
- **Lorem Ipsum** (plugin) - placeholders

### Fontes Recomendadas
- **Inter** (Google Fonts) - corpo de texto
- **Satoshi** (fontshare.com) - títulos modernos
- **Cabinet Grotesk** (fontshare.com) - alternativa display
- **JetBrains Mono** (monospace) - código/dados

---

**Versão:** 1.0
**Data:** 2026-02-20
**Autor:** Pazos Media
**Licença:** Uso interno Croko Labs
