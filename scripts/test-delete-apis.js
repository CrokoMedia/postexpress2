/**
 * Script de Teste para APIs DELETE
 *
 * Testa as 3 APIs DELETE criadas na Fase 1:
 * - DELETE /api/content/[id]/carousels/[carouselIndex]
 * - DELETE /api/content/[id]/slides/[carouselIndex]
 * - DELETE /api/content/[id]/reels/[reelIndex]
 *
 * USO:
 * 1. Iniciar servidor: npm run dev
 * 2. Executar: node scripts/test-delete-apis.js
 *
 * PRÉ-REQUISITOS:
 * - Ter uma auditoria com conteúdo gerado (carrosséis, slides, reels)
 * - Substituir AUDIT_ID abaixo pelo ID real
 */

const BASE_URL = 'http://localhost:3000'

// ALTERAR PARA UM AUDIT_ID VÁLIDO DO SEU BANCO
const AUDIT_ID = 'COLE_AUDIT_ID_AQUI'

async function testDeleteCarousel() {
  console.log('\n🧪 Testando DELETE Carrossel...')

  try {
    const carouselIndex = 0 // Testa deletar o primeiro carrossel

    const response = await fetch(
      `${BASE_URL}/api/content/${AUDIT_ID}/carousels/${carouselIndex}`,
      { method: 'DELETE' }
    )

    const data = await response.json()

    if (response.ok) {
      console.log('✅ DELETE Carrossel OK:', data)
    } else {
      console.log('❌ DELETE Carrossel FALHOU:', data)
    }

    return response.ok
  } catch (error) {
    console.error('❌ Erro ao testar DELETE Carrossel:', error.message)
    return false
  }
}

async function testDeleteSlides() {
  console.log('\n🧪 Testando DELETE Slides...')

  try {
    const carouselIndex = 0 // Testa deletar slides do primeiro carrossel

    const response = await fetch(
      `${BASE_URL}/api/content/${AUDIT_ID}/slides/${carouselIndex}`,
      { method: 'DELETE' }
    )

    const data = await response.json()

    if (response.ok) {
      console.log('✅ DELETE Slides OK:', data)
      console.log(`   📊 ${data.deletedImages} imagens deletadas`)
      console.log(`   ☁️  ${data.cloudinaryDeleted} deletadas do Cloudinary`)
    } else {
      console.log('❌ DELETE Slides FALHOU:', data)
    }

    return response.ok
  } catch (error) {
    console.error('❌ Erro ao testar DELETE Slides:', error.message)
    return false
  }
}

async function testDeleteReel() {
  console.log('\n🧪 Testando DELETE Reel...')

  try {
    const reelIndex = 0 // Testa deletar o primeiro reel

    const response = await fetch(
      `${BASE_URL}/api/content/${AUDIT_ID}/reels/${reelIndex}`,
      { method: 'DELETE' }
    )

    const data = await response.json()

    if (response.ok) {
      console.log('✅ DELETE Reel OK:', data)
      console.log(`   🎬 Vídeo: ${data.deletedTitle}`)
      console.log(`   ☁️  Cloudinary: ${data.cloudinaryDeleted}`)
    } else {
      console.log('❌ DELETE Reel FALHOU:', data)
    }

    return response.ok
  } catch (error) {
    console.error('❌ Erro ao testar DELETE Reel:', error.message)
    return false
  }
}

async function testInvalidIndex() {
  console.log('\n🧪 Testando índice inválido (deve retornar 404)...')

  try {
    const response = await fetch(
      `${BASE_URL}/api/content/${AUDIT_ID}/carousels/999`,
      { method: 'DELETE' }
    )

    const data = await response.json()

    if (response.status === 404) {
      console.log('✅ Validação de índice inválido OK:', data.error)
      return true
    } else {
      console.log('❌ Deveria retornar 404 mas retornou:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Erro ao testar índice inválido:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Iniciando Testes das APIs DELETE')
  console.log('=' .repeat(50))

  if (AUDIT_ID === 'COLE_AUDIT_ID_AQUI') {
    console.error('\n❌ ERRO: Defina um AUDIT_ID válido no script!')
    console.error('   Abra scripts/test-delete-apis.js e altere a linha 22')
    process.exit(1)
  }

  const results = {
    deleteCarousel: false,
    deleteSlides: false,
    deleteReel: false,
    invalidIndex: false
  }

  // Testa cada API
  results.deleteCarousel = await testDeleteCarousel()
  await new Promise(resolve => setTimeout(resolve, 1000)) // Aguarda 1s

  results.deleteSlides = await testDeleteSlides()
  await new Promise(resolve => setTimeout(resolve, 1000))

  results.deleteReel = await testDeleteReel()
  await new Promise(resolve => setTimeout(resolve, 1000))

  results.invalidIndex = await testInvalidIndex()

  // Resumo
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMO DOS TESTES')
  console.log('='.repeat(50))

  const total = Object.keys(results).length
  const passed = Object.values(results).filter(Boolean).length

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} ${test}: ${passed ? 'PASSOU' : 'FALHOU'}`)
  })

  console.log('\n' + '='.repeat(50))
  console.log(`Resultado: ${passed}/${total} testes passaram`)
  console.log('='.repeat(50))

  if (passed === total) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!')
    process.exit(0)
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM')
    process.exit(1)
  }
}

// Executar testes
runTests()
