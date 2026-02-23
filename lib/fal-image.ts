import { fal } from '@fal-ai/client'

// Configura credenciais via variável de ambiente
fal.config({
  credentials: process.env.FAL_KEY,
})

/**
 * Gera uma imagem de conteúdo via fal.ai (Flux)
 * @param prompt Descrição da imagem a gerar
 * @returns URL pública da imagem gerada
 */
export async function generateContentImage(prompt: string): Promise<string> {
  console.log(`🎨 fal.ai: Gerando imagem com Flux Dev...`)
  console.log(`   Prompt: "${prompt.substring(0, 200)}..."`)

  console.log(`   🎛️  Parâmetros: steps=50, guidance=7.5 (alta conformidade)`)

  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt,
      image_size: {
        width: 956,
        height: 448,
      },
      num_inference_steps: 50, // Máxima qualidade
      guidance_scale: 7.5, // AUMENTADO para forçar seguir o prompt (era 3.5)
      num_images: 1,
      enable_safety_checker: true,
      seed: Math.floor(Math.random() * 1000000),
    },
  })

  console.log(`   ✅ Imagem gerada com sucesso`)


  const output = result as any
  const images = output?.images || output?.data?.images

  if (!images || images.length === 0) {
    throw new Error('fal.ai não retornou imagens')
  }

  const imageUrl = images[0]?.url || images[0]
  if (!imageUrl) {
    throw new Error('fal.ai retornou imagem sem URL')
  }

  return imageUrl
}

/**
 * Gera imagem de fundo full-bleed para templates editoriais (1080x1350px)
 * @param prompt Descrição da cena/imagem
 * @returns URL pública da imagem gerada
 */
export async function generateEditorialBackground(prompt: string): Promise<string> {
  console.log(`🎬 fal.ai: Gerando background editorial...`)

  // Editorial já vem enhanced, não precisa adicionar mais
  const editorialPrompt = prompt

  console.log(`   Prompt: "${editorialPrompt.substring(0, 200)}..."`)

  console.log(`   🎛️  Parâmetros: steps=50, guidance=7.5 (alta conformidade)`)

  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt: editorialPrompt,
      image_size: {
        width: 1080,
        height: 1350,
      },
      num_inference_steps: 50, // Máxima qualidade
      guidance_scale: 7.5, // AUMENTADO para forçar seguir o prompt
      num_images: 1,
      enable_safety_checker: true,
      seed: Math.floor(Math.random() * 1000000),
    },
  })

  console.log(`   ✅ Background editorial gerado`)


  const output = result as any
  const images = output?.images || output?.data?.images

  if (!images || images.length === 0) {
    throw new Error('fal.ai não retornou imagens para background editorial')
  }

  const imageUrl = images[0]?.url || images[0]
  if (!imageUrl) {
    throw new Error('fal.ai retornou background editorial sem URL')
  }

  return imageUrl
}

/**
 * Gera imagem editorial usando múltiplas imagens de referência (FLUX.2 edit)
 * Referencia imagens no prompt com @image1, @image2, etc.
 * @param prompt Descrição de como combinar/usar as imagens (pode usar @image1, @image2...)
 * @param referenceImageUrls Array de URLs das imagens de referência (máx 4)
 * @returns URL pública da imagem gerada
 */
export async function generateEditorialBackgroundWithReference(
  prompt: string,
  referenceImageUrls: string[]
): Promise<string> {
  const editorialPrompt = [
    prompt,
    'cinematic photography, editorial magazine cover style, dramatic lighting',
    'dark moody atmosphere, professional photojournalism, high contrast',
    'no text visible, no letters, no words, no typography in the image',
    'no watermarks, no borders, no frames',
  ].join(', ')

  const result = await fal.run('fal-ai/flux-2/edit', {
    input: {
      image_urls: referenceImageUrls.slice(0, 4),
      prompt: editorialPrompt,
      image_size: {
        width: 1080,
        height: 1350,
      },
      num_inference_steps: 28,
      guidance_scale: 2.5,
      num_images: 1,
    },
  })

  const output = result as any
  const images = output?.images || output?.data?.images

  if (!images || images.length === 0) {
    throw new Error('fal.ai não retornou imagens (multi-reference)')
  }

  const imageUrl = images[0]?.url || images[0]
  if (!imageUrl) {
    throw new Error('fal.ai retornou imagem sem URL (multi-reference)')
  }

  return imageUrl
}
