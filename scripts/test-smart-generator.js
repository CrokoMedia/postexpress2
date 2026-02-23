/**
 * Teste do Smart Image Generator com fallback
 */

import 'dotenv/config'
import { generateImageSmart } from '../lib/smart-image-generator.ts'

async function test() {
  console.log('🧪 Testando Smart Image Generator (com fallback)...\n')

  console.log('📸 Teste: Gerar imagem (vai tentar Nano Banana → fal.ai)...')
  try {
    const prompt = 'Google Analytics dashboard interface screenshot, professional software interface, high quality'
    console.log(`   Prompt: "${prompt.substring(0, 80)}..."`)

    const imageUrl = await generateImageSmart(prompt)

    console.log(`\n✅ TESTE PASSOU!`)
    console.log(`   URL gerada: ${imageUrl}`)
    console.log(`\n🎉 Sistema de fallback funcionando corretamente!`)
  } catch (error) {
    console.error(`\n❌ TESTE FALHOU:`, error.message)
    console.error(`   Stack:`, error.stack)
    process.exit(1)
  }
}

test().catch(error => {
  console.error('\n💥 Erro fatal:', error)
  process.exit(1)
})
