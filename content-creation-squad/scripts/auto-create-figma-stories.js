#!/usr/bin/env node

/**
 * 🚀 AUTO CREATE FIGMA STORIES
 *
 * Cria automaticamente um arquivo no Figma com os 7 Stories de "Inveja e Prosperidade"
 * Usando Figma REST API + Figma Plugin API hybrid approach
 *
 * Criado por: Content Creation Squad
 * Mentes: Adriano De Marqui (Design) + Eugene Schwartz (Copy)
 */

require('dotenv').config({ path: '../../.env.local' });
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const CONFIG = {
  FIGMA_TOKEN: process.env.FIGMA_TOKEN,
  API_BASE: 'https://api.figma.com/v1',
  STORY_WIDTH: 1080,
  STORY_HEIGHT: 1920,
  SPACING: 100,
  OUTPUT_DIR: path.join(__dirname, '../output'),
};

// ============================================================================
// PALETA DE CORES
// ============================================================================

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
// CONTEÚDO DOS 7 STORIES
// ============================================================================

const STORIES_CONTENT = [
  {
    id: 1,
    title: 'INVEJA',
    subtitle: 'E PROSPERIDADE',
    text: 'O que você precisa saber',
    background: 'gradient-escuro',
    accentColor: COLORS.vermelhoInv,
  },
  {
    id: 2,
    title: 'ELES NORMALIZAM',
    text: 'a sua inveja.\n\nFazem você acreditar\nque é natural.',
    background: 'gradient-escuro',
    accentColor: COLORS.azulDest,
  },
  {
    id: 3,
    title: 'O PROBLEMA',
    text: 'Inveja bloqueia\nsua prosperidade.\n\nEnquanto você foca\nno que o outro tem,\nnão constrói o SEU.',
    background: 'gradient-escuro',
    accentColor: COLORS.vermelhoInv,
  },
  {
    id: 4,
    title: 'REFRAME',
    subtitle: '⭐ MOMENTO CHAVE',
    text: 'Transforme inveja\nem INSPIRAÇÃO.\n\n"Se ele conseguiu,\neu também consigo"',
    background: 'gradient-transicao',
    accentColor: COLORS.dourado,
  },
  {
    id: 5,
    title: 'O MÉTODO',
    text: '1. Reconheça a inveja\n2. Agradeça o exemplo\n3. Trace SEU caminho\n4. Foque na SUA jornada',
    background: 'gradient-prosperidade',
    accentColor: COLORS.verdeClaro,
  },
  {
    id: 6,
    title: 'EXEMPLO',
    text: 'Pessoa próspera vê\nalguém bem-sucedido:\n\n"Que inspirador!\nVou aprender com ele"',
    background: 'gradient-prosperidade',
    accentColor: COLORS.verdeClaro,
  },
  {
    id: 7,
    title: 'COMECE HOJE',
    text: 'Inveja → Inspiração\nComparação → Criação\nRessntimento → Realização',
    cta: 'SALVE ESTE POST',
    background: 'gradient-prosperidade',
    accentColor: COLORS.dourado,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valida se o token está configurado
 */
function validateToken() {
  if (!CONFIG.FIGMA_TOKEN) {
    console.error('❌ ERRO: Token do Figma não encontrado!');
    console.log('Configure FIGMA_TOKEN no arquivo .env.local\n');
    process.exit(1);
  }
}

/**
 * Faz requisição para a API do Figma
 */
async function figmaAPI(endpoint, method = 'GET', data = null) {
  try {
    const response = await axios({
      method,
      url: `${CONFIG.API_BASE}${endpoint}`,
      headers: {
        'X-Figma-Token': CONFIG.FIGMA_TOKEN,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Figma API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Obtém informações do usuário
 */
async function getUserInfo() {
  return await figmaAPI('/me');
}

/**
 * Lista arquivos do usuário (projects)
 */
async function listUserProjects() {
  const userInfo = await getUserInfo();
  // Nota: A API do Figma requer team_id para listar projetos
  // Vamos precisar de uma abordagem diferente
  return userInfo;
}

/**
 * Gera o código do plugin Figma pronto para uso
 */
function generateFigmaPluginCode() {
  return `// ==================================================================
// 🎨 FIGMA PLUGIN - Stories "Inveja e Prosperidade"
// ==================================================================
// INSTRUÇÕES:
// 1. Abra o Figma Desktop App
// 2. Menu → Plugins → Development → New Plugin
// 3. Cole ESTE código completo
// 4. Run
// ==================================================================

const STORIES = ${JSON.stringify(STORIES_CONTENT, null, 2)};

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
    frame.name = \`Story \${String(story.id).padStart(2, '0')}\`;
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

    console.log(\`✅ Story \${story.id} criado\`);
  }

  console.log('🎉 Todos os 7 Stories foram criados!');
  figma.closePlugin('✅ 7 Stories criados com sucesso!');
}

createStories().catch(err => {
  console.error('❌ Erro:', err);
  figma.closePlugin('❌ Erro: ' + err.message);
});`;
}

/**
 * Gera arquivo HTML standalone com preview
 */
function generateHTMLPreview() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - 7 Stories Inveja e Prosperidade</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a1a;
      color: white;
      padding: 40px 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { text-align: center; margin-bottom: 40px; color: #FFD23F; }
    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
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
    }
    .story:hover { transform: scale(1.02); }
    .story-title {
      font-size: 2.5rem;
      font-weight: 900;
      margin-bottom: 10px;
      line-height: 1.2;
    }
    .story-subtitle {
      font-size: 1.3rem;
      font-weight: 500;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    .story-text {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 20px;
      white-space: pre-line;
    }
    .story-cta {
      font-size: 1.8rem;
      font-weight: 700;
      margin-top: auto;
      padding: 15px 30px;
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
    <h1>🎨 Preview: 7 Stories - Inveja e Prosperidade</h1>
    <div class="stories-grid">
      ${STORIES_CONTENT.map(story => `
        <div class="story ${story.background}">
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

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 AUTO CREATE FIGMA STORIES\n');
  console.log('=' .repeat(60));

  // Validar token
  validateToken();

  // Testar conexão (opcional - continua mesmo se falhar)
  let userInfo = null;
  try {
    console.log('\n📡 Testando conexão com Figma API...');
    userInfo = await getUserInfo();
    console.log(`✅ Conectado como: ${userInfo.handle} (${userInfo.email})\n`);
  } catch (error) {
    console.log('⚠️  Não foi possível conectar à API (pode ser temporário)');
    console.log('   Continuando geração de arquivos localmente...\n');
    userInfo = { handle: 'User', email: 'user@example.com' };
  }

  // Criar diretório de output
  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  // ============================================================================
  // IMPORTANTE: Limitação da API do Figma
  // ============================================================================
  console.log('📋 SOBRE A API DO FIGMA:\n');
  console.log('A Figma REST API tem limitações importantes:');
  console.log('❌ Não permite criar arquivos novos programaticamente');
  console.log('❌ Não permite adicionar/modificar nós via API REST');
  console.log('✅ Permite apenas LEITURA de arquivos existentes');
  console.log('✅ Plugin API (desktop) permite criação completa\n');

  console.log('💡 SOLUÇÃO:\n');
  console.log('Gerando código do Plugin Figma pronto para usar...\n');

  // Gerar código do plugin
  const pluginCode = generateFigmaPluginCode();
  const pluginPath = path.join(CONFIG.OUTPUT_DIR, 'figma-plugin-ready.js');
  await fs.writeFile(pluginPath, pluginCode, 'utf8');
  console.log(`✅ Plugin gerado: ${pluginPath}`);

  // Gerar JSON com estrutura
  const structurePath = path.join(CONFIG.OUTPUT_DIR, 'stories-structure.json');
  await fs.writeFile(structurePath, JSON.stringify({
    meta: {
      title: 'Inveja e Prosperidade - 7 Stories',
      created: new Date().toISOString(),
      author: userInfo.handle,
    },
    config: {
      width: CONFIG.STORY_WIDTH,
      height: CONFIG.STORY_HEIGHT,
      spacing: CONFIG.SPACING,
    },
    stories: STORIES_CONTENT,
    colors: COLORS,
  }, null, 2), 'utf8');
  console.log(`✅ Estrutura JSON: ${structurePath}`);

  // Gerar preview HTML
  const htmlPreview = generateHTMLPreview();
  const htmlPath = path.join(CONFIG.OUTPUT_DIR, 'preview-stories.html');
  await fs.writeFile(htmlPath, htmlPreview, 'utf8');
  console.log(`✅ Preview HTML: ${htmlPath}`);

  // Instruções finais
  console.log('\n' + '='.repeat(60));
  console.log('\n📖 PRÓXIMOS PASSOS:\n');
  console.log('1️⃣  Abrir preview no navegador:');
  console.log(`   open ${htmlPath}\n`);
  console.log('2️⃣  Abrir Figma Desktop App');
  console.log('3️⃣  Menu → Plugins → Development → New Plugin...');
  console.log('4️⃣  Escolher template "Empty"');
  console.log('5️⃣  Copiar conteúdo de:');
  console.log(`   ${pluginPath}`);
  console.log('6️⃣  Colar no editor do plugin');
  console.log('7️⃣  Salvar e rodar o plugin');
  console.log('\n✨ Em ~30 segundos você terá os 7 Stories prontos!\n');

  console.log('💾 ARQUIVOS GERADOS:\n');
  console.log(`   📄 ${pluginPath}`);
  console.log(`   📄 ${structurePath}`);
  console.log(`   📄 ${htmlPath}\n`);

  console.log('🎉 Processo concluído com sucesso!\n');
}

// Run
main().catch(error => {
  console.error('\n❌ ERRO:', error.message);
  console.error('\n', error);
  process.exit(1);
});
