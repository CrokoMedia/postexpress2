/**
 * Gerar 1 Slide - Texto + Foto
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ler template texto + foto
const templatePath = path.join(__dirname, 'template-texto-mais-foto.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

function renderTemplate(data) {
  const { nome, username, fotoUrl, texto, imagemUrl } = data;
  let html = templateHTML;
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  html = html.replace(/\{\{TEXTO\}\}/g, texto);
  html = html.replace(/\{\{IMAGEM_URL\}\}/g, imagemUrl);
  return html;
}

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

// Texto de teste
const textoTeste = `IA não vai roubar emprego.

Vai ELIMINAR sua categoria inteira.

Você tem < 3 anos.`;

// Imagem de exemplo (landscape)
const imagemTeste = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-texto-foto');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando 1 slide - TEXTO + FOTO\n');
  console.log('📝 Texto no topo');
  console.log('🖼️  Imagem embaixo (retângulo arredondado)\n');

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
      texto: textoTeste,
      imagemUrl: imagemTeste
    });

    await page.setContent(html);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Mais tempo para carregar imagem

    const outputPath = path.join(outputDir, 'teste-texto-foto.png');

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
    console.log(`📁 Arquivo: teste-texto-foto/teste-texto-foto.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
