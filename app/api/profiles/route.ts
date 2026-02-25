import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getServerSupabase } from '@/lib/supabase'

/**
 * GET /api/profiles
 * Lista perfis do Instagram com RLS automático
 *
 * - Admin: vê todos os perfis
 * - Cliente: vê apenas perfis vinculados (via RLS policy)
 *
 * Query params:
 * - limit: número de perfis (default: 20)
 * - offset: paginação (default: 0)
 */
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { user, roleData } = authResult

  try {
    const supabase = getServerSupabase()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log(`📋 Fetching profiles for user: ${user.email} (role: ${roleData.role})`)

    // Buscar perfis do Instagram com última auditoria
    // RLS policies aplicam automaticamente filtro por usuário
    const { data: profiles, error } = await supabase
      .from('instagram_profiles')
      .select(`
        id,
        username,
        full_name,
        biography,
        followers_count,
        following_count,
        posts_count,
        profile_pic_url,
        profile_pic_url_hd,
        profile_pic_cloudinary_url,
        is_verified,
        is_business_account,
        business_category,
        last_scraped_at,
        created_at,
        audits (
          id,
          audit_date,
          audit_type,
          posts_analyzed,
          score_overall,
          score_behavior,
          score_copy,
          score_offers,
          score_metrics,
          score_anomalies,
          deleted_at
        )
      `)
      .is('deleted_at', null)
      .order('last_scraped_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    console.log(`✅ Found ${profiles?.length || 0} profiles (RLS applied)`)

    // Debug: Log fotos dos perfis
    if (profiles && profiles.length > 0) {
      console.log('📸 Debug - Fotos dos perfis:')
      profiles.slice(0, 3).forEach(p => {
        console.log(`  @${p.username}:`, {
          cloudinary: p.profile_pic_cloudinary_url ? '✅' : '❌',
          hd: p.profile_pic_url_hd ? '✅' : '❌',
          normal: p.profile_pic_url ? '✅' : '❌'
        })
      })
    }

    // Processar para incluir apenas a última auditoria
    const profilesWithLatestAudit = profiles?.map(profile => {
      const sortedAudits = profile.audits
        ?.filter((a: any) => !a.deleted_at)
        ?.sort((a: any, b: any) =>
          new Date(b.audit_date).getTime() - new Date(a.audit_date).getTime()
        )

      return {
        ...profile,
        audits: undefined,
        latest_audit: sortedAudits?.[0] || null
      }
    })

    return NextResponse.json({
      profiles: profilesWithLatestAudit,
      total: profiles?.length || 0,
      user: {
        id: user.id,
        email: user.email,
        role: roleData.role,
      }
    })
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
