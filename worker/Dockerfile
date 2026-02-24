# ============================================
# Twitter Stream Worker - Dockerfile
# ============================================
# Build para deploy em Railway/Render (24/7 worker)

FROM node:20-alpine

# Metadata
LABEL maintainer="Post Express"
LABEL description="Twitter Filtered Stream Worker (24/7)"

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy worker code
COPY twitter-stream-worker.js ./

# Health check (verifica se worker está rodando)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Expose health check port
EXPOSE 3001

# Run worker
CMD ["node", "twitter-stream-worker.js"]
