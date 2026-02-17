import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function sanitizeString(str: string): string {
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
}

const PARSE_CAROUSEL_PROMPT = `Você é um assistente especializado em transformar sugestões de conteúdo de texto livre em estrutura JSON de carrossel para Instagram.

# TAREFA

Analise o texto abaixo (que vem de uma conversa com o Content Squad) e extraia ou crie **1 carrossel** estruturado.

Se o texto já contém slides numerados ou estrutura de carrossel, extraia esses dados.
Se o texto contém ideias, temas ou sugestões, transforme-os em um carrossel coerente.

# OUTPUT ESPERADO

Retorne um JSON com esta estrutura EXATA:

\`\`\`json
{
  "titulo": "string (título do carrossel)",
  "tipo": "educacional|vendas|autoridade|viral",
  "objetivo": "string (objetivo do carrossel)",
  "baseado_em": "Sugestão do Content Squad (chat)",
  "slides": [
    {
      "numero": 1,
      "tipo": "hook|conteudo|cta",
      "titulo": "string (título do slide)",
      "corpo": "string (texto do slide)",
      "notas_design": "string (sugestões visuais)"
    }
  ],
  "caption": "string (legenda do Instagram)",
  "hashtags": ["string"],
  "cta": "string (call to action)"
}
\`\`\`

# REGRAS
1. **Retorne APENAS o JSON** - sem texto adicional, sem markdown
2. Crie entre 4 e 8 slides se não houver slides definidos no texto
3. O primeiro slide deve ser sempre hook, o último sempre cta
4. Se o texto não tiver conteúdo suficiente, crie um carrossel genérico de alta qualidade baseado no tema identificado
5. tipo deve ser um de: educacional, vendas, autoridade, viral

Texto do Content Squad para transformar em carrossel:`

/**
 * POST /api/profiles/[id]/save-to-content
 * Salva uma mensagem do chat como carrossel em content_suggestions
 * Body: { message_content: string, audit_id: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params
    const body = await request.json()
    const { message_content, audit_id } = body

    if (!message_content || typeof message_content !== 'string') {
      return NextResponse.json(
        { error: 'message_content é obrigatório' },
        { status: 400 }
      )
    }

    if (!audit_id || typeof audit_id !== 'string') {
      return NextResponse.json(
        { error: 'audit_id é obrigatório' },
        { status: 400 }
      )
    }

    const sanitizedContent = sanitizeString(message_content)

    // Chamar Claude para parsear o conteúdo em estrutura de carrossel
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${PARSE_CAROUSEL_PROMPT}\n\n${sanitizedContent}`
        }
      ]
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extrair JSON da resposta
    let carousel: any
    try {
      // Tentar extrair JSON de blocos de código markdown
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim()
      carousel = JSON.parse(jsonStr)
    } catch {
      console.error('Falha ao parsear JSON do Claude:', rawText)
      return NextResponse.json(
        { error: 'Não foi possível estruturar o conteúdo como carrossel. Tente com um texto mais detalhado.' },
        { status: 422 }
      )
    }

    // Garantir campo approved: null (pendente de revisão)
    carousel.approved = null

    const supabase = getServerSupabase()

    // Buscar content_suggestion existente para o audit_id
    const { data: existing } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', audit_id)
      .single()

    if (existing) {
      // Adicionar o novo carrossel ao array existente
      const contentJson = existing.content_json as any
      if (!contentJson.carousels) {
        contentJson.carousels = []
      }
      contentJson.carousels.push(carousel)

      const { error: updateError } = await supabase
        .from('content_suggestions')
        .update({
          content_json: contentJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Erro ao adicionar carrossel:', updateError)
        return NextResponse.json(
          { error: 'Erro ao salvar carrossel' },
          { status: 500 }
        )
      }

      console.log(`✅ Carrossel adicionado ao content_suggestion existente (audit_id: ${audit_id})`)
    } else {
      // Criar novo content_suggestion
      const { error: insertError } = await supabase
        .from('content_suggestions')
        .insert({
          audit_id,
          profile_id: profileId,
          content_json: {
            carousels: [carousel],
            estrategia_geral: 'Conteúdo gerado via chat com Content Squad',
            proximos_passos: ['Revise e aprove o carrossel', 'Gere os slides visuais', 'Publique no Instagram']
          },
          generated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erro ao criar content_suggestion:', insertError)
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo' },
          { status: 500 }
        )
      }

      console.log(`✅ Novo content_suggestion criado (audit_id: ${audit_id})`)
    }

    return NextResponse.json({
      success: true,
      audit_id,
      carousel_titulo: carousel.titulo
    })

  } catch (error: any) {
    console.error('Error saving carousel from chat:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao salvar conteúdo' },
      { status: 500 }
    )
  }
}
