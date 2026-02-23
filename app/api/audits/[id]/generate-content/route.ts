import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Remove surrogates Unicode inválidos (causa erro 400 na Anthropic API)
function sanitizeString(str: string): string {
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
}

function sanitizeDeep(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value)
  if (Array.isArray(value)) return value.map(sanitizeDeep)
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value as object)) {
      result[key] = sanitizeDeep((value as Record<string, unknown>)[key])
    }
    return result
  }
  return value
}

// Prompt do Content Squad
const CONTENT_CREATION_PROMPT = `Você é o líder do Content Creation Squad com 5 mentes especializadas:

1. **Eugene Schwartz** - Copywriting científico (líder)
2. **Seth Godin** - Branding e narrativas
3. **Alex Hormozi** - Ofertas irresistíveis
4. **Thiago Finch** - Marketing BR
5. **Adriano De Marqui** - Design visual

# TAREFA

Você recebeu uma **auditoria completa** de um perfil do Instagram com análise dos 5 auditores + **CONTEXTO RICO DO PERFIL**.

Baseado nos insights da auditoria E no contexto do perfil, crie **3 sugestões de carrosséis** que:

1. **Resolvam os problemas identificados** (critical_problems)
2. **Aproveitem os pontos fortes** (top_strengths)
3. **Respondam às perguntas do público** (comentários)
4. **SIGAM OS PILARES DE CONTEÚDO** definidos no profile_context
5. **USEM O TOM DE VOZ ESPECÍFICO** da pessoa
6. **MENCIONEM PRODUTOS/OFERTAS REAIS** quando relevante

**IMPORTANTE:** Seja CONCISO - máximo 6-8 slides por carrossel.

---

## 🎯 COMO USAR O PROFILE_CONTEXT (CRÍTICO)

Se profile_context estiver presente no JSON, você DEVE:

### 1. **RESPEITAR content_pillars**
- Cada pilar tem um weight (ex: 40%, 30%, 20%, 10%)
- Distribua os 3 carrosséis seguindo essa proporção
- Use os subtopics de cada pilar como fonte de ideias
- Incorpore as mensagensChave no copy dos slides

**Exemplo:** Se o pilar "Transformação Serviço → Produto" tem 40%, pelo menos 1 carrossel DEVE ser sobre esse tema.

### 2. **USAR content_style**
- **Tom de voz**: Use o toneOfVoice exato descrito (ex: "Direto, analítico, sem bullshit motivacional")
- **Linguagem**: Respeite formality, person, emojis, caps, storytelling
- **Palavras-marca**: Inclua as wordsMarca quando fizer sentido
- **Evitar**: NUNCA use palavras/frases da lista evitar
- **Comprimento**: Respeite comprimentoIdeal para carrosséis
- **TERMOS A EVITAR** (language.termsToAvoid): Se houver lista de termos técnicos/jargões a evitar, NUNCA use essas palavras. Substitua por sinônimos simples que o público entende.

### 3. **INCLUIR business (produtos/ofertas)**
- Se o carrossel mencionar solução, cite o produto REAL da pessoa
- Use o cta específico de cada produto
- Mencione price quando for carrossel de vendas
- Referencie leadMagnets quando relevante

### 4. **INCORPORAR dna**
- **uniqueVoice**: Siga o padrão de voz descrito (ex: "problema → história → framework → case → CTA")
- **Energy**: Reflita a energia da pessoa (ex: "calmo e analítico" vs "alta energia motivacional")
- **Frameworks**: Mencione frameworks que a pessoa usa (ex: "Hormozi Value Equation", "Dan Sullivan Who Not How")

### 5. **USAR identity para personalização**
- **Positioning**: Valide que os carrosséis reforçam o posicionamento
- **Avatar**: Escreva pensando no público-alvo específico
- **Niche**: Mantenha relevância para o nicho declarado

---

## ⚠️ REGRAS CRÍTICAS QUANDO HÁ profile_context

1. **SE NÃO HOUVER profile_context**: gere conteúdo genérico baseado só na auditoria (comportamento antigo)

2. **SE HOUVER profile_context**: o conteúdo DEVE ser 100% personalizado:
   - Copy no tom de voz exato
   - Carrosséis distribuídos pelos pilares (seguindo os pesos)
   - Mensagens-chave incorporadas
   - Produtos reais mencionados
   - Frameworks da pessoa citados
   - Palavras proibidas NUNCA usadas

3. **PRIORIDADE**: profile_context > auditoria. Se houver conflito entre o que a auditoria sugere e o que o contexto define, SIGA O CONTEXTO.

4. **🚫 TERMOS A EVITAR - REGRA CRÍTICA**:
   - Se `profile_context.content_style.language.termsToAvoid` existir, você NUNCA DEVE usar essas palavras no conteúdo
   - Esses são jargões técnicos, termos em inglês ou palavras complexas que o público-alvo NÃO entende
   - Sempre substitua por sinônimos simples em português
   - Exemplos de substituição:
     * "ROI" → "retorno do investimento" ou "quanto você ganha de volta"
     * "CTR" → "taxa de cliques" ou "quantas pessoas clicam"
     * "funil" → "jornada de compra" ou "caminho até a venda"
     * "engagement" → "interação" ou "curtidas e comentários"
     * "lead magnet" → "isca digital" ou "presente grátis"
   - **CRÍTICO**: Verifique TODOS os slides antes de retornar. Se encontrar algum termo da lista termsToAvoid, REESCREVA o slide.

---

# OUTPUT ESPERADO

Retorne um JSON com esta estrutura EXATA:

\`\`\`json
{
  "carousels": [
    {
      "titulo": "string (título do carrossel)",
      "tipo": "educacional|vendas|autoridade|viral",
      "objetivo": "string (o que resolve da auditoria)",
      "baseado_em": "string (qual insight da auditoria inspirou)",
      "slides": [
        {
          "numero": 1,
          "tipo": "hook|conteudo|cta",
          "titulo": "string (título do slide)",
          "corpo": "string (texto do slide)",
          "notas_design": "string (sugestões visuais)",
          "imagem_prompt": "string (descrição em inglês da fotografia/ilustração ideal para acompanhar este slide — específica ao contexto do conteúdo, sem texto na imagem)"
        }
      ],
      "caption": "string (legenda do Instagram)",
      "hashtags": ["string"],
      "cta": "string (call to action específico)"
    }
  ],
  "estrategia_geral": "string (explicação da estratégia)",
  "proximos_passos": ["string (recomendações)"]
}
\`\`\`

# REGRAS IMPORTANTES

1. **Seja específico** - Use dados reais da auditoria
2. **Resolva gaps** - Foque nos pontos fracos detectados
3. **Mantenha autenticidade** - Respeite o tom do perfil auditado
4. **Ação imediata** - Quick wins que pode publicar hoje
5. **Retorne APENAS o JSON** - Sem texto adicional
6. **Formatação de texto** - Use MAIÚSCULAS apenas para palavras ou frases curtas que devem ter ÊNFASE FORTE (serão convertidas automaticamente para negrito nos slides). Evite frases inteiras em CAPS. Exemplo correto: "A VERDADE sobre marketing" em vez de "A VERDADE SOBRE MARKETING DE CONTEÚDO É QUE VOCÊ PRECISA". Use capitalização normal para o resto do texto.
7. **LINGUAGEM DE GÊNERO** - CRÍTICO: Use a linguagem correta baseada no gênero do perfil:
   - **Masculino**: "ele", "empreendedor", "especialista", "influenciador"
   - **Feminino**: "ela", "empreendedora", "especialista", "influenciadora"
   - **Neutro**: use linguagem neutra ("pessoa", "profissional")
   - **Empresa**: use "a empresa", "a marca", linguagem institucional

   O gênero do perfil será fornecido no JSON da auditoria. SEMPRE respeite essa informação ao escrever o copy.
8. **imagem_prompt obrigatório** - Para cada slide, crie uma descrição DETALHADA em inglês da imagem que ilustra o conteúdo. Use esta estrutura:

   **ESTRUTURA OBRIGATÓRIA:** [sujeito principal], [ação/pose específica], [ambiente detalhado], [iluminação], [estilo visual], [detalhes adicionais]

   **REGRAS CRÍTICAS:**
   - SEMPRE relacionado ao nicho do perfil (nutricionista → comida saudável/cozinha; coach → escritório/pessoa trabalhando; fitness → academia/exercício)
   - SEJA EXTREMAMENTE ESPECÍFICO: não use "a person", use "confident entrepreneur in professional attire" ou "athletic woman in sportswear"
   - DESCREVA A CENA COMPLETA: o que está no fundo, objetos visíveis, cores dominantes, atmosfera
   - NUNCA mencione texto, palavras, letras, números ou tipografia na imagem
   - Use termos visuais concretos: "warm golden hour sunlight", "minimalist white desk", "vibrant fresh vegetables"

   **REGRAS ESPECIAIS PARA MARCAS E FERRAMENTAS:**
   - Se o slide menciona MARCAS (Instagram, TikTok, ChatGPT, Canva, etc.) → SEMPRE inclua o nome da marca + "logo" ou "brand identity" no prompt
   - Se o slide menciona FERRAMENTAS/APPS → SEMPRE inclua "dashboard interface" ou "app screenshot" + nome da ferramenta
   - Se o slide menciona PLATAFORMAS → SEMPRE inclua o nome da plataforma + "interface" ou "app"
   - Exemplos:
     * Slide sobre Instagram → "Instagram logo and app interface on smartphone screen, Instagram feed showing engagement metrics"
     * Slide sobre ChatGPT → "ChatGPT interface screenshot, modern AI chat conversation, OpenAI branding visible"
     * Slide sobre analytics → "Google Analytics dashboard interface, real-time data visualization, metrics charts"
     * Slide sobre e-commerce → "Shopify dashboard interface, online store management panel, product listings visible"

   **EXEMPLOS CORRETOS:**
   - Marketing digital genérico: "focused entrepreneur analyzing data on multiple monitors in modern minimalist office, warm afternoon sunlight through large windows, sleek white desk with coffee cup, professional business casual attire, concentrated expression, contemporary corporate environment"
   - Instagram Marketing: "Instagram logo prominently displayed, Instagram app interface on smartphone, engagement metrics visible, professional influencer analyzing Instagram Insights dashboard, modern clean aesthetic"
   - Fitness genérico: "athletic woman performing deadlift with perfect form in bright modern gym, natural light from large windows, mirrors reflecting determined expression, professional workout attire, motivational energy, clean industrial aesthetic with visible weights in background"
   - Nutrição: "fresh colorful mediterranean salad bowl on rustic wooden table, vibrant greens, cherry tomatoes, grilled chicken, natural daylight from window, clean white plates, healthy lifestyle aesthetic, bright airy kitchen background"

Agora analise a auditoria abaixo e crie as 3 sugestões de carrosséis:`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // Extrair tema personalizado do body (se fornecido)
    let custom_theme: string | null = null
    try {
      const body = await request.json()
      custom_theme = body.custom_theme || null

      // Validar tema personalizado
      if (custom_theme) {
        if (typeof custom_theme !== 'string') {
          return NextResponse.json(
            { error: 'Tema personalizado deve ser uma string' },
            { status: 400 }
          )
        }

        if (custom_theme.length > 500) {
          return NextResponse.json(
            { error: 'Tema muito longo (máximo 500 caracteres)' },
            { status: 400 }
          )
        }

        // Sanitizar: remover espaços extras e quebras de linha excessivas
        custom_theme = custom_theme.trim().replace(/\s+/g, ' ')

        console.log('🎯 Tema personalizado recebido:', custom_theme.substring(0, 100) + '...')
      }
    } catch (e) {
      // Body vazio é OK (comportamento antigo)
      console.log('📝 Nenhum tema personalizado fornecido')
    }

    // Buscar auditoria completa
    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error || !audit) {
      return NextResponse.json(
        { error: 'Auditoria não encontrada' },
        { status: 404 }
      )
    }

    // Buscar contexto rico do perfil
    const { data: profileContext } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', audit.profile_id)
      .is('deleted_at', null)
      .single()

    console.log('📋 Contexto do perfil:', profileContext ? 'Encontrado' : 'Não encontrado')

    // Preparar dados para o Content Squad
    const auditData = {
      profile: {
        username: audit.profile.username,
        full_name: audit.profile.full_name,
        biography: audit.profile.biography,
        followers: audit.snapshot_followers,
        gender: audit.profile.gender || 'neutro' // Gênero do perfil
      },
      profile_context: profileContext ? {
        identity: profileContext.identity || {},
        credibility: profileContext.credibility || {},
        philosophy: profileContext.philosophy || {},
        content_style: profileContext.content_style || {},
        content_pillars: profileContext.content_pillars || [],
        business: profileContext.business || {},
        dna: profileContext.dna || {}
      } : null,
      scores: {
        overall: audit.score_overall,
        behavior: audit.score_behavior,
        copy: audit.score_copy,
        offers: audit.score_offers,
        metrics: audit.score_metrics,
        anomalies: audit.score_anomalies
      },
      classification: audit.classification,
      engagement: {
        rate: audit.engagement_rate,
        total_likes: audit.total_likes,
        total_comments: audit.total_comments,
        posts_analyzed: audit.posts_analyzed
      },
      insights: audit.raw_json?.auditors_analysis || {},
      strengths: audit.raw_json?.top_strengths || [],
      problems: audit.raw_json?.critical_problems || [],
      quick_wins: audit.raw_json?.quick_wins || [],
      strategic_moves: audit.raw_json?.strategic_moves || []
    }

    // Adicionar instrução de tema personalizado ao prompt (se fornecido)
    const themeInstruction = custom_theme
      ? `\n\n## 🎯 TEMA ESPECÍFICO DO EXPERT\n\nO expert solicitou carrosséis sobre este tema:\n\n"${custom_theme}"\n\n**INSTRUÇÕES:**\n- Crie os 3 carrosséis FOCADOS neste tema específico\n- Use os insights da auditoria para OTIMIZAR o copy e estrutura\n- Mantenha o tom e estilo do perfil auditado\n- Garanta que cada carrossel aborde o tema de forma única e complementar\n`
      : ''

    // Adicionar instrução explícita de termos a evitar (se houver)
    const termsToAvoid = profileContext?.content_style?.language?.termsToAvoid
    const termsInstruction = (termsToAvoid && termsToAvoid.length > 0)
      ? `\n\n## 🚫 TERMOS PROIBIDOS - NUNCA USE ESSAS PALAVRAS\n\nO expert configurou que seu público-alvo NÃO entende estes termos técnicos/jargões:\n\n${termsToAvoid.map(term => `- **${term}**`).join('\n')}\n\n**REGRA CRÍTICA:**\n- NUNCA use essas palavras em NENHUM slide, título, corpo, caption ou hashtag\n- Sempre substitua por sinônimos simples que o público entende\n- Revise TODO o conteúdo antes de retornar para garantir que nenhum desses termos foi usado\n- Se não souber um sinônimo, descreva o conceito de forma simples\n\n**Exemplos de substituição:**\n- Termos em inglês → equivalente em português\n- Jargões técnicos → explicação simples\n- Siglas → nome completo + explicação\n`
      : ''

    console.log('🎨 Enviando para Content Squad (Claude API)...')
    if (custom_theme) {
      console.log('🎯 Com tema personalizado')
    }
    if (profileContext) {
      console.log('✨ Com contexto rico do perfil:')
      console.log('   - Pilares de conteúdo:', profileContext.content_pillars?.length || 0)
      console.log('   - Tom de voz:', profileContext.content_style?.language?.toneOfVoice || 'N/A')
      console.log('   - Produtos:', profileContext.business?.products?.length || 0)
      console.log('   - Frameworks:', profileContext.dna?.frameworks?.length || 0)

      // Log de termos a evitar
      const termsToAvoid = profileContext.content_style?.language?.termsToAvoid
      if (termsToAvoid && termsToAvoid.length > 0) {
        console.log('   🚫 Termos a evitar:', termsToAvoid.join(', '))
      } else {
        console.log('   - Termos a evitar: Nenhum')
      }
    } else {
      console.log('⚠️  Sem contexto rico - gerando conteúdo genérico')
    }

    // Sanitizar dados antes de enviar (remove surrogates inválidos do conteúdo scrapeado)
    const sanitizedAuditData = sanitizeDeep(auditData)

    // Chamar Claude API com o Content Squad
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192, // Aumentado para permitir respostas maiores
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: CONTENT_CREATION_PROMPT + themeInstruction + termsInstruction + '\n\n```json\n' + JSON.stringify(sanitizedAuditData, null, 2) + '\n```'
        }
      ]
    })

    // Extrair JSON da resposta
    const firstContent = message.content[0]
    if (firstContent.type !== 'text') {
      throw new Error('Resposta inesperada da Claude API')
    }
    const responseText = firstContent.text
    console.log('✅ Resposta recebida do Content Squad')

    let contentResult
    try {
      // Remover markdown code blocks se existirem (múltiplas tentativas)
      let jsonText = responseText.trim()

      // Tentar extrair JSON de code block
      const patterns = [
        /```json\n([\s\S]*?)\n```/,
        /```json([\s\S]*?)```/,
        /```\n([\s\S]*?)\n```/,
        /```([\s\S]*?)```/
      ]

      for (const pattern of patterns) {
        const match = jsonText.match(pattern)
        if (match) {
          jsonText = match[1].trim()
          break
        }
      }

      // Se ainda tiver ``` no início, remover manualmente
      jsonText = jsonText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '')

      console.log('📝 JSON extraído (primeiros 200 chars):', jsonText.substring(0, 200))
      console.log('📏 Tamanho do JSON:', jsonText.length, 'caracteres')

      contentResult = JSON.parse(jsonText)
      console.log('✅ JSON parseado com sucesso')
    } catch (e: any) {
      console.error('❌ Erro ao fazer parse do JSON:', e)
      console.error('📄 Resposta completa (primeiros 1000 chars):', responseText.substring(0, 1000))
      console.error('📄 Resposta completa (últimos 500 chars):', responseText.substring(responseText.length - 500))

      // Se for erro de string não terminada, pode ser que foi truncado
      if (e.message.includes('Unterminated string') || e.message.includes('Unexpected end')) {
        return NextResponse.json(
          {
            error: 'Resposta do Content Squad foi truncada. Tente novamente ou simplifique a auditoria.',
            details: 'JSON incompleto - resposta muito longa'
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Erro ao processar resposta do Content Squad', details: e.message },
        { status: 500 }
      )
    }

    // Salvar sugestões no banco (tabela content_suggestions)
    console.log('💾 Salvando conteúdo no banco...')

    // Verificar se já existe conteúdo para esta auditoria
    const { data: existing } = await supabase
      .from('content_suggestions')
      .select('id')
      .eq('audit_id', id)
      .single()

    let contentSuggestionId: string

    if (existing) {
      // Atualizar existente
      const { error: updateError } = await supabase
        .from('content_suggestions')
        .update({
          content_json: contentResult,
          generated_at: new Date().toISOString()
        })
        .eq('audit_id', id)

      if (updateError) {
        console.error('❌ Erro ao atualizar conteúdo no banco:', updateError)
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo no banco', details: updateError.message },
          { status: 500 }
        )
      }

      contentSuggestionId = existing.id
    } else {
      // Criar novo
      const { data: newRecord, error: insertError } = await supabase
        .from('content_suggestions')
        .insert({
          audit_id: id,
          profile_id: audit.profile_id,
          content_json: contentResult,
          generated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (insertError || !newRecord) {
        console.error('❌ Erro ao criar conteúdo no banco:', insertError)
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo no banco', details: insertError?.message },
          { status: 500 }
        )
      }

      contentSuggestionId = newRecord.id
    }

    // Garantir que exista link em content_profile_links (para aparecer na página de perfil)
    await supabase
      .from('content_profile_links')
      .upsert({
        content_id: contentSuggestionId,
        profile_id: audit.profile_id,
        link_type: 'original',
        linked_at: new Date().toISOString(),
        deleted_at: null
      }, { onConflict: 'content_id,profile_id', ignoreDuplicates: false })

    console.log('✅ Conteúdo salvo no banco')

    const response = {
      success: true,
      audit_id: id,
      profile: audit.profile.username,
      content: contentResult,
      generated_at: new Date().toISOString()
    }

    console.log('📤 Retornando resposta:', {
      success: response.success,
      hasContent: !!response.content,
      carouselsCount: response.content?.carousels?.length,
      firstCarouselTitle: response.content?.carousels?.[0]?.titulo
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo', details: error.message },
      { status: 500 }
    )
  }
}
