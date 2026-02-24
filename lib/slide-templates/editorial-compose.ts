/**
 * Template de composicao inteligente para slides editoriais.
 * Parseia descricoes de design e monta HTML com:
 * - Gradientes de fundo extraidos do prompt
 * - Logos/imagens buscados no Google via Serper
 * - Posicionamento automatico dos elementos
 */

import { searchEditorialImage } from '@/lib/image-search'

const FONTS_PATH = process.cwd() + '/public/fonts/sofia-pro'

export interface ComposeElement {
  type: 'logo' | 'image'
  query: string
  url?: string
}

export interface ComposeConfig {
  titulo: string
  subtitulo: string
  metaLeft: string
  metaCenter: string
  metaRight: string
  badgeText: string
  background: string // CSS background (gradient, cor solida, ou url)
  backgroundImageUrl?: string // Foto real buscada na internet (overlay por cima)
  elements: ComposeElement[]
  style?: string // 'breaking-news' | 'editorial' | 'minimal'
}

/**
 * Parseia um prompt em portugues/ingles e extrai:
 * - Cores de gradiente (ex: #0f4c3a → #2d8659)
 * - Referencias a logos (ex: "Logo da OpenAI", "logo Nike")
 * - Estilo visual (ex: "breaking news", "jornalistico")
 * - Busca de foto de fundo (ex: "Foto de skatista", "imagem de atleta correndo")
 */
