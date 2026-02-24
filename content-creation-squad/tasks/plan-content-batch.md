# Task: Plan Content Batch

**ID**: plan-content-batch
**Agent**: content-lead
**Elicit**: true
**Duration**: 15-25 min

## Objetivo
Planejar lote de carrosséis (calendário editorial estratégico) com mix balanceado de objetivos, temas e formatos.

## Inputs Necessários

### 1. Briefing do Lote (OBRIGATÓRIO)
```yaml
elicit:
  - question: "Quantos CARROSSÉIS você quer planejar?"
    options:
      - 10 carrosséis
      - 15 carrosséis
      - 20 carrosséis
      - 30 carrosséis
      - Outro (especificar)

  - question: "Para qual PERÍODO?"
    placeholder: "Ex: 30 dias, Março 2026, Q1 2026"

  - question: "Qual FREQUÊNCIA de publicação?"
    options:
      - 1x/semana
      - 2x/semana
      - 3x/semana
      - 5x/semana (diário útil)
      - 7x/semana (diário)
      - Irregular (especificar)

  - question: "Qual a PLATAFORMA?"
    options:
      - Instagram
      - LinkedIn
      - Ambas (cross-posting)

  - question: "MIX de objetivos (total = 100%)"
    fields:
      - Educacional (ensinar/dicas): ___%
      - Autoridade (frameworks/insights): ___%
      - Vendas (ofertas/produtos): ___%
      - Viral (polêmico/emocional): ___%

  - question: "PILARES de conteúdo (temas principais)"
    placeholder: "Ex: Copywriting (40%), Instagram Growth (30%), Vendas (30%)"

  - question: "Alguma DATA ESPECIAL a considerar?"
    placeholder: "Ex: Lançamento em 15/03, Black Friday, etc."
```

## Workflow Executivo

### Passo 1: Estratégia de Lote (Seth Godin)
**Ativa**: seth_godin

```
Prompt:
"Baseado neste briefing:
- Quantidade: [X] carrosséis
- Período: [período]
- Frequência: [frequência]
- Mix: [% educacional / % autoridade / % vendas / % viral]
- Pilares: [pilares]

Defina:
1. Estratégia geral do lote (qual narrativa construir?)
2. Sequência ideal (qual ordem contar a história?)
3. Balanceamento give vs ask (quanto educar antes de vender?)
4. Datas estratégicas (quando publicar o quê?)
5. Como tornar o calendário remarkable?"
```

### Passo 2: Distribuição no Calendário
**Ação**: Criar estrutura temporal

```
Regras de distribuição:

1. SEQUÊNCIA ESTRATÉGICA
   - Começar com educacional (construir confiança)
   - Autoridade no meio (demonstrar expertise)
   - Vendas após trust estabelecido
   - Viral espaçado para manter reach

2. ALTERNÂNCIA
   - Nunca 2 posts de vendas seguidos
   - Máximo 1 viral por semana
   - Mínimo 1 educacional por semana

3. PROGRESSÃO
   - Semana 1: 80% educacional (construir audiência)
   - Semana 2-3: 60% educacional + 40% autoridade
   - Semana 4+: Mix balanceado com vendas

4. DATAS ESPECIAIS
   - 7 dias antes: Preparação/teaser
   - 3 dias antes: Aquecimento
   - Dia do evento: Lançamento
   - Pós-evento: Resultados/prova social
```

### Passo 3: Planejar Cada Carrossel
**Ação**: Definir estrutura de cada post

```
Para cada carrossel, especificar:

1. DATA DE PUBLICAÇÃO
   - Dia da semana
   - Horário sugerido

2. OBJETIVO
   - Educar / Autoridade / Vender / Viral

3. PILAR
   - Qual tema/pilar de conteúdo

4. FÓRMULA RECOMENDADA
   - Consultar data/carousel-formulas.json
   - Escolher fórmula apropriada para objetivo

5. MENTE LÍDER
   - Qual das 4 mentes deve liderar
   - Eugene (copy), Seth (estratégia), Alex (vendas), Thiago (BR)

6. HOOK SUGERIDO
   - Template de hook (de hooks-database.json)
   - Personalizado para o tema

7. MENSAGEM PRINCIPAL
   - Em 1 frase, o que comunicar

8. CTA
   - Qual ação pedir (comentar/salvar/compartilhar/link)
```

