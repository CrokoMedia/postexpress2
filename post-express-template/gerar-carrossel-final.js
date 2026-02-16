/**
 * Gerar Carrossel Final
 * Usa template com fonte Twitter/X e textos sem emojis
 *
 * Uso: node gerar-carrossel-final.js [numero-carrossel]
 * Exemplo: node gerar-carrossel-final.js 9
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Obter número do carrossel do argumento
const numeroCarrossel = process.argv[2] || '9';

// Ler template Safe Area (fonte 44px estilo Twitter/X)
const templatePath = path.join(__dirname, 'template-safe-area.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

// Ler carrossel sem emojis
const carrosselPath = path.join(__dirname, `../squad-auditores/output-sem-emojis/carrossel_${numeroCarrossel}_sem_emoji.json`);

if (!fs.existsSync(carrosselPath)) {
  console.error(`❌ Arquivo não encontrado: ${carrosselPath}`);
  console.log(`💡 Use: node gerar-carrossel-final.js [1-9]`);
  process.exit(1);
}

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

async function gerarCarrossel() {
  const outputDir = path.join(__dirname, `output-carrossel-${numeroCarrossel}-final`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log(`🚀 Gerando Carrossel #${numeroCarrossel}: ${carrossel.titulo}\n`);
  console.log(`📊 Total de slides: ${carrossel.slides.length}`);
  console.log(`✨ Fonte: 44px (estilo Twitter/X)`);
  console.log(`🚫 Sem emojis nas imagens\n`);

  try {
    const browser = await chromium.launch({
      args: ['--font-render-hinting=none']
    });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1  // CRITICAL: Gera EXATAMENTE 1080×1350
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

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ✅ Salvo: slide_${slideNum}.png (${sizeKB} KB)`);
    }

    await browser.close();

    console.log(`\n🎉 Carrossel #${numeroCarrossel} gerado!\n`);
    console.log(`📁 Pasta: output-carrossel-${numeroCarrossel}-final/\n`);

    // Listar arquivos
    console.log('📊 Arquivos gerados:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${file}: ${sizeKB} KB`);
    });

    console.log('\n✅ Dimensões: 1080×1350px (Instagram Safe Area)');
    console.log('✅ Fonte: 44px (estilo Twitter/X)');
    console.log('✅ Sem emojis');
    console.log('\n💡 Próximo: Upload no Cloudinary\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarCarrossel().catch(console.error);
