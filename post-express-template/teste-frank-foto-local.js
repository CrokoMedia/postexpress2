/**
 * Teste com Foto LOCAL do Frank Costa
 * Template: Agora Vai
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const templatePath = '/Users/macbook-karla/postexpress2/templateagoravai.html';
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

// Usar foto LOCAL
const fotoLocalPath = path.join(__dirname, 'frank-foto.jpg');
const fotoLocalUrl = `file://${fotoLocalPath}`;

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: fotoLocalUrl
};

const textoTeste = `Você curte posts motivacionais mas nunca muda nada?

Está no "Vale da Ansiedade Aspiracional".`;

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-frank-local');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando slide com FOTO LOCAL do Frank Costa\n');
  console.log(`📸 Foto: ${fotoLocalPath}`);
  console.log('📋 Template: Agora Vai\n');

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
    await page.waitForTimeout(2000);

    const outputPath = path.join(outputDir, 'slide-frank-local.png');

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
    console.log(`📁 Arquivo: teste-frank-local/slide-frank-local.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
