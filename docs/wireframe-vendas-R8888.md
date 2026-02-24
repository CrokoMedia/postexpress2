# Wireframe + Spec Visual — Landing Page Croko Labs R$ 8.888

> **Agente:** Uma (UX Design Expert)
> **Referência:** superhuman.com (premium, minimalista, whitespace generoso)
> **Copy:** docs/pagina-vendas-R8888.md
> **Stack:** Next.js 15 + Tailwind CSS + Atomic Design existente
> **Data:** 2026-02-20

---

## DESIGN PHILOSOPHY

Inspiração Superhuman adaptada para high-ticket BR:

| Aspecto | Superhuman | Croko Labs Vendas |
|---------|-----------|-------------------|
| Fundo | Light + dark sections | **Dark dominant** (neutral-950) com seções alternando dark/darker |
| Tipografia | Custom "Super Sans" | **Sofia Pro** (já no projeto) + system-ui fallback |
| Cores | Neutro + minimal accent | **Purple gradient** (primary-500→600) como accent sobre dark |
| Whitespace | Extremamente generoso | Generoso — min 120px entre seções |
| CTAs | Sutis, poucos | **Bold e repetidos** — high-ticket precisa de CTAs agressivos |
| Hierarquia | Títulos enormes, corpo pequeno | Títulos 48-64px, corpo 18-20px, alto contraste |
| Mobile | Responsive | **Mobile-first** (avatar principal navega pelo celular) |

---

## COLOR TOKENS (Landing Page Específicos)

```
--lp-bg-primary:     #0a0a0a   (neutral-950)     → fundo principal
--lp-bg-elevated:    #171717   (neutral-900)      → cards, seções alternadas
--lp-bg-accent:      #1a0a2e   (purple-tinted dark) → seções de destaque
--lp-text-primary:   #fafafa   (neutral-50)       → títulos
--lp-text-secondary: #a3a3a3   (neutral-400)      → corpo de texto
--lp-text-emphasis:  #c084fc   (primary-400)      → destaques no texto
--lp-accent:         #a855f7   (primary-500)      → CTAs, badges
--lp-accent-hover:   #9333ea   (primary-600)      → CTAs hover
--lp-gradient:       linear-gradient(135deg, #a855f7, #6366f1)  → CTAs principais
--lp-border:         #262626   (neutral-800)      → bordas sutis
--lp-glow:           0 0 40px rgba(168,85,247,0.2) → glow nos CTAs
--lp-success:        #10b981   (success-500)      → checkmarks
--lp-strike:         #525252   (neutral-600)      → preço riscado
```

---

## TYPOGRAPHY SCALE

```
Hero headline:     64px / 1.1 / font-bold     (mobile: 36px)
Section headline:  48px / 1.15 / font-bold    (mobile: 28px)
Sub-headline:      24px / 1.4 / font-medium   (mobile: 18px)
Body large:        20px / 1.7 / font-normal   (mobile: 16px)
Body:              18px / 1.7 / font-normal   (mobile: 16px)
Caption:           14px / 1.5 / font-medium   (mobile: 13px)
Price display:     72px / 1.0 / font-bold     (mobile: 48px)
Price struck:      32px / 1.0 / font-normal   (mobile: 24px)
```

---

## PAGE WIREFRAME (Seção por Seção)

### LAYOUT GLOBAL

```
┌─────────────────────────────────────────────────────────┐
│                    STICKY NAV (fixed)                     │
│  [Logo Croko Labs]              [Garantir Minha Vaga]  │
│  bg: neutral-950/80 backdrop-blur-xl                     │
│  height: 64px | z-50 | border-b border-neutral-800/50   │
└─────────────────────────────────────────────────────────┘

Max-width do conteúdo: 1200px (mx-auto)
Padding lateral: px-6 (mobile) → px-8 (tablet) → px-0 (desktop)
Gap entre seções: py-24 (mobile) → py-32 (desktop)
```

---

