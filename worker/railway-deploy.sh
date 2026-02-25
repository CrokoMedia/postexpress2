#!/bin/bash

# ============================================
# Railway Deploy Script - Analysis Worker
# ============================================

set -e  # Exit on error

echo "🚂 Railway Deploy - Analysis Worker"
echo "===================================="
echo ""

# Check if logged in
echo "📋 Verificando autenticação..."
if ! railway whoami &> /dev/null; then
    echo "❌ Você não está logado no Railway."
    echo ""
    echo "Execute primeiro:"
    echo "  railway login"
    echo ""
    echo "Depois rode este script novamente."
    exit 1
fi

echo "✅ Autenticado como: $(railway whoami)"
echo ""

# Check if project exists
echo "📋 Verificando projeto Railway..."
if ! railway status &> /dev/null; then
    echo "📦 Criando novo projeto Railway..."
    railway init --name "postexpress-analysis-worker"
    echo "✅ Projeto criado!"
else
    echo "✅ Projeto Railway já existe"
fi

echo ""
echo "📋 Configurando variáveis de ambiente..."
echo ""
echo "⚠️  IMPORTANTE: Você precisa adicionar as seguintes variáveis no Railway Dashboard:"
echo ""
echo "1. Acesse: https://railway.app/dashboard"
echo "2. Selecione o projeto 'postexpress-analysis-worker'"
echo "3. Vá em 'Variables'"
echo "4. Adicione:"
echo ""
echo "   SUPABASE_URL=https://seu-projeto.supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY=eyJhbG..."
echo "   APIFY_API_TOKEN=apify_api_..."
echo "   ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "   Opcional (para OCR):"
echo "   GOOGLE_AI_API_KEY=AIza..."
echo "   MISTRAL_API_KEY=..."
echo ""
echo "   Opcional (para fotos de perfil):"
echo "   CLOUDINARY_CLOUD_NAME=..."
echo "   CLOUDINARY_API_KEY=..."
echo "   CLOUDINARY_API_SECRET=..."
echo ""
read -p "✅ Variáveis configuradas? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Configuração pausada. Configure as variáveis e rode novamente."
    exit 0
fi

echo ""
echo "🚀 Fazendo deploy..."
railway up

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Verificar logs:"
echo "  railway logs --follow"
echo ""
echo "📊 Ver status:"
echo "  railway status"
echo ""
echo "🌐 Abrir dashboard:"
echo "  railway open"
echo ""
