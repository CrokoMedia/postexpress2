import type { TemplateConfig } from './types'

/**
 * Template Editorial Magazine — imagem full-bleed com gradient overlay.
 * Migrado do HTML editorial-cover.ts para o sistema Remotion.
 * Ideal para: storytelling, cases, depoimentos.
 */
export const editorialMagazineTemplate: TemplateConfig = {
  id: 'editorial-magazine',
  name: 'Editorial Magazine',
  description: 'Imagem de fundo com texto sobre gradient. Storytelling visual.',
  thumbnail: '/templates/editorial-magazine-thumb.png',
  colors: {
    background: '#000000',
    title: '#ffffff',
    body: 'rgba(255, 255, 255, 0.85)',
    accent: 'rgba(255, 255, 255, 0.6)',
    headerName: '#ffffff',
    headerUsername: 'rgba(255, 255, 255, 0.7)',
    headerBorder: 'rgba(255, 255, 255, 0.3)',
    footerText: 'rgba(255, 255, 255, 0.6)',
    footerBorder: 'rgba(255, 255, 255, 0.2)',
    imagePlaceholderGradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
  },
  typography: {
    titleSize: 48,
    titleWeight: 700,
    bodySize: 28,
    bodyWeight: 400,
    nameSize: 36,
    usernameSize: 30,
  },
  layout: {
    showImage: true,
    showBody: false,
    showHeader: true,
    imageOverlay: true,
    imagePosition: 'background',
    padding: '56px 68px',
  },
  badge: {
    fill: '#ffffff',
    checkColor: '#000000',
  },
}
