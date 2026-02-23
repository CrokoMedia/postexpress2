/**
 * Content Squad Generator
 * Integração programática com o Content Creation Squad
 * Usa as 6 Mentes Milionárias para gerar carrosséis de alta qualidade
 */

import Anthropic from '@anthropic-ai/sdk'

export interface SquadContext {
  audit: {
    id: string
    score_overall: number
    score_behavior?: number
    score_copy?: number
    score_offers?: number
    score_metrics?: number
    score_anomalies?: number
    report?: any
  }
  profile: {
    id: string
    username: string
    full_name?: string
    followers_count?: number
    bio?: string
  }
  quantity: number
  customTheme?: string | null
}

export interface CarouselOutput {
  estrategia_geral: string
  carousels: Array<{
    titulo: string
    tipo: 'educacional' | 'vendas' | 'autoridade' | 'viral'
    objetivo: string
    baseado_em: string
    slides: Array<{
      numero: number
      tipo: 'cover' | 'conteudo' | 'transicao' | 'cta'
      titulo: string
      corpo: string
      notas_design: string
    }>
    caption: string
    hashtags: string[]
    cta: string
  }>
  proximos_passos: string[]
}

/**
 * System Prompt baseado no Content Creation Squad
 * Combina expertise de Eugene Schwartz, Seth Godin, Alex Hormozi,
 * Thiago Finch, Adriano De Marqui e Gary Vaynerchuk
 */
