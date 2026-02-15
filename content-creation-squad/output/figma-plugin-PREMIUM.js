// ==================================================================
// 🎨 FIGMA PLUGIN PREMIUM - "2: Como estruturei meu sistema de vendas que gera 7 dígitos"
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

const STORIES = [
  {
    "id": 1,
    "title": "DE R$ 30K/MÊS PARA R$ 1,2 MILHÃO/ANO",
    "subtitle": "O sistema exato que me fez escalar (e pode funcionar pra você)",
    "text": "",
    "background": "gradient-escuro",
    "accentColor": "#3498DB"
  },
  {
    "id": 2,
    "title": "1. PAREI DE VENDER PARA TODO MUNDO",
    "text": "Defini meu ICP com precisão cirúrgica. 3 critérios não-negociáveis que eliminam 80% dos leads ruins.",
    "background": "gradient-escuro",
    "accentColor": "#E74C3C"
  },
  {
    "id": 3,
    "title": "2. CRIEI UM FUNIL PREVISÍVEL",
    "text": "Cada etapa com métrica clara. Se não posso medir, não posso melhorar. Simples assim.",
    "background": "gradient-transicao",
    "accentColor": "#FFD23F"
  },
  {
    "id": 4,
    "title": "4. SCRIPT QUE NÃO PARECE SCRIPT",
    "text": "Framework de perguntas que revela dor real. O cliente vende pra ele mesmo. Minha taxa de fechamento: 64%.",
    "background": "gradient-prosperidade",
    "accentColor": "#2ECC71"
  },
  {
    "id": 5,
    "title": "6. PROPOSTA QUE FECHA SOZINHA",
    "text": "Estrutura em 5 blocos. ROI na primeira página. Elimina 90% das objeções antes da apresentação.",
    "background": "gradient-prosperidade",
    "accentColor": "#2ECC71"
  },
  {
    "id": 6,
    "title": "7. TIME TREINADO SEMANALMENTE",
    "text": "Roleplays, análise de calls, feedback constante. Venda é habilidade, não talento. Treino = resultado.",
    "background": "gradient-prosperidade",
    "accentColor": "#2ECC71"
  },
  {
    "id": 7,
    "title": "ESSE SISTEMA LEVOU 3 ANOS PRA REFINAR",
    "text": "Mas você pode implementar em 90 dias",
    "cta": "SALVE ESTE POST",
    "background": "gradient-prosperidade",
    "accentColor": "#FFD23F"
  }
];

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
  console.log('🎨 Criando 7 Stories Premium...');

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
    frame.name = `Story ${String(story.id).padStart(2, '0')} - Premium`;
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
      badgeText.characters = `STORY ${story.id}`;
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

    console.log(`✅ Story ${story.id} - Layout: ${layout.type}`);
  }

  console.log('🎉 7 Stories Premium criados!');
  console.log('🎨 Design: Minimalista Apple Style');
  console.log('✨ Cores sólidas, sem gradientes neon');
  figma.closePlugin('✅ 7 Stories Premium criados!');
}

createPremiumStories().catch(err => {
  console.error('❌ Erro:', err);
  figma.closePlugin('❌ Erro: ' + err.message);
});