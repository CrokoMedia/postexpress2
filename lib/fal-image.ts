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
  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt,
      image_size: {
        width: 956,
        height: 448,
      },
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    },
  })

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
