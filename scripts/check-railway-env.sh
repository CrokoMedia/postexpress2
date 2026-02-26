#!/bin/bash
# ============================================
# Railway Environment Variables Checker
# ============================================
# Verifica se todas as variáveis necessárias estão configuradas

echo "🔍 Verificando variáveis de ambiente do Supabase..."
echo ""

# Array de variáveis necessárias
required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

missing_vars=()

# Verifica cada variável
for var in "${required_vars[@]}"; do
  value="${!var}"
  if [ -z "$value" ]; then
    echo "❌ $var - NÃO CONFIGURADA"
    missing_vars+=("$var")
  else
    # Mostra apenas os primeiros 20 caracteres + ...
    preview="${value:0:20}..."
    echo "✅ $var - OK ($preview)"
  fi
done

echo ""

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo "✨ Todas as variáveis estão configuradas!"
  exit 0
else
  echo "⚠️  ${#missing_vars[@]} variável(is) faltando:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "📝 Configure no Railway:"
  echo "   1. Abra o projeto no Railway Dashboard"
  echo "   2. Vá em Settings > Variables"
  echo "   3. Adicione as variáveis faltantes"
  echo "   4. Faça redeploy"
  exit 1
fi
