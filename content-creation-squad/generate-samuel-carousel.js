#!/usr/bin/env node

/**
 * 🎨 GERADOR DE CARROSSÉIS - SAMUEL FIALHO
 * Gera carrosséis no estilo Instagram do Samuel usando o template personalizado
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
  profilePic: '🔥', // Emoji enquanto não tiver foto
};

// ============================================================================
// EXEMPLO DE CARROSSEL
// ============================================================================

const exemploCarrossel = {
  id: 'carrossel-samuel-01',
  autor: SAMUEL_DATA,
  slides: [
    {
      slideNumber: 1,
      mainText: `Um ex-dono de academia acaba de mudar a história do marketing digital para sempre.

Há poucos dias atrás, Alex Hormozi vendeu 2,9 milhões de cópias do seu livro em 24 horas.`,
      imageSrc: null, // Sem imagem neste slide
      finalText: 'Foram US$ 87,5 milhões em receita, um recorde mundial — mostrando um novo modelo de como transformar lançamentos em um espetáculo global.',
    },
    {
      slideNumber: 2,
      mainText: `Mas o que aconteceu ali não foi sorte.

Foi engenharia de tráfego, copywriting cirúrgico e posicionamento absoluto.`,
      imageSrc: null,
      finalText: 'E você pode aprender os mesmos princípios que ele usou.',
    },
    {
      slideNumber: 3,
      mainText: `Aqui estão os 3 pilares que fizeram esse lançamento explodir:`,
      imageSrc: null,
      finalText: `1. Audiência aquecida por anos de conteúdo gratuito
2. Oferta irresistível (Grand Slam Offer)
3. Timing perfeito e escassez real`,
    },
  ],
};

// ============================================================================
// GERADOR DE HTML
// ============================================================================

async function generateSlideHTML(slide, autor, totalSlides) {
  // Ler template base
  const templatePath = './templates/samuel-template.html';
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

  // Imagem (se houver)
  if (slide.imageSrc) {
    html = html.replace('{{#if hasImage}}', '');
    html = html.replace('{{/if}}', '');
    html = html.replace('{{imageSrc}}', slide.imageSrc);
    html = html.replace('{{imageAlt}}', slide.imageAlt || 'Imagem do post');
  } else {
    // Remover bloco de imagem
    html = html.replace(/{{#if hasImage}}[\s\S]*?{{\/if}}/g, '');
  }

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
  await page.setViewportSize({ width: 1080, height: 1350 });

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
  console.log('\n🎨 GERADOR DE CARROSSÉIS - SAMUEL FIALHO\n');

  const carrossel = exemploCarrossel;
  const outputDir = `./output/carousels-${carrossel.id}`;

  // Criar diretório de output
  await mkdir(outputDir, { recursive: true });

  console.log(`📊 Gerando ${carrossel.slides.length} slides...\n`);

  for (let i = 0; i < carrossel.slides.length; i++) {
    const slide = carrossel.slides[i];
    const slideNum = String(i + 1).padStart(2, '0');

    console.log(`⏳ Slide ${slideNum}/${carrossel.slides.length}`);

    // Gerar HTML
    const html = await generateSlideHTML(slide, carrossel.autor, carrossel.slides.length);

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
  console.log(`📊 Total: ${carrossel.slides.length} slides\n`);
}

main().catch(console.error);
