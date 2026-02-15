#!/usr/bin/env node

/**
 * 🔄 CAROUSEL TO FIGMA CONVERTER - INTERACTIVE
 *
 * Versão interativa que permite escolher qual carrossel converter
 *
 * Criado por: Content Creation Squad
 */

require('dotenv').config({ path: '../../.env.local' });
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CONFIG = {
  CAROUSELS_DIR: path.join(__dirname, '../output/carrossel-samuel-fialho-2026-02-12'),
  OUTPUT_DIR: path.join(__dirname, '../output'),
  STORY_WIDTH: 1080,
  STORY_HEIGHT: 1920,
  SPACING: 100,
};

const COLORS = {
  azulEscuro: '#2C3E50',
  azulMedio: '#34495E',
  verdeProsp: '#27AE60',
  verdeClaro: '#2ECC71',
  vermelhoInv: '#E74C3C',
  dourado: '#FFD23F',
  azulDest: '#3498DB',
  preto: '#1A1A1A',
  branco: '#FFFFFF',
};

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Parse do arquivo markdown do carrossel
 */
async function parseCarousel(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');

  const carousel = {
    title: '',
    platform: '',
    objective: '',
    slides: [],
    caption: '',
    hashtags: '',
  };

  let currentSlide = null;
  let section = '';

  for (const line of lines) {
    if (line.startsWith('# Carrossel')) {
      carousel.title = line.replace('# Carrossel', '').replace(/^\d+:\s*/, '').trim();
    } else if (line.startsWith('**Plataforma**:')) {
      carousel.platform = line.split(':')[1].trim();
    } else if (line.startsWith('**Objetivo**:')) {
      carousel.objective = line.split(':')[1].trim();
    } else if (line.startsWith('## SLIDE')) {
      if (currentSlide) carousel.slides.push(currentSlide);
      const slideNum = parseInt(line.match(/\d+/)?.[0] || 0);
      currentSlide = { number: slideNum, title: '', subtitle: '', text: '' };
    } else if (line.startsWith('**Título:**')) {
      if (currentSlide) currentSlide.title = line.replace('**Título:**', '').trim();
    } else if (line.startsWith('**Subtexto:**')) {
      if (currentSlide) currentSlide.subtitle = line.replace('**Subtexto:**', '').trim();
    } else if (line.startsWith('## CAPTION')) {
      section = 'caption';
    } else if (line.startsWith('## HASHTAGS')) {
      section = 'hashtags';
    } else if (section === 'caption' && line.trim() && !line.startsWith('#')) {
      carousel.caption += line.trim() + '\n';
    } else if (section === 'hashtags' && line.trim().startsWith('#')) {
      carousel.hashtags = line.trim();
    }
  }

  if (currentSlide) carousel.slides.push(currentSlide);

  return carousel;
}

/**
 * Converte 10 slides de carrossel em 7 Stories
 */
function convertToStories(carousel) {
  const slides = carousel.slides;
  const stories = [];

  // Story 1: Hook (Slide 1)
  if (slides[0]) {
    stories.push({
      id: 1,
      title: slides[0].title.toUpperCase(),
      subtitle: slides[0].subtitle || '',
      text: '',
      background: 'gradient-escuro',
      accentColor: COLORS.azulDest,
    });
  }

  // Story 2: Problema/Contexto (Slide 2)
  if (slides[1]) {
    stories.push({
      id: 2,
      title: slides[1].title.split('\n')[0].toUpperCase(),
      text: slides[1].subtitle || slides[1].title.split('\n').slice(1).join('\n'),
      background: 'gradient-escuro',
      accentColor: COLORS.vermelhoInv,
    });
  }

  // Story 3-5: Principais pontos (Slides 3, 5, 7)
  const mainSlides = [slides[2], slides[4], slides[6]].filter(Boolean);
  mainSlides.forEach((slide, idx) => {
    if (slide) {
      stories.push({
        id: 3 + idx,
        title: slide.title.split(':')[0].toUpperCase(),
        text: slide.subtitle || slide.title.split('\n').slice(1).join('\n'),
        background: idx === 0 ? 'gradient-transicao' : 'gradient-prosperidade',
        accentColor: idx === 0 ? COLORS.dourado : COLORS.verdeClaro,
      });
    }
  });

  // Story 6: Consolidação (Slide 8 ou 9)
  const consolidation = slides[7] || slides[8];
  if (consolidation) {
    stories.push({
      id: 6,
      title: consolidation.title.split('\n')[0].toUpperCase(),
      text: consolidation.subtitle || '',
      background: 'gradient-prosperidade',
      accentColor: COLORS.verdeClaro,
    });
  }

  // Story 7: CTA (Slide 10)
  const lastSlide = slides[slides.length - 1];
  if (lastSlide) {
    stories.push({
      id: 7,
      title: lastSlide.title.toUpperCase(),
      text: lastSlide.subtitle?.split('.')[0] || '',
      cta: 'SALVE ESTE POST',
      background: 'gradient-prosperidade',
      accentColor: COLORS.dourado,
    });
  }

  return stories;
}

