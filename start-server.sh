#!/bin/bash

echo "🚀 Iniciando servidor de desarrollo..."
echo ""

# Ir al directorio frontend
cd /Applications/AMPPS/www/deliverySv/frontend

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json"
    echo "Directorio actual: $(pwd)"
    exit 1
fi

echo "✅ Directorio correcto: $(pwd)"
echo "📦 Iniciando npm run dev..."
echo ""

# Iniciar el servidor
npm run dev
