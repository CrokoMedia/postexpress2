/**
 * Template HTML para slide CTA/Credits (estilo editorial magazine)
 * Corresponde ao slide 09 do TemplateFigma
 * Renderizado via Puppeteer em 1080x1350px
 */

const FONTS_PATH = process.cwd() + '/public/fonts/sofia-pro'

export interface EditorialCtaConfig {
  badgeText: string
  creditsText: string
  backgroundImageUrl: string
  metaLeft?: string
  metaCenter?: string
  metaRight?: string
  accentColor?: string
  metaBgColor?: string
  metaShape?: 'square' | 'rounded'
  metaFontSize?: number
}

export function generateEditorialCtaHTML(config: EditorialCtaConfig): string {
  const {
    badgeText,
    creditsText,
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

  const hasMetaBar = metaLeft || metaCenter || metaRight

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
      background: linear-gradient(to bottom, rgba(0,0,0,0.30), transparent);
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
      justify-content: flex-end;
      padding: 56px 60px 64px;
    }

    .top-bar {
      position: absolute;
      top: 40px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-item {
      font-size: ${metaFontSize}px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.55);
    }

    .badge {
      display: inline-block;
      background: ${accentColor};
      color: #ffffff;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 4px;
      margin-bottom: 28px;
    }

    .credits-text {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.3;
      color: #ffffff;
    }

    .credits-text em {
      font-style: italic;
      font-weight: 400;
    }
  </style>
</head>
<body>
  <div class="slide">
    <img class="bg-image" src="${backgroundImageUrl}" alt="" />
    <div class="overlay-top"></div>
    <div class="overlay-bottom"></div>
    <div class="content">
      ${hasMetaBar ? `
      <div class="top-bar">
        ${metaLeft ? `<span class="meta-item" style="${metaStyle}">${metaLeft}</span>` : '<span></span>'}
        ${metaCenter ? `<span class="meta-item" style="${metaStyle}">${metaCenter}</span>` : '<span></span>'}
        ${metaRight ? `<span class="meta-item" style="${metaStyle}">${metaRight}</span>` : '<span></span>'}
      </div>` : ''}

      <div class="badge">${badgeText}</div>
      <div class="credits-text">${creditsText}</div>
    </div>
  </div>
</body>
</html>`
}
