import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar perfis com última auditoria
    const { data: profiles, error } = await supabase
      .from('profiles')
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
        audits:audits(*)
      `)
      .is('deleted_at', null)
      .order('last_scraped_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Debug: Log fotos dos perfis
    console.log('📸 Debug - Fotos dos perfis:')
    profiles?.slice(0, 3).forEach(p => {
      console.log(`  @${p.username}:`, {
        cloudinary: p.profile_pic_cloudinary_url ? '✅' : '❌',
        hd: p.profile_pic_url_hd ? '✅' : '❌',
        normal: p.profile_pic_url ? '✅' : '❌'
      })
    })

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
      total: profiles?.length || 0
    })
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
