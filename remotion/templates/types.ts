/**
 * Template configuration interface for carousel slide rendering.
 * Each template defines colors, typography, layout and animation behavior.
 */

export interface TemplateConfig {
  id: string
  name: string
  description: string
  thumbnail: string // path or URL for preview
  colors: {
    background: string
    title: string
    body: string
    accent: string
    headerName: string
    headerUsername: string
    headerBorder: string
    footerText: string
    footerBorder: string
    imagePlaceholderGradient: string
  }
  typography: {
    titleSize: number
    titleWeight: number
    bodySize: number
    bodyWeight: number
    nameSize: number
    usernameSize: number
  }
  layout: {
    showImage: boolean
    showBody: boolean
    showHeader: boolean
    imageOverlay?: boolean
    imagePosition: 'bottom' | 'background' | 'none'
    padding: string
  }
  badge: {
    fill: string
    checkColor: string
  }
}

export type TemplateId = 'minimalist' | 'hormozi-dark' | 'editorial-magazine' | 'neon-social' | 'data-driven'
