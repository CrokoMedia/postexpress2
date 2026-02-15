/**
 * 🔌 FIGMA PLUGIN - Stories Creator
 *
 * Plugin Figma que cria os 7 Stories automaticamente
 * Rode este código no Figma Desktop App
 *
 * COMO USAR:
 * 1. Abrir Figma Desktop
 * 2. Plugins → Development → New Plugin
 * 3. Colar este código
 * 4. Run
 */

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CONFIG = {
  STORY_WIDTH: 1080,
  STORY_HEIGHT: 1920,
  SPACING: 100,
};

// Cores em formato Figma
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Cria um frame
 */
function createFrame(name, x, y) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  frame.x = x;
  frame.y = y;
  frame.clipsContent = false;
  return frame;
}

/**
 * Cria gradiente linear
 */
function createGradient(color1, color2) {
  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [
      [0, 1, 0],
      [-1, 0, 1]
    ],
    gradientStops: [
      { position: 0, color: { ...color1, a: 1 } },
      { position: 1, color: { ...color2, a: 1 } }
    ]
  };
}

/**
 * Cria texto
 */
async function createText(content, fontSize, fontWeight, color, x, y, width, align = 'CENTER') {
  const text = figma.createText();

  // Carregar fonte
  await figma.loadFontAsync({ family: "Montserrat", style: fontWeight });

  text.characters = content;
  text.fontSize = fontSize;
  text.fontName = { family: "Montserrat", style: fontWeight };
  text.fills = [{ type: 'SOLID', color: color }];
  text.textAlignHorizontal = align;
  text.x = x;
  text.y = y;
  text.resize(width, text.height);

  return text;
}

// ============================================================================
// STORY CREATORS
// ============================================================================

/**
 * Story 01 - Hook
 */
async function createStory01(x, y) {
  const frame = createFrame('Story 01 - Hook', x, y);

  // Background gradiente
  const bg = figma.createRectangle();
  bg.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  bg.fills = [createGradient(COLORS.preto, COLORS.azulEscuro)];
  frame.appendChild(bg);

  // Emoji
  const emoji = await createText('😒', 120, 'Black', COLORS.branco, 60, 500, 960);
  frame.appendChild(emoji);

  // "VOCÊ SENTE"
  const titulo1 = await createText('VOCÊ SENTE', 48, 'Bold', COLORS.branco, 60, 680, 960);
  frame.appendChild(titulo1);

  // "INVEJA?"
  const titulo2 = await createText('INVEJA?', 72, 'Black', COLORS.vermelhoInv, 60, 760, 960);
  frame.appendChild(titulo2);

  // Subtexto
  const sub = await createText('(seja honesto)', 28, 'Regular', { ...COLORS.branco, a: 0.6 }, 60, 880, 960);
  frame.appendChild(sub);

  return frame;
}

/**
 * Story 02 - Normalização
 */
async function createStory02(x, y) {
  const frame = createFrame('Story 02 - Normalização', x, y);

  // Background
  const bg = figma.createRectangle();
  bg.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  bg.fills = [createGradient(COLORS.azulEscuro, COLORS.azulMedio)];
  frame.appendChild(bg);

  // "👥 90%"
  const stat = await createText('👥 90%', 96, 'Black', COLORS.azulDest, 60, 600, 960);
  frame.appendChild(stat);

  // Texto principal
  const texto = await createText('das pessoas\nsentem inveja', 36, 'Medium', COLORS.branco, 60, 780, 960);
  frame.appendChild(texto);

  // "Você não está sozinho"
  const footer = await createText('Você não está\nsozinho', 32, 'Regular', COLORS.branco, 60, 980, 960);
  frame.appendChild(footer);

  return frame;
}

/**
 * Story 03 - Problema
 */
async function createStory03(x, y) {
  const frame = createFrame('Story 03 - Problema', x, y);

  // Background sólido
  const bg = figma.createRectangle();
  bg.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  bg.fills = [{ type: 'SOLID', color: COLORS.azulEscuro }];
  frame.appendChild(bg);

  // "MAS..."
  const header = await createText('MAS...', 56, 'Black', COLORS.vermelhoInv, 80, 550, 920, 'LEFT');
  frame.appendChild(header);

  // Lista
  const problemas = [
    '❌ Te paralisa',
    '❌ Te frustra',
    '❌ Te consome'
  ];

  for (let i = 0; i < problemas.length; i++) {
    const item = await createText(problemas[i], 36, 'Medium', COLORS.branco, 80, 720 + (i * 80), 920, 'LEFT');
    frame.appendChild(item);
  }

  // Footer
  const footer = await createText('Inveja mal\ndirecionada', 32, 'Italic', { ...COLORS.branco, a: 0.7 }, 60, 1050, 960);
  frame.appendChild(footer);

  return frame;
}

