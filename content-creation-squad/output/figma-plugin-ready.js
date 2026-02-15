// ==================================================================
// 🎨 FIGMA PLUGIN - Stories "Inveja e Prosperidade"
// ==================================================================
// INSTRUÇÕES:
// 1. Abra o Figma Desktop App
// 2. Menu → Plugins → Development → New Plugin
// 3. Cole ESTE código completo
// 4. Run
// ==================================================================

const STORIES = [
  {
    "id": 1,
    "title": "INVEJA",
    "subtitle": "E PROSPERIDADE",
    "text": "O que você precisa saber",
    "background": "gradient-escuro",
    "accentColor": "#E74C3C"
  },
  {
    "id": 2,
    "title": "ELES NORMALIZAM",
    "text": "a sua inveja.\n\nFazem você acreditar\nque é natural.",
    "background": "gradient-escuro",
    "accentColor": "#3498DB"
  },
  {
    "id": 3,
    "title": "O PROBLEMA",
    "text": "Inveja bloqueia\nsua prosperidade.\n\nEnquanto você foca\nno que o outro tem,\nnão constrói o SEU.",
    "background": "gradient-escuro",
    "accentColor": "#E74C3C"
  },
  {
    "id": 4,
    "title": "REFRAME",
    "subtitle": "⭐ MOMENTO CHAVE",
    "text": "Transforme inveja\nem INSPIRAÇÃO.\n\n\"Se ele conseguiu,\neu também consigo\"",
    "background": "gradient-transicao",
    "accentColor": "#FFD23F"
  },
  {
    "id": 5,
    "title": "O MÉTODO",
    "text": "1. Reconheça a inveja\n2. Agradeça o exemplo\n3. Trace SEU caminho\n4. Foque na SUA jornada",
    "background": "gradient-prosperidade",
    "accentColor": "#2ECC71"
  },
  {
    "id": 6,
    "title": "EXEMPLO",
    "text": "Pessoa próspera vê\nalguém bem-sucedido:\n\n\"Que inspirador!\nVou aprender com ele\"",
    "background": "gradient-prosperidade",
    "accentColor": "#2ECC71"
  },
  {
    "id": 7,
    "title": "COMECE HOJE",
    "text": "Inveja → Inspiração\nComparação → Criação\nRessntimento → Realização",
    "cta": "SALVE ESTE POST",
    "background": "gradient-prosperidade",
    "accentColor": "#FFD23F"
  }
];

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
  console.log('🎨 Criando 7 Stories...');

  // Carregar fontes necessárias
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const STORY_WIDTH = 1080;
  const STORY_HEIGHT = 1920;
  const SPACING = 100;

  for (let i = 0; i < STORIES.length; i++) {
    const story = STORIES[i];
    const x = i * (STORY_WIDTH + SPACING);

    // Criar frame
    const frame = figma.createFrame();
    frame.name = `Story ${String(story.id).padStart(2, '0')}`;
    frame.resize(STORY_WIDTH, STORY_HEIGHT);
    frame.x = x;
    frame.y = 0;

    // Background com gradiente
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

    // Título
    if (story.title) {
      const title = figma.createText();
      title.fontName = { family: "Inter", style: "Bold" };
      title.fontSize = 72;
      title.characters = story.title;
      title.fills = [{ type: 'SOLID', color: COLORS.branco }];
      title.textAlignHorizontal = 'CENTER';
      title.resize(900, title.height);
      title.x = 90;
      title.y = currentY;
      frame.appendChild(title);
      currentY += title.height + 40;
    }

    // Subtítulo
    if (story.subtitle) {
      const subtitle = figma.createText();
      subtitle.fontName = { family: "Inter", style: "Medium" };
      subtitle.fontSize = 38;
      subtitle.characters = story.subtitle;
      subtitle.fills = [{ type: 'SOLID', color: COLORS.dourado }];
      subtitle.textAlignHorizontal = 'CENTER';
      subtitle.resize(900, subtitle.height);
      subtitle.x = 90;
      subtitle.y = currentY;
      frame.appendChild(subtitle);
      currentY += subtitle.height + 80;
    }

    // Texto principal
    if (story.text) {
      const text = figma.createText();
      text.fontName = { family: "Inter", style: "Regular" };
      text.fontSize = 36;
      text.characters = story.text;
      text.fills = [{ type: 'SOLID', color: COLORS.branco }];
      text.textAlignHorizontal = 'CENTER';
      text.lineHeight = { value: 140, unit: 'PERCENT' };
      text.resize(900, text.height);
      text.x = 90;
      text.y = currentY;
      frame.appendChild(text);
      currentY += text.height + 60;
    }

    // CTA
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

    console.log(`✅ Story ${story.id} criado`);
  }

  console.log('🎉 Todos os 7 Stories foram criados!');
  figma.closePlugin('✅ 7 Stories criados com sucesso!');
}

createStories().catch(err => {
  console.error('❌ Erro:', err);
  figma.closePlugin('❌ Erro: ' + err.message);
});