#!/usr/bin/env node

/**
 * 🎨 CONVERSOR: SQUAD CONTENT → IMAGENS SAMUEL
 * Converte os carrosséis gerados pelo Squad em imagens no template do Samuel
 */

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
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
// PARSER DE MARKDOWN DO SQUAD
// ============================================================================

function parseCarrosselMarkdown(mdContent) {
  const slides = [];

  // Extrair título do carrossel
  const titleMatch = mdContent.match(/^# (.+)/m);
  const carouselTitle = titleMatch ? titleMatch[1].replace(/Carrossel \d+: /, '') : 'Carrossel';

  // Extrair slides (padrão: ## SLIDE N)
  const slideRegex = /## SLIDE (\d+)[^\n]*\n([\s\S]*?)(?=## SLIDE \d+|## CAPTION|$)/g;
  let match;

  while ((match = slideRegex.exec(mdContent)) !== null) {
    const slideNumber = parseInt(match[1]);
    const content = match[2].trim();

    // Extrair título e subtexto
    const titleMatch = content.match(/\*\*Título:\*\* (.+)/);
    const subtextMatch = content.match(/\*\*Subtexto:\*\* (.+)/);

    const title = titleMatch ? titleMatch[1] : '';
    const subtext = subtextMatch ? subtextMatch[1] : '';

    // Combinar título e subtexto
    let mainText = '';
    let finalText = '';

    if (slideNumber === 1) {
      // Slide 1: Título grande
      finalText = title;
      mainText = subtext;
    } else {
      // Outros slides: título como negrito, subtexto normal
      mainText = subtext;
      finalText = title;
    }

    slides.push({
      slideNumber,
      mainText,
      finalText,
      imageSrc: null,
    });
  }

  return {
    title: carouselTitle,
    slides,
  };
}

// ============================================================================
// GERADOR DE HTML
// ============================================================================

async function generateSlideHTML(slide, autor) {
  const templatePath = './templates/postsamuel-template.html';
  let html = await readFile(templatePath, 'utf-8');

  // Substituir variáveis
  html = html.replace(/{{name}}/g, autor.name);
  html = html.replace(/{{handle}}/g, autor.handle);

  // Profile pic
  if (autor.profilePic.startsWith('http')) {
    html = html.replace('{{profilePicClass}}', '');
    html = html.replace('{{profilePicContent}}', `<img src="${autor.profilePic}" alt="${autor.name}">`);
  } else {
    html = html.replace('{{profilePicClass}}', 'no-image');
    html = html.replace('{{profilePicContent}}', autor.profilePic);
  }

  // Main text
  const paragraphs = slide.mainText.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
  html = html.replace('{{mainText}}', paragraphs);

  // Remover bloco de imagem
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
  console.log('\n🎨 CONVERSOR: SQUAD CONTENT → IMAGENS SAMUEL\n');

  const inputDir = './output/carrossel-samuel-fialho-2026-02-12';
  const outputBaseDir = './output/carousels-samuelfialhoo';

  // Criar diretório base
  await mkdir(outputBaseDir, { recursive: true });

  // Ler todos os carrosséis
  const files = await readdir(inputDir);
  const carrosselFiles = files.filter(f => f.startsWith('carrossel-') && f.endsWith('.md'));

  console.log(`📚 Encontrados ${carrosselFiles.length} carrosséis\n`);

  let totalSlides = 0;

  for (const file of carrosselFiles) {
    const carrosselNum = file.match(/carrossel-(\d+)/)[1];
    console.log(`\n📋 Processando Carrossel ${carrosselNum}...`);

    // Ler e parsear markdown
    const mdPath = join(inputDir, file);
    const mdContent = await readFile(mdPath, 'utf-8');
    const carrossel = parseCarrosselMarkdown(mdContent);

    if (carrossel.slides.length === 0) {
      console.log(`   ⚠️  Nenhum slide encontrado, pulando...`);
      continue;
    }

    // Criar pasta para este carrossel
    const outputDir = join(outputBaseDir, `carrossel-${carrosselNum.padStart(2, '0')}`);
    await mkdir(outputDir, { recursive: true });

    console.log(`   📊 ${carrossel.slides.length} slides`);
    console.log(`   📁 ${outputDir}\n`);

    // Gerar cada slide
    for (let i = 0; i < carrossel.slides.length; i++) {
      const slide = carrossel.slides[i];
      const slideNum = String(i + 1).padStart(2, '0');

      console.log(`   ⏳ Slide ${slideNum}/${carrossel.slides.length}`);

      // Gerar HTML
      const html = await generateSlideHTML(slide, SAMUEL_DATA);

      // Gerar screenshot
      const pngPath = join(outputDir, `slide-${slideNum}.png`);
      await generateScreenshot(html, pngPath);

      console.log(`   ✅ ${pngPath}`);

      totalSlides++;
    }

    console.log(`\n   ✨ Carrossel ${carrosselNum} completo!`);
  }

  console.log(`\n\n🎉 CONVERSÃO CONCLUÍDA!\n`);
  console.log(`📊 Total de slides gerados: ${totalSlides}`);
  console.log(`📁 Pasta de output: ${outputBaseDir}\n`);
}

main().catch(console.error);