/**
 * Story 04 - Reframe (MOMENTO CHAVE!)
 */
async function createStory04(x, y) {
  const frame = createFrame('Story 04 - Reframe ⭐', x, y);

  // Background gradiente transição
  const bg = figma.createRectangle();
  bg.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  bg.fills = [createGradient(COLORS.azulMedio, COLORS.verdeProsp)];
  frame.appendChild(bg);

  // "INVEJA"
  const inveja = await createText('INVEJA', 52, 'Bold', COLORS.vermelhoInv, 60, 580, 960);
  frame.appendChild(inveja);

  // Seta
  const seta = await createText('↓', 96, 'Black', COLORS.dourado, 60, 680, 960);
  frame.appendChild(seta);

  // "É UM MAPA" (DESTAQUE!)
  const mapa = await createText('É UM MAPA', 56, 'Black', COLORS.dourado, 60, 780, 960);
  frame.appendChild(mapa);

  // Subtexto
  const sub = await createText('Do que você\nrealmente quer', 32, 'Regular', COLORS.branco, 60, 920, 960);
  frame.appendChild(sub);

  return frame;
}

/**
 * Story 05 - Método
 */
async function createStory05(x, y) {
  const frame = createFrame('Story 05 - Método', x, y);

  // Background verde
  const bg = figma.createRectangle();
  bg.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  bg.fills = [createGradient(COLORS.verdeProsp, COLORS.verdeClaro)];
  frame.appendChild(bg);

  // "MÉTODO:"
  const header = await createText('MÉTODO:', 48, 'Bold', COLORS.branco, 100, 500, 880, 'LEFT');
  frame.appendChild(header);

  // Passo 1
  const p1 = await createText('1️⃣ Identifica', 38, 'Bold', COLORS.branco, 100, 680, 880, 'LEFT');
  frame.appendChild(p1);
  const d1 = await createText('(quem te causa inveja?)', 24, 'Regular', { ...COLORS.branco, a: 0.8 }, 160, 740, 820, 'LEFT');
  frame.appendChild(d1);

  // Passo 2
  const p2 = await createText('2️⃣ Decifra', 38, 'Bold', COLORS.branco, 100, 840, 880, 'LEFT');
  frame.appendChild(p2);
  const d2 = await createText('(o que eles têm?)', 24, 'Regular', { ...COLORS.branco, a: 0.8 }, 160, 900, 820, 'LEFT');
  frame.appendChild(d2);

  // Passo 3
  const p3 = await createText('3️⃣ Age', 38, 'Bold', COLORS.branco, 100, 1000, 880, 'LEFT');
  frame.appendChild(p3);
  const d3 = await createText('(construa sua versão)', 24, 'Regular', { ...COLORS.branco, a: 0.8 }, 160, 1060, 820, 'LEFT');
  frame.appendChild(d3);

  // Footer
  const footer = await createText('Inveja → Ação', 32, 'Medium', COLORS.dourado, 60, 1200, 960);
  frame.appendChild(footer);

  return frame;
}

/**
 * Story 06 - Exemplo (Split)
 */
