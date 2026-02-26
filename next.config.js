/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output para deploy otimizado
  output: 'standalone',

  // Externalizar pacotes pesados (não incluir no bundle serverless)
  serverExternalPackages: [
    'pdf-parse',
    'mammoth',
    '@remotion/renderer',
    '@remotion/bundler',
    '@remotion/player',
    '@remotion/transitions',
    '@remotion/captions',
    '@sparticuz/chromium',
    'puppeteer',
    'puppeteer-core',
    'react-dom',
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

  // Aumentar timeout de serverless functions (Vercel)
  serverOptions: {
    bodySizeLimit: '10mb',
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
    return config
  },
}

export default nextConfig
