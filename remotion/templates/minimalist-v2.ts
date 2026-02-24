import type { TemplateConfig } from './types'

/**
 * Template Minimalista V2 — Imagem sempre abaixo do conteúdo.
 * Layout focado em conteúdo com imagem de suporte 956x470 na parte inferior.
 */
export const minimalistV2Template: TemplateConfig = {
  id: 'minimalist-v2',
  name: 'Minimalista V2',
  description: 'Conteúdo em destaque, imagem sempre abaixo (956x470px)',
  thumbnail: '/templates/minimalist-v2-thumb.png',
  colors: {
    background: '#ffffff',
    title: '#0f1419',
    body: '#0f1419',
    accent: '#667eea',
    headerName: '#0f1419',
    headerUsername: '#536471',
    headerBorder: '#e1e4e8',
    footerText: '#536471',
    footerBorder: '#eff3f4',
    imagePlaceholderGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  typography: {
    titleSize: 42,
    titleWeight: 700,
    bodySize: 32,
    bodyWeight: 400,
    nameSize: 36,
    usernameSize: 30,
  },
  layout: {
    showImage: true,
    showBody: true,
    showHeader: true,
    imagePosition: 'bottom', // SEMPRE abaixo do conteúdo
    padding: '40px 62px',
  },
  badge: {
    fill: '#1D9BF0',
    checkColor: 'white',
  },
}
