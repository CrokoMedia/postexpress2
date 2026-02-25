import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/users/[id]/profiles
 * Lista perfis vinculados a um usuário
 *
 * - Admin: pode ver perfis de qualquer usuário
 * - Cliente: só pode ver seus próprios perfis (se id = seu user_id)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { user, roleData } = authResult
  const { id: targetUserId } = await context.params

  // Cliente só pode ver seus próprios perfis
  if (roleData.role !== 'admin' && user.id !== targetUserId) {
    return NextResponse.json(
      { error: 'Acesso negado. Você só pode ver seus próprios perfis.' },
      { status: 403 }
    )
  }

  const supabase = getServerSupabase()

  // Buscar perfis vinculados ao usuário
  // Usar VIEW para contornar cache do PostgREST (padrão do projeto)
  const { data: profiles, error } = await supabase
    .from('user_profiles_with_instagram')
    .select('id, username, full_name, followers_count, profile_pic_url_hd, is_verified, total_audits, last_scraped_at, linked_at')
    .eq('user_id', targetUserId)
    .order('linked_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    user_id: targetUserId,
    profiles: profiles || [],
    total: profiles?.length || 0,
  })
}

/**
 * POST /api/users/[id]/profiles
 * Vincula um perfil existente ao usuário
 *
 * Body: { profile_id: string }
 *
 * - Apenas admins podem vincular perfis
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: targetUserId } = await context.params
  const body = await request.json()
  const { profile_id } = body

  if (!profile_id) {
    return NextResponse.json({ error: 'profile_id é obrigatório' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Verificar se perfil existe
  const { data: profile, error: profileError } = await supabase
    .from('instagram_profiles')
    .select('id, username')
    .eq('id', profile_id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Perfil não encontrado' },
      { status: 404 }
    )
  }

  // Verificar se vínculo já existe
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('user_id, profile_id')
    .eq('user_id', targetUserId)
    .eq('profile_id', profile_id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Perfil já vinculado a este usuário' },
      { status: 409 }
    )
  }

  // Criar vínculo
  const { error: linkError } = await supabase
    .from('user_profiles')
    .insert({ user_id: targetUserId, profile_id })

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Perfil vinculado com sucesso',
    user_id: targetUserId,
    profile_id,
    username: profile.username,
  }, { status: 201 })
}

/**
 * DELETE /api/users/[id]/profiles?profile_id=xxx
 * Desvincula um perfil do usuário
 *
 * - Apenas admins podem desvincular perfis
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: targetUserId } = await context.params
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profile_id')

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id é obrigatório' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Verificar se vínculo existe
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('user_id, profile_id')
    .eq('user_id', targetUserId)
    .eq('profile_id', profileId)
    .single()

  if (!existing) {
    return NextResponse.json(
      { error: 'Vínculo não encontrado' },
      { status: 404 }
    )
  }

  // Remover vínculo
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', targetUserId)
    .eq('profile_id', profileId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Perfil desvinculado com sucesso',
    user_id: targetUserId,
    profile_id: profileId,
  })
}