### S1: HERO (Bloco 1 — Hook)
**Altura:** 100vh (full viewport)
**Fundo:** neutral-950 com gradiente radial sutil purple no centro-top

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                   (120px breathing room)                  │
│                                                          │
│        ┌─ Badge pill ──────────────────────┐             │
│        │ ★ Baseado em Hormozi, Schwartz,   │             │
│        │   Kahneman, Cagan e Graham        │             │
│        └───────────────────────────────────┘             │
│                                                          │
│     ╔═══════════════════════════════════════════╗        │
│     ║  Seus concorrentes já sabem              ║        │
│     ║  exatamente o que postar.                ║        │
│     ║  Você ainda está adivinhando?            ║        │
│     ╚═══════════════════════════════════════════╝        │
│     64px / bold / neutral-50 / text-center               │
│     "adivinhando?" em gradient text (purple→indigo)      │
│                                                          │
│     Descubra o método que transforma creators            │
│     travados em estrategistas que nunca mais              │
│     ficam sem ideia de conteúdo.                         │
│     20px / neutral-400 / text-center / max-w-2xl         │
│                                                          │
│     ┌────────────────────────────────────┐               │
│     │  QUERO MINHA IMPLEMENTAÇÃO →       │               │
│     │  bg: gradient purple→indigo        │               │
│     │  h-14 px-8 rounded-xl             │               │
│     │  shadow-glow hover:shadow-glow-lg  │               │
│     └────────────────────────────────────┘               │
│     12× de R$ 740,67 ou R$ 8.888 à vista                │
│     14px / neutral-500                                   │
│                                                          │
│     ┌──────────────────────────────────────────┐         │
│     │  "Eles têm dados. Você tem achismo."     │         │
│     │  Isso acaba hoje.                         │         │
│     │  italic / neutral-400 / border-l-2        │         │
│     │  border-primary-500 / pl-4                │         │
│     └──────────────────────────────────────────┘         │
│                                                          │
│              ↓ (scroll indicator animado)                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Atom: GradientText` — texto com gradient clip
- `Atom: PillBadge` — badge pill com borda e ícone
- `Atom: CTAButton` — botão CTA com glow effect (novo variant do Button)
- `Atom: ScrollIndicator` — seta animada para baixo

---

### S2: PROBLEMA (Bloco 2 — Reframe)
**Fundo:** neutral-950 → transição para neutral-900

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│                                                          │
│  ┌─ left-aligned, max-w-3xl ──────────────────────┐     │
│  │                                                  │     │
│  │  O PROBLEMA QUE NINGUÉM TE CONTA               │     │
│  │  caption / primary-400 / tracking-widest         │     │
│  │                                                  │     │
│  │  O seu problema não é                           │     │
│  │  falta de criatividade.                         │     │
│  │  48px / bold / neutral-50                        │     │
│  │                                                  │     │
│  │  [Parágrafo do reframe Paul Graham]             │     │
│  │  20px / neutral-400 / leading-relaxed            │     │
│  │                                                  │     │
│  │  ┌─────────────────────────────────────────┐    │     │
│  │  │ ● Quais perguntas o público faz         │    │     │
│  │  │ ● Qual estrutura de carrossel funciona  │    │     │
│  │  │ ● Qual tipo de hook engaja              │    │     │
│  │  │ ● O que escrevem dentro dos slides      │    │     │
│  │  │                                          │    │     │
│  │  │ Ícones: Lucide / primary-400             │    │     │
│  │  │ Texto: neutral-300                       │    │     │
│  │  └─────────────────────────────────────────┘    │     │
│  │                                                  │     │
│  │  ╔═══════════════════════════════════════╗       │     │
│  │  ║  "Se você pudesse ler cada slide..."  ║       │     │
│  │  ║  blockquote / bg-neutral-900          ║       │     │
│  │  ║  border-l-4 border-primary-500        ║       │     │
│  │  ║  p-8 rounded-r-xl                     ║       │     │
│  │  ╚═══════════════════════════════════════╝       │     │
│  │                                                  │     │
│  └──────────────────────────────────────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Molecule: SectionHeader` — overline + headline + body
- `Molecule: FeatureList` — ícone + texto, vertical
- `Molecule: Blockquote` — citação com borda lateral

