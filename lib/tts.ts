import cloudinary from 'cloudinary'

// --- Providers ---
export type TTSProvider = 'openai' | 'elevenlabs'

// Vozes disponíveis no OpenAI TTS
export type OpenAIVoice = 'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx'

// Vozes disponíveis no ElevenLabs (pt-BR recomendadas)
export type ElevenLabsVoice = 'rachel' | 'adam' | 'antoni' | 'bella'

// Union de todas as vozes suportadas
export type TTSVoice = OpenAIVoice | ElevenLabsVoice

// Mapeamento de nomes amigáveis para voice_id do ElevenLabs
const ELEVENLABS_VOICE_MAP: Record<ElevenLabsVoice, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  adam: 'pNInz6obpgDQGcFmaJgB',
  antoni: 'ErXwobaYiN019PkySvjV',
  bella: 'EXAVITQu4vr4xnSDxMaL',
}

export interface TTSOptions {
  provider?: TTSProvider
  voice: TTSVoice
  language: 'pt-BR'
  speed?: number       // 0.8 - 1.2
  format?: 'mp3' | 'wav'
  voiceId?: string     // Custom voice_id (e.g., cloned voice from ElevenLabs)
}

export interface TTSResult {
  audioBuffer: Buffer
  durationSeconds: number
}

/**
 * Estima a duração do áudio baseado no tamanho do texto em português.
 * Média de ~150 palavras/minuto em fala natural (pt-BR).
 * Ajustado pela velocidade (speed).
 */
function estimateAudioDuration(text: string, speed: number = 1.0): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const wordsPerMinute = 150 * speed
  const durationMinutes = words / wordsPerMinute
  // Mínimo de 1.5 segundos
  return Math.max(durationMinutes * 60, 1.5)
}

/**
 * Limpa texto para narração (remover markdown, emojis excessivos, etc.)
 */
function cleanTextForNarration(text: string): string {
  return text
    .replace(/\*\*/g, '')          // negrito markdown
    .replace(/\*/g, '')            // itálico markdown
    .replace(/#+ /g, '')           // headings markdown
    .replace(/- /g, '')            // listas markdown
    .replace(/\n{3,}/g, '\n\n')   // múltiplas quebras de linha
    .trim()
}

/**
 * Determina o provider efetivo a ser usado.
 * Se ElevenLabs foi solicitado mas a API key não existe, faz fallback para OpenAI.
 */
function resolveProvider(requested?: TTSProvider): TTSProvider {
  if (requested === 'elevenlabs') {
    if (process.env.ELEVENLABS_API_KEY) {
      return 'elevenlabs'
    }
    console.warn(
      'ElevenLabs solicitado mas ELEVENLABS_API_KEY não configurada. Usando OpenAI como fallback.'
    )
    return 'openai'
  }
  return requested || 'openai'
}

/**
 * Verifica se uma voz é compatível com o provider ElevenLabs.
 * Se não for, retorna a voz padrão do ElevenLabs (rachel).
 */
function resolveElevenLabsVoice(voice: TTSVoice): ElevenLabsVoice {
  if (voice in ELEVENLABS_VOICE_MAP) {
    return voice as ElevenLabsVoice
  }
  // Voz OpenAI foi passada para ElevenLabs — usar voz padrão
  console.warn(
    `Voz "${voice}" não disponível no ElevenLabs. Usando "rachel" como padrão.`
  )
  return 'rachel'
}

// ─── OpenAI TTS Provider ──────────────────────────────────────────────────

/**
 * Gera áudio via OpenAI TTS API (tts-1).
 */
async function generateOpenAITTS(
  text: string,
  voice: TTSVoice,
  speed: number,
  format: 'mp3' | 'wav'
): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada')
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice,
      speed,
      response_format: format,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `OpenAI TTS API erro ${response.status}: ${errorBody}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ─── ElevenLabs TTS Provider ──────────────────────────────────────────────

/**
 * Gera áudio via ElevenLabs Text-to-Speech API.
 * Usa o modelo eleven_turbo_v2_5 para melhor qualidade em múltiplos idiomas.
 * Se customVoiceId for fornecido, usa esse voice_id diretamente (ex: voz clonada).
 */
async function generateElevenLabsTTS(
  text: string,
  voice: ElevenLabsVoice,
  format: 'mp3' | 'wav',
  customVoiceId?: string
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY não configurada')
  }

  // Usar voice_id customizado (clonado) se fornecido, senão mapear do nome
  const resolvedVoiceId = customVoiceId || ELEVENLABS_VOICE_MAP[voice]

  // ElevenLabs aceita output_format como query param
  const outputFormat = format === 'wav' ? 'pcm_44100' : 'mp3_44100_128'

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}?output_format=${outputFormat}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `ElevenLabs TTS API erro ${response.status}: ${errorBody}`
    )
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ─── Unified TTS Interface ───────────────────────────────────────────────

/**
 * Gera áudio via TTS (multi-provider).
 * Suporta OpenAI (tts-1) e ElevenLabs (eleven_turbo_v2_5).
 * Se ElevenLabs solicitado mas API key ausente, faz fallback automático para OpenAI.
 * Retry com backoff exponencial (3 tentativas).
 */
export async function generateTTS(
  text: string,
  options: TTSOptions
): Promise<TTSResult> {
  const { voice, speed = 1.0, format = 'mp3', voiceId } = options

  // Resolver provider efetivo (com fallback)
  const provider = resolveProvider(options.provider)

  // Limpar texto para narração
  const cleanText = cleanTextForNarration(text)

  if (!cleanText) {
    throw new Error('Texto vazio para gerar TTS')
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let audioBuffer: Buffer

      if (provider === 'elevenlabs') {
        const elVoice = resolveElevenLabsVoice(voice)
        audioBuffer = await generateElevenLabsTTS(cleanText, elVoice, format, voiceId)
      } else {
        audioBuffer = await generateOpenAITTS(cleanText, voice, speed, format)
      }

      // Estimar duração a partir do tamanho do texto
      const durationSeconds = estimateAudioDuration(cleanText, speed)

      return { audioBuffer, durationSeconds }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `TTS [${provider}] tentativa ${attempt}/${maxRetries} falhou: ${lastError.message}`
      )

      // Se falhou com voiceId customizado, fazer fallback para vozes padrão
      if (voiceId && attempt === maxRetries) {
        console.warn(
          `Fallback: voiceId customizado "${voiceId}" falhou após ${maxRetries} tentativas. Tentando com voz padrão...`
        )
        try {
          const elVoice = resolveElevenLabsVoice(voice)
          const fallbackBuffer = await generateElevenLabsTTS(cleanText, elVoice, format)
          const durationSeconds = estimateAudioDuration(cleanText, speed)
          return { audioBuffer: fallbackBuffer, durationSeconds }
        } catch (fallbackError) {
          console.error('Fallback para voz padrão também falhou:', fallbackError)
          // Continuar para throw do erro original
        }
      }

      if (attempt < maxRetries) {
        // Backoff exponencial: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Falha ao gerar TTS [${provider}] após ${maxRetries} tentativas: ${lastError?.message}`
  )
}

