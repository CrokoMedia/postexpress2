#!/usr/bin/env node

/**
 * 🎨 FIGMA PREMIUM TEMPLATE - Minimalista Apple Style
 *
 * Design profissional para Stories Instagram
 * Inspirado em: Apple, Twitter Premium, Editorial Design
 *
 * Features:
 * - Cores sólidas elegantes (sem gradientes neon)
 * - Tipografia forte e hierárquica
 * - Muito espaço em branco
 * - Elementos visuais sutis
 * - Layout sofisticado
 */

require('dotenv').config({ path: '../../.env.local' });
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// PALETA PREMIUM - Inspirada em Apple/Twitter
// ============================================================================

const PREMIUM_COLORS = {
  // Backgrounds sólidos (sem gradiente)
  deepBlack: '#000000',        // Preto puro Apple
  darkSlate: '#1C1C1E',        // Cinza escuro iOS
  deepNavy: '#0A1929',         // Azul profundo elegante
  richPurple: '#5B21B6',       // Roxo premium
  forestGreen: '#064E3B',      // Verde escuro sofisticado

  // Acentos
  electricBlue: '#0EA5E9',     // Azul vibrante mas elegante
  mintGreen: '#10B981',        // Verde menta
  amber: '#F59E0B',            // Âmbar dourado
  coral: '#EF4444',            // Coral suave

  // Neutros
  pureWhite: '#FFFFFF',        // Branco puro
  softGray: '#F3F4F6',         // Cinza suave
  mediumGray: '#9CA3AF',       // Cinza médio
  darkGray: '#374151',         // Cinza escuro para texto
};

// ============================================================================
// LAYOUTS PREMIUM
// ============================================================================

const LAYOUTS = {
  // Layout 1: Hero (Hook)
  hero: {
    name: 'Hero',
    background: PREMIUM_COLORS.deepBlack,
    accentColor: PREMIUM_COLORS.electricBlue,
    titleSize: 72,
    subtitleSize: 28,
    hasTopBar: true,
    hasBottomBar: false,
  },

  // Layout 2: Problema (Alto contraste)
  problem: {
    name: 'Problem',
    background: PREMIUM_COLORS.darkSlate,
    accentColor: PREMIUM_COLORS.coral,
    titleSize: 56,
    textSize: 32,
    hasTopBar: true,
    hasBottomBar: false,
  },

  // Layout 3: Solução (Clean & Bright)
  solution: {
    name: 'Solution',
    background: PREMIUM_COLORS.pureWhite,
    accentColor: PREMIUM_COLORS.deepNavy,
    textColor: PREMIUM_COLORS.darkGray,
    titleSize: 52,
    textSize: 30,
    hasTopBar: false,
    hasBottomBar: true,
  },

  // Layout 4: Método/Steps
  method: {
    name: 'Method',
    background: PREMIUM_COLORS.deepNavy,
    accentColor: PREMIUM_COLORS.mintGreen,
    titleSize: 48,
    textSize: 28,
    hasTopBar: true,
    hasBottomBar: false,
  },

  // Layout 5: CTA (Final)
  cta: {
    name: 'CTA',
    background: PREMIUM_COLORS.richPurple,
    accentColor: PREMIUM_COLORS.amber,
    titleSize: 60,
    ctaSize: 36,
    hasTopBar: false,
    hasBottomBar: true,
  },
};

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

