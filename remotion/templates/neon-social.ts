import type { TemplateConfig } from './types'

/**
 * Template Neon Social — gradiente vibrante purple→pink, glow neon no texto.
 * Ideal para: virais, trends, lifestyle, conteúdo engajador.
 */
export const neonSocialTemplate: TemplateConfig = {
  id: 'neon-social',
  name: 'Neon Social',
  description: 'Gradiente vibrante com glow neon. Perfeito para virais e trends.',
  thumbnail: '/templates/neon-social-thumb.png',
  colors: {
    background: '#7c3aed',
    title: '#ffffff',
    body: 'rgba(255, 255, 255, 0.9)',
    accent: '#ec4899',
    headerName: '#ffffff',
    headerUsername: 'rgba(255, 255, 255, 0.75)',
    headerBorder: 'rgba(255, 255, 255, 0.3)',
    footerText: 'rgba(255, 255, 255, 0.7)',
    footerBorder: 'rgba(255, 255, 255, 0.2)',
    imagePlaceholderGradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
  },
  typography: {
    titleSize: 44,
    titleWeight: 700,
    bodySize: 24,
    bodyWeight: 400,
    nameSize: 36,
    usernameSize: 30,
  },
  layout: {
    showImage: true,
    showBody: true,
    showHeader: true,
    imagePosition: 'bottom',
    padding: '40px 62px',
  },
  badge: {
    fill: '#ec4899',
    checkColor: '#ffffff',
  },
}
