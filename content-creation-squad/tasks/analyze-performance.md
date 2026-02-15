# Task: Analyze Performance

**ID**: analyze-performance
**Agent**: content-lead
**Elicit**: true
**Duration**: 10-15 min

## Objetivo
Analisar performance de conteúdo publicado, comparar com benchmarks, identificar padrões e gerar recomendações acionáveis.

## Inputs Necessários

### 1. Dados do Post (OBRIGATÓRIO)
```yaml
elicit:
  - question: "Qual POST você quer analisar?"
    options:
      - Link do post
      - Screenshot de métricas
      - Inserir métricas manualmente

  - question: "Qual PLATAFORMA?"
    options:
      - Instagram
      - LinkedIn
      - Twitter

  - question: "MÉTRICAS do post (se não tiver screenshot)"
    fields:
      - Reach/Impressions: [número]
      - Engagement (total interações): [número]
      - Likes: [número]
      - Comments: [número]
      - Shares: [número]
      - Saves: [número]
      - Profile visits: [número]
      - Link clicks: [número]

  - question: "CONTEXTO do post"
    fields:
      - Data de publicação: [YYYY-MM-DD]
      - Horário de publicação: [HH:MM]
      - Objetivo original: [educar/vender/viral/autoridade]
      - Audiência-alvo: [descrição]
      - Tipo de conteúdo: [carrossel/reel/single/video]
      - Fórmula usada (se carrossel): [nome da fórmula]
```

## Workflow Executivo

### Passo 1: Coletar e Normalizar Métricas
**Ação**: Estruturar dados para análise

```
Métricas Essenciais:
- Reach/Impressions (quantos viram)
- Engagement Rate (% de interações)
- Saves Rate (% salvaram)
- Shares Rate (% compartilharam)
- Comments Rate (% comentaram)
- Profile Visits (quantos visitaram perfil)
- Link Clicks (se houver)

Métricas Derivadas:
- Engagement Rate = ((Likes + Comments + Shares + Saves) / Reach) * 100
- Save-to-Reach Ratio = (Saves / Reach) * 100
- Share-to-Reach Ratio = (Shares / Reach) * 100
- Virality Score = (Shares + Saves) / Likes
```

### Passo 2: Comparar com Benchmarks
**Usa**: `data/performance-benchmarks.json`

```
Para cada métrica, classificar:
- 🔴 RUIM: Abaixo do esperado
- 🟡 BOM: Dentro da média
- 🟢 EXCELENTE: Acima da média

Benchmarks Instagram (carrosséis):
- Reach: 10-30% dos seguidores = BOM | 40%+ = EXCELENTE
- Engagement: 5-8% = BOM | 10%+ = EXCELENTE
- Saves: 3-5% = BOM | 7%+ = EXCELENTE
- Shares: 2-3% = BOM | 5%+ = EXCELENTE

Benchmarks LinkedIn (carrosséis):
- Impressions: 1k-3k = BOM | 5k+ = EXCELENTE
- Engagement: 4-6% = BOM | 8%+ = EXCELENTE
- Comments: 10-20 = BOM | 30+ = EXCELENTE
- Shares: 5-10 = BOM | 15+ = EXCELENTE
```

### Passo 3: Análise Qualitativa
**Ação**: Analisar além dos números

```
Checklist de Análise:

1. HOOK (Slide 1)
   - [ ] Parou scroll? (ver primeiros segundos de reach)
   - [ ] Criou curiosidade?
   - [ ] Promessa clara?

2. PROGRESSÃO (Slides 2-9)
   - [ ] Qual slide teve mais paradas? (pedir insights se disponível)
   - [ ] Progressão lógica funcionou?
   - [ ] Conteúdo entregou promessa do hook?

3. CTA (Slide final)
   - [ ] CTA foi seguido? (ver tipo de engajamento)
   - [ ] Comentários mencionam o CTA?
   - [ ] Pediu ação certa para o objetivo?

4. COMENTÁRIOS
   - [ ] Positivos/Negativos/Neutros (ratio)
   - [ ] Perguntas feitas (mostra interesse)
   - [ ] Objeções levantadas
   - [ ] Tipo de comentário (emoji/frase/pergunta)

5. HORÁRIO
   - [ ] Horário otimizado para a audiência?
   - [ ] Dia da semana adequado?
```

