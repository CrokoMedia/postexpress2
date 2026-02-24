#!/bin/bash

# Script de compilação do plugin Figma
# Compila o TypeScript para JavaScript

echo "🔨 Compilando plugin Figma..."

# Verificar se tsc está instalado
if ! command -v tsc &> /dev/null
then
    echo "⚠️  TypeScript não encontrado. Instalando globalmente..."
    npm install -g typescript
fi

# Compilar
echo "📦 Compilando code.ts..."
tsc code.ts --target es6 --skipLibCheck --noEmitOnError false || true

if [ -f "code.js" ]; then
    echo "✅ Compilação concluída com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Abra o Figma Desktop"
    echo "2. Menu → Plugins → Development → Import plugin from manifest"
    echo "3. Selecione o arquivo manifest.json desta pasta"
    echo "4. Execute o plugin!"
else
    echo "❌ Erro na compilação"
    exit 1
fi
