/**
 * Teste do Google Gemini Image Generation (Nano Banana)
 * API Oficial: https://ai.google.dev/gemini-api/docs/image-generation
 */

import 'dotenv/config'
import { generateContentImage } from '../lib/gemini-image.ts'

async function test() {
  console.log('🧪 Testando Google Gemini Image Generation (Nano Banana)...\n')

  console.log('📸 Teste: Gerar imagem com Gemini...')
  try {
    const prompt = 'Google Analytics dashboard interface screenshot, modern clean design, professional software interface, high quality screenshot, realistic UI design'
    console.log(`   Prompt: "${prompt.substring(0, 80)}..."`)

    const imageDataUrl = await generateContentImage(prompt)

    console.log(`\n✅ TESTE PASSOU!`)
    console.log(`   Data URL length: ${imageDataUrl.length} chars`)
    console.log(`   Formato: ${imageDataUrl.substring(0, 30)}...`)
    console.log(`\n🎉 Google Gemini funcionando corretamente!`)
    console.log(`\n💡 A imagem foi gerada como base64 data URL`)
    console.log(`   Para testar visualmente, cole isso no navegador ou salve como arquivo`)
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