### Passo 4: Validação e Balanceamento
**Checklist de qualidade do lote**:

```
Diversidade:
- [ ] Fórmulas variadas (não repetir mesma fórmula 3x)
- [ ] Hooks variados (diferentes emotional triggers)
- [ ] CTAs variados (não pedir sempre "comenta")
- [ ] Pilares balanceados conforme solicitado

Estratégia:
- [ ] Give-to-Ask Ratio adequado (min 3:1 antes de vender)
- [ ] Progressão lógica (construir trust antes de ask)
- [ ] Sequência conta história coesa
- [ ] Datas especiais bem aproveitadas

Exequibilidade:
- [ ] Tempo para produção viável
- [ ] Recursos disponíveis
- [ ] Possível agendar com antecedência
```

### Passo 5: Timeline de Produção
**Ação**: Planejar execução

```
Sugerir cronograma:

Semana -2: Planejamento
- Aprovar calendário
- Definir templates visuais
- Preparar recursos

Semana -1: Produção em lote
- Usar workflow/batch-production.md
- Criar todos os carrosséis
- Design visual

Semana 0: Revisão e Agendamento
- Review final
- Agendar todos os posts
- Preparar captions

Semanas 1-N: Publicação e Análise
- Posts publicam automaticamente
- Responder comentários
- Analisar métricas
- Ajustar próximos se necessário
```

## Output Esperado

