import type { TemplateConfig } from './types'

/**
 * Template Hormozi Dark Bold — fundo escuro navy, texto gold, impacto visual.
 * Ideal para: vendas, ofertas, CTAs diretos.
 * Sem imagem — foco 100% no texto.
 */
export const hormoziDarkTemplate: TemplateConfig = {
  id: 'hormozi-dark',
  name: 'Hormozi Dark',
  description: 'Fundo escuro, texto dourado. Impacto para vendas e CTAs.',
  thumbnail: '/templates/hormozi-dark-thumb.png',
  colors: {
    background: '#1a1a2e',
    title: '#ffd700',
    body: '#ffffff',
    accent: '#ffd700',
    headerName: '#ffffff',
    headerUsername: '#9ca3af',
    headerBorder: '#ffd700',
    footerText: '#9ca3af',
    footerBorder: 'rgba(255, 215, 0, 0.3)',
    imagePlaceholderGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
  },
  typography: {
    titleSize: 48,
    titleWeight: 700,
    bodySize: 26,
    bodyWeight: 400,
    nameSize: 36,
    usernameSize: 30,
  },
  layout: {
    showImage: false,
    showBody: true,
    showHeader: true,
    imagePosition: 'none',
    padding: '40px 62px',
  },
  badge: {
    fill: '#ffd700',
    checkColor: '#1a1a2e',
  },
}
