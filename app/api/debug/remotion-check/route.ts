import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/debug/remotion-check
 * Diagnóstico completo de @remotion/renderer no container
 */
export async function GET() {
  const diagnostics: Record<string, any> = {}

  try {
    // 1. Diretório de trabalho
    diagnostics.workdir = {
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
    }

    // 2. Node modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules')
    diagnostics.nodeModules = {
      path: nodeModulesPath,
      exists: fs.existsSync(nodeModulesPath),
    }

    if (fs.existsSync(nodeModulesPath)) {
      const nmContents = fs.readdirSync(nodeModulesPath)
      diagnostics.nodeModules.count = nmContents.length
      diagnostics.nodeModules.hasRemotionFolder = nmContents.includes('@remotion')
    }

    // 3. @remotion/renderer
    const remotionRendererPath = path.join(process.cwd(), 'node_modules', '@remotion', 'renderer')
    diagnostics.remotionRenderer = {
      path: remotionRendererPath,
      exists: fs.existsSync(remotionRendererPath),
    }

    if (fs.existsSync(remotionRendererPath)) {
      const rendererContents = fs.readdirSync(remotionRendererPath)
      diagnostics.remotionRenderer.files = rendererContents

      // Verificar dist/
      const distPath = path.join(remotionRendererPath, 'dist')
      diagnostics.remotionRenderer.dist = {
        exists: fs.existsSync(distPath),
      }

      if (fs.existsSync(distPath)) {
        const distContents = fs.readdirSync(distPath)
        diagnostics.remotionRenderer.dist.fileCount = distContents.length
        diagnostics.remotionRenderer.dist.hasIndexJs = distContents.includes('index.js')
        diagnostics.remotionRenderer.dist.firstFiles = distContents.slice(0, 10)
      }

      // Verificar package.json
      const pkgPath = path.join(remotionRendererPath, 'package.json')
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        diagnostics.remotionRenderer.packageJson = {
          main: pkg.main,
          exports: pkg.exports?.['.'],
          version: pkg.version,
        }
      }
    }

    // 4. Teste de require()
    diagnostics.requireTest = { success: false, error: null, exports: [] }
    try {
      // CRITICAL: Usar createRequire para forçar CommonJS
      const { createRequire } = await import('module')
      const require = createRequire(import.meta.url)
      const remotionRenderer = require('@remotion/renderer')

      diagnostics.requireTest.success = true
      diagnostics.requireTest.exports = Object.keys(remotionRenderer).slice(0, 15)
    } catch (error: any) {
      diagnostics.requireTest.error = {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5),
      }
    }

    // 5. Teste de import()
    diagnostics.importTest = { success: false, error: null, exports: [] }
    try {
      const remotionRenderer = await import('@remotion/renderer')
      diagnostics.importTest.success = true
      diagnostics.importTest.exports = Object.keys(remotionRenderer).slice(0, 15)
    } catch (error: any) {
      diagnostics.importTest.error = {
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5),
      }
    }

    // 6. Verificar bundle Remotion
    const bundlePath = path.join(process.cwd(), '.remotion-bundle')
    diagnostics.remotionBundle = {
      path: bundlePath,
      exists: fs.existsSync(bundlePath),
    }

    if (fs.existsSync(bundlePath)) {
      const bundleContents = fs.readdirSync(bundlePath)
      diagnostics.remotionBundle.fileCount = bundleContents.length
      diagnostics.remotionBundle.files = bundleContents.slice(0, 10)
    }

    // 7. Verificar outros pacotes Remotion
    const remotionPackages = [
      '@remotion/bundler',
      '@remotion/captions',
      '@remotion/fonts',
      '@remotion/player',
      '@remotion/transitions',
      'remotion',
    ]

    diagnostics.otherRemotionPackages = {}
    for (const pkg of remotionPackages) {
      const pkgPath = path.join(process.cwd(), 'node_modules', ...pkg.split('/'))
      diagnostics.otherRemotionPackages[pkg] = fs.existsSync(pkgPath)
    }

    return NextResponse.json({
      success: true,
      diagnostics,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        diagnostics,
      },
      { status: 500 }
    )
  }
}
