/**
 * Template HTML para slides de conteudo com titulo no topo (estilo editorial magazine)
 * Corresponde aos slides 02, 04, 06, 07 do TemplateFigma
 * Renderizado via Puppeteer em 1080x1350px
 */

const FONTS_PATH = process.cwd() + '/public/fonts/sofia-pro'

export interface EditorialContentTitleConfig {
  titulo: string
  paragraph1: string
  paragraph2?: string
  backgroundImageUrl: string
  metaLeft: string
  metaCenter: string
  metaRight: string
  accentColor?: string
  imagePosition?: 'middle' | 'bottom'
  metaBgColor?: string
  metaShape?: 'square' | 'rounded'
  metaFontSize?: number
  titleFontSizeOverride?: number
}

function getTitleFontSize(titulo: string): number {
  const len = titulo.length
  if (len <= 40) return 64
  if (len <= 60) return 54
  if (len <= 80) return 46
  if (len <= 100) return 40
  return 36
}

function boldFirstSentence(text: string, color: string): string {
  const match = text.match(/^(.+?[.!?:])(\s|$)/)
  if (!match) {
    return `<span style="font-weight:700;color:${color};">${text}</span>`
  }
  return `<span style="font-weight:700;color:${color};">${match[1]}</span>${text.substring(match[1].length)}`
}

export function generateEditorialContentTitleHTML(config: EditorialContentTitleConfig): string {
  const {
    titulo,
    paragraph1,
    paragraph2,
    backgroundImageUrl,
    metaLeft,
    metaCenter,
    metaRight,
    accentColor = '#E63946',
    imagePosition = 'middle',
    metaBgColor,
    metaShape,
    metaFontSize = 13,
    titleFontSizeOverride,
  } = config

  const titleFontSize = titleFontSizeOverride || getTitleFontSize(titulo)
  const metaStyle = metaBgColor
    ? `color: #1a1a1a; background: ${metaBgColor}; padding: 6px 14px; border-radius: ${metaShape === 'rounded' ? '999px' : '4px'};`
    : ''

  const p1Html = boldFirstSentence(paragraph1, '#1a1a1a')
  const p2Html = paragraph2 ? boldFirstSentence(paragraph2, accentColor) : ''

  if (imagePosition === 'bottom') {
    return generateTitleTextImageLayout({
      titulo, titleFontSize, p1Html, p2Html,
      backgroundImageUrl, metaLeft, metaCenter, metaRight, accentColor, metaStyle, metaFontSize,
    })
  }

  return generateTitleImageTextLayout({
    titulo, titleFontSize, p1Html, p2Html,
    backgroundImageUrl, metaLeft, metaCenter, metaRight, accentColor, metaStyle, metaFontSize,
  })
}

function fontFaces(): string {
  return `
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
    }`
}

/**
 * Layout: Titulo no topo → Imagem no meio → Texto embaixo
 * Slides 02, 04
 */
function generateTitleImageTextLayout(opts: {
  titulo: string
  titleFontSize: number
  p1Html: string
  p2Html: string
  backgroundImageUrl: string
  metaLeft: string
  metaCenter: string
  metaRight: string
  accentColor: string
  metaStyle: string
  metaFontSize: number
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    ${fontFaces()}

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

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 40px 60px 0;
    }

    .meta-item {
      font-size: ${opts.metaFontSize}px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #999999;
    }

    .title-area {
      padding: 36px 60px 0;
    }

    .title {
      font-size: ${opts.titleFontSize}px;
      font-weight: 700;
      line-height: 1.05;
      text-transform: uppercase;
      color: ${opts.accentColor};
      letter-spacing: -0.5px;
    }

    .image-area {
      flex: 0 0 auto;
      width: 100%;
      height: 420px;
      margin-top: 32px;
      overflow: hidden;
      position: relative;
    }

    .image-area img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .text-area {
      flex: 1;
      padding: 36px 60px 48px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .paragraph {
      font-size: 23px;
      font-weight: 400;
      line-height: 1.55;
      color: #1a1a1a;
    }

    .paragraph + .paragraph {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="top-bar">
      ${opts.metaLeft ? `<span class="meta-item" style="${opts.metaStyle}">${opts.metaLeft}</span>` : '<span></span>'}
      ${opts.metaCenter ? `<span class="meta-item" style="${opts.metaStyle}">${opts.metaCenter}</span>` : '<span></span>'}
      ${opts.metaRight ? `<span class="meta-item" style="${opts.metaStyle}">${opts.metaRight}</span>` : '<span></span>'}
    </div>

    <div class="title-area">
      <h1 class="title">${opts.titulo}</h1>
    </div>

    <div class="image-area">
      <img src="${opts.backgroundImageUrl}" alt="" />
    </div>

    <div class="text-area">
      <p class="paragraph">${opts.p1Html}</p>
      ${opts.p2Html ? `<p class="paragraph">${opts.p2Html}</p>` : ''}
    </div>
  </div>
</body>
</html>`
}

/**
 * Layout: Titulo no topo → Texto no meio → Imagem embaixo
 * Slides 06, 07
 */
function generateTitleTextImageLayout(opts: {
  titulo: string
  titleFontSize: number
  p1Html: string
  p2Html: string
  backgroundImageUrl: string
  metaLeft: string
  metaCenter: string
  metaRight: string
  accentColor: string
  metaStyle: string
  metaFontSize: number
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    ${fontFaces()}

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

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 40px 60px 0;
    }

    .meta-item {
      font-size: ${opts.metaFontSize}px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #999999;
    }

    .title-area {
      padding: 36px 60px 0;
    }

    .title {
      font-size: ${opts.titleFontSize}px;
      font-weight: 700;
      line-height: 1.05;
      text-transform: uppercase;
      color: ${opts.accentColor};
      letter-spacing: -0.5px;
    }

    .text-area {
      padding: 32px 60px 0;
    }

    .paragraph {
      font-size: 23px;
      font-weight: 400;
      line-height: 1.55;
      color: #1a1a1a;
    }

    .paragraph + .paragraph {
      margin-top: 20px;
    }

    .image-area {
      margin-top: auto;
      width: 100%;
      height: 460px;
      overflow: hidden;
      position: relative;
    }

    .image-area img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="top-bar">
      ${opts.metaLeft ? `<span class="meta-item" style="${opts.metaStyle}">${opts.metaLeft}</span>` : '<span></span>'}
      ${opts.metaCenter ? `<span class="meta-item" style="${opts.metaStyle}">${opts.metaCenter}</span>` : '<span></span>'}
      ${opts.metaRight ? `<span class="meta-item" style="${opts.metaStyle}">${opts.metaRight}</span>` : '<span></span>'}
    </div>

    <div class="title-area">
      <h1 class="title">${opts.titulo}</h1>
    </div>

    <div class="text-area">
      <p class="paragraph">${opts.p1Html}</p>
      ${opts.p2Html ? `<p class="paragraph">${opts.p2Html}</p>` : ''}
    </div>

    <div class="image-area">
      <img src="${opts.backgroundImageUrl}" alt="" />
    </div>
  </div>
</body>
</html>`
}
