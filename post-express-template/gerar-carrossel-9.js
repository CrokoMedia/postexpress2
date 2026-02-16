/**
 * Gerar Carrossel #9 - IA Elimina Categoria
 * 5 slides com template Safe Area
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ler template Safe Area
const templatePath = path.join(__dirname, 'template-safe-area.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

// Ler carrossel #9
const carrosselPath = path.join(__dirname, '../squad-auditores/output-enxutos/carrossel_9_enxuto.json');
const carrossel = JSON.parse(fs.readFileSync(carrosselPath, 'utf-8'));

function renderTemplate(data) {
  const { nome, username, fotoUrl, texto } = data;
  let html = templateHTML;
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  html = html.replace(/\{\{TEXTO\}\}/g, texto);
  return html;
}

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

async function gerarCarrossel9() {
  const outputDir = path.join(__dirname, 'output-carrossel-9');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Gerando Carrossel #9: IA Elimina Categoria\n');
  console.log(`📊 Total de slides: ${carrossel.slides.length}\n`);

  try {
    const browser = await chromium.launch({
      args: ['--font-render-hinting=none']
    });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    for (let i = 0; i < carrossel.slides.length; i++) {
      const slide = carrossel.slides[i];
      const slideNum = i + 1;

      console.log(`  📸 Gerando slide ${slideNum}/${carrossel.slides.length}...`);

      const html = renderTemplate({
        ...cliente,
        texto: slide.texto
      });

      await page.setContent(html);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const outputPath = path.join(outputDir, `slide_${slideNum}.png`);

      const slideElement = await page.$('.slide');
      await slideElement.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: false
      });

      console.log(`  ✅ Salvo: slide_${slideNum}.png`);
    }

    await browser.close();

    console.log(`\n🎉 Carrossel #9 gerado!\n`);
    console.log('📁 Pasta: output-carrossel-9/\n');

    // Listar arquivos
    console.log('📊 Arquivos gerados:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${file}: ${sizeKB} KB`);
    });

    console.log('\n✅ Dimensões: 1080×1350px (Safe Area)');
    console.log('💡 Próximo: Upload no Cloudinary\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarCarrossel9().catch(console.error);
