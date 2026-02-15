# Task: Optimize Copy

**ID**: optimize-copy
**Agent**: content-lead
**Elicit**: true
**Duration**: 10-15 min

## Objetivo
Otimizar copy de carrossel existente para maximizar conversão, engagement ou saves.

## Inputs Necessários

### 1. Carrossel Existente (OBRIGATÓRIO)
```yaml
elicit:
  - question: "Qual carrossel você quer otimizar?"
    placeholder: "Cole o texto completo do carrossel (todos os slides) ou caminho do arquivo"

  - question: "Qual o OBJETIVO da otimização?"
    options:
      - Aumentar conversão (vendas/leads)
      - Aumentar engagement (comentários/likes)
      - Aumentar saves (salvamentos)
      - Aumentar shares (compartilhamentos)
      - Melhorar clareza da mensagem
      - Outro

  - question: "Qual a PLATAFORMA atual?"
    options:
      - Instagram
      - LinkedIn
      - Ambas

  - question: "Pode REESTRUTURAR ou apenas ajustar copy?"
    options:
      - Apenas ajustar copy (manter estrutura)
      - Pode reestruturar slides
      - Liberdade total
```

## Workflow Executivo

### Passo 1: Análise do Carrossel Original
**Ação**: Ler e analisar carrossel existente

```
Checklist de problemas comuns:
- [ ] Hook fraco (não para scroll)
- [ ] Falta de especificidade (genérico demais)
- [ ] Benefícios não claros
- [ ] CTA fraco ou inexistente
- [ ] Slides muito longos (>3 linhas)
- [ ] Falta de progressão lógica
- [ ] Sem prova social ou credibilidade
- [ ] Linguagem muito técnica ou muito simples
- [ ] Não adequado para a plataforma
- [ ] Falta de emotional trigger
```

### Passo 2: Identificar Problemas Específicos
**Ativa**: eugene_schwartz

```
Prompt:
"Analise este carrossel:
[carrossel original]

Identifique:
1. Awareness stage da audiência (detectar pelo hook)
2. Principais problemas de copy
3. Oportunidades perdidas
4. Score geral (0-100) em cada critério:
   - Hook strength
   - Specificity
   - Benefit clarity
   - Emotional trigger
   - Credibility
   - CTA clarity
   - Readability
   - Platform fit
5. Diagnóstico final"
```

### Passo 3: Consultar Mentes Apropriadas
**Ação**: Selecionar mente baseado no objetivo

**Se objetivo = Conversão/Vendas**:
- Ativa: alex_hormozi
- Foco: Value stack, urgência, garantia, price anchoring

**Se objetivo = Engagement/Viral**:
- Ativa: seth_godin
- Foco: Remarkable, shareability, storytelling

**Se objetivo = Saves/Educacional**:
- Ativa: eugene_schwartz
- Foco: Especificidade, acionabilidade, estrutura clara

**Se audiência brasileira**:
- Ativa também: thiago_finch
- Foco: Localização, referências culturais

### Passo 4: Gerar Versões Otimizadas
**Ação**: Criar versão(ões) melhorada(s)

```
Gere:
1. Versão Otimizada Principal
   - Hook 3x mais forte
   - Copy específico e direto
   - Progressão emocional clara
   - CTA irresistível

2. Variação A/B (opcional)
   - Hook alternativo
   - Estrutura diferente
   - Tom de voz diferente

3. Justificativas das mudanças
   - Por que cada mudança foi feita
   - Princípios aplicados
   - Resultado esperado
```

### Passo 5: Comparação Lado-a-Lado
**Output**: Apresentar ANTES vs DEPOIS

## Output Esperado

