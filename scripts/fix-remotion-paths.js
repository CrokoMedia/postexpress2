#!/usr/bin/env node

/**
 * Fix Remotion Module Paths
 *
 * Node.js procura por @remotion/renderer/index.js mas o package.json aponta para dist/index.js
 * Este script copia dist/index.js → index.js para todos os pacotes Remotion
 *
 * Roda automaticamente após npm install via postinstall hook
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const remotionPackages = [
  '@remotion/renderer',
  '@remotion/bundler',
  '@remotion/captions',
  '@remotion/fonts',
  '@remotion/player',
  '@remotion/transitions',
]

console.log('🔧 [Remotion Fix] Copiando arquivos de índice...')

for (const pkg of remotionPackages) {
  const pkgPath = path.join(rootDir, 'node_modules', ...pkg.split('/'))

  if (!fs.existsSync(pkgPath)) {
    console.log(`  ⏭️  ${pkg} - não instalado, pulando`)
    continue
  }

  // Copiar dist/index.js → index.js
  const distIndexJs = path.join(pkgPath, 'dist', 'index.js')
  const rootIndexJs = path.join(pkgPath, 'index.js')

  if (fs.existsSync(distIndexJs)) {
    fs.copyFileSync(distIndexJs, rootIndexJs)
    console.log(`  ✅ ${pkg}/index.js`)
  } else {
    console.log(`  ⚠️  ${pkg}/dist/index.js não encontrado`)
  }

  // Copiar dist/index.mjs → index.mjs (ESM)
  const distIndexMjs = path.join(pkgPath, 'dist', 'index.mjs')
  const rootIndexMjs = path.join(pkgPath, 'index.mjs')

  if (fs.existsSync(distIndexMjs)) {
    fs.copyFileSync(distIndexMjs, rootIndexMjs)
    console.log(`  ✅ ${pkg}/index.mjs`)
  }

  // Copiar dist/esm/index.mjs → index.mjs se dist/index.mjs não existir
  if (!fs.existsSync(distIndexMjs)) {
    const esmIndexMjs = path.join(pkgPath, 'dist', 'esm', 'index.mjs')
    if (fs.existsSync(esmIndexMjs)) {
      fs.copyFileSync(esmIndexMjs, rootIndexMjs)
      console.log(`  ✅ ${pkg}/index.mjs (from esm/)`)
    }
  }
}

console.log('✅ [Remotion Fix] Concluído!')
