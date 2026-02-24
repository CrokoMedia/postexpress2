/**
 * lib/captions.ts — Extração de timestamps word-level via OpenAI Whisper API.
 *
 * Usado para sincronizar legendas animadas (AnimatedCaptions) com áudio
 * de voiceover gerado pela Story 9.4.
 */

export interface CaptionWord {
  word: string
  startMs: number
  endMs: number
}

export interface CaptionData {
  words: CaptionWord[]
  durationMs: number
}

/**
 * Transcreve áudio via OpenAI Whisper API e retorna timestamps word-level.
 *
 * Aceita URL do áudio (Cloudinary) — baixa o buffer e envia ao Whisper.
 * Usa response_format: 'verbose_json' + timestamp_granularities: ['word']
 * para obter timestamps precisos por palavra.
 */
export async function transcribeAudioForCaptions(
  audioUrl: string
): Promise<CaptionData> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada')
  }

  // Baixar o áudio do Cloudinary (ou qualquer URL pública)
  console.log(`   📝 Baixando áudio para transcrição: ${audioUrl}`)
  const audioResponse = await fetch(audioUrl)
  if (!audioResponse.ok) {
    throw new Error(
      `Falha ao baixar áudio: ${audioResponse.status} ${audioResponse.statusText}`
    )
  }

  const audioArrayBuffer = await audioResponse.arrayBuffer()
  const audioBuffer = Buffer.from(audioArrayBuffer)

  // Criar FormData para upload ao Whisper
  const formData = new FormData()

  // Detectar formato pelo URL
  const extension = audioUrl.split('.').pop()?.split('?')[0] || 'mp3'
  const mimeType = extension === 'wav' ? 'audio/wav' : 'audio/mpeg'
  const blob = new Blob([audioBuffer], { type: mimeType })
  formData.append('file', blob, `audio.${extension}`)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'word')
  formData.append('language', 'pt')

  console.log(
    `   📝 Transcrevendo áudio (${(audioBuffer.length / 1024).toFixed(0)} KB) via Whisper...`
  )

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(
          `Whisper API erro ${response.status}: ${errorBody}`
        )
      }

      const result = await response.json()

      // Extrair words com timestamps
      const words: CaptionWord[] = (result.words || []).map(
        (w: { word: string; start: number; end: number }) => ({
          word: w.word.trim(),
          startMs: Math.round(w.start * 1000),
          endMs: Math.round(w.end * 1000),
        })
      )

      // Duração total do áudio em ms
      const durationMs = result.duration
        ? Math.round(result.duration * 1000)
        : words.length > 0
          ? words[words.length - 1].endMs
          : 0

      console.log(
        `   📝 Transcrição concluída: ${words.length} palavras, ${(durationMs / 1000).toFixed(1)}s`
      )

      return { words, durationMs }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `   Whisper tentativa ${attempt}/${maxRetries} falhou: ${lastError.message}`
      )

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Falha ao transcrever áudio após ${maxRetries} tentativas: ${lastError?.message}`
  )
}

/**
 * Transcreve múltiplos áudios em paralelo (com limite de concorrência).
 * Retorna array de CaptionData na mesma ordem dos URLs fornecidos.
 * Se um áudio falhar, retorna CaptionData vazio para aquele índice.
 */
export async function transcribeMultipleAudios(
  audioUrls: string[],
  concurrency: number = 3
): Promise<CaptionData[]> {
  const results: CaptionData[] = new Array(audioUrls.length)
  const queue = audioUrls.map((url, index) => ({ url, index }))

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) break

      // Pular URLs vazias (slides sem áudio)
      if (!item.url || item.url.length === 0) {
        results[item.index] = { words: [], durationMs: 0 }
        continue
      }

      try {
        results[item.index] = await transcribeAudioForCaptions(item.url)
      } catch (error) {
        console.error(
          `   Falha ao transcrever áudio ${item.index + 1}: ${error instanceof Error ? error.message : String(error)}`
        )
        // Retornar dados vazios em caso de falha (legendas simplesmente não aparecem neste slide)
        results[item.index] = { words: [], durationMs: 0 }
      }
    }
  })

  await Promise.all(workers)
  return results
}
