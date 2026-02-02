# Railway.app Deployment Guide

## 🚂 Pasos para Desplegar en Railway.app

### 1. **Crear Cuenta en Railway**
- Ve a https://railway.app
- Regístrate con GitHub
- Conecta tu repositorio

### 2. **Crear Nuevo Proyecto**
- Click en "New Project"
- Selecciona "Deploy from GitHub repo"
- Autoriza Railway a acceder a tu repositorio

### 3. **Agregar MySQL**
- En tu proyecto, click en "+ New"
- Selecciona "Database" → "Add MySQL"
- Railway creará automáticamente la base de datos

### 4. **Configurar Variables de Entorno**

Click en tu servicio → Variables → Add Variables:

```env
# Database (Railway proporciona estas automáticamente)
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6060
MYSQL_DATABASE=railway
MYSQL_USER=root
MYSQL_PASSWORD=xxxxxxxxxxxxx

# Application
APP_NAME=DeliveryOS
APP_ENV=production
APP_URL=https://tu-app.up.railway.app

# JWT
JWT_SECRET_KEY=tu_clave_secreta_super_segura_aqui_cambiala

# Stripe (Opcional)
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica

# SendGrid (Opcional)
SENDGRID_API_KEY=SG.tu_api_key
SENDGRID_FROM_EMAIL=noreply@tudominio.com
```

### 5. **Importar Base de Datos**

**Opción A: Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar a tu proyecto
railway link

# Importar SQL
railway run mysql -u root -p railway < database/schema.sql
```

**Opción B: MySQL Client**
```bash
# Usar las credenciales de Railway
mysql -h containers-us-west-xxx.railway.app \
  -P 6060 \
  -u root \
  -p railway < database/schema.sql
```

### 6. **Configurar Dominio Personalizado** (Opcional)

- Ve a Settings → Domains
- Click en "Generate Domain" para obtener: `tu-app.up.railway.app`
- O agrega tu dominio custom: `app.tudominio.com`
  - Configura CNAME en tu DNS: `tu-app.up.railway.app`

### 7. **Deploy Automático**

Railway detectará automáticamente y desplegará:
- ✅ Backend PHP (detecta `composer.json` o archivos `.php`)
- ✅ Frontend (detecta `package.json` y ejecuta `npm run build`)

Si necesitas configuración custom, crea `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "php -S 0.0.0.0:$PORT -t public"
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
```

### 8. **Verificar Deployment**

Espera a que el deploy termine (2-5 minutos):
- ✅ Build logs muestran "Success"
- ✅ Deployment logs muestran "Running"
- ✅ Health checks pasan

Accede a tu URL:
- Frontend: `https://tu-app.up.railway.app/`
- API: `https://tu-app.up.railway.app/backend/api/`

### 9. **Configurar CORS**

Edita `backend/config/config.php` y actualiza:
```php
header("Access-Control-Allow-Origin: https://tu-app.up.railway.app");
```

### 10. **Actualizar Frontend URLs**

Edita el build del frontend para apuntar a la URL de Railway:
```javascript
// En frontend/src/config.js o .env
VITE_API_URL=https://tu-app.up.railway.app/backend/api
```

Rebuil y redeploy:
```bash
cd frontend
npm run build
# Push a GitHub, Railway auto-desplegará
```

---

## 🔧 Troubleshooting

### **Error: "Connection refused"**
✅ Verifica que MySQL esté corriendo en Railway  
✅ Revisa las variables de entorno  
✅ Usa el host interno: `${{MYSQL_PRIVATE_URL}}`

### **Error: "CORS policy"**
✅ Actualiza `Access-Control-Allow-Origin` en backend  
✅ Asegúrate de usar HTTPS

### **Error: "Build failed"**
✅ Verifica que `package.json` tenga `build` script  
✅ Revisa los logs de build en Railway

---

## 💰 Costos Estimados

Railway ofrece:
- **$5 de crédito gratis** al mes
- **$5/mes** por 1GB RAM, 1GB storage
- **$0.000231/GB de bandwidth** (entrada gratis)

Para este proyecto:
- **Backend PHP:** ~$5/mes
- **MySQL:** $2/mes
- **Total:** ~$7/mes

---

## 🎯 Siguiente Nivel

### **Producción Completa:**
1. Dominio personalizado
2. SSL Certificate (automático con Railway)
3. Backups automáticos de MySQL
4. Monitoring con Railway Metrics
5. CI/CD con GitHub Actions

### **Escalabilidad:**
- Escala vertical: Más RAM/CPU
- Escala horizontal: Load balancer
- CDN para assets estáticos (Cloudflare)

---

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Templates](https://railway.app/templates)

---

**¡Listo para producción!** 🚀
