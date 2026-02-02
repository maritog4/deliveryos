# 🚀 Deploy Rápido a Railway - DeliveryOS

## ✅ YA TIENES LISTO:
- ✅ Repositorio Git creado (commit inicial hecho)
- ✅ railway.json configurado
- ✅ health.php endpoint
- ✅ config.example.php con variables de entorno

---

## 📋 PASOS PARA DEPLOY (15 minutos)

### 1️⃣ Sube el código a GitHub

```bash
# En tu terminal:
cd /Applications/AMPPS/www/deliverySv

# Crear repo en GitHub primero (https://github.com/new)
# Nombre sugerido: deliveryos

# Luego ejecuta:
git remote add origin https://github.com/TU-USUARIO/deliveryos.git
git branch -M main
git push -u origin main
```

**IMPORTANTE:** Antes de hacer push, asegúrate de que `.gitignore` está bien configurado para NO subir:
- `backend/config/config.php` (con tus credenciales locales)
- `backend/uploads/products/*.jpg` (imágenes grandes)
- `node_modules/`
- `.env` files

---

### 2️⃣ Crear cuenta en Railway

1. Ve a https://railway.app
2. Clic en **"Start a New Project"**
3. Conecta con GitHub
4. Autoriza Railway para acceder a tus repos

---

### 3️⃣ Crear proyecto en Railway

1. **"New Project"** → **"Deploy from GitHub repo"**
2. Selecciona: `TU-USUARIO/deliveryos`
3. Railway detectará `railway.json` automáticamente
4. Clic en **"Deploy Now"**

---

### 4️⃣ Agregar Base de Datos MySQL

1. En tu proyecto de Railway, clic en **"New"**
2. Selecciona **"Database"** → **"MySQL"**
3. Railway creará la BD automáticamente
4. Toma nota de las credenciales:
   - MYSQLHOST
   - MYSQLPORT  
   - MYSQLDATABASE
   - MYSQLUSER
   - MYSQLPASSWORD

---

### 5️⃣ Configurar Variables de Entorno

1. En Railway, selecciona tu servicio (deliveryos)
2. Ve a **"Variables"**
3. Agrega estas variables:

```bash
# Database (se llenan automáticamente si conectaste MySQL)
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLPORT=6379
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=xxxxxxxxxxxxx

# JWT Secret (genera una clave fuerte)
JWT_SECRET_KEY=tu_clave_super_secreta_cambiar_esto_12345

# URLs (Railway te dará el dominio)
API_BASE_URL=https://tu-app.railway.app/backend/api
FRONTEND_URL=https://tu-app.railway.app

# CORS
CORS_ORIGIN=https://tu-app.railway.app

# Railway
RAILWAY_ENVIRONMENT=production
```

**Generar JWT_SECRET_KEY seguro:**
```bash
openssl rand -base64 32
# O simplemente: unaClaveM0yS3gur4yL4rg4D3V3rd4d!#$%
```

---

### 6️⃣ Importar Base de Datos

**Opción A: Desde Railway CLI**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Conectar a MySQL
railway connect mysql

