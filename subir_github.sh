#!/bin/bash

echo "=========================================="
echo "SUBIR PROYECTO A GITHUB"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No estás en el directorio vercel-dashboard"
    exit 1
fi

# Verificar que Git está configurado
if ! git config user.name &> /dev/null; then
    echo "⚠️  Git no está configurado"
    read -p "¿Quieres configurarlo ahora? (s/n): " config_git
    if [ "$config_git" = "s" ]; then
        read -p "Nombre de usuario: " git_name
        read -p "Email: " git_email
        git config --global user.name "$git_name"
        git config --global user.email "$git_email"
        echo "✅ Git configurado"
    else
        echo "❌ Necesitas configurar Git primero"
        exit 1
    fi
fi

# Verificar si GitHub CLI está instalado
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI encontrado"
    
    # Verificar autenticación
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI autenticado"
        
        # Verificar si ya existe el repositorio remoto
        if git remote get-url origin &> /dev/null; then
            echo "✅ Repositorio remoto ya configurado"
            echo ""
            echo "Subiendo cambios..."
            git push -u origin main
        else
            echo ""
            echo "Creando repositorio en GitHub..."
            gh repo create freqtrade-dashboard --public --source=. --remote=origin --push
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Repositorio creado y código subido"
                echo ""
                REPO_URL=$(git remote get-url origin)
                echo "🌐 URL del repositorio:"
                echo "   $REPO_URL"
            else
                echo "❌ Error al crear el repositorio"
                exit 1
            fi
        fi
    else
        echo "⚠️  GitHub CLI no está autenticado"
        echo ""
        echo "Iniciando autenticación..."
        gh auth login
        
        if [ $? -eq 0 ]; then
            echo "✅ Autenticado correctamente"
            echo ""
            echo "Creando repositorio en GitHub..."
            gh repo create freqtrade-dashboard --public --source=. --remote=origin --push
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Repositorio creado y código subido"
                REPO_URL=$(git remote get-url origin)
                echo "🌐 URL del repositorio:"
                echo "   $REPO_URL"
            else
                echo "❌ Error al crear el repositorio"
                exit 1
            fi
        else
            echo "❌ Error en la autenticación"
            exit 1
        fi
    fi
else
    echo "⚠️  GitHub CLI no está instalado"
    echo ""
    echo "Instalando GitHub CLI..."
    
    # Intentar instalar con Homebrew (macOS)
    if command -v brew &> /dev/null; then
        brew install gh
    else
        echo "❌ Homebrew no encontrado"
        echo ""
        echo "Instala GitHub CLI manualmente:"
        echo "  brew install gh"
        echo ""
        echo "O desde: https://cli.github.com/"
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ GitHub CLI instalado"
        echo ""
        echo "Iniciando autenticación..."
        gh auth login
        
        if [ $? -eq 0 ]; then
            echo "✅ Autenticado correctamente"
            echo ""
            echo "Creando repositorio en GitHub..."
            gh repo create freqtrade-dashboard --public --source=. --remote=origin --push
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ Repositorio creado y código subido"
                REPO_URL=$(git remote get-url origin)
                echo "🌐 URL del repositorio:"
                echo "   $REPO_URL"
            else
                echo "❌ Error al crear el repositorio"
                exit 1
            fi
        else
            echo "❌ Error en la autenticación"
            exit 1
        fi
    else
        echo "❌ Error instalando GitHub CLI"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "✅ PROCESO COMPLETADO"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Ve a vercel.com"
echo "2. Importa el repositorio: freqtrade-dashboard"
echo "3. Configura las variables de entorno"
echo "4. ¡Despliega!"
echo ""

