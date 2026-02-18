import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logout realizado' })
  const supabase = createRouteHandlerSupabase(request, response)
  await supabase.auth.signOut()
  return response
}
