/**
 * Gerar 1 Slide - Só com Foto
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ler template só foto
const templatePath = path.join(__dirname, 'template-so-foto.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

function renderTemplate(data) {
  const { nome, username, fotoUrl } = data;
  let html = templateHTML;
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  return html;
}

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-so-foto');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando 1 slide - SÓ FOTO\n');
  console.log('📸 Avatar grande centralizado');
  console.log('👤 Nome e username abaixo\n');

  try {
    const browser = await chromium.launch({
      args: ['--font-render-hinting=none']
    });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    const html = renderTemplate(cliente);

    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const outputPath = path.join(outputDir, 'teste-so-foto.png');

    const slideElement = await page.$('.slide');
    await slideElement.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false
    });

    await browser.close();

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Imagem gerada!\n');
    console.log(`📁 Arquivo: teste-so-foto/teste-so-foto.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
