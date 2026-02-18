/**
 * Substitui emojis no texto por imagens Apple Emoji via CDN (emoji-datasource-apple).
 * Funciona tanto em macOS (local) quanto em Linux/Vercel (produção).
 */

const EMOJI_CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64'

function isEmojiSegment(segment: string): boolean {
  return /\p{Extended_Pictographic}/u.test(segment)
}

function emojiToCodepoint(emoji: string): string {
  return [...emoji]
    .map(c => c.codePointAt(0)!.toString(16))
    .join('-')
}

export function replaceEmojisWithAppleImages(text: string): string {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
  const result: string[] = []

  for (const { segment } of segmenter.segment(text)) {
    if (isEmojiSegment(segment)) {
      const codepoint = emojiToCodepoint(segment)
      result.push(
        `<img src="${EMOJI_CDN}/${codepoint}.png" ` +
        `alt="${segment}" ` +
        `style="height:1.1em;width:1.1em;margin:0 0.05em 0 0.1em;vertical-align:-0.2em;display:inline-block;" ` +
        `onerror="this.style.display='none'" />`
      )
    } else {
      result.push(segment)
    }
  }

  return result.join('')
}
