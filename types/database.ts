// Database types based on optimized-schema.sql

export type PostType = 'Image' | 'Video' | 'Sidecar' | 'Reels' | 'Story'
export type AuditType = 'express' | 'complete' | 'quick' | 'deep'
export type CommentCategory = 'perguntas' | 'elogios' | 'duvidas' | 'experiencias' | 'criticas' | 'outros'
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type AuditClassification = 'CRÍTICO' | 'RUIM' | 'MEDIANO' | 'BOM' | 'EXCELENTE' | 'EXTRAORDINÁRIO'
export type CarouselType = 'educacional' | 'vendas' | 'autoridade' | 'viral'
export type SlideType = 'hook' | 'conteudo' | 'contexto' | 'ponto' | 'aplicacao' | 'cta' | 'closer'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  biography: string | null
  external_url: string | null
  followers_count: number | null
  following_count: number | null
  posts_count: number | null
  profile_pic_url: string | null
  profile_pic_url_hd: string | null
  profile_pic_cloudinary_url: string | null
  url: string | null
  is_verified: boolean
  is_private: boolean
  is_business_account: boolean
  business_category: string | null
  category_enum: string | null
  contact_phone_number: string | null
  contact_email: string | null
  first_scraped_at: string
  last_scraped_at: string
  total_audits: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Audit {
  id: string
  profile_id: string
  audit_date: string
  audit_type: AuditType
  posts_analyzed: number | null
  audit_duration_seconds: number | null
  gemini_cost_usd: number | null
  total_api_calls: number | null
  total_tokens_used: number | null
  score_overall: number | null
  classification: AuditClassification | null
  score_behavior: number | null
  score_copy: number | null
  score_offers: number | null
  score_metrics: number | null
  score_anomalies: number | null
  engagement_rate: number | null
  total_likes: number | null
  total_comments: number | null
  avg_likes_per_post: number | null
  avg_comments_per_post: number | null
  snapshot_followers: number | null
  snapshot_following: number | null
  snapshot_posts_count: number | null
  raw_json: any
  top_strengths: any[]
  critical_problems: any[]
  quick_wins: any[]
  strategic_moves: any[]
  hypotheses: any[]
  audit_summary: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  audit_id: string
  post_id: string | null
  short_code: string | null
  post_url: string
  post_type: PostType | null
  caption: string | null
  hashtags: string[] | null
  mentions: string[] | null
  accessibility_caption: string | null
  location_name: string | null
  likes_count: number | null
  comments_count: number | null
  video_view_count: number | null
  is_pinned: boolean
  post_timestamp: string | null
  display_url: string | null
  images: string[] | null
  video_url: string | null
  ocr_total_images: number
  ocr_analyzed: number
  ocr_data: any
  comments_total: number
  comments_relevant: number
  comments_raw: any
  comments_categorized: any
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  comment_id: string | null
  text: string
  owner_username: string | null
  owner_id: string | null
  owner_profile_pic_url: string | null
  owner_is_verified: boolean
  replied_to_comment_id: string | null
  reply_level: number
  likes_count: number
  category: CommentCategory
  is_relevant: boolean
  sentiment_score: number | null
  comment_timestamp: string | null
  deleted_at: string | null
  created_at: string
}

export interface Comparison {
  id: string
  profile_id: string
  audit_before_id: string
  audit_after_id: string
  days_between: number | null
  date_before: string
  date_after: string
  growth_followers: number | null
  growth_followers_pct: number | null
  growth_engagement: number | null
  growth_avg_likes: number | null
  growth_avg_comments: number | null
  improvement_overall: number | null
  improvement_behavior: number | null
  improvement_copy: number | null
  improvement_offers: number | null
  improvement_metrics: number | null
  improvement_anomalies: number | null
  problems_solved: any[]
  wins_implemented: any[]
  roi_summary: string | null
  full_comparison: any
  deleted_at: string | null
  created_at: string
}

