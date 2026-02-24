import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { YoutubeTranscript } from 'youtube-transcript'
import { AssemblyAI } from 'assemblyai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, audit_id, youtube_url } = body

    console.log('[Distillery API] Request recebido:', { mode, audit_id, youtube_url })

    if (!mode || !['audit', 'youtube'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode deve ser "audit" ou "youtube"' },
        { status: 400 }
      )
    }

    if (mode === 'audit' && !audit_id) {
      console.error('[Distillery API] audit_id não fornecido')
      return NextResponse.json(
        { error: 'audit_id é obrigatório no modo audit' },
        { status: 400 }
      )
    }

    if (mode === 'youtube' && !youtube_url) {
      return NextResponse.json(
        { error: 'youtube_url é obrigatório no modo youtube' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // MODO 1: A partir de auditoria
    if (mode === 'audit') {
      console.log('[Distillery API] Buscando auditoria:', audit_id)

      // Buscar auditoria
      const { data: audit, error: auditError } = await supabase
        .from('audits')
        .select('*')
        .eq('id', audit_id)
        .single()

      if (auditError) {
        console.error('[Distillery API] Erro ao buscar auditoria:', auditError)
        return NextResponse.json(
          { error: `Erro Supabase: ${auditError.message}` },
          { status: 404 }
        )
      }

      if (!audit) {
        console.error('[Distillery API] Auditoria não existe:', audit_id)
        return NextResponse.json(
          { error: 'Auditoria não encontrada no banco de dados' },
          { status: 404 }
        )
      }

      console.log('[Distillery API] Auditoria encontrada:', audit.id)

      // Buscar perfil do Instagram separadamente
      const { data: profile, error: profileError } = await supabase
        .from('instagram_profiles')
        .select('id, username, full_name, biography, followers_count, following_count')
        .eq('id', audit.profile_id)
        .single()

      if (profileError || !profile) {
        console.error('[Distillery API] Erro ao buscar perfil:', profileError)
        return NextResponse.json(
          { error: 'Perfil não encontrado' },
          { status: 404 }
        )
      }

      console.log('[Distillery API] Perfil encontrado:', '@' + profile.username)

      // Adicionar perfil ao objeto audit
      const auditWithProfile = { ...audit, profile }

      // Montar contexto da auditoria para o Distillery
      const auditContext = `
# Contexto da Auditoria - @${auditWithProfile.profile.username}

## Scores
- Score Geral: ${auditWithProfile.score_overall}
- Comportamento: ${auditWithProfile.score_behavior}
- Copy: ${auditWithProfile.score_copy}
- Ofertas: ${auditWithProfile.score_offers}
- Métricas: ${auditWithProfile.score_metrics}
- Anomalias: ${auditWithProfile.score_anomalies}

## Perfil
- Username: @${auditWithProfile.profile.username}
- Nome: ${auditWithProfile.profile.full_name}
- Seguidores: ${auditWithProfile.profile.followers_count}
- Seguindo: ${auditWithProfile.profile.following_count}
- Bio: ${auditWithProfile.profile.biography || 'N/A'}

## Insights da Auditoria
${auditWithProfile.key_insights ? JSON.stringify(auditWithProfile.key_insights, null, 2) : 'N/A'}

## Oportunidades
${auditWithProfile.opportunities ? JSON.stringify(auditWithProfile.opportunities, null, 2) : 'N/A'}

## Pontos Fortes
${auditWithProfile.strengths ? JSON.stringify(auditWithProfile.strengths, null, 2) : 'N/A'}

## Pontos Fracos
${auditWithProfile.weaknesses ? JSON.stringify(auditWithProfile.weaknesses, null, 2) : 'N/A'}
      `.trim()

      // Processar com Content Distillery (via Claude)
      const result = await processWithDistillery(auditContext, 'audit', auditWithProfile.profile.username)

      // Verificar se já existe content_suggestion para este audit_id
      const { data: existingContent } = await supabase
        .from('content_suggestions')
        .select('id')
        .eq('audit_id', audit_id)
        .single()

      let contentSuggestion: any

      if (existingContent) {
        // UPDATE se já existe
        console.log('[Distillery] Atualizando content_suggestion existente...')
        const { data, error: updateError } = await supabase
          .from('content_suggestions')
          .update({
            content_json: result,
            updated_at: new Date().toISOString()
          })
          .eq('audit_id', audit_id)
          .select()
          .single()

        if (updateError) {
          console.error('Erro ao atualizar content_suggestions:', updateError)
        }
        contentSuggestion = data
      } else {
        // INSERT se não existe
        console.log('[Distillery] Criando novo content_suggestion...')
        const { data, error: insertError } = await supabase
          .from('content_suggestions')
          .insert({
            audit_id,
            profile_id: auditWithProfile.profile.id,
            content_json: result,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          console.error('Erro ao inserir content_suggestions:', insertError)
        }
        contentSuggestion = data
      }

      return NextResponse.json({
        success: true,
        mode: 'audit',
        ...result,
        content_suggestion_id: contentSuggestion?.id
      })
    }

    // MODO 2: A partir de YouTube
    if (mode === 'youtube') {
      // Validar URL do YouTube
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
      if (!youtubeRegex.test(youtube_url)) {
        return NextResponse.json(
          { error: 'URL do YouTube inválida' },
          { status: 400 }
        )
      }

      const videoId = extractYouTubeVideoId(youtube_url)
      console.log(`[Distillery] Processando vídeo YouTube: ${videoId}`)

      // Buscar transcrição
      let transcript: string
      try {
        transcript = await fetchYouTubeTranscript(videoId)
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message || 'Erro ao buscar transcrição do YouTube' },
          { status: 400 }
        )
      }

      // Validar tamanho da transcrição (limite ~50k caracteres = ~12.5k tokens)
      const MAX_TRANSCRIPT_LENGTH = 50000
      let truncatedTranscript = transcript

      if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
        console.log(
          `[Distillery] Transcrição muito longa (${transcript.length} chars). ` +
          `Truncando para ${MAX_TRANSCRIPT_LENGTH} chars.`
        )
        truncatedTranscript = transcript.substring(0, MAX_TRANSCRIPT_LENGTH) + '\n\n[...transcrição truncada...]'
      }

      // Adicionar contexto do vídeo
      const videoContext = `
# Vídeo do YouTube - ID: ${videoId}
URL: ${youtube_url}

## Transcrição (${truncatedTranscript.length} caracteres)

${truncatedTranscript}
      `.trim()

      // Processar com Content Distillery
      const result = await processWithDistillery(videoContext, 'youtube', videoId)

      return NextResponse.json({
        success: true,
        mode: 'youtube',
        video_id: videoId,
        video_url: youtube_url,
        transcript_length: transcript.length,
        was_truncated: transcript.length > MAX_TRANSCRIPT_LENGTH,
        ...result
      })
    }

    return NextResponse.json({ error: 'Modo não implementado' }, { status: 500 })
  } catch (error: any) {
    console.error('Erro em distill-youtube:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar' },
      { status: 500 }
    )
  }
}

