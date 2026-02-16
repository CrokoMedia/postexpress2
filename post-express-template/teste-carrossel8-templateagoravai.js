/**
 * Teste Carrossel #8 - Template Agora Vai
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

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

// Slide 1 do Carrossel #8 - Vale da Ansiedade
const textoSlide1 = `Você curte posts motivacionais mas nunca muda nada?

Está no "Vale da Ansiedade Aspiracional".`;

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-c8-agoravai');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando Carrossel #8 - Template Agora Vai\n');
  console.log('📋 Template:');
  console.log('   • Font: Chirp 36px');
  console.log('   • Avatar: 80px');
  console.log('   • Padding: 100px 110px');
  console.log('   • Line height: 1.5\n');

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
      texto: textoSlide1
    });

    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const outputPath = path.join(outputDir, 'teste-c8-slide1.png');

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
    console.log(`📁 Arquivo: teste-c8-agoravai/teste-c8-slide1.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