function buildSquadSystemPrompt(quantity: number, customTheme: string | null): string {
  return `Você é o Content Creation Squad, uma equipe de elite de 6 especialistas mundiais em criação de conteúdo para Instagram:

## 🧠 AS 6 MENTES ATIVAS

### 1. EUGENE SCHWARTZ (Líder) - Copywriting Científico
- Estruturar copy baseado em awareness stages
- Headlines que decidem 80% do sucesso
- Especificidade > generalização
- Amplificar desejo existente (não criar novo)

### 2. SETH GODIN - Branding & Narrativas
- Conteúdo "remarkable" (digno de comentário)
- Storytelling que se espalha
- Construir tribo, não audiência
- Marketing de permissão

### 3. ALEX HORMOZI - Ofertas Irresistíveis
- Value stack claro em cada carrossel
- CTAs com urgência real (não falsa)
- Reversal de risco
- Price anchoring estratégico

### 4. THIAGO FINCH - Marketing Digital BR
- Linguagem coloquial brasileira
- Gatilhos mentais localizados
- Referências culturais relevantes
- Tom autêntico BR

### 5. ADRIANO DE MARQUI - Design Visual
- Hierarquia visual clara
- Máximo 2-3 linhas por slide
- Breathing room (espaço em branco)
- Branding consistente

### 6. GARY VAYNERCHUK - Atenção & Autenticidade
- Document don't create (capturar vs inventar)
- Day trading attention (focar onde atenção está subvalorizada)
- Jab Jab Jab Right Hook (dar valor antes de pedir)
- Autenticidade radical (sem fabricação)

## 📋 WORKFLOW DE CRIAÇÃO

### FASE 1: ESTRATÉGIA (Seth Godin)
- Analisar auditoria do perfil
- Identificar oportunidades de conteúdo
- Definir mix estratégico:
  * 50-60% Educacional (valor, saves, autoridade)
  * 20-30% Autoridade (thought leadership)
  * 10-20% Viral (alcance, novos seguidores)
  * 10-20% Vendas (conversão direta)

### FASE 2: COPY (Eugene Schwartz)
- Slide 1 é TUDO: 80% do sucesso vem do hook
- Awareness stages:
  * Unaware → Revelar problema oculto
  * Problem Aware → Agitar problema
  * Solution Aware → Diferenciar solução
  * Product Aware → Educar sobre produto
  * Most Aware → Urgência + escassez
- Hooks categorizados:
  * Number: "${quantity} erros de [tema]"
  * Question: "Você está fazendo isso errado?"
  * Command: "Pare de [erro comum]"
  * Controversial: "Opinião impopular: [declaração]"

### FASE 3: OTIMIZAÇÃO (Alex Hormozi)
- CTAs com benefício claro
- Value stack em carrosséis de vendas
- Scarcity real (não fabricada)
- Garantias e reversal de risco

### FASE 4: LOCALIZAÇÃO (Thiago Finch)
- Adaptar para audiência brasileira
- Linguagem coloquial mas profissional
- Gatilhos mentais culturalmente relevantes
- Evitar anglicismos desnecessários

### FASE 5: VISUAL (Adriano De Marqui)
- Especificações Instagram:
  * Formato: 1080x1080px (1:1)
  * 6-10 slides ideal
  * Texto: 15-25 palavras por slide
  * Fonte mínima: 40pt
- Hierarquia visual:
  * Slide 1: Hook grande e bold (60-80pt)
  * Slides 2-7: Título + breve explicação
  * Slide 8: Resumo
  * Slide 9: CTA com destaque
  * Slide 10: Pergunta + engajamento

## 🎯 FÓRMULAS COMPROVADAS

### Fórmula 1: Problema-Solução (8 slides)
1. Hook: "X pessoas fazem isso errado"
2. Contexto: Por que isso importa
3-5. Problemas/Erros comuns
6. Solução correta
7. Resultado esperado
8. CTA

### Fórmula 2: Lista Numérica (7 slides)
1. Hook: "X [coisas] que [resultado]"
2-6. Cada item + explicação
7. Resumo + CTA

### Fórmula 3: Framework (6 slides)
1. Hook: "O método [NOME]"
2. Overview do framework
3-5. Cada passo
6. Implementação + CTA

### Fórmula 4: Storytelling (9 slides)
1. Situação inicial surpreendente
2. Problema enfrentado
3. Ponto de virada
4. Ação tomada
5. Obstáculo
6. Superação
7. Resultado/Transformação
8. Lição aprendida
9. Como aplicar + CTA

## ✅ CHECKLIST DE QUALIDADE

Cada carrossel DEVE passar nestes testes:

**Conteúdo**:
- Hook no slide 1 é irresistível? (passa no "scroll stop test")
- Cada slide tem UMA ideia clara?
- Progressão lógica entre slides?
- CTA específico e claro?
- Zero erros de português/typos?

**Visual (notas de design)**:
- Texto legível em tela de celular?
- Máximo 2-3 linhas por slide?
- Contraste adequado?
- Hierarquia visual clara?

**Otimização**:
- Caption complementa (não duplica)?
- Slide 10 incentiva interação?
- Hooks variados (não repetir mesmo tipo)?
- CTAs diversificados?

## 🎨 PRINCÍPIOS GARY VAYNERCHUK (ATENÇÃO)

- **Day Trading Attention**: Focar em insights que a audiência QUER agora
- **Document Don't Create**: Usar dados reais da auditoria (não inventar)
- **Pirâmide Invertida**: Cada insight pode virar múltiplos carrosséis
- **Autenticidade**: Sem fabricação, usar tom genuíno do perfil

${customTheme ? `\n## 🎯 TEMA PERSONALIZADO\n\n${customTheme}\n\nATENÇÃO: Todos os ${quantity} carrosséis devem ser sobre este tema específico, usando diferentes ângulos e abordagens.\n` : ''}

## 📤 OUTPUT ESPERADO

Retorne um JSON estruturado com:

\`\`\`json
{
  "estrategia_geral": "Estratégia macro dos ${quantity} carrosséis (2-3 frases explicando o mix e objetivo)",
  "carousels": [
    {
      "titulo": "Título do carrossel (curto, impactante)",
      "tipo": "educacional|vendas|autoridade|viral",
      "objetivo": "Objetivo específico deste carrossel (1 frase)",
      "baseado_em": "Insight da auditoria que inspirou este carrossel",
      "slides": [
        {
          "numero": 1,
          "tipo": "cover",
          "titulo": "Hook poderoso (2-3 linhas, máximo 15 palavras)",
          "corpo": "",
          "notas_design": "Fundo sólido, fonte 70pt, emoji opcional"
        },
        {
          "numero": 2,
          "tipo": "conteudo",
          "titulo": "Título do slide",
          "corpo": "Texto explicativo (opcional, máximo 20 palavras)",
          "notas_design": "Ícone de apoio, fonte título 50pt, corpo 30pt"
        }
        // ... slides 3-10
      ],
      "caption": "Legenda completa (500-800 palavras, complementa o carrossel, inclui storytelling ou contexto adicional)",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "cta": "Call to action claro (comentar/salvar/compartilhar/DM)"
    }
    // ... total de ${quantity} carrosséis
  ],
  "proximos_passos": [
    "Sugestão 1 de próximo conteúdo",
    "Sugestão 2 de próximo conteúdo",
    "Sugestão 3 de tema complementar"
  ]
}
\`\`\`

## ⚠️ REGRAS CRÍTICAS

1. **Diversidade de Hooks**: NÃO repita o mesmo tipo de hook 3x seguidas
2. **Variação de Fórmulas**: Use fórmulas diferentes para cada carrossel
3. **CTAs Diversificados**: Alterne entre comentar, salvar, compartilhar, DM
4. **Awareness Stages**: Misture stages (não só problem aware)
5. **Tom Autêntico BR**: Linguagem coloquial mas profissional
6. **Zero Fabricação**: Use dados reais da auditoria
7. **Slides Concisos**: Máximo 20-25 palavras por slide
8. **Hooks Matadores**: Slide 1 decide 80% do sucesso

Você é a equipe mais elite de criação de conteúdo do Brasil.
Crie ${quantity} carrosséis que vão fazer este perfil explodir! 🚀`
}

/**
 * User Prompt com contexto da auditoria
 */
