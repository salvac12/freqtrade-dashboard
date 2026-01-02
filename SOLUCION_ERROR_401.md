# Solución para Error 401 de Autenticación

## ✅ Problema Resuelto: Error 404

El error 404 ya está resuelto. La API ahora responde correctamente.

## ⚠️ Nuevo Problema: Error 401

El error 401 indica que Vercel no puede autenticarse con el VPS. Esto puede deberse a:

### Posibles Causas

1. **Firewall del VPS bloqueando conexiones desde Vercel**
   - Los servidores de Vercel intentan conectarse desde diferentes IPs
   - El firewall puede estar bloqueando estas conexiones

2. **Puertos no accesibles desde internet**
   - Los puertos 8080-8083 deben estar abiertos en el firewall
   - Deben ser accesibles desde cualquier IP (no solo localhost)

3. **Problema de red**
   - El VPS puede no ser accesible desde los servidores de Vercel

## 🔧 Soluciones

### 1. Verificar y Abrir Puertos en el Firewall

```bash
# Conectarse al VPS
ssh root@5.223.53.43

# Verificar estado del firewall
ufw status

# Si los puertos no están abiertos, abrirlos:
ufw allow 8080:8083/tcp

# Verificar que están abiertos
ufw status | grep 808
```

### 2. Verificar Accesibilidad del VPS

```bash
# Desde tu máquina local, prueba:
curl http://5.223.53.43:8080/api/v1/ping

# Si funciona localmente pero no desde Vercel, el problema es el firewall
```

### 3. Configurar Firewall para Permitir Conexiones desde Cualquier IP

```bash
# En el VPS
ufw allow from any to any port 8080:8083 proto tcp
```

### 4. Verificar que FreqUI Está Escuchando en 0.0.0.0

Asegúrate de que en los `config.json` de cada bot, el API server esté configurado para escuchar en todas las interfaces:

```json
"api_server": {
    "enabled": true,
    "listen_ip_address": "0.0.0.0",
    "listen_port": 8080
}
```

### 5. Verificar Logs de Vercel

```bash
# Ver logs del último despliegue
npx vercel logs vercel-dashboard-ecru.vercel.app
```

## 📝 Verificación Final

Una vez que hayas abierto los puertos:

1. **Prueba desde tu máquina:**
   ```bash
   curl http://5.223.53.43:8080/api/v1/ping
   ```

2. **Prueba la API de Vercel:**
   ```bash
   curl https://vercel-dashboard-ecru.vercel.app/api/all-bots
   ```

3. **Si sigue fallando, verifica los logs:**
   - Ve a https://vercel.com/dashboard
   - Selecciona el proyecto
   - Ve a "Functions" > "Logs"

## 🔒 Seguridad

⚠️ **IMPORTANTE:** Al abrir los puertos al público, asegúrate de:

1. ✅ Usar contraseñas fuertes
2. ✅ Considerar usar un proxy reverso con autenticación
3. ✅ Limitar el acceso por IP si es posible (aunque esto puede complicar el uso con Vercel)

---

*Última actualización: 2 de Enero 2026*