export interface AnalysisQueue {
  id: string
  username: string
  post_limit: number
  skip_ocr: boolean
  audit_type: AuditType
  priority: number
  status: QueueStatus
  progress: number
  current_phase: string | null
  profile_id: string | null
  audit_id: string | null
  error_message: string | null
  error_stack: string | null
  retry_count: number
  started_at: string | null
  completed_at: string | null
  estimated_completion_at: string | null
  worker_id: string | null
  worker_ip: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// API Response types
export interface ProfileWithLatestAudit extends Profile {
  latest_audit: Audit | null
}

export interface AuditWithProfile extends Audit {
  profile: Profile
}

export interface ComparisonWithAudits extends Comparison {
  audit_before: Audit
  audit_after: Audit
  profile: Profile
}

// ============================================
// CONTENT SUGGESTIONS & CAROUSELS
// ============================================

export interface CarouselSlide {
  numero: number
  tipo: SlideType
  titulo: string
  corpo: string
  subtitulo?: string
  notas_design?: string
  design?: {
    background?: string
    textColor?: string
    accentColor?: string
    layout?: string
    fontSize?: string
    fontWeight?: string
  }
}

export interface Carousel {
  titulo: string
  tipo: CarouselType
  objetivo: string
  baseado_em: string
  approved?: boolean | null  // Campo de aprovação (null = não revisado, true = aprovado, false = rejeitado)
  slides: CarouselSlide[]
  caption: string
  hashtags: string[]
  cta: string
}

export interface ContentSuggestionData {
  carousels: Carousel[]
  estrategia_geral: string
  proximos_passos: string[]
}

export interface SlideImage {
  slideNumber: number
  localPath?: string
  cloudinaryUrl: string
  cloudinaryPublicId: string
  width: number
  height: number
  size: number
}

export interface GeneratedCarouselSlides {
  carouselIndex: number
  carouselName: string
  title: string
  approved: boolean
  slides: SlideImage[]
  totalSlides: number
}

export interface SlidesData {
  carousels: GeneratedCarouselSlides[]
  summary: {
    totalCarousels: number
    totalSlides: number
  }
  generated_at: string
}

export interface ContentSuggestion {
  id: string
  audit_id: string
  profile_id: string
  content_json: ContentSuggestionData
  slides_json: SlidesData | null
  generated_at: string
  created_at: string
  updated_at: string
}

export interface ContentSuggestionWithRelations extends ContentSuggestion {
  audit: Audit
  profile: Profile
}

// ============================================
// USER PROFILE CONTEXT (Estrutura Completa)
// ============================================

export interface UserProfileIdentity {
  fullName?: string
  displayName?: string
  positioning?: string
  niche?: string[]
  avatar?: string
  toneOfVoice?: string
}

export interface UserProfileCredibility {
  experience?: string
  achievements?: string[]
  expertise?: string[]
}

export interface UserProfilePhilosophy {
  values?: string[]
  beliefs?: string
  defends?: string
  rejects?: string
}

export interface UserProfileContentLanguage {
  formality?: string // 'formal' | 'casual' | 'técnico'
  emojis?: boolean
  storytelling?: string
  termsToAvoid?: string[] // Termos técnicos, jargões, palavras em inglês que o público não entende
}

export interface UserProfileContentStyle {
  preferredFormats?: string[]
  structure?: string
  language?: UserProfileContentLanguage
}

export interface UserProfileContentPillar {
  name: string
  subtopics: string[]
}

export interface UserProfileProduct {
  name: string
  price: string
  target: string
  cta: string
}

export interface UserProfileBusiness {
  products?: UserProfileProduct[]
}

export interface UserProfileDNA {
  energy?: string
  uniqueVoice?: string
  transformation?: string
}

export interface UserProfile {
  // Identidade
  identity?: UserProfileIdentity

  // Credibilidade
  credibility?: UserProfileCredibility

  // Filosofia
  philosophy?: UserProfilePhilosophy

  // Estilo de Conteúdo
  contentStyle?: UserProfileContentStyle

  // Pilares de Conteúdo
  contentPillars?: UserProfileContentPillar[]

  // Negócio
  business?: UserProfileBusiness

  // DNA
  dna?: UserProfileDNA
}

export interface ProfileContext {
  id: string
  profile_id: string

  // Campos legados (manter compatibilidade)
  nicho?: string | null
  objetivos?: string | null
  publico_alvo?: string | null
  produtos_servicos?: string | null
  tom_voz?: string | null
  contexto_adicional?: string | null
  files?: any[]
  documents?: any[]
  raw_text?: string | null

  // Nova estrutura completa
  identity?: UserProfileIdentity
  credibility?: UserProfileCredibility
  philosophy?: UserProfilePhilosophy
  content_style?: UserProfileContentStyle
  content_pillars?: UserProfileContentPillar[]
  business?: UserProfileBusiness
  dna?: UserProfileDNA

  // Metadados
  last_used_in_audit_at?: string | null
  last_used_in_content_at?: string | null
  usage_count?: number
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// BRAND KITS - Identidade Visual
// ============================================

export interface ColorPaletteItem {
  name: string
  hex: string
  usage: string
}

export interface TypographyFont {
  family: string
  weight: string
  size: string
}

export interface Typography {
  heading: TypographyFont
  body: TypographyFont
  accent: TypographyFont
}

export interface BrandLinks {
  website?: string | null
  instagram?: string | null
  linktree?: string | null
  youtube?: string | null
  tiktok?: string | null
  linkedin?: string | null
}

export interface ToneOfVoice {
  characteristics?: string[]
  examples?: string[]
  avoid?: string[]
}

export interface BrandKit {
  id: string
  profile_id: string
  brand_name: string
  is_default: boolean

  // Cores (formato HEX: #RRGGBB)
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  background_color: string | null
  text_color: string | null

  // Logo (Cloudinary)
  logo_url: string | null
  logo_public_id: string | null

  // Tipografia
  primary_font: string | null
  secondary_font: string | null

  // Tom de voz (JSONB)
  tone_of_voice: ToneOfVoice | null

  // Soft delete
  deleted_at: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface CreateBrandKitPayload {
  profile_id: string
  brand_name: string
  is_default?: boolean

  // Cores
  primary_color?: string | null
  secondary_color?: string | null
  accent_color?: string | null
  background_color?: string | null
  text_color?: string | null

  // Logo
  logo_url?: string | null
  logo_public_id?: string | null

  // Tipografia
  primary_font?: string | null
  secondary_font?: string | null

  // Tom de voz
  tone_of_voice?: ToneOfVoice | null
}

export interface UpdateBrandKitPayload extends Partial<CreateBrandKitPayload> {}
