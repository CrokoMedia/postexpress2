/**
 * Supabase Data Saver
 *
 * Funções para salvar dados de análise no Supabase seguindo o schema otimizado
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client com service role para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export interface AnalysisData {
  username: string
  profile: any
  metrics: any
  posts: any[]
  audit?: any
}

/**
 * Salva ou atualiza perfil do Instagram
 */
export async function saveProfile(profileData: any) {
  const {
    username,
    fullName,
    biography,
    followersCount,
    followsCount,
    postsCount,
    profilePicUrl,
    profilePicUrlHD,
    url,
    verified,
    isBusinessAccount,
    businessCategoryName
  } = profileData

  // Validar dados críticos
  if (!username) {
    throw new Error('Username is required to save profile')
  }

  // Log warning se foto de perfil estiver faltando
  if (!profilePicUrl && !profilePicUrlHD) {
    console.warn(`⚠️  Profile picture missing for @${username}`)
  }

  // Verificar se perfil já existe
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  const profilePayload = {
    full_name: fullName || null,
    biography: biography || null,
    followers_count: followersCount || null,
    following_count: followsCount || null,
    posts_count: postsCount || null,
    profile_pic_url: profilePicUrl || null,
    profile_pic_url_hd: profilePicUrlHD || null,
    url: url || null,
    is_verified: verified || false,
    is_business_account: isBusinessAccount || false,
    business_category: businessCategoryName || null,
    last_scraped_at: new Date().toISOString()
  }

  if (existing) {
    // Atualizar (não sobrescrever foto se nova estiver vazia e antiga existir)
    const { data: currentData } = await supabase
      .from('profiles')
      .select('profile_pic_url, profile_pic_url_hd')
      .eq('id', existing.id)
      .single()

    // Preservar foto antiga se nova estiver vazia
    if (currentData) {
      if (!profilePayload.profile_pic_url && currentData.profile_pic_url) {
        profilePayload.profile_pic_url = currentData.profile_pic_url
      }
      if (!profilePayload.profile_pic_url_hd && currentData.profile_pic_url_hd) {
        profilePayload.profile_pic_url_hd = currentData.profile_pic_url_hd
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profilePayload)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    console.log(`✅ Profile @${username} updated successfully`)
    return data
  } else {
    // Criar novo
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        username,
        ...profilePayload,
        first_scraped_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    console.log(`✅ Profile @${username} created successfully`)
    return data
  }
}

/**
 * Salva auditoria completa
 */
export async function saveAudit(profileId: string, auditData: any, rawData: any) {
  const scoreCard = auditData.score_card || {}
  const auditorsAnalysis = auditData.auditors_analysis || {}
  const dimensions = scoreCard.dimensions || {}
  const metrics = auditData.metrics || rawData.metrics || {}

  const { data, error } = await supabase
    .from('audits')
    .insert({
      profile_id: profileId,
      audit_date: new Date().toISOString(),
      audit_type: auditData.audit_metadata?.audit_type || 'express',
      posts_analyzed: auditData.posts_analyzed || metrics.posts_analyzed || rawData.posts?.length || 0,

      // Scores (corrigidos para usar os nomes corretos do JSON)
      score_overall: scoreCard.overall_score || 0,
      classification: scoreCard.classification || 'DESCONHECIDO',
      score_behavior: dimensions.behavior?.score || auditorsAnalysis.behavior?.score || 0,
      score_copy: dimensions.copy?.score || auditorsAnalysis.copy?.score || 0,
      score_offers: dimensions.offers?.score || auditorsAnalysis.offers?.score || 0,
      score_metrics: dimensions.metrics?.score || auditorsAnalysis.metrics?.score || 0,
      score_anomalies: dimensions.anomalies?.score || auditorsAnalysis.anomalies?.score || 0,

      // Métricas de engajamento (corrigidos para snake_case)
      engagement_rate: parseFloat(metrics.engagement_rate || metrics.engagementRate || '0') || 0,
      total_likes: metrics.total_likes || metrics.totalLikes || 0,
      total_comments: metrics.total_comments_extracted || metrics.totalComments || 0,
      avg_likes_per_post: metrics.avg_likes_per_post || metrics.avgLikes || 0,
      avg_comments_per_post: metrics.avg_comments_per_post || metrics.avgComments || 0,

      // Snapshot do perfil (suporta ambos os formatos)
      snapshot_followers: auditData.profile?.followers_count || rawData.profile?.followersCount || rawData.profile?.followers_count || 0,
      snapshot_following: auditData.profile?.following_count || rawData.profile?.followsCount || rawData.profile?.following_count || 0,
      snapshot_posts_count: auditData.profile?.posts_count || rawData.profile?.postsCount || rawData.profile?.posts_count || 0,

      // Dados completos em JSON
      raw_json: auditData,
      top_strengths: auditData.top_strengths || [],
      critical_problems: auditData.critical_problems || [],
      quick_wins: auditData.quick_wins || [],
      strategic_moves: auditData.strategic_moves || [],
      hypotheses: auditData.hypotheses || []
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Salva posts individuais
 */
export async function savePosts(auditId: string, posts: any[]) {
  const postsToInsert = posts.map(post => ({
    audit_id: auditId,
    post_id: post.id,
    short_code: post.shortCode,
    post_url: post.url,
    post_type: post.type,
    caption: post.caption,
    hashtags: post.hashtags || [],
    mentions: post.mentions || [],
    likes_count: post.likesCount,
    comments_count: post.commentsCount,
    post_timestamp: post.timestamp,
    display_url: post.displayUrl,
    images: post.images || [],

    // OCR
    ocr_total_images: post.ocr?.totalImages || 0,
    ocr_analyzed: post.ocr?.analyzed || 0,
    ocr_data: post.ocr?.images || [],

    // Comentários
    comments_total: post.comments?.total || 0,
    comments_relevant: post.comments?.relevant || 0,
    comments_raw: post.comments?.raw || [],
    comments_categorized: post.comments?.categorized || {}
  }))

  const { data, error } = await supabase
    .from('posts')
    .insert(postsToInsert)
    .select()

  if (error) throw error
  return data
}

/**
 * Salva comentários individuais
 */
export async function saveComments(posts: any[]) {
  const commentsToInsert: any[] = []

  for (const post of posts) {
    const postId = post.id // ID do Supabase, não do Instagram

    const rawComments = post.comments?.raw || []

    for (const comment of rawComments) {
      commentsToInsert.push({
        post_id: postId,
        comment_id: comment.id,
        text: comment.text,
        owner_username: comment.ownerUsername,
        owner_id: comment.owner?.id,
        likes_count: comment.likesCount || 0,
        category: categorizeComment(comment.text),
        is_relevant: isRelevantComment(comment.text),
        comment_timestamp: comment.timestamp
      })
    }
  }

  if (commentsToInsert.length === 0) return []

  const { data, error } = await supabase
    .from('comments')
    .insert(commentsToInsert)
    .select()

  if (error) throw error
  return data
}

/**
 * Categoriza comentário (simplificado)
 */
function categorizeComment(text: string): string {
  const lower = text.toLowerCase()

  if (lower.includes('?')) return 'perguntas'
  if (lower.includes('top') || lower.includes('incrível') || lower.includes('parabéns')) {
    return 'elogios'
  }
  if (lower.includes('como') || lower.includes('onde')) return 'duvidas'

  return 'outros'
}

/**
 * Verifica se comentário é relevante
 */
function isRelevantComment(text: string): boolean {
  if (text.length < 3) return false

  // Apenas emojis
  const emojiOnlyRegex = /^[\p{Emoji}\s]+$/u
  if (emojiOnlyRegex.test(text)) return false

  return true
}

/**
 * Salva análise completa (orquestra todas as funções)
 */
export async function saveCompleteAnalysis(analysisData: AnalysisData) {
  console.log(`[Supabase] Salvando dados de @${analysisData.username}...`)

  try {
    // 1. Salvar perfil
    console.log('[Supabase] 1/4 Salvando perfil...')
    const profile = await saveProfile(analysisData.profile)
    console.log(`[Supabase] ✅ Perfil salvo: ${profile.id}`)

    // 2. Salvar auditoria
    console.log('[Supabase] 2/4 Salvando auditoria...')
    // analysisData já contém score_card, auditors_analysis, etc. mesclados
    const audit = await saveAudit(profile.id, analysisData, analysisData)
    console.log(`[Supabase] ✅ Auditoria salva: ${audit.id}`)

    // 3. Salvar posts
    console.log('[Supabase] 3/4 Salvando posts...')
    const savedPosts = await savePosts(audit.id, analysisData.posts)
    console.log(`[Supabase] ✅ ${savedPosts.length} posts salvos`)

    // 4. Salvar comentários
    console.log('[Supabase] 4/4 Salvando comentários...')
    const savedComments = await saveComments(savedPosts)
    console.log(`[Supabase] ✅ ${savedComments.length} comentários salvos`)

    console.log('[Supabase] 🎉 Análise completa salva com sucesso!')

    return {
      profile_id: profile.id,
      audit_id: audit.id,
      posts_count: savedPosts.length,
      comments_count: savedComments.length
    }
  } catch (error: any) {
    console.error('[Supabase] ❌ Erro ao salvar:', error)
    throw error
  }
}
