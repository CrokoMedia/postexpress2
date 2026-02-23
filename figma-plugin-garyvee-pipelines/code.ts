// GaryVee Integration Pipelines - Figma Plugin
// Visualiza os 4 pipelines de integração do Gary Vaynerchuk no Croko Lab

figma.showUI(__html__, { width: 380, height: 520 });

// Cores do design system Croko Lab
const COLORS = {
  primary: { r: 0.4, g: 0.29, b: 0.78 }, // Purple
  success: { r: 0.22, g: 0.73, b: 0.56 }, // Green
  warning: { r: 0.95, g: 0.62, b: 0.11 }, // Amber
  error: { r: 0.94, g: 0.33, b: 0.31 }, // Red
  gary: { r: 1, g: 0.4, b: 0.2 }, // Gary Orange
  bg: { r: 0.96, g: 0.96, b: 0.98 }, // Light gray
  text: { r: 0.1, g: 0.1, b: 0.12 }, // Dark
  border: { r: 0.88, g: 0.88, b: 0.9 } // Border
};

interface StepConfig {
  label: string;
  description: string;
  color: RGB;
  icon?: string;
}

interface PipelineConfig {
  title: string;
  subtitle: string;
  steps: StepConfig[];
  pros: string[];
  contras: string[];
  color: RGB;
}

// Criar um step (card) no pipeline
function createStep(step: StepConfig, x: number, y: number, width: number = 280): FrameNode {
  const frame = figma.createFrame();
  frame.name = step.label;
  frame.x = x;
  frame.y = y;
  frame.resize(width, 120);
  frame.cornerRadius = 12;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.08 },
    offset: { x: 0, y: 2 },
    radius: 8,
    visible: true,
    blendMode: 'NORMAL'
  }];
  frame.strokes = [{ type: 'SOLID', color: step.color }];
  frame.strokeWeight = 2;
  frame.paddingTop = 16;
  frame.paddingBottom = 16;
  frame.paddingLeft = 16;
  frame.paddingRight = 16;
  frame.layoutMode = 'VERTICAL';
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.itemSpacing = 8;

  // Ícone/Badge
  const badge = figma.createFrame();
  badge.name = 'Badge';
  badge.resize(40, 40);
  badge.cornerRadius = 8;
  badge.fills = [{ type: 'SOLID', color: step.color, opacity: 0.1 }];
  badge.layoutAlign = 'STRETCH';
  badge.layoutMode = 'VERTICAL';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.counterAxisAlignItems = 'CENTER';

  const iconText = figma.createText();
  iconText.fontName = { family: "Inter", style: "Bold" };
  iconText.fontSize = 20;
  iconText.characters = step.icon || '●';
  iconText.fills = [{ type: 'SOLID', color: step.color }];
  badge.appendChild(iconText);
  frame.appendChild(badge);

  // Título
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Semi Bold" };
  title.fontSize = 16;
  title.characters = step.label;
  title.fills = [{ type: 'SOLID', color: COLORS.text }];
  title.layoutAlign = 'STRETCH';
  frame.appendChild(title);

  // Descrição
  const desc = figma.createText();
  desc.fontName = { family: "Inter", style: "Regular" };
  desc.fontSize = 12;
  desc.characters = step.description;
  desc.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.52 } }];
  desc.layoutAlign = 'STRETCH';
  desc.textAutoResize = 'HEIGHT';
  desc.layoutGrow = 1;
  frame.appendChild(desc);

  return frame;
}

// Criar seta conectora entre steps
function createArrow(startX: number, startY: number, endX: number, endY: number, color: RGB): LineNode {
  const arrow = figma.createLine();
  arrow.x = startX;
  arrow.y = startY;
  arrow.resize(endX - startX, 0);
  arrow.strokes = [{ type: 'SOLID', color: color }];
  arrow.strokeWeight = 3;
  arrow.strokeCap = 'ROUND';

  return arrow;
}

