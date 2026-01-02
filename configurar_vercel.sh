#!/bin/bash

echo "=========================================="
echo "CONFIGURACIÓN Y DESPLIEGUE EN VERCEL"
echo "=========================================="
echo ""

cd /Users/salvadorcarrillo/Desktop/Freqtrade/vercel-dashboard

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI no está instalado"
    echo "Instalando..."
    sudo npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando Vercel CLI"
        exit 1
    fi
fi

echo "✅ Vercel CLI disponible"
echo ""

# Verificar autenticación
if ! vercel whoami &> /dev/null; then
    echo "🔐 Iniciando sesión en Vercel..."
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

# Desplegar (primera vez)
vercel --yes

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar"
    exit 1
fi

echo ""
echo "📋 Configurando variables de entorno..."
echo ""

# Configurar variables de entorno
echo "5.223.53.43" | vercel env add VPS_IP production
echo "5.223.53.43" | vercel env add VPS_IP preview
echo "5.223.53.43" | vercel env add VPS_IP development

echo "freqtrader" | vercel env add FREQTRADE_USERNAME production
echo "freqtrader" | vercel env add FREQTRADE_USERNAME preview
echo "freqtrader" | vercel env add FREQTRADE_USERNAME development

echo "Salvador2025!" | vercel env add FREQTRADE_PASSWORD production
echo "Salvador2025!" | vercel env add FREQTRADE_PASSWORD preview
echo "Salvador2025!" | vercel env add FREQTRADE_PASSWORD development

echo ""
echo "✅ Variables de entorno configuradas"
echo ""

echo "🚀 Desplegando a producción..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ DESPLIEGUE COMPLETADO"
    echo "=========================================="
    echo ""
    echo "Obtén la URL del proyecto con:"
    echo "  vercel ls"
    echo ""
    echo "O ve a: https://vercel.com/dashboard"
else
    echo "❌ Error al desplegar a producción"
    exit 1
fi