```markdown
# PLANEJAMENTO DE LOTE - [Nome/Período]

## BRIEFING

### Especificações
- **Quantidade**: 12 carrosséis
- **Período**: Março 2026 (30 dias)
- **Frequência**: 3x/semana (Seg, Qua, Sex)
- **Plataforma**: Instagram
- **Datas especiais**: Lançamento do produto em 22/03

### Mix Estratégico
- 🎓 Educacional: 50% (6 carrosséis)
- 👑 Autoridade: 30% (4 carrosséis)
- 💰 Vendas: 20% (2 carrosséis)

### Pilares de Conteúdo
1. **Copywriting**: 40% (5 carrosséis)
2. **Instagram Growth**: 30% (4 carrosséis)
3. **Marketing Digital**: 30% (3 carrosséis)

---

## ESTRATÉGIA GERAL (Seth Godin)

### Narrativa do Mês
Este calendário conta a história: "Da teoria à prática em copywriting para Instagram"

**Arco narrativo**:
- Semana 1: Fundamentos (ensinar conceitos)
- Semana 2: Aplicação (demonstrar expertise)
- Semana 3: Preparação (aquecer para oferta)
- Semana 4: Conversão (vender + entregar)

### Give-to-Ask Ratio
- Give: 10 carrosséis educacionais/autoridade
- Ask: 2 carrosséis de vendas
- Ratio: 5:1 (muito saudável)

### Elementos Remarkable
1. **Sequência "Before-After"**: Posts 1-2 mostram problema, 3-4 solução
2. **Framework exclusivo**: Post 6 introduz método proprietário
3. **Live examples**: Posts 7-8 desconstroem casos reais
4. **Community input**: Post 9 usa perguntas da audiência

---

## CALENDÁRIO EDITORIAL

### Semana 1: FUNDAMENTOS (Mar 3-9)
🎯 Objetivo: Construir confiança, educar, posicionar como autoridade

---

#### 📅 Mar 3 (Segunda) - Post #1
**Tipo**: 🎓 EDUCACIONAL
**Pilar**: Copywriting (40%)

**Objetivo**: Educar sobre erros comuns
**Fórmula**: Problema-Solução (8 slides)
**Mente líder**: Eugene Schwartz

**Hook sugerido**:
"7 erros de copy que custaram R$ 300k (e como evitá-los)"
- Template: Especificidade + Stakes altos
- Emotional trigger: Fear + Curiosity

**Mensagem principal**:
Erros de copywriting são caros e evitáveis

**Estrutura**:
1. Hook: 7 erros + custo
2. Contexto: Por que isso importa
3. Erro #1: Hook genérico
4. Erro #2: Falta especificidade
5. Erro #3: Falar features vs benefícios
6. Erro #4: CTA fraco
7. Erro #5: Não usar prova social
8. Resumo + CTA

**CTA**: "Qual desses erros você comete? Seja honesto nos comentários 👇"
**CTA tipo**: Engagement (comentários)

**Horário sugerido**: 18:30
**Recursos**: Imagens de exemplos antes/depois

**Métricas esperadas**:
- Reach: 20-30% (educacional performa bem)
- Saves: 5-7% (acionável)
- Comments: 50-100 (CTA direto)

---

#### 📅 Mar 5 (Quarta) - Post #2
**Tipo**: 🎓 EDUCACIONAL
**Pilar**: Instagram Growth (30%)

**Objetivo**: Ensinar método acionável
**Fórmula**: Lista Numérica (7 slides)
**Mente líder**: Seth Godin

**Hook sugerido**:
"5 hooks testados em 1000+ carrosséis. Use esses."
- Template: Prova social + Comando direto
- Emotional trigger: Trust + Curiosity

**Mensagem principal**:
Hooks comprovados que você pode usar hoje

**Estrutura**:
1. Hook: 5 hooks testados
2. Hook #1: "X erros que [consequência]"
3. Hook #2: "Você está perdendo [valor]"
4. Hook #3: "[Número]% das pessoas [stat]"
5. Hook #4: "Como [resultado] sem [objeção]"
6. Hook #5: "O método de [autoridade]"
7. CTA: Salvar + usar

**CTA**: "Salva e testa no seu próximo carrossel. Depois me conta qual usou"
**CTA tipo**: Save + Engagement

**Horário sugerido**: 09:00
**Recursos**: Tipografia bold para cada hook

**Métricas esperadas**:
- Reach: 15-25%
- Saves: 8-10% (muito acionável)
- Shares: 2-3%

---

#### 📅 Mar 7 (Sexta) - Post #3
**Tipo**: 👑 AUTORIDADE
**Pilar**: Copywriting (40%)

**Objetivo**: Demonstrar expertise, introduzir framework
**Fórmula**: Framework (6 slides)
**Mente líder**: Eugene Schwartz + Seth Godin

**Hook sugerido**:
"Framework R.A.C.E.: Como escrevi 100+ carrosséis virais"
- Template: Framework com sigla memorável
- Emotional trigger: Curiosity + Authority

**Mensagem principal**:
Método sistemático para criar carrosséis de alta performance

**Estrutura**:
1. Hook: Framework R.A.C.E.
2. R - Research (pesquisar audiência)
3. A - Angle (escolher ângulo único)
4. C - Copy (escrever com estrutura)
5. E - Engage (CTA irresistível)
6. Aplicação: Como usar hoje

**CTA**: "Comenta RACE se quer template completo grátis"
**CTA tipo**: Engagement + Lead magnet

**Horário sugerido**: 18:30
**Recursos**: Diagrama visual do framework

**Métricas esperadas**:
- Reach: 25-35% (frameworks performam bem)
- Engagement: 8-10%
- Comments: 100-200 (pedindo template)

---

### Semana 2: APLICAÇÃO (Mar 10-16)
🎯 Objetivo: Demonstrar como aplicar, aumentar autoridade

---

#### 📅 Mar 10 (Segunda) - Post #4
**Tipo**: 🎓 EDUCACIONAL
**Pilar**: Marketing Digital (30%)

**Objetivo**: Ensinar aplicação prática
**Fórmula**: Case Study (7 slides)
**Mente líder**: Alex Hormozi + Eugene Schwartz

**Hook sugerido**:
"Case: Como 1 carrossel gerou R$ 47k em 48h"
- Template: Especificidade + Resultado impressionante
- Emotional trigger: Curiosity + Greed

**Mensagem principal**:
Anatomia de um carrossel de vendas de alta conversão

**Estrutura**:
1. Hook: Resultado específico
2. Contexto: Antes (problema)
3. Estratégia: O que mudamos
4. Slide 1-3: Deconstrói hook/copy/oferta
5. Resultado: Métricas reais
6. Lições: 3 takeaways
7. CTA

**CTA**: "Salva para estudar antes do seu próximo post de vendas"
**CTA tipo**: Save

**Horário sugerido**: 09:00
**Recursos**: Screenshots de métricas reais

**Métricas esperadas**:
- Reach: 30-40% (case studies são compartilháveis)
- Saves: 6-8%
- Shares: 3-5%

---

#### 📅 Mar 12 (Quarta) - Post #5
**Tipo**: 🎓 EDUCACIONAL
**Pilar**: Instagram Growth (30%)

**Objetivo**: Ensinar otimização
**Fórmula**: Antes-Depois (8 slides)
**Mente líder**: Eugene Schwartz

**Hook sugerido**:
"Peguei carrossel de 2% engagement e transformei em 12%"
- Template: Transformação dramática
- Emotional trigger: Curiosity + Hope

**Mensagem principal**:
Pequenos ajustes de copy geram grandes resultados

**Estrutura**:
1. Hook: Transformação
2. Original: Carrossel antes
3. Problema #1: Hook fraco
4. Fix #1: Novo hook
5. Problema #2: Falta especificidade
6. Fix #2: Adicionado números
7. Resultado: Métricas comparadas
8. CTA

**CTA**: "Qual carrossel seu precisa de otimização? Comenta o tema"
**CTA tipo**: Engagement

**Horário sugerido**: 18:30
**Recursos**: Lado-a-lado antes/depois

**Métricas esperadas**:
- Reach: 20-30%
- Engagement: 7-9%
- Comments: 60-120

---

#### 📅 Mar 14 (Sexta) - Post #6
**Tipo**: 👑 AUTORIDADE
**Pilar**: Copywriting (40%)

**Objetivo**: Posicionar como líder de pensamento
**Fórmula**: Controvérsia (6 slides)
**Mente líder**: Seth Godin

**Hook sugerido**:
"Parei de usar CTAs genéricos e meu engagement triplicou"
- Template: Hot take + Resultado
- Emotional trigger: Controversy + Curiosity

**Mensagem principal**:
CTAs específicos > CTAs genéricos (sempre)

**Estrutura**:
1. Hook: Hot take
2. Problema: CTAs genéricos ("gostou?")
3. Por que não funciona: Dados
4. Solução: CTAs específicos
5. Exemplos: 5 CTAs matadores
6. CTA (irônico)

**CTA**: "Comenta o CTA mais genérico que você já viu 😂"
**CTA tipo**: Engagement + Humor

**Horário sugerido**: 18:30
**Recursos**: Memes de CTAs ruins

**Métricas esperadas**:
- Reach: 25-40% (polêmico = viral)
- Engagement: 10-15%
- Shares: 5-7%

---

### Semana 3: PREPARAÇÃO (Mar 17-23)
🎯 Objetivo: Aquecer para lançamento, gerar antecipação

---

#### 📅 Mar 17 (Segunda) - Post #7
**Tipo**: 🎓 EDUCACIONAL
**Pilar**: Marketing Digital (30%)

**Objetivo**: Educar enquanto planta seed do produto
**Fórmula**: Problema-Solução (8 slides)
**Mente líder**: Eugene Schwartz

**Hook sugerido**:
"Por que 90% dos carrosséis não convertem (e como fazer parte dos 10%)"
- Template: Stat + Exclusividade
- Emotional trigger: Fear + Desire

**Mensagem principal**:
Carrosséis de conversão seguem fórmulas específicas

**Estrutura**:
1. Hook: 90% falham
2. Por quê: Não usam estruturas comprovadas
3. Dica #1: Awareness stages
4. Dica #2: Emotional triggers
5. Dica #3: Value stacking
6. Dica #4: CTAs irresistíveis
7. Resumo
8. CTA (com seed)

**CTA**: "Salvei isso. Na sexta vou revelar algo grande sobre esse tema 👀"
**CTA tipo**: Save + Teaser

**Horário sugerido**: 09:00
**Recursos**: Dados de performance

**Métricas esperadas**:
- Reach: 20-30%
- Saves: 7-10%
- Antecipação: Comments perguntando "o que vem?"

---

#### 📅 Mar 19 (Quarta) - Post #8
**Tipo**: 👑 AUTORIDADE
**Pilar**: Instagram Growth (30%)

**Objetivo**: Demonstrar resultados, aumentar credibilidade
**Fórmula**: Resultados (7 slides)
**Mente líder**: Alex Hormozi + Thiago Finch

**Hook sugerido**:
"12 meses, 120 carrosséis, R$ 580k de vendas. Aqui está o breakdown."
- Template: Timeframe + Volume + Resultado
- Emotional trigger: Proof + Curiosity

**Mensagem principal**:
Carrosséis consistentes = máquina de vendas previsível

**Estrutura**:
1. Hook: Números do ano
2. Breakdown: Métricas mês a mês
3. O que funcionou: Top 3 tipos
4. O que não funcionou: Erros
5. ROI: Cada carrossel = R$ 4.8k médio
6. Método: Como mantive consistência
7. Próximo passo (seed do produto)

**CTA**: "Quer saber como replicar isso no seu negócio? Novidade vem aí 👀"
**CTA tipo**: Teaser + Antecipação

**Horário sugerido**: 18:30
**Recursos**: Gráficos de crescimento

**Métricas esperadas**:
- Reach: 30-50% (resultados são virais)
- Engagement: 10-12%
- Profile visits: +200%

---

#### 📅 Mar 21 (Sexta) - Post #9
**Tipo**: 🎓 EDUCACIONAL (com seed forte)
**Pilar**: Copywriting (40%)

**Objetivo**: Aquecimento final para lançamento
**Fórmula**: Perguntas da Audiência (6 slides)
**Mente líder**: Seth Godin + Eugene Schwartz

**Hook sugerido**:
"Respondi as 5 perguntas mais feitas sobre carrosséis (a #3 surpreende)"
- Template: Perguntas da audiência + Curiosity gap
- Emotional trigger: Belonging + Curiosity

**Mensagem principal**:
Suas dúvidas têm respostas (e vou revelar algo especial)

**Estrutura**:
1. Hook: 5 perguntas
2. P1: "Quantas vezes por semana postar?" → Resposta
3. P2: "Como saber qual fórmula usar?" → Resposta + seed
4. P3: "Vale a pena usar templates?" → Resposta surpresa
5. P4: "Como medir sucesso?" → Resposta
6. Anúncio: Segunda-feira tem novidade 🔥

**CTA**: "Comenta QUERO se quer ser avisado da novidade primeiro"
**CTA tipo**: Engagement + Lista VIP

**Horário sugerido**: 18:30
**Recursos**: Design Q&A

**Métricas esperadas**:
- Reach: 25-35%
- Comments: 200-300 (lista VIP)
- Antecipação: Máxima

---

### Semana 4: CONVERSÃO (Mar 24-30)
🎯 Objetivo: Lançar produto, converter, entregar valor

---

#### 📅 Mar 24 (Segunda) - Post #10
**Tipo**: 💰 VENDAS
**Pilar**: Marketing Digital (30%)

**Objetivo**: LANÇAMENTO do produto
**Fórmula**: Venda Direta (9 slides)
**Mente líder**: Alex Hormozi + Eugene Schwartz + Thiago Finch

**Hook sugerido**:
"ABRIU: Pack com 100 fórmulas de carrosséis testadas (+ bônus insano)"
- Template: Urgência + Volume + Teaser
- Emotional trigger: FOMO + Desire

**Mensagem principal**:
Oferta irresistível disponível agora

**Estrutura**:
1. Hook: Anúncio + urgência
2. Problema: Criar carrossel do zero é difícil
3. Solução: Pack de fórmulas prontas
4. O que está incluído (Value Stack):
   - 100 fórmulas testadas
   - 500 hooks por categoria
   - Templates Canva editáveis
   - Checklist de otimização
   - Bônus: Análise de 1 carrossel seu
5. Prova social: Resultados de quem testou
6. Preço: R$ 497 → R$ 197 (60% off primeiras 50 vagas)
7. Garantia: 7 dias dinheiro de volta
8. CTA urgente: Link na bio + DM "QUERO"
9. Escassez: Só 50 vagas neste preço

**CTA**: "DM 'QUERO' agora. Quando acabar as 50 vagas, preço sobe para R$ 497"
**CTA tipo**: Conversão direta

**Horário sugerido**: 09:00 (capturar dia inteiro)
**Recursos**: Mock-up do produto, prints de resultados

**Métricas esperadas**:
- Reach: 40-60% (lançamento = pico)
- DMs: 300-500
- Conversão: 10-15% (50-75 vendas)
- Receita: R$ 9.850 - R$ 14.775

---

#### 📅 Mar 26 (Quarta) - Post #11
**Tipo**: 💰 VENDAS (reforço)
**Pilar**: Copywriting (40%)

**Objetivo**: Último call + vencer objeções
**Fórmula**: Objeções (7 slides)
**Mente líder**: Alex Hormozi

**Hook sugerido**:
"'Funciona para meu nicho?' e outras 5 perguntas que recebi sobre o Pack"
- Template: Objeções antecipadas
- Emotional trigger: Reassurance

**Mensagem principal**:
Suas dúvidas respondidas + últimas vagas

**Estrutura**:
1. Hook: 6 perguntas
2. P1: "Funciona para meu nicho?" → SIM + exemplos
3. P2: "Preciso de design?" → NÃO + templates inclusos
4. P3: "Sou iniciante, funciona?" → SIM + caso de iniciante
5. P4: "Vale o investimento?" → ROI explicado
6. P5: "Garantia?" → 7 dias + processo simples
7. Último call: Restam 12 vagas a R$ 197

**CTA**: "Últimas vagas. DM 'PACK' agora ou perde essa chance"
**CTA tipo**: Conversão + Urgência

**Horário sugerido**: 18:30
**Recursos**: FAQ visual

**Métricas esperadas**:
- Reach: 30-40%
- DMs: 100-200
- Conversão: 30-50% dos que enviaram DM
- Receita adicional: R$ 5.910 - R$ 9.850

---

#### 📅 Mar 28 (Sexta) - Post #12
**Tipo**: 👑 AUTORIDADE (pós-venda)
**Pilar**: Instagram Growth (30%)

**Objetivo**: Entregar valor, agradecer, próximos passos
**Fórmula**: Agradecimento + Próximos Passos (5 slides)
**Mente líder**: Seth Godin + Thiago Finch

**Hook sugerido**:
"73 pessoas confiaram. Aqui está o que vem agora."
- Template: Prova social + Antecipação
- Emotional trigger: Gratitude + Belonging

**Mensagem principal**:
Obrigado pela confiança + roadmap do que vem

**Estrutura**:
1. Hook: Número de compradores + agradecimento
2. O que vem: Conteúdo exclusivo para quem comprou
3. Comunidade: Grupo privado de suporte
4. Próximos lançamentos: Teaser do próximo produto
5. Para quem não comprou: Conteúdo gratuito continua

**CTA**: "Se ainda não garantiu, última chance. Depois disso, preço sobe. DM 'ÚLTIMA'"
**CTA tipo**: Último último call + Entrega de valor

**Horário sugerido**: 09:00
**Recursos**: Foto da comunidade/grupo

**Métricas esperadas**:
- Reach: 20-30%
- Goodwill: Alto (agradecer cria lealdade)
- DMs finais: 50-100
- Receita final: R$ 1.970 - R$ 4.925

---

## RESUMO DO LOTE

### Distribuição Final
| Tipo | Quantidade | % |
|------|------------|---|
| 🎓 Educacional | 6 | 50% |
| 👑 Autoridade | 4 | 33% |
| 💰 Vendas | 2 | 17% |
| **TOTAL** | **12** | **100%** |

### Pilares
| Pilar | Quantidade | % |
|-------|------------|---|
| Copywriting | 5 | 42% |
| Instagram Growth | 4 | 33% |
| Marketing Digital | 3 | 25% |
| **TOTAL** | **12** | **100%** |

### Fórmulas Utilizadas
- Problema-Solução: 3x
- Lista Numérica: 1x
- Framework: 2x
- Case Study: 1x
- Antes-Depois: 1x
- Controvérsia: 1x
- Resultados: 1x
- Venda Direta: 1x
- Objeções: 1x

✅ Diversidade: ALTA (9 fórmulas diferentes em 12 posts)

### CTAs Utilizados
- Engagement (comentar): 5x
- Save: 4x
- Teaser/Antecipação: 3x
- Conversão direta: 2x

✅ Variação: BOA

---

## PROJEÇÕES

### Métricas Esperadas (Totais do Mês)
| Métrica | Estimativa Conservadora | Estimativa Otimista |
|---------|-------------------------|---------------------|
| Reach total | 180k-240k | 300k-400k |
| Engagement médio | 7-9% | 10-12% |
| Saves totais | 4.500-6.000 | 8.000-10.000 |
| Comments totais | 800-1.200 | 1.500-2.500 |
| Novos seguidores | 2.000-3.000 | 4.000-6.000 |
| DMs (vendas) | 400-700 | 800-1.200 |

### Receita Projetada (Posts #10, #11, #12)
| Cenário | Vagas vendidas | Receita |
|---------|----------------|---------|
| Conservador | 80/200 (40%) | R$ 15.760 |
| Realista | 120/200 (60%) | R$ 23.640 |
| Otimista | 150/200 (75%) | R$ 29.550 |

**ROI**: Se investir R$ 2.000 em design/produção:
- Conservador: 7.8x
- Realista: 11.8x
- Otimista: 14.7x

---

## RECURSOS NECESSÁRIOS

### Design/Visual
- [ ] 3-4 templates Canva base (variações de cores/fontes)
- [ ] Banco de ícones/shapes
- [ ] Paleta de cores definida
- [ ] Fonts licenciadas (se necessário)

### Copywriting
- [ ] Todos os 12 carrosséis escritos (usar workflow/batch-production.md)
- [ ] Captions finalizadas

### Recursos Técnicos
- [ ] Ferramenta de agendamento (Later, Planoly, Creator Studio)
- [ ] Banco de imagens (Unsplash, Pexels)
- [ ] Canva Pro (templates editáveis)

### Produto (#10, #11)
- [ ] Pack de fórmulas finalizado
- [ ] Templates Canva criados
- [ ] Grupo privado criado
- [ ] Processo de entrega automatizado
- [ ] Garantia e termos escritos

### Humanos
- [ ] Designer (se terceirizar)
- [ ] VA para responder DMs (se escalar)
- [ ] Aprovações (se necessário)

---

## TIMELINE DE PRODUÇÃO

### Semana -2 (Fev 17-23): PLANEJAMENTO
- [ ] Aprovar este calendário
- [ ] Definir templates visuais (3-4 variações)
- [ ] Preparar recursos visuais
- [ ] Criar produto (Pack de fórmulas)

### Semana -1 (Fev 24 - Mar 2): PRODUÇÃO
- [ ] Usar `workflow/batch-production.md` para criar todos os 12 carrosséis
- [ ] Primeira rodada de design (posts 1-6)
- [ ] Segunda rodada de design (posts 7-12)
- [ ] Escrever todas as captions

### Semana 0 (Mar 1-2): REVISÃO
- [ ] Review final de todos os 12
- [ ] Ajustes de copy/design
- [ ] Agendar posts 1-6
- [ ] Testar automação de DMs (se usar)

### Semanas 1-4 (Mar 3-30): EXECUÇÃO
- [ ] Posts publicam automaticamente
- [ ] Responder comentários (primeiras 2h são críticas)
- [ ] Monitorar DMs (especialmente posts 10-12)
- [ ] Analisar métricas diariamente
- [ ] Ajustar horários se necessário
- [ ] Processar vendas (posts 10-12)

---

## CONTINGÊNCIAS

### Se performance abaixo do esperado (Semana 1-2)
- Revisar hooks (testar variações A/B)
- Ajustar horários de publicação
- Aumentar budget de ads (se aplicável)
- Engajar mais nos comentários

### Se vendas abaixo da meta (Post 10)
- Ativar afiliados/embaixadores
- Adicionar post extra de prova social
- Estender oferta por 48h
- Aumentar bônus ou melhorar oferta

### Se sobrar tempo na produção
- Criar 2-3 posts reserva (backup)
- Preparar Reels complementares
- Gravar Stories de bastidores
- Preparar próximo lote (Abril)

---

## MÉTRICAS DE SUCESSO

### KPIs Primários
1. **Vendas**: 80+ unidades (meta mínima)
2. **Engagement médio**: 8%+ (sustentável)
3. **Novos seguidores**: 2.500+ (crescimento)

### KPIs Secundários
4. **Saves totais**: 5.000+ (referência)
5. **Comments totais**: 1.000+ (comunidade)
6. **Shares totais**: 400+ (viralidade)

### KPIs de Qualidade
7. **Sentimento**: 90%+ comentários positivos/neutros
8. **Retention**: 70%+ permanecem até último slide (Instagram Insights)
9. **Profile visits**: 3.000+ (consideração)

---

## ANÁLISE PÓS-LOTE

Após Março 2026, usar `task/analyze-performance.md` para:

1. Analisar cada um dos 12 posts
2. Identificar Top 3 e Bottom 3
3. Padrões: O que funcionou vs não funcionou
4. Ajustes para próximo lote (Abril)
5. Documentar learnings

---

## PRÓXIMOS LOTES

### Abril 2026 (se este for bem-sucedido)
- Mesmo formato: 12 carrosséis, 3x/semana
- Ajustar mix baseado em performance
- Introduzir novo produto ou upsell
- Testar novos formatos (Reels? Stories?)

### Roadmap Trimestral (Q1 2026)
- **Março**: Educação + Lançamento (este lote)
- **Abril**: Aprofundamento + Upsell
- **Maio**: Community building + Vendas recorrentes

---

## RECURSOS UTILIZADOS

- Estratégia: Seth Godin (arco narrativo, sequência)
- Copy: Eugene Schwartz (hooks, awareness stages)
- Vendas: Alex Hormozi (value stack, oferta irresistível)
- Localização: Thiago Finch (linguagem BR, cultura)
- Fórmulas: `data/carousel-formulas.json`
- Hooks: `data/hooks-database.json`
- Benchmarks: `data/performance-benchmarks.json`

---

**Status**: ✅ PRONTO PARA APROVAÇÃO

**Próximo passo**: Aprovar calendário → Iniciar produção (Semana -2)
```

## Variação: Planejamento Rápido (10 min)

Para planejamento express sem detalhamento total:

```markdown
# LOTE EXPRESS - [Quantidade] carrosséis

## Calendário Resumido

| Data | Tipo | Tema | Fórmula | Hook | CTA |
|------|------|------|---------|------|-----|
| Mar 3 | Edu | 7 erros | Problema | "7 erros..." | Comenta |
| Mar 5 | Edu | 5 hooks | Lista | "5 hooks..." | Salva |
| ... | ... | ... | ... | ... | ... |

## Mix
- Educacional: 50%
- Autoridade: 30%
- Vendas: 20%

## Produção
- Semana -1: Criar todos
- Semana 0: Agendar
- Semanas 1-N: Publicar

## Meta
- Receita: R$ 15k-30k
- Novos seguidores: 2.5k+
```

## Referências

- **Fórmulas**: `data/carousel-formulas.json`
- **Hooks**: `data/hooks-database.json`
- **Benchmarks**: `data/performance-benchmarks.json`
- **Produção em lote**: `workflows/batch-production.md`
