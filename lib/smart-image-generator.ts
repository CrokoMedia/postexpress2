/**
 * Smart Image Generator com fallback automático
 * Tenta múltiplas APIs em ordem de preferência
 */

import { generateContentImage as generateWithNanoBanana } from './nano-banana.ts'
import { generateContentImage as generateWithFal } from './fal-image.ts'

/**
 * Gera imagem tentando múltiplas APIs em ordem de preferência
 * 1. Nano Banana API (nanobananaapi.ai) - imagens contextuais de alta qualidade
 * 2. fal.ai - gera imagens sintéticas (fallback se Nano Banana falhar)
 */
export async function generateImageSmart(prompt: string): Promise<string> {
  console.log(`\n🎨 === SMART IMAGE GENERATOR ===`)
  console.log(`   Prompt: "${prompt.substring(0, 100)}..."`)

  // Tentativa 1: Nano Banana API (preferencial) - busca imagens reais da internet
  if (process.env.NANO_BANANA_API_KEY) {
    console.log(`\n🍌 Tentativa 1: Nano Banana API (imagens contextuais)...`)
    try {
      const imageUrl = await generateWithNanoBanana(prompt)
      console.log(`✅ Sucesso com Nano Banana!`)
      console.log(`🎨 === END ===\n`)
      return imageUrl
    } catch (error: any) {
      console.warn(`⚠️  Nano Banana falhou: ${error.message}`)
      console.log(`   Tentando próxima opção...`)
    }
  } else {
    console.log(`⏭️  NANO_BANANA_API_KEY não configurada, pulando...`)
  }

  // Tentativa 2: fal.ai (fallback - sempre funciona)
  console.log(`\n📸 Tentativa 2: fal.ai (imagens sintéticas)...`)
  try {
    const imageUrl = await generateWithFal(prompt)
    console.log(`✅ Sucesso com fal.ai!`)
    console.log(`🎨 === END ===\n`)
    return imageUrl
  } catch (error: any) {
    console.error(`❌ fal.ai falhou: ${error.message}`)
    throw new Error(`Todas as APIs de imagem falharam: ${error.message}`)
  }
}

/**
 * Gera imagem editorial (background full-bleed)
 */
export async function generateEditorialBackgroundSmart(prompt: string): Promise<string> {
  // Usa o mesmo fluxo (Nano Banana → fal.ai fallback)
  return generateImageSmart(prompt)
}
