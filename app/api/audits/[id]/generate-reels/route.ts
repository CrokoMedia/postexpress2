import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

const REELS_PROMPT = `Você é o líder do Content Creation Squad com 5 mentes especializadas:

1. **Eugene Schwartz** - Copywriting científico (líder)
2. **Seth Godin** - Branding e narrativas
3. **Alex Hormozi** - Ofertas irresistíveis
4. **Thiago Finch** - Marketing BR
5. **Adriano De Marqui** - Design visual

# TAREFA

Você recebeu uma **auditoria completa** de um perfil do Instagram.

Baseado nos insights da auditoria, crie **3 ideias de Reels** para gravar.

# REGRA FUNDAMENTAL — TÓPICOS, NÃO ROTEIRO

**NUNCA escreva roteiro completo.** Ninguém grava lendo roteiro — fica engessado e artificial.

Escreva apenas **tópicos curtos e diretos** — o que falar em cada parte, não como falar.
A pessoa vai usar os tópicos como guia enquanto grava naturalmente.

# ESTRUTURA DE CADA IDEIA DE REEL

Para cada Reel, defina:

- **hook_verbal**: A PRIMEIRA FRASE falada para prender atenção nos 3 primeiros segundos (máximo 15 palavras, impactante)
- **topicos**: Lista de 3 a 5 tópicos curtos — o QUÊ falar em cada parte (máximo 15 palavras por tópico)
- **cta_final**: O que pedir para a audiência fazer no final (comentar, salvar, seguir)
- **dica_gravacao**: 1 dica prática de como gravar (ambiente, postura, tom — máximo 20 palavras)
- **duracao_sugerida**: Duração ideal (ex: "15-30s", "30-60s", "60s")
- **caption**: Legenda completa para o Instagram
- **hashtags**: 5 a 10 hashtags relevantes

# OUTPUT ESPERADO

Retorne um JSON com esta estrutura EXATA:

\`\`\`json
{
  "reels": [
    {
      "titulo": "string (título interno para identificar a ideia)",
      "duracao_sugerida": "string (ex: 30-60s)",
      "hook_verbal": "string (primeira frase falada, máx 15 palavras)",
      "topicos": [
        "string (tópico 1 — o que falar)",
        "string (tópico 2 — o que falar)",
        "string (tópico 3 — o que falar)"
      ],
      "cta_final": "string (o que pedir para a audiência fazer)",
      "dica_gravacao": "string (1 dica prática de gravação)",
      "caption": "string (legenda completa do Instagram)",
      "hashtags": ["string"]
    }
  ]
}
\`\`\`

# REGRAS

1. **Tópicos curtos** — máximo 15 palavras cada
2. **Hook impactante** — promessa, curiosidade, ou provocação em 3 segundos
3. **Baseado na auditoria** — use os insights reais do perfil
4. **Tom autêntico** — respeite a voz do criador
5. **Retorne APENAS o JSON** — sem texto adicional

Agora analise a auditoria abaixo e crie as 3 ideias de Reels:`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    let custom_theme: string | null = null
    try {
      const body = await request.json()
      custom_theme = body.custom_theme || null
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
        custom_theme = custom_theme.trim().replace(/\s+/g, ' ')
      }
    } catch {
      // Body vazio é OK
    }

    const { data: audit, error } = await supabase
      .from('audits')
      .select(`*, profile:instagram_profiles(*)`)
      .eq('id', id)
      .single()

    if (error || !audit) {
      return NextResponse.json({ error: 'Auditoria não encontrada' }, { status: 404 })
    }

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

    const themeInstruction = custom_theme
      ? `\n\n## 🎯 TEMA ESPECÍFICO\n\nCrie os 3 Reels focados neste tema:\n\n"${custom_theme}"\n\nUse os insights da auditoria para otimizar hook e tópicos.\n`
      : ''

    const sanitizedAuditData = sanitizeDeep(auditData)

    console.log('🎬 Gerando ideias de Reels com Claude API...')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: REELS_PROMPT + themeInstruction + '\n\n```json\n' + JSON.stringify(sanitizedAuditData, null, 2) + '\n```'
        }
      ]
    })

    const firstContent = message.content[0]
    if (firstContent.type !== 'text') {
      throw new Error('Resposta inesperada da Claude API')
    }

    const responseText = firstContent.text
    console.log('✅ Resposta recebida')

    let reelsResult
    try {
      let jsonText = responseText.trim()
      const patterns = [
        /```json\n([\s\S]*?)\n```/,
        /```json([\s\S]*?)```/,
        /```\n([\s\S]*?)\n```/,
        /```([\s\S]*?)```/
      ]
      for (const pattern of patterns) {
        const match = jsonText.match(pattern)
        if (match) { jsonText = match[1].trim(); break }
      }
      jsonText = jsonText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '')
      reelsResult = JSON.parse(jsonText)
    } catch (e: any) {
      console.error('❌ Erro ao parsear JSON:', e)
      return NextResponse.json(
        { error: 'Erro ao processar resposta do Content Squad', details: e.message },
        { status: 500 }
      )
    }

    // Buscar ou criar content_suggestion
    const { data: existing } = await supabase
      .from('content_suggestions')
      .select('id')
      .eq('audit_id', id)
      .single()

    if (existing) {
      await supabase
        .from('content_suggestions')
        .update({ reels_json: reelsResult })
        .eq('audit_id', id)
    } else {
      // Criar registro mínimo com reels_json (content_json vazio mas válido)
      await supabase
        .from('content_suggestions')
        .insert({
          audit_id: id,
          profile_id: audit.profile_id,
          content_json: { carousels: [], estrategia_geral: '', proximos_passos: [] },
          reels_json: reelsResult,
          generated_at: new Date().toISOString()
        })
    }

    console.log('✅ Reels salvos no banco')

    return NextResponse.json({
      success: true,
      audit_id: id,
      profile: audit.profile.username,
      reels: reelsResult,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erro ao gerar reels:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar ideias de Reels', details: error.message },
      { status: 500 }
    )
  }
}
