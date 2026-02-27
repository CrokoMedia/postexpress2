/** @type {import('next').NextConfig} */
const nextConfig = {
  // DISABLED: Standalone mode causes MODULE_NOT_FOUND in production
  // output: 'standalone',

  // Externalizar pacotes pesados (não incluir no bundle serverless)
  // REMOVED @remotion/* packages - they MUST be bundled to work properly
  serverExternalPackages: [
    'pdf-parse',
    'mammoth',
    '@sparticuz/chromium',
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir source maps em produção
      config.devtool = false
    }

    // CLIENT-SIDE: Ignorar completamente pacotes Remotion (server-only)
    if (!isServer) {
      // Adicionar plugin para interceptar resolução de módulos
      config.plugins = config.plugins || []
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.normalModuleFactory.tap('IgnoreRemotionPlugin', (nmf) => {
            nmf.hooks.beforeResolve.tap('IgnoreRemotionPlugin', (resolveData) => {
              const request = resolveData.request

              // Ignorar TODOS os pacotes @remotion/* no client-side
              if (request && request.startsWith('@remotion/')) {
                return false // Cancela a resolução
              }

              // Permitir outras resoluções
              return undefined
            })
          })
        },
      })

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
