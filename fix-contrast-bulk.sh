#!/bin/bash
# Script para corrigir problemas de contraste em massa
# Modo YOLO - Correção automática

FILES=(
  "app/dashboard/comparisons/page.tsx"
  "app/dashboard/bau/page.tsx"
  "app/dashboard/reels/page.tsx"
  "app/dashboard/audits/[id]/compare/page.tsx"
  "app/dashboard/audits/[id]/slides/page.tsx"
  "app/dashboard/profiles/[id]/slides/page.tsx"
  "app/dashboard/profiles/[id]/reels/page.tsx"
)

echo "🎨 Aplicando correções de contraste em massa..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Corrigindo: $file"

    # Substituições de texto
    sed -i '' 's/text-neutral-600\([^-]\)/text-muted-foreground\1/g' "$file"
    sed -i '' 's/text-neutral-500\([^-]\)/text-muted-foreground\1/g' "$file"
    sed -i '' 's/text-neutral-700\([^-]\)/text-foreground\1/g' "$file"

    # Substituições de background (só quando não tem dark mode)
    sed -i '' 's/\(className="[^"]*\)bg-neutral-50\([^-][^"]*"\)/\1bg-card\2/g' "$file"

    # Borders - mais cuidadoso
    sed -i '' 's/border border-neutral-200\([^-]\)/border-2 border-neutral-300 dark:border-neutral-600\1/g' "$file"

    echo "  ✅ $file corrigido"
  else
    echo "  ⚠️  Arquivo não encontrado: $file"
  fi
done

echo ""
echo "✨ Correções em massa concluídas!"
echo "📊 Total de arquivos processados: ${#FILES[@]}"