// Criar lista de prós/contras
function createProsCons(pros: string[], contras: string[], x: number, y: number): FrameNode {
  const container = figma.createFrame();
  container.name = 'Prós & Contras';
  container.x = x;
  container.y = y;
  container.resize(580, 200);
  container.fills = [];
  container.layoutMode = 'HORIZONTAL';
  container.itemSpacing = 20;
  container.primaryAxisSizingMode = 'AUTO';

  // Prós
  const prosFrame = createListFrame('✅ Prós', pros, COLORS.success);
  container.appendChild(prosFrame);

  // Contras
  const contrasFrame = createListFrame('⚠️ Contras', contras, COLORS.warning);
  container.appendChild(contrasFrame);

  return container;
}

function createListFrame(title: string, items: string[], color: RGB): FrameNode {
  const frame = figma.createFrame();
  frame.name = title;
  frame.resize(280, 200);
  frame.cornerRadius = 12;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.strokes = [{ type: 'SOLID', color: color }];
  frame.strokeWeight = 2;
  frame.paddingTop = 16;
  frame.paddingBottom = 16;
  frame.paddingLeft = 16;
  frame.paddingRight = 16;
  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = 8;
  frame.primaryAxisSizingMode = 'AUTO';

  // Título
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Bold" };
  titleText.fontSize = 14;
  titleText.characters = title;
  titleText.fills = [{ type: 'SOLID', color: color }];
  frame.appendChild(titleText);

  // Items
  items.forEach(item => {
    const itemText = figma.createText();
    itemText.fontName = { family: "Inter", style: "Regular" };
    itemText.fontSize = 11;
    itemText.characters = `• ${item}`;
    itemText.fills = [{ type: 'SOLID', color: COLORS.text }];
    itemText.layoutAlign = 'STRETCH';
    itemText.textAutoResize = 'HEIGHT';
    frame.appendChild(itemText);
  });

  return frame;
}

