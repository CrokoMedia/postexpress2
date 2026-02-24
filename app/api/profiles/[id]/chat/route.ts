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
    const { message, conversation_history, contentMode = 'carousel' } = body as {
      message: string
      conversation_history: Array<{ role: string; content: string }>
      contentMode?: 'carousel' | 'reel'
    }

    // Validar inputs
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida' },
        { status: 400 }
      )
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: 'Mensagem muito longa (máximo 10.000 caracteres)' },
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
      .from('instagram_profiles')
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
- Se perguntarem sobre temas, sugira 3-5 opções relevantes baseadas nos problemas/forças identificados

**INSTRUÇÕES PARA imagem_prompt EM CADA SLIDE:**
Quando gerar imagem_prompt para cada slide:
- Descreva uma CENA específica, não conceitos abstratos
- Inclua: iluminação, ângulo, ambiente, emoção
- Estilo: "cinematic photography, shallow depth of field, warm golden hour lighting"
- Exemplos bons:
  - "Close-up of hands typing on laptop in cozy home office, warm natural light, shallow depth of field"
  - "Person celebrating with fist pump, sunrise background, silhouette, orange and pink sky"
  - "Smartphone showing analytics dashboard with green growth charts, modern desk, soft bokeh"
- Exemplos ruins:
  - "engagement" (muito vago)
  - "marketing digital" (conceito, não cena)
  - "gráfico subindo" (sem contexto visual)
${contentMode === 'reel' ? `
**MODO REEL ATIVADO — Gere conteúdo otimizado para vídeo curto (15-30s)**

ESTRUTURA OBRIGATÓRIA DO REEL:

SLIDE 1 — HOOK (obrigatório):
- Pergunta provocativa OU dado chocante OU afirmação contraintuitiva
- Máximo 8-10 palavras no título
- Corpo: vazio ou 1 frase curta de apoio
- Objetivo: parar o scroll nos primeiros 2 segundos
- imagem_prompt: close-up dramático, emoção forte, impacto visual

SLIDES 2-6 — CONTEÚDO DE VALOR:
- Título: 10-15 palavras máximo (frase curta e impactante)
- Corpo: 1-2 frases CURTAS (máx 20 palavras total)
- Cada slide = UM conceito/dica/insight apenas
- A cada 2 slides, inserir "padrão de interrupção":
  → Pergunta retórica ("Você sabia que...?")
  → Dado chocante ("87% dos creators cometem esse erro")
  → Chamada direta ("Presta atenção nisso")
- imagem_prompt: cena que ilustra o conceito, estilo cinematográfico, warm tones

SLIDE FINAL — CTA:
- Título: CTA direto ("Salva esse reel pra não esquecer")
- Corpo: ação específica ("Comenta 'EU QUERO' que te mando o checklist")
- imagem_prompt: visual positivo, energia de conclusão, celebration

REGRAS DO MODO REEL:
- O texto será NARRADO em voz alta — escreva como fala natural, não texto escrito
- Use contrações e linguagem coloquial (pt-BR falado, não formal)
- Evite jargão técnico — explique como se fosse para um amigo
- Use palavras de poder: "segredo", "erro fatal", "nunca", "sempre", "exatamente"
- NÃO use negrito (**texto**) — a voz não consegue "negritar"
- NÃO use listas com bullet points — a voz não lê listas bem
- NÃO use CAPS excessivo — a voz não diferencia maiúsculas
- Cada slide deve fluir naturalmente para o próximo quando narrado

EXEMPLO DE REEL (7 slides, tema: engagement):
1. HOOK: "Você está matando seu engajamento sem saber"
2. "O maior erro que vejo creators cometendo é postar sem estratégia"
3. "Sabe aquele post que você fez às 3 da tarde? Ninguém viu"
4. INTERRUPÇÃO: "87% dos creators postam no horário errado"
5. "O segredo é simples: descubra quando seu público está online"
6. "Faça isso por 30 dias e me conta o resultado"
7. CTA: "Salva esse reel e começa hoje — comenta 'ESTRATÉGIA' que te mando o guia"
` : ''}`

    console.log('💬 Enviando mensagem para Content Squad (Claude API)...')

    // Montar mensagens da conversa (sem a mensagem de boas-vindas)
    const conversationMessages = conversation_history
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .slice(1) // Remover mensagem de boas-vindas
      .map((msg: any) => ({
        role: msg.role,
        content: sanitizeString(String(msg.content))
      }))

    // Adicionar mensagem atual (sanitizada)
    conversationMessages.push({
      role: 'user',
      content: sanitizeString(message)
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
