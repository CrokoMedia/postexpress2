/**
 * Template Renderer
 * Renderiza templates HTML com variáveis dinâmicas
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Renderiza um template HTML com dados
 * @param {string} templatePath - Caminho do template
 * @param {Object} data - Dados para substituir no template
 * @returns {Promise<string>} HTML renderizado
 */
export async function renderTemplate(templatePath, data) {
  let template = await readFile(templatePath, 'utf-8');

  // Substituir variáveis simples {{VAR}}
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value ?? '');
  }

  // Remover blocos condicionais vazios {{#VAR}}...{{/VAR}}
  template = template.replace(/{{#(\w+)}}[\s\S]*?{{\/\1}}/g, (match, varName) => {
    if (data[varName]) {
      // Variável existe, remover apenas as tags condicionais
      return match.replace(`{{#${varName}}}`, '').replace(`{{/${varName}}}`, '');
    }
    // Variável não existe, remover bloco inteiro
    return '';
  });

  return template;
}

/**
 * Gera dados para templates BrandsDecoded (3 parágrafos + autor)
 * @param {Object} content - Conteúdo do slide
 * @returns {Object} Dados para o template
 */
export function generateBrandsDecodedData(content) {
  return {
    paragraph1: content.paragraphs?.[0] || '',
    paragraph2: content.paragraphs?.[1] || '',
    paragraph3: content.paragraphs?.[2] || '',
    authorName: content.author?.name || 'Seu Nome',
    authorHandle: content.author?.handle || '@seuinstagram'
  };
}

/**
 * Gera dados do template baseado no estilo e formato
 * @param {Object} content - Conteúdo do slide
 * @param {Object} style - Configuração de estilo
 * @param {Object} format - Configuração de formato
 * @returns {Object} Dados para o template
 */
export function generateTemplateData(content, style, format) {
  // Se for template BrandsDecoded, usar função específica
  if (style.template && style.template.includes('brands-decoded')) {
    return generateBrandsDecodedData(content);
  }
  const data = {
    // Dimensões
    WIDTH: format.width,
    HEIGHT: format.height,

    // Conteúdo
    TITLE: content.title || '',
    SUBTITLE: content.subtitle || '',
    TEXT: content.text || '',
    CTA: content.cta || '',
    IMAGE_URL: content.imageUrl || '',

    // Fonte
    FONT_FAMILY: style.fontFamily,

    // Tamanhos de fonte
    TITLE_FONT_SIZE: style.fontSize.title,
    SUBTITLE_FONT_SIZE: style.fontSize.subtitle,
    TEXT_FONT_SIZE: style.fontSize.text,
    CTA_FONT_SIZE: style.fontSize.cta,

    // Pesos de fonte
    TITLE_FONT_WEIGHT: typeof style.fontWeight === 'object' ? style.fontWeight.title : style.fontWeight,
    SUBTITLE_FONT_WEIGHT: typeof style.fontWeight === 'object' ? style.fontWeight.subtitle : style.fontWeight,
    TEXT_FONT_WEIGHT: typeof style.fontWeight === 'object' ? style.fontWeight.text : style.fontWeight,
    CTA_FONT_WEIGHT: typeof style.fontWeight === 'object' ? style.fontWeight.cta : style.fontWeight,

    // Espaçamento
    LINE_HEIGHT: style.lineHeight,
    LETTER_SPACING: style.letterSpacing || '0',
    PADDING_HORIZONTAL: style.padding.horizontal,
    PADDING_VERTICAL: style.padding.vertical,
    CONTENT_GAP: style.padding.content,

    // Largura do conteúdo
    CONTENT_WIDTH: format.width - (style.padding.horizontal * 2),

    // Cores
    BACKGROUND: content.background || style.background || '#FFFFFF',
    TITLE_COLOR: content.accentColor || style.textColor,
    SUBTITLE_COLOR: content.accentColor || style.accentColor || style.textColor,
    TEXT_COLOR: style.textColor,
    CTA_COLOR: content.accentColor || style.accentColor || style.textColor,

    // Classes CSS
    GRADIENT_CLASS: content.background && content.background.startsWith('gradient-') ? content.background : '',
    TITLE_ACCENT_CLASS: getAccentClass(content.accentColor),
    SUBTITLE_ACCENT_CLASS: getAccentClass(content.accentColor),
    TEXT_CLASS: content.underline ? 'underline' : '',

    // Alinhamento
    TEXT_ALIGN: style.textAlign || 'center',
    CTA_ALIGN: style.ctaAlign || 'center',

    // Margens
    TITLE_MARGIN: 10,
    SUBTITLE_MARGIN: 30,
    IMAGE_MARGIN_TOP: 40,

    // Border radius
    BORDER_RADIUS: style.borderRadius,
  };

  return data;
}

/**
 * Retorna a classe CSS de accent baseada na cor
 * @param {string} color - Cor em hex
 * @returns {string} Classe CSS
 */
function getAccentClass(color) {
  if (!color) return '';

  const colorMap = {
    '#E74C3C': 'accent-vermelho',
    '#3498DB': 'accent-azul',
    '#FFD23F': 'accent-dourado',
    '#2ECC71': 'accent-verde',
    '#000000': 'accent-preto',
  };

  return colorMap[color.toUpperCase()] || '';
}