// Processar com Content Distillery (via Claude API)
async function processWithDistillery(
  inputContent: string,
  mode: 'audit' | 'youtube',
  identifier: string
): Promise<any> {
  const systemPrompt = `
Você é o Content Distillery Chief, orquestrador de um squad de 9 agentes especializados em transformar conteúdo bruto em frameworks estruturados e peças de conteúdo multiplataforma.

## Pipeline de 6 Fases

### Fase 1: Extract (Extração)
- **tacit-extractor** (Cedric Chin): Extrair conhecimento tácito, relacional, somático
- **model-identifier** (Shane Parrish): Identificar modelos mentais, frameworks, heurísticas

### Fase 2: Distill (Destilação)
- **knowledge-architect** (Tiago Forte): Progressive Summarization em 5 camadas

### Fase 3: Multiply (Multiplicação)
- **idea-multiplier** (Nicolas Cole & Dickie Bush): 4A Framework → 80+ ideias
- **content-atomizer** (Gary Vaynerchuk): Reverse Pyramid → atomização

### Fase 4: Produce (Produção)
- **ecosystem-designer** (Dan Koe): Content Map + calendário
- **production-ops** (Justin Welsh): Batch production

### Fase 5: Optimize (Otimização)
- **youtube-strategist** (Paddy Galloway): SEO, títulos, thumbnails

## Output Esperado

Retorne um JSON com:
{
  "frameworks": [
    {
      "nome": "Nome do Framework",
      "categoria": "mental_model | heuristic | process",
      "descricao": "...",
      "componentes": ["..."],
      "aplicacao_pratica": "..."
    }
  ],
  "summary_layers": {
    "layer_1_tweet": "140 caracteres",
    "layer_2_thread": "3-5 tweets",
    "layer_3_article": "500 palavras",
    "layer_4_deep_dive": "1500 palavras",
    "layer_5_full": "transcrição completa resumida"
  },
  "ideas": [
    {
      "titulo": "...",
      "angulo_4a": "Actionable | Analytical | Aspirational | Anthropological",
      "formato": "carousel | reel | post | story",
      "score": 0-100,
      "plataforma": "instagram | linkedin | twitter | youtube"
    }
  ],
  "carousels": [
    {
      "titulo": "...",
      "tipo": "educacional | vendas | autoridade | viral",
      "objetivo": "...",
      "baseado_em": "framework X ou insight Y",
      "slides": [
        {
          "numero": 1,
          "tipo": "hook | conteudo | cta",
          "titulo": "...",
          "corpo": "...",
          "notas_design": "..."
        }
      ],
      "caption": "...",
      "hashtags": ["..."],
      "cta": "..."
    }
  ],
  "calendar": {
    "semana_1": ["post_id_1", "post_id_2", ...],
    "semana_2": [...],
    "semana_3": [...],
    "semana_4": [...]
  }
}

IMPORTANTE:
- Extraia NO MÍNIMO 3 frameworks
- Gere NO MÍNIMO 5 carrosséis
- Cada carrossel deve ter 6-10 slides
- Use os princípios de cada agente especialista
- Seja específico e acionável
  `.trim()

  const userPrompt = mode === 'audit'
    ? `Processe a seguinte auditoria de perfil do Instagram e gere conteúdo:\n\n${inputContent}`
    : `Processe a seguinte transcrição de vídeo do YouTube e extraia frameworks + gere conteúdo:\n\n${inputContent}`

  console.log(`[Distillery] Iniciando processamento com Claude...`)
  console.log(`[Distillery] Mode: ${mode}, Input length: ${inputContent.length} chars`)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 20000, // Aumentado para garantir resposta completa
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt
      }
    ]
  })

  console.log(`[Distillery] Claude respondeu. Tokens usados: input=${message.usage.input_tokens}, output=${message.usage.output_tokens}`)

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extrair JSON da resposta
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('Resposta da IA não contém JSON válido')
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0])

  // Adicionar metadados
  return {
    ...result,
    frameworks_count: result.frameworks?.length || 0,
    ideas_count: result.ideas?.length || 0,
    content_pieces: (result.carousels?.length || 0) + (result.ideas?.length || 0),
    processed_at: new Date().toISOString(),
    source_mode: mode,
    source_identifier: identifier
  }
}

