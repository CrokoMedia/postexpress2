# Task: Create Twitter-Style Post

**ID**: create-twitter-post
**Agent**: twitter-post-creator
**Elicit**: true
**Duration**: 5-8 min

## Objetivo
Criar post visual estilo Twitter/X para postar no Instagram, LinkedIn ou Facebook usando as 4 mentes milionárias.

## Inputs Necessários

### 1. Briefing (OBRIGATÓRIO)
```yaml
elicit:
  - question: "Qual o OBJETIVO deste post?"
    options:
      - Teaser/criar expectativa
      - Demonstrar autoridade
      - Gerar polêmica/debate
      - Oferecer produto/serviço
      - Entregar valor direto

  - question: "Qual o TEMA principal?"
    placeholder: "Ex: Método de vendas, crescimento no Instagram, etc."

  - question: "Informações do perfil?"
    fields:
      - Nome: "Seu nome ou da marca"
      - Username: "@usuario"
      - Emoji: "Emoji ao lado do nome (opcional)"

  - question: "Qual o CTA desejado?"
    options:
      - Comentar palavra-chave
      - Salvar post
      - Compartilhar
      - Me seguir
      - Outro
```

## Workflow Executivo

### Passo 1: Escolher Fórmula (baseado no objetivo)

**Teaser/Expectativa** → Fórmula TEASER + PROMESSA
**Autoridade** → Fórmula RESULTADO + MÉTODO
**Polêmica** → Fórmula POLÊMICA + ARGUMENTO
**Oferta** → Fórmula TRANSFORMAÇÃO
**Valor** → Fórmula VALOR DIRETO

### Passo 2: Copywriting

**Ativa**: eugene_schwartz

```
Prompt:
"Objetivo: [objetivo do usuário]
Tema: [tema do usuário]
Fórmula escolhida: [fórmula]

Crie um post estilo Twitter seguindo a fórmula.

Requisitos:
- Máximo 280 caracteres total (ideal)
- Hook matador na primeira linha
- 2-4 quebras de linha estratégicas
- Números específicos (não vagos) - **MAS APENAS SE REAIS**
- CTA claro e fácil de executar
- 1-2 emojis no máximo
- Conversacional (não formal)

Princípios:
- Especificidade > generalização
- Identificar nível de awareness da audiência
- Amplificar desejo existente
- Criar gap de curiosidade

**⚠️ RESTRIÇÃO CRÍTICA:**
- Use APENAS números fornecidos pelo usuário
- Se precisar de número: use placeholder [INSERIR NÚMERO REAL]
- NUNCA invente métricas ou resultados

IMPORTANTE: Não mencione processos internos, nomes de copywriters ou termos técnicos de marketing. Foque no BENEFÍCIO para o leitor."
```

### Passo 3: Otimização (Condicional)

**Se objetivo = Oferta** → Ativar Alex Hormozi:
```
Revise o post de oferta:
[copy do Eugene]

Otimize:
- Value stack claro?
- Urgência/escassez presente?
- Reversal de risco (se aplicável)?
- Benefício óbvio em 3 segundos?
```

**Se audiência = BR** → Ativar Thiago Finch:
```
Adapte para público brasileiro:
[copy atual]

Ajuste:
- Linguagem coloquial BR
- Referências locais
- Gatilhos que funcionam no Brasil
- Tom autêntico brasileiro
```

### Passo 4: Verificação de Viralidade

**Ativa**: seth_godin

```
Analise o post:
[copy final]

É digno de comentário/compartilhamento?

Checklist:
- Provoca reação emocional?
- Fácil de entender em 3 segundos?
- Único/diferente do que todos postam?
- Gera vontade de comentar/debater?
- Compartilhável?

FILTRO DE LINGUAGEM:
- Remove termos técnicos de marketing
- Remove nomes de copywriters ou estrategistas
- Remove menções a "método científico" ou "framework"
- Substitui por linguagem natural e direta

Se não passar, sugira ajuste para tornar viral E natural.
```

### Passo 5: Especificações Visuais

Definir layout final:
```markdown
**Informações do Perfil**:
- Nome: [nome + emoji]
- Username: @[username]
- Foto: [descrição ou path]

**Copy Final**:
[texto com quebras de linha marcadas]

**Design**:
- Fundo: Branco (#FFFFFF)
- Fonte: Helvetica Neue
- Tamanhos: Nome 20px, Post 20px
- Logo X.com no canto superior direito

**CTA**:
- Ação: [comentar/salvar/compartilhar]
- Palavra-chave: [se aplicável]
```

### Passo 6: Preview HTML

Gerar preview visual automático para visualizar antes de produzir no Canva.

## Output Esperado

