/**
 * Debug: Verificar variáveis de ambiente do Instagram OAuth
 * GET /api/auth/instagram/debug
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || 'NÃO DEFINIDO',
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET ? '***EXISTE***' : 'NÃO DEFINIDO',
    INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI || 'NÃO DEFINIDO',
    NODE_ENV: process.env.NODE_ENV
  })
}
