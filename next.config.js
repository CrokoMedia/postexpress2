import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // DISABLED: Standalone mode causes MODULE_NOT_FOUND in production
  // output: 'standalone',

  // Externalizar pacotes pesados (não incluir no bundle serverless)
  // REMOVED @remotion/* packages - they MUST be bundled to work properly
  // CRITICAL: @sparticuz/chromium MUST be bundled (NOT externalized) to work in Railway
  serverExternalPackages: [
    'pdf-parse',
    'mammoth',
    'puppeteer',
    'puppeteer-core',
  ],

  // Excluir arquivos desnecessários do tracing
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@remotion/**/*.md',
      'node_modules/@remotion/**/*.d.ts',
      'node_modules/@remotion/**/package.json',
      'node_modules/@sparticuz/chromium/bin/*.br', // Chromium comprimido (não usado)
      // REMOVIDO: node_modules/@swc/**/* - É necessário em produção!
      '.git/**/*',
      'docs/**/*',
      '__tests__/**/*',
      '*.test.ts',
      '*.test.tsx',
      '*.spec.ts',
      '*.spec.tsx',
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent-*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'instagram.*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
    ],
  },

  // Headers para forçar revalidação de cache (autenticação desabilitada)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Auth-Disabled',
            value: 'true',
          },
        ],
      },
    ]
  },

  // Webpack config para otimizar tamanho
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Excluir source maps em produção
      config.devtool = false

      // SERVER-SIDE: Externalizar @remotion/* para evitar bundling de pacotes nativos
      config.externals = config.externals || []
      config.externals.push(({context, request}, callback) => {
        if (request && request.startsWith('@remotion/')) {
          return callback(null, `commonjs ${request}`)
        }
        callback()
      })
    }

    // CLIENT-SIDE: Substituir @remotion/* por módulo vazio
    if (!isServer) {
      config.plugins = config.plugins || []

      // SOLUÇÃO MAIS AGRESSIVA: Substituir QUALQUER import de @remotion/* por módulo vazio
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@remotion\/.*/,
          path.join(__dirname, 'lib', 'remotion-noop.js')
        )
      )

      // Fallbacks adicionais para segurança
      config.resolve = config.resolve || {}
      config.resolve.fallback = config.resolve.fallback || {}
      config.resolve.fallback['fs'] = false
      config.resolve.fallback['path'] = false
      config.resolve.fallback['child_process'] = false
      config.resolve.fallback['crypto'] = false
      config.resolve.fallback['stream'] = false
    }

    return config
  },
}

export default nextConfig
