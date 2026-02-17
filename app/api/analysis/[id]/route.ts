import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServerSupabase()
    const { id } = await params

    // Buscar status da análise na fila
    const { data: queueItem, error } = await supabase
      .from('analysis_queue')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!queueItem) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Se completada, buscar resultado
    let result = null
    if (queueItem.status === 'completed' && queueItem.audit_id) {
      const { data: audit } = await supabase
        .from('audits')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('id', queueItem.audit_id)
        .single()

      result = audit
    }

    return NextResponse.json({
      id: queueItem.id,
      status: queueItem.status,
      progress: queueItem.progress,
      current_phase: queueItem.current_phase,
      username: queueItem.username,
      post_limit: queueItem.post_limit,
      started_at: queueItem.started_at,
      completed_at: queueItem.completed_at,
      error_message: queueItem.error_message,
      result: result
    })
  } catch (error: any) {
    console.error('Error fetching analysis status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analysis status' },
      { status: 500 }
    )
  }
}
