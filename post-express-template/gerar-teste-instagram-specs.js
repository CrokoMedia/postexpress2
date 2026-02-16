/**
 * Gerar 1 Slide - Especificações Oficiais do Instagram
 *
 * Font: system-ui, 14px, line-height 18px, weight 400
 * Color: rgb(245, 245, 245)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template-instagram-specs.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

function renderTemplate(data) {
  const { nome, username, fotoUrl, texto } = data;
  let html = templateHTML;
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);

  // Converter quebras de linha duplas em parágrafos HTML
  const textoParagrafos = texto
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('');

  html = html.replace(/\{\{TEXTO\}\}/g, textoParagrafos);
  return html;
}

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

const textoTeste = `IA não vai roubar emprego.

Vai ELIMINAR sua categoria inteira.

Você tem < 3 anos.`;

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-instagram-specs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando 1 slide - SPECS OFICIAIS DO INSTAGRAM\n');
  console.log('📋 Especificações:');
  console.log('   • Font: system-ui');
  console.log('   • Size: 14px');
  console.log('   • Line Height: 18px');
  console.log('   • Weight: 400');
  console.log('   • Color: rgb(245, 245, 245)');
  console.log('   • Background: #000000\n');

  try {
    const browser = await chromium.launch({
      args: ['--font-render-hinting=none']
    });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    const html = renderTemplate({
      ...cliente,
      texto: textoTeste
    });

    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const outputPath = path.join(outputDir, 'teste-instagram-specs.png');

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
    console.log(`📁 Arquivo: teste-instagram-specs/teste-instagram-specs.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