# Dentro de MySQL, importa:
source /path/to/deliverySv/database/schema.sql
source /path/to/deliverySv/database/seeds.sql
```

**Opción B: Desde Railway Dashboard**

1. Ve a tu base de datos MySQL
2. Clic en **"Connect"**
3. Usa las credenciales para conectarte con TablePlus/Sequel Pro/PHPMyAdmin
4. Importa `database/schema.sql`
5. Importa `database/seeds.sql`

---

### 7️⃣ Build del Frontend

Railway ejecutará automáticamente:
```bash
cd frontend && npm install && npm run build
```

Si falla, verifica en los logs.

---

### 8️⃣ Verificar Deploy

1. Railway te dará una URL: `https://tu-app.railway.app`
2. Verifica el health check: `https://tu-app.railway.app/backend/api/health.php`
3. Deberías ver:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-01 12:00:00",
  "service": "DeliveryOS API",
  "version": "1.0.0",
  "database": "connected",
  "uploads": "writable",
  "php_version": "8.x.x"
}
```

---

### 9️⃣ Configurar Dominio (Opcional)

1. En Railway, ve a **"Settings"** → **"Domains"**
2. **Opción A:** Usar dominio de Railway (gratis)
   - `tu-app.railway.app`
   
3. **Opción B:** Dominio personalizado
   - Agrega tu dominio (ej: `delivery.tudominio.com`)
   - Configura DNS:
     - CNAME: `delivery` → `tu-app.railway.app`
   - Railway configura SSL automáticamente

---

### 🔟 Probar el Sistema

1. **Frontend:** `https://tu-app.railway.app`
2. **Admin:** `https://tu-app.railway.app/admin-login`
3. **API:** `https://tu-app.railway.app/backend/api/products/read.php`

**Credenciales Admin (las que sembraste):**
```
Email: admin@deliverysv.com
Password: admin123
```

---

## 🐛 TROUBLESHOOTING

### Error: "Database connection failed"

1. Verifica las variables de entorno en Railway
2. Asegúrate que MYSQLHOST incluye el puerto
3. Revisa que importaste schema.sql y seeds.sql

### Error: "404 Not Found"

1. Verifica que el build del frontend fue exitoso
2. Revisa logs: Railway → Tu servicio → Logs
3. Asegura que `railway.json` está en la raíz

### Error: "CORS policy"

1. Verifica `CORS_ORIGIN` en variables de entorno
2. Debe ser: `https://tu-app.railway.app` (sin slash final)
3. Redeploy después de cambiar

### Frontend no carga

1. Verifica que `npm run build` se ejecutó
2. Revisa que `frontend/dist/` tiene archivos
3. Check logs de build en Railway

---

## 💰 COSTOS DE RAILWAY

**Plan Hobby (Gratis):**
- $5 USD de crédito gratis/mes
- Suficiente para pruebas
- Se apaga después de inactividad

**Plan Developer ($5/mes):**
- $5 base + uso
- ~$2-7 adicionales (depende tráfico)
- **Total: $7-12/mes**
- Sin sleep, siempre activo

**Para Demo:**
- Plan Hobby es suficiente
- Upgrade solo si tienes tráfico real

---

## 🎯 PRÓXIMOS PASOS

Después del deploy:

1. ✅ Agrega URL de demo en Gumroad
2. ✅ Actualiza README_GITHUB.md con el link
3. ✅ Comparte en redes sociales
4. ✅ Úsalo en tu pitch de ventas

---

## 📝 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
railway logs

# Abrir en navegador
railway open

# Ver variables
railway variables

# Redeploy
railway up

# Conectar a BD
railway connect mysql
```

---

## ✅ CHECKLIST FINAL

Antes de compartir el demo:

- [ ] Health check responde OK
- [ ] Frontend carga correctamente
- [ ] Login funciona (admin + cliente)
- [ ] Productos se muestran
- [ ] Carrito funciona
- [ ] Checkout funciona
- [ ] Panel admin accesible
- [ ] Panel driver accesible
- [ ] Imágenes de productos cargan
- [ ] No hay errores en consola

---

## 🚀 ¿LISTO PARA DEPLOY?

Ejecuta estos comandos ahora:

```bash
cd /Applications/AMPPS/www/deliverySv

# 1. Verifica que todo está commiteado
git status

# 2. Crea el repo en GitHub: https://github.com/new
#    Nombre: deliveryos

# 3. Conecta y sube
git remote add origin https://github.com/TU-USUARIO/deliveryos.git
git push -u origin main

# 4. Ve a railway.app y sigue los pasos arriba
```

**Tiempo estimado:** 15-20 minutos

**¿Algún problema?** Revisa el troubleshooting o pregúntame.

---

¡Éxito con el deploy! 🎉
