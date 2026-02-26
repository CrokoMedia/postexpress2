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
      'node_modules/@swc/**/*', // SWC não necessário em prod
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
