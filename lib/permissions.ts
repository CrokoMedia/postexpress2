import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from './supabase'
import { requireAuth } from './auth'

/**
 * Enum de permissões disponíveis no sistema
 * Sincronizado com a tabela user_permissions do banco
 */
export enum Permission {
  VIEW_AUDITS = 'view_audits',
  CREATE_CONTENT = 'create_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  EXPORT_DRIVE = 'export_drive',
  EXPORT_ZIP = 'export_zip',
  VIEW_COMPARISONS = 'view_comparisons',
  MANAGE_PROFILES = 'manage_profiles',
}

/**
 * Cache em memória das permissões (por sessão/request)
 * Evita múltiplas queries ao banco na mesma requisição
 */
const permissionsCache = new Map<string, Set<string>>()

/**
 * TTL do cache: 5 minutos (em ms)
 */
const CACHE_TTL = 5 * 60 * 1000

/**
 * Limpa cache de permissões de um usuário específico
 */
export function clearPermissionsCache(userId: string) {
  permissionsCache.delete(userId)
}

/**
 * Limpa todo o cache de permissões
 */
export function clearAllPermissionsCache() {
  permissionsCache.clear()
}

/**
 * Busca permissões do usuário no banco e cacheia
 * Admins sempre têm todas as permissões
 */
async function fetchUserPermissions(userId: string): Promise<Set<string>> {
  const supabase = getServerSupabase()

  // Verificar se é admin primeiro
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  // Admins têm todas as permissões
  if (roleData?.role === 'admin') {
    return new Set(Object.values(Permission))
  }

  // Buscar permissões específicas do usuário
  const { data: permissionsData } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId)
    .eq('enabled', true)

  const permissions = new Set<string>()

  if (permissionsData) {
    permissionsData.forEach(row => {
      permissions.add(row.permission)
    })
  }

  return permissions
}

/**
 * Verifica se um usuário tem uma permissão específica
 *
 * @param userId - UUID do usuário
 * @param permission - String da permissão (use enum Permission)
 * @returns true se o usuário tem a permissão, false caso contrário
 *
 * @example
 * ```typescript
 * const hasPermission = await checkPermission(userId, Permission.CREATE_CONTENT)
 * if (!hasPermission) {
 *   return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
 * }
 * ```
 */
export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // Verificar cache primeiro
  let userPermissions = permissionsCache.get(userId)

  if (!userPermissions) {
    // Cache miss - buscar do banco
    userPermissions = await fetchUserPermissions(userId)
    permissionsCache.set(userId, userPermissions)

    // Auto-limpar cache após TTL
    setTimeout(() => {
      permissionsCache.delete(userId)
    }, CACHE_TTL)
  }

  return userPermissions.has(permission)
}

/**
 * Verifica se um usuário tem múltiplas permissões
 *
 * @param userId - UUID do usuário
 * @param permissions - Array de permissões a verificar
 * @param requireAll - Se true, requer todas as permissões. Se false, requer pelo menos uma.
 * @returns true se atende aos requisitos de permissão
 *
 * @example
 * ```typescript
 * // Requer todas as permissões
 * const hasAll = await checkPermissions(userId, [Permission.EDIT_CONTENT, Permission.DELETE_CONTENT], true)
 *
 * // Requer pelo menos uma
 * const hasAny = await checkPermissions(userId, [Permission.EXPORT_DRIVE, Permission.EXPORT_ZIP], false)
 * ```
 */
export async function checkPermissions(
  userId: string,
  permissions: string[],
  requireAll: boolean = true
): Promise<boolean> {
  const results = await Promise.all(
    permissions.map(p => checkPermission(userId, p))
  )

  return requireAll
    ? results.every(r => r === true)
    : results.some(r => r === true)
}

/**
 * Middleware HOF (Higher Order Function) para proteger rotas com permissão
 *
 * Retorna um handler Next.js que verifica autenticação E permissão antes de executar
 *
 * @param permission - Permissão necessária (use enum Permission)
 * @returns Wrapped handler que verifica permissão
 *
 * @example
 * ```typescript
 * // Em uma API route sem parâmetros
 * export const GET = requirePermission(Permission.VIEW_AUDITS)(async (req) => {
 *   // Código da rota aqui
 *   // Usuário já está autenticado e tem permissão view_audits
 * })
 *
 * // Em uma API route com parâmetros dinâmicos
 * export const POST = requirePermission(Permission.CREATE_CONTENT)(async (req, context: { params: Promise<{ id: string }> }) => {
 *   const { id } = await context.params
 *   // Código da rota aqui
 * })
 * ```
 */
