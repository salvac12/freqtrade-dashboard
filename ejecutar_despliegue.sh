#!/bin/bash

echo "=========================================="
echo "DESPLIEGUE AUTOMÁTICO EN VERCEL"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No estás en el directorio vercel-dashboard"
    echo "   Ejecuta: cd vercel-dashboard"
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI no está instalado"
    echo ""
    echo "Instalando Vercel CLI..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando Vercel CLI"
        echo "   Instala manualmente: npm install -g vercel"
        exit 1
    fi
    echo "✅ Vercel CLI instalado"
fi

echo "✅ Vercel CLI disponible"
echo ""

# Verificar si ya está autenticado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Iniciando sesión en Vercel..."
    echo "   Se abrirá el navegador para autenticarte"
    vercel login
    if [ $? -ne 0 ]; then
        echo "❌ Error al iniciar sesión"
        exit 1
    fi
else
    echo "✅ Ya estás autenticado en Vercel"
    vercel whoami
fi

echo ""
echo "🚀 Desplegando proyecto..."
echo ""

# Desplegar
vercel --yes

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar"
    exit 1
fi

echo ""
echo "📋 Configurando variables de entorno..."
echo ""
echo "⚠️  IMPORTANTE: Necesitas configurar las variables de entorno manualmente"
echo ""
echo "Ejecuta estos comandos:"
echo ""
echo "  vercel env add VPS_IP production"
echo "    Valor: 5.223.53.43"
echo ""
echo "  vercel env add FREQTRADE_USERNAME production"
echo "    Valor: freqtrader"
echo ""
echo "  vercel env add FREQTRADE_PASSWORD production"
echo "    Valor: Salvador2025!"
echo ""
echo "También añádelas para preview y development:"
echo "  vercel env add VPS_IP preview"
echo "  vercel env add VPS_IP development"
echo "  (y lo mismo para las otras variables)"
echo ""
echo "Luego redespliega:"
echo "  vercel --prod"
echo ""

