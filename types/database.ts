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
