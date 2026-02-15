#!/usr/bin/env node

/**
 * 🧪 TESTE DE DESIGN TEMPLATES
 * Gera exemplos de todos os 5 templates com diferentes presets de cores
 */

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ============================================================================
// PRESETS DE CORES
// ============================================================================

const COLOR_PRESETS = {
  // Dark themes
  "midnight-purple": {
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#f093fb",
    background: "#0f0f23",
    text: "#ffffff",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  "cyber-neon": {
    primary: "#00ff87",
    secondary: "#60efff",
    accent: "#ff71ce",
    background: "#0a0a0a",
    text: "#ffffff",
    gradient: "linear-gradient(135deg, #00ff87 0%, #60efff 100%)",
  },
  "clean-white": {
    primary: "#2d3436",
    secondary: "#636e72",
    accent: "#0984e3",
    background: "#ffffff",
    text: "#2d3436",
    gradient: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  },
  "sunset-vibes": {
    primary: "#ff6b6b",
    secondary: "#feca57",
    accent: "#ff9ff3",
    background: "#2d3436",
    text: "#ffffff",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
  },
};

// ============================================================================
// TEMPLATES HTML
// ============================================================================

function templateModernClean(slide, colors, totalSlides) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    .slide {
      width: 1080px;
      height: 1080px;
      background: ${colors.background};
      font-family: 'Inter', sans-serif;
      color: ${colors.text};
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 100px;
      position: relative;
    }

    .accent-bar {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 200px;
      background: ${colors.gradient || colors.accent};
      border-radius: 0 4px 4px 0;
    }

    .emoji {
      font-size: 64px;
      margin-bottom: 32px;
    }

    .title {
      font-size: 52px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 24px;
      color: ${colors.accent};
    }

    .content {
      font-size: 36px;
      line-height: 1.6;
      font-weight: 400;
      opacity: 0.9;
    }

    .footer {
      position: absolute;
      bottom: 40px;
      left: 100px;
      right: 100px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="accent-bar"></div>

    ${slide.emoji ? `<div class="emoji">${slide.emoji}</div>` : ""}
    ${slide.title ? `<h1 class="title">${slide.title}</h1>` : ""}
    <p class="content">${slide.content}</p>

    <div class="footer">
      <span>@seu_handle</span>
      <span>${slide.slideNumber} / ${totalSlides}</span>
    </div>
  </div>
</body>
</html>`;
}

function templateBoldStatement(slide, colors, totalSlides) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    .slide {
      width: 1080px;
      height: 1080px;
      background: ${colors.background};
      font-family: 'Space Grotesk', sans-serif;
      color: ${colors.text};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 80px;
      position: relative;
      overflow: hidden;
    }

    .bg-circle {
      position: absolute;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      background: ${colors.gradient || colors.primary};
      opacity: 0.1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .content-wrap {
      position: relative;
      z-index: 1;
      max-width: 900px;
    }

    .emoji {
      font-size: 80px;
      margin-bottom: 40px;
    }

    .main-text {
      font-size: 56px;
      font-weight: 700;
      line-height: 1.3;
    }

    .slide-number {
      position: absolute;
      bottom: 40px;
      right: 40px;
      font-size: 72px;
      font-weight: 700;
      opacity: 0.1;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="bg-circle"></div>

    <div class="content-wrap">
      ${slide.emoji ? `<div class="emoji">${slide.emoji}</div>` : ""}
      <h1 class="main-text">${slide.content}</h1>
    </div>

    <div class="slide-number">${String(slide.slideNumber).padStart(2, "0")}</div>
  </div>
</body>
</html>`;
}

function templateCardStyle(slide, colors, totalSlides) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    .slide {
      width: 1080px;
      height: 1080px;
      background: ${colors.background};
      font-family: 'DM Sans', sans-serif;
      color: ${colors.text};
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px;
    }

    .card {
      width: 100%;
      height: 100%;
      background: ${colors.background};
      border-radius: 32px;
      padding: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow:
        0 4px 6px rgba(0,0,0,0.1),
        0 20px 40px rgba(0,0,0,0.2);
      border: 1px solid ${colors.accent}40;
    }

    .emoji {
      font-size: 64px;
      margin-bottom: 32px;
    }

    .title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 24px;
      line-height: 1.2;
      color: ${colors.accent};
    }

    .content {
      font-size: 32px;
      line-height: 1.6;
      opacity: 0.85;
    }

    .slide-num {
      position: absolute;
      top: 100px;
      right: 100px;
      font-size: 16px;
      font-weight: 700;
      color: ${colors.accent};
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="card">
      ${slide.emoji ? `<div class="emoji">${slide.emoji}</div>` : ""}
      ${slide.title ? `<h1 class="title">${slide.title}</h1>` : ""}
      <p class="content">${slide.content}</p>
      <div class="slide-num">${slide.slideNumber}/${totalSlides}</div>
    </div>
  </div>
</body>
</html>`;
}

function templateSplitDesign(slide, colors, totalSlides) {
  const isEven = slide.slideNumber % 2 === 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    .slide {
      width: 1080px;
      height: 1080px;
      font-family: 'Outfit', sans-serif;
      display: flex;
    }

    .left-panel {
      width: 35%;
      background: ${colors.gradient || colors.primary};
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px;
      order: ${isEven ? 2 : 1};
    }

    .right-panel {
      width: 65%;
      background: ${colors.background};
      color: ${colors.text};
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px;
      order: ${isEven ? 1 : 2};
    }

    .big-number {
      font-size: 180px;
      font-weight: 800;
      color: white;
      opacity: 0.9;
      line-height: 1;
    }

    .emoji-big {
      font-size: 120px;
      margin-bottom: 20px;
    }

    .title {
      font-size: 44px;
      font-weight: 800;
      margin-bottom: 24px;
      line-height: 1.2;
    }

    .content {
      font-size: 30px;
      line-height: 1.6;
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="left-panel">
      ${slide.emoji ? `<div class="emoji-big">${slide.emoji}</div>` : ""}
      <div class="big-number">${String(slide.slideNumber).padStart(2, "0")}</div>
    </div>

    <div class="right-panel">
      ${slide.title ? `<h1 class="title">${slide.title}</h1>` : ""}
      <p class="content">${slide.content}</p>
    </div>
  </div>
</body>
</html>`;
}