async function generatePremiumPlugin(carouselData) {
  const stories = carouselData.stories || [];
  const carouselTitle = carouselData.meta?.title || 'Stories Premium';

  return `// ==================================================================
// 🎨 FIGMA PLUGIN PREMIUM - "${carouselTitle}"
// ==================================================================
// Design Minimalista Premium - Apple/Twitter Style
// Sem gradientes neon, layout profissional, muito espaço branco
//
// INSTRUÇÕES:
// 1. Abra o Figma Desktop App
// 2. Menu → Plugins → Development → New Plugin
// 3. Cole ESTE código completo
// 4. Run
// ==================================================================

const STORIES = ${JSON.stringify(stories, null, 2)};

// Paleta de cores premium
const COLORS = {
  deepBlack: { r: 0, g: 0, b: 0 },
  darkSlate: { r: 28/255, g: 28/255, b: 30/255 },
  deepNavy: { r: 10/255, g: 25/255, b: 41/255 },
  richPurple: { r: 91/255, g: 33/255, b: 182/255 },
  electricBlue: { r: 14/255, g: 165/255, b: 233/255 },
  mintGreen: { r: 16/255, g: 185/255, b: 129/255 },
  amber: { r: 245/255, g: 158/255, b: 11/255 },
  coral: { r: 239/255, g: 68/255, b: 68/255 },
  pureWhite: { r: 1, g: 1, b: 1 },
  softGray: { r: 243/255, g: 244/255, b: 246/255 },
  mediumGray: { r: 156/255, g: 163/255, b: 175/255 },
  darkGray: { r: 55/255, g: 65/255, b: 81/255 },
};

// Layouts por tipo de story
const LAYOUTS = [
  { bg: COLORS.deepBlack, accent: COLORS.electricBlue, type: 'hero' },
  { bg: COLORS.darkSlate, accent: COLORS.coral, type: 'problem' },
  { bg: COLORS.pureWhite, accent: COLORS.deepNavy, type: 'solution', textColor: COLORS.darkGray },
  { bg: COLORS.deepNavy, accent: COLORS.mintGreen, type: 'method' },
  { bg: COLORS.deepNavy, accent: COLORS.mintGreen, type: 'method' },
  { bg: COLORS.pureWhite, accent: COLORS.richPurple, type: 'proof', textColor: COLORS.darkGray },
  { bg: COLORS.richPurple, accent: COLORS.amber, type: 'cta' },
];

async function createPremiumStories() {
  console.log('🎨 Criando ${stories.length} Stories Premium...');

  // Carregar fontes
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const STORY_WIDTH = 1080;
  const STORY_HEIGHT = 1920;
  const SPACING = 150;
  const PADDING = 80;
  const SAFE_TOP = 200;
  const SAFE_BOTTOM = 200;

  for (let i = 0; i < STORIES.length; i++) {
    const story = STORIES[i];
    const layout = LAYOUTS[i] || LAYOUTS[0];
    const x = i * (STORY_WIDTH + SPACING);

    // ========================================
    // CRIAR FRAME
    // ========================================
    const frame = figma.createFrame();
    frame.name = \`Story \${String(story.id).padStart(2, '0')} - Premium\`;
    frame.resize(STORY_WIDTH, STORY_HEIGHT);
    frame.x = x;
    frame.y = 0;
    frame.clipsContent = false;

    // Background sólido (sem gradiente)
    frame.fills = [{
      type: 'SOLID',
      color: layout.bg
    }];

    // ========================================
    // TOP BAR (Badge + Story Number)
    // ========================================
    if (i < STORIES.length - 1) {
      // Badge superior
      const topBadge = figma.createRectangle();
      topBadge.resize(200, 60);
      topBadge.x = PADDING;
      topBadge.y = 100;
      topBadge.cornerRadius = 30;
      topBadge.fills = [{
        type: 'SOLID',
        color: { ...layout.accent, a: 0.15 }
      }];
      frame.appendChild(topBadge);

      const badgeText = figma.createText();
      badgeText.fontName = { family: "Inter", style: "SemiBold" };
      badgeText.fontSize = 20;
      badgeText.characters = \`STORY \${story.id}\`;
      badgeText.fills = [{ type: 'SOLID', color: layout.accent }];
      badgeText.x = PADDING + 35;
      badgeText.y = 118;
      badgeText.letterSpacing = { value: 1.5, unit: 'PIXELS' };
      frame.appendChild(badgeText);
    }

    // ========================================
    // CONTENT AREA
    // ========================================
    let currentY = SAFE_TOP;

    // Título principal
    if (story.title) {
      const title = figma.createText();
      title.fontName = { family: "Inter", style: "Bold" };
      title.fontSize = i === 0 ? 72 : (i === STORIES.length - 1 ? 60 : 56);
      title.characters = story.title;
      title.fills = [{
        type: 'SOLID',
        color: layout.type === 'solution' || layout.type === 'proof'
          ? layout.textColor
          : COLORS.pureWhite
      }];
      title.textAlignHorizontal = 'LEFT';
      title.lineHeight = { value: 110, unit: 'PERCENT' };
      title.letterSpacing = { value: -1.5, unit: 'PIXELS' };
      title.resize(STORY_WIDTH - (PADDING * 2), title.height);
      title.x = PADDING;
      title.y = currentY;
      frame.appendChild(title);
      currentY += title.height + 50;
    }

    // Subtítulo (accent color)
    if (story.subtitle) {
      const subtitle = figma.createText();
      subtitle.fontName = { family: "Inter", style: "Medium" };
      subtitle.fontSize = 28;
      subtitle.characters = story.subtitle;
      subtitle.fills = [{ type: 'SOLID', color: layout.accent }];
      subtitle.textAlignHorizontal = 'LEFT';
      subtitle.lineHeight = { value: 140, unit: 'PERCENT' };
      subtitle.resize(STORY_WIDTH - (PADDING * 2), subtitle.height);
      subtitle.x = PADDING;
      subtitle.y = currentY;
      frame.appendChild(subtitle);
      currentY += subtitle.height + 80;
    }

    // Texto principal
    if (story.text) {
      // Linha decorativa antes do texto
      const line = figma.createLine();
      line.resize(120, 0);
      line.x = PADDING;
      line.y = currentY - 20;
      line.strokes = [{
        type: 'SOLID',
        color: layout.accent
      }];
      line.strokeWeight = 4;
      line.strokeCap = 'ROUND';
      frame.appendChild(line);

      const text = figma.createText();
      text.fontName = { family: "Inter", style: "Regular" };
      text.fontSize = 32;
      text.characters = story.text;
      text.fills = [{
        type: 'SOLID',
        color: layout.type === 'solution' || layout.type === 'proof'
          ? layout.textColor
          : { ...COLORS.pureWhite, a: 0.9 }
      }];
      text.textAlignHorizontal = 'LEFT';
      text.lineHeight = { value: 160, unit: 'PERCENT' };
      text.resize(STORY_WIDTH - (PADDING * 2), text.height);
      text.x = PADDING;
      text.y = currentY + 40;
      frame.appendChild(text);
    }

    // CTA Button
    if (story.cta) {
      const ctaY = STORY_HEIGHT - SAFE_BOTTOM - 120;

      // Background do botão
      const ctaBg = figma.createRectangle();
      ctaBg.resize(STORY_WIDTH - (PADDING * 2), 100);
      ctaBg.x = PADDING;
      ctaBg.y = ctaY;
      ctaBg.cornerRadius = 20;
      ctaBg.fills = [{ type: 'SOLID', color: layout.accent }];

      // Sombra elegante
      ctaBg.effects = [{
        type: 'DROP_SHADOW',
        color: { ...layout.accent, a: 0.4 },
        offset: { x: 0, y: 8 },
        radius: 24,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }];
      frame.appendChild(ctaBg);

      const ctaText = figma.createText();
      ctaText.fontName = { family: "Inter", style: "Bold" };
      ctaText.fontSize = 32;
      ctaText.characters = story.cta;
      ctaText.fills = [{
        type: 'SOLID',
        color: layout.type === 'cta' ? COLORS.deepBlack : COLORS.pureWhite
      }];
      ctaText.textAlignHorizontal = 'CENTER';
      ctaText.letterSpacing = { value: 1, unit: 'PIXELS' };
      ctaText.resize(STORY_WIDTH - (PADDING * 2), ctaText.height);
      ctaText.x = PADDING;
      ctaText.y = ctaY + 32;
      frame.appendChild(ctaText);
    }

    // ========================================
    // BOTTOM SIGNATURE
    // ========================================
    if (layout.type === 'solution' || layout.type === 'proof' || layout.type === 'cta') {
      const sigY = STORY_HEIGHT - 140;

      const sig = figma.createText();
      sig.fontName = { family: "Inter", style: "Medium" };
      sig.fontSize = 18;
      sig.characters = '@samuelfialhoo';
      sig.fills = [{
        type: 'SOLID',
        color: layout.type === 'cta'
          ? { ...COLORS.pureWhite, a: 0.6 }
          : { ...layout.accent, a: 0.7 }
      }];
      sig.textAlignHorizontal = 'CENTER';
      sig.letterSpacing = { value: 0.5, unit: 'PIXELS' };
      sig.resize(STORY_WIDTH - (PADDING * 2), sig.height);
      sig.x = PADDING;
      sig.y = sigY;
      frame.appendChild(sig);
    }

    console.log(\`✅ Story \${story.id} - Layout: \${layout.type}\`);
  }

  console.log('🎉 ${stories.length} Stories Premium criados!');
  console.log('🎨 Design: Minimalista Apple Style');
  console.log('✨ Cores sólidas, sem gradientes neon');
  figma.closePlugin('✅ ${stories.length} Stories Premium criados!');
}

createPremiumStories().catch(err => {
  console.error('❌ Erro:', err);
  figma.closePlugin('❌ Erro: ' + err.message);
});`;
}

