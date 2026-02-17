import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from('analysis_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Error fetching queue:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch queue' },
      { status: 500 }
    )
  }
}
