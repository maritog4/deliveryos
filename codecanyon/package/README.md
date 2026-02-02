# 🍕 DeliveryOS - Food Delivery Management System

## 📋 Información General

**Versión:** 1.0.0  
**Fecha de Lanzamiento:** Enero 2026  
**Autor:** Tu Nombre  
**Categoría:** PHP Scripts > Miscellaneous  
**Licencia:** Regular License / Extended License

---

## 🎯 Características Principales

### 👥 **Multi-Usuario (3 Roles)**
- **Clientes:** Registro, pedidos, seguimiento en tiempo real
- **Administradores:** Panel completo de gestión
- **Repartidores:** App para delivery con actualización automática

### 🛒 **Sistema de Pedidos**
- ✅ Carrito de compras interactivo
- ✅ Checkout con múltiples métodos de pago (Efectivo/Tarjeta)
- ✅ Confirmación por email
- ✅ Seguimiento en tiempo real
- ✅ Sistema de cupones de descuento

### 📍 **Zonas de Entrega**
- ✅ Gestión de zonas con precios personalizados
- ✅ Cálculo automático de costos de delivery
- ✅ Direcciones guardadas para clientes

### 🔔 **Notificaciones en Tiempo Real**
- ✅ WebSocket para actualizaciones instantáneas
- ✅ Notificaciones del navegador
- ✅ Sonido de alerta para nuevas órdenes

### 📊 **Panel Administrativo**
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos (CRUD completo)
- ✅ Gestión de categorías
- ✅ Gestión de órdenes con filtros
- ✅ Gestión de repartidores
- ✅ Sistema de cupones
- ✅ Zonas de entrega

### 🚗 **Panel de Repartidor**
- ✅ Vista de órdenes asignadas
- ✅ Actualización automática cada 10 segundos
- ✅ Actualización de ubicación GPS
- ✅ Cambio de estado de órdenes

### 🎨 **Diseño Moderno**
- ✅ Interfaz responsive (móvil, tablet, desktop)
- ✅ TailwindCSS 3
- ✅ Animaciones suaves
- ✅ Loading states profesionales
- ✅ Empty states atractivos
- ✅ Toast notifications con iconos

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- React 18
- Vite 7.3.1
- TailwindCSS 3
- React Router DOM 6
- Axios
- Hero Icons

### **Backend**
- PHP 7.4+ / 8.x
- MySQL 5.7+ / 8.0+
- JWT Authentication
- RESTful API

### **Notificaciones**
- WebSocket (Socket.io)
- Node.js 18+

---

## 📦 Requisitos del Servidor

### **Mínimos:**
- PHP 7.4 o superior
- MySQL 5.7 o superior
- Apache 2.4+ / Nginx 1.18+
- Node.js 18+ (para WebSocket)
- 512 MB RAM
- 500 MB espacio en disco

### **Recomendados:**
- PHP 8.1+
- MySQL 8.0+
- 1 GB RAM
- SSL Certificate (HTTPS)

### **Extensiones PHP Requeridas:**
- mysqli
- pdo_mysql
- json
- mbstring
- openssl
- curl
- gd (para procesamiento de imágenes)

---

## 🚀 Instalación

### **Opción 1: Instalación Automática**

1. **Subir archivos al servidor**
   ```bash
   - Extrae el ZIP
   - Sube la carpeta `deliverySv` a tu servidor
   - Asegúrate que apunte a: /public_html/deliverySv/
   ```

2. **Crear base de datos**
   - Accede a phpMyAdmin
   - Crea una base de datos: `deliverysv`
   - Importa: `database/schema.sql`

3. **Configurar conexión**
   - Edita: `backend/config/database.php`
   ```php
   private $host = "localhost";
   private $db_name = "deliverysv";
   private $username = "tu_usuario";
   private $password = "tu_contraseña";
   ```

4. **Configurar frontend**
   - Edita: `frontend/.env`
   ```env
   VITE_API_URL=https://tudominio.com/deliverySv/backend/api
   ```

5. **Permisos de carpetas**
   ```bash
   chmod -R 755 backend/uploads/
   chmod -R 755 backend/logs/
   ```

6. **Acceder al sistema**
   - Frontend: `https://tudominio.com/deliverySv/frontend/dist/`
   - Admin: `https://tudominio.com/deliverySv/frontend/dist/#/admin-login`

### **Opción 2: Instalación Local (Desarrollo)**

1. **Requisitos:**
   - XAMPP / AMPPS / MAMP
   - Node.js 18+
   - npm o yarn

2. **Configurar backend:**
   ```bash
   cd backend
   # Importar database/schema.sql en MySQL
   # Editar backend/config/database.php
   ```

