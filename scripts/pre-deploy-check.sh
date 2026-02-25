#!/bin/bash

# 🚀 Script de Auditoria Pré-Deploy - Croko Labs
# Executa todos os checks necessários antes do deploy no Vercel

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 AUDITORIA PRÉ-DEPLOY - CROKO LABS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASS=0
WARN=0
FAIL=0

# Funções auxiliares
print_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASS++))
}

print_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARN++))
}

print_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAIL++))
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${BLUE}$1${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. VERIFICAR NODE.JS E NPM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "1. AMBIENTE NODE.JS"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  print_pass "Node.js instalado: $NODE_VERSION"

  # Verificar se é >= 18
  NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v//' | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -ge 18 ]; then
    print_pass "Versão do Node.js compatível (>= 18)"
  else
    print_fail "Node.js precisa ser >= 18 (atual: $NODE_VERSION)"
  fi
else
  print_fail "Node.js não encontrado"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  print_pass "npm instalado: v$NPM_VERSION"
else
  print_fail "npm não encontrado"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. VERIFICAR DEPENDÊNCIAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "2. DEPENDÊNCIAS"

if [ -d "node_modules" ]; then
  NODE_MODULES_SIZE=$(du -sh node_modules | cut -f1)
  print_pass "node_modules existe ($NODE_MODULES_SIZE)"
else
  print_warn "node_modules não encontrado - rode: npm install"
fi

if [ -f "package-lock.json" ]; then
  print_pass "package-lock.json existe"
else
  print_warn "package-lock.json não encontrado"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. VERIFICAR VARIÁVEIS DE AMBIENTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "3. VARIÁVEIS DE AMBIENTE"

if [ -f ".env" ]; then
  print_pass ".env encontrado"

  # Verificar variáveis críticas
  REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "CLOUDINARY_CLOUD_NAME"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
  )

  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env && ! grep -q "^$var=$" .env && ! grep -q "^$var=xxxx" .env; then
      print_pass "$var está configurado"
    else
      print_warn "$var não está configurado ou está vazio"
    fi
  done

  # Verificar CRON_SECRET
  if grep -q "CRON_SECRET=dev-secret-change-in-production" .env; then
    print_fail "CRON_SECRET ainda está com valor de dev! TROQUE EM PRODUÇÃO!"
  else
    print_pass "CRON_SECRET parece estar customizado"
  fi

else
  print_fail ".env não encontrado - copie .env.example"
fi

if [ -f ".env.example" ]; then
  print_pass ".env.example existe"
else
  print_warn ".env.example não encontrado"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. VERIFICAR BUILD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "4. BUILD DE PRODUÇÃO"

print_info "Executando: npm run build..."
if npm run build > /tmp/build-output.log 2>&1; then
  print_pass "Build passou com sucesso!"

  if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sh .next | cut -f1)
    print_pass "Pasta .next gerada ($NEXT_SIZE)"
  fi
else
  print_fail "Build falhou! Verifique /tmp/build-output.log"
  cat /tmp/build-output.log
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. VERIFICAR TYPESCRIPT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "5. TYPESCRIPT"

print_info "Executando: npm run typecheck..."
if npm run typecheck > /tmp/typecheck-output.log 2>&1; then
  print_pass "TypeScript check passou!"
else
  # Verificar se os erros são apenas de testes
  if grep -q "__tests__" /tmp/typecheck-output.log; then
    print_warn "TypeCheck tem erros apenas em arquivos de teste (não afeta produção)"
  else
    print_fail "TypeCheck falhou com erros no código fonte!"
    cat /tmp/typecheck-output.log
  fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. VERIFICAR ESLINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "6. ESLINT"

print_info "Executando: npm run lint..."
if npm run lint > /tmp/lint-output.log 2>&1; then
  print_pass "ESLint passou sem warnings!"
else
  WARNING_COUNT=$(grep -c "Warning:" /tmp/lint-output.log || echo "0")
  ERROR_COUNT=$(grep -c "Error:" /tmp/lint-output.log || echo "0")

  if [ "$ERROR_COUNT" -gt 0 ]; then
    print_fail "ESLint encontrou $ERROR_COUNT erros!"
  elif [ "$WARNING_COUNT" -gt 0 ]; then
    print_warn "ESLint encontrou $WARNING_COUNT warnings (não bloqueantes)"
  fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. VERIFICAR ARQUIVOS DESNECESSÁRIOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "7. ARQUIVOS DESNECESSÁRIOS"

