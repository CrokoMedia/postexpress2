import { NextResponse } from 'next/server'

/**
 * GET /api/test-json
 * Endpoint mínimo para testar se JSON está funcionando
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'JSON response working!',
    timestamp: new Date().toISOString(),
  })
}

/**
 * POST /api/test-json
 * Testa se POST também funciona
 */
export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'POST JSON response working!',
    timestamp: new Date().toISOString(),
  })
}
