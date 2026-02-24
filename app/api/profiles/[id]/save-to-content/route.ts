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
Se o texto for curto ou genérico, crie um carrossel de qualidade baseado no tema identificado.

# OUTPUT ESPERADO

Retorne SOMENTE o JSON abaixo, sem nenhum texto antes ou depois, sem blocos de código markdown, sem explicações:

{
  "titulo": "string (título do carrossel)",
  "tipo": "educacional",
  "objetivo": "string (objetivo do carrossel)",
  "baseado_em": "Sugestão do Content Squad (chat)",
  "slides": [
    {
      "numero": 1,
      "tipo": "hook",
      "titulo": "string (título do slide)",
      "corpo": "string (texto do slide)",
      "notas_design": "string (sugestões visuais)"
    }
  ],
  "caption": "string (legenda do Instagram)",
  "hashtags": ["hashtag1", "hashtag2"],
  "cta": "string (call to action)"
}

# REGRAS OBRIGATÓRIAS
1. Responda SOMENTE com o JSON — zero texto adicional, zero markdown, zero explicações
2. Crie entre 4 e 8 slides
3. O primeiro slide deve ser tipo "hook", o último tipo "cta"
4. tipo do carrossel deve ser exatamente um de: educacional, vendas, autoridade, viral
5. tipo de cada slide deve ser exatamente um de: hook, conteudo, cta

Texto para transformar em carrossel:`

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

    console.log('🤖 Resposta do Claude (primeiros 500 chars):', rawText.substring(0, 500))

    // Extrair JSON da resposta com múltiplas tentativas
    let carousel: any
    try {
      let jsonText = rawText.trim()

      // Tentar extrair de bloco de código markdown (múltiplos formatos)
      const patterns = [
        /```json\s*([\s\S]*?)\s*```/,
        /```\s*([\s\S]*?)\s*```/,
        /\{[\s\S]*\}/  // Encontrar primeiro objeto JSON válido
      ]

      for (const pattern of patterns) {
        const match = jsonText.match(pattern)
        if (match) {
          jsonText = match[1] || match[0]
          jsonText = jsonText.trim()
          break
        }
      }

      // Limpar resíduos de markdown e texto adicional
      jsonText = jsonText.replace(/^```json\s*/gm, '')
      jsonText = jsonText.replace(/^```\s*/gm, '')
      jsonText = jsonText.replace(/\s*```$/gm, '')

      // Remover texto antes do primeiro {
      const firstBrace = jsonText.indexOf('{')
      if (firstBrace > 0) {
        jsonText = jsonText.substring(firstBrace)
      }

      // Remover texto depois do último }
      const lastBrace = jsonText.lastIndexOf('}')
      if (lastBrace !== -1 && lastBrace < jsonText.length - 1) {
        jsonText = jsonText.substring(0, lastBrace + 1)
      }

      console.log('📝 JSON extraído para carrossel (primeiros 500 chars):', jsonText.substring(0, 500))

      carousel = JSON.parse(jsonText)

      // Validar estrutura mínima
      if (!carousel.titulo || !carousel.slides || !Array.isArray(carousel.slides)) {
        throw new Error('JSON inválido: falta titulo ou slides')
      }

      console.log('✅ Carrossel parseado com sucesso:', carousel.titulo, `(${carousel.slides.length} slides)`)

    } catch (parseError: any) {
      console.error('❌ Falha ao parsear JSON do Claude')
      console.error('   Erro:', parseError.message)
      console.error('   Resposta completa:', rawText)
      return NextResponse.json(
        {
          error: 'Não foi possível estruturar o conteúdo como carrossel. Tente com um texto mais detalhado.',
          debug: process.env.NODE_ENV === 'development' ? { rawText: rawText.substring(0, 1000), parseError: parseError.message } : undefined
        },
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

    let contentSuggestionId: string

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

      contentSuggestionId = existing.id
      console.log(`✅ Carrossel adicionado ao content_suggestion existente (audit_id: ${audit_id})`)
    } else {
      // Criar novo content_suggestion
      const { data: newRecord, error: insertError } = await supabase
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
        .select('id')
        .single()

      if (insertError || !newRecord) {
        console.error('Erro ao criar content_suggestion:', insertError)
        return NextResponse.json(
          { error: 'Erro ao salvar conteúdo' },
          { status: 500 }
        )
      }

      contentSuggestionId = newRecord.id
      console.log(`✅ Novo content_suggestion criado (audit_id: ${audit_id})`)
    }

    // Garantir que exista link em content_profile_links (para aparecer na página de perfil)
    await supabase
      .from('content_profile_links')
      .upsert({
        content_id: contentSuggestionId,
        profile_id: profileId,
        link_type: 'original',
        linked_at: new Date().toISOString(),
        deleted_at: null
      }, { onConflict: 'content_id,profile_id', ignoreDuplicates: false })

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
