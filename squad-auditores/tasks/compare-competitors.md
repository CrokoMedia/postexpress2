# Task: Compare Competitors

**ID**: compare-competitors
**Agent**: audit-lead
**Elicit**: true
**Duration**: 30-50 min

## Objetivo
Comparar a conta auditada com 2-4 concorrentes diretos para identificar gaps,
oportunidades e vantagens competitivas baseadas em dados de scraping.

## Inputs Necessários

```yaml
elicit:
  - question: "Qual é a conta principal (cliente/foco)?"
    placeholder: "@username"

  - question: "Quais concorrentes comparar?"
    placeholder: "@concorrente1, @concorrente2, @concorrente3"

  - question: "Dados disponíveis:"
    options:
      - Tenho scraping de todos
      - Tenho só da conta principal
      - Tenho análise manual parcial
```

## Análise Comparativa

### Dimensões de Comparação

```
| Dimensão              | Peso | Conta | C1 | C2 | C3 |
|----------------------|------|-------|----|----|-----|
| Hook Quality          | 25%  |       |    |    |     |
| Awareness Coverage    | 20%  |       |    |    |     |
| Value Equation CTAs   | 20%  |       |    |    |     |
| Engagement Quality    | 20%  |       |    |    |     |
| Content Consistency   | 15%  |       |    |    |     |
```

### Análise por Mente

**Kahneman**: Qual conta ativa mais emoções genuínas vs manipulação?
**Schwartz**: Qual conta tem melhor coverage de Awareness Stages?
**Hormozi**: Qual conta tem a oferta mais clara e irresistível?
**Cagan**: Qual conta tem melhores outcomes vs outputs?
**Paul Graham**: Qual conta está fazendo algo diferente que funciona?

## Output
- Competitive Matrix completa
- Ranking das contas por dimensão
- Gaps de oportunidade identificados
- Estratégias dos concorrentes que a conta deveria adotar
- Vantagens competitivas da conta que devem ser amplificadas
