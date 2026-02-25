# ============================================
# Post Express - Analysis Worker Dockerfile
# ============================================
# Worker 24/7 para processar análises de Instagram
# Deploy: Railway, Render, Fly.io, ou qualquer plataforma Docker

FROM node:20-alpine

# Metadata
LABEL maintainer="Croko Labs"
LABEL description="Post Express Analysis Worker - Instagram Audit System"
LABEL version="2.0"

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Working directory
WORKDIR /app

# Copy root package.json (para dependências compartilhadas)
COPY package*.json ./

# Copy worker package.json
COPY worker/package*.json ./worker/

# Install ALL dependencies (worker precisa das libs do root)
RUN npm install --legacy-peer-deps

# Install worker dependencies
WORKDIR /app/worker
RUN npm install

# Copy worker code
COPY worker/analysis-worker.ts ./

# Copy shared libraries
WORKDIR /app
COPY lib ./lib
COPY types ./types

# Copy scripts (usados pelo worker)
COPY scripts ./scripts

# Copy environment template
COPY worker/.env.example ./worker/.env.example 2>/dev/null || true

# Health check (verifica se worker está rodando)
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
  CMD ps aux | grep -v grep | grep -q analysis-worker || exit 1

# Set working directory back to worker
WORKDIR /app/worker

# Run worker with tsx
CMD ["npx", "tsx", "analysis-worker.ts"]
