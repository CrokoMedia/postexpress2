#!/usr/bin/env node

/**
 * 🎨 FIGMA STORIES CREATOR - API Automation
 *
 * Cria automaticamente os 7 Stories de "Inveja e Prosperidade" no Figma
 * usando a Figma REST API.
 *
 * Criado por: Content Creation Squad
 * Mentes: Adriano De Marqui (Design) + Eugene Schwartz (Copy)
 */

const axios = require('axios');

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CONFIG = {
  // IMPORTANTE: Configurar estas variáveis
  FIGMA_TOKEN: process.env.FIGMA_TOKEN || 'SEU_TOKEN_AQUI',
  FILE_KEY: process.env.FIGMA_FILE_KEY || null, // Deixe null para criar novo

  // Specs do projeto
  STORY_WIDTH: 1080,
  STORY_HEIGHT: 1920,
  SAFE_ZONE_TOP: 250,
  SAFE_ZONE_BOTTOM: 250,

  // API Base URL
  API_BASE: 'https://api.figma.com/v1',
};

// ============================================================================
// PALETA DE CORES
// ============================================================================

const COLORS = {
  // Primárias
  azulEscuro: { r: 44/255, g: 62/255, b: 80/255 },      // #2C3E50
  azulMedio: { r: 52/255, g: 73/255, b: 94/255 },       // #34495E

  // Secundárias (Prosperidade)
  verdeProsp: { r: 39/255, g: 174/255, b: 96/255 },     // #27AE60
  verdeClaro: { r: 46/255, g: 204/255, b: 113/255 },    // #2ECC71

  // Alertas
  vermelhoInv: { r: 231/255, g: 76/255, b: 60/255 },    // #E74C3C

  // Acentos
  dourado: { r: 255/255, g: 210/255, b: 63/255 },       // #FFD23F
  azulDest: { r: 52/255, g: 152/255, b: 219/255 },      // #3498DB

  // Base
  preto: { r: 26/255, g: 26/255, b: 26/255 },           // #1A1A1A
  branco: { r: 1, g: 1, b: 1 },                         // #FFFFFF
};

// ============================================================================
// TIPOGRAFIA
// ============================================================================

const FONTS = {
  displayXL: { family: 'Montserrat', style: 'Black', size: 96 },
  displayL: { family: 'Montserrat', style: 'Black', size: 72 },
  displayM: { family: 'Montserrat', style: 'Black', size: 56 },

  titleXL: { family: 'Montserrat', style: 'Bold', size: 52 },
  titleL: { family: 'Montserrat', style: 'Bold', size: 48 },
  titleM: { family: 'Montserrat', style: 'Medium', size: 38 },

  bodyL: { family: 'Montserrat', style: 'Medium', size: 36 },
  bodyM: { family: 'Open Sans', style: 'Regular', size: 32 },
  bodyS: { family: 'Open Sans', style: 'Regular', size: 28 },
  bodyCaption: { family: 'Open Sans', style: 'Regular', size: 24 },

  accentXL: { family: 'Bebas Neue', style: 'Regular', size: 96 },
  accentL: { family: 'Bebas Neue', style: 'Regular', size: 64 },
};

// ============================================================================
// GRADIENTES
// ============================================================================