async function createStory06(x, y) {
  const frame = createFrame('Story 06 - Exemplo', x, y);

  // Lado esquerdo (vermelho)
  const bgLeft = figma.createRectangle();
  bgLeft.resize(540, CONFIG.STORY_HEIGHT);
  bgLeft.x = 0;
  bgLeft.fills = [{ type: 'SOLID', color: COLORS.vermelhoInv }];
  frame.appendChild(bgLeft);

  // Lado direito (verde)
  const bgRight = figma.createRectangle();
  bgRight.resize(540, CONFIG.STORY_HEIGHT);
  bgRight.x = 540;
  bgRight.fills = [{ type: 'SOLID', color: COLORS.verdeProsp }];
  frame.appendChild(bgRight);

  // Headers
  await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" });

  const antes = figma.createText();
  antes.characters = 'ANTES';
  antes.fontSize = 40;
  antes.fontName = { family: "Bebas Neue", style: "Regular" };
  antes.fills = [{ type: 'SOLID', color: COLORS.branco }];
  antes.textAlignHorizontal = 'CENTER';
  antes.x = 120;
  antes.y = 400;
  antes.resize(300, antes.height);
  frame.appendChild(antes);

  const depois = figma.createText();
  depois.characters = 'DEPOIS';
  depois.fontSize = 40;
  depois.fontName = { family: "Bebas Neue", style: "Regular" };
  depois.fills = [{ type: 'SOLID', color: COLORS.branco }];
  depois.textAlignHorizontal = 'CENTER';
  depois.x = 660;
  depois.y = 400;
  depois.resize(300, depois.height);
  frame.appendChild(depois);

  // Frases
  const fraseAntes = await createText('"Fulano\ntem tudo"', 32, 'Medium', COLORS.branco, 120, 650, 300);
  frame.appendChild(fraseAntes);

  const fraseDepois = await createText('"Vou criar\no meu"', 32, 'Medium', COLORS.branco, 660, 650, 300);
  frame.appendChild(fraseDepois);

  // Palavras finais
  const inveja = await createText('Inveja', 36, 'Black', COLORS.branco, 120, 1000, 300);
  frame.appendChild(inveja);

  const prosp = await createText('Prosperi\ndade', 36, 'Black', COLORS.branco, 660, 1000, 300);
  frame.appendChild(prosp);

  return frame;
}

/**
 * Story 07 - CTA
 */
async function createStory07(x, y) {
  const frame = createFrame('Story 07 - CTA', x, y);

  // Background verde
  const bg = figma.createRectangle();
  bg.resize(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);
  bg.fills = [createGradient(COLORS.verdeProsp, COLORS.verdeClaro)];
  frame.appendChild(bg);

  // Texto principal
  const titulo = await createText('DE INVEJA\nPARA\nPROSPERIDADE', 48, 'Black', COLORS.branco, 60, 500, 960);
  frame.appendChild(titulo);

  // CTA
  await figma.loadFontAsync({ family: "Bebas Neue", style: "Regular" });
  const cta = figma.createText();
  cta.characters = '▶ Começa HOJE';
  cta.fontSize = 64;
  cta.fontName = { family: "Bebas Neue", style: "Regular" };
  cta.fills = [{ type: 'SOLID', color: COLORS.dourado }];
  cta.textAlignHorizontal = 'CENTER';
  cta.x = 60;
  cta.y = 750;
  cta.resize(960, cta.height);
  frame.appendChild(cta);

  // Enquete placeholder
  const enquete = await createText('[Enquete Interativa]\nVocê vai transformar\nsua inveja em ação?', 28, 'Regular', { ...COLORS.branco, a: 0.6 }, 60, 950, 960);
  frame.appendChild(enquete);

  return frame;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🎨 Criando 7 Stories no Figma...');

  const stories = [];
  const positions = [
    { x: 0, y: 0 },
    { x: CONFIG.STORY_WIDTH + CONFIG.SPACING, y: 0 },
    { x: (CONFIG.STORY_WIDTH + CONFIG.SPACING) * 2, y: 0 },
    { x: (CONFIG.STORY_WIDTH + CONFIG.SPACING) * 3, y: 0 },
    { x: 0, y: CONFIG.STORY_HEIGHT + CONFIG.SPACING },
    { x: CONFIG.STORY_WIDTH + CONFIG.SPACING, y: CONFIG.STORY_HEIGHT + CONFIG.SPACING },
    { x: (CONFIG.STORY_WIDTH + CONFIG.SPACING) * 2, y: CONFIG.STORY_HEIGHT + CONFIG.SPACING },
  ];

  // Criar cada story
  stories.push(await createStory01(positions[0].x, positions[0].y));
  stories.push(await createStory02(positions[1].x, positions[1].y));
  stories.push(await createStory03(positions[2].x, positions[2].y));
  stories.push(await createStory04(positions[3].x, positions[3].y));
  stories.push(await createStory05(positions[4].x, positions[4].y));
  stories.push(await createStory06(positions[5].x, positions[5].y));
  stories.push(await createStory07(positions[6].x, positions[6].y));

  // Adicionar ao canvas
  for (const story of stories) {
    figma.currentPage.appendChild(story);
  }

  // Zoom para ver tudo
  figma.viewport.scrollAndZoomIntoView(stories);

  // Mensagem de sucesso
  figma.notify('✅ 7 Stories criadas com sucesso! 🎉');

  console.log('✅ Concluído!');
}

// Rodar o plugin
main();

// Plugin deve fechar automaticamente quando terminar
// Caso queira manter aberto para inspeção, comente a linha abaixo
// figma.closePlugin();
