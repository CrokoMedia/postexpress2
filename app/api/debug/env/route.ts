import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  // Detectar ambiente
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.RAILWAY_ENVIRONMENT === 'production' ||
    !!process.env.RAILWAY_PROJECT_ID

  return NextResponse.json({
    detection: {
      isProduction,
      nodeEnv: process.env.NODE_ENV,
      railwayEnvironment: process.env.RAILWAY_ENVIRONMENT,
      railwayProjectId: !!process.env.RAILWAY_PROJECT_ID,
      platform: process.platform,
    },
    chromium: {
      willUseServerless: isProduction,
      package: isProduction ? '@sparticuz/chromium' : 'local',
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID ? 'SET' : 'NOT SET',
      RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL ? 'SET' : 'NOT SET',
    }
  })
}