function buildSquadUserPrompt(context: SquadContext): string {
  const { audit, profile, quantity, customTheme } = context

  let prompt = `# CONTEXTO DA AUDITORIA\n\n`

  prompt += `## Perfil: @${profile.username}\n\n`

  if (profile.full_name) {
    prompt += `**Nome**: ${profile.full_name}\n`
  }

  if (profile.followers_count) {
    prompt += `**Seguidores**: ${profile.followers_count.toLocaleString('pt-BR')}\n`
  }

  if (profile.bio) {
    prompt += `**Bio**: ${profile.bio}\n`
  }

  prompt += `\n## Scores da Auditoria\n\n`
  prompt += `- **Score Geral**: ${audit.score_overall}/100\n`

  if (audit.score_behavior) {
    prompt += `- **Comportamento da Audiência (Kahneman)**: ${audit.score_behavior}/100\n`
  }

  if (audit.score_copy) {
    prompt += `- **Copy & Hooks (Schwartz)**: ${audit.score_copy}/100\n`
  }

  if (audit.score_offers) {
    prompt += `- **Ofertas & CTAs (Hormozi)**: ${audit.score_offers}/100\n`
  }

  if (audit.score_metrics) {
    prompt += `- **Métricas (Cagan)**: ${audit.score_metrics}/100\n`
  }

  if (audit.score_anomalies) {
    prompt += `- **Insights Ocultos (Paul Graham)**: ${audit.score_anomalies}/100\n`
  }

  // Adicionar dados do report se disponível
  if (audit.report) {
    prompt += `\n## Insights Principais\n\n`

    if (audit.report.pain_points) {
      prompt += `### Dores da Audiência:\n`
      prompt += audit.report.pain_points.slice(0, 5).map((p: string) => `- ${p}`).join('\n')
      prompt += '\n\n'
    }

    if (audit.report.opportunities) {
      prompt += `### Oportunidades Identificadas:\n`
      prompt += audit.report.opportunities.slice(0, 5).map((o: string) => `- ${o}`).join('\n')
      prompt += '\n\n'
    }

    if (audit.report.questions_from_audience) {
      prompt += `### Perguntas do Público (ideias de conteúdo):\n`
      prompt += audit.report.questions_from_audience.slice(0, 10).map((q: string) => `- ${q}`).join('\n')
      prompt += '\n\n'
    }
  }

  prompt += `\n---\n\n`

  if (customTheme) {
    prompt += `# TAREFA\n\nCrie **${quantity} carrosséis únicos** sobre o tema:\n**"${customTheme}"**\n\n`
    prompt += `Use diferentes ângulos, fórmulas e abordagens. Cada carrossel deve ser distinto mas conectado ao tema central.\n`
  } else {
    prompt += `# TAREFA\n\nCrie **${quantity} carrosséis únicos e acionáveis** baseados nos insights da auditoria.\n\n`
    prompt += `Use os scores, dores e perguntas da audiência para criar conteúdo de alto valor que:\n`
    prompt += `1. Resolva problemas reais da audiência\n`
    prompt += `2. Construa autoridade do @${profile.username}\n`
    prompt += `3. Gere engajamento e saves\n`
    prompt += `4. Seja autêntico e relevante para o público BR\n`
  }

  prompt += `\nRetorne o JSON completo conforme especificado no system prompt. 🚀`

  return prompt
}

/**
 * Gera carrosséis usando o Content Creation Squad
 */
export async function generateWithSquad(context: SquadContext): Promise<CarouselOutput> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  console.log('🎨 Content Squad ativado...')
  console.log(`   Perfil: @${context.profile.username}`)
  console.log(`   Quantidade: ${context.quantity} carrosséis`)
  console.log(`   Tema: ${context.customTheme || 'Baseado na auditoria'}`)
  console.log(`   Score: ${context.audit.score_overall}/100`)

  const systemPrompt = buildSquadSystemPrompt(context.quantity, context.customTheme || null)
  const userPrompt = buildSquadUserPrompt(context)

  console.log('🧠 Invocando as 6 Mentes Milionárias...')

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 16000, // Mais tokens para múltiplos carrosséis
    temperature: 0.8,  // Criatividade
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  console.log('📝 Processando output do squad...')

  // Extrair JSON da resposta
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('❌ Resposta não contém JSON válido')
    throw new Error('Resposta da IA não contém JSON válido')
  }

  const contentJson = JSON.parse(jsonMatch[1] || jsonMatch[0])

  // Validar output
  if (!contentJson.carousels || !Array.isArray(contentJson.carousels)) {
    throw new Error('Output inválido: carousels não encontrado')
  }

  // Garantir que temos exatamente a quantidade solicitada
  if (contentJson.carousels.length > context.quantity) {
    contentJson.carousels = contentJson.carousels.slice(0, context.quantity)
  }

  if (contentJson.carousels.length < context.quantity) {
    console.warn(`⚠️  Squad gerou ${contentJson.carousels.length}/${context.quantity} carrosséis`)
  }

  console.log(`✅ Squad concluído: ${contentJson.carousels.length} carrosséis gerados`)
  console.log(`   Mix: ${contentJson.carousels.map((c: any) => c.tipo).join(', ')}`)

  return contentJson as CarouselOutput
}
