#!/bin/bash
set -e

echo "🚀 Render Docker Build com Build Args"
echo "======================================"

# Verificar variáveis obrigatórias NEXT_PUBLIC_*
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ ERRO: NEXT_PUBLIC_SUPABASE_URL não definida"
  echo "   Configure no Dashboard do Render: Settings → Environment"
  echo "   Marque 'Available at Build Time'"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não definida"
  echo "   Configure no Dashboard do Render: Settings → Environment"
  echo "   Marque 'Available at Build Time'"
  exit 1
fi

# Verificar outras variáveis importantes
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  AVISO: SUPABASE_SERVICE_ROLE_KEY não definida"
  echo "   Necessária para operações admin no Supabase"
fi

# Log das variáveis (sem expor valores completos)
echo ""
echo "📋 Build Args detectados:"
echo "   NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo "   SUPABASE_URL: ${SUPABASE_URL:0:30}..."
echo ""

# Build Docker com todos os argumentos necessários
echo "🐳 Iniciando Docker build..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg SUPABASE_URL="$SUPABASE_URL" \
  --build-arg SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  --build-arg SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --build-arg CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
  --build-arg CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
  --build-arg CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
  -t postexpress:latest \
  --progress=plain \
  .

echo ""
echo "✅ Build Docker concluído com sucesso!"
echo "   Image: postexpress:latest"