// ============================================================================
// EXECUTAR
// ============================================================================

async function main() {
  console.log('🎨 FIGMA PREMIUM TEMPLATE GENERATOR\n');
  console.log('='.repeat(60));
  console.log('\nDesign: Minimalista Apple Style');
  console.log('Features: Cores sólidas, layout profissional, muito espaço\n');

  // Ler o último carrossel convertido
  const jsonPath = path.join(__dirname, '../output/stories-2.json');
  const carouselData = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

  console.log(`\n📚 Carrossel: ${carouselData.meta.title}`);
  console.log(`📊 Stories: ${carouselData.stories.length}\n`);

  // Gerar plugin premium
  const pluginCode = await generatePremiumPlugin(carouselData);
  const outputPath = path.join(__dirname, '../output/figma-plugin-PREMIUM.js');
  await fs.writeFile(outputPath, pluginCode, 'utf8');

  console.log('✅ Plugin Premium gerado!\n');
  console.log(`📄 Arquivo: ${outputPath}\n`);
  console.log('='.repeat(60));
  console.log('\n📖 PRÓXIMOS PASSOS:\n');
  console.log('1️⃣  Abrir arquivo:');
  console.log(`   open "${outputPath}"\n`);
  console.log('2️⃣  Copiar TODO o código (Cmd+A, Cmd+C)\n');
  console.log('3️⃣  Colar no Figma Desktop Plugin Development\n');
  console.log('4️⃣  Run → Ver o design PREMIUM!\n');
  console.log('🎨 Design Minimalista Apple');
  console.log('✨ Sem gradientes neon');
  console.log('🏆 Layout profissional\n');
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
