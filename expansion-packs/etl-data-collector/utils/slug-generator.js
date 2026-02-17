/**
 * Slug Generator — ETL Data Collector
 * Gera slugs semânticos para organização de fontes
 */

const slugify = require('slugify');

/**
 * Gera slug semântico a partir de título ou URL
 * Exemplos:
 *   "How to Build a Brand" → "how-to-build-a-brand"
 *   "https://garyvaynerchuk.com/article/" → "garyvaynerchuk-article"
 */
function generateSlug(input, options = {}) {
  const maxLength = options.maxLength || 80;

  let text = input;

  // Se for URL, extrair parte relevante
  if (input.startsWith('http')) {
    try {
      const url = new URL(input);
      const pathParts = url.pathname
        .split('/')
        .filter(Boolean)
        .filter(p => p.length > 2);
      text = pathParts.join(' ') || url.hostname.replace('www.', '');
    } catch {
      text = input;
    }
  }

  const slug = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-',
  });

  return slug.slice(0, maxLength).replace(/-+$/, '');
}

/**
 * Gera slug para vídeo YouTube a partir do título
 * Ex: "GaryVee on Attention" → "garyvee-on-attention"
 */
function generateYouTubeSlug(videoId, title) {
  if (title) {
    return generateSlug(title);
  }
  return `youtube-${videoId}`;
}

/**
 * Gera slug para blog a partir da URL
 * Ex: "https://garyvaynerchuk.com/patience-is-key/" → "patience-is-key"
 */
function generateBlogSlug(url, title) {
  if (title) {
    return generateSlug(title);
  }
  return generateSlug(url);
}

/**
 * Gera slug para PDF a partir do nome do arquivo ou título
 */
function generatePDFSlug(filePath, title) {
  if (title) {
    return generateSlug(title);
  }
  const fileName = filePath.split('/').pop().replace(/\.pdf$/i, '');
  return generateSlug(fileName);
}

module.exports = {
  generateSlug,
  generateYouTubeSlug,
  generateBlogSlug,
  generatePDFSlug,
};