### Passo 4: Identificar Padrões
**Ação**: Conectar pontos entre métricas e características do conteúdo

```
Patterns comuns:

HIGH SAVES + LOW SHARES
→ Conteúdo acionável mas não emocional
→ Recomendação: Adicionar elemento viral

HIGH ENGAGEMENT + LOW REACH
→ Audiência engajou mas algoritmo não distribuiu
→ Recomendação: Otimizar primeiros 30min de engajamento

HIGH REACH + LOW ENGAGEMENT
→ Hook parou scroll mas conteúdo não entregou
→ Recomendação: Revisar promessa vs entrega

MANY COMMENTS + FEW SAVES
→ Conteúdo gerou discussão mas não é referência
→ Recomendação: Adicionar mais acionabilidade
```

### Passo 5: Gerar Recomendações
**Ação**: Criar plano de ação baseado em insights

```
Estrutura:
1. O que MANTER (funcionou)
2. O que MUDAR (não funcionou)
3. O que TESTAR (hipóteses)
4. Próximos Passos (específicos)
```

## Output Esperado

```markdown
# ANÁLISE DE PERFORMANCE

## POST ANALISADO

### Identificação
- **Plataforma**: Instagram
- **Tipo**: Carrossel educacional
- **Data**: 2026-02-10
- **Horário**: 18:30
- **Link**: [URL ou screenshot]

### Objetivo Original
- **Primário**: Engagement + Saves
- **Secundário**: Demonstrar autoridade
- **Audiência-alvo**: Empreendedores digitais iniciantes
- **Fórmula usada**: Problema-Solução (8 slides)

---

## MÉTRICAS COLETADAS

### Números Brutos
| Métrica | Valor |
|---------|-------|
| Reach | 15.342 |
| Impressions | 18.891 |
| Seguidores (no momento) | 67.000 |
| Likes | 892 |
| Comments | 52 |
| Shares | 89 |
| Saves | 487 |
| Profile Visits | 234 |

### Métricas Derivadas
| Métrica | Valor | Fórmula |
|---------|-------|---------|
| Reach Rate | 22.9% | (15.342 / 67.000) * 100 |
| Engagement Rate | 7.2% | (1.520 / 15.342) * 100 |
| Save Rate | 3.2% | (487 / 15.342) * 100 |
| Share Rate | 0.6% | (89 / 15.342) * 100 |
| Comment Rate | 0.3% | (52 / 15.342) * 100 |
| Virality Score | 0.65 | (89 + 487) / 892 |

---

## BENCHMARKS COMPARISON

### Reach: 🟢 BOM (22.9%)
- Benchmark BOM: 15-30% dos seguidores
- Status: Dentro da faixa esperada
- Posição: Acima da média (+52% vs mínimo)

### Engagement: 🟢 EXCELENTE (7.2%)
- Benchmark BOM: 5-8%
- Benchmark EXCELENTE: 10%+
- Status: No topo da faixa BOM, próximo de EXCELENTE
- Posição: +44% acima da média (5%)

### Saves: 🟡 BOM (3.2%)
- Benchmark BOM: 3-5%
- Status: No mínimo da faixa BOM
- Posição: Pode melhorar para 5-7%

### Shares: 🔴 RUIM (0.6%)
- Benchmark BOM: 2-3%
- Status: Abaixo do esperado
- Gap: 70% abaixo do mínimo aceitável

### Comments: 🟡 MÉDIO (52 comentários)
- Benchmark BOM: 50-100
- Status: No limite inferior
- Qualidade: [a analisar]

---

## ANÁLISE QUALITATIVA

### ✅ O QUE FUNCIONOU

#### 1. Hook Efetivo
- **Evidência**: Reach de 22.9% indica que muitos pararam para ver
- **Análise**: Hook prometeu solução específica e audiência respondeu
- **Comentários**: Vários mencionaram "finalmente alguém fala sobre isso"

#### 2. Conteúdo Acionável
- **Evidência**: 487 saves (3.2%)
- **Análise**: Pessoas querem revisitar o conteúdo
- **Conclusão**: Conteúdo tem valor prático

#### 3. CTA Claro
- **Evidência**: 52 comentários respondendo à pergunta do CTA
- **Análise**: 85% dos comentários são respostas diretas ao CTA
- **Conclusão**: CTA foi seguido

#### 4. Timing Adequado
- **Evidência**: Publicado às 18:30 (horário de pico)
- **Análise**: Primeiras 2h tiveram 60% do reach total
- **Conclusão**: Horário otimizado

---

### ⚠️ O QUE PODE MELHORAR

#### 1. Baixo Compartilhamento
- **Problema**: Apenas 89 shares (0.6% - muito abaixo dos 2-3%)
- **Diagnóstico**: Conteúdo não é compartilhável
  - Falta elemento viral
  - Muito "sério" ou técnico
  - Sem hook emocional para compartilhar
- **Impacto**: Perdeu oportunidade de alcance orgânico

#### 2. Saves Podem Melhorar
- **Situação**: 3.2% é BOM mas poderia ser 5-7% (EXCELENTE)
- **Diagnóstico**:
  - Talvez faltou um "save this post" no CTA
  - Conteúdo acionável mas não checklistável
- **Oportunidade**: +50% saves com pequenos ajustes

#### 3. Engagement Poderia Ser EXCELENTE
- **Situação**: 7.2% é BOM, falta 2.8% para EXCELENTE (10%)
- **Diagnóstico**:
  - Faltou elemento polêmico/controverso
  - Comentários são curtos (emoji mostly)
  - Sem perguntas provocativas nos slides
- **Oportunidade**: Versão A/B com hot take poderia atingir 10%+

---

## ANÁLISE DE COMENTÁRIOS

### Distribuição (52 comentários)
- 🟢 Positivos: 38 (73%)
- 🔴 Negativos: 2 (4%)
- 🟡 Neutros/Perguntas: 12 (23%)

### Tipo de Comentário
- Emoji apenas: 18 (35%)
- Resposta ao CTA: 22 (42%)
- Perguntas: 8 (15%)
- Objeções: 2 (4%)
- Outros: 2 (4%)

### Insights dos Comentários
1. **Pergunta mais comum**: "Como aplicar isso em [nicho específico]?"
   → Oportunidade: Criar follow-up sobre aplicações

2. **Objeção mencionada**: "Isso não funciona para pequenos negócios"
   → Oportunidade: Endereçar em próximo post

3. **Feedback positivo**: "Finalmente alguém ensina isso de forma simples"
   → Fortaleza: Simplicidade e clareza

---

## PADRÕES IDENTIFICADOS

### Pattern 1: High Engagement + Low Shares
**Diagnóstico**: Conteúdo ÚTIL mas não COMPARTILHÁVEL
- Audiência salva para si
- Não sente necessidade de compartilhar
- Falta elemento emocional/viral

**Solução**: Adicionar elemento compartilhável
- Hot take no slide 2-3
- Stat chocante
- Ou: meme/metáfora visual

---

### Pattern 2: Boa Retenção (Saves)
**Diagnóstico**: Conteúdo tem VALOR DE REFERÊNCIA
- Pessoas querem rever
- Acionável e prático
- Bem estruturado

**Oportunidade**: Transformar em série
- "Parte 2" com aprofundamento
- Checklist downloadável
- Template no Canva

---

## COMPARAÇÃO COM POSTS ANTERIORES

| Post | Reach | Engagement | Saves | Shares |
|------|-------|------------|-------|--------|
| Este | 22.9% | 7.2% | 3.2% | 0.6% |
| Anterior 1 | 18.5% | 5.8% | 4.1% | 1.2% |
| Anterior 2 | 25.3% | 6.9% | 2.8% | 2.5% |
| Média últimos 10 | 20.1% | 6.3% | 3.5% | 1.8% |

**Insights**:
- Reach: +14% acima da média ✅
- Engagement: +14% acima da média ✅
- Saves: -8% abaixo da média ⚠️
- Shares: -67% abaixo da média 🔴

---

## RECOMENDAÇÕES ACIONÁVEIS

### 🔧 MANTER (funcionou)

1. **Hook + Estrutura**
   - Hook específico parou scroll
   - 8 slides = tamanho ideal
   - Progressão lógica clara

2. **Horário de Publicação**
   - 18:30 capturou pico de audiência
   - Primeiras 2h otimizadas

3. **Tipo de Conteúdo**
   - Educacional acionável
   - Linguagem simples e direta

---

### 🔄 MUDAR (não funcionou)

1. **Adicionar Elemento Compartilhável**
   - Slide 2-3: Incluir stat chocante ou hot take
   - Exemplo: "87% dos criadores cometem esse erro (inclusive grandes)"
   - Objetivo: Aumentar shares de 0.6% → 2-3%

2. **Otimizar para Saves**
   - Último slide: Adicionar "Salva para revisar antes de criar seu próximo post"
   - Ou: Transformar em checklist visual
   - Objetivo: Aumentar saves de 3.2% → 5-7%

---

### 🧪 TESTAR (hipóteses)

1. **Versão Polêmica**
   - Mesma estrutura + hot take no início
   - Hipótese: Aumenta shares e comentários
   - Métrica-alvo: 10%+ engagement, 2%+ shares

2. **Horários Alternativos**
   - Testar 09:00 e 12:00
   - Hipótese: Capturar audiência matinal
   - Métrica-alvo: Comparar reach rate

3. **CTA Duplo**
   - "Salva + comenta qual vai testar primeiro"
   - Hipótese: Aumenta ambas métricas
   - Métrica-alvo: +30% saves, +50% comments

---

## PRÓXIMOS PASSOS

### ✅ Imediato (24h)
- [ ] Responder todos os 52 comentários (aumenta reach)
- [ ] Analisar quais slides tiveram mais "paradas" (Instagram Insights)
- [ ] Salvar este post como referência de "boa performance"

### 📅 Curto Prazo (7 dias)
- [ ] Criar "Parte 2" baseado nas 8 perguntas dos comentários
- [ ] Testar versão A/B com elemento controverso
- [ ] Publicar em horário alternativo (09:00) e comparar

### 🎯 Médio Prazo (30 dias)
- [ ] Criar série de 4 posts sobre aplicações específicas
- [ ] Desenvolver checklist/template downloadável
- [ ] Endereçar objeção em post dedicado

---

## SCORE FINAL: 78/100

### Breakdown
| Critério | Score | Peso | Ponderado |
|----------|-------|------|-----------|
| Reach | 8/10 | 15% | 1.2 |
| Engagement | 9/10 | 30% | 2.7 |
| Saves | 7/10 | 20% | 1.4 |
| Shares | 3/10 | 15% | 0.45 |
| Comments | 7/10 | 10% | 0.7 |
| Objetivo atingido | 8/10 | 10% | 0.8 |
| **TOTAL** | **78/100** | **100%** | **7.8/10** |

### Classificação: 🟢 BOM POST
- 70-79: BOM
- 80-89: MUITO BOM
- 90-100: EXCELENTE

**Próximo objetivo**: Atingir 85+ (MUITO BOM) otimizando shares e saves.

---

## RECURSOS UTILIZADOS

- Benchmarks: `data/performance-benchmarks.json`
- Fórmula de engagement: `((likes + comments + shares + saves) / reach) * 100`
- Análise qualitativa: Leitura manual de comentários
- Comparação histórica: Últimos 10 posts

---

## APRENDIZADOS-CHAVE

1. ✅ **Conteúdo educacional acionável gera saves**
2. ✅ **Hook específico para scroll em horário de pico funciona**
3. ⚠️ **Conteúdo útil ≠ conteúdo compartilhável** (precisa de elemento emocional)
4. ⚠️ **CTA pode ser duplo** (salvar + comentar)
5. 🔄 **Testar variações com hot takes** para aumentar viralidade
```

## Variação: Análise Rápida (5 min)

Para análise express sem detalhamento:

```markdown
# ANÁLISE RÁPIDA

## Métricas vs Benchmarks
- Reach: 22.9% 🟢 BOM
- Engagement: 7.2% 🟢 EXCELENTE
- Saves: 3.2% 🟡 MÉDIO
- Shares: 0.6% 🔴 RUIM

## O que fazer
1. Manter hook e estrutura
2. Adicionar elemento compartilhável (stat/hot take)
3. CTA mais direto para saves

## Score: 78/100 (BOM)
```

## Referências

- **Benchmarks**: `data/performance-benchmarks.json`
- **Fórmulas**: `data/carousel-formulas.json`
- **Métricas-chave**: Engagement rate, Save rate, Virality score
