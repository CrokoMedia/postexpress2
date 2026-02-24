/**
 * Script de teste do Nano Banana
 * Testa se a API está funcionando corretamente
 */

import 'dotenv/config'
import { generateContentImage } from '../lib/nano-banana.ts'

async function testNanoBanana() {
  console.log('🧪 Testando Nano Banana API...\n')

  // Verificar API key
  const apiKey = process.env.NANO_BANANA_API_KEY
  console.log(`✓ API Key presente: ${!!apiKey}`)
  console.log(`✓ API Key (primeiros 20 chars): ${apiKey?.substring(0, 20)}...\n`)

  if (!apiKey) {
    console.error('❌ NANO_BANANA_API_KEY não configurada no .env')
    process.exit(1)
  }

  // Teste 1: Imagem genérica
  console.log('📸 Teste 1: Imagem genérica...')
  try {
    const prompt = 'professional business meeting in modern office, clean composition, natural lighting'
    console.log(`   Prompt: "${prompt}"`)

    const imageUrl = await generateContentImage(prompt)

    console.log(`✅ Teste 1 PASSOU!`)
    console.log(`   URL gerada: ${imageUrl}\n`)
  } catch (error) {
    console.error(`❌ Teste 1 FALHOU:`, error.message)
    console.error(`   Stack:`, error.stack)
    process.exit(1)
  }

  console.log('\n🎉 TESTE PASSOU!')
  console.log('✅ Nano Banana está funcionando corretamente')
}

testNanoBanana().catch(error => {
  console.error('\n💥 Erro fatal:', error)
  process.exit(1)
})
