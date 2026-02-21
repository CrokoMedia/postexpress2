/**
 * Template HTML para slides de conteudo com imagem no topo (estilo editorial magazine)
 * Corresponde aos slides 03, 05, 08 do TemplateFigma
 * Renderizado via Puppeteer em 1080x1350px
 */

const FONTS_PATH = process.cwd() + '/public/fonts/sofia-pro'

export interface EditorialContentImageConfig {
  paragraph1: string
  paragraph2: string
  backgroundImageUrl: string
  metaLeft: string
  metaCenter: string
  metaRight: string
  accentColor?: string
  metaBgColor?: string
  metaShape?: 'square' | 'rounded'
  metaFontSize?: number
}

function boldFirstSentence(text: string, color: string): string {
  const match = text.match(/^(.+?[.!?:])(\s|$)/)
  if (!match) {
    return `<span style="font-weight:700;color:${color};">${text}</span>`
  }
  return `<span style="font-weight:700;color:${color};">${match[1]}</span>${text.substring(match[1].length)}`
}

export function generateEditorialContentImageHTML(config: EditorialContentImageConfig): string {
  const {
    paragraph1,
    paragraph2,
    backgroundImageUrl,
    metaLeft,
    metaCenter,
    metaRight,
    accentColor = '#E63946',
    metaBgColor,
    metaShape,
    metaFontSize = 13,
  } = config

  const metaStyle = metaBgColor
    ? `color: #ffffff; background: ${metaBgColor}; padding: 6px 14px; border-radius: ${metaShape === 'rounded' ? '999px' : '4px'};`
    : ''

  const p1Html = paragraph1
  const p2Html = boldFirstSentence(paragraph2, accentColor)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Light.otf') format('opentype');
      font-weight: 300;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Regular.otf') format('opentype');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Medium.otf') format('opentype');
      font-weight: 500;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-SemiBold.otf') format('opentype');
      font-weight: 600;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Bold.otf') format('opentype');
      font-weight: 700;
    }

    .slide {
      width: 1080px;
      height: 1350px;
      position: relative;
      overflow: hidden;
      font-family: 'Sofia Pro', system-ui, sans-serif;
      background: #FFFFFF;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      display: flex;
      flex-direction: column;
    }

    .image-area {
      flex: 0 0 auto;
      width: 100%;
      height: 700px;
      position: relative;
      overflow: hidden;
    }

    .image-area img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 40px 60px;
      z-index: 2;
    }

    .meta-item {
      font-size: ${metaFontSize}px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.65);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%);
      z-index: 1;
    }

    .text-area {
      flex: 1;
      padding: 40px 60px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
    }

    .paragraph {
      font-size: 23px;
      font-weight: 400;
      line-height: 1.55;
      color: #1a1a1a;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="image-area">
      <div class="image-overlay"></div>
      <div class="top-bar">
        ${metaLeft ? `<span class="meta-item" style="${metaStyle}">${metaLeft}</span>` : '<span></span>'}
        ${metaCenter ? `<span class="meta-item" style="${metaStyle}">${metaCenter}</span>` : '<span></span>'}
        ${metaRight ? `<span class="meta-item" style="${metaStyle}">${metaRight}</span>` : '<span></span>'}
      </div>
      <img src="${backgroundImageUrl}" alt="" />
    </div>

    <div class="text-area">
      <p class="paragraph">${p1Html}</p>
      <p class="paragraph">${p2Html}</p>
    </div>
  </div>
</body>
</html>`
}
