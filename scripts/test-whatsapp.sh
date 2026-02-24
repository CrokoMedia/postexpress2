#!/bin/bash

# Script para testar a integração WhatsApp
# Uso: ./scripts/test-whatsapp.sh [numero-whatsapp]

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuração
API_URL="${API_URL:-http://localhost:3000}"
PHONE="${1:-5511999999999}"

echo -e "${BLUE}🧪 Testando integração WhatsApp${NC}\n"
echo -e "${YELLOW}API:${NC} $API_URL"
echo -e "${YELLOW}Telefone:${NC} $PHONE\n"

# Função para fazer request
test_endpoint() {
  local name="$1"
  local endpoint="$2"
  local method="$3"
  local data="$4"

  echo -e "${BLUE}📡 Teste: ${name}${NC}"

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "${API_URL}${endpoint}")
  else
    response=$(curl -s -w "\n%{http_code}" \
      -X POST \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${API_URL}${endpoint}")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Sucesso (HTTP $http_code)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    echo -e "${RED}❌ Erro (HTTP $http_code)${NC}"
    echo "$body"
  fi

  echo ""
}

# Testes

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# 1. Testar configuração
test_endpoint \
  "Verificar configuração" \
  "/api/whatsapp/send" \
  "GET"

# 2. Enviar mensagem de texto
test_endpoint \
  "Enviar texto" \
  "/api/whatsapp/send" \
  "POST" \
  "{\"phone\":\"$PHONE\",\"type\":\"text\",\"text\":\"🧪 Teste de integração WhatsApp - Croko Lab\"}"

# 3. Enviar imagem
test_endpoint \
  "Enviar imagem" \
  "/api/whatsapp/send" \
  "POST" \
  "{\"phone\":\"$PHONE\",\"type\":\"image\",\"imageUrl\":\"https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800\",\"caption\":\"📸 Teste de envio de imagem\"}"

# 4. Enviar múltiplas imagens (simular carrossel)
test_endpoint \
  "Enviar carrossel (3 slides)" \
  "/api/whatsapp/send" \
  "POST" \
  "{\"phone\":\"$PHONE\",\"type\":\"images\",\"imageUrls\":[\"https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800\",\"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800\",\"https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=800\"],\"caption\":\"🎨 Carrossel de teste - 3 slides\"}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo -e "${YELLOW}📱 Verifique seu WhatsApp (${PHONE}) para ver as mensagens${NC}\n"
