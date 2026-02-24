/**
 * Google Gemini Image Generation API Integration
 * Gemini 2.5 Flash Image (Nano Banana) - Geração de imagens contextuais
 * Docs: https://ai.google.dev/gemini-api/docs/image-generation
 */

const GEMINI_API_KEY = process.env.NANO_BANANA_API_KEY || process.env.GOOGLE_AI_API_KEY
const MODEL = 'gemini-2.5-flash-image' // Nano Banana
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// Mapeamento de aspect ratios
// Gemini suporta: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
const ASPECT_RATIO_MAP: Record<string, string> = {
  'feed': '3:4',      // Instagram Feed (1080x1350)
  'story': '9:16',    // Instagram Story (1080x1920)
  'square': '1:1',    // Quadrado (1080x1080)
  '16:9': '16:9',     // Horizontal
  '4:3': '4:3',
  '3:2': '3:2',
  '2:3': '2:3',
  '3:4': '3:4',
  '4:5': '4:5',
  '5:4': '5:4',
  '9:16': '9:16',
  '21:9': '21:9',
}

interface GeminiImageRequest {
  contents: {
    parts: {
      text: string
    }[]
  }[]
  generationConfig: {
    responseModalities: string[]
    imageConfig: {
      aspectRatio: string
      imageSize: string // 1K, 2K, 4K (uppercase K)
    }
  }
}

interface GeminiImageResponse {
  candidates: {
    content: {
      parts: {
        text?: string
        inlineData?: {
          mimeType: string
          data: string // Base64
        }
      }[]
    }
  }[]
}

/**
 * Converte base64 para data URL
 */
function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${base64}`
}

/**
 * Faz upload de base64 para Cloudinary e retorna URL pública
 */
async function uploadBase64ToCloudinary(base64: string, folder: string = 'gemini-generated'): Promise<string> {
  const cloudinary = (await import('cloudinary')).v2

  // Configurar Cloudinary (se não estiver configurado)
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  console.log(`   📤 Fazendo upload para Cloudinary (folder: ${folder})...`)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `data:image/png;base64,${base64}`,
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error(`   ❌ Erro no upload Cloudinary:`, error)
          reject(error)
        } else if (result) {
          console.log(`   ✅ Upload completo: ${result.secure_url}`)
          resolve(result.secure_url)
        } else {
          reject(new Error('Cloudinary upload failed: no result'))
        }
      }
    )
  })
}

/**
 * Gera uma imagem usando Google Gemini Image Generation API
 * @param prompt Descrição da imagem (incluir marcas, logos, pessoas)
 * @param aspectRatio Aspect ratio desejado (feed, story, square, ou formato direto como 16:9)
 * @param imageSize Resolução (1K, 2K, 4K - padrão 2K)
 * @returns URL pública da imagem (hospedada no Cloudinary)
 */
export async function generateImageWithNanoBanana(
  prompt: string,
  aspectRatio: string = 'feed',
  imageSize: string = '2K'
): Promise<string> {
  console.log(`\n🔵 === GEMINI IMAGE GENERATION START ===`)
  console.log(`   API Key presente: ${!!GEMINI_API_KEY}`)
  console.log(`   API Key (primeiros 20 chars): ${GEMINI_API_KEY?.substring(0, 20)}...`)
  console.log(`   Model: ${MODEL}`)

  if (!GEMINI_API_KEY) {
    throw new Error('NANO_BANANA_API_KEY ou GOOGLE_AI_API_KEY não configurada')
  }

  // Mapear aspect ratio
  const mappedRatio = ASPECT_RATIO_MAP[aspectRatio] || aspectRatio

  console.log(`🎨 Gemini: gerando imagem (${mappedRatio}, ${imageSize})...`)
  console.log(`   Prompt completo: "${prompt}"`)
  console.log(`   Endpoint: ${ENDPOINT}`)

  try {
    // Criar request body
    const requestBody: GeminiImageRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'], // Só queremos imagem
        imageConfig: {
          aspectRatio: mappedRatio,
          imageSize: imageSize, // 1K, 2K, 4K
        },
      },
    }

    console.log(`   📤 Enviando request para Gemini...`)
    console.log(`   Request body:`, JSON.stringify(requestBody, null, 2))

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    console.log(`   📥 Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Gemini error (${response.status}):`, errorText.substring(0, 500))
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
    }

    const data: GeminiImageResponse = await response.json()

    // Extrair imagem da resposta
    const parts = data.candidates?.[0]?.content?.parts
    if (!parts || parts.length === 0) {
      console.error(`   ❌ Nenhum candidate ou parts encontrado`)
      console.error(`   Candidates:`, data.candidates)
      throw new Error('No image returned from Gemini')
    }

    // Encontrar a parte que contém a imagem
    const imagePart = parts.find(part => part.inlineData)
    if (!imagePart?.inlineData?.data) {
      console.error(`   ❌ Parts sem inlineData:`, parts)
      throw new Error('No inlineData found in response')
    }

    const base64Image = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType

    console.log(`✅ Imagem recebida do Gemini (${mimeType}, ${base64Image.length} chars)`)

    // Upload para Cloudinary
    const publicUrl = await uploadBase64ToCloudinary(base64Image, 'gemini-generated')

    console.log(`✅ Imagem hospedada no Cloudinary!`)
    console.log(`   URL: ${publicUrl}`)
    console.log(`🔵 === GEMINI IMAGE GENERATION END ===\n`)

    return publicUrl

  } catch (error: any) {
    console.error(`\n❌ === GEMINI IMAGE GENERATION ERROR ===`)
    console.error('Erro ao gerar imagem com Gemini:', error)
    console.error('Stack:', error.stack)
    console.error(`❌ === GEMINI IMAGE GENERATION ERROR END ===\n`)
    throw new Error(`Gemini Image Generation error: ${error.message}`)
  }
}

/**
 * Gera imagem de conteúdo (menor, para templates padrão)
 * Substitui generateContentImage() do fal.ai
 */
export async function generateContentImage(prompt: string): Promise<string> {
  return generateImageWithNanoBanana(prompt, 'feed', '2K')
}

/**
 * Gera imagem editorial full-bleed (background)
 * Substitui generateEditorialBackground() do fal.ai
 */
export async function generateEditorialBackground(prompt: string): Promise<string> {
  return generateImageWithNanoBanana(prompt, 'feed', '2K')
}
