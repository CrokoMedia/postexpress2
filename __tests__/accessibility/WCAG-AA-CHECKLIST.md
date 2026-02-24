# 🔍 Checklist WCAG AA - Content Creation Flow

Checklist completo para validação de conformidade com **WCAG 2.1 Level AA**.

## 📋 Índice

1. [Perceivable (Perceptível)](#1-perceivable)
2. [Operable (Operável)](#2-operable)
3. [Understandable (Compreensível)](#3-understandable)
4. [Robust (Robusto)](#4-robust)

---

## 1. Perceivable (Perceptível)

### 1.1 Alternativas em Texto

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 1.1.1 | Todas as imagens têm alt text apropriado | ⏳ | |
| 1.1.1 | Imagens decorativas têm `alt=""` | ⏳ | |
| 1.1.1 | Icons têm `aria-label` descritivo | ⏳ | |

### 1.2 Mídia Baseada em Tempo

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| N/A | Não aplicável (sem vídeos/áudio no fluxo) | ✅ | |

### 1.3 Adaptável

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 1.3.1 | Estrutura semântica correta (`<header>`, `<main>`, `<nav>`) | ⏳ | |
| 1.3.1 | Headings em ordem lógica (h1 → h2 → h3) | ⏳ | |
| 1.3.1 | Listas usam `<ul>`, `<ol>`, `<li>` | ⏳ | |
| 1.3.2 | Ordem de leitura é lógica (DOM order) | ⏳ | |
| 1.3.3 | Instruções não dependem apenas de cor/forma | ⏳ | |
| 1.3.4 | Orientação (portrait/landscape) não é restrita | ⏳ | |
| 1.3.5 | Inputs têm `autocomplete` apropriado | ⏳ | |

### 1.4 Distinguível

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 1.4.1 | Informação não depende APENAS de cor | ⏳ | Usar ícones + cor |
| 1.4.3 | **Contraste mínimo 4.5:1** para texto normal | ⏳ | CRÍTICO |
| 1.4.3 | **Contraste mínimo 3:1** para texto grande (18pt+) | ⏳ | CRÍTICO |
| 1.4.4 | Texto pode ser redimensionado até 200% sem perder conteúdo | ⏳ | |
| 1.4.5 | Texto em imagens evitado (exceto logos) | ⏳ | |
| 1.4.10 | Conteúdo adaptável a 320px sem scroll horizontal | ⏳ | Mobile |
| 1.4.11 | **Contraste mínimo 3:1** para componentes UI | ⏳ | CRÍTICO |
| 1.4.12 | Espaçamento de texto personalizável | ⏳ | |
| 1.4.13 | Conteúdo em hover/focus é dismissible e hoverable | ⏳ | Tooltips |

---

## 2. Operable (Operável)

### 2.1 Acessível por Teclado

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 2.1.1 | **Toda funcionalidade acessível por teclado** | ⏳ | CRÍTICO |
| 2.1.2 | **Nenhum keyboard trap** | ⏳ | CRÍTICO |
| 2.1.4 | Atalhos de tecla única podem ser desabilitados | ⏳ | `←→ Enter Esc` |

#### Testes de Teclado a Realizar:

- [ ] **Tab**: Navega entre elementos interativos
- [ ] **Shift+Tab**: Navega para trás
- [ ] **Enter**: Ativa botões/links
- [ ] **Space**: Ativa botões
- [ ] **Esc**: Fecha modais/dialogs
- [ ] **←→**: Navega entre carrosséis (custom)
- [ ] **↑↓**: Navega em listas (se aplicável)

### 2.2 Tempo Suficiente

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 2.2.1 | Timeouts podem ser desabilitados/estendidos | ⏳ | Loading states |
| 2.2.2 | Conteúdo em movimento pode ser pausado | N/A | Sem animações automáticas |

### 2.3 Convulsões e Reações Físicas

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 2.3.1 | Sem flashes mais de 3 vezes/segundo | ✅ | Sem flashes |

### 2.4 Navegável

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 2.4.1 | Mecanismo para pular blocos (skip links) | ⏳ | |
| 2.4.2 | Título da página descritivo | ⏳ | `<title>` |
| 2.4.3 | **Ordem de foco lógica** | ⏳ | CRÍTICO |
| 2.4.4 | Propósito dos links é claro pelo texto | ⏳ | Evitar "Clique aqui" |
| 2.4.5 | Múltiplas formas de encontrar páginas | N/A | SPA |
| 2.4.6 | Headings e labels são descritivos | ⏳ | |
| 2.4.7 | **Focus visível** | ⏳ | CRÍTICO |

### 2.5 Modalidades de Entrada

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 2.5.1 | Gestos multi-ponto têm alternativa de ponto único | ✅ | Sem gestos complexos |
| 2.5.2 | Pointer cancellation (pode cancelar clique) | ⏳ | |
| 2.5.3 | Label visível corresponde ao accessible name | ⏳ | |
| 2.5.4 | Ativação por movimento pode ser desabilitada | N/A | Sem motion activation |

---

## 3. Understandable (Compreensível)

### 3.1 Legível

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 3.1.1 | `lang="pt-BR"` definido no HTML | ⏳ | |
| 3.1.2 | Mudanças de idioma marcadas com `lang` | N/A | Conteúdo apenas PT |

### 3.2 Previsível

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 3.2.1 | Focus não muda contexto automaticamente | ⏳ | |
| 3.2.2 | Input não muda contexto sem aviso | ⏳ | |
| 3.2.3 | Navegação consistente entre páginas | ⏳ | |
| 3.2.4 | Componentes com mesma função têm identificação consistente | ⏳ | |

### 3.3 Assistência de Entrada

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 3.3.1 | Erros são identificados claramente | ⏳ | Validações |
| 3.3.2 | Labels ou instruções fornecidos | ⏳ | Todos os inputs |
| 3.3.3 | Sugestões de correção de erros fornecidas | ⏳ | |
| 3.3.4 | Prevenção de erros (confirmação antes de ações críticas) | ⏳ | Aprovar/Rejeitar |

---

## 4. Robust (Robusto)

### 4.1 Compatível

| ID | Critério | Status | Notas |
|----|----------|--------|-------|
| 4.1.1 | HTML válido (sem erros de parsing) | ⏳ | Validar com W3C |
| 4.1.2 | **Todos os componentes UI têm name, role, value** | ⏳ | CRÍTICO |
| 4.1.3 | Status messages identificados programaticamente | ⏳ | `role="status"` |

---

## 🧪 Testes Automatizados

### Ferramentas a Usar:

| Ferramenta | Propósito | Comando |
|------------|-----------|---------|
| **axe-core** | Testes automatizados WCAG | `@axe-core/playwright` |
| **Lighthouse** | Auditoria completa | Chrome DevTools |
| **WAVE** | Análise visual | Extensão Chrome |
| **Pa11y** | CI/CD testing | `npm run test:a11y` |

### Exemplo de Teste com axe-core:

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('deve ser acessível (WCAG AA)', async ({ page }) => {
  await page.goto('/dashboard/audits/123/create-content');

  await injectAxe(page);

  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
  });
});
```

---

## 🎤 Testes com Screen Readers

### Screen Readers a Testar:

| SO | Screen Reader | Como Instalar |
|----|---------------|---------------|
| **Windows** | NVDA | [nvaccess.org](https://www.nvaccess.org/) |
| **Windows** | JAWS | [freedomscientific.com](https://www.freedomscientific.com/) |
| **macOS** | VoiceOver | Integrado (Cmd+F5) |
| **Linux** | Orca | `sudo apt install orca` |
| **iOS** | VoiceOver | Settings > Accessibility |
| **Android** | TalkBack | Settings > Accessibility |

### Checklist de Testes com Screen Reader:

- [ ] **Navegação geral:**
  - [ ] Headings anunciados corretamente
  - [ ] Landmarks identificados (main, nav, etc.)
  - [ ] Ordem de leitura é lógica

- [ ] **Formulários:**
  - [ ] Labels associados a inputs
  - [ ] Erros anunciados claramente
  - [ ] Instruções lidas antes do input

- [ ] **Botões e Links:**
  - [ ] Propósito é claro pelo texto
  - [ ] Estado (disabled, pressed) anunciado
  - [ ] Loading states anunciados

- [ ] **Navegação por teclado:**
  - [ ] Tab order lógico
  - [ ] Focus visível e anunciado
  - [ ] Atalhos customizados funcionam

- [ ] **Preview/Conteúdo Dinâmico:**
  - [ ] Atualizações anunciadas (`aria-live`)
  - [ ] Status messages identificados
  - [ ] Mudanças de estado comunicadas

---

## 📊 Relatório de Conformidade

### Template de Relatório:

```markdown
# Relatório de Acessibilidade - [Componente/Página]

**Data:** YYYY-MM-DD
**Testador:** Nome
**Ferramentas:** axe-core, NVDA, Chrome DevTools

## ✅ Critérios Atendidos (X/38)

[Lista dos critérios que passaram]

## ❌ Issues Encontrados (X)

### Issue #1: [Descrição curta]
- **Severidade:** Crítica / Alta / Média / Baixa
- **WCAG:** 1.4.3 (Contraste)
- **Localização:** [Componente/Arquivo]
- **Descrição:** [Detalhes do problema]
- **Como reproduzir:** [Passos]
- **Sugestão de correção:** [Código/Abordagem]
- **Screenshot:** [Se aplicável]

## 📈 Score Geral: X%

- ✅ Level A: 100%
- ⚠️ Level AA: X%
- ⏳ Level AAA: N/A (não obrigatório)

## 🎯 Próximos Passos

1. [Priorizar issues críticos]
2. [Implementar correções]
3. [Re-testar]
```

---

## 🚦 Critérios de Aceitação

Para passar na validação de acessibilidade:

1. ✅ **100% dos critérios Level A** atendidos
2. ✅ **100% dos critérios Level AA** atendidos
3. ✅ **0 issues críticos** (bloqueadores)
4. ✅ **Score axe-core: 100%**
5. ✅ **Navegação por teclado: 100% funcional**
6. ✅ **Testado com pelo menos 2 screen readers**

---

## 📚 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Resources](https://webaim.org/resources/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

**Legenda:**
- ✅ Atendido / Testado
- ⏳ Pendente
- ❌ Não atendido (issue)
- N/A Não aplicável

---

*Última atualização: 2026-02-23*
*QA Team - Croko Lab*
