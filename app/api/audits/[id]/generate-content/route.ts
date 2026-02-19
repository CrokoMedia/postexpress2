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

Você recebeu uma **auditoria completa** de um perfil do Instagram com análise dos 5 auditores.

Baseado nos insights da auditoria, crie **3 sugestões de carrosséis** que:

1. **Resolvam os problemas identificados** (critical_problems)
2. **Aproveitem os pontos fortes** (top_strengths)
3. **Respondam às perguntas do público** (comentários)

**IMPORTANTE:** Seja CONCISO - máximo 6-8 slides por carrossel.

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
7. **imagem_prompt obrigatório** - Para cada slide, descreva em inglês a fotografia ou cena visual que melhor ilustra aquele slide específico. REGRAS do imagem_prompt:
   - Sempre dentro do nicho/área de expertise do perfil auditado (ex: nutricionista → alimentos, academia; coach financeiro → dinheiro, gráficos, escritório)
   - Descreva a cena com detalhes concretos: o que aparece, ambiente, iluminação, ângulo
   - Nunca use texto genérico como "a professional image" ou "a person working"
   - Nunca inclua texto, letras ou palavras na descrição da imagem
   - Exemplo para perfil de marketing digital: "entrepreneur reviewing social media analytics dashboard on laptop in a modern office, natural window light, focused expression, clean desk"
   - Exemplo para perfil de fitness: "personal trainer demonstrating proper squat form in a bright modern gym, athletic wear, mirrors in background, motivational energy"

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

    // Preparar dados para o Content Squad
    const auditData = {
      profile: {
        username: audit.profile.username,
        full_name: audit.profile.full_name,
        biography: audit.profile.biography,
        followers: audit.snapshot_followers
      },
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

    console.log('🎨 Enviando para Content Squad (Claude API)...')
    if (custom_theme) {
      console.log('🎯 Com tema personalizado')
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
          content: CONTENT_CREATION_PROMPT + themeInstruction + '\n\n```json\n' + JSON.stringify(sanitizedAuditData, null, 2) + '\n```'
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

    return NextResponse.json({
      success: true,
      audit_id: id,
      profile: audit.profile.username,
      content: contentResult,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo', details: error.message },
      { status: 500 }
    )
  }
}
