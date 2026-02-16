import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Rate limiting simples (em memória - para produção usar Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 10 // mensagens por janela
const RATE_WINDOW = 60 * 1000 // 1 minuto

function checkRateLimit(profileId: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(profileId)

  if (!record || now > record.resetAt) {
    // Nova janela
    rateLimitMap.set(profileId, {
      count: 1,
      resetAt: now + RATE_WINDOW
    })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: profileId } = await params
    const supabase = getServerSupabase()

    // Validar rate limit
    if (!checkRateLimit(profileId)) {
      return NextResponse.json(
        { error: 'Limite de mensagens excedido. Aguarde alguns segundos e tente novamente.' },
        { status: 429 }
      )
    }

    // Extrair dados do body
    const body = await request.json()
    const { message, conversation_history } = body

    // Validar inputs
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Mensagem muito longa (máximo 2000 caracteres)' },
        { status: 400 }
      )
    }

    if (!Array.isArray(conversation_history)) {
      return NextResponse.json(
        { error: 'Histórico de conversação inválido' },
        { status: 400 }
      )
    }

    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    // Buscar última auditoria
    const { data: latestAudit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (auditError || !latestAudit) {
      return NextResponse.json(
        { error: 'Nenhuma auditoria encontrada para este perfil' },
        { status: 404 }
      )
    }

    // Montar contexto do sistema com dados da auditoria
    const topStrengths = latestAudit.raw_json?.top_strengths
      ?.slice(0, 3)
      .map((s: any) => `• ${s.title}`)
      .join('\n') || 'N/A'

    const criticalProblems = latestAudit.raw_json?.critical_problems
      ?.slice(0, 3)
      .map((p: any) => `• ${p.title}`)
      .join('\n') || 'N/A'

    const quickWins = latestAudit.raw_json?.quick_wins
      ?.slice(0, 3)
      .map((w: any) => `• ${w}`)
      .join('\n') || 'N/A'

    const systemContext = `Você é o Content Squad, um time de 5 especialistas em criar carrosséis de alta conversão para Instagram:

1. **Eugene Schwartz** - Copywriting científico (líder)
2. **Seth Godin** - Branding e narrativas
3. **Alex Hormozi** - Ofertas irresistíveis
4. **Thiago Finch** - Marketing BR
5. **Adriano De Marqui** - Design visual

**CONTEXTO DO PERFIL @${profile.username}:**

📊 **Métricas Gerais:**
• Seguidores: ${latestAudit.snapshot_followers?.toLocaleString() || 'N/A'}
• Score Geral: ${latestAudit.score_overall}/100
• Engagement Rate: ${latestAudit.engagement_rate?.toFixed(2) || 'N/A'}%
• Posts Analisados: ${latestAudit.posts_analyzed || 0}
• Classificação: ${latestAudit.classification || 'N/A'}

📈 **Scores por Categoria:**
• Comportamento: ${latestAudit.score_behavior}/100
• Copy: ${latestAudit.score_copy}/100
• Ofertas: ${latestAudit.score_offers}/100
• Métricas: ${latestAudit.score_metrics}/100

✅ **Principais Forças:**
${topStrengths}

⚠️ **Problemas Críticos:**
${criticalProblems}

🎯 **Quick Wins Recomendados:**
${quickWins}

**INSTRUÇÕES:**
- Responda de forma conversacional, criativa e acionável
- Use os dados da auditoria para fundamentar suas sugestões
- Sugira carrosséis, hooks, CTAs e estratégias baseadas neste contexto
- Seja específico e dê exemplos práticos
- Mantenha o tom profissional mas amigável
- Foque em resultados e conversão
- Quando sugerir carrosséis, estruture com número de slides, títulos e temas específicos
- Se perguntarem sobre temas, sugira 3-5 opções relevantes baseadas nos problemas/forças identificados`

    console.log('💬 Enviando mensagem para Content Squad (Claude API)...')

    // Montar mensagens da conversa (sem a mensagem de boas-vindas)
    const conversationMessages = conversation_history
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .slice(1) // Remover mensagem de boas-vindas
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))

    // Adicionar mensagem atual
    conversationMessages.push({
      role: 'user',
      content: message
    })

    // Chamar Claude API
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 1,
      system: systemContext,
      messages: conversationMessages as any
    })

    const firstContent = response.content[0]
    if (firstContent.type !== 'text') {
      throw new Error('Resposta inesperada da Claude API')
    }
    const responseText = firstContent.text

    console.log('✅ Resposta recebida do Content Squad')
    console.log(`📝 Tamanho da resposta: ${responseText.length} caracteres`)

    return NextResponse.json({
      success: true,
      response: responseText,
      profile_username: profile.username,
      tokens_used: response.usage
    })

  } catch (error: any) {
    console.error('❌ Erro na API de chat:', error)

    // Tratamento específico para erro de rate limit da Anthropic
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API temporariamente sobrecarregada. Aguarde alguns segundos e tente novamente.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao processar mensagem', details: error.message },
      { status: 500 }
    )
  }
}