---

### S3: AGITAÇÃO (Bloco 3 — 3 Mentiras)
**Fundo:** neutral-900

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│                                                          │
│  POR QUE TUDO QUE VOCÊ JÁ TENTOU FALHOU                │
│  caption / primary-400                                   │
│                                                          │
│  As 3 Mentiras Que Te                                   │
│  Mantêm Travado                                         │
│  48px / bold / neutral-50 / text-center                  │
│                                                          │
│  ┌─ Grid: 1col mobile / 3col desktop ──────────────┐    │
│  │                                                   │    │
│  │ ┌─────────┐  ┌─────────┐  ┌─────────┐           │    │
│  │ │ Card 1  │  │ Card 2  │  │ Card 3  │           │    │
│  │ │         │  │         │  │         │           │    │
│  │ │ #1      │  │ #2      │  │ #3      │           │    │
│  │ │ Número  │  │ Número  │  │ Número  │           │    │
│  │ │ 64px    │  │ 64px    │  │ 64px    │           │    │
│  │ │ primary │  │ primary │  │ primary │           │    │
│  │ │ -400/20 │  │ -400/20 │  │ -400/20 │           │    │
│  │ │         │  │         │  │         │           │    │
│  │ │ "Mais   │  │ "Consul │  │ "Postar │           │    │
│  │ │ métri-  │  │ toria   │  │  mais   │           │    │
│  │ │ cas"    │  │ humana" │  │ vai fun │           │    │
│  │ │         │  │         │  │ cionar" │           │    │
│  │ │ 24px    │  │ 24px    │  │ 24px    │           │    │
│  │ │ bold    │  │ bold    │  │ bold    │           │    │
│  │ │         │  │         │  │         │           │    │
│  │ │ [body]  │  │ [body]  │  │ [body]  │           │    │
│  │ │ 16px    │  │ 16px    │  │ 16px    │           │    │
│  │ │ n-400   │  │ n-400   │  │ n-400   │           │    │
│  │ │         │  │         │  │         │           │    │
│  │ │ bg:     │  │ bg:     │  │ bg:     │           │    │
│  │ │ n-800   │  │ n-800   │  │ n-800   │           │    │
│  │ │ border  │  │ border  │  │ border  │           │    │
│  │ │ n-700   │  │ n-700   │  │ n-700   │           │    │
│  │ │ rounded │  │ rounded │  │ rounded │           │    │
│  │ │ -2xl    │  │ -2xl    │  │ -2xl    │           │    │
│  │ │ p-8     │  │ p-8     │  │ p-8     │           │    │
│  │ └─────────┘  └─────────┘  └─────────┘           │    │
│  └───────────────────────────────────────────────────┘    │
│                                                          │
│  ╔═══════════════════════════════════════════╗            │
│  ║  "Num mundo de vacas marrons,             ║            │
│  ║   só a vaca roxa é notada."               ║            │
│  ║   — Seth Godin                            ║            │
│  ║   text-center / italic / primary-300      ║            │
│  ╚═══════════════════════════════════════════╝            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Organism: LieCard` — número grande + título + corpo (card dark)
- `Molecule: QuoteBlock` — citação centralizada com atribuição

---

### S4: SOLUÇÃO (Bloco 4 — Método + Value Equation)
**Fundo:** neutral-950 com subtle purple radial gradient no topo

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│                                                          │
│  O MÉTODO CROKO LABS                                   │
│  caption / primary-400                                   │
│                                                          │
│  Consultoria Croko Labs™                              │
│  Implementação Completa                                  │
│  48px / bold / neutral-50 / text-center                  │
│                                                          │
│  ┌─ 3 Fases — Tabs ou Stepper vertical ────────────┐    │
│  │                                                   │    │
│  │  ①  Raio-X do Nicho      (active)                │    │
│  │  ②  5 Frameworks                                 │    │
│  │  ③  Implementação                                │    │
│  │                                                   │    │
│  │  ┌─ Conteúdo da Fase Ativa ─────────────────┐   │    │
│  │  │                                            │   │    │
│  │  │  [Ícone grande: Search / primary-400]     │   │    │
│  │  │                                            │   │    │
│  │  │  Raio-X Completo do Seu Nicho             │   │    │
│  │  │  28px / bold                               │   │    │
│  │  │                                            │   │    │
│  │  │  ● Leitura completa dos slides            │   │    │
│  │  │  ● Mapeamento de perguntas                │   │    │
│  │  │  ● Análise de padrões                     │   │    │
│  │  │                                            │   │    │
│  │  │  bg: neutral-900 / rounded-2xl / p-10     │   │    │
│  │  └────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Tabela 5 Frameworks ──────────────────────────┐      │
│  │                                                  │      │
│  │  Grid 5 colunas (mobile: cards empilhados)      │      │
│  │                                                  │      │
│  │  [Kahneman] [Schwartz] [Hormozi] [Cagan] [Graham]│     │
│  │                                                  │      │
│  │  Cada card:                                      │      │
│  │  - Ícone/emoji 48px                             │      │
│  │  - Nome 16px bold                               │      │
│  │  - Autoridade 14px neutral-500                  │      │
│  │  - O que analisa 14px neutral-400               │      │
│  │  - bg: neutral-800/50 / rounded-xl / p-6        │      │
│  │  - border: neutral-700/50                       │      │
│  │  - hover: border-primary-500/30                 │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
│  "É como ter 5 consultores de R$ 10.000/mês"            │
│  24px / bold / primary-300 / text-center                 │
│                                                          │
│  ┌─ Value Equation Visual ────────────────────────┐      │
│  │                                                  │      │
│  │  ┌──────────────────┐                           │      │
│  │  │  Resultado × Prob │  ← MAXIMIZAR (verde)    │      │
│  │  │  ────────────────  │                         │      │
│  │  │  Tempo × Esforço   │  ← MINIMIZAR (red/dim) │      │
│  │  └──────────────────┘                           │      │
│  │                                                  │      │
│  │  Comparison table (2 colunas):                  │      │
│  │  Croko Labs | Consultoria Tradicional          │      │
│  │  bg alternado neutral-800 / neutral-850          │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Organism: PhasesStepper` — stepper vertical com conteúdo dinâmico
- `Organism: FrameworkGrid` — 5 cards de framework
- `Molecule: ValueEquation` — visualização da fórmula
- `Molecule: ComparisonTable` — tabela 2 colunas com highlight

