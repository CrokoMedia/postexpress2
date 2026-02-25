/**
 * Gera os 5 slides do carrossel de venda do Croko Labs
 * Usa Puppeteer para renderizar o HTML e salvar como PNG
 */

const puppeteer = require('./post-express-template/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, 'carrossel-venda-output');

async function gerarCarrossel() {
  console.log('🚀 Iniciando geração do carrossel de venda...');

  // Criar pasta de output
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();

  // Carregar o HTML
  const htmlPath = path.join(__dirname, 'carrossel-venda-croko.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle2', timeout: 30000 });

  // Aguardar fontes carregarem
  await page.waitForTimeout(2000);

  // Seletores de cada slide
  const slides = [
    { selector: '.slide-1',       nome: 'slide-01-capa' },
    { selector: '.slide-content:nth-of-type(1)', nome: 'slide-02-diagnostico' },
    { selector: '.slide-content:nth-of-type(2)', nome: 'slide-03-problema' },
    { selector: '.slide-content:nth-of-type(3)', nome: 'slide-04-solucao' },
    { selector: '.slide-cta',     nome: 'slide-05-cta' },
  ];

  // Pegar todos os elementos .slide na ordem
  const slideElements = await page.$$('.slide');

  const slideNomes = [
    'slide-01-capa',
    'slide-02-diagnostico',
    'slide-03-problema',
    'slide-04-solucao',
    'slide-05-cta',
  ];

  for (let i = 0; i < slideElements.length; i++) {
    const el = slideElements[i];
    const nome = slideNomes[i];
    const outputPath = path.join(OUTPUT_DIR, `${nome}.png`);

    await el.screenshot({
      path: outputPath,
      type: 'png'
    });

    console.log(`  ✅ ${nome}.png gerado (1080x1350px)`);
  }

  await browser.close();

  console.log(`\n✨ Carrossel completo! ${slideElements.length} slides em: ${OUTPUT_DIR}`);
  console.log('\nArquivos gerados:');
  fs.readdirSync(OUTPUT_DIR).forEach(f => console.log(`  → ${f}`));
}

gerarCarrossel().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