3. **Configurar frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Editar .env con tus URLs locales
   npm run dev
   ```

4. **Iniciar WebSocket (Opcional):**
   ```bash
   cd websocket
   npm install
   node server.js
   ```

---

## 👤 Credenciales por Defecto

**⚠️ IMPORTANTE: Cambia estas credenciales después de instalar**

### **Administrador:**
- Email: (consultar en database/schema.sql)
- Password: (consultar en database/schema.sql)

### **Repartidor:**
- Email: (consultar en database/schema.sql)
- Password: (consultar en database/schema.sql)

### **Cliente de Prueba:**
- Regístrate desde el frontend

---

## 📁 Estructura de Archivos

```
deliverySv/
├── backend/                    # API Backend PHP
│   ├── api/                   # Endpoints REST
│   │   ├── auth/             # Autenticación
│   │   ├── products/         # Productos
│   │   ├── orders/           # Órdenes
│   │   ├── users/            # Usuarios
│   │   └── ...
│   ├── config/               # Configuraciones
│   ├── models/               # Modelos de datos
│   ├── middleware/           # Auth, CORS, Rate limiting
│   ├── utils/                # Helpers
│   └── uploads/              # Imágenes subidas
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── pages/            # Páginas
│   │   ├── components/       # Componentes reutilizables
│   │   ├── services/         # API calls
│   │   ├── context/          # Context API
│   │   └── config.js         # Configuración
│   ├── public/               # Assets estáticos
│   └── dist/                 # Build de producción
│
├── database/                  # SQL
│   ├── schema.sql            # Estructura completa
│   └── seeds.sql             # Datos de prueba
│
├── websocket/                 # WebSocket Server (opcional)
│   ├── server.js
│   └── package.json
│
└── docs/                      # Documentación adicional
```

---

## 🔧 Configuración Avanzada

### **1. Configurar Stripe (Pagos con tarjeta)**

Edita `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
```

Edita `backend/config/config.php`:
```php
define('STRIPE_SECRET_KEY', 'sk_test_tu_clave_secreta');
```

### **2. Configurar Email (SendGrid)**

Edita `backend/config/config.php`:
```php
define('SENDGRID_API_KEY', 'tu_api_key');
define('SENDGRID_FROM_EMAIL', 'noreply@tudominio.com');
```

### **3. Configurar WebSocket**

Edita `websocket/server.js`:
```javascript
const PORT = 3001;
const CORS_ORIGIN = 'https://tudominio.com';
```

Inicia el servidor:
```bash
cd websocket
npm install
node server.js
# Para producción, usa PM2:
pm2 start server.js --name delivery-websocket
```

### **4. Optimización para Producción**

**Frontend:**
```bash
cd frontend
npm run build
# Los archivos estarán en frontend/dist/
```

**Backend:**
- Habilita OPcache en PHP
- Configura HTTPS
- Ajusta `php.ini`:
  ```ini
  upload_max_filesize = 10M
  post_max_size = 10M
  max_execution_time = 60
  ```

---

## 🎨 Personalización

### **Cambiar Colores**

Edita `frontend/tailwind.config.js`:
```javascript
colors: {
  sky: colors.blue,  // Cambia por tu color
  // ...
}
```

### **Cambiar Logo**

Reemplaza:
- `frontend/public/logo.svg`
- `frontend/public/favicon.svg`

### **Cambiar Nombre**

Edita `frontend/index.html`:
```html
<title>Tu Nombre - Sistema de Delivery</title>
```

---

## 📱 URLs del Sistema

### **Clientes:**
- Menú: `/menu`
- Mis Órdenes: `/my-orders`
- Perfil: `/profile`

### **Administradores:**
- Login: `/admin-login`
- Dashboard: `/admin`
- Productos: `/admin/products`
- Órdenes: `/admin/orders`
- Repartidores: `/admin/drivers`
- Cupones: `/admin/coupons`
- Zonas: `/admin/zones`

### **Repartidores:**
- Login: `/admin-login`
- Dashboard: `/driver`

---

## 🐛 Solución de Problemas

### **Problema: "CORS Error"**
**Solución:** Verifica que `backend/config/config.php` tenga el dominio correcto en `Access-Control-Allow-Origin`

### **Problema: "API URL not found"**
**Solución:** Verifica `frontend/.env` y `frontend/src/config.js`

### **Problema: Imágenes no se muestran**
**Solución:** 
- Verifica permisos: `chmod -R 755 backend/uploads/`
- Verifica que las URLs en la BD apunten correctamente

### **Problema: WebSocket no conecta**
**Solución:**
- Verifica que Node.js esté corriendo: `pm2 status`
- Verifica firewall/puerto 3001

---

## 🔒 Seguridad

### **Recomendaciones:**

1. **Cambia JWT Secret Key:**
   ```php
   // backend/config/config.php
   define('JWT_SECRET_KEY', 'tu_clave_super_segura_aqui');
   ```

2. **Usa HTTPS en producción**

3. **Cambia credenciales por defecto**

4. **Habilita rate limiting** (ya incluido)

5. **Mantén PHP y MySQL actualizados**

6. **Backups regulares de la base de datos**

---

## 📞 Soporte

- **Documentación:** Incluida en `/docs`
- **Soporte:** A través de CodeCanyon (comentarios del item)
- **Actualizaciones:** Se notificarán en tu dashboard de CodeCanyon

---

## 📝 Changelog

### **v1.0.0 - Enero 2026**
- ✅ Lanzamiento inicial
- ✅ Sistema completo de pedidos
- ✅ Panel administrativo
- ✅ Panel de repartidor
- ✅ Notificaciones en tiempo real
- ✅ Responsive design
- ✅ Sistema de cupones
- ✅ Zonas de entrega

---

## 📄 Licencia

Este producto está licenciado bajo la [Licencia Regular de Envato](https://codecanyon.net/licenses/standard).

**Regular License:**
- ✅ Uso en un solo proyecto
- ✅ Para un solo cliente
- ❌ No reventa
- ❌ No redistribución

**Extended License:**
- ✅ Uso en múltiples proyectos
- ✅ Reventa como parte de un producto
- ✅ Redistribución permitida

---

## 🙏 Agradecimientos

Gracias por comprar DeliveryOS. Si te gusta el producto, por favor deja una calificación de 5 ⭐ en CodeCanyon.

---

**© 2026 DeliveryOS. Todos los derechos reservados.**
