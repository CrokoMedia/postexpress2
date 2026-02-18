import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const supabase = getServerSupabase()
    const body = await request.json()

    const {
      username,
      post_limit = 10,
      skip_ocr = false,
      audit_type = 'express'
    } = body

    // Validação
    if (!username || !/^[a-zA-Z0-9._]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      )
    }

    if (post_limit < 1 || post_limit > 100) {
      return NextResponse.json(
        { error: 'Post limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Criar entrada na fila de análise
    const { data: queueItem, error } = await supabase
      .from('analysis_queue')
      .insert({
        username,
        post_limit,
        skip_ocr,
        audit_type,
        status: 'pending',
        progress: 0,
        priority: 5,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      queue_id: queueItem.id,
      status: 'queued',
      message: 'Analysis queued successfully',
      estimated_time: `${post_limit * 2} seconds`
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating analysis:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create analysis' },
      { status: 500 }
    )
  }
}
