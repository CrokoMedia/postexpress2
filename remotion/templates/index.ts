/**
 * Template Registry — central hub for all carousel templates.
 */

import type { TemplateConfig, TemplateId } from './types'
import { minimalistTemplate } from './minimalist'
import { hormoziDarkTemplate } from './hormozi-dark'
import { editorialMagazineTemplate } from './editorial-magazine'
import { neonSocialTemplate } from './neon-social'
import { dataDrivenTemplate } from './data-driven'

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  'minimalist': minimalistTemplate,
  'hormozi-dark': hormoziDarkTemplate,
  'editorial-magazine': editorialMagazineTemplate,
  'neon-social': neonSocialTemplate,
  'data-driven': dataDrivenTemplate,
}

export const TEMPLATE_LIST: TemplateConfig[] = Object.values(TEMPLATES)

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES[id as TemplateId] || minimalistTemplate
}

export { type TemplateConfig, type TemplateId } from './types'
