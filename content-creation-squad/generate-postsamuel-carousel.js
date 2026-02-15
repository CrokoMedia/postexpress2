#!/usr/bin/env node

/**
 * 🎨 GERADOR DE CARROSSÉIS - POSTSAMUEL TEMPLATE
 * Gera carrosséis usando o template PostSamuel (1320x1760px)
 */

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ============================================================================
// DADOS DO SAMUEL
// ============================================================================

const SAMUEL_DATA = {
  name: 'Samuel Fialho',
  handle: '@samuelfialhoo',
  isVerified: true,
  profilePic: 'https://instagram.fcgh8-1.fna.fbcdn.net/v/t51.2885-19/469489466_602726122376870_7934686901629894953_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.fcgh8-1.fna.fbcdn.net&_nc_cat=103&_nc_ohc=4uK2Y0xOWYEQ7kNvgGi_S7k&_nc_gid=b81cd4a06a5e496e8fb84c3d2c476ba5&edm=AEhyXUkBAAAA&ccb=7-5&oh=00_AYBbQJNFQ4F5sY7z5DRZLLcqWmVy8y9R5fHdBbOh2sqmxA&oe=67562A43&_nc_sid=8f1549',
};

// ============================================================================
// CARROSSEL DE TESTE
// ============================================================================

const testeCarrossel = {
  id: 'postsamuel-test-01',
  autor: SAMUEL_DATA,
  slides: [
    {
      slideNumber: 1,
      mainText: `Como transformar R$ 0 em R$ 100 mil em 90 dias vendendo infoprodutos.

Sem investir em tráfego pago.
Sem precisar de audiência.
Sem precisar de equipe.`,
      imageSrc: null,
      finalText: 'E tudo isso começando do zero absoluto.',
    },
    {
      slideNumber: 2,
      mainText: `O segredo está em 3 pilares que 99% dos iniciantes ignoram completamente.

E não, não é sobre criar mais conteúdo.`,
      imageSrc: null,
      finalText: 'É sobre entender a psicologia da compra.',
    },
    {
      slideNumber: 3,
      mainText: `Pilar 1: Oferta Magnética

Sua oferta precisa ser tão clara que mesmo uma criança de 10 anos entenda o valor.`,
      imageSrc: null,
      finalText: 'Se você não consegue explicar em uma frase, sua oferta está confusa.',
    },
    {
      slideNumber: 4,
      mainText: `Pilar 2: Posicionamento Cirúrgico

Não tente falar com todo mundo. Fale com UMA pessoa específica que tem UM problema específico.`,
      imageSrc: null,
      finalText: 'Quanto mais específico, mais fácil de vender.',
    },
    {
      slideNumber: 5,
      mainText: `Pilar 3: Sistema de Conversão

Não adianta ter tráfego se você não tem um sistema que converte visitantes em compradores.`,
      imageSrc: null,
      finalText: 'A conversão acontece na mensagem, não no volume.',
    },
  ],
};

// ============================================================================
// GERADOR DE HTML
// ============================================================================

async function generateSlideHTML(slide, autor) {
  const templatePath = './templates/postsamuel-template.html';
  let html = await readFile(templatePath, 'utf-8');

  // Substituir variáveis
  html = html.replace(/{{name}}/g, autor.name);
  html = html.replace(/{{handle}}/g, autor.handle);

  // Profile pic (emoji ou imagem)
  if (autor.profilePic.startsWith('http')) {
    html = html.replace('{{profilePicClass}}', '');
    html = html.replace('{{profilePicContent}}', `<img src="${autor.profilePic}" alt="${autor.name}">`);
  } else {
    html = html.replace('{{profilePicClass}}', 'no-image');
    html = html.replace('{{profilePicContent}}', autor.profilePic);
  }

  // Main text (converter quebras de linha em parágrafos)
  const paragraphs = slide.mainText.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
  html = html.replace('{{mainText}}', paragraphs);

  // Remover bloco de imagem (não usamos neste teste)
  html = html.replace(/{{#if hasImage}}[\s\S]*?{{\/if}}/g, '');

  // Final text
  html = html.replace('{{finalText}}', slide.finalText);

  return html;
}

// ============================================================================
// GERADOR DE SCREENSHOT
// ============================================================================

async function generateScreenshot(html, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html);
  await page.setViewportSize({ width: 1080, height: 1080 });

  // Esperar fontes carregarem
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: outputPath,
    type: 'png',
  });

  await browser.close();
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n🎨 GERADOR DE CARROSSÉIS - POSTSAMUEL TEMPLATE\n');

  const carrossel = testeCarrossel;
  const outputDir = `./output/postsamuel-test`;

  // Criar diretório de output
  await mkdir(outputDir, { recursive: true });

  console.log(`📊 Gerando ${carrossel.slides.length} slides...\n`);

  for (let i = 0; i < carrossel.slides.length; i++) {
    const slide = carrossel.slides[i];
    const slideNum = String(i + 1).padStart(2, '0');

    console.log(`⏳ Slide ${slideNum}/${carrossel.slides.length}`);

    // Gerar HTML
    const html = await generateSlideHTML(slide, carrossel.autor);

    // Salvar HTML (para debug)
    const htmlPath = join(outputDir, `slide-${slideNum}.html`);
    await writeFile(htmlPath, html);

    // Gerar screenshot
    const pngPath = join(outputDir, `slide-${slideNum}.png`);
    await generateScreenshot(html, pngPath);

    console.log(`✅ Salvo: ${pngPath}\n`);
  }

  console.log('✨ CARROSSEL GERADO COM SUCESSO!\n');
  console.log(`📁 Pasta: ${outputDir}`);
  console.log(`📊 Total: ${carrossel.slides.length} slides`);
  console.log(`📐 Dimensões: 1080x1080px (Instagram Quadrado)\n`);
}

main().catch(console.error);