/**
 * Faz upload do áudio gerado para o Cloudinary.
 * Cloudinary trata áudio como resource_type 'video'.
 * Retorna a URL pública e a duração real (se disponível via Cloudinary).
 */
export async function uploadAudioToCloudinary(
  audioBuffer: Buffer,
  options: {
    auditId: string
    slideIndex: number
    format?: 'mp3' | 'wav'
  }
): Promise<{ url: string; durationSeconds: number }> {
  // Configurar Cloudinary (pode já estar configurado, mas garantir)
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const { auditId, slideIndex, format = 'mp3' } = options
  const publicId = `slide-${slideIndex}-voiceover`

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: `postexpress/audio/${auditId}`,
        public_id: publicId,
        resource_type: 'video', // Cloudinary trata áudio como video
        overwrite: true,
        format,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Upload Cloudinary falhou: ${error.message}`))
          return
        }
        if (!result) {
          reject(new Error('Upload Cloudinary não retornou resultado'))
          return
        }

        resolve({
          url: result.secure_url,
          // Cloudinary retorna duração real para áudio/video
          durationSeconds: result.duration || 0,
        })
      }
    )

    uploadStream.end(audioBuffer)
  })
}

/**
 * Pipeline completo: gera TTS para um texto e faz upload para Cloudinary.
 * Retorna a URL do áudio e a duração (real do Cloudinary se disponível,
 * senão estimada).
 */
export async function generateAndUploadVoiceover(
  text: string,
  options: {
    voice: TTSVoice
    auditId: string
    slideIndex: number
    speed?: number
    provider?: TTSProvider
    voiceId?: string    // Custom voice_id (e.g., cloned voice)
  }
): Promise<{ audioUrl: string; durationSeconds: number }> {
  const { voice, auditId, slideIndex, speed = 1.0, provider, voiceId } = options

  const effectiveProvider = resolveProvider(provider)

  console.log(
    `   Gerando voiceover slide ${slideIndex + 1} (provider: ${effectiveProvider}, voz: ${voiceId ? 'clonada' : voice})...`
  )

  // Gerar áudio via TTS (multi-provider)
  const ttsResult = await generateTTS(text, {
    provider: effectiveProvider,
    voice,
    language: 'pt-BR',
    speed,
    format: 'mp3',
    voiceId,
  })

  console.log(
    `   Audio gerado [${effectiveProvider}] (${(ttsResult.audioBuffer.length / 1024).toFixed(0)} KB, ~${ttsResult.durationSeconds.toFixed(1)}s estimado)`
  )

  // Upload para Cloudinary
  const uploadResult = await uploadAudioToCloudinary(ttsResult.audioBuffer, {
    auditId,
    slideIndex,
    format: 'mp3',
  })

  // Usar duração do Cloudinary se disponível, senão a estimada
  const finalDuration = uploadResult.durationSeconds > 0
    ? uploadResult.durationSeconds
    : ttsResult.durationSeconds

  console.log(
    `   Voiceover upload: ${uploadResult.url} (${finalDuration.toFixed(1)}s)`
  )

  return {
    audioUrl: uploadResult.url,
    durationSeconds: finalDuration,
  }
}
