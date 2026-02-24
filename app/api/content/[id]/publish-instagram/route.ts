/**
 * Publicar carrossel no Instagram via Graph API
 * POST /api/content/[id]/publish-instagram
 *
 * Body:
 * {
 *   "carousel_index": 0,
 *   "schedule_time": "2026-03-01T14:30:00Z" // opcional
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { publishCarousel, validateAccessToken } from '@/lib/instagram-graph'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id
    const { carousel_index, schedule_time } = await request.json()

    if (carousel_index === undefined) {
      return NextResponse.json(
        { error: 'Missing carousel_index' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // 1. Buscar carrossel aprovado
    const { data: content, error: contentError } = await supabase
      .from('content_suggestions')
      .select('content_json, slides_json, profile_id')
      .eq('audit_id', auditId)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    const carousel = content.content_json.carousels[carousel_index]

    if (!carousel) {
      return NextResponse.json(
        { error: 'Carousel not found at specified index' },
        { status: 404 }
      )
    }

    // Buscar slides gerados para este carrossel
    if (!content.slides_json?.carousels) {
      return NextResponse.json(
        { error: 'No slides generated yet. Please generate slides first.' },
        { status: 400 }
      )
    }

    // Encontrar o carrossel nos slides gerados (pode estar em índice diferente)
    const generatedCarousel = content.slides_json.carousels.find(
      (c: any) => c.title === carousel.titulo || c.carouselIndex === carousel_index
    )

    if (!generatedCarousel || !generatedCarousel.slides || generatedCarousel.slides.length === 0) {
      return NextResponse.json(
        { error: 'Slides not found for this carousel. Please generate slides first.' },
        { status: 400 }
      )
    }

    // Extrair URLs do Cloudinary
    const slideUrls = generatedCarousel.slides.map((slide: any) => slide.cloudinaryUrl)

    // 2. Buscar credenciais OAuth do Instagram (tabela instagram_profiles)
    const { data: profile, error: profileError } = await supabase
      .from('instagram_profiles')
      .select('instagram_account_id, instagram_access_token, instagram_token_expires_at, instagram_connected, username')
      .eq('id', content.profile_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile.instagram_connected || !profile.instagram_access_token || !profile.instagram_account_id) {
      return NextResponse.json(
        { error: 'Instagram not connected. Please connect your Instagram account first.' },
        { status: 400 }
      )
    }

    // 3. Verificar se o token expirou
    const tokenExpiresAt = new Date(profile.instagram_token_expires_at)
    const now = new Date()

    if (tokenExpiresAt < now) {
      return NextResponse.json(
        { error: 'Instagram token expired. Please reconnect your account.' },
        { status: 401 }
      )
    }

    // 4. Validar token
    const isValid = await validateAccessToken(profile.instagram_access_token)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Instagram token is invalid. Please reconnect your account.' },
        { status: 401 }
      )
    }

    // 5. Montar caption (primeiro slide + hashtags)
    const caption = `${carousel.slides[0].text}\n\n${carousel.hashtags.join(' ')}`

    // 6. Publicar no Instagram
    const result = await publishCarousel({
      instagramAccountId: profile.instagram_account_id,
      accessToken: profile.instagram_access_token,
      slideUrls,
      caption,
      scheduleTime: schedule_time ? new Date(schedule_time) : undefined
    })

    // 7. Salvar publicação no banco
    const { error: saveError } = await supabase
      .from('instagram_publications')
      .insert({
        audit_id: auditId,
        profile_id: content.profile_id,
        carousel_index,
        instagram_media_id: result.mediaId,
        instagram_permalink: result.permalink,
        status: result.status,
        scheduled_for: schedule_time ? new Date(schedule_time).toISOString() : null,
        published_at: result.status === 'published' ? new Date().toISOString() : null,
        slide_count: slideUrls.length,
        caption
      })

    if (saveError) {
      console.error('Failed to save publication:', saveError)
      // Não retornar erro, pois a publicação foi bem-sucedida
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      media_id: result.mediaId,
      permalink: result.permalink,
      message: result.status === 'published'
        ? `Carrossel publicado com sucesso em @${profile.username}!`
        : `Carrossel agendado para ${new Date(schedule_time!).toLocaleString('pt-BR')}!`
    })
  } catch (err: any) {
    console.error('Publish Instagram error:', err)

    return NextResponse.json(
      {
        error: err.message || 'Failed to publish to Instagram',
        details: err.toString()
      },
      { status: 500 }
    )
  }
}