// Extrair ID do vídeo do YouTube
function extractYouTubeVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  throw new Error('Não foi possível extrair o ID do vídeo')
}

// Buscar transcrição do YouTube
async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  console.log(`[Distillery] Buscando transcrição do vídeo: ${videoId}`)

  // Primeiro tentar auto-detect (pega o idioma padrão do vídeo)
  try {
    console.log(`[Distillery] Tentando buscar transcrição (auto-detect)...`)
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)

    if (transcriptData && transcriptData.length > 0) {
      const fullTranscript = transcriptData.map((item: any) => item.text).join(' ')
      console.log(`[Distillery] ✅ Transcrição obtida (auto): ${fullTranscript.length} caracteres`)
      return fullTranscript
    } else {
      console.log(`[Distillery] ⚠️ Auto-detect retornou array vazio (sem legendas)`)
    }
  } catch (err: any) {
    console.log(`[Distillery] Auto-detect falhou: ${err.message}`)
  }

  // Se auto-detect falhar, tentar idiomas específicos
  const langPriority = ['pt', 'pt-BR', 'en', 'es']

  for (const lang of langPriority) {
    try {
      console.log(`[Distillery] Tentando idioma: ${lang}`)
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, { lang })

      if (transcriptData && transcriptData.length > 0) {
        const fullTranscript = transcriptData.map((item: any) => item.text).join(' ')
        console.log(`[Distillery] ✅ Transcrição obtida (${lang}): ${fullTranscript.length} caracteres`)
        return fullTranscript
      } else {
        console.log(`[Distillery] ⚠️ Idioma ${lang} retornou array vazio (sem legendas)`)
      }
    } catch (err: any) {
      console.log(`[Distillery] Idioma ${lang} não disponível: ${err.message}`)
      // Continuar para próximo idioma
    }
  }

  // Se chegou aqui, nenhum método de legendas funcionou
  // Tentar fallback com AssemblyAI (transcrição de áudio)
  console.log(`[Distillery] ⚠️ Legendas não disponíveis. Tentando AssemblyAI...`)

  try {
    const transcriptFromAssembly = await transcribeWithAssemblyAI(videoId)
    return transcriptFromAssembly
  } catch (assemblyError: any) {
    console.error(`[Distillery] ❌ AssemblyAI também falhou:`, assemblyError.message)

    // Mensagem de erro mais útil para o usuário
    const errorMsg = assemblyError.message.includes('text/html')
      ? 'O vídeo pode ter restrições (idade, privacidade ou geográficas) que impedem o acesso programático ao áudio.'
      : assemblyError.message

    throw new Error(
      `❌ Não foi possível processar o vídeo ${videoId}.\n\n` +
      `📋 O que tentamos:\n` +
      `• Buscar legendas automáticas (não disponíveis)\n` +
      `• Transcrever áudio com AssemblyAI (falhou: ${errorMsg})\n\n` +
      `💡 Soluções:\n` +
      `1. Adicione legendas manualmente no YouTube Studio\n` +
      `2. Verifique se o vídeo é público e sem restrições\n` +
      `3. Tente outro vídeo que já tenha legendas disponíveis`
    )
  }
}