export function requirePermission(permission: string) {
  return function <TContext extends { params?: any } | undefined = undefined>(
    handler: (
      req: NextRequest,
      context: TContext
    ) => Promise<NextResponse>
  ) {
    return async function (
      req: NextRequest,
      context: TContext
    ): Promise<NextResponse> {
      // 1. Verificar autenticação primeiro
      const authResult = await requireAuth(req)
      if (authResult instanceof NextResponse) {
        return authResult // 401 Unauthorized
      }

      const { user, roleData } = authResult

      // 2. Admins sempre têm permissão (bypass)
      if (roleData.role === 'admin') {
        return handler(req, context)
      }

      // 3. Verificar permissão específica
      const hasPermission = await checkPermission(user.id, permission)

      if (!hasPermission) {
        return NextResponse.json(
          {
            error: 'Acesso negado',
            message: `Você não tem permissão: ${permission}`,
            required_permission: permission
          },
          { status: 403 }
        )
      }

      // 4. Permissão concedida - executar handler
      return handler(req, context)
    }
  }
}

/**
 * Middleware para verificar múltiplas permissões
 *
 * @param permissions - Array de permissões
 * @param requireAll - Se true, requer todas as permissões. Se false, requer pelo menos uma.
 *
 * @example
 * ```typescript
 * // Requer AMBAS as permissões
 * export const DELETE = requirePermissions(
 *   [Permission.EDIT_CONTENT, Permission.DELETE_CONTENT],
 *   true
 * )(async (req) => {
 *   // Código aqui
 * })
 *
 * // Requer PELO MENOS UMA das permissões
 * export const GET = requirePermissions(
 *   [Permission.EXPORT_DRIVE, Permission.EXPORT_ZIP],
 *   false
 * )(async (req) => {
 *   // Código aqui
 * })
 * ```
 */
export function requirePermissions(
  permissions: string[],
  requireAll: boolean = true
) {
  return function <TContext extends { params?: any } | undefined = undefined>(
    handler: (
      req: NextRequest,
      context: TContext
    ) => Promise<NextResponse>
  ) {
    return async function (
      req: NextRequest,
      context: TContext
    ): Promise<NextResponse> {
      // 1. Verificar autenticação
      const authResult = await requireAuth(req)
      if (authResult instanceof NextResponse) {
        return authResult
      }

      const { user, roleData } = authResult

      // 2. Admins sempre têm permissão
      if (roleData.role === 'admin') {
        return handler(req, context)
      }

      // 3. Verificar permissões
      const hasPermissions = await checkPermissions(user.id, permissions, requireAll)

      if (!hasPermissions) {
        return NextResponse.json(
          {
            error: 'Acesso negado',
            message: requireAll
              ? `Você precisa de todas as permissões: ${permissions.join(', ')}`
              : `Você precisa de pelo menos uma das permissões: ${permissions.join(', ')}`,
            required_permissions: permissions,
            require_all: requireAll
          },
          { status: 403 }
        )
      }

      // 4. Permissões concedidas
      return handler(req, context)
    }
  }
}

/**
 * Busca todas as permissões de um usuário
 * Útil para renderizar UI condicional no frontend
 *
 * @param userId - UUID do usuário
 * @returns Array de strings de permissões
 *
 * @example
 * ```typescript
 * const permissions = await getUserPermissions(userId)
 * // ['view_audits', 'create_content', ...]
 * ```
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const permissions = await fetchUserPermissions(userId)
  return Array.from(permissions)
}

/**
 * Adiciona uma permissão a um usuário
 * Requer privilégios de admin/service_role
 *
 * @param userId - UUID do usuário
 * @param permission - Permissão a adicionar
 * @returns true se sucesso
 */
export async function grantPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const supabase = getServerSupabase()

  const { error } = await supabase
    .from('user_permissions')
    .upsert({
      user_id: userId,
      permission,
      enabled: true,
    })

  if (!error) {
    // Limpar cache do usuário
    clearPermissionsCache(userId)
  }

  return !error
}

/**
 * Remove uma permissão de um usuário
 * Requer privilégios de admin/service_role
 *
 * @param userId - UUID do usuário
 * @param permission - Permissão a remover
 * @returns true se sucesso
 */
export async function revokePermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const supabase = getServerSupabase()

  const { error } = await supabase
    .from('user_permissions')
    .update({ enabled: false })
    .eq('user_id', userId)
    .eq('permission', permission)

  if (!error) {
    // Limpar cache do usuário
    clearPermissionsCache(userId)
  }

  return !error
}

/**
 * Adiciona múltiplas permissões a um usuário de uma vez
 *
 * @param userId - UUID do usuário
 * @param permissions - Array de permissões
 * @returns true se sucesso
 */
export async function grantPermissions(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  const supabase = getServerSupabase()

  const records = permissions.map(permission => ({
    user_id: userId,
    permission,
    enabled: true,
  }))

  const { error } = await supabase
    .from('user_permissions')
    .upsert(records)

  if (!error) {
    clearPermissionsCache(userId)
  }

  return !error
}
