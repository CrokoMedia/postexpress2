# User Flows & Interações - Instagram Audit Dashboard

**Versão:** 1.0
**Data:** 2026-02-16
**Autor:** @ux-design-expert

---

## Índice

1. [Fluxo Principal: Nova Análise](#fluxo-principal-nova-análise)
2. [Fluxo Secundário: Explorar Auditoria](#fluxo-secundário-explorar-auditoria)
3. [Fluxo Terciário: Comparação Temporal](#fluxo-terciário-comparação-temporal)
4. [Microinterações](#microinterações)
5. [Estados e Feedbacks](#estados-e-feedbacks)
6. [Casos de Uso](#casos-de-uso)

---

## Fluxo Principal: Nova Análise

### Jornada Completa (Happy Path)

```
USUÁRIO                    SISTEMA                    UI/FEEDBACK
   │                          │                          │
   │ 1. Acessa dashboard      │                          │
   ├──────────────────────────►                          │
   │                          │ Carrega lista perfis    │
   │                          ├─────────────────────────►│
   │                          │                          │ Mostra skeleton
   │                          │                          │ → Cards perfis
   │                          │                          │
   │ 2. Clica "Nova Análise"  │                          │
   ├──────────────────────────►                          │
   │                          │ Navega p/ /new          │
   │                          ├─────────────────────────►│
   │                          │                          │ Página transition
   │                          │                          │ Mostra formulário
   │                          │                          │
   │ 3. Digita username       │                          │
   ├──────────────────────────►                          │
   │                          │ Valida formato          │
   │                          ├─────────────────────────►│
   │                          │                          │ ✓ Verde (válido)
   │                          │                          │ ou
   │                          │                          │ ✗ Vermelho (inválido)
   │                          │                          │
   │ 4. Clica "Iniciar"       │                          │
   ├──────────────────────────►                          │
   │                          │ Cria task queue         │
   │                          │ Inicia scraping         │
   │                          ├─────────────────────────►│
   │                          │                          │ Mostra progress
   │                          │                          │ Fase 1: Scraping
   │                          │                          │ [████░░░░] 25%
   │                          │                          │
   │                          │ Scraping completo (2s)  │
   │                          ├─────────────────────────►│
   │                          │                          │ ✅ Fase 1 done
   │                          │                          │ Fase 2: Posts
   │                          │                          │ [████████░░] 50%
   │                          │                          │
   │                          │ Posts coletados (5s)    │
   │                          ├─────────────────────────►│
   │                          │                          │ ✅ Fase 2 done
   │                          │                          │ Fase 3: Auditores
   │                          │                          │ [████████████] 75%
   │                          │                          │
   │                          │ Análise completa (45s)  │
   │                          ├─────────────────────────►│
   │                          │                          │ ✅ Fase 3 done
   │                          │                          │ Fase 4: Relatório
   │                          │                          │ [████████████████] 100%
   │                          │                          │
   │                          │ Salva no DB             │
   │                          │ Redireciona p/ audit    │
   │                          ├─────────────────────────►│
   │                          │                          │ ✨ Success toast
   │                          │                          │ Navigate to audit
   │                          │                          │
   │ 5. Visualiza resultado   │                          │
   ├──────────────────────────►                          │
   │                          │ Carrega auditoria       │
   │                          ├─────────────────────────►│
   │                          │                          │ Mostra score card
   │                          │                          │ Radar chart
   │                          │                          │ Quick wins
   │                          │                          │ Auditores
```

### Pontos de Decisão

```
1. Formulário Válido?
   ├─ SIM: Enable "Iniciar" button (primary)
   └─ NÃO: Disable button, mostra erro

2. Username Já Analisado?
   ├─ SIM: Mostra banner "Última análise: X dias atrás" + botão "Reanalisar"
   └─ NÃO: Procede normalmente

3. Scraping Falha?
   ├─ 404: "Perfil não encontrado"
   ├─ Private: "Perfil privado, impossível analisar"
   ├─ Timeout: "Tempo esgotado, tente novamente"
   └─ Outro: "Erro desconhecido, contate suporte"

4. Análise Interrompida?
   ├─ Cancelada pelo usuário: Volta p/ dashboard, deleta task
   ├─ Erro no auditor: Salva parcial, mostra aviso
   └─ Timeout geral: Salva parcial, mostra erro
```

---

## Fluxo Secundário: Explorar Auditoria

### Navegação na Auditoria

```
PÁGINA AUDITORIA
│
├─ Score Card (topo)
│  ├─ Score geral (72)
│  ├─ Classification badge (BOM)
│  └─ Radar chart (5 dimensões)
│
├─ Quick Wins (seção 1)
│  ├─ Lista de 5 ações
│  │  ├─ Checkbox (marcar como feito)
│  │  ├─ Título + descrição
│  │  └─ Impact/Effort badges
│  └─ Estado persiste no localStorage
│
├─ Auditores (seção 2)
│  ├─ Header (nome + ícone + score)
│  │  └─ Click: Toggle expand/collapse
│  │
│  └─ Conteúdo (se expandido)
│     ├─ Pontos fortes (3)
│     ├─ Problemas (2-3)
│     └─ Recomendações (3-5)
│
└─ Actions (rodapé)
   ├─ Comparar (se houver 2+ auditorias)
   ├─ Download PDF
   └─ Nova Análise
```

### Interações do Usuário

#### 1. Marcar Quick Win como Concluído

```
Estado Inicial:
┌──────────────────────────────────┐
│ ☐ Atualizar bio clara            │
│    🟢 Alto  🟡 Baixo              │
│    Bio atual muito genérica      │
└──────────────────────────────────┘

Usuário clica no checkbox:
↓

Estado Loading (100ms):
┌──────────────────────────────────┐
│ ⏳ Atualizar bio clara            │
│    🟢 Alto  🟡 Baixo              │
│    Bio atual muito genérica      │
└──────────────────────────────────┘

Estado Concluído:
┌──────────────────────────────────┐
│ ☑ Atualizar bio clara            │
│    🟢 Alto  🟡 Baixo              │
│    Bio atual muito genérica      │
└──────────────────────────────────┘
     ↑
   opacity-50
   line-through
```

#### 2. Expandir/Colapsar Auditor

```
Estado Colapsado:
┌──────────────────────────────────┐
│ 🤝 Comportamento            68 ▼ │
│    Especialista em engajamento   │
└──────────────────────────────────┘
                                 ▲
                          Click aqui

Animação (300ms):
- Ícone rotaciona 180° (▼ → ▲)
- Conteúdo desliza para baixo (y: -20 → 0)
- Opacity: 0 → 1

Estado Expandido:
┌──────────────────────────────────┐
│ 🤝 Comportamento            68 ▲ │
│    Especialista em engajamento   │
│ ───────────────────────────────  │
│                                  │
│ ✅ Pontos Fortes (3):            │
│ • Engajamento consistente        │
│ • Respostas rápidas              │
│ • Interação autêntica            │
│                                  │
│ ⚠️  Problemas (2):                │
│ • Falta de CTAs (60%)            │
│ • Horários inconsistentes        │
│                                  │
│ 💡 Recomendações (3):            │
│ 1. Implementar CTAs claros       │
│ 2. Calendário fixo               │
│ 3. Sistema de resposta rápida    │
└──────────────────────────────────┘
```

#### 3. Download PDF

```
Fluxo:

1. Usuário clica "Download PDF"
   ↓
2. Button loading state
   [⏳ Gerando PDF...]
   ↓
3. API gera PDF (3-5s)
   ↓
4. Browser download automático
   "auditoria-frankcosta-12fev2026.pdf"
   ↓
5. Toast de sucesso
   "✅ PDF baixado com sucesso!"
```

---

## Fluxo Terciário: Comparação Temporal

### Seleção de Auditorias

```
PÁGINA: /dashboard/comparisons/new

1. Carrega lista de perfis
   ↓
2. Usuário seleciona perfil
   ↓
3. Filtra auditorias desse perfil (ordenadas por data DESC)
   ↓
4. Usuário seleciona 2 auditorias
   ├─ Before: [Dropdown] 12 Jan 2026 (Score: 54)
   └─ After:  [Dropdown] 12 Fev 2026 (Score: 72)
   ↓
5. Valida seleção
   ├─ Before < After? ✓
   └─ Same profile? ✓
   ↓
6. Clica "Comparar"
   ↓
7. API calcula deltas
   - Score: +18 pts (+33.3%)
   - Followers: +2.1K (+1.7%)
   - Engagement: +1.1pp (+26.8%)
   ↓
8. Renderiza página de comparação
```

### Visualização de Comparação

```
COMPONENTES:

1. Hero Comparison
   ┌─────────────┐    →    ┌─────────────┐
   │     54      │          │     72      │
   │  CRÍTICO    │          │    BOM      │
   └─────────────┘          └─────────────┘
       12 Jan                  12 Fev
            +18 pts (+33.3%) ↗

2. Metrics Grid (3-4 colunas)
   Before → After  Delta

3. Dimension Bars
   [█████░░░░░] → [██████████] +X pts

4. Line Chart (Score over time)
   Points: todas as auditorias entre before/after
   Linha: interpolação smooth

5. Insights
   ✅ Melhorias implementadas
   ⚠️  Próximos passos
```

---

## Microinterações

### 1. Hover States

```typescript
// Button Hover
<Button>
  initial:  scale(1)
  hover:    scale(1.02) + shadow-lg
  active:   scale(0.98)
  duration: 150ms

// Card Hover
<Card>
  initial:  translateY(0) + shadow-sm
  hover:    translateY(-4px) + shadow-xl
  duration: 300ms

// ProfileCard Hover
<ProfileCard>
  initial:  border-neutral-700
  hover:    border-primary-500 + glow
  cursor:   pointer
```

### 2. Loading States

```typescript
// Skeleton Pulse
<Skeleton>
  animation: pulse 2s ease-in-out infinite
  background: gradient(neutral-800 → neutral-700 → neutral-800)

// Button Loading
<Button loading>
  <Spinner /> Carregando...
  disabled: true
  opacity: 0.7
  cursor: not-allowed

// Progress Bar
<Progress value={65}>
  width: animates smoothly (500ms)
  background: gradient-to-r (primary-500 → info-500)
```

### 3. Transições de Página

```typescript
// Page Transition (Framer Motion)
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### 4. Focus States

```typescript
// Keyboard Navigation
<Input>
  focus: ring-2 ring-primary-500 ring-offset-2
  outline: none (substituído por ring)

<Button>
  focus-visible: ring-2 ring-primary-500
  (apenas quando Tab, não quando Click)
```

---

## Estados e Feedbacks

### Loading States

```
1. Initial Page Load
   ┌──────────────────┐
   │ ▓▓▓▓▓▓▓▓▓▓▓▓     │  Skeleton Card
   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
   │ ▓▓▓▓▓▓▓▓▓▓▓▓     │
   └──────────────────┘

2. Button Loading
   [⏳ Carregando...]  (spinner + text)

3. Progress Loading
   [████████░░░░] 65%  (bar + percentage)

4. Inline Loading
   "Salvando..." (subtle spinner)
```

### Empty States

```
1. No Profiles Yet
   ┌──────────────────────────────┐
   │          📊                  │
   │                              │
   │   Nenhum perfil analisado    │
   │   ainda                      │
   │                              │
   │   Crie sua primeira análise  │
   │   para começar               │
   │                              │
   │   [Nova Análise →]           │
   └──────────────────────────────┘

2. No Audits for Comparison
   "Este perfil tem apenas 1 auditoria.
    Aguarde 30 dias para comparar."

3. No Posts Found
   "Nenhum post público encontrado
    neste perfil."
```

### Error States

```
1. Profile Not Found
   ┌──────────────────────────────┐
   │          ⚠️                   │
   │                              │
   │   Perfil não encontrado      │
   │                              │
   │   Verifique o username e     │
   │   tente novamente.           │
   │                              │
   │   [Tentar Novamente]         │
   └──────────────────────────────┘

2. Analysis Failed
   "Erro ao analisar perfil.
    Código: SCRAPER_TIMEOUT
    [Contatar Suporte]"

3. Network Error
   "Sem conexão com internet.
    Verifique sua rede e tente
    novamente."
```

### Success States

```
1. Toast Success
   ┌──────────────────────────────┐
   │ ✅ Análise concluída!         │
   │    @frankcosta - Score: 72   │
   └──────────────────────────────┘
   (auto-dismiss em 5s)

2. Inline Success
   ☑ Quick win marcado como feito
   (com animação de check)

3. Banner Success
   "✨ Bem-vindo ao Instagram Audit!
    Crie sua primeira análise."
```

---

## Casos de Uso

### Caso 1: Primeiro Acesso (Onboarding)

```
USUÁRIO: Marketing Manager
OBJETIVO: Analisar Instagram do cliente pela primeira vez

FLUXO:
1. Acessa dashboard (vazio)
   → Vê empty state com CTA "Nova Análise"

2. Clica "Nova Análise"
   → Formulário simples

3. Digita username: "frankcosta"
   → Validação em tempo real (✓)

4. Clica "Iniciar Análise"
   → Progress bar em tempo real
   → Dicas aparecem durante espera

5. Análise completa (2-3 min)
   → Redireciona para auditoria
   → Tour guiado (tooltips) explica seções

6. Explora auditoria
   → Clica em auditores
   → Marca alguns quick wins
   → Download PDF para cliente

RESULTADO: Primeira análise concluída, PDF enviado ao cliente
```

### Caso 2: Análise Recorrente (Power User)

```
USUÁRIO: Social Media Analyst
OBJETIVO: Comparar evolução após 30 dias

FLUXO:
1. Acessa dashboard
   → Vê lista de perfis já analisados

2. Clica em perfil "@frankcosta"
   → Vê overview + histórico

3. Nota: "Última análise: 32 dias atrás"
   → Clica "Nova Análise"

4. Análise rápida (já tem dados cached)
   → 1-2 minutos

5. Análise completa
   → Auto-comparação criada (trigger DB)

6. Clica "Ver Comparação"
   → Gráficos de evolução
   → Insights de melhoria

7. Download PDF de comparação
   → Apresenta para cliente

RESULTADO: Comparação temporal pronta, insights acionáveis
```

### Caso 3: Exploração de Posts (Content Analyst)

```
USUÁRIO: Content Strategist
OBJETIVO: Identificar posts com melhor performance

FLUXO:
1. Acessa perfil "@frankcosta"
   → Clica "Posts"

2. Vê galeria de 10 posts
   → Filtra "Com Ofertas"

3. Ordena por "Maior Engajamento"
   → Identifica top 3

4. Clica em post individual
   → Modal com análise completa
   → Vê OCR detectado
   → Lê análise de copy

5. Anota padrões de sucesso:
   - Posts com depoimentos engajam +40%
   - CTAs diretos convertem melhor
   - Imagens com texto performam bem

RESULTADO: Insights para estratégia de conteúdo
```

### Caso 4: Quick Wins (Client Success)

```
USUÁRIO: Gerente de Conta
OBJETIVO: Apresentar ações imediatas ao cliente

FLUXO:
1. Abre auditoria recente
   → Expande "Quick Wins"

2. Filtra por "Alto Impacto + Baixo Esforço"
   → Encontra 3 ações

3. Marca como "To-Do" no Notion/Trello
   - [ ] Atualizar bio
   - [ ] Fixar post com oferta
   - [ ] Criar highlight de depoimentos

4. Cliente implementa em 1 semana
   → Marca como concluído no dashboard

5. Após 30 dias, nova análise
   → Comparação mostra +15 pts no score

RESULTADO: Quick wins implementados, ROI mensurável
```

---

## Métricas de UX (KPIs)

### Performance Metrics

```
1. Time to First Meaningful Paint (FMP)
   Target: < 1.5s

2. Time to Interactive (TTI)
   Target: < 2.5s

3. Largest Contentful Paint (LCP)
   Target: < 2.5s

4. Cumulative Layout Shift (CLS)
   Target: < 0.1

5. First Input Delay (FID)
   Target: < 100ms
```

### User Engagement Metrics

```
1. Time on Page
   - Dashboard: 30-60s
   - Auditoria: 5-10 min
   - Comparação: 3-5 min

2. Bounce Rate
   Target: < 20%

3. Task Completion Rate
   - Nova Análise: > 90%
   - Comparação: > 80%
   - Download PDF: > 70%

4. Error Rate
   Target: < 2%

5. Return Rate (7 days)
   Target: > 60%
```

### Satisfaction Metrics

```
1. System Usability Scale (SUS)
   Target: > 80/100

2. Net Promoter Score (NPS)
   Target: > 50

3. Customer Satisfaction (CSAT)
   Target: > 4.5/5

4. Task Ease (SEQ)
   "How easy was it to complete this task?"
   Target: > 6/7
```

---

## Acessibilidade (WCAG 2.1 AA)

### Keyboard Navigation

```
Tab Order:
1. Skip to main content
2. Logo (focusable)
3. Sidebar navigation (top → bottom)
4. Main content (left → right, top → bottom)
5. Footer

Shortcuts:
- Tab: Next element
- Shift+Tab: Previous element
- Enter/Space: Activate button/link
- Esc: Close modal/dropdown
- Arrow Keys: Navigate tabs/radio groups
```

### Screen Reader Support

```
ARIA Landmarks:
<header role="banner">
<nav role="navigation" aria-label="Main">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">

ARIA Labels:
<button aria-label="Nova Análise">+</button>
<input aria-describedby="username-helper">
<div role="status" aria-live="polite">Loading...</div>

ARIA States:
<button aria-pressed="true">Filter</button>
<div aria-expanded="false">Auditor</div>
<input aria-invalid="true">
```

### Focus Management

```
1. Modal Opens
   → Focus moves to first focusable element
   → Focus trapped inside modal
   → Esc closes modal, returns focus to trigger

2. Dropdown Opens
   → Focus moves to first option
   → Arrow keys navigate options
   → Esc closes, returns focus

3. Form Errors
   → Focus moves to first error field
   → Screen reader announces error
```

### Color Contrast

```
Text:
- neutral-50 on neutral-900:  18.5:1 ✅
- neutral-400 on neutral-900:  6.2:1 ✅
- primary-500 on neutral-900:  7.8:1 ✅

Buttons:
- primary-500 bg + neutral-50 text: 7.8:1 ✅
- success-500 bg + neutral-50 text: 5.2:1 ✅
- error-500 bg + neutral-50 text:   6.1:1 ✅

Never use color alone:
- Success: ✅ + green
- Error: ❌ + red
- Warning: ⚠️ + amber
```

---

## Testes de Usabilidade

### Test Scripts

#### Test 1: Nova Análise

```
Tarefa: "Analise o perfil @frankcosta"

Passos:
1. Encontre onde criar nova análise
2. Insira o username
3. Inicie a análise
4. Aguarde conclusão
5. Encontre o score geral

Métricas:
- Tempo: Target < 3 min (após análise)
- Cliques: Target < 5
- Erros: Target 0

Perguntas pós-teste:
- Quão fácil foi encontrar a função? (1-7)
- O progresso foi claro? (1-7)
- O resultado atendeu expectativas? (1-7)
```

#### Test 2: Comparação

```
Tarefa: "Compare 2 análises de @frankcosta"

Passos:
1. Encontre o perfil
2. Acesse comparações
3. Selecione 2 auditorias
4. Visualize evolução do score
5. Identifique métrica que mais melhorou

Métricas:
- Tempo: Target < 2 min
- Cliques: Target < 7
- Erros: Target 0

Perguntas pós-teste:
- Foi fácil selecionar as auditorias? (1-7)
- Os gráficos foram claros? (1-7)
- Insights foram úteis? (1-7)
```

---

## Roadmap de Melhorias

### Curto Prazo (1-3 meses)

```
1. Onboarding Tour
   - Tooltips interativos
   - Tutorial primeiro acesso
   - Sample data para explorar

2. Filtros Avançados
   - Filtrar por score range
   - Filtrar por data
   - Busca por username

3. Export Options
   - CSV de métricas
   - PNG de gráficos
   - Copiar p/ clipboard

4. Notificações
   - Email quando análise completa
   - Push quando comparação disponível
   - Alert de anomalias detectadas
```

### Médio Prazo (3-6 meses)

```
1. Dashboard Customizável
   - Drag-and-drop widgets
   - Salvar layouts
   - Favoritar perfis

2. Colaboração
   - Compartilhar auditorias
   - Comentários em insights
   - Assign tasks (quick wins)

3. Analytics Avançado
   - Heatmaps de engajamento
   - Sentiment analysis comments
   - Competitor benchmarking

4. Mobile App
   - iOS + Android
   - Push notifications
   - Offline mode
```

### Longo Prazo (6-12 meses)

```
1. AI Insights
   - Predições de crescimento
   - Recomendações personalizadas
   - Auto-detecção de tendências

2. Multi-Platform
   - TikTok analysis
   - YouTube analysis
   - LinkedIn analysis

3. White Label
   - Custom branding
   - Embedded dashboards
   - API pública

4. Automações
   - Auto-análise mensal
   - Auto-reports
   - Integration com Zapier
```

---

**Documentação Relacionada:**
- Design System: `ui-ux-design-system.md`
- Wireframes: `wireframes.md`
- API Docs: (a definir)