/**
 * Gera código do plugin Figma
 */
function generateFigmaPlugin(stories, carouselTitle) {
  return `// ==================================================================
// 🎨 FIGMA PLUGIN - Stories "${carouselTitle}"
// ==================================================================
// Gerado automaticamente pelo Carousel to Figma Converter
//
// INSTRUÇÕES:
// 1. Abra o Figma Desktop App
// 2. Menu → Plugins → Development → New Plugin
// 3. Cole ESTE código completo
// 4. Run
// ==================================================================

const STORIES = ${JSON.stringify(stories, null, 2)};

const COLORS = {
  azulEscuro: { r: 44/255, g: 62/255, b: 80/255 },
  azulMedio: { r: 52/255, g: 73/255, b: 94/255 },
  verdeProsp: { r: 39/255, g: 174/255, b: 96/255 },
  verdeClaro: { r: 46/255, g: 204/255, b: 113/255 },
  vermelhoInv: { r: 231/255, g: 76/255, b: 60/255 },
  dourado: { r: 255/255, g: 210/255, b: 63/255 },
  azulDest: { r: 52/255, g: 152/255, b: 219/255 },
  preto: { r: 26/255, g: 26/255, b: 26/255 },
  branco: { r: 1, g: 1, b: 1 },
};

const GRADIENTS = {
  'gradient-escuro': [
    { color: COLORS.preto, position: 0 },
    { color: COLORS.azulEscuro, position: 1 }
  ],
  'gradient-transicao': [
    { color: COLORS.azulMedio, position: 0 },
    { color: COLORS.verdeProsp, position: 0.7 }
  ],
  'gradient-prosperidade': [
    { color: COLORS.verdeProsp, position: 0 },
    { color: COLORS.verdeClaro, position: 1 }
  ]
};

async function createStories() {
  console.log('🎨 Criando ${stories.length} Stories...');

  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const STORY_WIDTH = 1080;
  const STORY_HEIGHT = 1920;
  const SPACING = 100;

  for (let i = 0; i < STORIES.length; i++) {
    const story = STORIES[i];
    const x = i * (STORY_WIDTH + SPACING);

    const frame = figma.createFrame();
    frame.name = \`Story \${String(story.id).padStart(2, '0')}\`;
    frame.resize(STORY_WIDTH, STORY_HEIGHT);
    frame.x = x;
    frame.y = 0;

    const gradientStops = GRADIENTS[story.background];
    frame.fills = [{
      type: 'GRADIENT_LINEAR',
      gradientHandlePositions: [
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 }
      ],
      gradientStops: gradientStops.map(stop => ({
        position: stop.position,
        color: { ...stop.color, a: 1 }
      }))
    }];

    let currentY = 300;

    if (story.title) {
      const title = figma.createText();
      title.fontName = { family: "Inter", style: "Bold" };
      title.fontSize = 64;
      title.characters = story.title;
      title.fills = [{ type: 'SOLID', color: COLORS.branco }];
      title.textAlignHorizontal = 'CENTER';
      title.resize(900, title.height);
      title.x = 90;
      title.y = currentY;
      frame.appendChild(title);
      currentY += title.height + 40;
    }

    if (story.subtitle) {
      const subtitle = figma.createText();
      subtitle.fontName = { family: "Inter", style: "Medium" };
      subtitle.fontSize = 32;
      subtitle.characters = story.subtitle;
      subtitle.fills = [{ type: 'SOLID', color: COLORS.dourado }];
      subtitle.textAlignHorizontal = 'CENTER';
      subtitle.resize(900, subtitle.height);
      subtitle.x = 90;
      subtitle.y = currentY;
      frame.appendChild(subtitle);
      currentY += subtitle.height + 60;
    }

    if (story.text) {
      const text = figma.createText();
      text.fontName = { family: "Inter", style: "Regular" };
      text.fontSize = 32;
      text.characters = story.text;
      text.fills = [{ type: 'SOLID', color: COLORS.branco }];
      text.textAlignHorizontal = 'CENTER';
      text.lineHeight = { value: 140, unit: 'PERCENT' };
      text.resize(900, text.height);
      text.x = 90;
      text.y = currentY;
      frame.appendChild(text);
    }

    if (story.cta) {
      const cta = figma.createText();
      cta.fontName = { family: "Inter", style: "Bold" };
      cta.fontSize = 48;
      cta.characters = story.cta;
      cta.fills = [{ type: 'SOLID', color: COLORS.dourado }];
      cta.textAlignHorizontal = 'CENTER';
      cta.resize(900, cta.height);
      cta.x = 90;
      cta.y = 1500;
      frame.appendChild(cta);
    }

    console.log(\`✅ Story \${story.id} criado\`);
  }

  console.log('🎉 Todos os ${stories.length} Stories foram criados!');
  figma.closePlugin('✅ ${stories.length} Stories criados com sucesso!');
}

createStories().catch(err => {
  console.error('❌ Erro:', err);
  figma.closePlugin('❌ Erro: ' + err.message);
});`;
}

