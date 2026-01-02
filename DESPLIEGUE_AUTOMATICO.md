# Instrucciones para Despliegue Automático

## ✅ Verificación de Seguridad

He verificado que **NO hay credenciales hardcodeadas** en el código:
- ✅ Todas las credenciales usan variables de entorno
- ✅ `.gitignore` configurado correctamente
- ✅ No hay secretos en el código fuente

## 🚀 Pasos para Desplegar

### 1. Instalar Vercel CLI (si no está instalado)

```bash
npm install -g vercel
```

### 2. Navegar al directorio

```bash
cd /Users/salvadorcarrillo/Desktop/Freqtrade/vercel-dashboard
```

### 3. Iniciar sesión en Vercel

```bash
vercel login
```

Esto abrirá el navegador para autenticarte.

### 4. Desplegar el proyecto

```bash
vercel
```

Responde a las preguntas:
- **Set up and deploy?** → Y
- **Which scope?** → Tu cuenta
- **Link to existing project?** → N (primera vez)
- **Project name?** → freqtrade-dashboard
- **Directory?** → . (directorio actual)

### 5. Configurar Variables de Entorno

```bash
# IP del VPS
vercel env add VPS_IP production
# Cuando te pida el valor, ingresa: 5.223.53.43

# Usuario de Freqtrade
vercel env add FREQTRADE_USERNAME production
# Cuando te pida el valor, ingresa: freqtrader

# Contraseña de Freqtrade
vercel env add FREQTRADE_PASSWORD production
# Cuando te pida el valor, ingresa: Salvador2025!
```

**También añádelas para Preview y Development:**

```bash
vercel env add VPS_IP preview
vercel env add VPS_IP development

vercel env add FREQTRADE_USERNAME preview
vercel env add FREQTRADE_USERNAME development

vercel env add FREQTRADE_PASSWORD preview
vercel env add FREQTRADE_PASSWORD development
```

### 6. Desplegar a Producción

```bash
vercel --prod
```

### 7. Obtener la URL

Vercel te dará una URL como:
```
https://freqtrade-dashboard.vercel.app
```

## 🔒 Seguridad

- ✅ Las credenciales están en variables de entorno (no en el código)
- ✅ `.gitignore` previene que se suban archivos sensibles
- ✅ Las variables de entorno en Vercel son seguras

## 📝 Alternativa: Desde el Dashboard de Vercel

Si prefieres usar la interfaz web:

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Add New Project"
3. Conecta tu repositorio de GitHub (si lo has subido)
4. O arrastra la carpeta `vercel-dashboard`
5. Configura las variables de entorno en Settings > Environment Variables
6. Haz clic en "Deploy"

---

*Última actualización: 2 de Enero 2026*

