#!/usr/bin/env node

/**
 * 🎨 DEMO - Image Generator Engine
 *
 * Demonstra como usar o Image Generator com o conteúdo
 * "Inveja e Prosperidade" do Content Creation Squad
 */

import { ImageGenerator, FORMATS, STYLES } from './index.js';

// Conteúdo dos 7 Stories "Inveja e Prosperidade"
const CAROUSEL_INVEJA = {
  id: 'inveja-prosperidade-demo',
  title: 'Inveja e Prosperidade - 7 Stories',
  slides: [
    {
      title: 'INVEJA',
      subtitle: 'E PROSPERIDADE',
      text: 'O que você precisa saber',
      background: 'gradient-escuro',
      accentColor: '#E74C3C',
    },
    {
      title: 'ELES NORMALIZAM',
      text: 'a sua inveja.\n\nFazem você acreditar\nque é natural.',
      background: 'gradient-escuro',
      accentColor: '#3498DB',
    },
    {
      title: 'O PROBLEMA',
      text: 'Inveja bloqueia\nsua prosperidade.\n\nEnquanto você foca\nno que o outro tem,\nnão constrói o SEU.',
      background: 'gradient-escuro',
      accentColor: '#E74C3C',
    },
    {
      title: 'REFRAME',
      subtitle: '⭐ MOMENTO CHAVE',
      text: 'Transforme inveja\nem INSPIRAÇÃO.\n\n"Se ele conseguiu,\neu também consigo"',
      background: 'gradient-transicao',
      accentColor: '#FFD23F',
    },
    {
      title: 'O MÉTODO',
      text: '1. Reconheça a inveja\n2. Agradeça o exemplo\n3. Trace SEU caminho\n4. Foque na SUA jornada',
      background: 'gradient-prosperidade',
      accentColor: '#2ECC71',
    },
    {
      title: 'EXEMPLO',
      text: 'Pessoa próspera vê\nalguém bem-sucedido:\n\n"Que inspirador!\nVou aprender com ele"',
      background: 'gradient-prosperidade',
      accentColor: '#2ECC71',
    },
    {
      title: 'COMECE HOJE',
      text: 'Inveja → Inspiração\nComparação → Criação\nRessentimento → Realização',
      cta: 'SALVE ESTE POST',
      background: 'gradient-prosperidade',
      accentColor: '#FFD23F',
    },
  ]
};

async function runDemo() {
  console.log('🚀 POST EXPRESS - IMAGE GENERATOR DEMO\n');
  console.log('=' .repeat(60));

  const generator = new ImageGenerator({
    concurrency: 6 // Gerar 6 imagens simultaneamente
  });

  try {
    // DEMO 1: Gerar apenas formato POST com estilo FIGMA
    console.log('\n📝 DEMO 1: Post (1080x1350) - Estilo Figma\n');
    const result1 = await generator.generateCarousel(
      {
        id: 'demo-1-post-figma',
        slides: CAROUSEL_INVEJA.slides
      },
      {
        formats: [FORMATS.POST],
        styles: [STYLES.FIGMA]
      }
    );
    console.log(`✅ ${result1.totalImages} imagens geradas`);

    // DEMO 2: Gerar apenas formato STORIES com estilo GRADIENT
    console.log('\n📝 DEMO 2: Stories (1080x1920) - Estilo Gradiente\n');
    const result2 = await generator.generateCarousel(
      {
        id: 'demo-2-stories-gradient',
        slides: CAROUSEL_INVEJA.slides
      },
      {
        formats: [FORMATS.STORIES],
        styles: [STYLES.GRADIENT]
      }
    );
    console.log(`✅ ${result2.totalImages} imagens geradas`);

    // DEMO 3: Gerar TODAS as variações (Post + Stories) × (Figma + Gradient)
    console.log('\n📝 DEMO 3: TODAS as variações (4 estilos × 7 slides = 28 imagens)\n');
    const result3 = await generator.generateCarousel(CAROUSEL_INVEJA);
    console.log(`✅ ${result3.totalImages} imagens geradas`);

    // DEMO 4: Gerar apenas uma imagem
    console.log('\n📝 DEMO 4: Gerar slide único\n');
    const singleResult = await generator.generateSingle(
      {
        title: 'TESTE',
        subtitle: 'Slide único',
        text: 'Esta é uma imagem de teste\ngerada individualmente',
        background: 'gradient-prosperidade',
        accentColor: '#FFD23F',
      },
      {
        format: FORMATS.POST,
        style: STYLES.GRADIENT
      }
    );
    console.log(`✅ Imagem salva em: ${singleResult.path}`);

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 DEMO CONCLUÍDO COM SUCESSO!\n');

    console.log('📂 Arquivos gerados em:');
    console.log(`   • Demo 1: output/demo-1-post-figma/`);
    console.log(`   • Demo 2: output/demo-2-stories-gradient/`);
    console.log(`   • Demo 3: output/${CAROUSEL_INVEJA.id}/`);
    console.log(`   • Demo 4: output/single.png\n`);

    console.log('💡 Próximos passos:');
    console.log('   1. Verificar as imagens geradas');
    console.log('   2. Integrar com Content Creation Squad');
    console.log('   3. Adicionar sistema de ZIP para download\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar demo
runDemo();
