/**
 * Template HTML para slide editorial de capa (estilo editorial magazine)
 * Renderizado via Puppeteer em 1080x1350px (Instagram spec)
 */

const FONTS_PATH = process.cwd() + '/public/fonts/sofia-pro'

export interface EditorialCoverConfig {
  titulo: string
  subtitulo: string
  metaLeft: string
  metaCenter: string
  metaRight: string
  badgeText: string
  backgroundImageUrl: string
  metaBgColor?: string
  metaShape?: 'square' | 'rounded'
  metaFontSize?: number
  titleFontSizeOverride?: number
  subtitleFontSize?: number
  badgeFontSize?: number
}

function getTitleFontSize(titulo: string): number {
  const len = titulo.length
  if (len <= 30) return 96
  if (len <= 45) return 82
  if (len <= 60) return 70
  if (len <= 80) return 58
  return 48
}

export function generateEditorialCoverHTML(config: EditorialCoverConfig): string {
  const {
    titulo, subtitulo, metaLeft, metaCenter, metaRight, badgeText, backgroundImageUrl,
    metaBgColor, metaShape, metaFontSize = 15,
    titleFontSizeOverride, subtitleFontSize = 17, badgeFontSize = 13,
  } = config
  const metaStyle = metaBgColor
    ? `color: #ffffff; background: ${metaBgColor}; padding: 6px 14px; border-radius: ${metaShape === 'rounded' ? '999px' : '4px'};`
    : ''
  const titleFontSize = titleFontSizeOverride || getTitleFontSize(titulo)

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
      font-style: normal;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Regular.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Medium.otf') format('opentype');
      font-weight: 500;
      font-style: normal;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-SemiBold.otf') format('opentype');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file://${FONTS_PATH}/SofiaPro-Bold.otf') format('opentype');
      font-weight: 700;
      font-style: normal;
    }

    .slide {
      width: 1080px;
      height: 1350px;
      position: relative;
      overflow: hidden;
      font-family: 'Sofia Pro', system-ui, -apple-system, sans-serif;
      color: #ffffff;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    .bg-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    .overlay-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 140px;
      z-index: 2;
      background: linear-gradient(to bottom, rgba(0,0,0,0.35), transparent);
    }

    .overlay-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 75%;
      z-index: 2;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.97) 0%,
        rgba(0, 0, 0, 0.88) 25%,
        rgba(0, 0, 0, 0.55) 55%,
        transparent 100%
      );
    }

    .content {
      position: relative;
      z-index: 3;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 60px 56px;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .meta-item {
      font-size: ${metaFontSize}px;
      font-weight: 500;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
    }

    .text-area {
      margin-top: auto;
    }

    .subtitle {
      font-size: ${subtitleFontSize}px;
      font-weight: 400;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.55);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .title {
      font-size: ${titleFontSize}px;
      font-weight: 700;
      line-height: 1.02;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 40px;
      letter-spacing: -1px;
    }

    .badge {
      display: inline-block;
      border: 1.5px solid rgba(255, 255, 255, 0.4);
      padding: 12px 28px;
      font-size: ${badgeFontSize}px;
      font-weight: 600;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.65);
    }
  </style>
</head>
<body>
  <div class="slide">
    <img class="bg-image" src="${backgroundImageUrl}" alt="" />
    <div class="overlay-top"></div>
    <div class="overlay-bottom"></div>
    <div class="content">
      <div class="top-bar">
        ${metaLeft ? `<span class="meta-item" style="${metaStyle}">${metaLeft}</span>` : '<span></span>'}
        ${metaCenter ? `<span class="meta-item" style="${metaStyle}">${metaCenter}</span>` : '<span></span>'}
        ${metaRight ? `<span class="meta-item" style="${metaStyle}">${metaRight}</span>` : '<span></span>'}
      </div>
      <div class="text-area">
        <div class="subtitle">${subtitulo}</div>
        <h1 class="title">${titulo}</h1>
        <div class="badge">${badgeText}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}
