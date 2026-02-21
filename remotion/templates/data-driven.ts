import type { TemplateConfig } from './types'

/**
 * Template Data Driven — fundo clean branco/cinza, foco em texto e números.
 * Sem imagem por padrão. Ideal para: resultados, métricas, comparações, dados.
 */
export const dataDrivenTemplate: TemplateConfig = {
  id: 'data-driven',
  name: 'Data Driven',
  description: 'Layout corporativo limpo, foco em dados e métricas. Sem imagem.',
  thumbnail: '/templates/data-driven-thumb.png',
  colors: {
    background: '#f8fafc',
    title: '#1e293b',
    body: '#475569',
    accent: '#3b82f6',
    headerName: '#1e293b',
    headerUsername: '#64748b',
    headerBorder: '#e2e8f0',
    footerText: '#94a3b8',
    footerBorder: '#e2e8f0',
    imagePlaceholderGradient: 'linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%)',
  },
  typography: {
    titleSize: 52,
    titleWeight: 700,
    bodySize: 24,
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
    fill: '#3b82f6',
    checkColor: '#ffffff',
  },
}
