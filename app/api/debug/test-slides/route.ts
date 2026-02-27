import { NextResponse } from 'next/server'
import { getRemotionBundle } from '@/lib/remotion-bundle'
import { getServerlessRenderOptions } from '@/lib/remotion-chromium'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/debug/test-slides
 *
 * Endpoint de diagnóstico para verificar setup de geração de slides.
 * Testa: Bundle Remotion, Chromium, Cloudinary, FAL.ai
 *
 * REMOVER EM PRODUÇÃO após diagnóstico!
 */
export async function GET() {
  const checks = []

  // Check 1: Bundle Remotion
  console.log('🔍 [DEBUG] Testing Remotion bundle...')
  try {
    const bundlePath = await getRemotionBundle()
    const exists = fs.existsSync(bundlePath)

    let bundleFiles: string[] = []
    let bundleSize = 0

    if (exists) {
      bundleFiles = fs.readdirSync(bundlePath)
      bundleSize = bundleFiles.reduce((acc, file) => {
        const filePath = path.join(bundlePath, file)
        if (fs.statSync(filePath).isFile()) {
          return acc + fs.statSync(filePath).size
        }
        return acc
      }, 0)
    }

    checks.push({
      name: 'Remotion Bundle',
      status: exists ? 'OK' : 'ERROR',
      path: bundlePath,
      exists,
      fileCount: bundleFiles.length,
      sizeKB: Math.round(bundleSize / 1024),
      files: bundleFiles.slice(0, 10) // Primeiros 10 arquivos
    })
  } catch (error) {
    checks.push({
      name: 'Remotion Bundle',
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  }

  // Check 2: Chromium
  console.log('🔍 [DEBUG] Testing Chromium...')
  try {
    const options = await getServerlessRenderOptions()
    checks.push({
      name: 'Chromium',
      status: 'OK',
      browserExecutable: options.browserExecutable || 'default',
      chromiumPath: options.chromiumPath,
      env: {
        PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH,
        REMOTION_CHROMIUM_PATH: process.env.REMOTION_CHROMIUM_PATH
      }
    })
  } catch (error) {
    checks.push({
      name: 'Chromium',
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error)
    })
  }

  // Check 3: Cloudinary
  console.log('🔍 [DEBUG] Testing Cloudinary config...')
  checks.push({
    name: 'Cloudinary',
    status: process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING',
    configured: {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !!process.env.CLOUDINARY_API_KEY,
      apiSecret: !!process.env.CLOUDINARY_API_SECRET
    }
  })

  // Check 4: FAL.ai
  console.log('🔍 [DEBUG] Testing FAL.ai config...')
  checks.push({
    name: 'FAL.ai',
    status: process.env.FAL_KEY ? 'OK' : 'MISSING',
    configured: !!process.env.FAL_KEY
  })

  // Check 5: Supabase
  console.log('🔍 [DEBUG] Testing Supabase config...')
  checks.push({
    name: 'Supabase',
    status: process.env.SUPABASE_URL ? 'OK' : 'MISSING',
    configured: {
      url: !!process.env.SUPABASE_URL,
      anonKey: !!process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nextPublicAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  })

  // Check 6: Filesystem info
  console.log('🔍 [DEBUG] Checking filesystem...')
  try {
    const cwd = process.cwd()
    const cwdContents = fs.readdirSync(cwd)

    checks.push({
      name: 'Filesystem',
      status: 'OK',
      cwd,
      cwdContents: cwdContents.slice(0, 20), // Primeiros 20 itens
      tmpExists: fs.existsSync('/tmp'),
      tmpWritable: (() => {
        try {
          const testFile = '/tmp/test-write-' + Date.now()
          fs.writeFileSync(testFile, 'test')
          fs.unlinkSync(testFile)
          return true
        } catch {
          return false
        }
      })()
    })
  } catch (error) {
    checks.push({
      name: 'Filesystem',
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error)
    })
  }

  // Summary
  const allOK = checks.every(c => c.status === 'OK')
  const hasErrors = checks.some(c => c.status === 'ERROR')
  const hasMissing = checks.some(c => c.status === 'MISSING')

  return NextResponse.json({
    summary: {
      status: allOK ? 'ALL_OK' : hasErrors ? 'HAS_ERRORS' : 'HAS_MISSING',
      allOK,
      hasErrors,
      hasMissing,
      timestamp: new Date().toISOString()
    },
    checks,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
      arch: process.arch,
      cwd: process.cwd()
    }
  })
}
