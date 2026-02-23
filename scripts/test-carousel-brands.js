/**
 * Teste End-to-End: Carrossel com Marcas Específicas
 * Gera imagens contextuais para slides que mencionam marcas conhecidas
 */

import 'dotenv/config'
import { generateImageSmart } from '../lib/smart-image-generator.ts'
import { createContextualImagePrompt } from '../lib/contextual-image-prompt.ts'

// Carrossel de teste: "5 Estratégias de Marketing das Marcas Gigantes"
const testCarousel = {
  titulo: '5 Estratégias de Marketing das Marcas Gigantes',
  objetivo: 'Educar sobre estratégias de branding',
  tipo: 'educacional',
  slides: [
    {
      numero: 1,
      titulo: '5 Estratégias de Marketing das Marcas Gigantes',
      corpo: 'Aprenda com quem domina o mercado',
      imagemPrompt: undefined,
    },
    {
      numero: 2,
      titulo: 'Nike: O Poder do Storytelling',
      corpo: 'Como a Nike cria conexão emocional com atletas do mundo todo',
      imagemPrompt: undefined,
    },
    {
      numero: 3,
      titulo: 'Google Analytics: Decisões Baseadas em Dados',
      corpo: 'Como ler seu dashboard e tomar decisões estratégicas',
      imagemPrompt: undefined,
    },
    {
      numero: 4,
      titulo: 'Canva vs Figma: Escolha a Ferramenta Certa',
      corpo: 'Comparação de interface e recursos das duas plataformas',
      imagemPrompt: undefined,
    },
    {
      numero: 5,
      titulo: 'Nubank: Disrupção no Mercado Financeiro',
      corpo: 'Como o Nubank revolucionou o banking brasileiro',
      imagemPrompt: undefined,
    },
    {
      numero: 6,
      titulo: 'Aplique Essas Estratégias Hoje',
      corpo: 'Escolha uma e comece agora mesmo',
      imagemPrompt: undefined,
    },
  ],
}

async function testCarouselWithBrands() {
  console.log('🧪 === TESTE DE CARROSSEL COM MARCAS ===\n')
  console.log(`📋 Carrossel: "${testCarousel.titulo}"`)
  console.log(`   Objetivo: ${testCarousel.objetivo}`)
  console.log(`   Total de slides: ${testCarousel.slides.length}\n`)

  const results = []

  for (const slide of testCarousel.slides) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📄 SLIDE ${slide.numero}: "${slide.titulo}"`)
    console.log(`   Corpo: "${slide.corpo}"`)

    // 1. Gerar prompt contextual
    const smartPrompt = createContextualImagePrompt(
      {
        titulo: slide.titulo,
        corpo: slide.corpo,
        imagemPrompt: slide.imagemPrompt,
      },
      {
        titulo: testCarousel.titulo,
        objetivo: testCarousel.objetivo,
        tipo: testCarousel.tipo,
      },
      {
        nicho: 'Marketing Digital e Branding',
      }
    )

    console.log(`\n   🎨 Prompt Contextual Gerado:`)
    console.log(`   "${smartPrompt}"`)

    // Detectar se tem marca/contexto
    const hasBrand = /Nike|Google|Canva|Figma|Nubank|dashboard|logo|brand|interface/.test(
      smartPrompt
    )
    const brandDetected = hasBrand ? '✅ MARCA/FERRAMENTA DETECTADA' : '⚠️  Prompt genérico'
    console.log(`\n   ${brandDetected}`)

    // 2. Gerar imagem (descomentar para gerar imagens reais)
    console.log(`\n   🚀 Gerando imagem com Gemini...`)
    try {
      const startTime = Date.now()
      const imageUrl = await generateImageSmart(smartPrompt)
      const duration = Date.now() - startTime

      console.log(`   ✅ Imagem gerada em ${duration}ms`)
      console.log(`   🔗 URL: ${imageUrl}`)

      results.push({
        slide: slide.numero,
        titulo: slide.titulo,
        brandDetected: hasBrand,
        prompt: smartPrompt.substring(0, 100) + '...',
        imageUrl,
        duration,
      })
    } catch (error) {
      console.error(`   ❌ ERRO ao gerar imagem: ${error.message}`)
      results.push({
        slide: slide.numero,
        titulo: slide.titulo,
        brandDetected: hasBrand,
        prompt: smartPrompt.substring(0, 100) + '...',
        error: error.message,
      })
    }

    // Pausa de 2s entre slides para não sobrecarregar a API
    console.log(`\n   ⏱️  Aguardando 2s antes do próximo slide...`)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Relatório final
  console.log(`\n\n${'='.repeat(80)}`)
  console.log(`📊 RELATÓRIO FINAL`)
  console.log(`${'='.repeat(80)}\n`)

  results.forEach(result => {
    console.log(`Slide ${result.slide}: ${result.titulo}`)
    console.log(`  ${result.brandDetected ? '✅' : '❌'} Marca detectada: ${result.brandDetected}`)
    if (result.imageUrl) {
      console.log(`  ✅ Imagem: ${result.imageUrl}`)
      console.log(`  ⏱️  Tempo: ${result.duration}ms`)
    } else if (result.error) {
      console.log(`  ❌ Erro: ${result.error}`)
    }
    console.log(`  📝 Prompt: ${result.prompt}`)
    console.log('')
  })

  const successCount = results.filter(r => r.imageUrl).length
  const brandDetectedCount = results.filter(r => r.brandDetected).length

  console.log(`\n📈 Estatísticas:`)
  console.log(`   Total de slides: ${results.length}`)
  console.log(`   Marcas detectadas: ${brandDetectedCount}/${results.length} (${Math.round((brandDetectedCount / results.length) * 100)}%)`)
  console.log(`   Imagens geradas: ${successCount}/${results.length} (${Math.round((successCount / results.length) * 100)}%)`)

  if (successCount === results.length) {
    console.log(`\n🎉 TESTE PASSOU! Todas as imagens foram geradas com sucesso!`)
  } else {
    console.log(`\n⚠️  Algumas imagens falharam. Verifique os erros acima.`)
  }

  console.log(`\n✅ URLs das imagens geradas:`)
  results
    .filter(r => r.imageUrl)
    .forEach(r => {
      console.log(`   Slide ${r.slide}: ${r.imageUrl}`)
    })
}

testCarouselWithBrands().catch(error => {
  console.error('\n💥 Erro fatal:', error)
  process.exit(1)
})
