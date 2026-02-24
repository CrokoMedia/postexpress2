#!/usr/bin/env node

/**
 * 🎨 EXEMPLO: Template BrandsDecoded®
 *
 * Demonstra como usar o template BrandsDecoded (do Figma) com o Image Generator
 * Template criado manualmente baseado no design original do Figma
 *
 * @author Croko Labs Team
 */

import { ImageGenerator, FORMATS, STYLES } from './engines/image-generator/index.js';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ============================================================================
// CONTEÚDO: Thread Alex Hormozi (exemplo do template original)
// ============================================================================

const THREAD_ALEX_HORMOZI = {
  id: 'alex-hormozi-brands-decoded',
  title: 'Thread Alex Hormozi - BrandsDecoded Template',
  author: 'Croko Labs Team',
  created: new Date().toISOString(),
  slides: [
    {
      paragraphs: [
        'Um ex-dono de academia acaba de mudar a história da venda de infoprodutos...',
        'Há poucos dias atrás, Alex Hormozi vendeu 2,9 milhões de cópias do livro dele.',
        'Foram US$ 87,5 milhões em receita, um recorde mundial para um lançamento digital.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    {
      paragraphs: [
        'O detalhe é o preço: apenas 30 dólares. Como isso fez US$ 87,5 milhões?',
        'Simples: o livro foi só a porta de entrada. O verdadeiro negócio estava nos upsells.',
        'Era um funil disfarçado de presente: grátis para atrair, caro para monetizar.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    {
      paragraphs: [
        'Três camadas estruturaram a máquina. Primeiro, o livro. Depois, um curso online de US$ 1997.',
        'Esse último incluía playbooks exclusivos, acesso vitalício e comunidade privada.',
        'E ainda havia um quarto nível: consultoria de 18 meses por US$ 120 mil anuais.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    {
      paragraphs: [
        'Com algumas centenas de clientes nesse nível, ele faturou milhões antes mesmo do launch terminar.',
        'Mas só produto não explica a escala....',
        'Hormozi montou um exército de 23 mil afiliados. Cada um recebeu 40% de comissão.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    {
      paragraphs: [
        'Para isso, ele entregou kit completo: e-mails prontos, posts para redes sociais, scripts de venda.',
        'O resultado: zero gasto publicitário direto e milhares de vendedores trabalhando simultaneamente.',
        'Enquanto isso, a live principal virou show. Dez horas no ar. Foram 700 mil espectadores ao vivo.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    {
      paragraphs: [
        'Ele usou gatilhos emocionais pesados: escassez (bônus desaparecem), prova social (contador de vendas ao vivo).',
        'E autoridade: depoimentos de clientes faturando milhões com os métodos dele.',
        'O lance de US$ 87,5 milhões não foi sorte. Foi arquitetura.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    {
      paragraphs: [
        'Produto em camadas, rede de afiliados gigante, live épica e gatilhos cirúrgicos.',
        'Cada peça pensada para maximizar conversão e lifetime value.',
        'Isso é marketing de topo. Não improviso.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    },
    // Slide 8 - CTA (fundo preto)
    {
      paragraphs: [
        'Quer aprender mais sobre estratégias de marketing de alto impacto?',
        'Salve este post e compartilhe com alguém que precisa ver isso.',
        'Nos siga para mais insights sobre negócios e marketing digital.'
      ],
      author: {
        name: 'Seu Nome',
        handle: '@seuinstagram'
      }
    }
  ]
};

// ============================================================================
// FUNÇÕES DE GERAÇÃO
// ============================================================================

/**
 * Gera carrossel completo com template BrandsDecoded
 */
async function generateBrandsDecoded() {
  console.log('🎨 TEMPLATE BRANDSDECODED - EXAMPLE\n');
  console.log('=' .repeat(70));
  console.log(`\n📋 Carrossel: ${THREAD_ALEX_HORMOZI.title}`);
  console.log(`📊 Slides: ${THREAD_ALEX_HORMOZI.slides.length}`);
  console.log(`🎨 Template: BrandsDecoded® (do Figma)\n`);
  console.log(`📦 Saída: 8 imagens (7 brancas + 1 preta)\n`);

  const generator = new ImageGenerator({
    outputDir: join(__dirname, 'output'),
    concurrency: 4
  });

  // Separar slides 1-7 (branco) e slide 8 (preto)
  const whiteSlides = THREAD_ALEX_HORMOZI.slides.slice(0, 7);
  const blackSlide = THREAD_ALEX_HORMOZI.slides.slice(7);

  console.log('📝 Gerando slides 1-7 (template branco)...');
  const resultWhite = await generator.generateCarousel(
    {
      ...THREAD_ALEX_HORMOZI,
      id: `${THREAD_ALEX_HORMOZI.id}-white`,
      slides: whiteSlides
    },
    {
      formats: [FORMATS.POST],
      styles: [STYLES.BRANDS_DECODED_WHITE],
      createZip: false
    }
  );

  console.log('\n📝 Gerando slide 8 (template preto - CTA)...');
  const resultBlack = await generator.generateCarousel(
    {
      ...THREAD_ALEX_HORMOZI,
      id: `${THREAD_ALEX_HORMOZI.id}-black`,
      slides: blackSlide
    },
    {
      formats: [FORMATS.POST],
      styles: [STYLES.BRANDS_DECODED_BLACK],
      createZip: false
    }
  );

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ GERAÇÃO CONCLUÍDA!\n');
  console.log('📊 Estatísticas:');
  console.log(`   • Slides brancos: ${resultWhite.totalImages}`);
  console.log(`   • Slides pretos: ${resultBlack.totalImages}`);
  console.log(`   • Total: ${resultWhite.totalImages + resultBlack.totalImages} imagens`);
  console.log();
  console.log(`📂 Pasta de saída (branco): ${resultWhite.outputDir}`);
  console.log(`📂 Pasta de saída (preto): ${resultBlack.outputDir}`);
  console.log();
  console.log('💡 Próximos passos:');
  console.log('   1. Verificar as imagens geradas');
  console.log('   2. Comparar com template original do Figma');
  console.log('   3. Ajustar CSS se necessário');
  console.log('   4. Usar com Content Squad!\n');
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  try {
    await generateBrandsDecoded();
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
export { generateBrandsDecoded, THREAD_ALEX_HORMOZI };
