# Task: Audit Content

**ID**: audit-content
**Agent**: copy-auditor
**Elicit**: true
**Duration**: 10-20 min

## Objetivo
Auditar um conjunto específico de posts (carrosséis, reels, stories) para avaliar
qualidade de copy, efetividade de mensagem e potencial de conversão.

## Inputs Necessários

```yaml
elicit:
  - question: "Cole os posts para análise (caption + dados de performance)"
    placeholder: "Cole o texto dos posts ou JSON do scraper"

  - question: "Quantos posts analisar?"
    options:
      - Amostra rápida (5-10 posts)
      - Análise padrão (10-30 posts)
      - Análise completa (30+ posts)

  - question: "Qual o objetivo dos posts analisados?"
    options:
      - Engajamento e alcance
      - Geração de leads
      - Vendas diretas
      - Construção de autoridade
      - Misto / não definido
```

## Critérios de Análise

### Por Post
- Hook Score (0-100)
- Awareness Stage classificado
- CTA presente e efetivo? (Sim/Não)
- Especificidade: alto/médio/baixo
- Mecanismo único: presente/ausente

### Por Conta (agregado)
- Distribuição de Awareness Stages
- Hook Score médio e mediano
- Taxa de posts com CTA efetivo
- Consistência de mensagem central
- Evolução de qualidade ao longo do tempo

## Output
- Tabela de classificação de posts
- Score médio da conta
- Padrões encontrados
- Top 3 posts e por que funcionaram
- Bottom 3 posts e o que falharam
- Recomendações de melhoria imediata