---

### S5: PROVA SOCIAL (Bloco 5)
**Fundo:** neutral-900

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│                                                          │
│  OS NÚMEROS NÃO MENTEM                                  │
│  caption / primary-400                                   │
│                                                          │
│  ┌─ Stats Grid (3×2 desktop, 2×3 mobile) ──────────┐   │
│  │                                                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │  +10.000  │ │  85%     │ │  3 min   │          │   │
│  │  │  posts    │ │  acerto  │ │  por     │          │   │
│  │  │  analisa- │ │  leitura │ │  audito- │          │   │
│  │  │  dos      │ │  slides  │ │  ria     │          │   │
│  │  │           │ │          │ │          │          │   │
│  │  │  48px     │ │  48px    │ │  48px    │          │   │
│  │  │  bold     │ │  bold    │ │  bold    │          │   │
│  │  │  grad-    │ │  grad-   │ │  grad-   │          │   │
│  │  │  ient     │ │  ient    │ │  ient    │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │  5       │ │  10+     │ │  R$0,55  │          │   │
│  │  │  frame-  │ │  nichos  │ │  por     │          │   │
│  │  │  works   │ │  testados│ │  audito- │          │   │
│  │  │          │ │          │ │  ria     │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Comparison Table ─────────────────────────────┐      │
│  │                                                  │      │
│  │  Header: Consultor Tradicional | Croko Labs    │      │
│  │                                                  │      │
│  │  Rows com ❌ / ✅ side-by-side                   │      │
│  │  bg alternado                                    │      │
│  │  Croko Labs col highlighted (primary-500/5)    │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
│  ┌─ Before/After Cards ───────────────────────────┐      │
│  │                                                  │      │
│  │  ┌─ ANTES ─────────┐  ┌─ DEPOIS ────────────┐  │      │
│  │  │  bg: error-500/5 │  │  bg: success-500/5  │  │      │
│  │  │  border-error    │  │  border-success     │  │      │
│  │  │  /20             │  │  /20                │  │      │
│  │  │                  │  │                     │  │      │
│  │  │  "Acordo, abro   │  │  "Abro meu          │  │      │
│  │  │  o Instagram..." │  │  calendário..."     │  │      │
│  │  │                  │  │                     │  │      │
│  │  └──────────────────┘  └─────────────────────┘  │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Organism: StatsGrid` — grid de números com animação count-up
- `Organism: ComparisonTable` — reusa de S4
- `Molecule: BeforeAfterCards` — 2 cards lado a lado

---

### S6: STACK DE VALOR + PREÇO (Bloco 6)
**Fundo:** neutral-950 com gradiente accent purple

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│                                                          │
│  TUDO QUE ESTÁ INCLUSO                                  │
│  caption / primary-400                                   │
│                                                          │
│  O Que Você Recebe                                      │
│  48px / bold / neutral-50 / text-center                  │
│                                                          │
│  ┌─ Stack Cards (vertical, stacked) ──────────────┐     │
│  │                                                  │     │
│  │  ┌─ Card Componente 1 ──────────────────────┐   │     │
│  │  │  ┌─ Row ─────────────────────────────┐   │   │     │
│  │  │  │ [Icon] Auditoria Profunda         │   │   │     │
│  │  │  │         Completa                   │   │   │     │
│  │  │  │                     R$ 5.000      │   │   │     │
│  │  │  │                     (valor de     │   │   │     │
│  │  │  │                      mercado)     │   │   │     │
│  │  │  └────────────────────────────────────┘   │   │     │
│  │  │  ● Raio-X de até 10 concorrentes         │   │     │
│  │  │  ● Leitura completa dos slides           │   │     │
│  │  │  ● Mapeamento de perguntas               │   │     │
│  │  │  ● Relatório de 20+ páginas              │   │     │
│  │  │                                           │   │     │
│  │  │  bg: neutral-900 / rounded-2xl / p-8     │   │     │
│  │  │  border: neutral-800                     │   │     │
│  │  └───────────────────────────────────────────┘   │     │
│  │                                                  │     │
│  │  [... Cards 2-5 mesmo padrão ...]               │     │
│  │                                                  │     │
│  │  ┌─ Bônus Section ──────────────────────────┐   │     │
│  │  │  BÔNUS INCLUSOS                           │   │     │
│  │  │  overline / warning-500                   │   │     │
│  │  │                                           │   │     │
│  │  │  [Bônus 1] [Bônus 2] [Bônus 3]          │   │     │
│  │  │  Cards menores com bg: primary-500/5      │   │     │
│  │  │  border-primary-500/20                    │   │     │
│  │  └───────────────────────────────────────────┘   │     │
│  └──────────────────────────────────────────────────┘     │
│                                                          │
│  ═══════════════════════════════════════════════          │
│                                                          │
│  ┌─ PRICING BLOCK (O momento decisivo) ───────────┐     │
│  │                                                  │     │
│  │  bg: gradient (neutral-900 → primary-950)       │     │
│  │  border: primary-500/30                         │     │
│  │  rounded-3xl / p-12                             │     │
│  │  shadow: glow grande                            │     │
│  │                                                  │     │
│  │        Valor Total: R$ 35.225                   │     │
│  │        32px / neutral-500 / line-through         │     │
│  │                                                  │     │
│  │        Seu Investimento Hoje:                    │     │
│  │        20px / neutral-400                        │     │
│  │                                                  │     │
│  │        R$ 8.888                                 │     │
│  │        72px / bold / gradient text              │     │
│  │        (purple → indigo → white)                │     │
│  │                                                  │     │
│  │        ou 12× de R$ 740,67                      │     │
│  │        18px / neutral-400                        │     │
│  │                                                  │     │
│  │  ┌────────────────────────────────────────┐     │     │
│  │  │                                          │     │     │
│  │  │  QUERO MINHA IMPLEMENTAÇÃO COMPLETA →   │     │     │
│  │  │                                          │     │     │
│  │  │  h-16 / text-lg / rounded-xl            │     │     │
│  │  │  bg: gradient / shadow-glow-xl          │     │     │
│  │  │  hover: scale-[1.02] shadow-glow-2xl    │     │     │
│  │  │  w-full max-w-md mx-auto                │     │     │
│  │  │                                          │     │     │
│  │  └────────────────────────────────────────┘     │     │
│  │                                                  │     │
│  │  🔒 Pagamento seguro | Garantia 30 dias         │     │
│  │  14px / neutral-500 / flex gap-4 justify-center  │     │
│  │                                                  │     │
│  │  "Faça às pessoas uma oferta tão boa..."         │     │
│  │  16px / italic / neutral-500                     │     │
│  │                                                  │     │
│  └──────────────────────────────────────────────────┘     │
│                                                          │
│  ┌─ ROI Math Cards ───────────────────────────────┐      │
│  │  2 cards side-by-side:                          │      │
│  │  "Se você é consultor..." | "Se você é creator" │      │
│  │  bg: neutral-900 / rounded-xl / p-8             │      │
│  └─────────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Organism: StackCard` — card de componente do stack com valor
- `Organism: PricingBlock` — bloco de preço com glow (PEÇA CENTRAL)
- `Atom: PriceDisplay` — preço grande com gradient
- `Molecule: ROICard` — card com cálculo de retorno

