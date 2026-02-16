/**
 * Teste com Foto REAL do Frank Costa (profilePicUrlHD)
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

// FOTO REAL DO FRANK COSTA - profilePicUrlHD do scraper
const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/573331585_18537652141006419_1408263326610028077_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QHjq8XcsBMHZPenWVJIkJ8DvkbtfDQMzMUlYfg1R2OlNapfylnz7G1YQK3Sj0kcvdI&_nc_ohc=Fwvzhat94I0Q7kNvwHZrfYt&_nc_gid=oCcvqqI2k7anRG_EGA6R5w&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AfsIt1zUNu77QizDtAiRBIQqkG5TzxCIAc7F4PceOs1lMQ&oe=6998BA73&_nc_sid=8b3546'
};

// Slide 1 do Carrossel #8
const textoTeste = `Você curte posts motivacionais mas nunca muda nada?

Está no "Vale da Ansiedade Aspiracional".`;

async function gerarTeste() {
  const outputDir = path.join(__dirname, 'teste-frank-real');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🎨 Gerando slide com FOTO REAL do Frank Costa\n');
  console.log('📸 Foto: profilePicUrlHD do scraper');
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
    await page.waitForTimeout(2000); // Mais tempo para carregar foto real

    const outputPath = path.join(outputDir, 'slide-frank-real.png');

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
    console.log(`📁 Arquivo: teste-frank-real/slide-frank-real.png`);
    console.log(`📊 Tamanho: ${sizeKB} KB`);
    console.log(`📐 Dimensões: 1080×1350px\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

gerarTeste().catch(console.error);
