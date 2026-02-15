#!/usr/bin/env node

/**
 * 🚀 POST EXPRESS - GERADOR DE IMAGENS COMPLETO
 *
 * Integração do Image Generator Engine com Content Creation Squad
 * Gera automaticamente todas as imagens dos carrosséis
 *
 * @author Post Express Team
 */

import { ImageGenerator, FORMATS, STYLES } from './engines/image-generator/index.js';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ============================================================================
// CONTEÚDO: Inveja e Prosperidade (exemplo do Content Creation Squad)
// ============================================================================

const CAROUSEL_INVEJA = {
  id: 'inveja-prosperidade',
  title: 'Inveja e Prosperidade - 7 Stories',
  author: 'Content Creation Squad',
  created: new Date().toISOString(),
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

// ============================================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================================

/**
 * Gera TODAS as variações (28 imagens + ZIPs)
 */
async function generateAll(carousel = CAROUSEL_INVEJA) {
  console.log('🎨 POST EXPRESS - GERADOR COMPLETO\n');
  console.log('=' .repeat(70));
  console.log(`\n📋 Carrossel: ${carousel.title}`);
  console.log(`📊 Slides: ${carousel.slides.length}`);
  console.log(`📦 Saída: 4 variações (Post + Stories) × (Figma + Gradient)\n`);

  const generator = new ImageGenerator({
    outputDir: join(__dirname, 'output'),
    concurrency: 6
  });

  const result = await generator.generateCarousel(carousel, {
    formats: [FORMATS.POST, FORMATS.STORIES],
    styles: [STYLES.FIGMA, STYLES.GRADIENT],
    createZip: true
  });

  printResult(result);
  return result;
}

/**
 * Gera apenas Posts estilo Figma (7 imagens + ZIP)
 */
async function generatePostsFigma(carousel = CAROUSEL_INVEJA) {
  console.log('🎨 Gerando: Posts (1080x1350) - Estilo Figma\n');

  const generator = new ImageGenerator({
    outputDir: join(__dirname, 'output')
  });

  const result = await generator.generateCarousel(
    { ...carousel, id: `${carousel.id}-posts-figma` },
    {
      formats: [FORMATS.POST],
      styles: [STYLES.FIGMA],
      createZip: true
    }
  );

  printResult(result);
  return result;
}

/**
 * Gera apenas Stories estilo Gradiente (7 imagens + ZIP)
 */
async function generateStoriesGradient(carousel = CAROUSEL_INVEJA) {
  console.log('🎨 Gerando: Stories (1080x1920) - Estilo Gradiente\n');

  const generator = new ImageGenerator({
    outputDir: join(__dirname, 'output')
  });

  const result = await generator.generateCarousel(
    { ...carousel, id: `${carousel.id}-stories-gradient` },
    {
      formats: [FORMATS.STORIES],
      styles: [STYLES.GRADIENT],
      createZip: true
    }
  );

  printResult(result);
  return result;
}

/**
 * Imprime resultado formatado
 */
function printResult(result) {
  console.log('\n' + '='.repeat(70));
  console.log('\n✅ GERAÇÃO CONCLUÍDA!\n');

  console.log('📊 Estatísticas:');
  console.log(`   • Imagens geradas: ${result.totalImages}`);
  console.log(`   • Tempo: ${result.generation.duration}s`);
  console.log(`   • Sucesso: ${result.generation.successful}`);
  if (result.generation.failed > 0) {
    console.log(`   • Falhas: ${result.generation.failed}`);
  }

  if (result.downloads) {
    console.log('\n📦 Downloads:');
    console.log(`   • ZIP Completo: ${result.downloads.completo.size}`);
    console.log(`   • Localização: ${result.downloads.completo.path}`);

    console.log('\n📦 ZIPs por formato:');
    result.downloads.individuais
      .filter(zip => zip.files > 0) // Ignorar ZIPs vazios
      .forEach(zip => {
        console.log(`   • ${zip.format}: ${zip.size} (${zip.files} imagens)`);
      });
  }

  console.log(`\n📂 Pasta de saída: ${result.outputDir}`);
  console.log(`📄 Manifest: ${result.outputDir}/manifest.json\n`);

  console.log('💡 Próximos passos:');
  console.log('   1. Verificar as imagens geradas');
  console.log('   2. Baixar os ZIPs para compartilhar');
  console.log('   3. Postar no Instagram/LinkedIn\n');
}

// ============================================================================
// CLI
// ============================================================================

const command = process.argv[2] || 'all';

async function main() {
  try {
    switch (command) {
      case 'all':
        await generateAll();
        break;

      case 'posts-figma':
        await generatePostsFigma();
        break;

      case 'stories-gradient':
        await generateStoriesGradient();
        break;

      case 'help':
        console.log('🎨 POST EXPRESS - GERADOR DE IMAGENS\n');
        console.log('Comandos disponíveis:\n');
        console.log('  npm run generate              # Gera TODAS as variações (28 imgs)');
        console.log('  npm run generate posts-figma  # Apenas Posts Figma (7 imgs)');
        console.log('  npm run generate stories-gradient  # Apenas Stories Gradiente (7 imgs)');
        console.log('  npm run generate help         # Mostra esta ajuda\n');
        break;

      default:
        console.error(`❌ Comando desconhecido: ${command}`);
        console.log('Use: npm run generate help\n');
        process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export para uso como módulo
export {
  generateAll,
  generatePostsFigma,
  generateStoriesGradient,
  CAROUSEL_INVEJA
};
