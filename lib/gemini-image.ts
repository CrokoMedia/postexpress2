/**
 * Google Gemini Image Generation (Nano Banana)
 * API Oficial: https://ai.google.dev/gemini-api/docs/image-generation
 *
 * Modelos:
 * - gemini-2.5-flash-image (Nano Banana) - Rápido, eficiente
 * - gemini-3-pro-image-preview (Nano Banana Pro) - Qualidade profissional
 */

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// Modelo padrão (Nano Banana = rápido e barato)
const DEFAULT_MODEL = 'gemini-2.5-flash-image'

// Mapeamento de aspect ratios
const ASPECT_RATIO_MAP: Record<string, string> = {
  'feed': '3:4',      // Instagram Feed (1080x1350)
  'story': '9:16',    // Instagram Story (1080x1920)
  'square': '1:1',    // Quadrado (1080x1080)
  '16:9': '16:9',     // Horizontal
  '4:3': '4:3',
  '3:2': '3:2',
}

interface GenerateImageRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
  generationConfig: {
    responseModalities: string[]
    imageConfig?: {
      aspectRatio?: string
      imageSize?: string
    }
  }
}

interface GenerateImageResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string
        inlineData?: {
          mimeType: string
          data: string // base64
        }
      }>
    }
  }>
}

/**
 * Gera uma imagem usando Google Gemini (Nano Banana)
 * @param prompt Descrição da imagem (incluir marcas, logos, pessoas)
 * @param aspectRatio Aspect ratio desejado (feed, story, square, ou formato direto)
 * @param imageSize Resolução: "1K" (padrão), "2K", "4K"
 * @returns URL data: base64 da imagem gerada
 */
export async function generateImageWithGemini(
  prompt: string,
  aspectRatio: string = 'feed',
  imageSize: '1K' | '2K' | '4K' = '1K'
): Promise<string> {
  console.log(`\n🎨 === GOOGLE GEMINI (Nano Banana) ===`)
  console.log(`   API Key presente: ${!!GOOGLE_AI_API_KEY}`)
  console.log(`   API Key (primeiros 20 chars): ${GOOGLE_AI_API_KEY?.substring(0, 20)}...`)
  console.log(`   Modelo: ${DEFAULT_MODEL}`)
  console.log(`   Aspect Ratio: ${aspectRatio} → ${ASPECT_RATIO_MAP[aspectRatio] || aspectRatio}`)
  console.log(`   Image Size: ${imageSize}`)
  console.log(`   Prompt: "${prompt.substring(0, 150)}..."`)

  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY não configurada')
  }

  // Mapear aspect ratio
  const finalAspectRatio = ASPECT_RATIO_MAP[aspectRatio] || aspectRatio

  try {
    // Montar request no formato oficial do Gemini
    const requestBody: GenerateImageRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: finalAspectRatio,
          imageSize: imageSize
        }
      }
    }

    const endpoint = `${BASE_URL}/models/${DEFAULT_MODEL}:generateContent`

    console.log(`   📤 Enviando request para Google Gemini...`)
    console.log(`   Endpoint: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GOOGLE_AI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log(`   📥 Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   ❌ Gemini error (${response.status}):`, errorText.substring(0, 500))
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
    }

    const data: GenerateImageResponse = await response.json()

    // Extrair imagem do response
    const candidate = data.candidates?.[0]
    if (!candidate) {
      throw new Error('Nenhum candidate retornado pela API')
    }

    // Procurar parte com imagem (inlineData)
    const imagePart = candidate.content.parts.find(part => part.inlineData)

    if (!imagePart?.inlineData) {
      console.error(`   ❌ Response sem imagem:`, JSON.stringify(data, null, 2))
      throw new Error('Response não contém imagem')
    }

    // Retornar como data URL (base64)
    const mimeType = imagePart.inlineData.mimeType
    const base64Data = imagePart.inlineData.data
    const dataUrl = `data:${mimeType};base64,${base64Data}`

    console.log(`   ✅ Imagem gerada com sucesso!`)
    console.log(`   Mime Type: ${mimeType}`)
    console.log(`   Tamanho base64: ${base64Data.length} chars`)
    console.log(`🎨 === END ===\n`)

    return dataUrl

  } catch (error: any) {
    console.error(`\n❌ === GEMINI ERROR ===`)
    console.error('Erro ao gerar imagem com Google Gemini:', error)
    console.error('Stack:', error.stack)
    console.error(`❌ === GEMINI ERROR END ===\n`)
    throw new Error(`Gemini error: ${error.message}`)
  }
}

/**
 * Gera imagem de conteúdo (menor, para templates padrão)
 */
export async function generateContentImage(prompt: string): Promise<string> {
  return generateImageWithGemini(prompt, 'feed', '1K')
}

/**
 * Gera imagem editorial full-bleed (background)
 */
export async function generateEditorialBackground(prompt: string): Promise<string> {
  return generateImageWithGemini(prompt, 'feed', '2K')
}