// Configurações de cada pipeline
const PIPELINES: { [key: number]: PipelineConfig } = {
  1: {
    title: 'Opção 1: 6º Auditor',
    subtitle: 'Gary como auditor de atenção junto aos 5 auditores existentes',
    color: COLORS.primary,
    steps: [
      {
        label: 'Usuário digita @username',
        description: 'Input inicial do perfil do Instagram',
        color: COLORS.text,
        icon: '👤'
      },
      {
        label: 'Scraping + Análise',
        description: 'Apify coleta posts, comentários e slides',
        color: COLORS.primary,
        icon: '🔍'
      },
      {
        label: '5 Auditores Originais',
        description: 'Kahneman, Schwartz, Hormozi, Cagan, Paul Graham',
        color: COLORS.primary,
        icon: '🧠'
      },
      {
        label: '🔥 GARY: Auditor de Atenção',
        description: 'Analisa plataformas, timing, formato, arbitragem',
        color: COLORS.gary,
        icon: '🔥'
      },
      {
        label: 'Score Final (6 dimensões)',
        description: 'Dashboard com 6 scores incluindo Gary',
        color: COLORS.success,
        icon: '📊'
      }
    ],
    pros: [
      'Complementa os 5 auditores existentes',
      'Gary foca em ONDE e QUANDO (vs O QUE e COMO)',
      'Encaixa naturalmente no fluxo atual',
      'Análise de plataformas/timing (único)'
    ],
    contras: [
      'Aumenta complexidade da auditoria',
      'Mais um score para processar',
      'Pode sobrecarregar o dashboard',
      'Tempo de processamento +30s'
    ]
  },

  2: {
    title: 'Opção 2: GaryVee Mode (RECOMENDADO)',
    subtitle: 'Coach de execução com plano de 30 dias após auditoria',
    color: COLORS.gary,
    steps: [
      {
        label: 'Auditoria Completa',
        description: '5 auditores + scores + perguntas do público',
        color: COLORS.primary,
        icon: '✅'
      },
      {
        label: 'Resultados no Dashboard',
        description: 'Usuário vê scores e insights tradicionais',
        color: COLORS.primary,
        icon: '📊'
      },
      {
        label: '🔥 Botão "GaryVee Mode"',
        description: 'CTA: "Quer um plano de execução baseado nisso?"',
        color: COLORS.gary,
        icon: '🔥'
      },
      {
        label: 'Gary analisa auditoria',
        description: 'Lê scores + perguntas + slides dos concorrentes',
        color: COLORS.gary,
        icon: '🧠'
      },
      {
        label: 'Plano de Execução',
        description: '30 ideias + plano 7 dias + análise de plataformas',
        color: COLORS.success,
        icon: '🎯'
      }
    ],
    pros: [
      'Resolve dor #1: "o que fazer com os insights?"',
      'Não complica auditoria, complementa',
      'Gary brilha em execução (não só análise)',
      'Upsell natural (freemium → premium)'
    ],
    contras: [
      'Precisa contexto adicional (nicho, tempo)',
      'Mais complexo de implementar (2 fluxos)',
      'Pode parecer "vendinha" se mal posicionado'
    ]
  },

  3: {
    title: 'Opção 3: Personal Branding Squad',
    subtitle: 'Sub-serviço premium separado com squad dedicado',
    color: COLORS.success,
    steps: [
      {
        label: 'Auditoria Express (R$ 47)',
        description: 'Auditoria tradicional como entrada',
        color: COLORS.primary,
        icon: '🎟️'
      },
      {
        label: 'CTA Upsell',
        description: '"Quer ir além? Estratégia Personal Branding"',
        color: COLORS.warning,
        icon: '⬆️'
      },
      {
        label: 'Input Detalhado',
        description: 'Usuário preenche nicho, objetivos, recursos',
        color: COLORS.primary,
        icon: '📝'
      },
      {
        label: '🔥 Squad Personal Branding',
        description: 'Gary (líder) + Seth Godin + Hormozi + Schwartz',
        color: COLORS.gary,
        icon: '👥'
      },
      {
        label: 'Estratégia Completa (R$ 497)',
        description: 'Posicionamento + ofertas + copy + plano 90 dias',
        color: COLORS.success,
        icon: '💎'
      }
    ],
    pros: [
      'Monetização adicional (R$ 497)',
      'Gary é A referência em personal branding',
      'Squad dedicado = resultado premium',
      'Escopo claro e vendável'
    ],
    contras: [
      'Sai da proposta "3 minutos"',
      'Muito maior escopo (não é MVP)',
      'Requer suporte e onboarding',
      'Precisa validar demanda antes'
    ]
  },

  4: {
    title: 'Opção 4: Gerador de Ideias',
    subtitle: 'Feature standalone que gera 30 ideias de conteúdo',
    color: { r: 0.26, g: 0.97, b: 0.85 },
    steps: [
      {
        label: 'Input do Usuário',
        description: 'Nicho + tom de voz + objetivo + plataforma',
        color: COLORS.primary,
        icon: '📥'
      },
      {
        label: 'Gary analisa tendências',
        description: 'Verifica atenção subvalorizada por plataforma',
        color: COLORS.gary,
        icon: '📈'
      },
      {
        label: 'Aplica "Document, Don\'t Create"',
        description: 'Transforma rotina do usuário em conteúdo',
        color: COLORS.gary,
        icon: '📹'
      },
      {
        label: '30 Ideias Ultra-Específicas',
        description: 'Título + formato + plataforma + atenção arbitrage',
        color: COLORS.success,
        icon: '💡'
      }
    ],
    pros: [
      'Resolve dor #1: "não tenho ideias"',
      'Pode ser feature separada OU parte da auditoria',
      'Gary cria (não só analisa)',
      'Escalável e rápido'
    ],
    contras: [
      'Precisa dados de tendências em tempo real',
      'APIs de plataformas (TikTok, IG) caras',
      'Pode gerar ideias genéricas sem contexto',
      'Concorre com ferramentas existentes'
    ]
  }
};