export function parseComposePrompt(prompt: string): {
  background: string
  logoQueries: string[]
  style: string
  photoQuery: string | null
} {
  let background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  const logoQueries: string[] = []
  let style = 'editorial'

  // Extrair gradiente: "#xxx → #xxx" ou "#xxx para #xxx"
  const gradientMatch = prompt.match(
    /#([0-9a-fA-F]{3,8})\s*(?:→|->|para|to)\s*#([0-9a-fA-F]{3,8})/
  )
  if (gradientMatch) {
    background = `linear-gradient(135deg, #${gradientMatch[1]} 0%, #${gradientMatch[2]} 100%)`
  }

  // Extrair cor solida
  const solidColorMatch = prompt.match(/(?:fundo|background)\s*(?::#?\s*)?([#][0-9a-fA-F]{3,8})/i)
  if (solidColorMatch && !gradientMatch) {
    background = solidColorMatch[1]
  }

  // Extrair "verde escuro para verde claro" e outros gradientes por nome
  const namedGradientPatterns: Record<string, string> = {
    'verde escuro.*verde claro': 'linear-gradient(135deg, #0f4c3a 0%, #2d8659 100%)',
    'verde claro.*verde escuro': 'linear-gradient(135deg, #2d8659 0%, #0f4c3a 100%)',
    'azul escuro.*azul claro': 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)',
    'vermelho.*preto': 'linear-gradient(135deg, #8b0000 0%, #1a0000 100%)',
    'preto.*vermelho': 'linear-gradient(135deg, #1a0000 0%, #8b0000 100%)',
    'dourado.*preto': 'linear-gradient(135deg, #b8860b 0%, #1a1a0a 100%)',
    'roxo.*azul': 'linear-gradient(135deg, #4a0e4e 0%, #1e3a5f 100%)',
  }

  for (const [pattern, gradient] of Object.entries(namedGradientPatterns)) {
    if (new RegExp(pattern, 'i').test(prompt)) {
      background = gradient
      break
    }
  }

  // Extrair logos: "Logo da X", "logo X", "logo do X", "logotipo X"
  const logoPatterns = [
    /logo(?:tipo)?\s+(?:da|do|de|das|dos)?\s*([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[+,\-→]|\s*e\s|\s*$)/gi,
    /logo(?:tipo)?\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[+,\-→]|\s*e\s|\s*$)/gi,
  ]

  for (const pattern of logoPatterns) {
    let match
    while ((match = pattern.exec(prompt)) !== null) {
      const name = match[1].trim()
      if (name.length > 1 && name.length < 50) {
        logoQueries.push(name)
      }
    }
  }

  // Deduplicar
  const uniqueLogos = [...new Set(logoQueries.map(q => q.toLowerCase()))].map(
    q => logoQueries.find(orig => orig.toLowerCase() === q) || q
  )

  // Extrair estilo
  if (/breaking.?news|urgente|jornal/i.test(prompt)) {
    style = 'breaking-news'
  } else if (/minimal|clean|limpo/i.test(prompt)) {
    style = 'minimal'
  }

  // Extrair busca de foto de fundo:
  // "Foto de X", "Imagem de X", "Cena de X", "Background: X", "Fundo: foto de X"
  let photoQuery: string | null = null
  const photoPatterns = [
    /(?:foto|imagem|cena|image|photo|picture)\s+(?:de|do|da|dos|das|of|with)?\s*(.+?)(?:\s*[,\-\n]|\s*(?:logo|estilo|style|gradiente|gradient|fundo|background|#))/i,
    /(?:fundo|background)\s*(?::|com)?\s*(?:foto|imagem|photo|image)\s+(?:de|do|da|of)?\s*(.+?)(?:\s*[,\-\n]|\s*(?:logo|estilo|style|gradiente|gradient|#))/i,
    /(?:foto|imagem|cena|image|photo|picture)\s+(?:de|do|da|dos|das|of|with)?\s*(.+?)$/im,
  ]

  for (const pattern of photoPatterns) {
    const match = prompt.match(pattern)
    if (match && match[1]) {
      const candidate = match[1].trim()
      // Ignorar se capturou apenas cores/gradientes
      if (candidate.length > 2 && !/^#[0-9a-fA-F]/.test(candidate) && !/^(?:verde|azul|vermelho|preto|branco|roxo|dourado)\s/i.test(candidate)) {
        photoQuery = candidate
        break
      }
    }
  }

  return { background, logoQueries: uniqueLogos, style, photoQuery }
}

/**
 * Busca imagens para cada logo/elemento no Google Images
 */
export async function resolveComposeElements(
  logoQueries: string[]
): Promise<ComposeElement[]> {
  const elements: ComposeElement[] = []

  for (const query of logoQueries) {
    const searchQuery = `${query} logo transparent PNG`
    console.log(`   🔍 Buscando logo: "${searchQuery}"`)

    const url = await searchEditorialImage(searchQuery, { num: 5 })

    elements.push({
      type: 'logo',
      query,
      url: url || undefined,
    })

    if (url) {
      console.log(`   ✅ Logo encontrado: ${query} → ${url}`)
    } else {
      console.log(`   ⚠️ Logo nao encontrado: ${query}`)
    }
  }

  return elements
}

/**
 * Gera o HTML composto com gradiente de fundo + logos + tipografia editorial
 */
export function generateComposeHTML(config: ComposeConfig): string {
  const {
    titulo,
    subtitulo,
    metaLeft,
    metaCenter,
    metaRight,
    badgeText,
    background,
    backgroundImageUrl,
    elements,
    style,
  } = config

  const titleLen = titulo.length
  const titleFontSize = titleLen <= 35 ? 72 : titleLen <= 50 ? 64 : titleLen <= 70 ? 52 : 44

  // Posicionar logos no centro do slide
  const logoElements = elements
    .filter(el => el.url)
    .map((el, i, arr) => {
      if (arr.length === 1) {
        // Logo unico: centralizado
        return `<img src="${el.url}" alt="${el.query}" style="max-width: 320px; max-height: 320px; object-fit: contain; filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));" />`
      }
      if (arr.length === 2) {
        // Dois logos: lado a lado com seta
        if (i === 0) {
          return `<img src="${el.url}" alt="${el.query}" style="max-width: 240px; max-height: 240px; object-fit: contain; filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));" />`
        }
        return `
          <div style="display: flex; align-items: center; justify-content: center; margin: 0 32px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
          <img src="${el.url}" alt="${el.query}" style="max-width: 240px; max-height: 240px; object-fit: contain; filter: drop-shadow(0 0 20px rgba(255,255,255,0.3));" />`
      }
      // 3+ logos: grid
      return `<img src="${el.url}" alt="${el.query}" style="max-width: 180px; max-height: 180px; object-fit: contain; filter: drop-shadow(0 0 15px rgba(255,255,255,0.2));" />`
    })
    .join('\n')

  const hasLogos = elements.some(el => el.url)

  // Estilo breaking-news
  const breakingBadge =
    style === 'breaking-news'
      ? `<div style="position: absolute; top: 110px; left: 68px; background: #e63946; color: white; padding: 8px 20px; font-size: 14px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">BREAKING</div>`
      : ''

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
      background: ${background};
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    .bg-photo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .bg-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.45) 0%,
        rgba(0, 0, 0, 0.25) 30%,
        rgba(0, 0, 0, 0.50) 55%,
        rgba(0, 0, 0, 0.85) 100%
      );
    }

    .content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 56px 68px 64px;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .meta-item {
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
    }

    .logos-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 40px 0;
    }

    .text-area {
      margin-top: auto;
    }

    .subtitle {
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .title {
      font-size: ${titleFontSize}px;
      font-weight: 700;
      line-height: 1.08;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 44px;
      letter-spacing: -0.5px;
    }

    .badge {
      display: inline-block;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
    }
  </style>
</head>
<body>
  <div class="slide">${backgroundImageUrl ? `
    <img class="bg-photo" src="${backgroundImageUrl}" alt="" />
    <div class="bg-overlay"></div>` : ''}
    <div class="content">
      <div class="top-bar">
        <span class="meta-item">${metaLeft}</span>
        <span class="meta-item">${metaCenter}</span>
        <span class="meta-item">${metaRight}</span>
      </div>

      ${breakingBadge}

      ${hasLogos ? `<div class="logos-area">${logoElements}</div>` : '<div style="flex:1;"></div>'}

      <div class="text-area">
        ${subtitulo ? `<div class="subtitle">${subtitulo}</div>` : ''}
        <h1 class="title">${titulo}</h1>
        ${badgeText ? `<div class="badge">${badgeText}</div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
}
