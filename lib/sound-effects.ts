import cloudinary from 'cloudinary'

// ─── Tipos ────────────────────────────────────────────────────────────────

export interface SoundEffect {
  id: string
  name: string
  audioUrl: string  // URL no Cloudinary (cacheado)
}

export interface SoundEffectUrls {
  whoosh?: string
  pop?: string
  swoosh?: string
}

// ─── Definições dos efeitos sonoros ───────────────────────────────────────

interface SoundEffectDefinition {
  id: string
  name: string
  prompt: string
  durationSeconds: number
  cloudinaryPublicId: string
}

const SOUND_EFFECT_DEFINITIONS: SoundEffectDefinition[] = [
  {
    id: 'transition-whoosh',
    name: 'Transition Whoosh',
    prompt: 'smooth cinematic whoosh transition',
    durationSeconds: 1,
    cloudinaryPublicId: 'transition-whoosh',
  },
  {
    id: 'pop-highlight',
    name: 'Pop Highlight',
    prompt: 'short satisfying pop notification UI sound',
    durationSeconds: 0.5,
    cloudinaryPublicId: 'pop-highlight',
  },
  {
    id: 'swoosh-enter',
    name: 'Swoosh Enter',
    prompt: 'quick swoosh text entrance animation',
    durationSeconds: 0.8,
    cloudinaryPublicId: 'swoosh-enter',
  },
]

// ─── Cloudinary helpers ──────────────────────────────────────────────────

function ensureCloudinaryConfig(): void {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

/**
 * Verifica se um efeito sonoro já existe no Cloudinary.
 * Retorna a URL segura se existir, null caso contrário.
 */
async function checkCloudinaryCache(
  publicId: string
): Promise<string | null> {
  ensureCloudinaryConfig()

  const fullPublicId = `postexpress/sfx/${publicId}`

  try {
    const result = await cloudinary.v2.api.resource(fullPublicId, {
      resource_type: 'video', // Cloudinary trata áudio como video
    })
    return result.secure_url || null
  } catch {
    // Recurso não encontrado — não está em cache
    return null
  }
}

/**
 * Faz upload de um buffer de áudio para o Cloudinary na pasta postexpress/sfx/.
 */
async function uploadSoundEffectToCloudinary(
  audioBuffer: Buffer,
  publicId: string
): Promise<string> {
  ensureCloudinaryConfig()

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'postexpress/sfx',
        public_id: publicId,
        resource_type: 'video', // Cloudinary trata áudio como video
        overwrite: true,
        format: 'mp3',
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Upload Cloudinary SFX falhou: ${error.message}`))
          return
        }
        if (!result) {
          reject(new Error('Upload Cloudinary SFX não retornou resultado'))
          return
        }
        resolve(result.secure_url)
      }
    )

    uploadStream.end(audioBuffer)
  })
}

// ─── ElevenLabs Sound Generation API ─────────────────────────────────────

/**
 * Gera um efeito sonoro via ElevenLabs Sound Generation API.
 * Retry com backoff exponencial (3 tentativas).
 */
async function generateSoundEffect(
  prompt: string,
  durationSeconds: number
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY não configurada para gerar sound effects')
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        'https://api.elevenlabs.io/v1/sound-generation',
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: prompt,
            duration_seconds: durationSeconds,
            prompt_influence: 0.3,
          }),
        }
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(
          `ElevenLabs Sound Generation API erro ${response.status}: ${errorBody}`
        )
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `Sound effect tentativa ${attempt}/${maxRetries} falhou: ${lastError.message}`
      )

      if (attempt < maxRetries) {
        // Backoff exponencial: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(
    `Falha ao gerar sound effect após ${maxRetries} tentativas: ${lastError?.message}`
  )
}

// ─── Função principal ────────────────────────────────────────────────────

/**
 * Obtém ou cria os 3 efeitos sonoros padrão.
 * Verifica cache no Cloudinary antes de gerar novamente.
 * Retorna as URLs dos efeitos em formato { whoosh, pop, swoosh }.
 *
 * O parâmetro auditId é usado apenas para logging contextual.
 */
export async function getOrCreateSoundEffects(
  auditId: string
): Promise<SoundEffectUrls> {
  console.log(`   Verificando sound effects para audit ${auditId}...`)

  const results: SoundEffect[] = []

  for (const definition of SOUND_EFFECT_DEFINITIONS) {
    // Verificar cache no Cloudinary
    const cachedUrl = await checkCloudinaryCache(definition.cloudinaryPublicId)

    if (cachedUrl) {
      console.log(`   SFX "${definition.name}" encontrado no cache`)
      results.push({
        id: definition.id,
        name: definition.name,
        audioUrl: cachedUrl,
      })
      continue
    }

    // Gerar via ElevenLabs
    console.log(
      `   Gerando SFX "${definition.name}" via ElevenLabs (${definition.durationSeconds}s)...`
    )

    try {
      const audioBuffer = await generateSoundEffect(
        definition.prompt,
        definition.durationSeconds
      )

      // Upload para Cloudinary
      const url = await uploadSoundEffectToCloudinary(
        audioBuffer,
        definition.cloudinaryPublicId
      )

      console.log(`   SFX "${definition.name}" gerado e cacheado: ${url}`)

      results.push({
        id: definition.id,
        name: definition.name,
        audioUrl: url,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`   SFX "${definition.name}" falhou: ${message}`)
      // Continuar sem este efeito (não é bloqueante)
    }
  }

  // Mapear para o formato esperado pelas composições Remotion
  const whoosh = results.find((r) => r.id === 'transition-whoosh')
  const pop = results.find((r) => r.id === 'pop-highlight')
  const swoosh = results.find((r) => r.id === 'swoosh-enter')

  const urls: SoundEffectUrls = {
    whoosh: whoosh?.audioUrl,
    pop: pop?.audioUrl,
    swoosh: swoosh?.audioUrl,
  }

  const availableCount = Object.values(urls).filter(Boolean).length
  console.log(`   Sound effects prontos: ${availableCount}/3 disponíveis`)

  return urls
}
