/**
 * Teste do sistema contextual de geração de imagens
 * Verifica se detecta marcas, ferramentas e pessoas mencionadas
 */

import 'dotenv/config'
import { generateImageSmart } from '../lib/smart-image-generator.ts'
import { createContextualImagePrompt } from '../lib/contextual-image-prompt.ts'

async function testContextualImage() {
  console.log('🧪 Testando Sistema Contextual de Imagens\n')

  const tests = [
    {
      name: 'Teste 1: Marca específica (Nike)',
      slideContent: {
        titulo: '5 lições de marketing da Nike',
        corpo: 'Como a Nike dominou o mercado de esportivos',
        imagemPrompt: undefined,
      },
      carouselContext: {
        titulo: 'Estratégias de Marketing',
        objetivo: 'Educar sobre branding',
        tipo: 'educacional',
      },
    },
    {
      name: 'Teste 2: Ferramenta/Dashboard (Google Analytics)',
      slideContent: {
        titulo: 'Como ler seu dashboard do Google Analytics',
        corpo: 'Métricas essenciais para acompanhar',
        imagemPrompt: undefined,
      },
      carouselContext: {
        titulo: 'Analytics para Iniciantes',
        objetivo: 'Ensinar análise de dados',
        tipo: 'educacional',
      },
    },
    {
      name: 'Teste 3: Múltiplas marcas (Canva + Figma)',
      slideContent: {
        titulo: 'Canva vs Figma: qual escolher?',
        corpo: 'Comparação de ferramentas de design',
        imagemPrompt: undefined,
      },
      carouselContext: {
        titulo: 'Ferramentas de Design',
        objetivo: 'Comparar opções',
        tipo: 'educacional',
      },
    },
  ]

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`)
    console.log(`   Título: "${test.slideContent.titulo}"`)
    console.log(`   Corpo: "${test.slideContent.corpo}"`)

    // Gerar prompt contextual
    const smartPrompt = createContextualImagePrompt(
      test.slideContent,
      test.carouselContext,
      { nicho: 'Marketing Digital' }
    )

    console.log(`\n   🎨 Prompt Contextual Gerado:`)
    console.log(`   "${smartPrompt.substring(0, 200)}..."`)

    // Verificar se detectou marcas
    const hasBrand = /Nike|Google Analytics|Canva|Figma|dashboard|logo|brand/.test(smartPrompt)
    console.log(`   ${hasBrand ? '✅' : '❌'} ${hasBrand ? 'Detectou contexto de marca/ferramenta' : 'NÃO detectou marca'}`)

    // Gerar imagem (comentar se quiser só ver os prompts)
    // console.log(`\n   🚀 Gerando imagem...`)
    // try {
    //   const imageUrl = await generateImageSmart(smartPrompt)
    //   console.log(`   ✅ Imagem gerada: ${imageUrl}`)
    // } catch (error) {
    //   console.error(`   ❌ Erro: ${error.message}`)
    // }
  }

  console.log(`\n\n🎉 Testes de Detecção Contextual Completos!`)
  console.log(`\nPróximo passo: Descomente as linhas de geração de imagem para testar geração real.`)
}

testContextualImage().catch(error => {
  console.error('\n💥 Erro fatal:', error)
  process.exit(1)
})