```markdown
# POST TWITTER-STYLE: [Título]

## Informações do Perfil
- **Nome**: [Nome] [Emoji]
- **Username**: @[username]
- **Foto**: [caminho ou descrição]

---

## COPY COMPLETO

[Linha 1 - Hook]

[Linha 2]

[Linha 3]

[CTA] [Emoji]

---

## ESPECIFICAÇÕES VISUAIS

**Formato**: 1080x1350px (4:5 - Instagram)
**Fundo**: #FFFFFF (branco)
**Fonte**: Helvetica Neue
**Tamanhos**:
- Nome: 20px Bold
- Username: 16px Regular, #536471
- Post: 20px Regular, #0F1419

**Layout**:
- Padding: 40px
- Foto perfil: 48x48px (circular)
- Logo X.com: top-right

---

## CAPTION (para Instagram/LinkedIn)

[Caption explicando contexto do post, se necessário]

---

## MÉTRICAS ESPERADAS (Benchmarks de Mercado)

**IMPORTANTE**: Estes são BENCHMARKS GERAIS, NÃO resultados garantidos deste post.

- **Engajamento**: [estimativa de mercado - NÃO dado real]
- **Comentários**: [estimativa de mercado - NÃO dado real]
- **Compartilhamentos**: [estimativa de mercado - NÃO dado real]

**Para dados reais**: Analise após publicação via analytics da plataforma.

---

## NOTAS DE PRODUÇÃO

**Ferramenta**: Canva
**Tempo**: 15-20 min
**Preview HTML**: [link se gerado]

**Passos Canva**:
1. Criar "Post Instagram" 1080x1350px
2. Fundo branco
3. Adicionar círculo com foto perfil (top-left)
4. Texto nome + @ (ao lado da foto)
5. Texto "X.com" (top-right)
6. Texto do post (center-left, ~100px do topo)
7. Exportar PNG

---

## CHECKLIST PRÉ-PUBLICAÇÃO

- [ ] Hook na primeira linha irresistível?
- [ ] Copy conversacional (não formal)?
- [ ] Números específicos?
- [ ] CTA claro e fácil?
- [ ] Máximo 2 emojis?
- [ ] Quebras de linha estratégicas?
- [ ] Zero typos?
- [ ] Visual parece tweet real?
```

## Fórmulas Disponíveis

### 1. TEASER + PROMESSA
```
[Hook sobre teste/experimento]

[Criar expectativa temporal]

[CTA para copiar método]
Comente "[PALAVRA]"
```

### 2. RESULTADO + MÉTODO
```
[Resultado específico alcançado]

[Preview do método em 1-2 linhas]

[CTA]
```

### 3. POLÊMICA + ARGUMENTO
```
Opinião impopular:

[Declaração controversa]

[Argumento breve]

[CTA debate]
```

### 4. TRANSFORMAÇÃO
```
De [ANTES ruim]
Para [DEPOIS incrível]

[Como]

[CTA]
```

### 5. VALOR DIRETO
```
[NÚMERO] [COISAS] que [RESULTADO]:

1. [Item]
2. [Item]
3. [Item]

[CTA]
```

## Exemplos Práticos

### Exemplo 1: Teaser (baseado no template)
```
Isso é um teste. Daqui 30 dias eu volto com os resultados.

Enquanto isso...

Comente "funil" se quiser copiar e colar a estrutura
que gera mais de 700 reuniões por mês em meu negócio 👆🏻
```

**Análise**:
- ✅ Hook: "Isso é um teste" (cria curiosidade)
- ✅ Expectativa: "Daqui 30 dias"
- ✅ Especificidade: "700 reuniões por mês"
- ✅ CTA fácil: Comentar "funil"
- ✅ Emoji estratégico: 👆🏻

### Exemplo 2: Resultado + Sistema
```
Sistema de IA criou esse post em 10 minutos.

Copy + estratégia + gatilhos de venda, tudo otimizado.

Comente "SISTEMA" se quiser ter acesso
```

**Análise**:
- ✅ Hook: Número específico + promessa grande
- ✅ Prova: Resultado tangível
- ✅ Tempo específico: "10 minutos"
- ✅ CTA simples: Comentar palavra
- ✅ Sem termos técnicos ou nomes internos

### Exemplo 3: Transformação
```
De 3 horas criando 1 post
Para 10 minutos com sistema automatizado

O segredo? IA treinada com as melhores estratégias de venda.

Salva esse post
```

**Análise**:
- ✅ Contraste claro: Antes vs Depois
- ✅ Números específicos
- ✅ Curiosidade: "O segredo?"
- ✅ CTA: Salvar
- ✅ Linguagem natural, sem jargão técnico

## Tips Pro

### Hooks Matadores
- "Isso mudou tudo:"
- "Descobri algo estranho:"
- "Ninguém fala sobre isso:"
- "De [ANTES] para [DEPOIS]"
- "Opinião impopular:"
- "[NÚMERO] fazendo [COISA SIMPLES]"

### CTAs que Funcionam
- "Comente '[PALAVRA]' se..."
- "Salva esse post"
- "Me segue para mais"
- "Concorda?"
- "RT se você..."

### O Que Evitar
- ❌ Texto formal/corporativo
- ❌ Mais de 2 emojis
- ❌ Blocos grandes de texto
- ❌ Números vagos ("muitos", "vários")
- ❌ CTAs complexos
- ❌ Mais de 280 caracteres (ideal)

## Recursos

- **Fórmulas**: `data/twitter-hooks.json`
- **Template**: `templates/twitter-post.md`
- **Agente**: `agents/twitter-post-creator.md`
