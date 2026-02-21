/**
 * Substitui emojis no texto por imagens Apple Emoji embutidas como base64.
 * Os PNGs são baixados do CDN emoji-datasource-apple no servidor antes de gerar o HTML.
 * Isso garante que as imagens estejam disponíveis no Puppeteer sem dependência de rede.
 */

const EMOJI_CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64'

// Cache em memória para reutilizar em múltiplos slides da mesma requisição
const base64Cache = new Map<string, string>()

function isEmojiSegment(segment: string): boolean {
  // Exclui dígitos simples (0-9, #, *) que tecnicamente têm propriedade emoji
  if (/^[0-9#*]$/.test(segment)) return false
  // Cobre a maioria dos emojis (😀🔥💪✨) e emojis de texto com variante (☺️✂️)
  return /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u.test(segment)
}

function emojiToCodepoint(emoji: string): string {
  return [...emoji]
    .map(c => c.codePointAt(0)!.toString(16))
    .join('-')
}

async function fetchEmojiBase64(codepoint: string): Promise<string | null> {
  if (base64Cache.has(codepoint)) {
    return base64Cache.get(codepoint)!
  }

  const url = `${EMOJI_CDN}/${codepoint}.png`

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) {
      console.log(`⚠️  Emoji não encontrado: ${codepoint} (${url})`)
      return null
    }

    const buffer = await response.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:image/png;base64,${b64}`
    base64Cache.set(codepoint, dataUrl)
    console.log(`✅ Emoji baixado: ${codepoint}`)
    return dataUrl
  } catch (error) {
    console.error(`❌ Erro ao baixar emoji ${codepoint}:`, error)
    return null
  }
}

export async function replaceEmojisWithAppleImages(text: string): Promise<string> {
  console.log(`🔄 Processando texto para emojis: "${text.substring(0, 100)}..."`)
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  const segments = [...segmenter.segment(text)]

  // Coletar emojis únicos
  const uniqueEmojis = [...new Set(
    segments
      .filter(({ segment }) => isEmojiSegment(segment))
      .map(({ segment }) => segment)
  )]

  // Pré-baixar todas as imagens em paralelo
  const emojiDataUrls = new Map<string, string | null>()
  await Promise.all(uniqueEmojis.map(async (emoji) => {
    const codepoint = emojiToCodepoint(emoji)
    const dataUrl = await fetchEmojiBase64(codepoint)

    // Se codepoint com FE0F não funcionou, tentar sem FE0F
    if (!dataUrl && codepoint.includes('fe0f')) {
      const withoutFe0f = codepoint.replace(/-?fe0f/g, '')
      const fallback = await fetchEmojiBase64(withoutFe0f)
      emojiDataUrls.set(emoji, fallback)
    } else {
      emojiDataUrls.set(emoji, dataUrl)
    }
  }))

  // Montar o HTML final
  const result: string[] = []
  for (const { segment } of segments) {
    if (isEmojiSegment(segment)) {
      const dataUrl = emojiDataUrls.get(segment)
      if (dataUrl) {
        result.push(
          `<img src="${dataUrl}" alt="${segment}" ` +
          `style="height:1em;width:1em;margin:0 0.05em;vertical-align:-0.15em;display:inline;" />`
        )
      } else {
        // Fallback: mostra o caractere de texto (sistema renderiza com Apple/Noto)
        result.push(segment)
      }
    } else {
      result.push(segment)
    }
  }

  return result.join('')
}