function templateTwitterStyle(slide, colors, totalSlides) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    .slide {
      width: 1080px;
      height: 1080px;
      background: ${colors.background};
      font-family: 'Inter', sans-serif;
      color: ${colors.text};
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px;
    }

    .tweet-card {
      width: 100%;
      max-width: 860px;
      background: ${colors.background === "#ffffff" ? "#f7f9fa" : colors.secondary + "20"};
      border-radius: 24px;
      padding: 48px;
      border: 1px solid ${colors.accent}20;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 32px;
    }

    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${colors.gradient || colors.accent};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-right: 16px;
    }

    .user-info h3 {
      font-size: 22px;
      font-weight: 700;
    }

    .user-info span {
      font-size: 18px;
      opacity: 0.6;
    }

    .thread-indicator {
      margin-left: auto;
      background: ${colors.accent};
      color: ${colors.background};
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 600;
    }

    .tweet-content {
      font-size: 34px;
      line-height: 1.5;
      margin-bottom: 32px;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="tweet-card">
      <div class="header">
        <div class="avatar">${slide.emoji || "🚀"}</div>
        <div class="user-info">
          <h3>Seu Nome</h3>
          <span>@seu_handle</span>
        </div>
        <div class="thread-indicator">${slide.slideNumber}/${totalSlides}</div>
      </div>

      <div class="tweet-content">
        ${slide.content}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// TEMPLATES MAPPING
// ============================================================================

const TEMPLATES = {
  "modern-clean": templateModernClean,
  "bold-statement": templateBoldStatement,
  "card-style": templateCardStyle,
  "split-design": templateSplitDesign,
  "twitter-style": templateTwitterStyle,
};

// ============================================================================
// DADOS DE TESTE
// ============================================================================

const testSlides = [
  {
    slideNumber: 1,
    emoji: "💰",
    title: "Ganhe R$ 10K/mês",
    content: "Descubra o método exato que usei para sair de R$ 0 para R$ 10.000 por mês em apenas 90 dias.",
  },
  {
    slideNumber: 2,
    emoji: "🎯",
    title: "O Problema",
    content: "A maioria das pessoas falha porque não tem um sistema. Elas dependem de motivação, que é temporária.",
  },
  {
    slideNumber: 3,
    emoji: "✨",
    title: "A Solução",
    content: "Um sistema simples de 3 passos que funciona mesmo sem motivação. Foco em processos, não em sentimentos.",
  },
];

// ============================================================================
// GERADOR DE SCREENSHOTS
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
  console.log('\n🎨 TESTE DE DESIGN TEMPLATES\n');
  console.log('Gerando exemplos de todos os templates...\n');

  const outputDir = './output/template-tests';
  await mkdir(outputDir, { recursive: true });

  let count = 0;

  // Gerar um exemplo de cada template com cada preset de cor
  for (const [templateName, templateFunc] of Object.entries(TEMPLATES)) {
    console.log(`\n📋 Template: ${templateName}`);

    for (const [presetName, colors] of Object.entries(COLOR_PRESETS)) {
      const slide = testSlides[0]; // Usar primeiro slide como exemplo
      const html = templateFunc(slide, colors, 3);

      const filename = `${templateName}--${presetName}.png`;
      const outputPath = join(outputDir, filename);

      console.log(`  ⏳ Gerando: ${filename}`);
      await generateScreenshot(html, outputPath);
      console.log(`  ✅ Salvo: ${outputPath}`);

      count++;
    }
  }

  console.log(`\n✨ CONCLUÍDO!`);
  console.log(`📊 Total: ${count} imagens geradas`);
  console.log(`📁 Pasta: ${outputDir}\n`);
}

main().catch(console.error);
