#!/usr/bin/env node

/**
 * Teste do sistema de ZIP
 */

import { ImageGenerator, FORMATS, STYLES } from './index.js';

const testCarousel = {
  id: 'test-zip-carousel',
  slides: [
    {
      title: 'TESTE ZIP',
      subtitle: 'Sistema de Download',
      text: 'Testando criação automática\nde arquivos ZIP',
      background: 'gradient-prosperidade',
      accentColor: '#FFD23F',
    },
    {
      title: 'SLIDE 2',
      text: 'Segundo slide\ndo carrossel de teste',
      background: 'gradient-transicao',
      accentColor: '#3498DB',
    },
  ]
};

async function testZip() {
  console.log('🧪 TESTE DO SISTEMA DE ZIP\n');
  console.log('=' .repeat(60));

  const generator = new ImageGenerator();

  try {
    // Gerar carrossel COM ZIPs
    const result = await generator.generateCarousel(testCarousel, {
      formats: [FORMATS.POST, FORMATS.STORIES],
      styles: [STYLES.FIGMA, STYLES.GRADIENT],
      createZip: true // Ativar criação de ZIPs
    });

    console.log('\n✅ TESTE CONCLUÍDO!');
    console.log('\n📊 Resultado:');
    console.log(`   • Imagens geradas: ${result.totalImages}`);
    console.log(`   • ZIP Completo: ${result.downloads?.completo?.size || 'N/A'}`);
    console.log(`   • ZIPs Individuais: ${result.downloads?.individuais?.length || 0}`);

    if (result.downloads?.individuais) {
      console.log('\n📦 Downloads disponíveis:');
      result.downloads.individuais.forEach(zip => {
        console.log(`   • ${zip.format}: ${zip.size} (${zip.files} arquivos)`);
      });
    }

    console.log(`\n📂 Localização: ${result.outputDir}`);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testZip();
