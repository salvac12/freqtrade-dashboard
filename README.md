# Dashboard Freqtrade - Vercel

Dashboard web desplegado en Vercel para monitorear bots Freqtrade en tiempo real.

## 🚀 Despliegue en Vercel

### Opción 1: Desde la línea de comandos (recomendado)

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Navega al directorio:**
   ```bash
   cd vercel-dashboard
   ```

3. **Inicia sesión en Vercel:**
   ```bash
   vercel login
   ```

4. **Despliega:**
   ```bash
   vercel
   ```

5. **Configura las variables de entorno:**
   ```bash
   vercel env add VPS_IP
   vercel env add FREQTRADE_USERNAME
   vercel env add FREQTRADE_PASSWORD
   ```
   
   O desde el dashboard de Vercel:
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Añade:
     - `VPS_IP` = (tu IP del VPS)
     - `FREQTRADE_USERNAME` = (tu usuario)
     - `FREQTRADE_PASSWORD` = (tu contraseña)

6. **Redespliega para aplicar las variables:**
   ```bash
   vercel --prod
   ```

### Opción 2: Desde GitHub (recomendado para producción)

1. **Crea un repositorio en GitHub** con el contenido de `vercel-dashboard`

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

3. **Configura las variables de entorno:**
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Añade las variables necesarias (ver `.env.example`)

4. **Despliega:**
   - Vercel desplegará automáticamente en cada push a la rama principal

## 📋 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VPS_IP` | IP del VPS donde están los bots | (configurar en Vercel) |
| `FREQTRADE_USERNAME` | Usuario de FreqUI | (configurar en Vercel) |
| `FREQTRADE_PASSWORD` | Contraseña de FreqUI | (configurar en Vercel) |

## 🔒 Seguridad

⚠️ **IMPORTANTE:** Las variables de entorno en Vercel son seguras y no se exponen al cliente.

- Las credenciales solo se usan en las Serverless Functions (backend)
- El dashboard (frontend) no tiene acceso a las credenciales
- Las funciones actúan como proxy seguro entre el dashboard y el VPS

## 🌐 Acceso al Dashboard

Una vez desplegado, tendrás una URL como:
```
https://tu-proyecto.vercel.app
```

## 🔧 Estructura del Proyecto

```
vercel-dashboard/
├── index.html          # Dashboard principal
├── api/
│   ├── bots.js        # API para obtener datos de un bot
│   └── all-bots.js    # API para obtener datos de todos los bots
├── vercel.json        # Configuración de Vercel
├── package.json       # Dependencias
└── README.md          # Este archivo
```

## 🛠️ Desarrollo Local

Para probar localmente:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar servidor de desarrollo
vercel dev
```

Esto iniciará un servidor local en `http://localhost:3000` que simula el entorno de Vercel.

## 📝 Notas

- El dashboard se actualiza automáticamente cada 60 segundos
- Las Serverless Functions tienen un timeout de 10 segundos por defecto
- Si el VPS no está accesible, el dashboard mostrará un error
- Asegúrate de que los puertos 8080-8083 estén abiertos en el firewall del VPS

## 🔍 Troubleshooting

### Error: "Cannot connect to VPS"

1. Verifica que el VPS esté accesible desde internet
2. Verifica que los puertos 8080-8083 estén abiertos en el firewall
3. Verifica las variables de entorno en Vercel

### Error: "Authentication failed"

1. Verifica `FREQTRADE_USERNAME` y `FREQTRADE_PASSWORD` en Vercel
2. Verifica que las credenciales sean correctas

### El dashboard no carga datos

1. Verifica los logs de Vercel: Dashboard > Functions > Logs
2. Verifica que las funciones API estén desplegadas correctamente

---

*Última actualización: 2 de Enero 2026*