---

### S7: OBJEÇÕES (Bloco 7)
**Fundo:** neutral-900

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│                                                          │
│  PERGUNTAS FREQUENTES                                   │
│  caption / primary-400                                   │
│                                                          │
│  Tudo que você precisa                                  │
│  saber antes de decidir                                 │
│  48px / bold / text-center                               │
│                                                          │
│  ┌─ Accordion FAQ ─────────────────────────────────┐    │
│  │                                                   │    │
│  │  ┌─ Item 1 (open) ──────────────────────────┐   │    │
│  │  │  ▼ "Funciona no meu nicho?"              │   │    │
│  │  │                                           │   │    │
│  │  │  [Resposta completa com destaque em       │   │    │
│  │  │   bold nas frases-chave]                  │   │    │
│  │  │                                           │   │    │
│  │  │  bg: neutral-800 / rounded-xl / p-6       │   │    │
│  │  │  border: neutral-700                      │   │    │
│  │  └───────────────────────────────────────────┘   │    │
│  │                                                   │    │
│  │  ► "Já uso Metricool..."                         │    │
│  │  ► "Posso fazer manualmente..."                  │    │
│  │  ► "R$ 8.888 é muito caro"                      │    │
│  │  ► "Não tenho certeza se é pra mim"             │    │
│  │  ► "E se não funcionar?"                         │    │
│  │                                                   │    │
│  │  hover: bg-neutral-800/50 transition              │    │
│  │  max-w-3xl mx-auto                                │    │
│  │                                                   │    │
│  └───────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Garantia Tripla ──────────────────────────────┐      │
│  │                                                  │      │
│  │  3 cards side-by-side:                          │      │
│  │                                                  │      │
│  │  [🛡️ 30 dias]  [🎯 90 dias]  [🔄 12 meses]   │      │
│  │  Satisfação     Resultado     Independência      │      │
│  │                                                  │      │
│  │  bg: primary-500/5 / border-primary-500/20      │      │
│  │  rounded-2xl / p-8                              │      │
│  │                                                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
│  "Nós assumimos 100% do risco."                         │
│  "Você fica com 100% do resultado."                     │
│  24px / bold / text-center / primary-300                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Organism: FAQAccordion` — accordion com items animados
- `Organism: GuaranteeGrid` — 3 cards de garantia

---

### S8: CTA FINAL (Bloco 8 — Fechamento)
**Fundo:** gradiente dramatic neutral-950 → deep purple → neutral-950

```
┌─────────────────────────────────────────────────────────┐
│                     py-32                                 │
│  bg: radial-gradient(ellipse at center,                  │
│      rgba(168,85,247,0.15), transparent 70%)              │
│                                                          │
│  A Decisão Que Separa                                   │
│  Estrategistas de Achistas                              │
│  48px / bold / text-center                               │
│                                                          │
│  ┌─ 2 Options Side by Side ───────────────────────┐     │
│  │                                                  │     │
│  │  ┌─ Opção A ───────┐  ┌─ Opção B ───────────┐  │     │
│  │  │  Não fazer nada  │  │  Decidir agora      │  │     │
│  │  │                  │  │                      │  │     │
│  │  │  [descrição      │  │  [descrição          │  │     │
│  │  │   negativa]      │  │   positiva]          │  │     │
│  │  │                  │  │                      │  │     │
│  │  │  bg: error-500/5 │  │  bg: success-500/5   │  │     │
│  │  │  border-error    │  │  border-success      │  │     │
│  │  │  opacity-60      │  │  border-2            │  │     │
│  │  │  /10             │  │  /20                 │  │     │
│  │  └──────────────────┘  └──────────────────────┘  │     │
│  └──────────────────────────────────────────────────┘     │
│                                                          │
│  ┌─ Vagas Badge ──────────────────────────────────┐      │
│  │  🔴 Vagas restantes: XX / 20 este mês          │      │
│  │  bg: error-500/10 / border-error-500/30         │      │
│  │  rounded-full / px-6 py-3 / animate-pulse       │      │
│  └─────────────────────────────────────────────────┘      │
│                                                          │
│  ┌─ FINAL CTA (Repete Pricing Block) ─────────────┐     │
│  │                                                  │     │
│  │  ~~R$ 35.225~~     →     R$ 8.888               │     │
│  │                                                  │     │
│  │  [GARANTIR MINHA VAGA AGORA]                    │     │
│  │  CTA button ENORME (h-16, text-lg)              │     │
│  │  gradient + glow máximo                         │     │
│  │                                                  │     │
│  │  12× de R$ 740,67 | 🔒 Seguro | ✅ Garantia    │     │
│  │                                                  │     │
│  └──────────────────────────────────────────────────┘     │
│                                                          │
│  ┌─ Timeline (O que acontece) ────────────────────┐      │
│  │                                                  │      │
│  │  Dia 0 ──● Semana 1 ──● Semana 2 ──● Sem 3-4  │      │
│  │  Acesso    Auditoria    Estratégia   Implement  │      │
│  │                                                  │      │
│  │  Stepper horizontal                             │      │
│  │  Dots conectados por linha gradient             │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
│  "De achista inseguro para estrategista                  │
│   data-driven em 30 dias."                               │
│  24px / bold / gradient text / text-center                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes:**
- `Molecule: OptionCard` — card opção A/B
- `Atom: UrgencyBadge` — badge pulsante com contagem
- `Organism: Timeline` — stepper horizontal
- `Organism: PricingBlock` — reuso de S6

