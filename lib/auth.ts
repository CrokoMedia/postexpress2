import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getServerSupabase } from './supabase'

export type UserRole = 'admin' | 'client'

export interface UserRoleData {
  role: UserRole
  profile_ids: string[]
}

/**
 * Cria um cliente Supabase para route handlers (lê/escreve cookies da request/response)
 */
export function createRouteHandlerSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
}

/**
 * Retorna o usuário autenticado a partir de uma request, ou null se não autenticado
 */
export async function getAuthUser(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteHandlerSupabase(request, response)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Retorna o role e lista de profile_ids do usuário
 */
export async function getUserRole(userId: string): Promise<UserRoleData | null> {
  const supabase = getServerSupabase()

  const [roleResult, profilesResult] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', userId).single(),
    supabase.from('user_profiles').select('profile_id').eq('user_id', userId),
  ])

  if (roleResult.error || !roleResult.data) return null

  const profile_ids = profilesResult.data?.map(r => r.profile_id) ?? []

  return {
    role: roleResult.data.role as UserRole,
    profile_ids,
  }
}

/**
 * Verifica autenticação. Retorna { user, roleData } ou NextResponse 401
 */
export async function requireAuth(request: NextRequest): Promise<
  { user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>; roleData: UserRoleData } | NextResponse
> {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const roleData = await getUserRole(user.id)
  if (!roleData) {
    return NextResponse.json({ error: 'Usuário sem role definida' }, { status: 403 })
  }

  return { user, roleData }
}

/**
 * Verifica se é admin. Retorna { user, roleData } ou NextResponse 401/403
 */
export async function requireAdmin(request: NextRequest): Promise<
  { user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>; roleData: UserRoleData } | NextResponse
> {
  const result = await requireAuth(request)
  if (result instanceof NextResponse) return result

  if (result.roleData.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores.' }, { status: 403 })
  }

  return result
}
