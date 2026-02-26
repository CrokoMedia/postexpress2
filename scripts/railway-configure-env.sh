#!/bin/bash
# ============================================
# Railway Environment Variables Setup
# ============================================
# Script para configurar env vars no Railway
# Uso: ./scripts/railway-configure-env.sh

set -e

echo "🚂 Railway Environment Setup"
echo "=============================="
echo ""

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado!"
    echo "Instale com: npm install -g @railway/cli"
    exit 1
fi

# Verificar se está linkado a um projeto
if ! railway status &> /dev/null; then
    echo "❌ Projeto não linkado ao Railway!"
    echo "Execute: railway link"
    exit 1
fi

echo "📝 Configure as variáveis de ambiente:"
echo ""

# Função para adicionar env var
add_env() {
    local key=$1
    local description=$2

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$description"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p "$key: " value

    if [ -n "$value" ]; then
        railway variables --set "$key=$value"
        echo "✅ $key configurado"
    else
        echo "⏭️  Pulando $key"
    fi
    echo ""
}

# Env vars obrigatórias
echo "🔑 VARIÁVEIS OBRIGATÓRIAS"
echo ""

add_env "SUPABASE_URL" "URL do seu projeto Supabase"
add_env "SUPABASE_ANON_KEY" "Chave anônima do Supabase (Settings → API)"
add_env "SUPABASE_SERVICE_ROLE_KEY" "Service role key do Supabase (Settings → API)"
add_env "NEXT_PUBLIC_SUPABASE_URL" "URL pública do Supabase (mesmo que SUPABASE_URL)"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Chave pública do Supabase (mesmo que SUPABASE_ANON_KEY)"

add_env "CLOUDINARY_CLOUD_NAME" "Nome da cloud no Cloudinary"
add_env "CLOUDINARY_API_KEY" "API Key do Cloudinary"
add_env "CLOUDINARY_API_SECRET" "API Secret do Cloudinary"

add_env "ANTHROPIC_API_KEY" "API Key do Claude (Anthropic)"
add_env "NANO_BANANA_API_KEY" "API Key do Nano Banana (geração de imagens)"
add_env "FAL_KEY" "API Key do Fal.ai (geração de imagens)"

add_env "APIFY_API_TOKEN" "Token da API do Apify"

# Env vars opcionais
echo ""
echo "📱 VARIÁVEIS OPCIONAIS (WhatsApp)"
echo ""

read -p "Configurar integração WhatsApp? (s/N): " setup_whatsapp

if [[ "$setup_whatsapp" =~ ^[Ss]$ ]]; then
    add_env "UAZAPI_INSTANCE_ID" "ID da instância UAZapi"
    add_env "UAZAPI_TOKEN" "Token de autenticação UAZapi"
    add_env "UAZAPI_WEBHOOK_URL" "URL do webhook (ex: https://seu-app.railway.app/api/whatsapp/webhook)"
fi

# Configurar NODE_ENV
railway variables --set "NODE_ENV=production"
echo "✅ NODE_ENV=production configurado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuração completa!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Próximos passos:"
echo "1. Faça redeploy: railway redeploy --yes"
echo "2. Obtenha a URL: railway domain"
echo "3. Teste: curl https://sua-url.railway.app/api/health"
echo ""
