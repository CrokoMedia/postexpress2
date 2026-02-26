/**
 * Health Check API
 *
 * Usado pelo Railway/Docker para verificar se o servidor está rodando
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'postexpress2',
    environment: process.env.NODE_ENV,
  })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