// Transcrever áudio do YouTube usando AssemblyAI (suporta todos os idiomas)
async function transcribeWithAssemblyAI(videoId: string): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY

  if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY não configurada. Adicione no .env')
  }

  const client = new AssemblyAI({
    apiKey: apiKey
  })

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  try {
    console.log(`[Distillery] Iniciando transcrição AssemblyAI: ${videoId}`)

    // AssemblyAI processa URLs diretas do YouTube (não precisa baixar!)
    // Auto-detectar idioma
    const transcript = await client.transcripts.transcribe({
      audio: videoUrl,
      language_detection: true,
      speech_models: ['universal-2'] // Modelo universal para suporte multilíngue
    })

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Erro desconhecido na transcrição')
    }

    if (!transcript.text) {
      throw new Error('Transcrição vazia retornada')
    }

    const detectedLanguage = transcript.language_code || 'unknown'
    console.log(`[Distillery] ✅ Transcrição AssemblyAI obtida: ${transcript.text.length} caracteres`)
    console.log(`[Distillery] Idioma detectado: ${detectedLanguage}`)
    console.log(`[Distillery] Duração do áudio: ${((transcript.audio_duration || 0) / 60).toFixed(1)} minutos`)

    // Se o idioma não for português, traduzir
    if (detectedLanguage !== 'pt' && detectedLanguage !== 'pt-BR') {
      console.log(`[Distillery] Traduzindo de ${detectedLanguage} para português...`)
      const translatedText = await translateToPortuguese(transcript.text, detectedLanguage)
      return translatedText
    }

    return transcript.text
  } catch (error: any) {
    console.error(`[Distillery] Erro AssemblyAI:`, error)
    throw error
  }
}

// Traduzir texto para português usando Claude
async function translateToPortuguese(text: string, sourceLanguage: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  console.log(`[Distillery] Iniciando tradução (${sourceLanguage} → PT)...`)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: `Traduza o seguinte texto de ${sourceLanguage} para português brasileiro.
Mantenha todos os termos técnicos, nomes próprios e conceitos importantes.
Seja preciso e natural.

TEXTO:
${text}`
      }
    ]
  })

  const translatedText = message.content[0].type === 'text' ? message.content[0].text : ''

  if (!translatedText) {
    throw new Error('Tradução vazia retornada')
  }

  console.log(`[Distillery] ✅ Tradução concluída: ${translatedText.length} caracteres`)
  console.log(`[Distillery] Tokens usados: input=${message.usage.input_tokens}, output=${message.usage.output_tokens}`)

  return translatedText
}
