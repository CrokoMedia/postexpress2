import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, getUserRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const roleData = await getUserRole(user.id)

  if (!roleData) {
    return NextResponse.json({ error: 'Role não encontrada' }, { status: 403 })
  }

  return NextResponse.json({
    user_id: user.id,
    email: user.email,
    role: roleData.role,
    profile_ids: roleData.profile_ids,
  })
}
