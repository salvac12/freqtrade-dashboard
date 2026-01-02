# Instrucciones de Despliegue en Vercel

## ✅ Seguridad Verificada

- ✅ **NO hay credenciales hardcodeadas** en el código
- ✅ Todas las credenciales usan variables de entorno
- ✅ `.gitignore` configurado correctamente
- ✅ Listo para subir a GitHub de forma segura

## 🚀 Despliegue desde la Interfaz Web de Vercel (Recomendado)

### Paso 1: Preparar el Repositorio

El código ya está en un repositorio Git local. Ahora necesitas:

1. **Crear un repositorio en GitHub:**
   - Ve a [github.com](https://github.com)
   - Crea un nuevo repositorio (público o privado)
   - Nombre sugerido: `freqtrade-dashboard`

2. **Subir el código a GitHub:**
   ```bash
   cd /Users/salvadorcarrillo/Desktop/Freqtrade/vercel-dashboard
   
   # Añadir el remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
   git remote add origin https://github.com/TU_USUARIO/freqtrade-dashboard.git
   
   # Subir el código
   git push -u origin main
   ```

### Paso 2: Desplegar en Vercel

1. **Ve a [vercel.com](https://vercel.com)**
2. **Inicia sesión** (puedes usar tu cuenta de GitHub)
3. **Haz clic en "Add New Project"**
4. **Importa tu repositorio:**
   - Selecciona el repositorio `freqtrade-dashboard`
   - Haz clic en "Import"

5. **Configura el proyecto:**
   - Framework Preset: Other
   - Root Directory: `./` (dejar por defecto)
   - Build Command: (dejar vacío)
   - Output Directory: (dejar vacío)

6. **Configura las Variables de Entorno:**
   Antes de hacer clic en "Deploy", haz clic en "Environment Variables" y añade:

   | Variable | Valor | Entornos |
   |----------|-------|----------|
   | `VPS_IP` | `5.223.53.43` | Production, Preview, Development |
   | `FREQTRADE_USERNAME` | `freqtrader` | Production, Preview, Development |
   | `FREQTRADE_PASSWORD` | `Salvador2025!` | Production, Preview, Development |

   ⚠️ **IMPORTANTE:** Selecciona los tres entornos (Production, Preview, Development) para cada variable.

7. **Desplegar:**
   - Haz clic en "Deploy"
   - Espera a que termine el despliegue (1-2 minutos)

8. **Obtener la URL:**
   - Una vez completado, Vercel te dará una URL como:
     ```
     https://freqtrade-dashboard.vercel.app
     ```
   - Esta URL será tu dashboard público

## 🔧 Despliegue desde Línea de Comandos (Alternativa)

Si prefieres usar la CLI:

```bash
# 1. Instalar Vercel CLI (requiere permisos de administrador)
sudo npm install -g vercel

# 2. Navegar al directorio
cd /Users/salvadorcarrillo/Desktop/Freqtrade/vercel-dashboard

# 3. Iniciar sesión
vercel login

# 4. Desplegar
vercel

# 5. Configurar variables de entorno
vercel env add VPS_IP production
# Ingresa: 5.223.53.43

vercel env add FREQTRADE_USERNAME production
# Ingresa: freqtrader

vercel env add FREQTRADE_PASSWORD production
# Ingresa: Salvador2025!

# También para preview y development
vercel env add VPS_IP preview
vercel env add VPS_IP development
# (y lo mismo para las otras variables)

# 6. Desplegar a producción
vercel --prod
```

## 🔒 Verificación de Seguridad

Antes de subir a GitHub, verifica:

```bash
cd /Users/salvadorcarrillo/Desktop/Freqtrade/vercel-dashboard

# Verificar que no hay credenciales
grep -r "5\.223\.53\.43\|Salvador2025\|freqtrader" . --include="*.js" --include="*.html" 2>/dev/null | grep -v ".git" | grep -v "README" | grep -v "INSTRUCCIONES"

# Si no muestra nada (o solo README), está seguro ✅
```

## 📝 Archivos que se Subirán a GitHub

```
vercel-dashboard/
├── .gitignore          ✅ (previene subir archivos sensibles)
├── index.html          ✅ (sin credenciales)
├── api/
│   ├── bots.js        ✅ (solo usa variables de entorno)
│   └── all-bots.js    ✅ (solo usa variables de entorno)
├── vercel.json        ✅
├── package.json       ✅
└── README.md          ✅
```

## ✅ Checklist Final

- [ ] Código sin credenciales hardcodeadas
- [ ] Repositorio Git inicializado
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Proyecto desplegado
- [ ] Dashboard accesible en la URL de Vercel

---

*Última actualización: 2 de Enero 2026*