---

### S9: FOOTER
**Fundo:** neutral-950

```
┌─────────────────────────────────────────────────────────┐
│                     py-16                                 │
│                                                          │
│  Croko Labs™ | Consultoria + Implementação            │
│  Desenvolvido por Pazos Media                           │
│  Método baseado em Hormozi, Schwartz, Kahneman,         │
│  Cagan e Graham                                         │
│                                                          │
│  14px / neutral-500 / text-center                        │
│  border-t border-neutral-800                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES ATÔMICOS NECESSÁRIOS

### Novos Atoms (4)

| Componente | Tipo | Descrição |
|-----------|------|-----------|
| `GradientText` | Atom | Texto com CSS gradient clip — reutilizável |
| `PillBadge` | Atom | Badge pill com ícone + texto (extend do Badge existente) |
| `PriceDisplay` | Atom | Preço grande com struck-through + preço real |
| `ScrollIndicator` | Atom | Seta animada (chevron bounce) |

### Novas Molecules (6)

| Componente | Tipo | Descrição |
|-----------|------|-----------|
| `SectionHeader` | Molecule | Overline + Headline + Sub (reutilizável em toda seção) |
| `FeatureList` | Molecule | Lista vertical com ícones + texto |
| `Blockquote` | Molecule | Citação com borda lateral e atribuição |
| `ComparisonRow` | Molecule | Linha de tabela com ❌/✅ |
| `BeforeAfterCards` | Molecule | 2 cards lado a lado (antes/depois) |
| `ROICard` | Molecule | Card com cálculo matemático de retorno |

### Novos Organisms (7)

| Componente | Tipo | Descrição |
|-----------|------|-----------|
| `HeroSection` | Organism | Hero completo (badge + headline + CTA + quote) |
| `LieCard` | Organism | Card da "mentira" (número + título + corpo) |
| `PhasesStepper` | Organism | 3 fases com tabs/stepper e conteúdo |
| `FrameworkGrid` | Organism | Grid dos 5 frameworks |
| `StatsGrid` | Organism | Grid de números com count-up animation |
| `PricingBlock` | Organism | Bloco central de preço com glow |
| `FAQAccordion` | Organism | FAQ com accordion animado |
| `GuaranteeGrid` | Organism | 3 cards de garantia |
| `Timeline` | Organism | Stepper horizontal do processo |

### Template (1)

| Componente | Tipo | Descrição |
|-----------|------|-----------|
| `SalesPageLayout` | Template | Layout full-page sem sidebar, sticky nav, dark bg |

---

## INTERAÇÕES E ANIMAÇÕES

| Elemento | Animação | Trigger |
|----------|----------|---------|
| Stats números | Count-up (0 → valor final) | Scroll into view (IntersectionObserver) |
| Seções | Fade-in + slight translate-y | Scroll into view |
| CTA buttons | Glow pulse sutil | Idle (infinite, subtle) |
| CTA buttons | Scale 1.02 + glow intensifica | Hover |
| FAQ items | Height transition smooth | Click |
| Sticky nav | bg opacity 0→80% + blur | Scroll > 100px |
| Price struck | Linha riscando da esquerda | Scroll into view |
| Urgency badge | Pulse animation | Always (subtle) |
| Gradient text | Gradient animado (3s ease) | Always (keyframe existente no tailwind.config) |

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Layout Changes |
|-----------|---------------|
| `< 640px` (mobile) | 1 coluna, headlines 36px, body 16px, CTAs full-width, cards stack vertical |
| `640-1024px` (tablet) | 2 colunas onde possível, headlines 40px, padding lateral aumenta |
| `> 1024px` (desktop) | Layout completo, 3 colunas onde necessário, max-w-1200px centered |

---

## ROTA NO NEXT.JS

```
app/
└── vendas/
    └── page.tsx          ← Página principal (sem sidebar, sem auth)
```

- **Sem layout do dashboard** — página standalone, full-width
- **Sem autenticação** — pública
- **Meta tags SEO** — title, description, og:image para compartilhamento
- **Font loading** — Sofia Pro como priority

---

## ACESSIBILIDADE (WCAG AA)

- Contraste mínimo 4.5:1 em todo texto (neutral-50 sobre neutral-950 = 21:1 ✅)
- Gradient text precisa de fallback color para screen readers
- CTAs com `aria-label` descritivo
- FAQ accordion com `aria-expanded` / `aria-controls`
- Focus visible em todos interativos (ring-2 ring-primary-500)
- Scroll animations com `prefers-reduced-motion` respect

---

— Uma, desenhando com empatia 💝
