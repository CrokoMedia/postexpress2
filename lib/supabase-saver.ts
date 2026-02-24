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

/**
 * Faz upload de foto de perfil para Cloudinary e retorna URL permanente
 */
async function uploadProfilePicToCloudinary(imageUrl: string, username: string): Promise<string | null> {
  try {
    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      return null
    }

    const { v2: cloudinary } = await import('cloudinary')
    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret
    })

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'profile-pics',
      public_id: username,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    })

    console.log(`☁️  Foto de @${username} enviada para Cloudinary`)
    return result.secure_url
  } catch (error: any) {
    console.warn(`⚠️  Falha no upload Cloudinary para @${username}: ${error.message}`)
    return null
  }
}

export interface AnalysisData {
  username: string
  profile: any
  metrics: any
  posts: any[]
  audit?: any
}

/**
 * Salva ou atualiza perfil do Instagram
 * IMPORTANTE: Usa tabela 'instagram_profiles' (não 'profiles' que é para creators)
 */
export async function saveProfile(profileData: any) {
  // Suporta camelCase (Apify) e snake_case (Claude/audit JSON)
  const username = profileData.username
  const fullName = profileData.fullName || profileData.full_name
  const biography = profileData.biography
  const followersCount = profileData.followersCount || profileData.followers_count
  const followsCount = profileData.followsCount || profileData.following_count
  const postsCount = profileData.postsCount || profileData.posts_count
  const profilePicUrl = profileData.profilePicUrl || profileData.profile_pic_url
  const profilePicUrlHD = profileData.profilePicUrlHD || profileData.profile_pic_url_hd
  const url = profileData.url
  const verified = profileData.verified ?? profileData.is_verified ?? false
  const isBusinessAccount = profileData.isBusinessAccount ?? profileData.is_business_account ?? false
  const businessCategoryName = profileData.businessCategoryName || profileData.business_category

  // Validar dados críticos
  if (!username) {
    throw new Error('Username is required to save profile')
  }

  // Log warning se foto de perfil estiver faltando
  if (!profilePicUrl && !profilePicUrlHD) {
    console.warn(`⚠️  Profile picture missing for @${username}`)
  }

  // Upload da foto para Cloudinary (URL permanente, sem expiração)
  let cloudinaryUrl: string | null = null
  const picUrlForUpload = profilePicUrlHD || profilePicUrl
  if (picUrlForUpload) {
    cloudinaryUrl = await uploadProfilePicToCloudinary(picUrlForUpload, username)
  }

  // Verificar se perfil já existe (apenas não-deletados, por segurança)
  const { data: existing } = await supabase
    .from('instagram_profiles')
    .select('id')
    .eq('username', username)
    .is('deleted_at', null)
    .single()

  const profilePayload: Record<string, any> = {
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

  // Incluir URL do Cloudinary se upload bem sucedido
  if (cloudinaryUrl) {
    profilePayload.profile_pic_cloudinary_url = cloudinaryUrl
  }

  if (existing) {
    // Atualizar (não sobrescrever foto se nova estiver vazia e antiga existir)
    const { data: currentData } = await supabase
      .from('instagram_profiles')
      .select('profile_pic_url, profile_pic_url_hd, profile_pic_cloudinary_url')
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
      // Preservar Cloudinary se novo upload não foi feito
      if (!profilePayload.profile_pic_cloudinary_url && currentData.profile_pic_cloudinary_url) {
        profilePayload.profile_pic_cloudinary_url = currentData.profile_pic_cloudinary_url
      }
    }

    const { data, error } = await supabase
      .from('instagram_profiles')
      .update(profilePayload)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    console.log(`✅ Instagram profile @${username} updated successfully`)
    return data
  } else {
    // TODO: Descomentar após adicionar colunas gender no banco (database/add-gender-columns.sql)
    // Detectar gênero automaticamente para novo perfil
    // let genderData: { gender: string | null; gender_auto_detected: boolean; gender_confidence: number | null } = {
    //   gender: null,
    //   gender_auto_detected: false,
    //   gender_confidence: null
    // }

    // try {
    //   // Importar dinamicamente para evitar circular dependency
    //   const { detectGender } = await import('./gender-detector')
    //   const detection = await detectGender(fullName, biography, username)

    //   genderData = {
    //     gender: detection.gender,
    //     gender_auto_detected: true,
    //     gender_confidence: detection.confidence
    //   }

    //   console.log(`🎯 Gênero detectado: ${detection.gender} (${(detection.confidence * 100).toFixed(0)}% confiança)`)
    // } catch (error: any) {
    //   console.warn(`⚠️  Falha ao detectar gênero: ${error.message}`)
    //   // Continuar sem gênero - usuário pode definir manualmente depois
    // }

    // Criar novo
    const { data, error } = await supabase
      .from('instagram_profiles')
      .insert({
        username,
        ...profilePayload,
        // ...genderData, // Comentado temporariamente
        first_scraped_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    console.log(`✅ Instagram profile @${username} created successfully`)
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

      // Snapshot do perfil (suporta camelCase do Apify e snake_case do Claude)
      snapshot_followers: auditData.profile?.followersCount || auditData.profile?.followers_count || rawData.profile?.followersCount || rawData.profile?.followers_count || 0,
      snapshot_following: auditData.profile?.followsCount || auditData.profile?.following_count || rawData.profile?.followsCount || rawData.profile?.following_count || 0,
      snapshot_posts_count: auditData.profile?.postsCount || auditData.profile?.posts_count || rawData.profile?.postsCount || rawData.profile?.posts_count || 0,

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
  // Se não há posts, retornar array vazio (perfis sem posts são válidos)
  if (!posts || posts.length === 0) {
    console.log('⚠️  Nenhum post para salvar (perfil sem posts públicos ou privado)')
    return []
  }

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
    .select('*')  // Selecionar explicitamente todos os campos incluindo id

  if (error) throw error

  // Garantir que os posts retornados têm id
  if (!data || data.length === 0) {
    throw new Error('No posts were saved')
  }

  if (!data[0].id) {
    throw new Error('Saved posts do not have id field')
  }

  return data
}

/**
 * Salva comentários individuais
 */
export async function saveComments(posts: any[]) {
  // Se não há posts, não há comentários para salvar
  if (!posts || posts.length === 0) {
    console.log('⚠️  Nenhum comentário para salvar (sem posts)')
    return []
  }

  const commentsToInsert: any[] = []

  for (const post of posts) {
    // Validar que o post tem id (deve ter sido salvo antes)
    if (!post.id) {
      console.error('Post sem id:', post)
      throw new Error('Post must be saved before saving comments (missing id field)')
    }

    const postId = post.id // ID do Supabase, não do Instagram

    const rawComments = post.comments_raw || post.comments?.raw || []

    for (const comment of rawComments) {
      commentsToInsert.push({
        post_id: postId,
        comment_id: comment.id,
        text: comment.text,
        owner_username: comment.ownerUsername || comment.owner_username,
        owner_id: comment.owner?.id || comment.owner_id,
        likes_count: comment.likesCount || comment.likes_count || 0,
        category: categorizeComment(comment.text),
        is_relevant: isRelevantComment(comment.text),
        comment_timestamp: comment.timestamp || comment.comment_timestamp
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
