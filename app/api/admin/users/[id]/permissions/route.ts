import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'

// Lista de permissões válidas (deve estar sincronizada com o schema)
const VALID_PERMISSIONS = [
  'view_audits',
  'create_content',
  'edit_content',
  'delete_content',
  'export_drive',
  'export_zip',
  'view_comparisons',
  'manage_profiles',
] as const

type Permission = typeof VALID_PERMISSIONS[number]

function isValidPermission(permission: string): permission is Permission {
  return VALID_PERMISSIONS.includes(permission as Permission)
}

// GET /api/admin/users/[id]/permissions — listar permissões do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'user_id é obrigatório' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Verificar se o usuário existe
  const { data: userExists } = await supabase.auth.admin.getUserById(userId)
  if (!userExists.user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Buscar permissões do usuário
  const { data: permissions, error } = await supabase
    .from('user_permissions')
    .select('permission, enabled, created_at')
    .eq('user_id', userId)
    .order('permission')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    user_id: userId,
    permissions: permissions || [],
  })
}

// PUT /api/admin/users/[id]/permissions — substituir todas as permissões (replace)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'user_id é obrigatório' }, { status: 400 })
  }

  const body = await request.json()
  const { permissions } = body

  if (!Array.isArray(permissions)) {
    return NextResponse.json(
      { error: 'permissions deve ser um array de permissões' },
      { status: 400 }
    )
  }

  // Validar que todas as permissões são válidas
  const invalidPermissions = permissions.filter(p => !isValidPermission(p))
  if (invalidPermissions.length > 0) {
    return NextResponse.json(
      {
        error: 'Permissões inválidas detectadas',
        invalid: invalidPermissions,
        valid: VALID_PERMISSIONS,
      },
      { status: 400 }
    )
  }

  const supabase = getServerSupabase()

  // Verificar se o usuário existe
  const { data: userExists } = await supabase.auth.admin.getUserById(userId)
  if (!userExists.user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Deletar todas as permissões existentes
  const { error: deleteError } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Inserir novas permissões (se houver)
  if (permissions.length > 0) {
    const permissionsToInsert = permissions.map((permission: Permission) => ({
      user_id: userId,
      permission,
      enabled: true,
    }))

    const { error: insertError } = await supabase
      .from('user_permissions')
      .insert(permissionsToInsert)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    message: 'Permissões atualizadas com sucesso',
    user_id: userId,
    permissions,
  })
}

// POST /api/admin/users/[id]/permissions — adicionar uma permissão específica
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'user_id é obrigatório' }, { status: 400 })
  }

  const body = await request.json()
  const { permission, enabled = true } = body

  if (!permission) {
    return NextResponse.json({ error: 'permission é obrigatório' }, { status: 400 })
  }

  if (!isValidPermission(permission)) {
    return NextResponse.json(
      {
        error: 'Permissão inválida',
        permission,
        valid: VALID_PERMISSIONS,
      },
      { status: 400 }
    )
  }

  if (typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'enabled deve ser boolean' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  // Verificar se o usuário existe
  const { data: userExists } = await supabase.auth.admin.getUserById(userId)
  if (!userExists.user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Tentar inserir ou atualizar (upsert)
  const { error } = await supabase
    .from('user_permissions')
    .upsert(
      {
        user_id: userId,
        permission,
        enabled,
      },
      {
        onConflict: 'user_id,permission',
      }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: enabled ? 'Permissão adicionada com sucesso' : 'Permissão desabilitada com sucesso',
    user_id: userId,
    permission,
    enabled,
  })
}

// DELETE /api/admin/users/[id]/permissions?permission=xxx — remover uma permissão específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'user_id é obrigatório' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const permission = searchParams.get('permission')

  if (!permission) {
    return NextResponse.json(
      { error: 'Query parameter "permission" é obrigatório' },
      { status: 400 }
    )
  }

  if (!isValidPermission(permission)) {
    return NextResponse.json(
      {
        error: 'Permissão inválida',
        permission,
        valid: VALID_PERMISSIONS,
      },
      { status: 400 }
    )
  }

  const supabase = getServerSupabase()

  // Verificar se o usuário existe
  const { data: userExists } = await supabase.auth.admin.getUserById(userId)
  if (!userExists.user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  // Deletar a permissão específica
  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission', permission)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Permissão removida com sucesso',
    user_id: userId,
    permission,
  })
}
