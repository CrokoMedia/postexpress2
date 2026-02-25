const { chromium } = require('./node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.join(__dirname, 'carrossel-venda-output');

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 900 });

  const htmlPath = path.join(__dirname, 'carrossel-venda-croko.html');
  await page.goto(`http://localhost:4501/carrossel-venda-croko.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const slides = await page.$$('.slide');
  const nomes = ['slide-01-capa', 'slide-02-diagnostico', 'slide-03-problema', 'slide-04-solucao', 'slide-05-cta'];

  for (let i = 0; i < slides.length; i++) {
    const out = path.join(OUTPUT_DIR, `${nomes[i]}.png`);
    await slides[i].screenshot({ path: out });
    console.log(`✅ ${nomes[i]}.png`);
  }

  await browser.close();
  console.log(`\n✨ Pronto! ${slides.length} slides em: ${OUTPUT_DIR}`);
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
