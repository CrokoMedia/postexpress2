#!/usr/bin/env node

/**
 * Script de diagnóstico para investigar @remotion/renderer no Railway
 * Rodar dentro do container: node scripts/diagnose-remotion-railway.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('🔍 DIAGNÓSTICO REMOTION NO RAILWAY\n')
console.log('================================\n')

// 1. Verificar diretório de trabalho
console.log('📁 Diretório de trabalho:')
console.log('   CWD:', process.cwd())
console.log('   __dirname:', __dirname)
console.log('   ROOT:', rootDir)
console.log('')

// 2. Verificar se node_modules existe
const nodeModulesPath = path.join(rootDir, 'node_modules')
console.log('📦 Node Modules:')
console.log('   Path:', nodeModulesPath)
console.log('   Exists:', fs.existsSync(nodeModulesPath))

if (fs.existsSync(nodeModulesPath)) {
  const nmContents = fs.readdirSync(nodeModulesPath)
  console.log(`   Contents: ${nmContents.length} packages`)
  console.log('   @remotion present:', nmContents.includes('@remotion'))
}
console.log('')

// 3. Verificar @remotion/renderer especificamente
const remotionRendererPath = path.join(rootDir, 'node_modules', '@remotion', 'renderer')
console.log('🎬 @remotion/renderer:')
console.log('   Path:', remotionRendererPath)
console.log('   Exists:', fs.existsSync(remotionRendererPath))

if (fs.existsSync(remotionRendererPath)) {
  const rendererContents = fs.readdirSync(remotionRendererPath)
  console.log('   Contents:', rendererContents.join(', '))

  // Verificar dist/
  const distPath = path.join(remotionRendererPath, 'dist')
  console.log('   dist/ exists:', fs.existsSync(distPath))

  if (fs.existsSync(distPath)) {
    const distContents = fs.readdirSync(distPath)
    console.log(`   dist/ files: ${distContents.length}`)
    console.log('   index.js exists:', distContents.includes('index.js'))
  }

  // Verificar package.json
  const pkgPath = path.join(remotionRendererPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    console.log('   package.json main:', pkg.main)
    console.log('   package.json exports:', JSON.stringify(pkg.exports?.['.'], null, 2))
  }
} else {
  console.log('   ❌ NÃO ENCONTRADO!')
}
console.log('')

// 4. Tentar require()
console.log('🔌 Teste de require():')
try {
  const remotionRenderer = require('@remotion/renderer')
  console.log('   ✅ require("@remotion/renderer") FUNCIONOU!')
  console.log('   Exports:', Object.keys(remotionRenderer).slice(0, 10).join(', '))
} catch (error) {
  console.log('   ❌ require("@remotion/renderer") FALHOU!')
  console.log('   Error:', error.message)
  console.log('   Code:', error.code)
  console.log('   Stack:', error.stack?.split('\n').slice(0, 3).join('\n'))
}
console.log('')

// 5. Tentar import dinâmico
console.log('🔌 Teste de import():')
try {
  const remotionRenderer = await import('@remotion/renderer')
  console.log('   ✅ import("@remotion/renderer") FUNCIONOU!')
  console.log('   Exports:', Object.keys(remotionRenderer).slice(0, 10).join(', '))
} catch (error) {
  console.log('   ❌ import("@remotion/renderer") FALHOU!')
  console.log('   Error:', error.message)
  console.log('   Code:', error.code)
}
console.log('')

// 6. Verificar dependências de @remotion/renderer
console.log('📚 Dependências de @remotion/renderer:')
const pkgPath = path.join(remotionRendererPath, 'package.json')
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies }
  console.log('   Total:', Object.keys(deps).length)

  // Verificar se dependências estão instaladas
  let missing = []
  for (const [depName, depVersion] of Object.entries(deps)) {
    const depPath = path.join(rootDir, 'node_modules', depName)
    if (!fs.existsSync(depPath)) {
      missing.push(depName)
    }
  }

  if (missing.length > 0) {
    console.log('   ❌ Dependências faltando:', missing.join(', '))
  } else {
    console.log('   ✅ Todas as dependências presentes')
  }
}
console.log('')

// 7. Verificar se .remotion-bundle existe
const bundlePath = path.join(rootDir, '.remotion-bundle')
console.log('📦 Remotion Bundle:')
console.log('   Path:', bundlePath)
console.log('   Exists:', fs.existsSync(bundlePath))
if (fs.existsSync(bundlePath)) {
  const bundleContents = fs.readdirSync(bundlePath)
  console.log('   Contents:', bundleContents.slice(0, 10).join(', '))
}
console.log('')

// 8. Verificar environment
console.log('🌍 Environment:')
console.log('   NODE_ENV:', process.env.NODE_ENV)
console.log('   Platform:', process.platform)
console.log('   Node version:', process.version)
console.log('   Arch:', process.arch)
console.log('')

console.log('================================')
console.log('✅ Diagnóstico completo!')