/**
 * Gera preview HTML
 */
function generateHTMLPreview(stories, carouselTitle) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${carouselTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a1a;
      color: white;
      padding: 40px 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 20px; color: #FFD23F; font-size: 2rem; }
    .subtitle { text-align: center; margin-bottom: 40px; opacity: 0.8; }
    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }
    .story {
      aspect-ratio: 9/16;
      border-radius: 12px;
      padding: 40px 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transition: transform 0.3s;
      position: relative;
    }
    .story:hover { transform: scale(1.02); }
    .story-number {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .story-title {
      font-size: 2rem;
      font-weight: 900;
      margin-bottom: 15px;
      line-height: 1.2;
    }
    .story-subtitle {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 25px;
      opacity: 0.9;
    }
    .story-text {
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 20px;
      white-space: pre-line;
    }
    .story-cta {
      font-size: 1.4rem;
      font-weight: 700;
      margin-top: auto;
      padding: 12px 25px;
      border: 3px solid currentColor;
      border-radius: 8px;
    }
    .gradient-escuro {
      background: linear-gradient(135deg, #1A1A1A 0%, #2C3E50 100%);
    }
    .gradient-transicao {
      background: linear-gradient(135deg, #34495E 0%, #27AE60 70%);
    }
    .gradient-prosperidade {
      background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 ${carouselTitle}</h1>
    <div class="subtitle">${stories.length} Stories • Formato Instagram</div>
    <div class="stories-grid">
      ${stories.map(story => `
        <div class="story ${story.background}">
          <div class="story-number">Story ${story.id}</div>
          ${story.title ? `<div class="story-title" style="color: ${story.accentColor}">${story.title}</div>` : ''}
          ${story.subtitle ? `<div class="story-subtitle" style="color: ${story.accentColor}">${story.subtitle}</div>` : ''}
          ${story.text ? `<div class="story-text">${story.text}</div>` : ''}
          ${story.cta ? `<div class="story-cta" style="color: ${story.accentColor}">${story.cta}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Prompt interativo
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🔄 CAROUSEL TO FIGMA CONVERTER - INTERACTIVE\n');
  console.log('='.repeat(60));

  // Listar carrosséis disponíveis
  const files = await fs.readdir(CONFIG.CAROUSELS_DIR);
  const carouselFiles = files.filter(f => f.startsWith('carrossel-') && f.endsWith('.md'));

  if (carouselFiles.length === 0) {
    console.log('\n❌ Nenhum carrossel encontrado em:', CONFIG.CAROUSELS_DIR);
    return;
  }

  // Ler sumário para pegar títulos
  const summaryPath = path.join(CONFIG.CAROUSELS_DIR, 'batch-summary.md');
  let summaryContent = '';
  try {
    summaryContent = await fs.readFile(summaryPath, 'utf8');
  } catch (e) {
    // Ignorar se não existir
  }

  // Extrair títulos do sumário
  const titles = [];
  const titleMatches = summaryContent.matchAll(/### (\d+)\. (.+)/g);
  for (const match of titleMatches) {
    titles.push(match[2]);
  }

  console.log(`\n📚 ${carouselFiles.length} carrosséis disponíveis:\n`);

  // Listar com títulos
  carouselFiles.forEach((file, idx) => {
    const num = idx + 1;
    const title = titles[idx] || 'Sem título';
    console.log(`   ${num}. ${title}`);
  });

  // Pedir escolha
  console.log('');
  const choice = await prompt('Digite o número do carrossel que deseja converter (1-9): ');
  const selectedIdx = parseInt(choice) - 1;

  if (selectedIdx < 0 || selectedIdx >= carouselFiles.length) {
    console.log('\n❌ Escolha inválida!');
    return;
  }

  const selectedFile = carouselFiles[selectedIdx];
  const selectedTitle = titles[selectedIdx] || `Carrossel ${selectedIdx + 1}`;

  console.log(`\n🎯 Convertendo: ${selectedTitle}\n`);
  console.log('='.repeat(60) + '\n');

  // Parse do carrossel
  const filePath = path.join(CONFIG.CAROUSELS_DIR, selectedFile);
  const carousel = await parseCarousel(filePath);

  console.log(`✅ Carrossel parseado:`);
  console.log(`   - Título: ${carousel.title}`);
  console.log(`   - Slides: ${carousel.slides.length}`);
  console.log(`   - Plataforma: ${carousel.platform}`);

  // Converter para Stories
  const stories = convertToStories(carousel);
  console.log(`\n✅ Convertido para ${stories.length} Stories\n`);

  // Gerar plugin Figma
  const pluginCode = generateFigmaPlugin(stories, carousel.title);
  const pluginPath = path.join(CONFIG.OUTPUT_DIR, `figma-plugin-${selectedIdx + 1}.js`);
  await fs.writeFile(pluginPath, pluginCode, 'utf8');
  console.log(`✅ Plugin Figma: ${pluginPath}`);

  // Gerar preview HTML
  const htmlPreview = generateHTMLPreview(stories, carousel.title);
  const htmlPath = path.join(CONFIG.OUTPUT_DIR, `preview-${selectedIdx + 1}.html`);
  await fs.writeFile(htmlPath, htmlPreview, 'utf8');
  console.log(`✅ Preview HTML: ${htmlPath}`);

  // Gerar JSON
  const jsonPath = path.join(CONFIG.OUTPUT_DIR, `stories-${selectedIdx + 1}.json`);
  await fs.writeFile(jsonPath, JSON.stringify({
    meta: {
      title: carousel.title,
      original: selectedFile,
      converted: new Date().toISOString(),
      number: selectedIdx + 1,
    },
    stories,
  }, null, 2), 'utf8');
  console.log(`✅ Estrutura JSON: ${jsonPath}`);

  // Abrir preview
  console.log(`\n🌐 Abrindo preview no navegador...`);
  const { exec } = require('child_process');
  exec(`open "${htmlPath}"`);

  // Instruções
  console.log('\n' + '='.repeat(60));
  console.log('\n📖 PRÓXIMOS PASSOS:\n');
  console.log('1️⃣  Preview aberto no navegador ✅\n');
  console.log('2️⃣  Copiar plugin para Figma Desktop:');
  console.log(`   open "${pluginPath}"`);
  console.log('   - Copiar TODO o código (Cmd+A, Cmd+C)');
  console.log('   - Colar no Figma Plugin Development\n');
  console.log('3️⃣  Executar plugin no Figma');
  console.log(`   - ${stories.length} Stories serão criados!\n`);

  console.log('✨ Conversão concluída!\n');
}

// Executar
main().catch(error => {
  console.error('\n❌ ERRO:', error.message);
  process.exit(1);
});
