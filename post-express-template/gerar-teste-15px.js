/**
 * Gerar 1 Slide de Teste - Fonte 15px (Twitter original)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template-safe-area.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

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

const textoTeste = `IA não vai roubar emprego.

Vai ELIMINAR sua categoria inteira.

Você tem < 3 anos.`;

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-15px');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando 1 slide - FONTE 15PX (Twitter original)\n');

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

    const outputPath = path.join(outputDir, 'teste-15px.png');

    const slideElement = await page.$('.slide');
    await slideElement.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false
    });

    await browser.close();

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ Imagem de teste gerada!\n');
    console.log(`📁 Arquivo: teste-15px/teste-15px.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px`);
    console.log(`✨ Fonte: 15px (tamanho original do Twitter)\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
