# Task: Audit Account

**ID**: audit-account
**Agent**: audit-lead
**Elicit**: true
**Duration**: 20-40 min

## Objetivo
Auditoria completa de uma conta de Instagram ou rede social com dados de scraping.
Gera relatório com score, insights e recomendações priorizadas.

## Inputs Necessários

```yaml
elicit:
  - question: "Qual conta será auditada?"
    placeholder: "@username ou URL do perfil"

  - question: "Qual o formato dos dados disponíveis?"
    options:
      - JSON do scraper (completo)
      - CSV com posts e métricas
      - Colar dados manualmente
      - Apenas URL (análise qualitativa)

  - question: "Qual o foco principal da auditoria?"
    options:
      - Auditoria Completa (todos os ângulos)
      - Foco em Copy & Mensagem
      - Foco em Engajamento & Métricas
      - Foco em Ofertas & Conversão
      - Análise Competitiva

  - question: "Há contexto adicional relevante?"
    placeholder: "Ex: nicho, produto vendido, objetivo da conta, concorrentes"
```

## Workflow de Execução

### Passo 1: Ingestão de Dados
**Agente**: audit-lead
```
- Processar e estruturar dados recebidos
- Identificar período de análise
- Catalogar tipos de conteúdo encontrados
- Mapear frequência de publicação
```

### Passo 2: Análise Comportamental
**Mente**: daniel_kahneman
```
Analisar:
✓ Padrão de engajamento (curtidas, comentários, salvamentos, compartilhamentos)
✓ System 1 vs System 2: reações impulsivas vs intencionais
✓ Ruído vs Viés: quais métricas são consistentes vs aleatórias
✓ Loss Aversion: audiência retorna por medo de perder ou por valor?
✓ Heurísticas: quais atalhos mentais os posts ativam
```

### Passo 3: Auditoria de Copy
**Mente**: eugene_schwartz
```
Analisar cada post:
✓ Awareness Stage de cada conteúdo
✓ Hook Score (0-100) da amostra
✓ Market Sophistication Level do nicho
✓ Especificidade e credibilidade
✓ Mecanismo único presente ou ausente
```

### Passo 4: Auditoria de Oferta
**Mente**: alex_hormozi
```
Analisar CTAs e ofertas:
✓ Value Equation de cada CTA identificado
✓ Grand Slam Offer: existe na conta?
✓ Vocabulário: mandatório vs proibido detectado
✓ Prova social quantificável presente
✓ Risco invertido ou garantia presente
```

### Passo 5: Análise de Métricas
**Mente**: marty_cagan
```
Avaliar dados:
✓ Outputs vs Outcomes separados
✓ Four Risks Assessment
✓ Discovery vs Delivery mode
✓ North Star Metric identificada ou ausente
✓ Métricas de vaidade vs tração real
```

### Passo 6: Detecção de Anomalias
**Mente**: paul_graham
```
Identificar:
✓ Top 5 posts que fogem do padrão (positivo/negativo)
✓ Consenso falso que a conta segue
✓ Oportunidades contraintuitivas
✓ Coerência temporal
✓ Hipóteses a testar
```

### Passo 7: Relatório Final
**Agente**: audit-lead
```
Consolidar em:
✓ Score Card Geral (0-100)
✓ Score por dimensão (5 scores)
✓ Top 3 pontos fortes
✓ Top 3 pontos críticos
✓ 5 recomendações priorizadas por impacto
✓ Quick Wins (pode executar hoje)
✓ Strategic Moves (para próximos 30-90 dias)
```

## Output Final
Arquivo: `output/audit-[username]-[data].md`

Template: `templates/audit-report.md`
