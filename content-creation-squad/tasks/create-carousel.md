# Task: Create Carousel

**ID**: create-carousel
**Agent**: content-lead
**Elicit**: true
**Duration**: 10-15 min

## Objetivo
Criar carrossel completo para Instagram ou LinkedIn seguindo metodologia estruturada com as 4 mentes milionárias.

## Inputs Necessários

### 1. Briefing (OBRIGATÓRIO)
```yaml
elicit:
  - question: "Qual o OBJETIVO principal deste carrossel?"
    options:
      - Educar/ensinar algo
      - Vender produto/serviço
      - Construir autoridade
      - Gerar viralização
      - Outro

  - question: "Qual a PLATAFORMA?"
    options:
      - Instagram
      - LinkedIn
      - Ambas

  - question: "Quem é a AUDIÊNCIA?"
    placeholder: "Ex: Empreendedores iniciantes, gestores de tráfego, etc."

  - question: "Qual a MENSAGEM PRINCIPAL?"
    placeholder: "Em 1-2 frases, o que você quer comunicar?"

  - question: "Qual o CTA (Call-to-Action) desejado?"
    options:
      - Comentar
      - Compartilhar
      - Salvar
      - Acessar link
      - DM
      - Outro
```

## Workflow Executivo

### Passo 1: Estratégia (Seth Godin)
**Ativa**: seth_godin

```
Prompt:
"Baseado neste briefing:
- Objetivo: [objetivo]
- Audiência: [audiência]
- Mensagem: [mensagem]

Defina:
1. Ângulo estratégico (qual perspectiva única tomar?)
2. Tom de voz (educacional/provocativo/inspirador?)
3. Estrutura ideal (quantos slides, qual progressão?)
4. Como tornar isso remarkable (memorável/compartilhável)?"
```

### Passo 2: Copywriting (Eugene Schwartz)
**Ativa**: eugene_schwartz

```
Prompt:
"Usando a estratégia definida:
[copiar resposta do Seth]

Escreva:
1. 5 opções de HOOK para slide 1 (baseado em awareness stage)
2. Copy completo de cada slide (títulos + subtextos)
3. Caption para a postagem
4. 5-8 hashtags relevantes

Princípios:
- Especificidade > generalização
- Benefício claro em cada slide
- Progressão emocional → racional
- CTA que reforça a mensagem"
```

### Passo 3: Otimização de Oferta (Alex Hormozi)
**Ativa**: alex_hormozi
**Condicional**: Apenas se objetivo = Vender

```
Prompt:
"Revise o carrossel de vendas:
[copiar copy do Eugene]

Otimize para:
1. Value Stack - O que está incluído na oferta?
2. Scarcity - Por que agir agora?
3. Guarantee - Como reduzir risco percebido?
4. Price Anchoring - Como apresentar o preço?
5. Bonus Stack - O que adicionar para aumentar valor?"
```

### Passo 4: Localização BR (Thiago Finch)
**Ativa**: thiago_finch
**Condicional**: Se audiência brasileira

```
Prompt:
"Adapte o copy para audiência brasileira:
[copiar copy atual]

Ajuste:
1. Referências culturais
2. Exemplos locais
3. Linguagem coloquial BR
4. Gatilhos que funcionam no Brasil
5. Hashtags BR relevantes"
```

### Passo 5: Planejamento Visual
**Usa**: visual-planner agent

```
Para cada slide, especifique:
- Título (destaque)
- Subtexto (se houver)
- Elementos visuais (ícones, imagens, formas)
- Cores principais
- Hierarquia visual
```

### Passo 6: Review Final
**Checklist**:
- [ ] Hook no slide 1 passa no "scroll stop test"?
- [ ] Cada slide tem máximo 2-3 linhas?
- [ ] Progressão lógica entre slides?
- [ ] CTA claro e específico?
- [ ] Zero erros de português?
- [ ] Legível em tela de celular?
- [ ] Branding consistente?
- [ ] Caption complementa (não duplica) o carrossel?

## Output Esperado

```markdown
# CARROSSEL: [Título]

## Plataforma
- [ ] Instagram
- [ ] LinkedIn

## Estrutura
Total de slides: X

---

### SLIDE 1 (HOOK)
**Título**: [Texto grande, impactante]
**Subtexto**: [Se houver]
**Visual**: [Descrição]

### SLIDE 2
**Título**: [Texto]
**Subtexto**: [Texto]
**Visual**: [Descrição]

[... continuar para todos os slides ...]

---

## CAPTION

[Texto da caption]

---

## HASHTAGS

#hashtag1 #hashtag2 #hashtag3 [...]

---

## NOTAS DE PRODUÇÃO

- **Fonte sugerida**: [Nome]
- **Paleta de cores**: [Cores]
- **Estilo visual**: [Minimalista/Bold/Corporativo/etc]
- **Tempo estimado de criação**: X minutos

---

## MÉTRICAS ESPERADAS

Baseado em benchmarks:
- **Reach**: [estimativa]
- **Engagement**: [estimativa]
- **Saves**: [estimativa]
```

## Exemplos de Estruturas

### Exemplo 1: Educacional (8 slides)
1. Hook: "7 erros de copy que matam sua conversão"
2. Contexto: "Você pode ter o melhor produto..."
3. Erro #1: Falar de features, não benefícios
4. Erro #2: Hook genérico
5. Erro #3: Falta de especificidade
6. Erro #4: CTA fraco
7. Erro #5: Não usar prova social
8. Resumo + CTA: "Salve para revisar seu copy"

### Exemplo 2: Vendas (7 slides)
1. Hook: "Como fazer R$ 50k/mês com infoprodutos"
2. Problema: "Você já tentou lançar e não vendeu..."
3. Causa: "O problema não é o produto"
4. Solução: "Método [NOME]"
5. Prova: Case real com números
6. Oferta: "Acesso por [preço] (bônus inclusos)"
7. CTA: "Link na bio + DM 'QUERO'"

### Exemplo 3: Autoridade (6 slides)
1. Hook: "O framework que usei para 10x meu negócio"
2. Framework: Visão geral [SIGLA]
3. Passo 1: [Explicação + exemplo]
4. Passo 2: [Explicação + exemplo]
5. Passo 3: [Explicação + exemplo]
6. Aplicação: "Comece por aqui:" + CTA

## Tips Pro

1. **Slide 1 decide tudo** - Teste 5+ opções de hook
2. **Menos é mais** - Corte 50% do texto que você escreveu
3. **Visual > Texto** - Se dá pra mostrar com imagem, não escreva
4. **Um slide = uma ideia** - Se tem duas ideias, são dois slides
5. **CTA específico** - "Salve este post" > "Gostou?"
6. **Slide 10 = engajamento** - Faça uma pergunta, peça comentário
7. **Caption conta história** - Não repita o carrossel, complemente

## Recursos

- **Banco de Hooks**: `data/hooks-database.json`
- **Fórmulas**: `data/carousel-formulas.json`
- **Benchmarks**: `data/performance-benchmarks.json`
- **Templates Canva**: `templates/canva-templates/`