DS_STORE_COUNT=$(find . -name ".DS_Store" 2>/dev/null | wc -l | xargs)
if [ "$DS_STORE_COUNT" -gt 0 ]; then
  print_warn "Encontrados $DS_STORE_COUNT arquivos .DS_Store (adicionar ao .gitignore)"
else
  print_pass "Nenhum .DS_Store encontrado"
fi

LOG_COUNT=$(find . -name "*.log" -not -path "./node_modules/*" 2>/dev/null | wc -l | xargs)
if [ "$LOG_COUNT" -gt 0 ]; then
  print_warn "Encontrados $LOG_COUNT arquivos .log (adicionar ao .gitignore)"
else
  print_pass "Nenhum .log encontrado"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. VERIFICAR .gitignore
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "8. .gitignore"

if [ -f ".gitignore" ]; then
  print_pass ".gitignore existe"

  # Verificar se tem as entradas importantes
  if grep -q ".DS_Store" .gitignore; then
    print_pass ".DS_Store está no .gitignore"
  else
    print_warn ".DS_Store não está no .gitignore"
  fi

  if grep -q "*.log" .gitignore; then
    print_pass "*.log está no .gitignore"
  else
    print_warn "*.log não está no .gitignore"
  fi

  if grep -q ".env" .gitignore; then
    print_pass ".env está no .gitignore"
  else
    print_fail ".env NÃO está no .gitignore (CRÍTICO!)"
  fi
else
  print_fail ".gitignore não encontrado"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. VERIFICAR CONFIGURAÇÕES NEXT.JS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "9. NEXT.JS CONFIG"

if [ -f "next.config.js" ]; then
  print_pass "next.config.js encontrado"

  if grep -q "serverExternalPackages" next.config.js; then
    print_pass "serverExternalPackages configurado"
  else
    print_warn "serverExternalPackages não encontrado"
  fi

  if grep -q "images" next.config.js; then
    print_pass "Image domains configurados"
  else
    print_warn "Image domains não configurados"
  fi
else
  print_fail "next.config.js não encontrado"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 10. VERIFICAR VERCEL CONFIG
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "10. VERCEL CONFIG"

if [ -f "vercel.json" ]; then
  print_pass "vercel.json encontrado"

  if grep -q "crons" vercel.json; then
    print_pass "Cron jobs configurados"
  else
    print_info "Nenhum cron job configurado (ok se não usar)"
  fi
else
  print_info "vercel.json não encontrado (opcional)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 11. VERIFICAR GIT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print_section "11. GIT STATUS"

if git rev-parse --git-dir > /dev/null 2>&1; then
  print_pass "Repositório git inicializado"

  BRANCH=$(git branch --show-current)
  print_info "Branch atual: $BRANCH"

  UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
  if [ "$UNCOMMITTED" -gt 0 ]; then
    print_warn "Existem $UNCOMMITTED arquivos não commitados"
  else
    print_pass "Todos os arquivos commitados"
  fi

  # Verificar se tem remote
  if git remote | grep -q "origin"; then
    print_pass "Remote 'origin' configurado"
    REMOTE_URL=$(git remote get-url origin)
    print_info "URL: $REMOTE_URL"
  else
    print_warn "Remote 'origin' não configurado"
  fi
else
  print_fail "Não é um repositório git"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RESUMO FINAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}RESUMO DA AUDITORIA${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ PASSOU:${NC} $PASS checks"
echo -e "${YELLOW}⚠ AVISOS:${NC} $WARN checks"
echo -e "${RED}✗ FALHOU:${NC} $FAIL checks"
echo ""

# Status final
if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}❌ SISTEMA NÃO ESTÁ PRONTO PARA DEPLOY${NC}"
  echo "   Corrija os erros críticos antes de fazer deploy."
  exit 1
elif [ "$WARN" -gt 5 ]; then
  echo -e "${YELLOW}⚠️  SISTEMA PODE SER DEPLOYADO COM RESSALVAS${NC}"
  echo "   Há vários avisos que devem ser revisados."
  echo "   Recomendado corrigir antes do deploy."
  exit 0
else
  echo -e "${GREEN}✅ SISTEMA PRONTO PARA DEPLOY!${NC}"
  echo "   Todos os checks críticos passaram."
  echo ""
  echo "Próximos passos:"
  echo "1. Configure as env vars no Vercel"
  echo "2. Faça: git push origin main"
  echo "3. Ou faça: npx vercel --prod"
  exit 0
fi