// Criar um pipeline completo
async function createPipeline(option: number, startX: number = 0, startY: number = 0): Promise<FrameNode> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const config = PIPELINES[option];
  const container = figma.createFrame();
  container.name = config.title;
  container.x = startX;
  container.y = startY;
  container.resize(640, 1200);
  container.fills = [{ type: 'SOLID', color: COLORS.bg }];
  container.paddingTop = 40;
  container.paddingBottom = 40;
  container.paddingLeft = 40;
  container.paddingRight = 40;
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = 32;
  container.primaryAxisSizingMode = 'AUTO';

  // Header
  const header = figma.createFrame();
  header.name = 'Header';
  header.resize(560, 80);
  header.fills = [];
  header.layoutMode = 'VERTICAL';
  header.itemSpacing = 8;
  header.primaryAxisSizingMode = 'AUTO';

  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Bold" };
  title.fontSize = 24;
  title.characters = config.title;
  title.fills = [{ type: 'SOLID', color: config.color }];
  header.appendChild(title);

  const subtitle = figma.createText();
  subtitle.fontName = { family: "Inter", style: "Regular" };
  subtitle.fontSize = 14;
  subtitle.characters = config.subtitle;
  subtitle.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.52 } }];
  subtitle.textAutoResize = 'HEIGHT';
  subtitle.layoutAlign = 'STRETCH';
  header.appendChild(subtitle);

  container.appendChild(header);

  // Steps
  const stepsContainer = figma.createFrame();
  stepsContainer.name = 'Pipeline Steps';
  stepsContainer.resize(560, 800);
  stepsContainer.fills = [];
  stepsContainer.layoutMode = 'VERTICAL';
  stepsContainer.itemSpacing = 24;
  stepsContainer.primaryAxisSizingMode = 'AUTO';

  config.steps.forEach((step, index) => {
    const stepNode = createStep(step, 0, 0, 560);
    stepsContainer.appendChild(stepNode);

    // Adicionar seta entre steps (exceto último)
    if (index < config.steps.length - 1) {
      const arrow = figma.createText();
      arrow.fontName = { family: "Inter", style: "Bold" };
      arrow.fontSize = 24;
      arrow.characters = '↓';
      arrow.fills = [{ type: 'SOLID', color: config.color }];
      arrow.textAlignHorizontal = 'CENTER';
      arrow.layoutAlign = 'STRETCH';
      stepsContainer.appendChild(arrow);
    }
  });

  container.appendChild(stepsContainer);

  // Prós e Contras
  const prosConsContainer = createProsCons(config.pros, config.contras, 0, 0);
  prosConsContainer.layoutAlign = 'STRETCH';
  container.appendChild(prosConsContainer);

  return container;
}

// Handler de mensagens da UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-pipeline') {
    try {
      if (msg.option === 'all') {
        // Criar todas as opções lado a lado
        const frames: FrameNode[] = [];
        for (let i = 1; i <= 4; i++) {
          const frame = await createPipeline(i, (i - 1) * 700, 0);
          frames.push(frame);
          figma.currentPage.appendChild(frame);
        }

        // Selecionar todos
        figma.currentPage.selection = frames;
        figma.viewport.scrollAndZoomIntoView(frames);

        figma.notify('✅ 4 pipelines criados com sucesso!');
      } else {
        // Criar pipeline individual
        const frame = await createPipeline(msg.option);
        figma.currentPage.appendChild(frame);
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);

        figma.notify(`✅ Pipeline ${msg.option} criado com sucesso!`);
      }
    } catch (error) {
      figma.notify(`❌ Erro: ${error.message}`);
    }
  }
};
