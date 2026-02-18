import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'

// GET /api/admin/users — listar usuários
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = getServerSupabase()

  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userIds = roles?.map(r => r.user_id) || []

  // Buscar emails e perfis vinculados em paralelo
  const [usersWithEmail, profileLinks] = await Promise.all([
    Promise.all(userIds.map(async (id) => {
      const { data } = await supabase.auth.admin.getUserById(id)
      return { id, email: data.user?.email || '' }
    })),
    supabase
      .from('user_profiles')
      .select('user_id, profile_id, profile:profiles(id, username)')
      .in('user_id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']),
  ])

  const emailMap = Object.fromEntries(usersWithEmail.map(u => [u.id, u.email]))

  // Agrupar perfis por user_id
  const profilesByUser: Record<string, Array<{ id: string; username: string }>> = {}
  profileLinks.data?.forEach(link => {
    if (!profilesByUser[link.user_id]) profilesByUser[link.user_id] = []
    if (link.profile) {
      profilesByUser[link.user_id].push(link.profile as unknown as { id: string; username: string })
    }
  })

  const result = roles?.map(r => ({
    user_id: r.user_id,
    email: emailMap[r.user_id] || '',
    role: r.role,
    created_at: r.created_at,
    profiles: profilesByUser[r.user_id] || [],
  }))

  return NextResponse.json({ users: result })
}

// POST /api/admin/users — criar usuário
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()
  const { email, password, role, profile_ids = [] } = body

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'email, password e role são obrigatórios' }, { status: 400 })
  }

  if (!['admin', 'client'].includes(role)) {
    return NextResponse.json({ error: 'Role inválida' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Falha ao criar usuário' }, { status: 500 })
  }

  const userId = authData.user.id

  // Inserir role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })

  if (roleError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: roleError.message }, { status: 500 })
  }

  // Vincular perfis se houver
  if (role === 'client' && profile_ids.length > 0) {
    const links = profile_ids.map((pid: string) => ({ user_id: userId, profile_id: pid }))
    const { error: linkError } = await supabase.from('user_profiles').insert(links)

    if (linkError) {
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    // Vincular user_id nos perfis (para o primeiro perfil)
    await supabase.from('profiles').update({ user_id: userId }).eq('id', profile_ids[0])
  }

  return NextResponse.json({
    message: 'Usuário criado com sucesso',
    user_id: userId,
    email,
    role,
    profile_ids,
  }, { status: 201 })
}

// PATCH /api/admin/users — atualizar perfis de um usuário
export async function PATCH(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const body = await request.json()
  const { user_id, profile_ids } = body

  if (!user_id || !Array.isArray(profile_ids)) {
    return NextResponse.json({ error: 'user_id e profile_ids são obrigatórios' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Remover vínculos existentes
  await supabase.from('user_profiles').delete().eq('user_id', user_id)

  // Inserir novos vínculos
  if (profile_ids.length > 0) {
    const links = profile_ids.map((pid: string) => ({ user_id, profile_id: pid }))
    const { error } = await supabase.from('user_profiles').insert(links)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Perfis atualizados com sucesso', profile_ids })
}

// DELETE /api/admin/users?user_id=xxx — deletar usuário
export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'user_id é obrigatório' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Desvincular user_id dos perfis
  await supabase.from('profiles').update({ user_id: null }).eq('user_id', userId)

  // Deletar da auth (cascade deleta user_roles e user_profiles)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Usuário deletado com sucesso' })
}