```markdown
# OTIMIZAÇÃO DE CARROSSEL

## BRIEFING
- Objetivo: [objetivo da otimização]
- Plataforma: [Instagram/LinkedIn]
- Tipo de otimização: [ajuste/reestrutura/total]

---

## ANÁLISE DO ORIGINAL

### Score Geral: XX/100

**Pontuação por critério (0-10):**
1. Hook strength: X/10
2. Specificity: X/10
3. Benefit clarity: X/10
4. Emotional trigger: X/10
5. Credibility: X/10
6. CTA clarity: X/10
7. Readability: X/10
8. Platform fit: X/10

### PROBLEMAS IDENTIFICADOS

1. **Hook fraco**
   - Original: "[hook original]"
   - Problema: Não cria curiosidade, muito genérico

2. **Falta de especificidade**
   - Exemplo: "Dicas para vender mais" → muito vago
   - Deveria ser: "7 técnicas que geraram R$ 150k em 30 dias"

3. **CTA genérico**
   - Original: "Gostou? Comenta aqui"
   - Problema: Não conecta com o conteúdo

4. [... outros problemas ...]

---

## CARROSSEL ORIGINAL

### SLIDE 1 (HOOK)
**Título**: [texto original]
**Subtexto**: [texto original]

### SLIDE 2
**Título**: [texto original]
**Subtexto**: [texto original]

[... todos os slides ...]

---

## VERSÃO OTIMIZADA ✨

### SLIDE 1 (HOOK) - NOVO
**Título**: [novo texto - MELHORADO]
**Subtexto**: [novo texto - MELHORADO]
**Mudança**: [explicação da melhoria]

### SLIDE 2 - NOVO
**Título**: [novo texto]
**Subtexto**: [novo texto]
**Mudança**: [explicação da melhoria]

[... todos os slides otimizados ...]

---

## MELHORIAS APLICADAS

### 1. Hook (Slide 1)
**ANTES**: "Dicas para vender mais"
**DEPOIS**: "7 erros que custaram R$ 300k (e como evitá-los)"
**Princípio**: Especificidade + Stakes altos (Eugene Schwartz)
**Impacto esperado**: +80% scroll stop rate

### 2. Especificidade (Slides 2-8)
**ANTES**: "Use bons títulos"
**DEPOIS**: "Título com número ímpar + palavra de urgência aumenta CTR em 43%"
**Princípio**: Dados concretos criam credibilidade
**Impacto esperado**: +60% saves

### 3. CTA (Slide final)
**ANTES**: "Gostou? Comenta"
**DEPOIS**: "Qual desses 7 erros você comete? Seja honesto nos comentários 👇"
**Princípio**: CTA específico + convite honesto
**Impacto esperado**: +120% comentários

### 4. [... outras melhorias ...]

---

## VARIAÇÃO A/B (OPCIONAL)

### Hook Alternativo
**Opção A** (conservadora): "[hook mais seguro]"
**Opção B** (agressiva): "[hook mais polêmico]"

**Recomendação**: Testar opção B se audiência já engajada

---

## MÉTRICAS ESPERADAS

Baseado em otimizações similares:

### Original (estimado)
- Reach: 10-15% dos seguidores
- Engagement: 2-3%
- Saves: 1-2%
- Comments: 10-20

### Otimizado (projeção)
- Reach: 20-30% dos seguidores (+100%)
- Engagement: 5-7% (+150%)
- Saves: 4-6% (+200%)
- Comments: 30-60 (+200%)

**Confiança**: 🟢 Alta (baseado em princípios comprovados)

---

## PRÓXIMOS PASSOS

1. ✅ Aplicar versão otimizada
2. 📊 Testar A/B do hook (se possível)
3. ⏱️ Publicar em horário de pico
4. 📈 Analisar métricas em 24h-48h
5. 🔄 Iterar baseado nos dados

---

## RECURSOS UTILIZADOS

- Princípios: Eugene Schwartz (Breakthrough Advertising)
- Hook Templates: data/hooks-database.json
- Fórmulas: data/carousel-formulas.json
- Benchmarks: data/performance-benchmarks.json
```

## Variação: Otimização Rápida (5 min)

Para otimização express sem análise detalhada:

```markdown
# OTIMIZAÇÃO RÁPIDA

## MUDANÇAS PRINCIPAIS

1. **Hook**: [antes] → [depois]
2. **Especificidade**: Adicionados números e dados concretos
3. **CTA**: [antes] → [depois]

## CARROSSEL OTIMIZADO
[slides completos]

## EXPECTATIVA
Aumento de 30-50% nas métricas principais
```

## Princípios de Otimização

### Regra 80/20
80% do resultado vem de otimizar:
1. Hook (slide 1)
2. Especificidade (números, dados)
3. CTA (slide final)

### Checklist Express
- [ ] Hook cria curiosidade OU especifica benefício claro?
- [ ] Cada slide tem MAX 3 linhas?
- [ ] Tem pelo menos 3 números/dados concretos?
- [ ] CTA conecta com o conteúdo?
- [ ] Zero palavras vazias? ("muito", "super", "incrível" sem contexto)

## Referências

- **Banco de Hooks**: `data/hooks-database.json`
- **Fórmulas Comprovadas**: `data/carousel-formulas.json`
- **Benchmarks**: `data/performance-benchmarks.json`

## Tips Pro

1. **Um problema por vez** - Não otimize tudo de uma vez
2. **Teste A/B hooks** - Hook decide 80% do sucesso
3. **Especificidade > criatividade** - Dados concretos > frases bonitas
4. **CTA = continuação** - Deve conectar com o conteúdo
5. **Menos palavras** - Corte 30-50% do texto original
