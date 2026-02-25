import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const body = await request.json()

    const { profile_id, audit_before_id, audit_after_id } = body

    // Validação
    if (!profile_id || !audit_before_id || !audit_after_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Buscar as duas auditorias
    const { data: auditBefore } = await supabase
      .from('audits')
      .select('*')
      .eq('id', audit_before_id)
      .single()

    const { data: auditAfter } = await supabase
      .from('audits')
      .select('*')
      .eq('id', audit_after_id)
      .single()

    if (!auditBefore || !auditAfter) {
      return NextResponse.json(
        { error: 'One or both audits not found' },
        { status: 404 }
      )
    }

    // Calcular métricas de crescimento
    const daysBetween = Math.floor(
      (new Date(auditAfter.audit_date).getTime() - new Date(auditBefore.audit_date).getTime())
      / (1000 * 60 * 60 * 24)
    )

    const growthFollowers = (auditAfter.snapshot_followers || 0) - (auditBefore.snapshot_followers || 0)
    const growthFollowersPct = auditBefore.snapshot_followers
      ? ((growthFollowers / auditBefore.snapshot_followers) * 100)
      : 0

    // Criar comparação
    const { data: comparison, error } = await supabase
      .from('comparisons')
      .insert({
        profile_id,
        audit_before_id,
        audit_after_id,
        days_between: daysBetween,
        date_before: auditBefore.audit_date,
        date_after: auditAfter.audit_date,
        growth_followers: growthFollowers,
        growth_followers_pct: growthFollowersPct,
        growth_engagement: (auditAfter.engagement_rate || 0) - (auditBefore.engagement_rate || 0),
        improvement_overall: (auditAfter.score_overall || 0) - (auditBefore.score_overall || 0),
        improvement_behavior: (auditAfter.score_behavior || 0) - (auditBefore.score_behavior || 0),
        improvement_copy: (auditAfter.score_copy || 0) - (auditBefore.score_copy || 0),
        improvement_offers: (auditAfter.score_offers || 0) - (auditBefore.score_offers || 0),
        improvement_metrics: (auditAfter.score_metrics || 0) - (auditBefore.score_metrics || 0),
        improvement_anomalies: (auditAfter.score_anomalies || 0) - (auditBefore.score_anomalies || 0),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      comparison_id: comparison.id,
      message: 'Comparison created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating comparison:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create comparison' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const searchParams = request.nextUrl.searchParams
    const profile_id = searchParams.get('profile_id')

    let query = supabase
      .from('comparisons')
      .select(`
        *,
        profile:profiles(*),
        audit_before:audits!audit_before_id(*),
        audit_after:audits!audit_after_id(*)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (profile_id) {
      query = query.eq('profile_id', profile_id)
    }

    const { data: comparisons, error } = await query

    if (error) throw error

    return NextResponse.json({
      comparisons: comparisons || []
    })
  } catch (error: any) {
    console.error('Error fetching comparisons:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comparisons' },
      { status: 500 }
    )
  }
}
