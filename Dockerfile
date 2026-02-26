# ============================================
# Post Express - Next.js App + Remotion + Chromium
# ============================================
# Deploy: Railway (sem timeout limits)
# Suporta: Geração de slides via Remotion, rendering de vídeos, IA

FROM node:20-alpine AS base

# Install system dependencies for Chromium + Remotion + Node native modules
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

# Tell Puppeteer/Remotion to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV REMOTION_CHROMIUM_PATH=/usr/bin/chromium-browser

# ============================================
# STAGE 1: Dependencies
# ============================================
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include dev deps for build)
# Using npm install instead of npm ci for better compatibility with Docker builds
RUN npm install --legacy-peer-deps

# ============================================
# STAGE 2: Build
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Accept build args from Railway (required for NEXT_PUBLIC_* to be embedded in build)
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set as environment variables for build
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build Remotion bundle first (required for Next.js build)
RUN npm run build:remotion

# Build Next.js
RUN npm run build

# ============================================
# STAGE 3: Runner
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built Next.js app (standalone já inclui tudo necessário)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# CRITICAL: Standalone mode doesn't copy public folder automatically
# Copy public assets (images, icons, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Remotion bundle (CRITICAL for slide generation)
COPY --from=builder /app/.remotion-bundle ./.remotion-bundle

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js server
CMD ["node", "server.js"]