const GRADIENTS = {
  escuro: {
    type: 'GRADIENT_LINEAR',
    gradientHandlePositions: [
      { x: 0.5, y: 0 },
      { x: 0.5, y: 1 }
    ],
    gradientStops: [
      { position: 0, color: { ...COLORS.preto, a: 1 } },
      { position: 1, color: { ...COLORS.azulEscuro, a: 1 } }
    ]
  },

  transicao: {
    type: 'GRADIENT_LINEAR',
    gradientHandlePositions: [
      { x: 0.5, y: 0 },
      { x: 0.5, y: 1 }
    ],
    gradientStops: [
      { position: 0, color: { ...COLORS.azulMedio, a: 1 } },
      { position: 1, color: { ...COLORS.verdeProsp, a: 1 } }
    ]
  },

  prosperidade: {
    type: 'GRADIENT_LINEAR',
    gradientHandlePositions: [
      { x: 0.5, y: 0 },
      { x: 0.5, y: 1 }
    ],
    gradientStops: [
      { position: 0, color: { ...COLORS.verdeProsp, a: 1 } },
      { position: 1, color: { ...COLORS.verdeClaro, a: 1 } }
    ]
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Cria cliente Axios configurado com token Figma
 */
function createFigmaClient() {
  return axios.create({
    baseURL: CONFIG.API_BASE,
    headers: {
      'X-Figma-Token': CONFIG.FIGMA_TOKEN,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Cria um nó de frame (container)
 */
function createFrame(name, width, height, x = 0, y = 0) {
  return {
    type: 'FRAME',
    name: name,
    width: width,
    height: height,
    x: x,
    y: y,
    clipsContent: false,
    children: []
  };
}

/**
 * Cria um nó de texto
 */
function createText(content, font, color, x, y, width = null) {
  return {
    type: 'TEXT',
    characters: content,
    style: {
      fontFamily: font.family,
      fontWeight: font.style === 'Black' ? 900 : font.style === 'Bold' ? 700 : font.style === 'Medium' ? 500 : 400,
      fontSize: font.size,
      textAlignHorizontal: 'CENTER',
      textAlignVertical: 'TOP',
      letterSpacing: 0,
      lineHeightPx: font.size * 1.2
    },
    fills: [{ type: 'SOLID', color: color }],
    x: x,
    y: y,
    width: width || CONFIG.STORY_WIDTH - 120,
    height: 'AUTO'
  };
}

/**
 * Cria um retângulo com fill (sólido ou gradiente)
 */
function createRectangle(width, height, fill, x = 0, y = 0) {
  return {
    type: 'RECTANGLE',
    width: width,
    height: height,
    x: x,
    y: y,
    fills: [fill]
  };
}

// ============================================================================
// STORY CREATORS
// ============================================================================

/**
 * STORY 01 - HOOK
 */
function createStory01() {
  const frame = createFrame('Story 01', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Background
  frame.children.push(
    createRectangle(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT, GRADIENTS.escuro)
  );

  // Emoji
  frame.children.push(
    createText('😒', { ...FONTS.displayXL, size: 120 }, COLORS.branco, 540, 500)
  );

  // Texto "VOCÊ SENTE"
  frame.children.push(
    createText('VOCÊ SENTE', FONTS.titleL, COLORS.branco, 60, 680, 960)
  );

  // Texto "INVEJA?" (vermelho)
  frame.children.push(
    createText('INVEJA?', FONTS.displayL, COLORS.vermelhoInv, 60, 760, 960)
  );

  // Subtexto
  frame.children.push(
    createText('(seja honesto)', FONTS.bodyS, { ...COLORS.branco, a: 0.6 }, 60, 880, 960)
  );

  return frame;
}

/**
 * STORY 02 - NORMALIZAÇÃO
 */
function createStory02() {
  const frame = createFrame('Story 02', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Background (gradiente modificado)
  const bgGradient = {
    ...GRADIENTS.escuro,
    gradientStops: [
      { position: 0, color: { ...COLORS.azulEscuro, a: 1 } },
      { position: 1, color: { ...COLORS.azulMedio, a: 1 } }
    ]
  };
  frame.children.push(
    createRectangle(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT, bgGradient)
  );

  // Emoji + 90%
  frame.children.push(
    createText('👥 90%', FONTS.accentXL, COLORS.azulDest, 60, 600, 960)
  );

  // "das pessoas sentem inveja"
  frame.children.push(
    createText('das pessoas\nsentem inveja', FONTS.bodyL, COLORS.branco, 60, 780, 960)
  );

  // "Você não está sozinho"
  frame.children.push(
    createText('Você não está\nsozinho', FONTS.bodyM, COLORS.branco, 60, 980, 960)
  );

  return frame;
}

/**
 * STORY 03 - PROBLEMA
 */
function createStory03() {
  const frame = createFrame('Story 03', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Background sólido
  frame.children.push(
    createRectangle(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT,
      { type: 'SOLID', color: COLORS.azulEscuro })
  );

  // "MAS..."
  const masText = createText('MAS...', FONTS.displayM, COLORS.vermelhoInv, 80, 550, 920);
  masText.style.textAlignHorizontal = 'LEFT';
  frame.children.push(masText);

  // Lista de problemas
  const problemas = [
    '❌ Te paralisa',
    '❌ Te frustra',
    '❌ Te consome'
  ];

  problemas.forEach((texto, i) => {
    const item = createText(texto, FONTS.bodyL, COLORS.branco, 80, 720 + (i * 80), 920);
    item.style.textAlignHorizontal = 'LEFT';
    frame.children.push(item);
  });

  // Footer
  frame.children.push(
    createText('Inveja mal\ndirecionada',
      { ...FONTS.bodyM, style: 'Italic' },
      { ...COLORS.branco, a: 0.7 },
      60, 1050, 960
    )
  );

  return frame;
}

/**
 * STORY 04 - REFRAME (MAIS IMPORTANTE!)
 */
function createStory04() {
  const frame = createFrame('Story 04', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Background gradiente transição
  frame.children.push(
    createRectangle(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT, GRADIENTS.transicao)
  );

  // "INVEJA" (ainda vermelho)
  frame.children.push(
    createText('INVEJA', FONTS.titleXL, COLORS.vermelhoInv, 60, 580, 960)
  );

  // Seta
  frame.children.push(
    createText('↓', FONTS.displayXL, COLORS.dourado, 60, 680, 960)
  );

  // "É UM MAPA" (DESTAQUE DOURADO)
  frame.children.push(
    createText('É UM MAPA', FONTS.displayM, COLORS.dourado, 60, 780, 960)
  );

  // Subtexto
  frame.children.push(
    createText('Do que você\nrealmente quer', FONTS.bodyM, COLORS.branco, 60, 920, 960)
  );

  return frame;
}

/**
 * STORY 05 - MÉTODO
 */
function createStory05() {
  const frame = createFrame('Story 05', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Background verde prosperidade
  frame.children.push(
    createRectangle(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT, GRADIENTS.prosperidade)
  );

  // "MÉTODO:"
  const metodoText = createText('MÉTODO:', FONTS.titleL, COLORS.branco, 100, 500, 880);
  metodoText.style.textAlignHorizontal = 'LEFT';
  frame.children.push(metodoText);

  // Passo 1
  const passo1 = createText('1️⃣ Identifica', FONTS.titleM, COLORS.branco, 100, 680, 880);
  passo1.style.textAlignHorizontal = 'LEFT';
  frame.children.push(passo1);

  const desc1 = createText('(quem te causa inveja?)', FONTS.bodyCaption,
    { ...COLORS.branco, a: 0.8 }, 160, 740, 820);
  desc1.style.textAlignHorizontal = 'LEFT';
  frame.children.push(desc1);

  // Passo 2
  const passo2 = createText('2️⃣ Decifra', FONTS.titleM, COLORS.branco, 100, 840, 880);
  passo2.style.textAlignHorizontal = 'LEFT';
  frame.children.push(passo2);

  const desc2 = createText('(o que eles têm?)', FONTS.bodyCaption,
    { ...COLORS.branco, a: 0.8 }, 160, 900, 820);
  desc2.style.textAlignHorizontal = 'LEFT';
  frame.children.push(desc2);

  // Passo 3
  const passo3 = createText('3️⃣ Age', FONTS.titleM, COLORS.branco, 100, 1000, 880);
  passo3.style.textAlignHorizontal = 'LEFT';
  frame.children.push(passo3);

  const desc3 = createText('(construa sua versão)', FONTS.bodyCaption,
    { ...COLORS.branco, a: 0.8 }, 160, 1060, 820);
  desc3.style.textAlignHorizontal = 'LEFT';
  frame.children.push(desc3);

  // Footer
  frame.children.push(
    createText('Inveja → Ação', FONTS.titleM, COLORS.dourado, 60, 1200, 960)
  );

  return frame;
}

/**
 * STORY 06 - EXEMPLO (SPLIT)
 */
function createStory06() {
  const frame = createFrame('Story 06', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Lado esquerdo (vermelho - ANTES)
  frame.children.push(
    createRectangle(540, CONFIG.STORY_HEIGHT,
      { type: 'SOLID', color: COLORS.vermelhoInv }, 0, 0)
  );

  // Lado direito (verde - DEPOIS)
  frame.children.push(
    createRectangle(540, CONFIG.STORY_HEIGHT,
      { type: 'SOLID', color: COLORS.verdeProsp }, 540, 0)
  );

  // Headers
  const antesText = createText('ANTES', { ...FONTS.accentL, size: 40 }, COLORS.branco, 120, 400, 300);
  antesText.style.textAlignHorizontal = 'CENTER';
  frame.children.push(antesText);

  const depoisText = createText('DEPOIS', { ...FONTS.accentL, size: 40 }, COLORS.branco, 660, 400, 300);
  depoisText.style.textAlignHorizontal = 'CENTER';
  frame.children.push(depoisText);

  // Frases
  const fraseAntes = createText('"Fulano\ntem tudo"', FONTS.bodyM, COLORS.branco, 120, 650, 300);
  fraseAntes.style.textAlignHorizontal = 'CENTER';
  frame.children.push(fraseAntes);

  const fraseDepois = createText('"Vou criar\no meu"', FONTS.bodyM, COLORS.branco, 660, 650, 300);
  fraseDepois.style.textAlignHorizontal = 'CENTER';
  frame.children.push(fraseDepois);

  // Palavras finais
  const invejaText = createText('Inveja', FONTS.titleM, COLORS.branco, 120, 1000, 300);
  invejaText.style.textAlignHorizontal = 'CENTER';
  frame.children.push(invejaText);

  const prospText = createText('Prosperi\ndade', FONTS.titleM, COLORS.branco, 660, 1000, 300);
  prospText.style.textAlignHorizontal = 'CENTER';
  frame.children.push(prospText);

  return frame;
}

/**
 * STORY 07 - CTA
 */
function createStory07() {
  const frame = createFrame('Story 07', CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT);

  // Background verde
  frame.children.push(
    createRectangle(CONFIG.STORY_WIDTH, CONFIG.STORY_HEIGHT, GRADIENTS.prosperidade)
  );

  // Texto principal
  frame.children.push(
    createText('DE INVEJA\nPARA\nPROSPERIDADE', FONTS.titleL, COLORS.branco, 60, 500, 960)
  );

  // CTA
  frame.children.push(
    createText('▶ Começa HOJE', FONTS.accentL, COLORS.dourado, 60, 750, 960)
  );

  // Enquete (placeholder)
  frame.children.push(
    createText('[Enquete Interativa]\nVocê vai transformar\nsua inveja em ação?',
      FONTS.bodyS,
      { ...COLORS.branco, a: 0.6 },
      60, 950, 960
    )
  );

  return frame;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Cria todos os 7 stories e retorna array
 */
function createAllStories() {
  console.log('📱 Criando 7 stories...\n');

  const stories = [
    createStory01(),
    createStory02(),
    createStory03(),
    createStory04(),
    createStory05(),
    createStory06(),
    createStory07()
  ];

  // Posicionar stories lado a lado
  stories.forEach((story, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    story.x = col * (CONFIG.STORY_WIDTH + 100);
    story.y = row * (CONFIG.STORY_HEIGHT + 100);

    console.log(`✅ Story ${index + 1}: ${story.name}`);
  });

  console.log('');
  return stories;
}

/**
 * Cria arquivo no Figma via API
 */
async function createFigmaFile(client, stories) {
  console.log('🎨 Criando arquivo no Figma...\n');

  // NOTA: A Figma API não suporta criação direta de arquivos com nós
  // Precisamos usar o Figma Plugin API ou criar manualmente e depois modificar

  console.log('⚠️  LIMITAÇÃO DA API:\n');
  console.log('A Figma REST API não permite criar arquivos do zero com nós.');
  console.log('Você tem 2 opções:\n');
  console.log('OPÇÃO 1 (Recomendado): Usar Figma Plugin');
  console.log('OPÇÃO 2: Criar arquivo manualmente e usar este script para modificar\n');

  return null;
}

/**
 * Exporta stories do Figma
 */
async function exportStories(client, fileKey, nodeIds) {
  console.log('📥 Exportando stories como PNG...\n');

  try {
    const response = await client.get(`/images/${fileKey}`, {
      params: {
        ids: nodeIds.join(','),
        format: 'png',
        scale: 2
      }
    });

    console.log('✅ URLs de export geradas:\n');
    Object.entries(response.data.images).forEach(([id, url], index) => {
      console.log(`Story ${index + 1}: ${url}`);
    });

    return response.data.images;
  } catch (error) {
    console.error('❌ Erro ao exportar:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Salva estrutura JSON dos stories
 */
function saveStoriesJSON(stories) {
  const fs = require('fs');
  const path = require('path');

  const outputPath = path.join(__dirname, '../output/figma-stories-structure.json');

  const structure = {
    meta: {
      project: 'Stories - Inveja e Prosperidade',
      created: new Date().toISOString(),
      totalStories: stories.length,
      dimensions: {
        width: CONFIG.STORY_WIDTH,
        height: CONFIG.STORY_HEIGHT
      }
    },
    colors: COLORS,
    fonts: FONTS,
    gradients: GRADIENTS,
    stories: stories
  };

  fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
  console.log(`💾 Estrutura JSON salva em: ${outputPath}\n`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 FIGMA STORIES CREATOR - Inveja e Prosperidade\n');
  console.log('=' .repeat(60));
  console.log('');

  // Validar token
  if (CONFIG.FIGMA_TOKEN === 'SEU_TOKEN_AQUI') {
    console.log('❌ ERRO: Token do Figma não configurado!\n');
    console.log('Configure o token de uma das formas:\n');
    console.log('1. Variável de ambiente:');
    console.log('   export FIGMA_TOKEN="seu_token_aqui"\n');
    console.log('2. Editar CONFIG.FIGMA_TOKEN no script\n');
    console.log('Como obter token:');
    console.log('   1. Acesse: https://www.figma.com/settings');
    console.log('   2. Vá em "Personal Access Tokens"');
    console.log('   3. Clique em "Generate new token"');
    console.log('   4. Copie o token gerado\n');
    process.exit(1);
  }

  // Criar cliente
  const client = createFigmaClient();

  // Criar stories
  const stories = createAllStories();

  // Salvar JSON (útil para plugin)
  saveStoriesJSON(stories);

  console.log('📊 PRÓXIMOS PASSOS:\n');
  console.log('Este script gerou a estrutura JSON completa dos 7 stories.');
  console.log('Para criar no Figma, você tem 3 opções:\n');

  console.log('OPÇÃO 1 - Figma Plugin (Recomendado):');
  console.log('  1. Criar plugin Figma que lê figma-stories-structure.json');
  console.log('  2. Plugin cria os nós automaticamente');
  console.log('  3. Rodamos o plugin no Figma\n');

  console.log('OPÇÃO 2 - Manual com JSON de Referência:');
  console.log('  1. Abrir Figma manualmente');
  console.log('  2. Seguir guia FIGMA-GUIDE-inveja-prosperidade.md');
  console.log('  3. Usar figma-stories-structure.json como referência exata\n');

  console.log('OPÇÃO 3 - Modificar Arquivo Existente:');
  console.log('  1. Criar arquivo vazio no Figma');
  console.log('  2. Copiar File Key da URL');
  console.log('  3. Rodar script novamente com FILE_KEY configurado\n');

  console.log('=' .repeat(60));
  console.log('\n✨ Script concluído com sucesso!\n');
}

// Rodar
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = {
  createAllStories,
  COLORS,
  FONTS,
  GRADIENTS,
  CONFIG
};
